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

        // Set the current alerts for the active scenario
        setCurrentAlerts(alertsData[activeScenario] || [])
      } catch (error) {
        console.error("Error loading data:", error)
        // You could set an error state here if needed
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

    // If we have filtered materials, make sure we're showing the right data
    if (filterOptions.materials.length > 0) {
      // Create a new array with the same structure but only including selected materials
      return data.map((weekData) => {
        const filteredData: any = { week: weekData.week }

        // Only include the selected materials
        filterOptions.materials.forEach((materialId) => {
          if (materialId in weekData) {
            filteredData[materialId] = weekData[materialId]
          }
        })

        return filteredData
      })
    }

    // If no materials are selected, include all materials
    return data
  }

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
              <CardHeader>
                <CardTitle>Scenario Comparison</CardTitle>
                <p className="text-sm text-gray-500">Improvement from Base Plan to S4 (Fine Tuned Optimization)</p>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[
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
                  ]}
                />
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
                ) : scenarioData?.productionData?.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p>No production data available for the selected filters</p>
                  </div>
                ) : (
                  <BarChart
                    data={transformProductionData(scenarioData?.productionData || [])}
                    compareData={compareMode ? transformProductionData(compareData?.productionData || []) : undefined}
                    scenario={activeScenario}
                    compareScenario={compareMode ? compareScenario : null}
                    materials={materials}
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
