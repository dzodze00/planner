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

interface BarChartProps {
  data: any[]
  compareData?: any[]
  scenario?: Scenario
  compareScenario?: Scenario | null
}

export function BarChart({ data = [], compareData, scenario, compareScenario }: BarChartProps) {
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
          <Tooltip />
          <Legend />
          {Object.keys(data[0])
            .filter((key) => key !== "week")
            .map((key, index) => (
              <Bar
                key={`${scenario}-${key}`}
                dataKey={key}
                fill={colors[index % colors.length]}
                name={`${key} (${scenario})`}
              />
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
            .map((key, index) => <Bar key={key} dataKey={key} fill={colors[index % colors.length]} name={key} />)}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

interface LineChartProps {
  scenario: Scenario
  compareScenario: Scenario | null
  data: any | null
  compareData: any | null
  weekRange?: [number, number]
  dataType?: "demand-supply" | "inventory" | "production"
}

export function LineChart({
  scenario,
  compareScenario,
  data,
  compareData,
  weekRange = [14, 24],
  dataType = "demand-supply",
}: LineChartProps) {
  // This would use the actual data from the CSV files
  // For now, using placeholder data
  const mockData = [
    { week: "14", demand: 1000, supply: 950, inventory: 200 },
    { week: "15", demand: 1100, supply: 1050, inventory: 150 },
    { week: "16", demand: 1200, supply: 1150, inventory: 100 },
    { week: "17", demand: 1150, supply: 1200, inventory: 150 },
    { week: "18", demand: 1250, supply: 1300, inventory: 200 },
    { week: "19", demand: 1300, supply: 1350, inventory: 250 },
    { week: "20", demand: 1350, supply: 1400, inventory: 300 },
    { week: "21", demand: 1400, supply: 1450, inventory: 350 },
    { week: "22", demand: 1450, supply: 1500, inventory: 400 },
    { week: "23", demand: 1500, supply: 1550, inventory: 450 },
    { week: "24", demand: 1550, supply: 1600, inventory: 500 },
  ]

  // Filter data by week range
  const filteredData = mockData.filter(
    (d) => Number.parseInt(d.week) >= weekRange[0] && Number.parseInt(d.week) <= weekRange[1],
  )

  // Determine which lines to show based on dataType
  const getLines = () => {
    if (dataType === "inventory") {
      return [
        <Line
          key="inventory"
          type="monotone"
          dataKey="inventory"
          stroke="#ffc658"
          name={`Planned Inventory (${scenario})`}
        />,
      ]
    }

    if (dataType === "production") {
      return [
        <Line
          key="production"
          type="monotone"
          dataKey="production"
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
    if (!compareScenario) return []

    if (dataType === "inventory") {
      return [
        <Line
          key="compare-inventory"
          type="monotone"
          dataKey="inventory"
          stroke="#ff7300"
          name={`Planned Inventory (${compareScenario})`}
          strokeDasharray="5 5"
        />,
      ]
    }

    if (dataType === "production") {
      return [
        <Line
          key="compare-production"
          type="monotone"
          dataKey="production"
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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart
        data={filteredData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" label={{ value: "Week", position: "insideBottomRight", offset: -5 }} />
        <YAxis label={{ value: "Quantity", angle: -90, position: "insideLeft" }} />
        <Tooltip />
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
