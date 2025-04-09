// Scenario types
export type Scenario = "BASE" | "S1" | "S2" | "S3" | "S4"

// Alert types
export type AlertType = "Critical" | "Capacity" | "Supporting"

// Alert summary
export interface AlertSummary {
  critical: number
  capacity: number
  supporting: number
}

// Material item
export interface MaterialItem {
  id: string
  name: string
  type: "FG" | "Intermediate" | "Raw"
}

// Alert data
export interface AlertData {
  id: number
  type: AlertType
  description: string
  week: string
  item: string
  itemName?: string
  plant?: string
}

// KPI data
export interface KpiData {
  totalDemand: number
  fillRate: number
  plannedInventory: number
  onHandInventory: number
  productionOrderQty: number
  totalPlannedPurchases: number
  unconsumedForecast: number
  forecastError: number
}

// Time series data point
export interface TimeSeriesDataPoint {
  week: string
  demand: number
  supply: number
  inventory: number
  fillRate?: number
  production?: number
  purchases?: number
}

// Production data point
export interface ProductionDataPoint {
  week: string
  [key: string]: number | string // Material IDs as keys with production quantities
}

// Raw data row
export interface RawDataRow {
  [key: string]: string | number | undefined // Column names as keys
  Week?: string
  Material?: string
  Demand?: number
  Supply?: number
  Inventory?: number
  FillRate?: string
}

// Filter options
export interface FilterOptions {
  materials: string[] // Material IDs
  plants: string[]
  alertTypes: AlertType[]
  minFillRate: number
}

// Scenario data
export interface ScenarioData {
  timeSeriesData: TimeSeriesDataPoint[]
  productionData: ProductionDataPoint[]
  inventoryData: Record<string, number[]> // Material ID -> inventory levels by week
  alertData: AlertData[]
  kpiData: Record<string, KpiData> // Week -> KPI data
  rawData: RawDataRow[]
}
