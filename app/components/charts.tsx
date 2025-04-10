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

// Update the BarChart props interface:
interface BarChartProps {
  data: any[]
  compareData?: any[]
  scenario?: Scenario
  compareScenario?: Scenario | null
  materials?: MaterialItem[] // Add materials prop
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

// Update the BarChart function signature:
export function BarChart({ data = [], compareData, scenario, compareScenario, materials = [] }: BarChartProps) {
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
          {Object.keys(data[0])
            .filter((key) => key !== "week")
            .map((key, index) => (
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
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {data.length > 0 &&
          Object.keys(data[0])
            .filter((key) => key !== "name" && key !== "week")
            .map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                name={getMaterialName(key, materials)}
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
}: LineChartProps) {
  // Use the actual data from props instead of mockData
  const chartData = data?.timeSeriesData || []
  const compareChartData = compareData?.timeSeriesData || []

  // If no data is available, show a message
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  // Determine which lines to show based on dataType
  const getLines = () => {
    if (dataType === "inventory") {
      if (selectedMaterial) {
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
      return [
        <Line
          key="production"
          type="monotone"
          dataKey="supply" // Use supply as production
          stroke="#82ca9d"
          name={`Production (${scenario})`}
        />,
      ]
    }

    // Default: demand-supply
    return [
      <Line key="demand" type="monotone" dataKey="demand" stroke="#8884d8" name={`Total Demand (${scenario})`} />,
      <Line key="supply" type="monotone" dataKey="supply" stroke="#82ca9d" name={`Available Supply (${scenario})`} />,
    ]
  }

  // Get comparison lines if compareScenario is provided
  const getComparisonLines = () => {
    if (!compareScenario || compareChartData.length === 0) return []

    if (dataType === "inventory") {
      if (selectedMaterial) {
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
      return [
        <Line
          key="compare-production"
          type="monotone"
          dataKey="supply" // Use supply as production
          stroke="#ff7300"
          name={`Production (${compareScenario})`}
          strokeDasharray="5 5"
        />,
      ]
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
        data={chartData}
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
