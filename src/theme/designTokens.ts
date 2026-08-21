/**
 * Flexmodel Design Tokens — Notion Analysis
 *
 * Single source of truth for all visual properties, derived from DESIGN.md
 * (Notion Analysis): a warm paper-calm canvas, near-black Inter type, one
 * confident blue accent, and a decorative-only sticker palette.
 *
 * Token reference syntax (mirrors DESIGN.md):
 * - {colors.*}     → Color values
 * - {typography.*} → Font stacks, sizes, weights, line heights, letter spacing
 * - {rounded.*}    → Border radius values
 * - {spacing.*}    → Spacing scale
 * - {components.*} → Component-level presets
 *
 * The entire system is set in a single family — NotionInter (substituted by
 * Inter) — so every typography token shares one fontFamily.
 */

// NotionInter is a proprietary tuning of Inter — substitute Inter directly.
// DESIGN.md: "fallback stack of Inter, -apple-system, system-ui, 'Segoe UI', Helvetica, Arial".
const notionInter =
  "'Inter', -apple-system, system-ui, 'Segoe UI', Helvetica, Arial, sans-serif";

// ============================================================================
// Colors
// ============================================================================
export const colors = {
  // --- Brand & Accent ---
  /** Notion Blue — the single structural accent: primary CTA, inline links, active/focus signal. */
  primary: '#0075de',
  /** Pressed Blue — darker press state of the primary CTA. */
  'primary-active': '#005bab',
  /** Deep Indigo — the dark hero "night" band background (full-bleed inverted sections). */
  secondary: '#213183',
  /** Text on primary buttons and dark surfaces. */
  'on-primary': '#ffffff',
  /** Text on dark surfaces. */
  'on-dark': '#ffffff',

  // --- Surface ---
  /** White — card and panel surfaces, nav bar, form fields. */
  canvas: '#ffffff',
  /** Warm Paper — signature page canvas and footer band (warm off-white). */
  'canvas-soft': '#f6f5f4',
  /** White — alias of canvas for card/field figure/ground separation. */
  surface: '#ffffff',
  /** 1px card borders and dividers (black-at-10%-on-white, kept solid for reuse). */
  hairline: '#e6e6e6',

  // --- Text ---
  /** Ink — primary headings and body text (DESIGN.md renders at ~95% alpha for a soft true-black). */
  ink: '#000000',
  /** Warm Charcoal — secondary body copy and footer text. */
  'ink-secondary': '#31302e',
  /** Stone — supporting / muted copy. */
  'ink-muted': '#615d59',
  /** Ash — captions, metadata, placeholder text. */
  'ink-faint': '#a39e98',

  // --- Sticker Palette (DECORATION ONLY — never paints a CTA or structural fill) ---
  'accent-sky': '#62aef0',
  'accent-purple': '#d6b6f6',
  'accent-purple-deep': '#391c57',
  'accent-pink': '#ff64c8',
  'accent-orange': '#dd5b00',
  'accent-orange-deep': '#793400',
  'accent-teal': '#2a9d99',
  'accent-green': '#1aae39',
  'accent-brown': '#523410',

  // --- Admin-derived semantics ---
  // DESIGN.md's marketing surfaces omit a dedicated error/success ramp (status is
  // carried by the sticker palette). The admin console requires explicit semantic
  // colors, so these are derived from the sticker palette / standard calm tones.
  /** Success — affirmative states (derived from accent-green). */
  success: '#1aae39',
  /** Warning — caution states (derived from accent-orange). */
  warning: '#dd5b00',
  /** Info — informational states (mirrors the primary blue). */
  info: '#0075de',
  /** Error — destructive states (calm red; not a Notion sticker colour). */
  error: '#e5484d',
} as const;

export type ColorToken = keyof typeof colors;

// ============================================================================
// Typography
// ============================================================================
export const typography = {
  // display-1: 64px / 700 / 1.0 / −2.125px — Hero headline
  'display-1': {
    fontFamily: notionInter,
    fontSize: 64,
    fontWeight: 700,
    lineHeight: 1.0,
    letterSpacing: -2.125,
  },
  // display-2: 54px / 700 / 1.04 / −1.875px — Large section headlines
  'display-2': {
    fontFamily: notionInter,
    fontSize: 54,
    fontWeight: 700,
    lineHeight: 1.04,
    letterSpacing: -1.875,
  },
  // heading-1: 40px / 700 / 1.1 / −1px — Section headlines
  'heading-1': {
    fontFamily: notionInter,
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: -1,
  },
  // heading-2: 26px / 700 / 1.23 / −0.625px — Sub-section headings
  'heading-2': {
    fontFamily: notionInter,
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1.23,
    letterSpacing: -0.625,
  },
  // heading-3: 22px / 700 / 1.27 / −0.25px — Card titles
  'heading-3': {
    fontFamily: notionInter,
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.27,
    letterSpacing: -0.25,
  },
  // title: 20px / 600 / 1.4 / −0.125px — Feature titles, callouts
  title: {
    fontFamily: notionInter,
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: -0.125,
  },
  // body-md: 16px / 400 / 1.5 / 0 — Default body copy
  'body-md': {
    fontFamily: notionInter,
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  // body-sm: 15px / 400 / 1.33 / 0 — Dense body, table rows, nav
  'body-sm': {
    fontFamily: notionInter,
    fontSize: 15,
    fontWeight: 400,
    lineHeight: 1.33,
    letterSpacing: 0,
  },
  // button: 16px / 500 / 1.5 / 0 — Button labels
  button: {
    fontFamily: notionInter,
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  // caption: 14px / 400 / 1.43 / 0 — Captions, footnotes
  caption: {
    fontFamily: notionInter,
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.43,
    letterSpacing: 0,
  },
  // eyebrow: 12px / 600 / 1.33 / +0.125px — Pill badges, small labels
  eyebrow: {
    fontFamily: notionInter,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.33,
    letterSpacing: 0.125,
  },
} as const;

export type TypographyToken = keyof typeof typography;

// ============================================================================
// Border Radius
// ============================================================================
export const rounded = {
  /** Form fields — deliberately tighter than the pill CTAs. */
  xs: 4,
  /** Small inline surfaces. */
  sm: 5,
  /** Utility buttons, nav buttons, pricing columns. */
  md: 8,
  /** Feature cards, modals, popovers. */
  lg: 12,
  /** Large marketing surfaces. */
  xl: 16,
  /** Fully pill CTAs, circular icon buttons, badge pills. */
  full: 9999,
} as const;

export type RoundedToken = keyof typeof rounded;

// ============================================================================
// Spacing
// ============================================================================
export const spacing = {
  /** 4px — minimum spacing unit. */
  xxs: 4,
  /** 8px. */
  xs: 8,
  /** 12px. */
  sm: 12,
  /** 16px. */
  md: 16,
  /** 24px — card interior padding. */
  lg: 24,
  /** 28px. */
  xl: 28,
  /** 32px — footer / hero padding. */
  xxl: 32,
} as const;

export type SpacingToken = keyof typeof spacing;

// ============================================================================
// Components — DESIGN.md component presets
// ============================================================================
export const components = {
  // --- Navigation ---
  'nav-bar': {
    backgroundColor: colors.canvas,
    textColor: colors.ink,
    typography: typography['body-sm'],
    padding: spacing.md,
  },

  // --- Buttons ---
  'button-primary': {
    backgroundColor: colors.primary,
    textColor: colors['on-primary'],
    typography: typography.button,
    rounded: rounded.full,
    padding: '8px 20px',
  },
  'button-primary-pressed': {
    backgroundColor: colors['primary-active'],
    textColor: colors['on-primary'],
    rounded: rounded.full,
  },
  'button-secondary': {
    backgroundColor: colors.surface,
    textColor: colors.ink,
    typography: typography.button,
    rounded: rounded.full,
    padding: '8px 20px',
  },
  'button-utility': {
    backgroundColor: colors.surface,
    textColor: colors.ink,
    typography: typography.button,
    rounded: rounded.md,
    padding: '4px 14px',
  },
  'button-icon-circular': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    textColor: colors['on-primary'],
    rounded: rounded.full,
  },

  // --- Badges ---
  'badge-pill': {
    backgroundColor: colors.surface,
    textColor: colors.primary,
    typography: typography.eyebrow,
    rounded: rounded.full,
    padding: '4px 8px',
  },

  // --- Cards ---
  'feature-card': {
    backgroundColor: colors.surface,
    textColor: colors.ink,
    typography: typography['body-md'],
    rounded: rounded.lg,
    padding: spacing.lg,
  },
  'feature-card-elevated': {
    backgroundColor: colors.surface,
    textColor: colors.ink,
    rounded: rounded.lg,
    padding: spacing.lg,
  },
  'pricing-plan-card': {
    backgroundColor: colors.surface,
    textColor: colors.ink,
    typography: typography['body-sm'],
    rounded: rounded.md,
    padding: spacing.lg,
  },
  'pricing-plan-card-featured': {
    backgroundColor: colors['canvas-soft'],
    textColor: colors.ink,
    rounded: rounded.md,
    padding: spacing.lg,
  },

  // --- Inputs & Forms ---
  'text-input': {
    backgroundColor: colors.surface,
    textColor: colors.ink,
    typography: typography['body-sm'],
    rounded: rounded.xs,
    padding: 6,
  },

  // --- Signature Components ---
  'hero-band': {
    backgroundColor: colors.secondary,
    textColor: colors['on-primary'],
    typography: typography['display-1'],
    padding: spacing.xxl,
  },
  footer: {
    backgroundColor: colors['canvas-soft'],
    textColor: colors['ink-secondary'],
    typography: typography.caption,
    padding: spacing.xxl,
  },

  // --- Examples (illustrative) — kit-mirror demonstration surfaces ---
  'ex-pricing-tier': {
    backgroundColor: colors['canvas-soft'],
    textColor: colors.ink,
    borderColor: colors.hairline,
    rounded: rounded.xl,
    padding: spacing.lg,
  },
  'ex-pricing-tier-featured': {
    backgroundColor: colors.ink,
    textColor: colors['on-primary'],
    rounded: rounded.xl,
    padding: spacing.lg,
  },
  'ex-product-selector': {
    backgroundColor: colors.surface,
    rounded: rounded.xl,
    padding: spacing.lg,
  },
  'ex-cart-drawer': {
    backgroundColor: colors.surface,
    rounded: rounded.xl,
    padding: spacing.lg,
    'item-divider': colors.hairline,
  },
  'ex-app-shell-row': {
    backgroundColor: colors.canvas,
    activeIndicator: colors.primary,
    rounded: rounded.sm,
    padding: `${spacing.sm}px ${spacing.md}px`,
  },
  'ex-data-table-cell': {
    headerBackground: colors['canvas-soft'],
    headerTypography: typography.eyebrow,
    bodyTypography: typography['body-sm'],
    cellPadding: `${spacing.sm}px ${spacing.md}px`,
    rowBorder: colors.hairline,
  },
  'ex-auth-form-card': {
    backgroundColor: colors.surface,
    rounded: rounded.xl,
    padding: spacing.lg,
  },
  'ex-modal-card': {
    backgroundColor: colors.surface,
    rounded: rounded.xl,
    padding: spacing.lg,
  },
  'ex-empty-state-card': {
    backgroundColor: colors['canvas-soft'],
    rounded: rounded.xl,
    padding: spacing.xxl,
    captionTypography: typography['body-md'],
  },
  'ex-toast': {
    backgroundColor: colors.surface,
    rounded: rounded.xl,
    padding: `${spacing.sm}px ${spacing.md}px`,
    typography: typography['body-sm'],
  },
} as const;

export type ComponentToken = keyof typeof components;

// ============================================================================
// Ant Design v6 Token Mapping
// ============================================================================

/** Ant Design seed tokens derived from DESIGN.md (Notion Analysis). */
export const antdSeedTokens = {
  // Primary — Notion Blue, the single structural accent.
  colorPrimary: colors.primary,
  // Semantic colors (admin-derived; DESIGN.md marketing surfaces omit a status ramp).
  colorSuccess: colors.success,
  colorInfo: colors.info,
  colorWarning: colors.warning,
  colorError: colors.error,
  // Text base — near-black ink.
  colorTextBase: colors.ink,
  // Background base — white canvas.
  colorBgBase: colors.canvas,
  // Base font size — caption (14px) keeps admin console density; the full
  // DESIGN.md type scale (16/15/14/12) is exposed via the typography tokens.
  fontSize: typography.caption.fontSize,
  // Base border radius — utility-button tight (8px).
  borderRadius: rounded.md,
  // Font family — Inter (NotionInter substitute).
  fontFamily: notionInter,
} as const;

/** Ant Design light-mode color map tokens. */
export const antdMapTokens = {
  // --- Text Colors (ink hierarchy) ---
  colorText: colors.ink,
  colorTextSecondary: colors['ink-secondary'],
  colorTextTertiary: colors['ink-muted'],
  colorTextQuaternary: colors['ink-faint'],

  // --- Background Colors ---
  // Cards / fields / panels stay pure white; the page canvas is warm canvas-soft.
  colorBgContainer: colors.canvas,
  colorBgElevated: colors.canvas,
  colorBgLayout: colors['canvas-soft'],
  colorBgSpotlight: colors.canvas,
  colorBgMask: 'rgba(0,0,0,0.45)',

  // --- Fill Colors (warm neutrals) ---
  colorFill: 'rgba(0,0,0,0.06)',
  colorFillSecondary: 'rgba(0,0,0,0.04)',
  colorFillTertiary: 'rgba(0,0,0,0.03)',
  colorFillQuaternary: 'rgba(0,0,0,0.02)',

  // --- Border Colors ---
  colorBorder: colors.hairline,
  colorBorderSecondary: colors.hairline,

  // --- Link (inline links use the primary blue) ---
  colorLink: colors.primary,
  colorLinkHover: '#0066c9',
  colorLinkActive: colors['primary-active'],

  // --- Primary Derivations (blue ramp) ---
  colorPrimaryBg: '#e8f3fc',
  colorPrimaryBgHover: '#d4ecfa',
  colorPrimaryBorder: colors.primary,
  colorPrimaryBorderHover: '#0066c9',
  colorPrimaryHover: '#0066c9',
  colorPrimaryActive: colors['primary-active'],
  colorPrimaryTextHover: '#0066c9',
  colorPrimaryText: colors.primary,
  colorPrimaryTextActive: colors['primary-active'],

  // --- Info Derivations (mirrors the primary blue) ---
  colorInfoBg: '#e8f3fc',
  colorInfoBgHover: '#d4ecfa',
  colorInfoBorder: colors.info,
  colorInfoBorderHover: '#0066c9',
  colorInfoHover: '#0066c9',
  colorInfoActive: colors['primary-active'],
  colorInfoTextHover: '#0066c9',
  colorInfoText: colors.info,
  colorInfoTextActive: colors['primary-active'],

  // --- Success Derivations (accent-green) ---
  colorSuccessBg: '#e8f8ec',
  colorSuccessBgHover: '#d0f0d8',
  colorSuccessBorder: colors.success,
  colorSuccessBorderHover: '#159c31',
  colorSuccessHover: '#159c31',
  colorSuccessActive: '#128a2b',
  colorSuccessTextHover: '#159c31',
  colorSuccessText: colors.success,
  colorSuccessTextActive: '#128a2b',

  // --- Warning Derivations (orange ramp) ---
  // Light-mode seed override: the sticker accent-orange (#dd5b00) is too dark to
  // read as "warning"; use a brighter mid-orange so Alerts/Tags/icons read clearly.
  colorWarning: '#fa8c16',
  colorWarningBg: '#fff7e6',
  colorWarningBgHover: '#ffe7ba',
  colorWarningBorder: '#ffd591',
  colorWarningBorderHover: '#ffd591',
  colorWarningHover: '#ffa940',
  colorWarningActive: '#d46b08',
  colorWarningTextHover: '#ffa940',
  colorWarningText: '#fa8c16',
  colorWarningTextActive: '#d46b08',

  // --- Error Derivations (calm red) ---
  colorErrorBg: '#fdecec',
  colorErrorBgHover: '#fbd5d6',
  colorErrorBorder: colors.error,
  colorErrorBorderHover: '#ce363b',
  colorErrorHover: '#ce363b',
  colorErrorActive: '#b62a2e',
  colorErrorTextHover: '#ce363b',
  colorErrorText: colors.error,
  colorErrorTextActive: '#b62a2e',
} as const;

/**
 * Shared non-color tokens — identical across light and dark modes.
 * Ensures spacing, sizing, typography, border radius, and elevation are unified.
 */
export const sharedTokens = {
  // --- Border Radius ---
  borderRadiusXS: rounded.xs,
  borderRadiusSM: rounded.sm,
  borderRadius: rounded.md,
  borderRadiusLG: rounded.lg,
  borderRadiusOuter: rounded.lg,

  // --- Control ---
  controlHeight: 36, // Notion-compact controls (~text-input height)
  controlHeightSM: 28,
  controlHeightLG: 44,
  controlHeightXS: 24,

  // --- Line Height ---
  lineHeight: typography['body-md'].lineHeight,
  lineHeightSM: typography['body-sm'].lineHeight,
  lineHeightLG: typography['body-md'].lineHeight,
  lineHeightHeading1: typography['heading-1'].lineHeight,
  lineHeightHeading2: typography['heading-2'].lineHeight,
  lineHeightHeading3: typography['heading-3'].lineHeight,
  lineHeightHeading4: typography.title.lineHeight,
  lineHeightHeading5: typography['body-md'].lineHeight,

  // --- Font Sizes ---
  fontSizeSM: typography.eyebrow.fontSize,
  fontSizeLG: typography['body-md'].fontSize,
  fontSizeXL: typography.title.fontSize,
  fontSizeHeading1: typography['heading-1'].fontSize,
  fontSizeHeading2: typography['heading-2'].fontSize,
  fontSizeHeading3: typography['heading-3'].fontSize,
  fontSizeHeading4: typography.title.fontSize,
  fontSizeHeading5: typography['body-md'].fontSize,

  // --- Font Weight (Notion: 700 belongs to headlines) ---
  fontWeightStrong: 700,

  // --- Padding ---
  paddingXXS: spacing.xxs,
  paddingXS: spacing.xs,
  paddingSM: spacing.sm,
  padding: spacing.md,
  paddingMD: spacing.md,
  paddingLG: spacing.lg,
  paddingXL: spacing.xl,
  paddingContentHorizontal: spacing.lg,
  paddingContentHorizontalSM: spacing.md,
  paddingContentHorizontalLG: spacing.xl,
  paddingContentVertical: spacing.md,
  paddingContentVerticalSM: spacing.sm,
  paddingContentVerticalLG: spacing.lg,

  // --- Margin ---
  marginXXS: spacing.xxs,
  marginXS: spacing.xs,
  marginSM: spacing.sm,
  margin: spacing.md,
  marginMD: spacing.md,
  marginLG: spacing.lg,
  marginXL: spacing.xl,
  marginXXL: spacing.xxl,

  // --- Elevation (Notion: many near-transparent layers, never a hard cast) ---
  // Level-0: resting hairline glow.
  boxShadowTertiary: '0 1px 2px rgba(15, 15, 15, 0.04)',
  // Level-1: cards that float above the canvas (feature-card-elevated).
  boxShadow:
    '0 1px 2px rgba(15, 15, 15, 0.03), 0 2px 4px rgba(15, 15, 15, 0.04), 0 4px 8px rgba(15, 15, 15, 0.03)',
  // Level-2: floating panels, dropdowns, popovers.
  boxShadowSecondary:
    '0 2px 4px rgba(15, 15, 15, 0.04), 0 4px 8px rgba(15, 15, 15, 0.05), 0 12px 24px rgba(15, 15, 15, 0.04)',

  // --- Control hover/active fills ---
  controlItemBgHover: colors['canvas-soft'],
  controlItemBgActive: colors['canvas-soft'],
  controlItemBgActiveHover: colors['canvas-soft'],
} as const;

/** Merge shared (sizing) + mode-specific (color) component tokens. */
function mergeComponentTokens(
  shared: Record<string, Record<string, unknown>>,
  modeColors: Record<string, Record<string, unknown>>,
): Record<string, Record<string, unknown>> {
  const allKeys = new Set([...Object.keys(shared), ...Object.keys(modeColors)]);
  const result: Record<string, Record<string, unknown>> = {};
  for (const key of allKeys) {
    result[key] = {...shared[key], ...modeColors[key]};
  }
  return result;
}

/**
 * Shared component tokens — sizing, spacing, border-radius that are IDENTICAL
 * across light and dark modes. Only color values belong in the mode-specific tokens.
 */
const sharedComponentTokens = {
  Button: {
    // Utility-button tight radius (8px) for the admin console; marketing pill
    // CTAs live in the `components` presets, not in antd Button.
    borderRadius: rounded.md,
    borderRadiusSM: rounded.sm,
    borderRadiusLG: rounded.md,
    controlHeight: 36,
    controlHeightSM: 28,
    controlHeightLG: 44,
    paddingInline: spacing.lg,
    paddingInlineSM: spacing.md,
    paddingInlineLG: spacing.xl,
    fontWeight: typography.button.fontWeight,
    primaryShadow: 'none',
    defaultShadow: 'none',
    dangerShadow: 'none',
  },
  Input: {
    // Form fields stay tight at rounded.xs (4px) per DESIGN.md.
    borderRadius: rounded.xs,
    borderRadiusLG: rounded.sm,
    borderRadiusSM: rounded.xs,
    controlHeight: 36,
  },
  Card: {
    borderRadiusLG: rounded.lg,
    paddingLG: spacing.lg,
  },
  Layout: {
    headerHeight: 64,
  },
  Table: {
    cellPaddingBlock: spacing.sm,
    cellPaddingInline: spacing.md,
  },
  Tabs: {
    horizontalItemPadding: `${spacing.sm}px 0`,
  },
  Modal: {
    borderRadiusLG: rounded.lg,
  },
  Tag: {
    borderRadiusSM: rounded.sm,
  },
  Tooltip: {
    borderRadius: rounded.sm,
  },
  Popover: {
    borderRadiusLG: rounded.lg,
  },
  Dropdown: {
    borderRadiusLG: rounded.lg,
  },
  Select: {
    borderRadius: rounded.xs,
    borderRadiusLG: rounded.sm,
    borderRadiusSM: rounded.xs,
    controlHeight: 36,
  },
  DatePicker: {
    borderRadius: rounded.xs,
    borderRadiusLG: rounded.sm,
    borderRadiusSM: rounded.xs,
    controlHeight: 36,
  },
  Segmented: {
    borderRadius: rounded.sm,
  },
  Steps: {
    iconFontSize: typography.eyebrow.fontSize,
    titleLineHeight: typography['body-sm'].lineHeight,
  },
  Collapse: {
    headerPadding: `${spacing.sm}px ${spacing.md}px`,
    contentPadding: `${spacing.md}px ${spacing.md}px`,
  },
  Alert: {
    defaultPadding: `${spacing.sm}px ${spacing.md}px`,
  },
  Notification: {
    borderRadiusLG: rounded.lg,
  },
  Avatar: {
    borderRadius: rounded.full,
  },
} as const;

/** Light-mode component color tokens. */
const lightComponentTokens = {
  Button: {
    primaryColor: colors['on-primary'],
    defaultBg: colors.canvas,
    defaultColor: colors.ink,
    defaultBorderColor: colors.hairline,
  },
  Input: {
    // Focus signal is the primary blue (DESIGN.md: active/focus signal = primary).
    activeBorderColor: colors.primary,
    hoverBorderColor: colors['ink-secondary'],
    colorBgContainer: colors.canvas,
    colorText: colors.ink,
  },
  Card: {
    colorBgContainer: colors.canvas,
  },
  Layout: {
    headerBg: colors.canvas,
    bodyBg: colors['canvas-soft'],
    siderBg: colors.canvas,
    triggerBg: colors.canvas,
  },
  Menu: {
    itemBg: colors.canvas,
    subMenuItemBg: colors.canvas,
    itemColor: colors['ink-muted'],
    // Active/selected items use the primary blue tint (focus/active signal).
    itemSelectedBg: '#e8f3fc',
    itemSelectedColor: colors.primary,
    itemHoverBg: colors['canvas-soft'],
    itemHoverColor: colors.ink,
    itemActiveBg: '#e8f3fc',
    horizontalItemSelectedColor: colors.primary,
    subMenuItemSelectedColor: colors.ink,
  },
  Table: {
    headerBg: colors['canvas-soft'],
    headerColor: colors['ink-secondary'],
    rowHoverBg: colors['canvas-soft'],
    borderColor: colors.hairline,
    headerSplitColor: colors.hairline,
  },
  Tabs: {
    // Active tab indicator is the primary blue.
    inkBarColor: colors.primary,
    itemSelectedColor: colors.ink,
    itemHoverColor: colors['ink-secondary'],
    itemColor: colors['ink-muted'],
  },
  Segmented: {
    // White pill on a warm-paper track.
    itemSelectedBg: colors.canvas,
    itemSelectedColor: colors.ink,
    trackBg: colors['canvas-soft'],
  },
  Switch: {
    handleBg: colors.canvas,
  },
  Breadcrumb: {
    itemColor: colors['ink-faint'],
    linkColor: colors['ink-muted'],
    separatorColor: colors['ink-faint'],
    lastItemColor: colors.ink,
  },
  Pagination: {
    itemActiveBg: colors.primary,
    itemActiveColorDisabled: colors.hairline,
    colorPrimary: colors.primary,
    colorPrimaryHover: '#0066c9',
  },
  Slider: {
    trackBg: colors.primary,
    trackHoverBg: '#0066c9',
    handleColor: colors.primary,
    handleActiveColor: colors.primary,
    dotActiveBorderColor: colors.primary,
  },
  Progress: {
    defaultColor: colors.primary,
  },
  Tree: {
    nodeHoverBg: colors['canvas-soft'],
    nodeSelectedBg: '#e8f3fc',
  },
  Collapse: {
    headerBg: colors.canvas,
    contentBg: colors.canvas,
  },
} as const;

/** Full light-mode Ant Design theme configuration. */
export const antdTheme = {
  token: {
    ...antdSeedTokens,
    ...antdMapTokens,
    ...sharedTokens,
  },
  components: mergeComponentTokens(sharedComponentTokens, lightComponentTokens),
} as const;

// ============================================================================
// Dark Mode Token Mapping
// ============================================================================
// DESIGN.md is a light-mode marketing analysis; dark mode is an admin-console
// adaptation. Colors are lifted ~15% for comfortable viewing, with the Notion
// blue brightened so it stays legible on dark surfaces.

/** Ant Design dark mode map tokens. */
export const antdDarkMapTokens = {
  // --- Seed overrides (dark) — brighten the Notion blue for dark bg ---
  colorPrimary: '#458fff',
  colorError: '#ff6b6b',
  colorWarning: '#ff9f40',

  // --- Text Colors (dark) — significantly brighter for readability ---
  colorText: '#f5f6f8',
  colorTextSecondary: '#bcc0cc',
  colorTextTertiary: '#9499a6',
  colorTextQuaternary: '#787e8c',

  // --- Background Colors (dark) — lifted ~15% for comfortable viewing ---
  colorBgContainer: '#2c323c',
  colorBgElevated: '#363d48',
  colorBgLayout: '#232830',
  colorBgSpotlight: '#232830',
  colorBgMask: 'rgba(0,0,0,0.6)',

  // --- Fill Colors (dark) ---
  colorFill: 'rgba(255,255,255,0.12)',
  colorFillSecondary: 'rgba(255,255,255,0.09)',
  colorFillTertiary: 'rgba(255,255,255,0.06)',
  colorFillQuaternary: 'rgba(255,255,255,0.04)',

  // --- Border Colors (dark) — clearly visible ---
  colorBorder: '#4a5260',
  colorBorderSecondary: '#3c434e',

  // --- Link (dark) ---
  colorLink: '#6badff',
  colorLinkHover: '#8dc3ff',
  colorLinkActive: '#458fff',

  // --- Primary Derivations (dark) ---
  colorPrimaryBg: 'rgba(69,143,255,0.15)',
  colorPrimaryBgHover: 'rgba(69,143,255,0.25)',
  colorPrimaryBorder: '#458fff',
  colorPrimaryBorderHover: '#6ba3ff',
  colorPrimaryHover: '#6ba3ff',
  colorPrimaryActive: '#2b6fcc',
  colorPrimaryTextHover: '#6ba3ff',
  colorPrimaryText: '#f5f6f8',
  colorPrimaryTextActive: '#2b6fcc',

  // --- Info Derivations (dark) ---
  colorInfoBg: 'rgba(69,143,255,0.20)',
  colorInfoBgHover: 'rgba(69,143,255,0.30)',
  colorInfoBorder: '#458fff',
  colorInfoBorderHover: '#6badff',
  colorInfoHover: '#6badff',
  colorInfoActive: '#8dc3ff',
  colorInfoTextHover: '#6badff',
  colorInfoText: '#458fff',
  colorInfoTextActive: '#8dc3ff',

  // --- Success Derivations (dark) ---
  colorSuccessBg: 'rgba(26,174,57,0.20)',
  colorSuccessBgHover: 'rgba(26,174,57,0.30)',
  colorSuccessBorder: '#39bf45',
  colorSuccessBorderHover: '#5bd465',
  colorSuccessHover: '#5bd465',
  colorSuccessActive: '#7de885',
  colorSuccessTextHover: '#5bd465',
  colorSuccessText: '#39bf45',
  colorSuccessTextActive: '#7de885',

  // --- Warning Derivations (dark) ---
  colorWarningBg: 'rgba(255,159,64,0.20)',
  colorWarningBgHover: 'rgba(255,159,64,0.30)',
  colorWarningBorder: '#ff9f40',
  colorWarningBorderHover: '#ffb266',
  colorWarningHover: '#ffb266',
  colorWarningActive: '#ffc58a',
  colorWarningTextHover: '#ffb266',
  colorWarningText: '#ff9f40',
  colorWarningTextActive: '#ffc58a',

  // --- Error Derivations (dark) ---
  colorErrorBg: 'rgba(229,72,77,0.20)',
  colorErrorBgHover: 'rgba(229,72,77,0.30)',
  colorErrorBorder: '#ff6b6b',
  colorErrorBorderHover: '#ff8585',
  colorErrorHover: '#ff8585',
  colorErrorActive: '#ff9d9d',
  colorErrorTextHover: '#ff8585',
  colorErrorText: '#ff6b6b',
  colorErrorTextActive: '#ff9d9d',
} as const;

/** Dark-mode component color tokens. */
const darkComponentTokens = {
  Button: {
    defaultBg: '#2c323c',
    defaultColor: '#f5f6f8',
    defaultBorderColor: '#4a5260',
    primaryColor: '#ffffff',
    primaryShadow: 'none',
    defaultShadow: 'none',
    dangerShadow: 'none',
  },
  Input: {
    colorBgContainer: '#2c323c',
    colorText: '#f5f6f8',
    activeBorderColor: '#458fff',
    hoverBorderColor: '#bcc0cc',
  },
  Card: {
    colorBgContainer: '#2c323c',
  },
  Layout: {
    headerBg: '#2c323c',
    bodyBg: '#232830',
    siderBg: '#2c323c',
    triggerBg: '#2c323c',
  },
  Menu: {
    itemBg: '#2c323c',
    subMenuItemBg: '#2c323c',
    itemColor: '#bcc0cc',
    itemSelectedBg: 'rgba(69,143,255,0.20)',
    itemSelectedColor: '#f5f6f8',
    itemHoverBg: '#363d48',
    itemHoverColor: '#f5f6f8',
    itemActiveBg: 'rgba(69,143,255,0.20)',
    horizontalItemSelectedColor: '#f5f6f8',
    subMenuItemSelectedColor: '#f5f6f8',
  },
  Table: {
    headerBg: '#2c323c',
    headerColor: '#f5f6f8',
    rowHoverBg: 'rgba(255,255,255,0.06)',
    borderColor: '#4a5260',
    headerSplitColor: '#4a5260',
  },
  Tabs: {
    inkBarColor: '#f5f6f8',
    itemSelectedColor: '#f5f6f8',
    itemHoverColor: '#f5f6f8',
    itemColor: '#bcc0cc',
  },
  Segmented: {
    itemSelectedBg: '#f5f6f8',
    itemSelectedColor: '#232830',
    trackBg: 'rgba(255,255,255,0.12)',
  },
  Switch: {
    handleBg: '#2c323c',
  },
  Breadcrumb: {
    itemColor: '#9499a6',
    linkColor: '#bcc0cc',
    separatorColor: '#9499a6',
    lastItemColor: '#f5f6f8',
  },
  Pagination: {
    itemActiveBg: '#f5f6f8',
    itemActiveColorDisabled: '#232830',
    colorPrimary: '#458fff',
    colorPrimaryHover: '#6ba3ff',
  },
  Slider: {
    trackBg: '#f5f6f8',
    trackHoverBg: '#f5f6f8',
    handleColor: '#f5f6f8',
    handleActiveColor: '#f5f6f8',
    dotActiveBorderColor: '#f5f6f8',
  },
  Progress: {
    defaultColor: '#f5f6f8',
  },
  Tree: {
    nodeHoverBg: 'rgba(255,255,255,0.06)',
    nodeSelectedBg: 'rgba(69,143,255,0.20)',
  },
  Collapse: {
    headerBg: '#2c323c',
    contentBg: '#232830',
  },
} as const;

/** Full dark mode theme configuration. */
export const antdDarkTheme = {
  token: {
    ...antdSeedTokens,
    ...sharedTokens,
    ...antdDarkMapTokens,
  },
  components: mergeComponentTokens(sharedComponentTokens, darkComponentTokens),
} as const;
