"use client"

import { useState } from "react"
import { Search, Download, ArrowUp, ArrowDown } from "lucide-react"
import type { MaterialItem } from "../types"

interface ChangeLogTableProps {
  changes: any[]
  materials: MaterialItem[]
}

export function ChangeLogTable({ changes, materials }: ChangeLogTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // If no changes yet, show a message
  if (!changes.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No changes have been made yet. Apply recommendations to address alerts and see the changes here.
      </div>
    )
  }

  // Filter changes based on search term
  const filteredChanges = changes.filter((change) =>
    Object.values(change).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Sort changes
  const sortedChanges = [...filteredChanges].sort((a, b) => {
    if (sortField === "timestamp") {
      // For timestamp, we need to parse the date
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    }

    // For numeric fields
    if (typeof a[sortField] === "number" && typeof b[sortField] === "number") {
      return sortDirection === "asc" ? a[sortField] - b[sortField] : b[sortField] - a[sortField]
    }

    // For string fields
    return sortDirection === "asc"
      ? String(a[sortField]).localeCompare(String(b[sortField]))
      : String(b[sortField]).localeCompare(String(a[sortField]))
  })

  // Function to handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Function to export changes to CSV
  const exportChanges = () => {
    const headers = [
      "ID",
      "Timestamp",
      "Alert Type",
      "Alert Description",
      "Material",
      "Week",
      "Change Type",
      "Before",
      "After",
      "Impact",
    ]
    const csvContent = [
      headers.join(","),
      ...sortedChanges.map((change) =>
        [
          change.id,
          change.timestamp,
          change.alertType,
          `"${change.alertDescription}"`,
          change.materialName || change.item,
          change.week,
          change.changeType,
          change.before,
          change.after,
          `"${change.impact}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "change_log.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Helper function to get material name
  const getMaterialName = (materialId: string) => {
    if (!materialId) return "Unknown"
    const material = materials.find((m) => m.id === materialId)
    return material ? material.name : materialId
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search changes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-4 py-2 border rounded-md w-full"
          />
        </div>
        <button
          onClick={exportChanges}
          className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("timestamp")}
              >
                <div className="flex items-center">
                  Timestamp
                  {sortField === "timestamp" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp className="ml-1 h-3 w-3" />
                    ) : (
                      <ArrowDown className="ml-1 h-3 w-3" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("alertType")}
              >
                <div className="flex items-center">
                  Alert Type
                  {sortField === "alertType" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp className="ml-1 h-3 w-3" />
                    ) : (
                      <ArrowDown className="ml-1 h-3 w-3" />
                    ))}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alert Description
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("materialName")}
              >
                <div className="flex items-center">
                  Material
                  {sortField === "materialName" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp className="ml-1 h-3 w-3" />
                    ) : (
                      <ArrowDown className="ml-1 h-3 w-3" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("week")}
              >
                <div className="flex items-center">
                  Week
                  {sortField === "week" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp className="ml-1 h-3 w-3" />
                    ) : (
                      <ArrowDown className="ml-1 h-3 w-3" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("changeType")}
              >
                <div className="flex items-center">
                  Change Type
                  {sortField === "changeType" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp className="ml-1 h-3 w-3" />
                    ) : (
                      <ArrowDown className="ml-1 h-3 w-3" />
                    ))}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Before → After
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedChanges.map((change) => (
              <tr key={change.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.timestamp}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      change.alertType === "Critical"
                        ? "bg-red-100 text-red-800"
                        : change.alertType === "Capacity"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {change.alertType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.alertDescription}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {change.materialName || getMaterialName(change.item)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.week}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.changeType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {change.before} → {change.after}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.impact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredChanges.length} of {changes.length} changes
      </div>
    </div>
  )
}
