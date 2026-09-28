import type {Enum, EnumElement} from '@/types/data-modeling';

export interface ElementRow {
  name?: string;
  code?: string;
  comment?: string;
}

const isNumericLiteral = (value: string) => /^-?\d+$/.test(value);

export const toElementRows = (model?: Partial<Enum>): ElementRow[] => {
  if (model?.elementDefinitions?.length) {
    return model.elementDefinitions.map((element) => ({
      name: element.name,
      code: element.code === null || element.code === undefined ? '' : String(element.code),
      comment: element.comment ?? '',
    }));
  }
  return (model?.elements ?? []).map((name) => ({name, code: '', comment: ''}));
};

export const buildEnumPayload = (values: Record<string, any>): Enum => {
  const rows: ElementRow[] = values?.elements ?? [];
  const hasAnyCode = rows.some((row) => (row?.code ?? '').toString().trim() !== '');
  const elementDefinitions: EnumElement[] = rows.map((row) => {
    const name = (row?.name ?? '').trim();
    const code = (row?.code ?? '').toString().trim();
    const comment = (row?.comment ?? '').toString().trim();
    return {
      name,
      ...(hasAnyCode && code ? {code: isNumericLiteral(code) ? Number(code) : code} : {}),
      ...(comment ? {comment} : {}),
    };
  });
  return {
    name: values?.name,
    type: 'Enum',
    elements: elementDefinitions.map((element) => element.name),
    elementDefinitions,
    ...(values?.comment ? {comment: values.comment} : {}),
  };
};