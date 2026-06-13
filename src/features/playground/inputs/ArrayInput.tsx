/** Dynamic row list for array parameters — one input per item, newline-joined internally. */
import {slot, type ThemeSlot} from "../../../themes/slot";
import {useTheme} from "../../../themes/context";

export interface ArrayInputTheme {
  rowInput: ThemeSlot;
  rowInputInvalid: ThemeSlot;
  rowIndex: ThemeSlot;
  removeButton: ThemeSlot;
  addButton: ThemeSlot;
  hint: ThemeSlot;
}

interface Props {
  value: string;
  style?: string;
  explode?: boolean;
  invalid?: boolean;
  onChange: (value: string) => void;
}

/** Derives a human-readable hint from the OpenAPI style/explode combination. */
function serializationHint(style: string | undefined, explode: boolean | undefined): string {
  const effectiveExplode = explode ?? (style === undefined || style === "form");
  if (effectiveExplode) return "repeated params  (?name=a&name=b)";
  if (style === "spaceDelimited") return "space-delimited";
  if (style === "pipeDelimited")  return "pipe-delimited";
  return "comma-delimited";
}

/** Splits the newline-joined internal value into an array of item strings. */
function toItems(value: string): string[] {
  const items = value.split("\n");
  return items.length === 0 ? [""] : items;
}

/** Dynamic row list: one input per item with × to remove, and an Add item button. */
export default function ArrayInput({ value, style, explode, invalid, onChange }: Props) {
  const t = useTheme().inputArray;
  const items = toItems(value);

  function update(index: number, newVal: string) {
    const next = [...items];
    next[index] = newVal;
    onChange(next.join("\n"));
  }

  function remove(index: number) {
    const next = items.filter((_, i) => i !== index);
    onChange((next.length ? next : [""]).join("\n"));
  }

  function add() {
    onChange([...items, ""].join("\n"));
  }

  const rowInputClass = invalid ? slot(t.rowInputInvalid) : slot(t.rowInput);

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className={slot(t.rowIndex)}>{i + 1}</span>
          <input
            type="text"
            className={rowInputClass}
            value={item}
            placeholder="value"
            onInput={(e) => update(i, (e.target as HTMLInputElement).value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            disabled={items.length === 1 && item === ""}
            className={slot(t.removeButton)}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      ))}

      <div className="flex items-center gap-3 mt-0.5">
        <button type="button" onClick={add} className={slot(t.addButton)}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Add item
        </button>
        <span className={slot(t.hint)}>
          {serializationHint(style, explode)}
        </span>
      </div>
    </div>
  );
}