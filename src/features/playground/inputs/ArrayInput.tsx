/** Dynamic row list for array parameters — one input per item, newline-joined internally. */
import clsx from "clsx";

const rowInput =
  "flex-1 text-xs border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 " +
  "text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 transition-colors font-mono";

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

  const borderClass = invalid
    ? "border-red-400 dark:border-red-500 focus:ring-red-400 focus:border-red-400"
    : "border-gray-200 dark:border-gray-600 focus:ring-blue-400 focus:border-blue-400";

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-[9px] text-gray-300 dark:text-gray-600 font-mono w-4 text-right shrink-0">{i + 1}</span>
          <input
            type="text"
            className={clsx(rowInput, borderClass)}
            value={item}
            placeholder="value"
            onInput={(e) => update(i, (e.target as HTMLInputElement).value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            disabled={items.length === 1 && item === ""}
            className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-0 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      ))}

      <div className="flex items-center gap-3 mt-0.5">
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Add item
        </button>
        <span className="text-[9px] text-gray-300 dark:text-gray-600 font-mono">
          {serializationHint(style, explode)}
        </span>
      </div>
    </div>
  );
}