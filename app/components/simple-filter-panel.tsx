"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { FilterOptions, MaterialItem, AlertType } from "../types"

interface SimpleFilterPanelProps {
  materials: MaterialItem[]
  filterOptions: FilterOptions
  onFilterChange: (newFilters: Partial<FilterOptions>) => void
  weekRange: [number, number]
  onWeekRangeChange: (range: [number, number]) => void
}

export function SimpleFilterPanel({
  materials,
  filterOptions,
  onFilterChange,
  weekRange,
  onWeekRangeChange,
}: SimpleFilterPanelProps) {
  const [localWeekRange, setLocalWeekRange] = useState<[number, number]>(weekRange)

  const handleMaterialToggle = (materialId: string) => {
    const newMaterials = filterOptions.materials.includes(materialId)
      ? filterOptions.materials.filter((id) => id !== materialId)
      : [...filterOptions.materials, materialId]

    onFilterChange({ materials: newMaterials })
  }

  const handleAlertTypeToggle = (alertType: AlertType) => {
    const newAlertTypes = filterOptions.alertTypes.includes(alertType)
      ? filterOptions.alertTypes.filter((type) => type !== alertType)
      : [...filterOptions.alertTypes, alertType]

    onFilterChange({ alertTypes: newAlertTypes })
  }

  const handleFillRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ minFillRate: Number(e.target.value) / 100 })
  }

  const handleWeekRangeChange = (isStart: boolean, value: string) => {
    const numValue = Number(value)
    if (isStart) {
      setLocalWeekRange([numValue, localWeekRange[1]])
    } else {
      setLocalWeekRange([localWeekRange[0], numValue])
    }
  }

  const applyWeekRange = () => {
    onWeekRangeChange(localWeekRange)
  }

  const clearAllFilters = () => {
    onFilterChange({
      materials: [],
      alertTypes: ["Critical", "Capacity", "Supporting"],
      minFillRate: 0,
    })
    setLocalWeekRange([14, 24])
    onWeekRangeChange([14, 24])
  }

  const materialsByType = {
    FG: materials.filter((m) => m.type === "FG"),
    Intermediate: materials.filter((m) => m.type === "Intermediate"),
    Raw: materials.filter((m) => m.type === "Raw"),
  }

  const alertTypes: AlertType[] = ["Critical", "Capacity", "Supporting"]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Data Filters</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {filterOptions.materials.map((materialId) => {
          const material = materials.find((m) => m.id === materialId)
          return material ? (
            <span key={materialId} className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1">
              {material.name}
              <button
                onClick={() => handleMaterialToggle(materialId)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </span>
          ) : null
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-md p-4">
          <h4 className="font-medium mb-4">Materials</h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-medium mb-2">Finished Goods</h5>
              <div className="space-y-2">
                {materialsByType.FG.map((material) => (
                  <div key={material.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`material-${material.id}`}
                      checked={filterOptions.materials.includes(material.id)}
                      onChange={() => handleMaterialToggle(material.id)}
                    />
                    <label htmlFor={`material-${material.id}`}>{material.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Intermediates</h5>
              <div className="space-y-2">
                {materialsByType.Intermediate.map((material) => (
                  <div key={material.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`material-${material.id}`}
                      checked={filterOptions.materials.includes(material.id)}
                      onChange={() => handleMaterialToggle(material.id)}
                    />
                    <label htmlFor={`material-${material.id}`}>{material.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Raw Materials</h5>
              <div className="space-y-2">
                {materialsByType.Raw.map((material) => (
                  <div key={material.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`material-${material.id}`}
                      checked={filterOptions.materials.includes(material.id)}
                      onChange={() => handleMaterialToggle(material.id)}
                    />
                    <label htmlFor={`material-${material.id}`}>{material.name}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-md p-4">
          <h4 className="font-medium mb-4">Alert Types</h4>
          <div className="space-y-2">
            {alertTypes.map((alertType) => (
              <div key={alertType} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`alert-${alertType}`}
                  checked={filterOptions.alertTypes.includes(alertType)}
                  onChange={() => handleAlertTypeToggle(alertType)}
                />
                <label htmlFor={`alert-${alertType}`}>{alertType}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-md p-4">
          <h4 className="font-medium mb-4">Time Period</h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-medium mb-2">Week Range</h5>
              <div className="flex items-center gap-2">
                <select
                  value={localWeekRange[0]}
                  onChange={(e) => handleWeekRangeChange(true, e.target.value)}
                  className="border rounded p-1"
                >
                  {Array.from({ length: 11 }, (_, i) => i + 14).map((week) => (
                    <option key={week} value={week}>
                      Week {week}
                    </option>
                  ))}
                </select>
                <span>to</span>
                <select
                  value={localWeekRange[1]}
                  onChange={(e) => handleWeekRangeChange(false, e.target.value)}
                  className="border rounded p-1"
                >
                  {Array.from({ length: 11 }, (_, i) => i + 14).map((week) => (
                    <option key={week} value={week}>
                      Week {week}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={applyWeekRange}>
                  Apply
                </Button>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Minimum Fill Rate</h5>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filterOptions.minFillRate * 100}
                  onChange={handleFillRateChange}
                  className="w-full"
                />
                <span>{(filterOptions.minFillRate * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
