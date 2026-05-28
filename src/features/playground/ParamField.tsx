/** Routes a FieldSpec to the correct typed input widget and renders it with a ParamLabel. */
import type { FieldSpec } from "./FieldSpec";
import ParamLabel from "./ParamLabel";
import ScalarInput from "./inputs/ScalarInput";
import EnumSelect from "./inputs/EnumSelect";
import BooleanSelect from "./inputs/BooleanSelect";
import ArrayInput from "./inputs/ArrayInput";
import MultiSelect from "./inputs/MultiSelect";
import ObjectInput from "./inputs/ObjectInput";
import FileInput from "./inputs/FileInput";

interface Props {
  field: FieldSpec;
  value: string;
  invalid?: boolean;
  onChange: (name: string, value: string) => void;
  onFileChange?: (name: string, files: FileList, multiple: boolean) => void;
}

/**
 * Computes the type badge string shown in ParamLabel from a FieldSpec.
 * Arrays show as `itemType[]` (e.g. "string[]", "integer[]·enum", "binary[]").
 * Non-arrays append format with a middle-dot when present.
 */
function typeBadgeFor(field: FieldSpec): string | undefined {
  if (field.type === "array") {
    const itemType = field.items?.format === "binary"
      ? "binary"
      : (field.items?.type ?? "string");
    const enumSuffix = field.items?.enum ? "·enum" : "";
    return `${itemType}[]${enumSuffix}`;
  }
  if (field.enum)   return "enum";
  if (field.format) return `${field.type ?? "string"}·${field.format}`;
  return field.type;
}

/**
 * Selects and renders the appropriate input widget for a field, using the priority routing
 * table defined in playground-param-inputs.md. State is fully controlled via onChange/onFileChange.
 */
export default function ParamField({ field, value, invalid, onChange, onFileChange }: Props) {
  const { name, required, items } = field;
  const isMultiFile = field.type === "array" && items?.format === "binary";
  const isBinaryFile = field.format === "binary" || isMultiFile;

  function renderInput() {
    if (isBinaryFile) {
      return (
        <FileInput
          multiple={isMultiFile}
          onFileChange={(files) => onFileChange?.(name, files, isMultiFile)}
        />
      );
    }
    if (field.type === "boolean") {
      return <BooleanSelect value={value} invalid={invalid} onChange={(v) => onChange(name, v)} />;
    }
    if (field.type === "array" && items?.enum?.length) {
      return <MultiSelect value={value} options={items.enum} invalid={invalid} onChange={(v) => onChange(name, v)} />;
    }
    if (field.type === "array") {
      return <ArrayInput value={value} style={field.style} explode={field.explode} invalid={invalid} onChange={(v) => onChange(name, v)} />;
    }
    if (field.type === "object") {
      return <ObjectInput value={value} invalid={invalid} onChange={(v) => onChange(name, v)} />;
    }
    if (field.enum?.length) {
      return <EnumSelect value={value} options={field.enum} required={required} invalid={invalid} onChange={(v) => onChange(name, v)} />;
    }
    return (
      <ScalarInput
        value={value}
        name={name}
        type={field.type}
        minimum={field.minimum}
        maximum={field.maximum}
        minLength={field.minLength}
        maxLength={field.maxLength}
        pattern={field.pattern}
        example={field.example}
        invalid={invalid}
        onChange={(v) => onChange(name, v)}
      />
    );
  }

  return (
    <div>
      <ParamLabel
        name={name}
        location={field.location}
        typeBadge={typeBadgeFor(field)}
        required={required}
        deprecated={field.deprecated}
        description={field.description}
        minimum={field.minimum}
        maximum={field.maximum}
        minLength={field.minLength}
        maxLength={field.maxLength}
        pattern={field.pattern}
        defaultValue={field.default}
      />
      {renderInput()}
    </div>
  );
}