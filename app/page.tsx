"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { BarChart, LineChart, PieChart } from "./components/charts"
import { ProcessFlow } from "./components/process-flow"
import { AlertsTable } from "./components/alerts-table"
import { KpiCards } from "./components/kpi-cards"
import { DataGrid } from "./components/data-grid"
import { SimpleFilterPanel } from "./components/simple-filter-panel"
import { fetchScenarioData, exportToCSV, alertsData } from "./lib/data"
import { AlertCircle, TrendingUp, BarChart3, Download, Filter, RefreshCw } from "lucide-react"
import type { Scenario, ScenarioData, FilterOptions, AlertData } from "./types"
import { materials, alertSummary, scenarios as scenariosList } from "./data/dashboard-data"
import { AlertRecommendations } from "./components/alert-recommendations"
import { ChangeLogTable } from "./components/change-log-table"

export default function Dashboard() {
  const [activeScenario, setActiveScenario] = useState<Scenario>("BASE")
  const [scenarioData, setScenarioData] = useState<ScenarioData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [compareMode, setCompareMode] = useState<boolean>(false)
  const [compareScenario, setCompareScenario] = useState<Scenario>("S4")
  const [compareData, setCompareData] = useState<ScenarioData | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<string>("14")
  const [weekRange, setWeekRange] = useState<[number, number]>([14, 24])
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    materials: [],
    plants: ["P103"],
    alertTypes: ["Critical", "Capacity", "Supporting"],
    minFillRate: 0,
  })
  const [activeTab, setActiveTab] = useState("overview")
  const [currentAlerts, setCurrentAlerts] = useState<AlertData[]>([])
  const [changeLog, setChangeLog] = useState<any[]>([])
  // Add state for scenario comparison type
  const [scenarioComparisonType, setScenarioComparisonType] = useState("alerts")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchScenarioData(activeScenario, filterOptions, weekRange)
        setScenarioData(data)

        if (compareMode) {
          const compData = await fetchScenarioData(compareScenario, filterOptions, weekRange)
          setCompareData(compData)
        } else {
          setCompareData(null)
        }

        // Set the current alerts for the active scenario, filtered by alert types and week range
        const filteredAlerts = alertsData[activeScenario]
          ? alertsData[activeScenario].filter((alert) => {
              // Filter by alert type
              if (!filterOptions.alertTypes.includes(alert.type)) {
                return false
              }

              // Filter by week range
              const alertWeek = Number(alert.week)
              if (alertWeek < weekRange[0] || alertWeek > weekRange[1]) {
                return false
              }

              // Filter by material if specified
              if (filterOptions.materials.length > 0 && !filterOptions.materials.includes(alert.item)) {
                return false
              }

              return true
            })
          : []

        setCurrentAlerts(filteredAlerts)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [activeScenario, compareMode, compareScenario, filterOptions, weekRange])

  const handleExportData = () => {
    exportToCSV(scenarioData, `${activeScenario}_data_export`)
  }

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilterOptions((prev) => ({ ...prev, ...newFilters }))
  }

  const handleWeekRangeChange = (range: [number, number]) => {
    setWeekRange(range)
  }

  const handleRefresh = () => {
    const loadData = async () => {
      setIsLoading(true)
      const data = await fetchScenarioData(activeScenario, filterOptions, weekRange)
      setScenarioData(data)

      if (compareMode) {
        const compData = await fetchScenarioData(compareScenario, filterOptions, weekRange)
        setCompareData(compData)
      }

      setIsLoading(false)
    }

    loadData()
  }

  // Handle data updates from recommendations
  const handleUpdateData = (newData: ScenarioData, changeDetails: any) => {
    if (!newData) return

    setScenarioData(newData)

    // Add the change to the change log
    const timestamp = new Date().toLocaleString()
    setChangeLog((prev) => [
      {
        id: prev.length + 1,
        timestamp,
        ...changeDetails,
      },
      ...prev,
    ])
  }

  // Debug data loading
  console.log("Scenario Data:", scenarioData?.timeSeriesData?.length || 0, "items")

  // Add a helper function to transform production data for better visualization
  const transformProductionData = (data: any[] | undefined) => {
    if (!data || data.length === 0) return []

    // Create a new array with the same structure but only including selected materials or all materials if none selected
    return data.map((weekData) => {
      const transformedData: any = { week: weekData.week }

      // If we have filtered materials, only include those
      if (filterOptions.materials.length > 0) {
        filterOptions.materials.forEach((materialId) => {
          if (materialId in weekData) {
            transformedData[materialId] = weekData[materialId]
          }
        })
      } else {
        // Otherwise include all materials except 'week'
        Object.keys(weekData).forEach((key) => {
          if (key !== "week") {
            transformedData[key] = weekData[key]
          }
        })
      }

      return transformedData
    })
  }

  // Find the getScenarioComparisonData function and update it to better handle material types and stacking

  // Update the getScenarioComparisonData function to better handle material types and stacking
  const getScenarioComparisonData = () => {
    if (scenarioComparisonType === "alerts") {
      return {
        data: [
          {
            name: "Critical Alerts",
            BASE: alertSummary.BASE.critical,
            S1: alertSummary.S1.critical,
            S2: alertSummary.S2.critical,
            S3: alertSummary.S3.critical,
            S4: alertSummary.S4.critical,
          },
          {
            name: "Capacity Alerts",
            BASE: alertSummary.BASE.capacity,
            S1: alertSummary.S1.capacity,
            S2: alertSummary.S2.capacity,
            S3: alertSummary.S3.capacity,
            S4: alertSummary.S4.capacity,
          },
          {
            name: "Supporting Alerts",
            BASE: alertSummary.BASE.supporting,
            S1: alertSummary.S1.supporting,
            S2: alertSummary.S2.supporting,
            S3: alertSummary.S3.supporting,
            S4: alertSummary.S4.supporting,
          },
        ],
        stacked: false,
        materialNames: [],
      }
    } else if (scenarioComparisonType === "materials") {
      // Use selected materials from filter if available, otherwise group by type
      if (filterOptions.materials.length > 0) {
        // Check if we have materials from different types (FG, Intermediate, Raw)
        const selectedMaterialsInfo = filterOptions.materials.map(
          (id) => materials.find((m) => m.id === id) || { id, name: id, type: "Unknown" },
        )

        const hasMultipleTypes = new Set(selectedMaterialsInfo.map((m) => m.type)).size > 1

        if (hasMultipleTypes) {
          // Group by material type for stacked bar chart
          const materialsByType = {
            FG: selectedMaterialsInfo.filter((m) => m.type === "FG"),
            Intermediate: selectedMaterialsInfo.filter((m) => m.type === "Intermediate"),
            Raw: selectedMaterialsInfo.filter((m) => m.type === "Raw"),
          }

          // Create data for stacked bar chart
          return {
            data: [
              {
                name: "Inventory by Material Type",
                "Finished Goods":
                  materialsByType.FG.length > 0
                    ? getAverageInventoryForMaterials(
                        "BASE",
                        materialsByType.FG.map((m) => m.id),
                      )
                    : 0,
                Intermediates:
                  materialsByType.Intermediate.length > 0
                    ? getAverageInventoryForMaterials(
                        "BASE",
                        materialsByType.Intermediate.map((m) => m.id),
                      )
                    : 0,
                "Raw Materials":
                  materialsByType.Raw.length > 0
                    ? getAverageInventoryForMaterials(
                        "BASE",
                        materialsByType.Raw.map((m) => m.id),
                      )
                    : 0,

                // Add other scenarios
                "S1-FG":
                  materialsByType.FG.length > 0
                    ? getAverageInventoryForMaterials(
                        "S1",
                        materialsByType.FG.map((m) => m.id),
                      )
                    : 0,
                "S1-INT":
                  materialsByType.Intermediate.length > 0
                    ? getAverageInventoryForMaterials(
                        "S1",
                        materialsByType.Intermediate.map((m) => m.id),
                      )
                    : 0,
                "S1-RAW":
                  materialsByType.Raw.length > 0
                    ? getAverageInventoryForMaterials(
                        "S1",
                        materialsByType.Raw.map((m) => m.id),
                      )
                    : 0,

                "S2-FG":
                  materialsByType.FG.length > 0
                    ? getAverageInventoryForMaterials(
                        "S2",
                        materialsByType.FG.map((m) => m.id),
                      )
                    : 0,
                "S2-INT":
                  materialsByType.Intermediate.length > 0
                    ? getAverageInventoryForMaterials(
                        "S2",
                        materialsByType.Intermediate.map((m) => m.id),
                      )
                    : 0,
                "S2-RAW":
                  materialsByType.Raw.length > 0
                    ? getAverageInventoryForMaterials(
                        "S2",
                        materialsByType.Raw.map((m) => m.id),
                      )
                    : 0,

                "S3-FG":
                  materialsByType.FG.length > 0
                    ? getAverageInventoryForMaterials(
                        "S3",
                        materialsByType.FG.map((m) => m.id),
                      )
                    : 0,
                "S3-INT":
                  materialsByType.Intermediate.length > 0
                    ? getAverageInventoryForMaterials(
                        "S3",
                        materialsByType.Intermediate.map((m) => m.id),
                      )
                    : 0,
                "S3-RAW":
                  materialsByType.Raw.length > 0
                    ? getAverageInventoryForMaterials(
                        "S3",
                        materialsByType.Raw.map((m) => m.id),
                      )
                    : 0,

                "S4-FG":
                  materialsByType.FG.length > 0
                    ? getAverageInventoryForMaterials(
                        "S4",
                        materialsByType.FG.map((m) => m.id),
                      )
                    : 0,
                "S4-INT":
                  materialsByType.Intermediate.length > 0
                    ? getAverageInventoryForMaterials(
                        "S4",
                        materialsByType.Intermediate.map((m) => m.id),
                      )
                    : 0,
                "S4-RAW":
                  materialsByType.Raw.length > 0
                    ? getAverageInventoryForMaterials(
                        "S4",
                        materialsByType.Raw.map((m) => m.id),
                      )
                    : 0,
              },
            ],
            stacked: true,
            materialNames: ["Finished Goods", "Intermediates", "Raw Materials"],
          }
        }

        // For individual materials or materials of the same type
        const materialNames = selectedMaterialsInfo.map((m) => m.name)

        return {
          data: filterOptions.materials.map((materialId) => {
            const material = materials.find((m) => m.id === materialId)
            const materialName = material ? material.name : materialId
            const materialType = material ? material.type : "Unknown"

            // Get average inventory for this material across scenarios
            const getAverageInventory = (scenario: Scenario, materialId: string) => {
              if (!scenarioData?.inventoryData || !scenarioData.inventoryData[materialId]) return 0

              const inventoryValues = scenarioData.inventoryData[materialId]
              return inventoryValues.length > 0
                ? Math.round(inventoryValues.reduce((a, b) => a + b, 0) / inventoryValues.length)
                : 0
            }

            return {
              name: `${materialName} (${materialType})`,
              BASE: getAverageInventory("BASE", materialId),
              S1: getAverageInventory("S1", materialId),
              S2: getAverageInventory("S2", materialId),
              S3: getAverageInventory("S3", materialId),
              S4: getAverageInventory("S4", materialId),
            }
          }),
          stacked: false,
          materialNames: materialNames,
        }
      } else {
        // Group materials by type
        const fgMaterials = materials.filter((m) => m.type === "FG").map((m) => m.id)
        const intermediateMaterials = materials.filter((m) => m.type === "Intermediate").map((m) => m.id)
        const rawMaterials = materials.filter((m) => m.type === "Raw").map((m) => m.id)

        // Calculate average inventory for each material type and scenario
        const getAverageInventory = (scenario: Scenario, materialIds: string[]) => {
          if (!scenarioData?.inventoryData) return 0

          let sum = 0
          let count = 0

          materialIds.forEach((id) => {
            if (scenarioData.inventoryData[id]) {
              // Get average of all weeks
              const avg =
                scenarioData.inventoryData[id].reduce((a, b) => a + b, 0) / scenarioData.inventoryData[id].length
              sum += avg
              count++
            }
          })

          return count > 0 ? Math.round(sum / count) : 0
        }

        return {
          data: [
            {
              name: "Finished Goods",
              BASE: getAverageInventory("BASE", fgMaterials),
              S1: getAverageInventory("S1", fgMaterials),
              S2: getAverageInventory("S2", fgMaterials),
              S3: getAverageInventory("S3", fgMaterials),
              S4: getAverageInventory("S4", fgMaterials),
            },
            {
              name: "Intermediates",
              BASE: getAverageInventory("BASE", intermediateMaterials),
              S1: getAverageInventory("S1", intermediateMaterials),
              S2: getAverageInventory("S2", intermediateMaterials),
              S3: getAverageInventory("S3", intermediateMaterials),
              S4: getAverageInventory("S4", intermediateMaterials),
            },
            {
              name: "Raw Materials",
              BASE: getAverageInventory("BASE", rawMaterials),
              S1: getAverageInventory("S1", rawMaterials),
              S2: getAverageInventory("S2", rawMaterials),
              S3: getAverageInventory("S3", rawMaterials),
              S4: getAverageInventory("S4", rawMaterials),
            },
          ],
          stacked: false,
          materialNames: ["Finished Goods", "Intermediates", "Raw Materials"],
        }
      }
    } else if (scenarioComparisonType === "production") {
      // Use selected materials from filter if available
      if (filterOptions.materials.length > 0) {
        // Check if we have materials from different types (FG, Intermediate, Raw)
        const selectedMaterialsInfo = filterOptions.materials.map(
          (id) => materials.find((m) => m.id === id) || { id, name: id, type: "Unknown" },
        )

        const hasMultipleTypes = new Set(selectedMaterialsInfo.map((m) => m.type)).size > 1

        if (hasMultipleTypes) {
          // Group by material type for stacked bar chart
          const materialsByType = {
            FG: selectedMaterialsInfo.filter((m) => m.type === "FG"),
            Intermediate: selectedMaterialsInfo.filter((m) => m.type === "Intermediate"),
            Raw: selectedMaterialsInfo.filter((m) => m.type === "Raw"),
          }

          // Helper function to get average production
          const getAverageProductionForMaterials = (scenario: Scenario, materialIds: string[]) => {
            if (!scenarioData?.productionData) return 0

            let sum = 0
            let count = 0

            materialIds.forEach((materialId) => {
              const productionData = scenarioData.productionData.filter(
                (item) => materialId in item && Number(item.week) >= weekRange[0] && Number(item.week) <= weekRange[1],
              )

              if (productionData.length > 0) {
                const materialSum = productionData.reduce((total, item) => total + (Number(item[materialId]) || 0), 0)
                sum += materialSum / productionData.length
                count++
              }
            })

            return count > 0 ? Math.round(sum / count) : 0
          }

          // Create data for stacked bar chart
          return {
            data: [
              {
                name: "Production by Material Type",
                "Finished Goods":
                  materialsByType.FG.length > 0
                    ? getAverageProductionForMaterials(
                        "BASE",
                        materialsByType.FG.map((m) => m.id),
                      )
                    : 0,
                Intermediates:
                  materialsByType.Intermediate.length > 0
                    ? getAverageProductionForMaterials(
                        "BASE",
                        materialsByType.Intermediate.map((m) => m.id),
                      )
                    : 0,
                "Raw Materials":
                  materialsByType.Raw.length > 0
                    ? getAverageProductionForMaterials(
                        "BASE",
                        materialsByType.Raw.map((m) => m.id),
                      )
                    : 0,

                // Add other scenarios
                "S1-FG":
                  materialsByType.FG.length > 0
                    ? getAverageProductionForMaterials(
                        "S1",
                        materialsByType.FG.map((m) => m.id),
                      )
                    : 0,
                "S1-INT":
                  materialsByType.Intermediate.length > 0
                    ? getAverageProductionForMaterials(
                        "S1",
                        materialsByType.Intermediate.map((m) => m.id),
                      )
                    : 0,
                "S1-RAW":
                  materialsByType.Raw.length > 0
                    ? getAverageProductionForMaterials(
                        "S1",
                        materialsByType.Raw.map((m) => m.id),
                      )
                    : 0,

                "S2-FG":
                  materialsByType.FG.length > 0
                    ? getAverageProductionForMaterials(
                        "S2",
                        materialsByType.FG.map((m) => m.id),
                      )
                    : 0,
                "S2-INT":
                  materialsByType.Intermediate.length > 0
                    ? getAverageProductionForMaterials(
                        "S2",
                        materialsByType.Intermediate.map((m) => m.id),
                      )
                    : 0,
                "S2-RAW":
                  materialsByType.Raw.length > 0
                    ? getAverageProductionForMaterials(
                        "S2",
                        materialsByType.Raw.map((m) => m.id),
                      )
                    : 0,

                "S3-FG":
                  materialsByType.FG.length > 0
                    ? getAverageProductionForMaterials(
                        "S3",
                        materialsByType.FG.map((m) => m.id),
                      )
                    : 0,
                "S3-INT":
                  materialsByType.Intermediate.length > 0
                    ? getAverageProductionForMaterials(
                        "S3",
                        materialsByType.Intermediate.map((m) => m.id),
                      )
                    : 0,
                "S3-RAW":
                  materialsByType.Raw.length > 0
                    ? getAverageProductionForMaterials(
                        "S3",
                        materialsByType.Raw.map((m) => m.id),
                      )
                    : 0,

                "S4-FG":
                  materialsByType.FG.length > 0
                    ? getAverageProductionForMaterials(
                        "S4",
                        materialsByType.FG.map((m) => m.id),
                      )
                    : 0,
                "S4-INT":
                  materialsByType.Intermediate.length > 0
                    ? getAverageProductionForMaterials(
                        "S4",
                        materialsByType.Intermediate.map((m) => m.id),
                      )
                    : 0,
                "S4-RAW":
                  materialsByType.Raw.length > 0
                    ? getAverageProductionForMaterials(
                        "S4",
                        materialsByType.Raw.map((m) => m.id),
                      )
                    : 0,
              },
            ],
            stacked: true,
            materialNames: ["Finished Goods", "Intermediates", "Raw Materials"],
          }
        }

        const materialNames = selectedMaterialsInfo.map((m) => m.name)

        return {
          data: filterOptions.materials.map((materialId) => {
            const material = materials.find((m) => m.id === materialId)
            const materialName = material ? material.name : materialId
            const materialType = material ? material.type : "Unknown"

            // Calculate average production for this material across scenarios
            const getAverageProduction = (scenario: Scenario, materialId: string) => {
              if (!scenarioData?.productionData) return 0

              const productionData = scenarioData.productionData.filter(
                (item) => materialId in item && Number(item.week) >= weekRange[0] && Number(item.week) <= weekRange[1],
              )

              if (productionData.length === 0) return 0

              const sum = productionData.reduce((total, item) => total + (Number(item[materialId]) || 0), 0)
              return Math.round(sum / productionData.length)
            }

            return {
              name: `${materialName} (${materialType})`,
              BASE: getAverageProduction("BASE", materialId),
              S1: getAverageProduction("S1", materialId),
              S2: getAverageProduction("S2", materialId),
              S3: getAverageProduction("S3", materialId),
              S4: getAverageProduction("S4", materialId),
            }
          }),
          stacked: false,
          materialNames: materialNames,
        }
      } else {
        // Use the first two materials (FG and Intermediate) for production comparison
        const fgMaterial = materials.find((m) => m.type === "FG")?.id || "3720579"
        const intermediateMaterial = materials.find((m) => m.type === "Intermediate")?.id || "3954706"

        // Calculate average production for key materials across scenarios
        const getAverageProduction = (scenario: Scenario, materialId: string) => {
          if (!scenarioData?.productionData) return 0

          const productionData = scenarioData.productionData.filter(
            (item) => materialId in item && Number(item.week) >= weekRange[0] && Number(item.week) <= weekRange[1],
          )

          if (productionData.length === 0) return 0

          const sum = productionData.reduce((total, item) => total + (Number(item[materialId]) || 0), 0)
          return Math.round(sum / productionData.length)
        }

        const fgName = materials.find((m) => m.id === fgMaterial)?.name || "FG Material"
        const intName = materials.find((m) => m.id === intermediateMaterial)?.name || "Intermediate Material"

        return {
          data: [
            {
              name: `${fgName} (FG)`,
              BASE: getAverageProduction("BASE", fgMaterial),
              S1: getAverageProduction("S1", fgMaterial),
              S2: getAverageProduction("S2", fgMaterial),
              S3: getAverageProduction("S3", fgMaterial),
              S4: getAverageProduction("S4", fgMaterial),
            },
            {
              name: `${intName} (Intermediate)`,
              BASE: getAverageProduction("BASE", intermediateMaterial),
              S1: getAverageProduction("S1", intermediateMaterial),
              S2: getAverageProduction("S2", intermediateMaterial),
              S3: getAverageProduction("S3", intermediateMaterial),
              S4: getAverageProduction("S4", intermediateMaterial),
            },
          ],
          stacked: false,
          materialNames: [fgName, intName],
        }
      }
    }

    // Default to alerts
    return {
      data: [
        {
          name: "Critical Alerts",
          BASE: alertSummary.BASE.critical,
          S1: alertSummary.S1.critical,
          S2: alertSummary.S2.critical,
          S3: alertSummary.S3.critical,
          S4: alertSummary.S4.critical,
        },
        {
          name: "Capacity Alerts",
          BASE: alertSummary.BASE.capacity,
          S1: alertSummary.S1.capacity,
          S2: alertSummary.S2.capacity,
          S3: alertSummary.S3.capacity,
          S4: alertSummary.S4.capacity,
        },
        {
          name: "Supporting Alerts",
          BASE: alertSummary.BASE.supporting,
          S1: alertSummary.S1.supporting,
          S2: alertSummary.S2.supporting,
          S3: alertSummary.S3.supporting,
          S4: alertSummary.S4.supporting,
        },
      ],
      stacked: false,
      materialNames: [],
    }
  }

  // Add this helper function for inventory calculations
  const getAverageInventoryForMaterials = (scenario: Scenario, materialIds: string[]) => {
    if (!scenarioData?.inventoryData) return 0

    let sum = 0
    let count = 0

    materialIds.forEach((id) => {
      if (scenarioData.inventoryData[id]) {
        // Get average of all weeks
        const avg = scenarioData.inventoryData[id].reduce((a, b) => a + b, 0) / scenarioData.inventoryData[id].length
        sum += avg
        count++
      }
    })

    return count > 0 ? Math.round(sum / count) : 0
  }

  // Now update the BarChart component call in the JSX
  // Find the BarChart component in the JSX and update it:

  // Replace:
  // <BarChart data={getScenarioComparisonData()} />

  // With:
  const comparisonData = getScenarioComparisonData()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16 py-4">
          <h1 className="text-xl font-bold">Detroit Cathode Manufacturing - S&OP Dashboard</h1>
          <div className="flex items-center gap-4">
            <select
              value={activeScenario}
              onChange={(e) => setActiveScenario(e.target.value as Scenario)}
              className="px-3 py-1 border rounded-md"
            >
              {scenariosList.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="compare-mode"
                checked={compareMode}
                onChange={(e) => setCompareMode(e.target.checked)}
              />
              <label htmlFor="compare-mode">Compare</label>
            </div>

            {compareMode && (
              <select
                value={compareScenario}
                onChange={(e) => setCompareScenario(e.target.value as Scenario)}
                disabled={!compareMode}
                className="px-3 py-1 border rounded-md"
              >
                {scenariosList
                  .filter((s) => s.id !== activeScenario)
                  .map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
              </select>
            )}

            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {filterOptions.materials.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
                  {filterOptions.materials.length}
                </span>
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {showFilters && (
        <div className="container py-4 border-b">
          <SimpleFilterPanel
            materials={materials}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            weekRange={weekRange}
            onWeekRangeChange={handleWeekRangeChange}
          />
        </div>
      )}

      <main className="flex-1 container py-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alertSummary[activeScenario].critical}</div>
              {activeScenario !== "BASE" && (
                <p className="text-xs text-muted-foreground">
                  {alertSummary[activeScenario].critical - alertSummary.BASE.critical > 0 ? "+" : ""}
                  {alertSummary[activeScenario].critical - alertSummary.BASE.critical} from Base Plan
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Capacity Alerts</CardTitle>
              <TrendingUp className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alertSummary[activeScenario].capacity}</div>
              {activeScenario !== "BASE" && (
                <p className="text-xs text-muted-foreground">
                  {alertSummary[activeScenario].capacity - alertSummary.BASE.capacity > 0 ? "+" : ""}
                  {alertSummary[activeScenario].capacity - alertSummary.BASE.capacity} from Base Plan
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Supporting Alerts</CardTitle>
              <BarChart3 className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alertSummary[activeScenario].supporting}</div>
              {activeScenario !== "BASE" && (
                <p className="text-xs text-muted-foreground">
                  {alertSummary[activeScenario].supporting - alertSummary.BASE.supporting > 0 ? "+" : ""}
                  {alertSummary[activeScenario].supporting - alertSummary.BASE.supporting} from Base Plan
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {alertSummary[activeScenario].critical +
                  alertSummary[activeScenario].capacity +
                  alertSummary[activeScenario].supporting}
              </div>
              {activeScenario !== "BASE" && (
                <p className="text-xs text-muted-foreground">
                  {alertSummary[activeScenario].critical +
                    alertSummary[activeScenario].capacity +
                    alertSummary[activeScenario].supporting -
                    (alertSummary.BASE.critical + alertSummary.BASE.capacity + alertSummary.BASE.supporting) >
                  0
                    ? "+"
                    : ""}
                  {alertSummary[activeScenario].critical +
                    alertSummary[activeScenario].capacity +
                    alertSummary[activeScenario].supporting -
                    (alertSummary.BASE.critical + alertSummary.BASE.capacity + alertSummary.BASE.supporting)}{" "}
                  from Base Plan
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <KpiCards
          scenario={activeScenario}
          compareScenario={compareMode ? compareScenario : undefined}
          week={selectedWeek}
        />

        <div className="grid gap-6 md:grid-cols-3 my-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Demand vs Supply Over Time</CardTitle>
              <p className="text-sm text-gray-500">
                Planning horizon for {scenariosList.find((s) => s.id === activeScenario)?.name}
                {compareMode && ` vs ${scenariosList.find((s) => s.id === compareScenario)?.name}`}
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-80">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <LineChart
                  scenario={activeScenario}
                  compareScenario={compareMode ? compareScenario : null}
                  data={scenarioData}
                  compareData={compareData}
                  weekRange={weekRange}
                  materials={materials}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Distribution</CardTitle>
              <p className="text-sm text-gray-500">
                By category for {scenariosList.find((s) => s.id === activeScenario)?.name}
              </p>
            </CardHeader>
            <CardContent>
              <PieChart
                data={[
                  { name: "Critical", value: alertSummary[activeScenario].critical },
                  { name: "Capacity", value: alertSummary[activeScenario].capacity },
                  { name: "Supporting", value: alertSummary[activeScenario].supporting },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 border-b">
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 ${
                activeTab === "overview" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "production" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("production")}
            >
              Production
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "inventory" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("inventory")}
            >
              Inventory
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "alerts" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("alerts")}
            >
              Alerts
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "data" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("data")}
            >
              Raw Data
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "changelog" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("changelog")}
            >
              Change Log
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Manufacturing Process Flow</CardTitle>
                <p className="text-sm text-gray-500">2-part process for LCO cathode production</p>
              </CardHeader>
              <CardContent>
                <ProcessFlow />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Scenario Comparison</CardTitle>
                  <p className="text-sm text-gray-500">Improvement from Base Plan to S4 (Fine Tuned Optimization)</p>
                </div>
                <select
                  className="px-3 py-1 border rounded-md"
                  onChange={(e) => setScenarioComparisonType(e.target.value)}
                  value={scenarioComparisonType}
                >
                  <option value="alerts">Alert Comparison</option>
                  <option value="materials">Inventory by Material Type</option>
                  <option value="production">Production by Material</option>
                </select>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={comparisonData.data}
                  stacked={comparisonData.stacked}
                  materialNames={comparisonData.materialNames}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {scenarioComparisonType === "alerts"
                    ? "Comparing alert counts across scenarios"
                    : scenarioComparisonType === "materials"
                      ? filterOptions.materials.length > 0
                        ? `Comparing inventory levels for ${filterOptions.materials.length} selected material(s) across scenarios`
                        : "Comparing average inventory levels by material type across scenarios"
                      : filterOptions.materials.length > 0
                        ? `Comparing production quantities for ${filterOptions.materials.length} selected material(s) across scenarios`
                        : "Comparing average production quantities by material across scenarios"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "production" && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Production Orders by Week</CardTitle>
                <p className="text-sm text-gray-500">
                  {filterOptions.materials.length > 0
                    ? `Production orders for ${filterOptions.materials.length} selected material(s)`
                    : `Actual + Planned Production Orders for ${scenariosList.find((s) => s.id === activeScenario)?.name}`}
                </p>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Loading production data...</p>
                  </div>
                ) : (
                  <LineChart
                    scenario={activeScenario}
                    compareScenario={compareMode ? compareScenario : null}
                    data={scenarioData}
                    compareData={compareData}
                    weekRange={weekRange}
                    dataType="production"
                    materials={materials}
                    filterOptions={filterOptions}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Levels by Week</CardTitle>
                <p className="text-sm text-gray-500">
                  Planned inventory for {scenariosList.find((s) => s.id === activeScenario)?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {filterOptions.materials.length === 1
                    ? `Showing inventory for ${
                        materials.find((m) => m.id === filterOptions.materials[0])?.name || "selected material"
                      }`
                    : filterOptions.materials.length > 1
                      ? "Showing aggregated inventory for selected materials"
                      : "Showing total planned inventory across all materials"}
                </p>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Loading inventory data...</p>
                  </div>
                ) : (
                  <LineChart
                    scenario={activeScenario}
                    compareScenario={compareMode ? compareScenario : null}
                    data={scenarioData}
                    compareData={compareData}
                    weekRange={weekRange}
                    dataType="inventory"
                    materials={materials}
                    selectedMaterial={filterOptions.materials.length === 1 ? filterOptions.materials[0] : undefined}
                    filterOptions={filterOptions}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="grid gap-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Critical Alerts</AlertTitle>
              <AlertDescription>
                {alertSummary[activeScenario].critical} critical alerts in{" "}
                {scenariosList.find((s) => s.id === activeScenario)?.name}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Details</CardTitle>
                  <p className="text-sm text-gray-500">
                    All alerts for {scenariosList.find((s) => s.id === activeScenario)?.name}
                  </p>
                </CardHeader>
                <CardContent>
                  <AlertsTable scenario={activeScenario} filterOptions={filterOptions} materials={materials} />
                </CardContent>
              </Card>

              <Card id="prescriptive-actions">
                <CardHeader>
                  <CardTitle>Prescriptive Actions</CardTitle>
                  <p className="text-sm text-gray-500">Recommended actions to address alerts</p>
                </CardHeader>
                <CardContent>
                  <AlertRecommendations
                    alerts={currentAlerts}
                    materials={materials}
                    scenarioData={scenarioData}
                    onUpdateData={handleUpdateData}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "data" && (
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Raw Data</CardTitle>
                  <p className="text-sm text-gray-500">
                    Detailed data for {scenariosList.find((s) => s.id === activeScenario)?.name}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <DataGrid data={scenarioData?.rawData || []} isLoading={isLoading} materials={materials} />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "changelog" && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Log</CardTitle>
                <p className="text-sm text-gray-500">Record of changes made to address alerts</p>
              </CardHeader>
              <CardContent>
                <ChangeLogTable changes={changeLog} materials={materials} />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
