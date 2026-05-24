type TokenMap = Record<string, string>

export type SyncedFluidTheme = {
  /**
   * Project font stacks. Values should be complete CSS font-family values.
   */
  fonts?: Partial<Record<'sans' | 'display' | 'mono', string>>
  /**
   * Semantic colour tokens. Use OKLCH where possible.
   */
  colours?: TokenMap
  /**
   * Semantic colour overrides for .sf-theme-dark or [data-sf-theme="dark"].
   */
  darkColours?: TokenMap
  /**
   * Radius scale overrides such as md, lg, xl, full.
   */
  radii?: TokenMap
  /**
   * Layout-level tokens.
   */
  layout?: {
    containerMax?: string
    gutter?: string
    columns?: number
  }
  /**
   * Component-level token overrides.
   */
  components?: {
    button?: {
      radius?: string
      blockSize?: string
      paddingInline?: string
    }
    card?: {
      radius?: string
      padding?: string
      shadow?: string
    }
    input?: {
      radius?: string
      blockSize?: string
    }
  }
}

export type SyncedFluidConfig = {
  /**
   * Directory used to resolve scan and output paths. Defaults to the current
   * working directory.
   */
  cwd?: string
  /**
   * Source directories that the CLI scans for class tokens.
   */
  scan?: string[]
  /**
   * Class tokens to always generate when they are composed dynamically.
   */
  safelist?: string[]
  /**
   * Generated CSS output file.
   */
  out?: string
  /**
   * Project token overrides emitted into the generated CSS.
   */
  theme?: SyncedFluidTheme
  /**
   * Include reset, base, layout, and component CSS in the generated file.
   * Most projects should import @synced/fluid/styles.css and leave this false.
   */
  includeCore?: boolean
  /**
   * Enable breakpoint-style variants such as sm:, md:, lg:, and xl:.
   * Leave false for strict fluid projects; enable only during migrations.
   */
  responsiveVariants?: boolean
  /**
   * Fail the CLI when unsupported class tokens are detected.
   */
  failOnUnsupported?: boolean
  /**
   * Suppress non-critical CLI warnings.
   */
  quiet?: boolean
}

export function defineConfig(config: SyncedFluidConfig): SyncedFluidConfig {
  return config
}
