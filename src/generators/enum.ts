import type { DMMF } from '@prisma/generator-helper';

export function generateEnumSchema(enumDef: DMMF.DatamodelEnum): string {
  const values = enumDef.values.map((v) => `'${v.name}'`).join(', ');

  return `export const ${enumDef.name}Schema = z.enum([${values}]);
export type ${enumDef.name} = z.infer<typeof ${enumDef.name}Schema>;`;
}
