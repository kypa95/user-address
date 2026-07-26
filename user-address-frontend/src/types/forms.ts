export type FieldDescriptor<T = string> = [label: string, key: T, required: boolean];

export type FormErrors = Record<string, string>;
