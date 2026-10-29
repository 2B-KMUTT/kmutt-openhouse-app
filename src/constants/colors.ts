/**
 * KMUTT Corporate Identity (CI) Color System
 * Centralized color definitions for the entire application.
 * Changing values here updates all components, layouts, pages, and themes.
 */

export const KMUTT_CI = {
  // Official KMUTT Orange (Primary)
  orange: "#FA4616",
  orangeHover: "#E0380B",
  orangeLight: "#FFF0EB",
  orangeBorder: "#FCD0C2",

  // Official KMUTT Yellow (Secondary)
  yellow: "#FFC233",
  yellowHover: "#E6AE2E",
  yellowLight: "#FFF9E6",

  // Brand aliases
  primary: "#FA4616",
  primaryHover: "#E0380B",
  secondary: "#FFC233",
  secondaryHover: "#E6AE2E",
} as const;

// Common exports for drop-in usage across all files
export const PRIMARY = KMUTT_CI.orange;
export const PRIMARY_COLOR = KMUTT_CI.orange;
export const PRIMARY_HOVER = KMUTT_CI.orangeHover;
export const SECONDARY = KMUTT_CI.yellow;
export const SECONDARY_COLOR = KMUTT_CI.yellow;

