"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Package, ShoppingCart, BarChart3, AlertCircle, ArrowRight } from 'lucide-react'
import type { Scenario } from "../types"
import { kpiData } from "../data/dashboard-data"

interface KpiCardsProps {
  scenario: Scenario
  compareScenario?: Scenario
  week: string
}

export function KpiCards({ scenario, compareScenario, week }: KpiCardsProps) {
  // Use the data from our data file
  const weekData = kpiData[scenario][week] || kpiData[scenario]["14"] // Default to week 14 if not found
  const compareWeekData = compareScenario ? kpiData[compareScenario][week] || kpiData[compareScenario]["14"] : null

  const getComparisonElement = (current: number, compare?: number) => {
    if (!compare) return null

    const diff = current - compare
    const percentDiff = (diff / compare) * 100

    return (
      <div className="flex items-center gap-1 text-xs">
        {diff > 0 ? (
          <TrendingUp className={`h-3 w-3 ${diff > 0 ? "text-green-500" : "text-red-500"}`} />
        ) : (
          <TrendingDown className={`h-3 w-3 ${diff < 0 ? "text-green-500" : "text-red-500"}`} />
        )}
        <span className={diff > 0 ? "text-green-500" : "text-red-500"}>
          {diff > 0 ? "+" : ""}
          {diff.toFixed(1)} ({percentDiff.toFixed(1)}%)
        </span>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Demand</CardTitle>
          <ShoppingCart className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weekData.totalDemand}</div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">Week {week}</p>
            {compareWeekData && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ArrowRight className="h-3 w-3" />
                <span>{compareWeekData.totalDemand}</span>
              </div>
            )}
          </div>
          {getComparisonElement(weekData.totalDemand, compareWeekData?.totalDemand)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Fill Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(weekData.fillRate * 100).toFixed(1)}%</div>
          <div className="flex items-center gap-2">
            {weekData.fillRate >= 0.95 ? (
              <span className="text-green-500 flex items-center text-xs">
                <TrendingUp className="h-3 w-3 mr-1" /> Good
              </span>
            ) : (
              <span className="text-amber-500 flex items-center text-xs">
                <TrendingDown className="h-3 w-3 mr-1" /> Needs Improvement
              </span>
            )}
            {compareWeekData && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ArrowRight className="h-3 w-3" />
                <span>{(compareWeekData.fillRate * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
          {getComparisonElement(weekData.fillRate, compareWeekData?.fillRate)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Planned Inventory</CardTitle>
          <Package className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weekData.plannedInventory}</div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">Week {week}</p>
            {compareWeekData && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ArrowRight className="h-3 w-3" />
                <span>{compareWeekData.plannedInventory}</span>
              </div>
            )}
          </div>
          {getComparisonElement(weekData.plannedInventory, compareWeekData?.plannedInventory)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Forecast Error</CardTitle>
          <BarChart3 className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(weekData.forecastError * 100).toFixed(1)}%</div>
          <div className="flex items-center gap-2">
            {weekData.forecastError <= 0.05 ? (
              <span className="text-green-500 flex items-center text-xs">
                <TrendingDown className="h-3 w-3 mr-1" /> Low
              </span>
            ) : (
              <span className="text-amber-500 flex items-center text-xs">
                <AlertCircle className="h-3 w-3 mr-1" /> Moderate
              </span>
            )}
            {compareWeekData && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ArrowRight className="h-3 w-3" />
                <span>{(compareWeekData.forecastError * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
          {getComparisonElement(-weekData.forecastError, -compareWeekData?.forecastError)}
        </CardContent>
      </Card>
    </div>
  )
}
