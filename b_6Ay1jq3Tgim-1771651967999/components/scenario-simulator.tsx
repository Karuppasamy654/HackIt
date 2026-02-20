"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/lib/app-context"
import { SCHEMES } from "@/lib/schemes"
import { calculateWelfareScore, getEligibleSchemes, rankSchemes, getFutureRecommendations } from "@/lib/scoring"
import type { Profile } from "@/lib/types"
import { WelfareScoreCard } from "@/components/welfare-score-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sliders, RotateCcw, Save, ExternalLink, IndianRupee, Calendar } from "lucide-react"

export function ScenarioSimulator() {
  const { t, currentUser, getProfile, updateProfile, getUserApplications } = useApp()

  const profile = currentUser ? getProfile(currentUser.id) : null
  const apps = currentUser ? getUserApplications(currentUser.id) : []
  const completedCount = apps.filter((a) => a.status === "Completed").length

  const [incomeOverride, setIncomeOverride] = useState(profile?.income || 200000)
  const [ageOffset, setAgeOffset] = useState(0)

  const currentScore = useMemo(
    () => (profile ? calculateWelfareScore(profile, completedCount) : null),
    [profile, completedCount]
  )

  const simulatedProfile: Profile | null = useMemo(() => {
    if (!profile) return null
    return {
      ...profile,
      income: incomeOverride,
      age: profile.age + ageOffset,
    }
  }, [profile, incomeOverride, ageOffset])

  const simulatedScore = useMemo(
    () => (simulatedProfile ? calculateWelfareScore(simulatedProfile, completedCount) : null),
    [simulatedProfile, completedCount]
  )

  const simulatedRecommendations = useMemo(() => {
    if (!simulatedProfile || !simulatedScore) return []
    const eligible = getEligibleSchemes(simulatedProfile, SCHEMES)
    return rankSchemes(simulatedProfile, eligible, simulatedScore).slice(0, 3)
  }, [simulatedProfile, simulatedScore])

  const familyMembers = profile?.familyMembers || []
  const familyMembersTotalIncome = familyMembers.reduce((sum, m) => sum + (m.annualIncome || 0), 0)
  const currentHouseholdIncome = profile ? profile.income + familyMembersTotalIncome : 0
  const simulatedHouseholdIncome = incomeOverride + familyMembersTotalIncome
  const futureRecs = simulatedProfile ? getFutureRecommendations(simulatedProfile) : []

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val)
  }

  function handleReset() {
    if (!profile) return
    setIncomeOverride(profile.income)
    setAgeOffset(0)
  }

  function handleApply() {
    if (!simulatedProfile) return
    updateProfile(simulatedProfile)
    handleReset()
  }

  if (!profile) {
    return (
      <Card className="border-border">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{t("completeProfile")}</p>
        </CardContent>
      </Card>
    )
  }

  const scoreDiff = simulatedScore && currentScore ? simulatedScore.total - currentScore.total : 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Sliders className="h-6 w-6 text-primary" />
          {t("scenarioSimulator")}
        </h1>
        <p className="text-muted-foreground">{t("simulatorDesc")}</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-sm text-primary">{t("simulationNote")}</p>
        </CardContent>
      </Card>

      {/* Total household income & family breakdown */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <IndianRupee className="h-4 w-4 text-primary" />
            {t("totalHouseholdIncome")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("yourIncome")}: {formatCurrency(profile.income)}
            {familyMembers.length > 0 && (
              <> + {t("numberOfEarningMembers")} ({familyMembers.length}): {formatCurrency(familyMembersTotalIncome)}</>
            )}
            {" → "}
            <span className="font-medium text-foreground">{formatCurrency(currentHouseholdIncome)}</span>
            {familyMembers.length > 0 && (
              <span className="block mt-1">
                {t("familySizeSimulator")}: {profile.familySize} · {t("numberOfEarningMembers")}: {familyMembers.length} ({familyMembers.map((m, i) => (
                  <span key={i}>Member {i + 1}: {m.occupation} {formatCurrency(m.annualIncome || 0)}{i < familyMembers.length - 1 ? "; " : ""}</span>
                ))})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Simulated household total: <span className="font-medium text-foreground">{formatCurrency(simulatedHouseholdIncome)}</span>
            {" "}({t("yourIncome")} {formatCurrency(incomeOverride)}
            {familyMembers.length > 0 && <> + {formatCurrency(familyMembersTotalIncome)}</>})
          </p>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base text-foreground">{t("incomeChange")}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Current: {formatCurrency(profile.income)}
            {" | "}
            Simulated: {formatCurrency(incomeOverride)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Slider
            min={0}
            max={1500000}
            step={10000}
            value={[incomeOverride]}
            onValueChange={([v]) => setIncomeOverride(v)}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Rs 0</span>
            <span>Rs 15,00,000</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base text-foreground">{t("ageIncrease")}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Current: {profile.age} years | Simulated: {profile.age + ageOffset} years
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          {[0, 5, 10, 15, 20].map((val) => (
            <Button
              key={val}
              variant={ageOffset === val ? "default" : "outline"}
              size="sm"
              onClick={() => setAgeOffset(val)}
            >
              +{val}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Separator />

      {/* Results */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {currentScore && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t("currentScore")}</h3>
            <WelfareScoreCard score={currentScore} label={t("currentScore")} />
          </div>
        )}
        {simulatedScore && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">{t("simulatedScore")}</h3>
              {scoreDiff !== 0 && (
                <Badge variant={scoreDiff > 0 ? "default" : "secondary"}>
                  {scoreDiff > 0 ? "+" : ""}{scoreDiff} points
                </Badge>
              )}
            </div>
            <WelfareScoreCard score={simulatedScore} label={t("simulatedScore")} />
          </div>
        )}
      </div>

      {/* Simulated Recommendations */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t("simulatedRecommendations")}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {simulatedRecommendations.map((rec, idx) => (
            <Card key={rec.scheme.id} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">{rec.scheme.domain}</Badge>
                  <span className="text-xs text-primary">#{idx + 1}</span>
                </div>
                <CardTitle className="text-sm text-foreground">{rec.scheme.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground line-clamp-2">{rec.reason}</p>
                {rec.scheme.officialPortalUrl && (
                  <a
                    href={rec.scheme.officialPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline underline-offset-2 hover:no-underline"
                  >
                    {t("openPortal")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Future plan (5–10 years) – included in simulator */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            {t("futureRecommendations")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">{t("futureRecommendationsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {futureRecs.map((rec, idx) => (
              <li key={idx} className="flex flex-col gap-1 rounded-lg border border-border/60 bg-background p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{t("yearRange")}: {rec.yearRange}</Badge>
                  <span className="text-sm font-medium text-foreground">{rec.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{rec.action}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {t("resetSimulation")}
        </Button>
        <Button onClick={handleApply}>
          <Save className="mr-2 h-4 w-4" />
          {t("applyChanges")}
        </Button>
      </div>
    </div>
  )
}
