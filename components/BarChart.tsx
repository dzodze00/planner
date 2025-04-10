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
} from "recharts"

interface BarChartProps {
  data: any[]
  stacked?: boolean
  materialNames?: string[]
}

export function BarChart({ data, stacked = false, materialNames = [] }: BarChartProps) {
  if (!data || data.length === 0) {
    return <p>No data to display.</p>
  }

  // Get all keys except 'name' to determine what bars to render
  const dataKeys = Object.keys(data[0]).filter((key) => key !== "name")

  // Colors for the bars
  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value, name) => {
            // Try to find a material name for this key
            const materialIndex = materialNames.findIndex((m) => m === name)
            if (materialIndex >= 0) {
              return [value, name]
            }
            return [value, name]
          }}
        />
        <Legend />

        {dataKeys.map((key, index) => (
          <Bar key={key} dataKey={key} fill={colors[index % colors.length]} stackId={stacked ? "stack" : undefined} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
