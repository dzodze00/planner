"use client"

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts"
import type { Scenario } from "../types"

// Define the MaterialItem interface
interface MaterialItem {
  id: string
  name: string
  type: string
}

// Update the BarChartProps interface to include stacked and materialNames props:
interface BarChartProps {
  data: any[]
  compareData?: any[]
  scenario?: Scenario
  compareScenario?: Scenario | null
  materials?: MaterialItem[] // Add materials prop
  stacked?: boolean // Add stacked prop
  materialNames?: string[] // Add materialNames prop
}

// Add this after the existing imports and before the LineChart component definition:
interface LineChartProps {
  scenario: Scenario
  compareScenario: Scenario | null
  data: any | null
  compareData: any | null
  weekRange?: [number, number]
  dataType?: "demand-supply" | "inventory" | "production"
  materials?: MaterialItem[] // Add materials prop
  selectedMaterial?: string // Add selectedMaterial prop
  filterOptions?: { materials: string[] }
}

// Helper function to get material name
const getMaterialName = (key: string, materialsArray: MaterialItem[] = []) => {
  // Check if the key is a material ID
  const material = materialsArray.find((m) => m.id === key)
  if (material) {
    return material.name
  }
  // If not a material ID, return the key as is
  return key
}

// Update the BarChart function to better handle production data
export function BarChart({
  data = [],
  compareData,
  scenario,
  compareScenario,
  materials = [],
  stacked,
  materialNames,
}: BarChartProps) {
  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // Handle empty data case
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  // If we have scenario data, it's a comparison between scenarios
  if (scenario && !compareScenario) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="BASE" fill={colors[0]} name="Base Plan" />
          <Bar dataKey="S1" fill={colors[1]} name="S1 - Expedite POs & Move SOs" />
          <Bar dataKey="S2" fill={colors[2]} name="S2 - Increase Capacities" />
          <Bar dataKey="S3" fill={colors[3]} name="S3 - Increase Material Purchases" />
          <Bar dataKey="S4" fill={colors[4]} name="S4 - Fine Tuned Optimization" />
        </RechartsBarChart>
      </ResponsiveContainer>
    )
  }

  // If we have compareScenario, it's a comparison between two scenarios
  if (scenario && compareScenario && data.length > 0) {
    // Get all material IDs from the data (excluding 'week')
    const materialIds = Object.keys(data[0]).filter((key) => key !== "week")

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => {
              // Try to find material name
              const material = materials.find((m) => m.id === name)
              return [value, material ? material.name : name]
            }}
          />
          <Legend
            formatter={(value) => {
              // Try to find material name for legend
              const material = materials.find((m) => m.id === value)
              return material ? material.name : value
            }}
          />
          {materialIds.map((key, index) => (
            <Bar key={`${scenario}-${key}`} dataKey={key} fill={colors[index % colors.length]} name={key} />
          ))}

          {compareData &&
            compareData.length > 0 &&
            Object.keys(compareData[0])
              .filter((key) => key !== "week")
              .map((key, index) => (
                <Bar
                  key={`${compareScenario}-${key}`}
                  dataKey={key}
                  fill={colors[(index + 2) % colors.length]}
                  name={`${key} (${compareScenario})`}
                  fillOpacity={0.7}
                  stroke={colors[(index + 2) % colors.length]}
                  strokeWidth={2}
                />
              ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    )
  }

  // Default case - just show the data
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        stackOffset={stacked ? "sign" : "none"}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip
          formatter={(value, name) => {
            const material = materials.find((m) => m.id === name)
            return [value, material ? material.name : name]
          }}
        />
        <Legend
          formatter={(value) => {
            const material = materials.find((m) => m.id === value)
            return material ? material.name : value
          }}
        />
        {data.length > 0 &&
          Object.keys(data[0])
            .filter((key) => key !== "name" && key !== "week")
            .map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                name={getMaterialName(key, materials)}
                stackId={stacked ? "a" : undefined}
              />
            ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

// Then update the LineChart function to use the actual data:
export function LineChart({
  scenario,
  compareScenario,
  data,
  compareData,
  weekRange = [14, 24],
  dataType = "demand-supply",
  materials = [],
  selectedMaterial,
  filterOptions = { materials: [] },
}: LineChartProps) {
  // Use the actual data from props instead of mockData
  const chartData = data?.timeSeriesData || []
  const compareChartData = compareData?.timeSeriesData || []

  // Get inventory data for selected materials if applicable
  let inventoryData: Array<{ week: string; [key: string]: string | number }> = []
  let productionData: Array<{ week: string; [key: string]: string | number }> = []

  if (dataType === "inventory" && data?.inventoryData) {
    if (filterOptions.materials.length > 0) {
      // For multiple selected materials
      // Create a data point for each week with inventory values for each selected material
      const weeks = Array.from({ length: weekRange[1] - weekRange[0] + 1 }, (_, i) => String(i + weekRange[0]))

      inventoryData = weeks.map((week) => {
        const weekData: { week: string; [key: string]: string | number } = { week }

        // Add inventory for each selected material
        filterOptions.materials.forEach((materialId) => {
          if (data.inventoryData[materialId]) {
            const weekIndex = Number(week) - 14 // Assuming weeks start at 14
            if (weekIndex >= 0 && weekIndex < data.inventoryData[materialId].length) {
              const materialName = getMaterialName(materialId, materials)
              weekData[materialName] = data.inventoryData[materialId][weekIndex]
            }
          }
        })

        return weekData
      })
    } else if (selectedMaterial) {
      // For a single selected material (keep existing logic)
      const materialInventory = data.inventoryData[selectedMaterial]
      if (materialInventory) {
        // Convert inventory data to the format expected by the chart
        inventoryData = materialInventory
          .map((value: number, index: number) => ({
            week: String(index + 14), // Assuming weeks start at 14
            inventory: value,
          }))
          .filter(
            (item: { week: string; inventory: number }) =>
              Number(item.week) >= weekRange[0] && Number(item.week) <= weekRange[1],
          )
      }
    } else {
      // If no materials selected, show total inventory from timeSeriesData
      inventoryData = chartData.filter(
        (item: { week: string; inventory: number }) =>
          Number(item.week) >= weekRange[0] && Number(item.week) <= weekRange[1],
      )
    }
  }

  // Handle production data
  if (dataType === "production" && data?.productionData) {
    // Filter production data by week range
    const filteredProductionData = data.productionData.filter(
      (item: { week: string }) => Number(item.week) >= weekRange[0] && Number(item.week) <= weekRange[1],
    )

    if (filterOptions.materials.length > 0) {
      // For selected materials, create a data point for each week
      productionData = filteredProductionData.map((weekData: any) => {
        const transformedData: { week: string; [key: string]: string | number } = { week: weekData.week }

        // Add production for each selected material
        filterOptions.materials.forEach((materialId) => {
          if (materialId in weekData) {
            const materialName = getMaterialName(materialId, materials)
            transformedData[materialName] = weekData[materialId]
          }
        })

        return transformedData
      })
    } else {
      // If no materials selected, include all materials except 'week'
      productionData = filteredProductionData.map((weekData: any) => {
        const transformedData: { week: string; [key: string]: string | number } = { week: weekData.week }

        Object.keys(weekData).forEach((key) => {
          if (key !== "week") {
            const materialName = getMaterialName(key, materials)
            transformedData[materialName] = weekData[key]
          }
        })

        return transformedData
      })
    }
  }

  // Update the displayData logic to handle the new data formats
  let displayData: any[] = chartData
  if (dataType === "inventory" && inventoryData.length > 0) {
    displayData = inventoryData
  } else if (dataType === "production" && productionData.length > 0) {
    displayData = productionData
  }

  // Filter displayData by week range if not already filtered
  if (dataType !== "inventory" && dataType !== "production") {
    displayData = displayData.filter(
      (item: { week: string }) => Number(item.week) >= weekRange[0] && Number(item.week) <= weekRange[1],
    )
  }

  // If no data is available, show a message
  if (!displayData || displayData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  // Determine which lines to show based on dataType
  const getLines = () => {
    if (dataType === "inventory") {
      if (filterOptions.materials.length > 0) {
        // For multiple materials, create a line for each material
        return filterOptions.materials.map((materialId) => {
          const materialName = getMaterialName(materialId, materials)
          return (
            <Line
              key={`inventory-${materialId}`}
              type="monotone"
              dataKey={materialName}
              stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`} // Random color
              name={`${materialName} Inventory (${scenario})`}
            />
          )
        })
      } else if (selectedMaterial) {
        // If a specific material is selected, show its inventory
        return [
          <Line
            key="inventory"
            type="monotone"
            dataKey="inventory"
            stroke="#ffc658"
            name={`${getMaterialName(selectedMaterial, materials)} Inventory (${scenario})`}
          />,
        ]
      } else {
        // If multiple materials are selected or none, show total inventory
        return [
          <Line
            key="inventory"
            type="monotone"
            dataKey="inventory"
            stroke="#ffc658"
            name={`Total Inventory (${scenario})`}
          />,
        ]
      }
    }

    if (dataType === "production") {
      if (filterOptions.materials.length > 0) {
        // For multiple materials, create a line for each material
        return filterOptions.materials.map((materialId) => {
          const materialName = getMaterialName(materialId, materials)
          return (
            <Line
              key={`production-${materialId}`}
              type="monotone"
              dataKey={materialName}
              stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`} // Random color
              name={`${materialName} Production (${scenario})`}
            />
          )
        })
      } else {
        // If no materials selected, show lines for all materials in the data
        const materialKeys = Object.keys(displayData[0] || {}).filter((key) => key !== "week")
        return materialKeys.map((key, index) => {
          const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]
          return (
            <Line
              key={`production-${key}`}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              name={`${key} Production (${scenario})`}
            />
          )
        })
      }
    }

    // Default: demand-supply
    return [
      <Line key="demand" type="monotone" dataKey="demand" stroke="#8884d8" name={`Total Demand (${scenario})`} />,
      <Line key="supply" type="monotone" dataKey="supply" stroke="#82ca9d" name={`Available Supply (${scenario})`} />,
    ]
  }

  // Get comparison lines if compareScenario is provided
  const getComparisonLines = () => {
    if (!compareScenario || !compareData) return []

    if (dataType === "inventory") {
      if (selectedMaterial) {
        // Get comparison inventory data if available
        let compareInventoryData: Array<{ week: string; inventory: number }> = []
        if (compareData?.inventoryData && compareData.inventoryData[selectedMaterial]) {
          const materialInventory = compareData.inventoryData[selectedMaterial]
          if (materialInventory) {
            compareInventoryData = materialInventory
              .map((value: number, index: number) => ({
                week: String(index + 14),
                inventory: value,
              }))
              .filter(
                (item: { week: string; inventory: number }) =>
                  Number(item.week) >= weekRange[0] && Number(item.week) <= weekRange[1],
              )
          }
        }

        if (compareInventoryData.length > 0) {
          return [
            <Line
              key="compare-inventory"
              type="monotone"
              dataKey="inventory"
              stroke="#ff7300"
              name={`${getMaterialName(selectedMaterial, materials)} Inventory (${compareScenario})`}
              strokeDasharray="5 5"
              data={compareInventoryData}
            />,
          ]
        }

        return [
          <Line
            key="compare-inventory"
            type="monotone"
            dataKey="inventory"
            stroke="#ff7300"
            name={`${getMaterialName(selectedMaterial, materials)} Inventory (${compareScenario})`}
            strokeDasharray="5 5"
          />,
        ]
      } else {
        return [
          <Line
            key="compare-inventory"
            type="monotone"
            dataKey="inventory"
            stroke="#ff7300"
            name={`Total Inventory (${compareScenario})`}
            strokeDasharray="5 5"
          />,
        ]
      }
    }

    if (dataType === "production") {
      // Similar approach as getLines for production
      if (filterOptions.materials.length > 0) {
        return filterOptions.materials.map((materialId) => {
          const materialName = getMaterialName(materialId, materials)
          return (
            <Line
              key={`compare-production-${materialId}`}
              type="monotone"
              dataKey={materialName}
              stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
              name={`${materialName} Production (${compareScenario})`}
              strokeDasharray="5 5"
            />
          )
        })
      } else {
        // If no materials selected, show lines for all materials in the compare data
        const compareProductionData = compareData.productionData || []
        if (compareProductionData.length > 0) {
          const materialKeys = Object.keys(compareProductionData[0] || {}).filter((key) => key !== "week")
          return materialKeys.map((key, index) => {
            const colors = ["#ff7300", "#ff9e00", "#ffb700", "#ffd000", "#ffe900"]
            return (
              <Line
                key={`compare-production-${key}`}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                name={`${key} Production (${compareScenario})`}
                strokeDasharray="5 5"
              />
            )
          })
        }
      }
      return []
    }

    // Default: demand-supply
    return [
      <Line
        key="compare-demand"
        type="monotone"
        dataKey="demand"
        stroke="#ff7300"
        name={`Total Demand (${compareScenario})`}
        strokeDasharray="5 5"
      />,
      <Line
        key="compare-supply"
        type="monotone"
        dataKey="supply"
        stroke="#ff7300"
        name={`Available Supply (${compareScenario})`}
        strokeDasharray="3 3"
      />,
    ]
  }

  // Format tooltip values
  const getTooltipFormatter = (value: any, name: string) => {
    if (name.includes("Inventory") && selectedMaterial) {
      const material = materials.find((m) => m.id === selectedMaterial)
      return [`${value} units`, material ? `${material.name} Inventory` : name]
    }
    return [value, name]
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart
        data={displayData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" label={{ value: "Week", position: "insideBottomRight", offset: -5 }} />
        <YAxis
          label={{
            value:
              dataType === "inventory"
                ? "Inventory Level (units)"
                : dataType === "production"
                  ? "Production Quantity (units)"
                  : "Quantity (units)",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip formatter={getTooltipFormatter} />
        <Legend />

        {/* Add a reference line at y=0 */}
        <ReferenceLine y={0} stroke="#666" />

        {/* Main scenario lines */}
        {getLines()}

        {/* Comparison scenario lines if applicable */}
        {compareScenario && getComparisonLines()}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

interface PieChartProps {
  data: Array<{
    name: string
    value: number
  }>
}

export function PieChart({ data }: PieChartProps) {
  const COLORS = ["#FF8042", "#FFBB28", "#00C49F"]

  // Handle empty data case
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
