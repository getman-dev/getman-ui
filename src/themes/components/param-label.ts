/** ParamLabelTheme — slots for parameter label rows with badges and tooltips. */
import type { ThemeSlot } from '../slot';

export interface ParamLabelTheme {
  nameText:        ThemeSlot;
  nameDeprecated:  ThemeSlot;
  locPath:         ThemeSlot;
  locQuery:        ThemeSlot;
  locHeader:       ThemeSlot;
  locCookie:       ThemeSlot;
  locForm:         ThemeSlot;
  locDefault:      ThemeSlot;
  typeBadge:       ThemeSlot;
  requiredBadge:   ThemeSlot;
  deprecatedBadge: ThemeSlot;
  constraintBadge: ThemeSlot;
  tooltipIcon:     ThemeSlot;
  tooltipPopup:    ThemeSlot;
}