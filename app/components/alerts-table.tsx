"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, TrendingUp, BarChart3, Search, Download, ArrowRight } from 'lucide-react'
import type { Scenario, AlertData, FilterOptions, MaterialItem } from "../types"
import { alertsData } from "../data/dashboard-data"

interface AlertsTableProps {
  scenario: Scenario
  filterOptions: FilterOptions
  materials: MaterialItem[]
}

export function AlertsTable({ scenario, filterOptions, materials }: AlertsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [alerts, setAlerts] = useState<AlertData[]>([])

  // Initialize alerts from the alertsData
  useEffect(() => {
    setAlerts(alertsData[scenario] || [])
  }, [scenario])

  // Add material names to alerts
  const enhancedAlerts = alerts.map((alert) => {
    const material = materials.find((m) => m.id === alert.item)
    return {
      ...alert,
      itemName: material ? material.name : "Unknown",
    }
  })

  // Apply filters
  const filteredAlerts = enhancedAlerts.filter((alert) => {
    // Filter by alert type
    if (!filterOptions.alertTypes.includes(alert.type)) {
      return false
    }

    // Filter by material
    if (filterOptions.materials.length > 0 && !filterOptions.materials.includes(alert.item)) {
      return false
    }

    // Filter by search term
    if (
      searchTerm &&
      !Object.values(alert).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false
    }

    return true
  })

  const exportAlerts = () => {
    const csvContent = [
      ["ID", "Type", "Description", "Week", "Item", "Item Name"].join(","),
      ...filteredAlerts.map((alert) =>
        [alert.id, alert.type, `"${alert.description}"`, alert.week, alert.item, `"${alert.itemName}"`].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${scenario}_alerts.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-4 py-2 border rounded-md w-full"
          />
        </div>
        <Button variant="outline" size="sm" onClick={exportAlerts}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        alert.type === "Critical"
                          ? "bg-red-100 text-red-800"
                          : alert.type === "Capacity"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {alert.type === "Critical" && <AlertCircle className="inline h-3 w-3 mr-1" />}
                      {alert.type === "Capacity" && <TrendingUp className="inline h-3 w-3 mr-1" />}
                      {alert.type === "Supporting" && <BarChart3 className="inline h-3 w-3 mr-1" />}
                      {alert.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.week}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.item}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.itemName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a href="#prescriptive-actions" className="text-blue-600 hover:text-blue-800 flex items-center">
                      View Fix <ArrowRight className="ml-1 h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No alerts match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredAlerts.length} of {alerts.length} alerts
      </div>
    </div>
  )
}
