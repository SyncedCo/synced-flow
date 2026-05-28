export type SyncedFlowThemePreset = {
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
  synced: SyncedFlowThemePreset
  neutralSaas: SyncedFlowThemePreset
  editorial: SyncedFlowThemePreset
  darkApp: SyncedFlowThemePreset
}

export declare const presetNames: string[]
