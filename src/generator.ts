import type { GeneratorManifest, GeneratorOptions } from '@prisma/generator-helper';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { parseConfig } from './config';
import { generateEnumSchema } from './generators/enum';
import { generateModelSchema } from './generators/model';

export function onManifest(): GeneratorManifest {
  return {
    prettyName: 'Prisma to Zod',
    defaultOutput: './generated/zod',
  };
}

export async function onGenerate(options: GeneratorOptions): Promise<void> {
  const config = parseConfig(options);
  const { datamodel } = options.dmmf;

  // Collect enum names for reference in model generation
  const enumNames = new Set(datamodel.enums.map((e) => e.name));

  if (config.multipleFiles) {
    await generateMultipleFiles(datamodel, config, enumNames);
  } else {
    await generateSingleFile(datamodel, config, enumNames);
  }
}

async function generateSingleFile(
  datamodel: GeneratorOptions['dmmf']['datamodel'],
  config: ReturnType<typeof parseConfig>,
  enumNames: Set<string>
): Promise<void> {
  const lines: string[] = ["import { z } from 'zod';", ''];

  // Generate enums first
  for (const enumDef of datamodel.enums) {
    lines.push(generateEnumSchema(enumDef));
    lines.push('');
  }

  // Generate models
  for (const model of datamodel.models) {
    lines.push(generateModelSchema(model, config.coerceDate, enumNames));
    lines.push('');
  }

  const content = lines.join('\n');
  const outputPath = join(config.output, 'index.ts');

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content);
}

async function generateMultipleFiles(
  datamodel: GeneratorOptions['dmmf']['datamodel'],
  config: ReturnType<typeof parseConfig>,
  enumNames: Set<string>
): Promise<void> {
  await mkdir(config.output, { recursive: true });

  const exports: string[] = [];

  // Generate enum files
  for (const enumDef of datamodel.enums) {
    const content = `import { z } from 'zod';\n\n${generateEnumSchema(enumDef)}\n`;
    const fileName = `${enumDef.name}.ts`;
    await writeFile(join(config.output, fileName), content);
    exports.push(`export * from './${enumDef.name}';`);
  }

  // Generate model files
  for (const model of datamodel.models) {
    const imports = [`import { z } from 'zod';`];

    // Add imports for referenced enums
    const modelEnums = model.fields
      .filter((f) => f.kind === 'enum')
      .map((f) => f.type);
    const uniqueEnums = [...new Set(modelEnums)];

    for (const enumName of uniqueEnums) {
      imports.push(`import { ${enumName}Schema } from './${enumName}';`);
    }

    const content = `${imports.join('\n')}\n\n${generateModelSchema(model, config.coerceDate, enumNames)}\n`;
    const fileName = `${model.name}.ts`;
    await writeFile(join(config.output, fileName), content);
    exports.push(`export * from './${model.name}';`);
  }

  // Generate index file
  const indexContent = exports.join('\n') + '\n';
  await writeFile(join(config.output, 'index.ts'), indexContent);
}
