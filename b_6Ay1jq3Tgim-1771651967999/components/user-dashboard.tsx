"use client"

import { useMemo, useState } from "react"
import { useApp } from "@/lib/app-context"
import { SCHEMES } from "@/lib/schemes"
import { calculateWelfareScore, getEligibleSchemes, rankSchemes, getCoverageGaps } from "@/lib/scoring"
import { WelfareScoreCard } from "@/components/welfare-score-card"
import { ProfileEditor } from "@/components/profile-editor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bell, ShieldAlert, Star, ChevronRight, FileText, Sliders, AlertTriangle,
} from "lucide-react"

export function UserDashboard({
  onNavigateScheme,
  onNavigateSimulator,
  onNavigateSchemes,
}: {
  onNavigateScheme: (id: string) => void
  onNavigateSimulator: () => void
  onNavigateSchemes: () => void
}) {
  const { t, currentUser, getProfile, getUserApplications, getUserNotifications } = useApp()
  const [showProfile, setShowProfile] = useState(false)

  const profile = currentUser ? getProfile(currentUser.id) : null
  const apps = currentUser ? getUserApplications(currentUser.id) : []
  const notifications = currentUser ? getUserNotifications(currentUser.id) : []

  const completedCount = apps.filter((a) => a.status === "Completed").length

  const score = useMemo(
    () => (profile ? calculateWelfareScore(profile, completedCount) : null),
    [profile, completedCount]
  )

  const recommendations = useMemo(() => {
    if (!profile || !score) return []
    const eligible = getEligibleSchemes(profile, SCHEMES)
    return rankSchemes(profile, eligible, score).slice(0, 3)
  }, [profile, score])

  const gaps = useMemo(() => (profile ? getCoverageGaps(profile) : []), [profile])

  if (!profile) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              {t("completeProfile")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("completeProfileDesc")}
            </CardDescription>
          </CardHeader>
        </Card>
        <ProfileEditor />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("welcomeBack")}, {currentUser?.name}</h1>
          <p className="text-muted-foreground">
            {profile.occupation} | {profile.ruralUrban} | {profile.state}
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowProfile(!showProfile)}>
          {showProfile ? t("dashboard") : t("editProfile")}
        </Button>
      </div>

      {showProfile ? (
        <ProfileEditor onSave={() => setShowProfile(false)} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Welfare Score */}
            <div className="lg:col-span-1">
              {score && <WelfareScoreCard score={score} />}
            </div>

            {/* Coverage Gaps & Notifications */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              {/* Coverage Gaps */}
              {gaps.length > 0 && (
                <Card className="border-destructive/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <ShieldAlert className="h-4 w-4 text-destructive" />
                      {t("coverageGaps")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {gaps.map((gap) => (
                        <Badge key={gap} variant="outline" className="border-destructive/30 text-destructive">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {gap}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notifications */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Bell className="h-4 w-4 text-primary" />
                    {t("notifications")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("noNotifications")}</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-3">
                          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{n.message}</p>
                            <p className="text-xs text-muted-foreground">{n.createdAt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Recommended Schemes */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Star className="h-5 w-5 text-chart-3" />
                {t("topRecommendations")}
              </h2>
              <Button variant="ghost" size="sm" onClick={onNavigateSchemes} className="text-primary">
                {t("viewAll")}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {recommendations.map((rec, idx) => (
                <Card
                  key={rec.scheme.id}
                  className="cursor-pointer border-border transition-shadow hover:shadow-md"
                  onClick={() => onNavigateScheme(rec.scheme.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {rec.scheme.domain}
                      </Badge>
                      <span className="text-xs font-medium text-primary">
                        #{idx + 1} {t("matchScore")}: {rec.matchScore}
                      </span>
                    </div>
                    <CardTitle className="text-base text-foreground">{rec.scheme.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {rec.scheme.description}
                    </p>
                    <div className="rounded-md bg-primary/5 p-2">
                      <p className="text-xs font-medium text-primary">{t("whyRecommended")}:</p>
                      <p className="text-xs text-muted-foreground">{rec.reason}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Simulator Button */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Sliders className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{t("scenarioSimulator")}</p>
                  <p className="text-sm text-muted-foreground">{t("simulatorDesc")}</p>
                </div>
              </div>
              <Button onClick={onNavigateSimulator}>
                {t("openSimulator")}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
