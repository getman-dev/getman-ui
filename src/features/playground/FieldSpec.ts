/** Normalised descriptor for a single input field in the playground — covers both operation parameters and multipart body properties. */

export interface FieldSpec {
    // Identity
    name: string;
    location: "path" | "query" | "header" | "cookie" | "form";
    required: boolean;
    deprecated?: boolean;
    description?: string;

    // Widget routing
    type?: "string" | "integer" | "number" | "boolean" | "array" | "object";
    format?: string;       // "binary" → FileInput; "date" / "date-time" etc. shown in type badge
    enum?: unknown[];      // present → EnumSelect (single-value)
    items?: {              // array items descriptor
        type?: string;
        format?: string;     // "binary" → file[] in FileInput
        enum?: unknown[];    // present → MultiSelect (checkboxes)
    };

    // Array serialization (query params only)
    style?: string;    // "form" | "spaceDelimited" | "pipeDelimited" | "deepObject"
    explode?: boolean; // true → repeated name=val pairs; false → joined with delimiter

    // Constraints — shown as badges in ParamLabel; matching HTML attributes set on the input
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    default?: unknown;     // pre-fills the input on endpoint change
    example?: unknown;     // used as placeholder when no value is set
}