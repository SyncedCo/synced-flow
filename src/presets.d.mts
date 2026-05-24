export type SyncedFluidThemePreset = {
  fonts?: Record<string, string>
  colours?: Record<string, string>
  darkColours?: Record<string, string>
  radii?: Record<string, string>
  layout?: {
    containerMax?: string
    gutter?: string
    columns?: number
  }
  components?: Record<string, Record<string, string>>
}

export declare const themePresets: {
  synced: SyncedFluidThemePreset
  neutralSaas: SyncedFluidThemePreset
  editorial: SyncedFluidThemePreset
  darkApp: SyncedFluidThemePreset
}

export declare const presetNames: string[]
