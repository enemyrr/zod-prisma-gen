import type { DMMF } from '@prisma/generator-helper';
import { mapScalarType } from './scalar';

export interface FieldMapping {
  name: string;
  zodType: string;
}

export function mapField(
  field: DMMF.Field,
  coerceDate: boolean,
  enumNames: Set<string>
): FieldMapping | null {
  // Skip relation fields
  if (field.relationName) {
    return null;
  }

  let zodType: string;

  // Check if it's an enum
  if (field.kind === 'enum') {
    zodType = `${field.type}Schema`;
  } else {
    // Try to map as scalar type
    const scalar = mapScalarType(field.type, coerceDate);
    if (!scalar) {
      // Unsupported type (likely a relation or unsupported scalar)
      return null;
    }
    zodType = scalar;
  }

  // Handle list types
  if (field.isList) {
    zodType = `z.array(${zodType})`;
  }

  // Handle optional fields
  if (!field.isRequired) {
    zodType = `${zodType}.nullable()`;
  }

  // Handle default values
  if (field.hasDefaultValue && field.default !== undefined) {
    const defaultValue = formatDefaultValue(field.default, field.type);
    if (defaultValue !== null) {
      zodType = `${zodType}.default(${defaultValue})`;
    }
  }

  return {
    name: field.name,
    zodType,
  };
}

function formatDefaultValue(
  defaultValue: unknown,
  fieldType: string
): string | null {
  // Handle autoincrement, now(), uuid(), etc.
  if (typeof defaultValue === 'object' && defaultValue !== null && 'name' in defaultValue) {
    // Skip auto-generated defaults like autoincrement(), now(), uuid()
    return null;
  }

  // Handle BigInt defaults (Prisma serializes BigInt as string in JSON)
  if (fieldType === 'BigInt') {
    if (typeof defaultValue === 'string' || typeof defaultValue === 'number') {
      return `BigInt(${defaultValue})`;
    }
    if (typeof defaultValue === 'bigint') {
      return `BigInt(${defaultValue})`;
    }
    return null;
  }

  // Handle scalar defaults
  if (typeof defaultValue === 'string') {
    return `'${defaultValue}'`;
  }

  if (typeof defaultValue === 'number' || typeof defaultValue === 'boolean') {
    return String(defaultValue);
  }

  return null;
}
