"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, TrendingUp, BarChart3, Check } from 'lucide-react'
import type { AlertData, MaterialItem, ScenarioData } from "../types"

interface AlertRecommendationsProps {
  alert: AlertData
  materials: MaterialItem[]
  onApplyRecommendation: (alertId: number, changes: any, changeDetails: any) => void
  scenarioData: ScenarioData | null
}

export function AlertRecommendation({
  alert,
  materials,
  onApplyRecommendation,
  scenarioData,
}: AlertRecommendationsProps) {
  const [isApplied, setIsApplied] = useState(false)

  const material = materials.find((m) => m.id === alert.item)
  const materialName = material ? material.name : alert.item

  // Calculate the specific changes that will be made when applying this recommendation
  const calculateChanges = () => {
    if (!scenarioData) return null

    const changes = {
      timeSeriesData: [...scenarioData.timeSeriesData],
      inventoryData: { ...scenarioData.inventoryData },
      productionData: [...scenarioData.productionData],
      alertResolved: alert.id,
    }

    const weekIndex = changes.timeSeriesData.findIndex((d) => d.week === alert.week)
    if (weekIndex === -1) return changes

    const changeDetails = {
      alertId: alert.id,
      alertType: alert.type,
      alertDescription: alert.description,
      item: alert.item,
      materialName,
      week: alert.week,
      changeType: "",
      before: 0,
      after: 0,
      impact: "",
    }

    if (alert.type === "Critical") {
      if (alert.description.includes("Supply less than Total Demand")) {
        // Increase supply by 15%
        const currentSupply = changes.timeSeriesData[weekIndex].supply
        const supplyIncrease = Math.round(currentSupply * 0.15)
        changes.timeSeriesData[weekIndex].supply += supplyIncrease

        // Update fill rate
        const demand = changes.timeSeriesData[weekIndex].demand
        changes.timeSeriesData[weekIndex].fillRate = changes.timeSeriesData[weekIndex].supply / demand

        // Update production data if it exists for this material
        const prodIndex = changes.productionData.findIndex((d) => d.week === alert.week)
        if (prodIndex !== -1 && changes.productionData[prodIndex][alert.item]) {
          changes.productionData[prodIndex][alert.item] =
            (changes.productionData[prodIndex][alert.item] as number) + supplyIncrease
        }

        // Update change details
        changeDetails.changeType = "Supply Increase"
        changeDetails.before = currentSupply
        changeDetails.after = currentSupply + supplyIncrease
        changeDetails.impact = `Increased supply by ${supplyIncrease} units (15%), improving fill rate from ${(currentSupply / demand).toFixed(2)} to ${(changes.timeSeriesData[weekIndex].fillRate).toFixed(2)}`
      } else if (alert.description.includes("Inventory not available")) {
        // Increase inventory by 100 units
        if (changes.inventoryData[alert.item]) {
          const weekNum = Number.parseInt(alert.week) - 14 // Assuming weeks start at 14
          if (weekNum >= 0 && weekNum < changes.inventoryData[alert.item].length) {
            const currentInventory = changes.inventoryData[alert.item][weekNum]
            changes.inventoryData[alert.item][weekNum] += 100

            // Also update inventory in time series
            const currentTimeSeriesInventory = changes.timeSeriesData[weekIndex].inventory
            changes.timeSeriesData[weekIndex].inventory += 100

            // Update change details
            changeDetails.changeType = "Inventory Increase"
            changeDetails.before = currentInventory
            changeDetails.after = currentInventory + 100
            changeDetails.impact = `Added 100 units to inventory, ensuring sufficient buffer for demand fluctuations`
          }
        }
      }
    } else if (alert.type === "Capacity") {
      if (alert.description.includes("Exceed Allocated Capacity")) {
        // Increase production capacity by 20%
        const prodIndex = changes.productionData.findIndex((d) => d.week === alert.week)
        if (prodIndex !== -1 && changes.productionData[prodIndex][alert.item]) {
          const currentProduction = changes.productionData[prodIndex][alert.item] as number
          const increase = Math.round(currentProduction * 0.2)
          changes.productionData[prodIndex][alert.item] = currentProduction + increase

          // Also update supply in time series
          const currentSupply = changes.timeSeriesData[weekIndex].supply
          changes.timeSeriesData[weekIndex].supply += increase

          // Update fill rate
          const demand = changes.timeSeriesData[weekIndex].demand
          const oldFillRate = changes.timeSeriesData[weekIndex].fillRate || 0
          changes.timeSeriesData[weekIndex].fillRate = changes.timeSeriesData[weekIndex].supply / demand

          // Update change details
          changeDetails.changeType = "Capacity Increase"
          changeDetails.before = currentProduction
          changeDetails.after = currentProduction + increase
          changeDetails.impact = `Increased production capacity by ${increase} units (20%), improving fill rate from ${oldFillRate.toFixed(2)} to ${changes.timeSeriesData[weekIndex].fillRate.toFixed(2)}`
        }
      }
    } else if (alert.type === "Supporting") {
      if (alert.description.includes("Below Safety Stock")) {
        // Increase inventory by 75 units
        if (changes.inventoryData[alert.item]) {
          const weekNum = Number.parseInt(alert.week) - 14 // Assuming weeks start at 14
          if (weekNum >= 0 && weekNum < changes.inventoryData[alert.item].length) {
            const currentInventory = changes.inventoryData[alert.item][weekNum]
            changes.inventoryData[alert.item][weekNum] += 75

            // Also update inventory in time series
            const currentTimeSeriesInventory = changes.timeSeriesData[weekIndex].inventory
            changes.timeSeriesData[weekIndex].inventory += 75

            // Update change details
            changeDetails.changeType = "Safety Stock Adjustment"
            changeDetails.before = currentInventory
            changeDetails.after = currentInventory + 75
            changeDetails.impact = `Increased safety stock by 75 units to prevent stockouts and improve service level`
          }
        }
      } else if (alert.description.includes("Sales Orders Exceed Forecast")) {
        // Increase forecast by 10%
        const currentDemand = changes.timeSeriesData[weekIndex].demand
        const demandIncrease = Math.round(currentDemand * 0.1)
        changes.timeSeriesData[weekIndex].demand += demandIncrease

        // Update fill rate
        const supply = changes.timeSeriesData[weekIndex].supply
        const oldFillRate = changes.timeSeriesData[weekIndex].fillRate || 0
        changes.timeSeriesData[weekIndex].fillRate = supply / changes.timeSeriesData[weekIndex].demand

        // Update change details
        changeDetails.changeType = "Forecast Adjustment"
        changeDetails.before = currentDemand
        changeDetails.after = currentDemand + demandIncrease
        changeDetails.impact = `Increased forecast by ${demandIncrease} units (10%) to better align with actual sales orders`
      } else if (alert.description.includes("Exceeds Minimum Order Quantity")) {
        // Optimize order quantities
        const prodIndex = changes.productionData.findIndex((d) => d.week === alert.week)
        if (prodIndex !== -1 && changes.productionData[prodIndex][alert.item]) {
          const currentProduction = changes.productionData[prodIndex][alert.item] as number
          // Reduce by 10% to optimize
          const reduction = Math.round(currentProduction * 0.1)
          changes.productionData[prodIndex][alert.item] = currentProduction - reduction

          // Update change details
          changeDetails.changeType = "Order Quantity Optimization"
          changeDetails.before = currentProduction
          changeDetails.after = currentProduction - reduction
          changeDetails.impact = `Reduced order quantity by ${reduction} units (10%) to optimize inventory levels and reduce holding costs`
        }
      }
    }

    return { changes, changeDetails }
  }

  const handleApply = () => {
    setIsApplied(true)
    const result = calculateChanges()
    if (result) {
      onApplyRecommendation(alert.id, result.changes, result.changeDetails)
    }
  }

  // Generate recommendations based on alert type and description
  const getRecommendation = () => {
    if (alert.type === "Critical") {
      if (alert.description.includes("Supply less than Total Demand")) {
        return {
          title: "Increase Supply to Meet Demand",
          steps: [
            `Increase production of ${materialName} by 15% (approximately 150-200 units) for week ${alert.week}`,
            "Expedite existing purchase orders from suppliers",
            "Consider moving sales orders to later weeks if possible",
          ],
          impact: "This will increase fill rate by approximately 8-10% and eliminate the critical alert.",
        }
      } else if (alert.description.includes("Inventory not available")) {
        return {
          title: "Address Inventory Shortage",
          steps: [
            `Increase safety stock of ${materialName} by 100 units before week ${alert.week}`,
            "Expedite production orders for preceding weeks",
            "Review and potentially reschedule customer orders to balance demand",
          ],
          impact: "This will ensure sufficient inventory to meet demand and prevent stockouts.",
        }
      }
    } else if (alert.type === "Capacity") {
      if (alert.description.includes("Exceed Allocated Capacity")) {
        return {
          title: "Resolve Capacity Constraint",
          steps: [
            `Increase production capacity for ${materialName} by 20% for week ${alert.week}`,
            "Consider overtime or additional shifts",
            "Evaluate outsourcing options for peak demand periods",
          ],
          impact: "This will allow meeting production targets without exceeding normal capacity limits.",
        }
      }
    } else if (alert.type === "Supporting") {
      if (alert.description.includes("Below Safety Stock")) {
        return {
          title: "Restore Safety Stock Levels",
          steps: [
            `Increase inventory of ${materialName} by 75 units before week ${alert.week}`,
            "Adjust reorder points in the planning system",
            "Review lead times with suppliers to prevent future shortages",
          ],
          impact: "This will restore safety stock levels and reduce risk of stockouts.",
        }
      } else if (alert.description.includes("Sales Orders Exceed Forecast")) {
        return {
          title: "Adjust Forecast and Production",
          steps: [
            `Increase forecast for ${materialName} by 10% for week ${alert.week} and subsequent weeks`,
            "Increase production orders to match the new forecast",
            "Review sales patterns to improve future forecasting accuracy",
          ],
          impact: "This will align planning with actual demand and improve fill rates.",
        }
      } else if (alert.description.includes("Exceeds Minimum Order Quantity")) {
        return {
          title: "Optimize Order Quantities",
          steps: [
            `Reduce planned orders for ${materialName} to match economic order quantity`,
            "Consolidate orders across multiple weeks where possible",
            "Negotiate with suppliers for more flexible ordering terms",
          ],
          impact: "This will reduce excess inventory while maintaining service levels.",
        }
      }
    }

    // Default recommendation if no specific match
    return {
      title: "General Recommendation",
      steps: [
        `Review planning parameters for ${materialName}`,
        "Analyze historical data to identify patterns",
        "Consult with planning team for specific actions",
      ],
      impact: "This will help address the alert through standard planning procedures.",
    }
  }

  const recommendation = getRecommendation()

  return (
    <Card
      className={`border-l-4 ${
        alert.type === "Critical"
          ? "border-l-red-500"
          : alert.type === "Capacity"
            ? "border-l-orange-500"
            : "border-l-yellow-500"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          {alert.type === "Critical" && <AlertCircle className="inline h-4 w-4 mr-2 text-red-500" />}
          {alert.type === "Capacity" && <TrendingUp className="inline h-4 w-4 mr-2 text-orange-500" />}
          {alert.type === "Supporting" && <BarChart3 className="inline h-4 w-4 mr-2 text-yellow-500" />}
          {recommendation.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Alert: {alert.description}</p>
          <p className="text-sm text-gray-500">
            Material: {materialName} (Week {alert.week})
          </p>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Recommended Actions:</h4>
          <ol className="list-decimal pl-5 space-y-1">
            {recommendation.steps.map((step, index) => (
              <li key={index} className="text-sm">
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Expected Impact:</h4>
          <p className="text-sm">{recommendation.impact}</p>
        </div>

        <div className="flex justify-end">
          {isApplied ? (
            <span className="inline-flex items-center text-green-600 text-sm">
              <Check className="h-4 w-4 mr-1" /> Recommendation applied
            </span>
          ) : (
            <Button onClick={handleApply} size="sm">
              Apply Recommendation
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function AlertRecommendations({
  alerts,
  materials,
  scenarioData,
  onUpdateData,
}: {
  alerts: AlertData[]
  materials: MaterialItem[]
  scenarioData: ScenarioData | null
  onUpdateData: (newData: ScenarioData, changeDetails: any) => void
}) {
  const [appliedCount, setAppliedCount] = useState(0)
  const [resolvedAlerts, setResolvedAlerts] = useState<number[]>([])

  const handleApplyRecommendation = (alertId: number, changes: any, changeDetails: any) => {
    setAppliedCount((prev) => prev + 1)
    setResolvedAlerts((prev) => [...prev, alertId])

    if (scenarioData && changes) {
      // Create a new scenario data object with the changes
      const newData = {
        ...scenarioData,
        timeSeriesData: changes.timeSeriesData,
        inventoryData: changes.inventoryData,
        productionData: changes.productionData,
      }

      // Update the parent component with the new data and change details
      onUpdateData(newData, changeDetails)
    }
  }

  // Sort alerts by type (Critical first, then Capacity, then Supporting)
  // and filter out resolved alerts
  const sortedAlerts = [...alerts]
    .filter((alert) => !resolvedAlerts.includes(alert.id))
    .sort((a, b) => {
      const typeOrder = { Critical: 0, Capacity: 1, Supporting: 2 }
      return typeOrder[a.type] - typeOrder[b.type]
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Alert Recommendations</h3>
        <div className="text-sm text-gray-500">
          {appliedCount} of {alerts.length} recommendations applied
        </div>
      </div>

      {sortedAlerts.length > 0 ? (
        <div className="space-y-4">
          {sortedAlerts.map((alert) => (
            <AlertRecommendation
              key={alert.id}
              alert={alert}
              materials={materials}
              onApplyRecommendation={handleApplyRecommendation}
              scenarioData={scenarioData}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {appliedCount > 0
            ? "All recommendations have been applied. Operations are now running optimally."
            : "No alerts to address. All operations are running optimally."}
        </div>
      )}
    </div>
  )
}
