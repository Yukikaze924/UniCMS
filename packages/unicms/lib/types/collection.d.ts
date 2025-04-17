/**
 * Represents a model of collection.
 */
type Collection = {
    collectionName: string;
    options?: Options;
    info: Info;
    attributes: Attribute[];
};

/**
 * Options of the collection.
 */
type Options = Partial<{
    private: boolean;
}>;

/**
 * Metadata information about the collection.
 */
type Info = {
    name: string;
    description: string;
    category?: InfoCategory;
    [key: string]: string | number | boolean;
};

type InfoCategory = 'raw' | 'binary' | 'media';

/**
 * Base type for all attribute types.
 */
type AttributeBase = {
    name: string; // Field name
    type: AttributeType; // Field type
};

/**
 * Possible attribute types.
 */
type AttributeType = 'INT' | 'CHAR' | 'VARCHAR' | 'TEXT' | 'LONGTEXT' | 'DATETIME' | 'FLOAT' | 'BOOLEAN' | 'JSON';

/**
 * Type for integer attributes.
 */
type IntAttribute = AttributeBase & {
    primary: boolean; // Is primary key
    autoIncrement: boolean; // Is auto-increment
    length: number; // Field length
    nullable: boolean; // Is nullable
    defaultValue?: number; // Default value
};

/**
 * Type for string attributes.
 */
type StringAttribute = AttributeBase & {
    length: number; // Field length
    nullable: boolean; // Is nullable
    defaultValue?: string; // Default value
};

/**
 * Type for date attributes.
 */
type DateAttribute = AttributeBase & {
    nullable: boolean; // Is nullable
    defaultValue?: Date; // Default value
};

/**
 * Type for float attributes.
 */
type FloatAttribute = AttributeBase & {
    nullable: boolean; // Is nullable
    defaultValue?: number; // Default value
    precision?: number; // Precision
    scale?: number; // Scale
};

/**
 * Type for boolean attributes.
 */
type BooleanAttribute = AttributeBase & {
    nullable: boolean; // Is nullable
    defaultValue?: boolean; // Default value
};

/**
 * Type for JSON attributes.
 */
type JsonAttribute = AttributeBase & {
    nullable: boolean; // Is nullable
    defaultValue?: object; // Default value
};

type DefaultAttribute = AttributeBase & {
    length?: number;
    nullable: boolean;
    defaultValue?: string | number | boolean | any;
};

/**
 * Union type for all attribute types.
 */
type Attribute =
    | IntAttribute
    | StringAttribute
    | DateAttribute
    | FloatAttribute
    | BooleanAttribute
    | JsonAttribute
    | DefaultAttribute;
