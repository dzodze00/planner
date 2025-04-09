"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { X } from "lucide-react"
import type { FilterOptions, MaterialItem, AlertType } from "../types"

interface FilterPanelProps {
  materials: MaterialItem[]
  filterOptions: FilterOptions
  onFilterChange: (newFilters: Partial<FilterOptions>) => void
  weekRange: [number, number]
  onWeekRangeChange: (range: [number, number]) => void
}

export function FilterPanel({
  materials,
  filterOptions,
  onFilterChange,
  weekRange,
  onWeekRangeChange,
}: FilterPanelProps) {
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

  const handleFillRateChange = (value: number[]) => {
    onFilterChange({ minFillRate: value[0] / 100 })
  }

  const handleWeekRangeChange = (value: number[]) => {
    setLocalWeekRange([value[0], value[1]])
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
            <Badge key={materialId} variant="secondary" className="flex items-center gap-1">
              {material.name}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleMaterialToggle(materialId)} />
            </Badge>
          ) : null
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Accordion type="single" collapsible defaultValue="materials">
            <AccordionItem value="materials">
              <AccordionTrigger>Materials</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Finished Goods</h4>
                    <div className="space-y-2">
                      {materialsByType.FG.map((material) => (
                        <div key={material.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`material-${material.id}`}
                            checked={filterOptions.materials.includes(material.id)}
                            onCheckedChange={() => handleMaterialToggle(material.id)}
                          />
                          <Label htmlFor={`material-${material.id}`}>{material.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Intermediates</h4>
                    <div className="space-y-2">
                      {materialsByType.Intermediate.map((material) => (
                        <div key={material.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`material-${material.id}`}
                            checked={filterOptions.materials.includes(material.id)}
                            onCheckedChange={() => handleMaterialToggle(material.id)}
                          />
                          <Label htmlFor={`material-${material.id}`}>{material.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Raw Materials</h4>
                    <div className="space-y-2">
                      {materialsByType.Raw.map((material) => (
                        <div key={material.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`material-${material.id}`}
                            checked={filterOptions.materials.includes(material.id)}
                            onCheckedChange={() => handleMaterialToggle(material.id)}
                          />
                          <Label htmlFor={`material-${material.id}`}>{material.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div>
          <Accordion type="single" collapsible defaultValue="alerts">
            <AccordionItem value="alerts">
              <AccordionTrigger>Alert Types</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {alertTypes.map((alertType) => (
                    <div key={alertType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`alert-${alertType}`}
                        checked={filterOptions.alertTypes.includes(alertType)}
                        onCheckedChange={() => handleAlertTypeToggle(alertType)}
                      />
                      <Label htmlFor={`alert-${alertType}`}>{alertType}</Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div>
          <Accordion type="single" collapsible defaultValue="time">
            <AccordionItem value="time">
              <AccordionTrigger>Time Period</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Week Range</h4>
                    <div className="px-2">
                      <Slider
                        defaultValue={[localWeekRange[0], localWeekRange[1]]}
                        max={24}
                        min={14}
                        step={1}
                        onValueChange={handleWeekRangeChange}
                        className="my-6"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Week {localWeekRange[0]}</span>
                        <span>Week {localWeekRange[1]}</span>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 w-full" onClick={applyWeekRange}>
                        Apply Range
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Minimum Fill Rate</h4>
                    <div className="px-2">
                      <Slider
                        defaultValue={[filterOptions.minFillRate * 100]}
                        max={100}
                        min={0}
                        step={5}
                        onValueChange={handleFillRateChange}
                        className="my-6"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>{filterOptions.minFillRate * 100}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
