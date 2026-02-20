"use client"

import { useApp } from "@/lib/app-context"
import type { WelfareScore } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Shield, TrendingUp, TrendingDown, Minus } from "lucide-react"

function getRiskColor(risk: WelfareScore["riskCategory"]) {
  if (risk === "High") return "bg-destructive text-destructive-foreground"
  if (risk === "Medium") return "bg-chart-3 text-primary-foreground"
  return "bg-accent text-accent-foreground"
}

function getRiskIcon(risk: WelfareScore["riskCategory"]) {
  if (risk === "High") return <TrendingUp className="h-4 w-4" />
  if (risk === "Medium") return <Minus className="h-4 w-4" />
  return <TrendingDown className="h-4 w-4" />
}

export function WelfareScoreCard({
  score,
  label,
}: {
  score: WelfareScore
  label?: string
}) {
  const { t } = useApp()

  const breakdownItems = [
    { key: t("income"), value: score.income, max: 30 },
    { key: t("dependents"), value: score.dependents, max: 20 },
    { key: t("insurance"), value: score.insurance, max: 25 },
    { key: t("occupation"), value: score.occupation, max: 15 },
    { key: t("education"), value: score.education, max: 10 },
  ]

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="h-5 w-5 text-primary" />
          {label || t("welfareScore")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-4">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-primary/20">
            <div
              className="absolute inset-1 rounded-full"
              style={{
                background: `conic-gradient(var(--primary) ${score.total * 3.6}deg, var(--muted) ${score.total * 3.6}deg)`,
                opacity: 0.15,
              }}
            />
            <span className="text-3xl font-bold text-foreground">{score.total}</span>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">{t("riskCategory")}</p>
            <Badge className={`${getRiskColor(score.riskCategory)} w-fit`}>
              {getRiskIcon(score.riskCategory)}
              <span className="ml-1">
                {score.riskCategory === "High" ? t("high") : score.riskCategory === "Medium" ? t("medium") : t("low")}
              </span>
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">{t("scoreBreakdown")}</p>
          {breakdownItems.map((item) => (
            <div key={item.key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.key}</span>
                <span>{item.value}/{item.max}</span>
              </div>
              <Progress value={(item.value / item.max) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
