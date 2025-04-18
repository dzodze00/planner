"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import type { RawDataRow, MaterialItem } from "../types"

interface DataGridProps {
  data: RawDataRow[]
  isLoading: boolean
  materials: MaterialItem[]
}

export function DataGrid({ data, isLoading, materials }: DataGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Loading data...</p>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>No data available</p>
      </div>
    )
  }

  // Get all columns from the first row
  const columns = Object.keys(data[0])

  // Add material names to the data
  const enhancedData = data.map((row) => {
    const materialId = row.Material as string
    const material = materials.find((m) => m.id === materialId)
    return {
      ...row,
      MaterialName: material ? material.name : "Unknown",
    }
  }) as Array<RawDataRow & { MaterialName: string }>

  // Filter data based on search term
  const filteredData = enhancedData.filter((row) =>
    Object.values(row).some(
      (value) =>
        value !== null && value !== undefined && String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  )

  // Sort data if a sort column is selected
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        // Check if the property exists in the objects
        if (!(sortColumn in a) || !(sortColumn in b)) return 0

        // Use type assertion to tell TypeScript that sortColumn is a valid key
        const aValue = a[sortColumn as keyof typeof a]
        const bValue = b[sortColumn as keyof typeof b]

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue
        }

        return sortDirection === "asc"
          ? String(aValue || "").localeCompare(String(bValue || ""))
          : String(bValue || "").localeCompare(String(aValue || ""))
      })
    : filteredData

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / rowsPerPage)
  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-4 py-2 border rounded-md w-full"
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing {paginatedData.length} of {filteredData.length} rows
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[...columns, "MaterialName"].map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center">
                    {column}
                    {sortColumn === column && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={`${rowIndex}-${column}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row[column as keyof typeof row] !== undefined ? row[column as keyof typeof row] : ""}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{row.MaterialName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
