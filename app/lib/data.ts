import type { Scenario, ScenarioData, FilterOptions } from "../types"
import {
  timeSeriesData,
  productionData,
  inventoryData,
  rawData,
  kpiData,
  alertsData as alertsDataSource,
} from "../data/dashboard-data"

// This function now uses the collated data instead of fetching from an API
export async function fetchScenarioData(
  scenario: Scenario,
  filterOptions: FilterOptions,
  weekRange: [number, number],
): Promise<ScenarioData> {
  // Get data for the selected scenario from our data file
  const scenarioTimeSeriesData = timeSeriesData[scenario] || timeSeriesData.BASE
  const scenarioProductionData = productionData[scenario] || productionData.BASE
  const scenarioInventoryData = inventoryData[scenario] || inventoryData.BASE
  const scenarioRawData = rawData[scenario] || rawData.BASE
  const scenarioKpiData = kpiData[scenario] || kpiData.BASE

  // Filter by week range
  const filteredTimeSeriesData = scenarioTimeSeriesData.filter(
    (d) => Number.parseInt(d.week) >= weekRange[0] && Number.parseInt(d.week) <= weekRange[1],
  )

  // Filter production data by week range
  const filteredProductionData = scenarioProductionData.filter(
    (d) => Number.parseInt(d.week) >= weekRange[0] && Number.parseInt(d.week) <= weekRange[1],
  )

  // Filter production data by selected materials if specified
  const materialFilteredProductionData =
    filterOptions.materials.length > 0
      ? filteredProductionData.map((weekData) => {
          // Create a new object with only the week and selected materials
          const filteredWeekData: any = { week: weekData.week }

          // Only include the selected materials
          filterOptions.materials.forEach((materialId) => {
            if (materialId in weekData) {
              filteredWeekData[materialId] = weekData[materialId]
            }
          })

          return filteredWeekData
        })
      : filteredProductionData

  // Filter by material if specified
  const filteredRawData =
    filterOptions.materials.length > 0
      ? scenarioRawData.filter((d) => {
          // Check if the Material property exists and is in the filtered materials
          return d.Material && filterOptions.materials.includes(d.Material as string)
        })
      : scenarioRawData

  // Filter inventory data by selected materials if specified
  const filteredInventoryData = { ...scenarioInventoryData }
  if (filterOptions.materials.length > 0) {
    // Only keep inventory data for selected materials
    Object.keys(filteredInventoryData).forEach((materialId) => {
      if (!filterOptions.materials.includes(materialId)) {
        delete filteredInventoryData[materialId]
      }
    })
  }

  // Filter by fill rate if specified
  const filteredByFillRate = filteredTimeSeriesData.filter((d) => (d.fillRate ?? 0) >= filterOptions.minFillRate)

  // Simulate a delay to show loading state (optional - can be removed)
  await new Promise((resolve) => setTimeout(resolve, 300))

  return {
    timeSeriesData: filteredByFillRate,
    productionData: materialFilteredProductionData,
    inventoryData: filteredInventoryData,
    alertData: alertsDataSource[scenario] || [],
    kpiData: scenarioKpiData,
    rawData: filteredRawData,
  }
}

export function exportToCSV(data: ScenarioData | null, filename: string): void {
  if (!data || !data.rawData.length) {
    console.error("No data to export")
    return
  }

  const headers = Object.keys(data.rawData[0])
  const csvContent = [
    headers.join(","),
    ...data.rawData.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Handle values that might contain commas
          return typeof value === "string" && value.includes(",") ? `"${value}"` : value
        })
        .join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export the alertsData directly from our data file
export { alertsData } from "../data/dashboard-data"
