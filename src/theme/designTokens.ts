/**
 * Flexmodel Design Tokens
 *
 * All design values derived from DESIGN.md (Airtable-design-analysis).
 * This is the single source of truth for all visual properties.
 *
 * Token reference syntax:
 * - {colors.*}    → Color values
 * - {typography.*} → Font stacks, sizes, weights, line heights
 * - {rounded.*}   → Border radius values
 * - {spacing.*}   → Spacing scale
 * - {components.*} → Component-level presets
 */

// ============================================================================
// Colors
// ============================================================================
export const colors = {
  /** Primary brand color — near-black CTA background, h1/h2 display type */
  primary: '#181d26',
  /** Primary active/press state */
  'primary-active': '#0d1218',
  /** Strongest text — same hex as primary (same role at type layer) */
  ink: '#181d26',
  /** Default running-text color */
  body: '#333840',
  /** Footer links, breadcrumbs, captions */
  muted: '#41454d',
  /** 1px border tone for inputs, table dividers, secondary-button outlines */
  hairline: '#dddddd',
  /** 1px outline on disabled secondary buttons */
  'border-strong': '#9297a0',
  /** Default page surface */
  canvas: '#ffffff',
  /** Tabbed feature cards, featured pricing tier */
  'surface-soft': '#f8fafc',
  /** Light gray CTA banner */
  'surface-strong': '#e0e2e6',
  /** Dark navy CTA cards */
  'surface-dark': '#181d26',
  /** Articles-page hero base */
  'surface-dark-elevated': '#1d1f25',
  /** Signature full-bleed coral card */
  'signature-coral': '#aa2d00',
  /** Signature full-bleed forest card */
  'signature-forest': '#0a2e0e',
  /** Cream callout band */
  'signature-cream': '#f5e9d4',
  /** Demo-grid warm pastel surface */
  'signature-peach': '#fcab79',
  /** Demo-grid cool pastel surface */
  'signature-mint': '#a8d8c4',
  /** Demo-grid accent surface */
  'signature-yellow': '#f4d35e',
  /** Demo-grid accent surface */
  'signature-mustard': '#d9a441',
  /** Text on primary buttons and dark surfaces */
  'on-primary': '#ffffff',
  /** Text on dark surfaces */
  'on-dark': '#ffffff',
  /** Inline body links and anchor text */
  link: '#1b61c9',
  /** Link active/press state */
  'link-active': '#1a3866',
  /** Info badges, focused-input outline */
  info: '#254fad',
  /** Info border */
  'info-border': '#458fff',
  /** Confirmation states */
  success: '#006400',
  /** Success border */
  'success-border': '#39bf45',
  /** Pricing-page ink — slightly different from editorial ink */
  'pricing-ink': '#1d1f25',
} as const;

export type ColorToken = keyof typeof colors;

// ============================================================================
// Typography
// ============================================================================
export const typography = {
  'display-xl': {
    fontFamily: 'Inter Display, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 48,
    fontWeight: 500,
    lineHeight: 1.1,
    letterSpacing: 0,
  },
  'display-lg': {
    fontFamily: 'Inter Display, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 40,
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: 0,
  },
  'display-md': {
    fontFamily: 'Inter Display, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 32,
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: 0,
  },
  'title-lg': {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 24,
    fontWeight: 400,
    lineHeight: 1.35,
    letterSpacing: 0.12,
  },
  'title-md': {
    fontFamily: 'Inter Display, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 20,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  'title-sm': {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: 0,
  },
  'label-md': {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: 0,
  },
  button: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: 0,
  },
  'body-md': {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.25,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.35,
    letterSpacing: 0.16,
  },
  legal: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 13.12,
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: 0,
  },
  'pricing-display': {
    fontFamily: 'Inter Display, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 44.8,
    fontWeight: 475,
    lineHeight: 1.1,
    letterSpacing: 0,
  },
  'pricing-section': {
    fontFamily: 'Inter Display, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 28,
    fontWeight: 475,
    lineHeight: 1.2,
    letterSpacing: 0,
  },
  'pricing-card-title': {
    fontFamily: 'Inter Display, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 20,
    fontWeight: 475,
    lineHeight: 1.3,
    letterSpacing: 0,
  },
} as const;

export type TypographyToken = keyof typeof typography;

// ============================================================================
// Border Radius
// ============================================================================
export const rounded = {
  /** Cookie-consent and legal CTA buttons — system-required surfaces */
  xs: 2,
  /** Text inputs, small inline buttons */
  sm: 6,
  /** Secondary content cards, article cards, cream callouts */
  md: 10,
  /** Primary CTA buttons, signature surface cards, tabbed feature cards */
  lg: 12,
  /** Pricing-page CTA buttons (sub-system only) */
  pill: 9999,
  /** Circular icon buttons, avatar surfaces */
  full: 9999,
} as const;

export type RoundedToken = keyof typeof rounded;

// ============================================================================
// Spacing
// ============================================================================
export const spacing = {
  /** 4px — minimum spacing unit */
  xxs: 4,
  /** 8px */
  xs: 8,
  /** 12px */
  sm: 12,
  /** 16px */
  md: 16,
  /** 24px — gutter between cards in 3-up grids */
  lg: 24,
  /** 32px — tabbed feature cards, pricing tier cards internal padding */
  xl: 32,
  /** 48px — signature card internal padding, breathing room */
  xxl: 48,
  /** 96px — universal vertical rhythm constant between major bands */
  section: 96,
} as const;

export type SpacingToken = keyof typeof spacing;

// ============================================================================
// Components
// ============================================================================
export const components = {
  'button-primary': {
    backgroundColor: colors.primary,
    textColor: colors['on-primary'],
    typography: typography.button,
    rounded: rounded.lg,
    padding: '16px 24px',
  },
  'button-primary-active': {
    backgroundColor: colors['primary-active'],
    textColor: colors['on-primary'],
    rounded: rounded.lg,
  },
  'button-secondary': {
    backgroundColor: colors.canvas,
    textColor: colors.ink,
    typography: typography.button,
    rounded: rounded.lg,
    padding: '16px 24px',
  },
  'button-secondary-on-dark': {
    backgroundColor: colors.canvas,
    textColor: colors.ink,
    typography: typography.button,
    rounded: rounded.lg,
    padding: '16px 24px',
  },
  'button-legal': {
    backgroundColor: colors.link,
    textColor: colors['on-primary'],
    typography: typography.legal,
    rounded: rounded.xs,
    padding: '12px 10px',
  },
  'button-icon-circular': {
    backgroundColor: colors.canvas,
    textColor: colors.ink,
    rounded: rounded.full,
    size: 40,
  },
  'button-pricing-pill': {
    backgroundColor: colors.canvas,
    textColor: colors['pricing-ink'],
    typography: typography.button,
    rounded: rounded.pill,
    padding: '12px 24px',
  },
  'text-link': {
    backgroundColor: 'transparent',
    textColor: colors.link,
    typography: typography['body-md'],
  },
  'top-nav': {
    backgroundColor: colors.canvas,
    textColor: colors.ink,
    typography: typography['body-md'],
    height: 64,
  },
  'hero-band': {
    backgroundColor: colors.canvas,
    textColor: colors.ink,
    typography: typography['display-lg'],
    padding: 96,
  },
  'signature-coral-card': {
    backgroundColor: colors['signature-coral'],
    textColor: colors['on-primary'],
    typography: typography['display-md'],
    rounded: rounded.lg,
    padding: 48,
  },
  'signature-forest-card': {
    backgroundColor: colors['signature-forest'],
    textColor: colors['on-primary'],
    typography: typography['display-md'],
    rounded: rounded.lg,
    padding: 48,
  },
  'hero-card-dark': {
    backgroundColor: colors['surface-dark'],
    textColor: colors['on-dark'],
    typography: typography['display-md'],
    rounded: rounded.lg,
    padding: 48,
  },
  'feature-card-tabbed': {
    backgroundColor: colors['surface-soft'],
    textColor: colors.ink,
    typography: typography['title-lg'],
    rounded: rounded.lg,
    padding: 32,
  },
  'cream-callout-card': {
    backgroundColor: colors['signature-cream'],
    textColor: colors.ink,
    typography: typography['title-lg'],
    rounded: rounded.md,
    padding: 24,
  },
  'demo-grid-card': {
    backgroundColor: colors.canvas,
    textColor: colors.ink,
    typography: typography['label-md'],
    rounded: rounded.md,
    padding: 16,
  },
  'logo-strip': {
    backgroundColor: colors.canvas,
    textColor: colors.muted,
    typography: typography['body-md'],
    padding: 32,
  },
  'article-card': {
    backgroundColor: colors.canvas,
    textColor: colors.ink,
    typography: typography['title-sm'],
    rounded: rounded.md,
    padding: 16,
  },
  'topic-filter-rail': {
    backgroundColor: colors.canvas,
    textColor: colors.body,
    typography: typography['body-md'],
    width: 240,
  },
  'text-input': {
    backgroundColor: colors.canvas,
    textColor: colors.ink,
    typography: typography['body-md'],
    rounded: rounded.sm,
    padding: '12px 16px',
    height: 44,
  },
  'text-input-focus': {
    backgroundColor: colors.canvas,
    textColor: colors.ink,
    rounded: rounded.sm,
  },
  'pricing-tier-card': {
    backgroundColor: colors.canvas,
    textColor: colors['pricing-ink'],
    typography: typography['pricing-card-title'],
    rounded: rounded.md,
    padding: 32,
  },
  'pricing-tier-card-featured': {
    backgroundColor: colors['surface-soft'],
    textColor: colors['pricing-ink'],
    typography: typography['pricing-card-title'],
    rounded: rounded.md,
    padding: 32,
  },
  'pricing-comparison-row': {
    backgroundColor: colors.canvas,
    textColor: colors.body,
    typography: typography['body-md'],
    padding: 12,
  },
  'cta-band-light': {
    backgroundColor: colors['surface-strong'],
    textColor: colors.ink,
    typography: typography['display-md'],
    rounded: rounded.lg,
    padding: 48,
  },
  footer: {
    backgroundColor: colors.canvas,
    textColor: colors.body,
    typography: typography['body-md'],
    padding: 64,
  },
} as const;

export type ComponentToken = keyof typeof components;

// ============================================================================
// Ant Design v6 Token Mapping
// ============================================================================

/** Ant Design seed tokens derived from DESIGN.md */
export const antdSeedTokens = {
  // Primary — near-black, per DESIGN.md: "primary is #181d26, NOT link-blue"
  colorPrimary: colors.primary,
  // Semantic colors
  colorSuccess: colors.success,
  colorInfo: colors.info,
  colorWarning: '#d9a441', // derived from signature-mustard (closest warning tone)
  colorError: colors['signature-coral'],
  // Text base — strongest text is ink
  colorTextBase: colors.ink,
  // Background base — white canvas
  colorBgBase: colors.canvas,
  // Base font size — body-md is 14px
  fontSize: 14,
  // Base border radius — DESIGN.md sm (6px) for inputs
  borderRadius: 6,
  // Font family — Inter as Haas substitute
  fontFamily: typography['body-md'].fontFamily,
} as const;

/** Ant Design light-mode color map tokens */
export const antdMapTokens = {
  // --- Text Colors ---
  colorText: colors.body,
  colorTextSecondary: colors.muted,
  colorTextTertiary: colors.muted,
  colorTextQuaternary: colors['border-strong'],

  // --- Background Colors ---
  colorBgContainer: colors.canvas,
  colorBgElevated: colors.canvas,
  colorBgLayout: colors.canvas,
  colorBgSpotlight: colors['surface-dark'],
  colorBgMask: 'rgba(0,0,0,0.45)',

  // --- Fill Colors ---
  colorFill: colors['surface-strong'],
  colorFillSecondary: colors['surface-strong'],
  colorFillTertiary: colors['surface-soft'],
  colorFillQuaternary: colors['surface-soft'],

  // --- Border Colors ---
  colorBorder: colors.hairline,
  colorBorderSecondary: colors.hairline,

  // --- Link ---
  colorLink: colors.link,
  colorLinkHover: colors.link,
  colorLinkActive: colors['link-active'],

  // --- Primary Derivations ---
  colorPrimaryBg: '#e6f4ff',
  colorPrimaryBgHover: '#bae0ff',
  colorPrimaryBorder: colors.primary,
  colorPrimaryBorderHover: colors.primary,
  colorPrimaryHover: colors.body,
  colorPrimaryActive: colors['primary-active'],
  colorPrimaryTextHover: colors.body,
  colorPrimaryText: colors.primary,
  colorPrimaryTextActive: colors['primary-active'],

  // --- Info Derivations ---
  colorInfoBg: '#e6f4ff',
  colorInfoBgHover: '#bae0ff',
  colorInfoBorder: colors['info-border'],
  colorInfoBorderHover: colors['info-border'],
  colorInfoHover: colors.info,
  colorInfoActive: colors.info,
  colorInfoTextHover: colors.info,
  colorInfoText: colors.info,
  colorInfoTextActive: colors.info,

  // --- Success Derivations ---
  colorSuccessBg: '#f6ffed',
  colorSuccessBgHover: '#d9f7be',
  colorSuccessBorder: colors['success-border'],
  colorSuccessBorderHover: colors['success-border'],
  colorSuccessHover: colors.success,
  colorSuccessActive: colors.success,
  colorSuccessTextHover: colors.success,
  colorSuccessText: colors.success,
  colorSuccessTextActive: colors.success,

  // --- Warning Derivations ---
  colorWarningBg: '#fffbe6',
  colorWarningBgHover: '#fff1b8',
  colorWarningBorder: '#faad14',
  colorWarningBorderHover: '#faad14',
  colorWarningHover: '#d48806',
  colorWarningActive: '#ad6800',
  colorWarningTextHover: '#d48806',
  colorWarningText: '#ad6800',
  colorWarningTextActive: '#ad6800',

  // --- Error Derivations ---
  colorErrorBg: '#fff2f0',
  colorErrorBgHover: '#ffccc7',
  colorErrorBorder: colors['signature-coral'],
  colorErrorBorderHover: colors['signature-coral'],
  colorErrorHover: '#cf1322',
  colorErrorActive: '#a8071a',
  colorErrorTextHover: '#cf1322',
  colorErrorText: colors['signature-coral'],
  colorErrorTextActive: '#a8071a',
} as const;

/**
 * Shared non-color tokens — identical across light and dark modes.
 * Ensures spacing, sizing, typography, and border radius are unified.
 */
export const sharedTokens = {
  // --- Border Radius ---
  borderRadiusXS: rounded.xs,
  borderRadiusSM: rounded.sm,
  borderRadius: rounded.md,
  borderRadiusLG: rounded.lg,
  borderRadiusOuter: rounded.lg,

  // --- Control ---
  controlHeight: 44, // matches text-input height
  controlHeightSM: 32,
  controlHeightLG: 48,
  controlHeightXS: 24,

  // --- Line Height ---
  lineHeight: typography['body-md'].lineHeight,
  lineHeightSM: 1.2,
  lineHeightLG: 1.4,
  lineHeightHeading1: typography['display-lg'].lineHeight,
  lineHeightHeading2: typography['display-md'].lineHeight,
  lineHeightHeading3: typography['title-lg'].lineHeight,
  lineHeightHeading4: typography['title-md'].lineHeight,
  lineHeightHeading5: typography['title-sm'].lineHeight,

  // --- Font Sizes ---
  fontSizeSM: 12,
  fontSizeLG: typography['label-md'].fontSize,
  fontSizeXL: typography['title-sm'].fontSize,
  fontSizeHeading1: typography['display-lg'].fontSize,
  fontSizeHeading2: typography['display-md'].fontSize,
  fontSizeHeading3: typography['title-lg'].fontSize,
  fontSizeHeading4: typography['title-md'].fontSize,
  fontSizeHeading5: typography['title-sm'].fontSize,

  // --- Font Weight ---
  fontWeightStrong: 500,

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
} as const;

/** Merge shared (sizing) + mode-specific (color) component tokens */
function mergeComponentTokens(
  shared: Record<string, Record<string, unknown>>,
  colors: Record<string, Record<string, unknown>>,
): Record<string, Record<string, unknown>> {
  const allKeys = new Set([...Object.keys(shared), ...Object.keys(colors)]);
  const result: Record<string, Record<string, unknown>> = {};
  for (const key of allKeys) {
    result[key] = { ...shared[key], ...colors[key] };
  }
  return result;
}

/**
 * Shared component tokens — sizing, spacing, border-radius that are IDENTICAL
 * across light and dark modes. Only color values belong in the mode-specific tokens.
 */
const sharedComponentTokens = {
  Button: {
    borderRadius: rounded.lg,
    borderRadiusSM: rounded.sm,
    borderRadiusLG: rounded.lg,
    controlHeight: 44,
    controlHeightSM: 32,
    controlHeightLG: 48,
    paddingInline: spacing.lg,
    paddingInlineSM: spacing.md,
    paddingInlineLG: spacing.xl,
    fontWeight: typography.button.fontWeight,
    primaryShadow: '0 2px 0 rgba(27,97,201,0.02)',
  },
  Input: {
    borderRadius: rounded.sm,
    borderRadiusLG: rounded.md,
    borderRadiusSM: rounded.xs,
    controlHeight: 44,
  },
  Card: {
    borderRadiusLG: rounded.lg,
    paddingLG: spacing.xl,
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
    borderRadius: rounded.sm,
    borderRadiusLG: rounded.md,
    borderRadiusSM: rounded.xs,
    controlHeight: 44,
  },
  DatePicker: {
    borderRadius: rounded.sm,
    borderRadiusLG: rounded.md,
    borderRadiusSM: rounded.xs,
    controlHeight: 44,
  },
  Segmented: {
    borderRadius: rounded.sm,
  },
  Steps: {
    iconFontSize: typography['label-md'].fontSize,
    titleLineHeight: typography['body-md'].lineHeight,
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

/** Light-mode component color tokens */
const lightComponentTokens = {
  Button: {
    primaryColor: colors['on-primary'],
    defaultBg: colors.canvas,
    defaultColor: colors.ink,
    defaultBorderColor: colors.hairline,
  },
  Input: {
    activeBorderColor: colors['info-border'],
    hoverBorderColor: colors.ink,
    colorBgContainer: colors.canvas,
    colorText: colors.ink,
  },
  Card: {
    colorBgContainer: colors.canvas,
  },
  Layout: {
    headerBg: colors.canvas,
    bodyBg: colors.canvas,
    siderBg: colors.canvas,
    triggerBg: colors.canvas,
  },
  Menu: {
    itemBg: colors.canvas,
    subMenuItemBg: colors.canvas,
    itemColor: colors.body,
    itemSelectedBg: colors['surface-soft'],
    itemSelectedColor: colors.ink,
    itemHoverBg: colors['surface-soft'],
    itemHoverColor: colors.ink,
    itemActiveBg: colors['surface-soft'],
    horizontalItemSelectedColor: colors.ink,
    subMenuItemSelectedColor: colors.ink,
  },
  Table: {
    headerBg: colors.canvas,
    headerColor: colors.ink,
    rowHoverBg: colors['surface-soft'],
    borderColor: colors.hairline,
    headerSplitColor: colors.hairline,
  },
  Tabs: {
    inkBarColor: colors.ink,
    itemSelectedColor: colors.ink,
    itemHoverColor: colors.ink,
    itemColor: colors.body,
  },
  Segmented: {
    itemSelectedBg: colors.ink,
    itemSelectedColor: colors['on-primary'],
    trackBg: colors['surface-strong'],
  },
  Switch: {
    handleBg: colors.canvas,
  },
  Breadcrumb: {
    itemColor: colors.muted,
    linkColor: colors.body,
    separatorColor: colors.muted,
    lastItemColor: colors.ink,
  },
  Pagination: {
    itemActiveBg: colors.primary,
    itemActiveColorDisabled: colors['on-primary'],
    colorPrimary: colors['on-primary'],
    colorPrimaryHover: colors['on-primary'],
  },
  Slider: {
    trackBg: colors.primary,
    trackHoverBg: colors.primary,
    handleColor: colors.primary,
    handleActiveColor: colors.primary,
    dotActiveBorderColor: colors.primary,
  },
  Progress: {
    defaultColor: colors.primary,
  },
  Tree: {
    nodeHoverBg: colors['surface-soft'],
    nodeSelectedBg: colors['surface-soft'],
  },
  Collapse: {
    headerBg: colors['surface-soft'],
    contentBg: colors.canvas,
  },
} as const;

/** Full light-mode Ant Design theme configuration */
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

/** Ant Design dark mode map tokens */
export const antdDarkMapTokens = {
  // --- Seed overrides (dark) — original near-black primary is invisible on dark bg ---
  colorPrimary: '#6badff',
  colorError: '#ff6b6b',

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
  colorPrimaryBg: 'rgba(255,255,255,0.12)',
  colorPrimaryBgHover: 'rgba(255,255,255,0.16)',
  colorPrimaryBorder: '#787e8c',
  colorPrimaryBorderHover: '#bcc0cc',
  colorPrimaryHover: '#787e8c',
  colorPrimaryActive: '#bcc0cc',
  colorPrimaryTextHover: '#bcc0cc',
  colorPrimaryText: '#f5f6f8',
  colorPrimaryTextActive: '#bcc0cc',

  // --- Info Derivations (dark) ---
  colorInfoBg: 'rgba(37,79,173,0.20)',
  colorInfoBgHover: 'rgba(37,79,173,0.30)',
  colorInfoBorder: colors['info-border'],
  colorInfoBorderHover: '#6badff',
  colorInfoHover: '#6badff',
  colorInfoActive: '#8dc3ff',
  colorInfoTextHover: '#6badff',
  colorInfoText: colors['info-border'],
  colorInfoTextActive: '#8dc3ff',

  // --- Success Derivations (dark) ---
  colorSuccessBg: 'rgba(0,100,0,0.20)',
  colorSuccessBgHover: 'rgba(0,100,0,0.30)',
  colorSuccessBorder: colors['success-border'],
  colorSuccessBorderHover: '#5bd465',
  colorSuccessHover: '#5bd465',
  colorSuccessActive: '#7de885',
  colorSuccessTextHover: '#5bd465',
  colorSuccessText: colors['success-border'],
  colorSuccessTextActive: '#7de885',
} as const;

/** Dark-mode component color tokens */
const darkComponentTokens = {
  Button: {
    defaultBg: '#2c323c',
    defaultColor: '#f5f6f8',
    defaultBorderColor: '#4a5260',
    primaryBg: '#6badff',
    primaryColor: '#ffffff',
    primaryHoverBg: '#8dc3ff',
  },
  Input: {
    colorBgContainer: '#2c323c',
    colorText: '#f5f6f8',
    activeBorderColor: colors['info-border'],
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
    itemSelectedBg: '#363d48',
    itemSelectedColor: '#f5f6f8',
    itemHoverBg: '#363d48',
    itemHoverColor: '#f5f6f8',
    itemActiveBg: '#363d48',
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
    colorPrimary: '#232830',
    colorPrimaryHover: '#232830',
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
    nodeSelectedBg: 'rgba(255,255,255,0.10)',
  },
  Collapse: {
    headerBg: '#2c323c',
    contentBg: '#232830',
  },
} as const;

/** Full dark mode theme configuration */
export const antdDarkTheme = {
  token: {
    ...antdSeedTokens,
    ...sharedTokens,
    ...antdDarkMapTokens,
  },
  components: mergeComponentTokens(sharedComponentTokens, darkComponentTokens),
} as const;
