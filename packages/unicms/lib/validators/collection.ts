import { z } from 'zod';

export const ATTRIBUTE_TYPES = [
    'INT',
    'CHAR',
    'VARCHAR',
    'TEXT',
    'LONGTEXT',
    'DATETIME',
    'FLOAT',
    'BOOLEAN',
    'JSON',
] as const;

export const INFO_CATEGORIES = ['raw', 'binary', 'media'] as const;

const attributeType = z.enum(ATTRIBUTE_TYPES);
export type AttributeType = z.infer<typeof attributeType>;

const createAttributeSchema = <T extends AttributeType>(type: T, schema: z.ZodRawShape) => {
    return z
        .object({
            name: z.string().min(1),
            type: z.preprocess((val) => (typeof val === 'string' ? val.toUpperCase() : val), z.literal(type)),
            ...schema,
        })
        .passthrough();
};

const intAttributeSchema = createAttributeSchema('INT', {
    length: z.number().int().positive().default(11),
    nullable: z.boolean().default(false),
    defaultValue: z.number().nullish(),
    primary: z.boolean().optional(),
    autoIncrement: z.boolean().optional(),
});

const floatAttributeSchema = createAttributeSchema('FLOAT', {
    nullable: z.boolean().default(false),
    defaultValue: z.number().nullish(),
    precision: z.number().optional(),
    scale: z.number().optional(),
});

const charAttributeSchema = createAttributeSchema('CHAR', {
    length: z.number().int().positive().default(255),
    nullable: z.boolean().default(false),
    defaultValue: z.string().nullish(),
});

const varcharAttributeSchema = createAttributeSchema('VARCHAR', {
    length: z.number().int().positive().default(255),
    nullable: z.boolean().default(false),
    defaultValue: z.string().nullish(),
});

const textAttributeSchema = createAttributeSchema('TEXT', {
    nullable: z.boolean().default(false),
    defaultValue: z.string().nullish(),
});

const longtextAttributeSchema = createAttributeSchema('LONGTEXT', {
    nullable: z.boolean().default(false),
    defaultValue: z.string().nullish(),
});

const booleanAttributeSchema = createAttributeSchema('BOOLEAN', {
    nullable: z.boolean().default(false),
    defaultValue: z.boolean().nullish(),
});

const dateAttributeSchema = createAttributeSchema('DATETIME', {
    nullable: z.boolean().default(false),
    defaultValue: z.date().nullish(),
});

const jsonAttributeSchema = createAttributeSchema('JSON', {
    nullable: z.boolean().default(false),
    defaultValue: z.record(z.any()).nullish(),
});

export const attributeSchema = z.discriminatedUnion('type', [
    intAttributeSchema,
    floatAttributeSchema,
    charAttributeSchema,
    varcharAttributeSchema,
    textAttributeSchema,
    longtextAttributeSchema,
    booleanAttributeSchema,
    dateAttributeSchema,
    jsonAttributeSchema,
]);

export const collectionOptionsSchema = z
    .object({
        private: z.boolean().default(false),
    })
    .optional();

export const collectionInfoSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    category: z.enum(INFO_CATEGORIES).optional(),
});

export const collectionSchema = z
    .object({
        collectionName: z.string().min(1),
        options: collectionOptionsSchema,
        info: collectionInfoSchema,
        attributes: z.array(attributeSchema).min(1),
    })
    .strict();

export type Collection = z.infer<typeof collectionSchema>;
export type Attribute = z.infer<typeof attributeSchema>;
export type CollectionOptions = z.infer<typeof collectionOptionsSchema>;
