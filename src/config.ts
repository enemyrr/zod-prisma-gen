import type { GeneratorOptions } from '@prisma/generator-helper';

export interface GeneratorConfig {
  output: string;
  multipleFiles: boolean;
  coerceDate: boolean;
  createInputTypes: boolean;
}

export function parseConfig(options: GeneratorOptions): GeneratorConfig {
  const config = options.generator.config;

  return {
    output: options.generator.output?.value ?? './generated/zod',
    multipleFiles: config.multipleFiles === 'true',
    coerceDate: config.coerceDate !== 'false', // Default true
    createInputTypes: config.createInputTypes === 'true',
  };
}
