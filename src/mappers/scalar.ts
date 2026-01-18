export type PrismaScalarType =
  | 'String'
  | 'Int'
  | 'Float'
  | 'Boolean'
  | 'DateTime'
  | 'BigInt'
  | 'Decimal'
  | 'Json'
  | 'Bytes';

const scalarMap: Record<PrismaScalarType, string> = {
  String: 'z.string()',
  Int: 'z.number().int()',
  Float: 'z.number()',
  Boolean: 'z.boolean()',
  DateTime: 'z.coerce.date()',
  BigInt: 'z.bigint()',
  Decimal: 'z.string()',
  Json: 'z.unknown()',
  Bytes: 'z.instanceof(Uint8Array)',
};

const scalarMapNoCoerce: Record<PrismaScalarType, string> = {
  ...scalarMap,
  DateTime: 'z.date()',
};

export function mapScalarType(type: string, coerceDate: boolean): string | null {
  const map = coerceDate ? scalarMap : scalarMapNoCoerce;
  return map[type as PrismaScalarType] ?? null;
}
