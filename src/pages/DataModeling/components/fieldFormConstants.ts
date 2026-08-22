export const BasicFieldTypes = [
  {
    name: 'String',
    label: 'String',
  },
  {
    name: 'Int',
    label: 'Int',
  },
  {
    name: 'Long',
    label: 'Long',
  },
  {
    name: 'Float',
    label: 'Float',
  },
  {
    name: 'Boolean',
    label: 'Boolean',
  },
  {
    name: 'DateTime',
    label: 'DateTime',
  },
  {
    name: 'Date',
    label: 'Date',
  },
  {
    name: 'Time',
    label: 'Time',
  },
  {
    name: 'JSON',
    label: 'JSON',
  },
];

export const FieldInitialValues: any = {
  STRING: {
    type: 'String',
    length: 255,
    unique: false,
    nullable: true,
    identity: false,
  },
  INT: {
    type: 'Int',
    unique: false,
    nullable: true,
    identity: false,
  },
  LONG: {
    type: 'Long',
    unique: false,
    nullable: true,
    identity: false,
  },
  DECIMAL: {
    type: 'Decimal',
    precision: 20,
    scale: 2,
    unique: false,
    nullable: true,
    identity: false,
  },
  BOOLEAN: {
    type: 'Boolean',
    unique: false,
    nullable: true,
    identity: false,
  },
  DATE: {
    type: 'Date',
    unique: false,
    nullable: true,
    identity: false,
  },
  TIME: {
    type: 'Time',
    unique: false,
    nullable: true,
    identity: false,
  },
  DATETIME: {
    type: 'DateTime',
    unique: false,
    nullable: true,
    identity: false,
  },
  JSON: {
    type: 'JSON',
    unique: false,
    nullable: true,
    identity: false,
  },
  MODEL_REF: {
    type: 'ModelRef',
    multiple: true,
    localField: null,
    foreignField: null,
    unique: false,
    nullable: true,
    cascadeDelete: false,
    identity: false,
  },
  ENUM: {
    type: 'Enum',
    unique: false,
    nullable: true,
    multiple: false,
    identity: false,
  },
};
