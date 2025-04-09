"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, ChevronDown, ChevronUp, Layers, Beaker, Package } from "lucide-react"

export function ProcessFlow() {
  const [expandedSteps, setExpandedSteps] = useState({
    cam: false,
    cathode: false,
  })

  type StepKey = "cam" | "cathode"
  const toggleStep = (step: StepKey) => {
    setExpandedSteps({
      ...expandedSteps,
      [step]: !expandedSteps[step],
    })
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col items-center">
          <Card className="w-64 cursor-pointer" onClick={() => toggleStep("cam")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Beaker className="h-5 w-5 text-primary" />
                  <span className="font-medium">Step 1: CAM Production</span>
                </div>
                {expandedSteps.cam ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardContent>
          </Card>

          {expandedSteps.cam && (
            <div className="mt-2 p-4 border rounded-md w-64 bg-muted/50">
              <p className="text-sm font-medium mb-2">CAM Components:</p>
              <ul className="text-sm space-y-1">
                <li>3869375 - Li2CO3</li>
                <li>5830674 - CoSO4</li>
                <li>5832940 - Co(OH)2</li>
              </ul>
              <p className="text-sm font-medium mt-3 mb-1">Result:</p>
              <p className="text-sm">3954706 - LiCoO2 1 & 2</p>
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <ArrowRight className="h-6 w-6" />
        </div>

        <div className="block md:hidden self-center">
          <ArrowRight className="h-6 w-6 rotate-90" />
        </div>

        <div className="flex flex-col items-center">
          <Card className="w-64 cursor-pointer" onClick={() => toggleStep("cathode")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <span className="font-medium">Step 2: Cathode Production</span>
                </div>
                {expandedSteps.cathode ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardContent>
          </Card>

          {expandedSteps.cathode && (
            <div className="mt-2 p-4 border rounded-md w-64 bg-muted/50">
              <p className="text-sm font-medium mb-2">Additional Components:</p>
              <ul className="text-sm space-y-1">
                <li>9968465 - NH4OH</li>
                <li>6783061 - H3PO4</li>
                <li>5375802 - Copper Foil</li>
              </ul>
              <p className="text-sm font-medium mt-3 mb-1">Result:</p>
              <p className="text-sm">3720579 - LCO Cathode 1 & 2</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="font-medium">Final Product: LCO Cathode</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Standard format LCO cathode (3720579) used by multiple companies
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
