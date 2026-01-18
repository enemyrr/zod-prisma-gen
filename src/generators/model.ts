import type { DMMF } from '@prisma/generator-helper';
import { mapField } from '../mappers/field';

export function generateModelSchema(
  model: DMMF.Model,
  coerceDate: boolean,
  enumNames: Set<string>
): string {
  const fields = model.fields
    .map((field) => mapField(field, coerceDate, enumNames, 'model'))
    .filter((f): f is NonNullable<typeof f> => f !== null);

  const fieldLines = fields.map((f) => `  ${f.name}: ${f.zodType},`).join('\n');

  return `export const ${model.name}Schema = z.object({
${fieldLines}
});
export type ${model.name} = z.infer<typeof ${model.name}Schema>;`;
}

export function generateCreateInputSchema(
  model: DMMF.Model,
  coerceDate: boolean,
  enumNames: Set<string>
): string {
  const fields = model.fields
    .map((field) => mapField(field, coerceDate, enumNames, 'create'))
    .filter((f): f is NonNullable<typeof f> => f !== null);

  const fieldLines = fields.map((f) => `  ${f.name}: ${f.zodType},`).join('\n');

  return `export const ${model.name}CreateInputSchema = z.object({
${fieldLines}
});
export type ${model.name}CreateInput = z.infer<typeof ${model.name}CreateInputSchema>;`;
}

export function generateUpdateInputSchema(
  model: DMMF.Model,
  coerceDate: boolean,
  enumNames: Set<string>
): string {
  const fields = model.fields
    .map((field) => mapField(field, coerceDate, enumNames, 'update'))
    .filter((f): f is NonNullable<typeof f> => f !== null);

  const fieldLines = fields.map((f) => `  ${f.name}: ${f.zodType},`).join('\n');

  return `export const ${model.name}UpdateInputSchema = z.object({
${fieldLines}
});
export type ${model.name}UpdateInput = z.infer<typeof ${model.name}UpdateInputSchema>;`;
}
