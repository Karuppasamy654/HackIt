"use client"

import { useMemo } from "react"
import { useApp } from "@/lib/app-context"
import { SCHEMES } from "@/lib/schemes"
import { calculateWelfareScore, getEligibleSchemes, rankSchemes, validateProfile } from "@/lib/scoring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users, TrendingUp, AlertTriangle, Star, MapPin, ShieldAlert,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"

const PIE_COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
  "var(--primary)", "var(--accent)",
]

export function AdminDashboard() {
  const { t, currentUser, users, profiles, applications } = useApp()

  const isAdmin = currentUser?.role === "admin"

  const stats = useMemo(() => {
    if (!isAdmin) return null

    const userList = users.filter((u) => u.role === "user")
    const profileList = userList
      .map((u) => profiles[u.id])
      .filter(Boolean)

    // Calculate scores for each profiled user
    const scores = profileList.map((p) => {
      const completedCount = applications.filter(
        (a) => a.userId === p.userId && a.status === "Completed"
      ).length
      return {
        userId: p.userId,
        profile: p,
        score: calculateWelfareScore(p, completedCount),
      }
    })

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.score.total, 0) / scores.length)
      : 0

    const highRiskCount = scores.filter((s) => s.score.riskCategory === "High").length
    const highRiskPct = scores.length > 0 ? Math.round((highRiskCount / scores.length) * 100) : 0

    // Most recommended scheme
    const schemeCounts: Record<string, number> = {}
    scores.forEach(({ profile, score }) => {
      const eligible = getEligibleSchemes(profile, SCHEMES)
      const ranked = rankSchemes(profile, eligible, score)
      if (ranked.length > 0) {
        const topId = ranked[0].scheme.id
        schemeCounts[topId] = (schemeCounts[topId] || 0) + 1
      }
    })
    const topSchemeId = Object.entries(schemeCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    const topScheme = SCHEMES.find((s) => s.id === topSchemeId)

    // Region distribution
    const regionCounts: Record<string, number> = {}
    profileList.forEach((p) => {
      regionCounts[p.state] = (regionCounts[p.state] || 0) + 1
    })
    const regionData = Object.entries(regionCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Suspicious profiles
    const suspicious = profileList
      .map((p) => {
        const warnings = validateProfile(p)
        const user = users.find((u) => u.id === p.userId)
        return { profile: p, warnings, userName: user?.name || "Unknown" }
      })
      .filter((s) => s.warnings.length > 0)

    // Risk distribution for chart
    const riskDistribution = [
      { name: t("high"), value: scores.filter((s) => s.score.riskCategory === "High").length },
      { name: t("medium"), value: scores.filter((s) => s.score.riskCategory === "Medium").length },
      { name: t("low"), value: scores.filter((s) => s.score.riskCategory === "Low").length },
    ]

    return {
      totalUsers: userList.length,
      avgScore,
      highRiskPct,
      topScheme,
      regionData,
      suspicious,
      riskDistribution,
      scores,
    }
  }, [isAdmin, users, profiles, applications, t])

  if (!isAdmin) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <ShieldAlert className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold text-foreground">{t("accessDenied")}</h2>
          <p className="text-muted-foreground">{t("accessDeniedDesc")}</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">{t("adminDashboard")}</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label={t("totalUsers")}
          value={String(stats.totalUsers)}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label={t("avgWelfareScore")}
          value={String(stats.avgScore)}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label={t("highRiskUsers")}
          value={`${stats.highRiskPct}%`}
          variant="destructive"
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label={t("mostRecommended")}
          value={stats.topScheme?.name || "N/A"}
          small
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Risk Distribution */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">{t("riskCategory")} Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.riskDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {stats.riskDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Region Distribution */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              {t("regionDistribution")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.regionData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suspicious Profiles */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <AlertTriangle className="h-4 w-4 text-chart-4" />
            {t("suspiciousProfiles")} ({stats.suspicious.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.suspicious.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noSuspicious")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">{t("name")}</TableHead>
                  <TableHead className="text-foreground">{t("occupationLabel")}</TableHead>
                  <TableHead className="text-foreground">{t("incomeLabel")}</TableHead>
                  <TableHead className="text-foreground">Warnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.suspicious.map((s) => (
                  <TableRow key={s.profile.userId}>
                    <TableCell className="text-foreground">{s.userName}</TableCell>
                    <TableCell className="text-muted-foreground">{s.profile.occupation}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Intl.NumberFormat("en-IN").format(s.profile.income)}
                    </TableCell>
                    <TableCell>
                      {s.warnings.map((w, i) => (
                        <Badge key={i} variant="outline" className="mr-1 text-xs border-chart-4/30 text-chart-4">
                          {w}
                        </Badge>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Management Table */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">{t("userManagement")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground">{t("name")}</TableHead>
                <TableHead className="text-foreground">{t("state")}</TableHead>
                <TableHead className="text-foreground">{t("occupationLabel")}</TableHead>
                <TableHead className="text-foreground">{t("welfareScore")}</TableHead>
                <TableHead className="text-foreground">{t("riskCategory")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.scores.map((s) => {
                const user = users.find((u) => u.id === s.userId)
                return (
                  <TableRow key={s.userId}>
                    <TableCell className="font-medium text-foreground">{user?.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.profile.state}</TableCell>
                    <TableCell className="text-muted-foreground">{s.profile.occupation}</TableCell>
                    <TableCell className="text-foreground font-medium">{s.score.total}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          s.score.riskCategory === "High"
                            ? "bg-destructive text-destructive-foreground"
                            : s.score.riskCategory === "Medium"
                              ? "bg-chart-3 text-primary-foreground"
                              : "bg-accent text-accent-foreground"
                        }
                      >
                        {s.score.riskCategory === "High" ? t("high") : s.score.riskCategory === "Medium" ? t("medium") : t("low")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  variant,
  small,
}: {
  icon: React.ReactNode
  label: string
  value: string
  variant?: "destructive"
  small?: boolean
}) {
  return (
    <Card className="border-border">
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          variant === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
        }`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`font-bold text-foreground ${small ? "text-sm truncate" : "text-xl"}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
