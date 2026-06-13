/**
 * ThemeSlot type and slot() resolver — the core of the slot-theming system.
 * Each component defines an XxxTheme interface where every property is a ThemeSlot.
 */

/**
 * A theme slot is either a plain Tailwind class string, or an object with a
 * required `base` key and optional named variant keys. Variant values are
 * appended to `base` when the matching condition is true.
 */
export type ThemeSlot = string | ({ base: string } & Record<string, string>);

/**
 * Resolves a ThemeSlot to a final class string.
 * Plain strings are returned as-is. For objects, `base` is always included;
 * any key present in `conditions` whose value is `true` is also appended.
 * Condition keys not present in the slot definition are silently ignored.
 */
export function slot(def: ThemeSlot, conditions?: Record<string, boolean>): string {
    if (typeof def === 'string') return def;
    const parts = [def.base];
    if (conditions) {
        for (const [key, active] of Object.entries(conditions)) {
            if (active && def[key]) parts.push(def[key]);
        }
    }
    return parts.filter(Boolean).join(' ');
}