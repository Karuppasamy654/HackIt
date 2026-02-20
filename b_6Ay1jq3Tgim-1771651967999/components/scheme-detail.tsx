"use client"

import { useMemo } from "react"
import { useApp } from "@/lib/app-context"
import { SCHEMES } from "@/lib/schemes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft, FileText, CheckCircle2, AlertTriangle,
  IndianRupee, BookOpen, Leaf, Heart, Users, Clock, Briefcase, Wallet,
  ExternalLink,
} from "lucide-react"

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  Education: <BookOpen className="h-5 w-5" />,
  Agriculture: <Leaf className="h-5 w-5" />,
  Health: <Heart className="h-5 w-5" />,
  Women: <Users className="h-5 w-5" />,
  Senior: <Clock className="h-5 w-5" />,
  MSME: <Briefcase className="h-5 w-5" />,
  Financial: <Wallet className="h-5 w-5" />,
}

export function SchemeDetail({
  schemeId,
  onBack,
}: {
  schemeId: string
  onBack: () => void
}) {
  const { t, currentUser, getUserApplications, addApplication, addNotification, updateApplicationStatus } = useApp()

  const scheme = SCHEMES.find((s) => s.id === schemeId)
  const apps = currentUser ? getUserApplications(currentUser.id) : []
  const existingApp = apps.find((a) => a.schemeId === schemeId)

  if (!scheme) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Scheme not found</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  function handleApply() {
    if (!currentUser || existingApp) return
    if (scheme?.officialPortalUrl) {
      window.open(scheme.officialPortalUrl, "_blank", "noopener,noreferrer")
    }
    addApplication(currentUser.id, schemeId)
    addNotification(currentUser.id, `You have applied for ${scheme!.name}. We will review your application shortly.`)
  }

  function handleMarkCompleted() {
    if (!existingApp) return
    updateApplicationStatus(existingApp.id, "Completed")
    addNotification(currentUser!.id, `Your ${scheme!.name} application has been marked as completed. Your welfare score has been updated.`)
  }

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val)
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" onClick={onBack} className="w-fit text-muted-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("allSchemes")}
      </Button>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {DOMAIN_ICONS[scheme.domain]}
          </div>
          <div>
            <Badge variant="secondary">{scheme.domain}</Badge>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{scheme.name}</h1>
        <p className="text-muted-foreground leading-relaxed">{scheme.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Eligibility */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">{t("eligibility")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("ageRange")}</span>
              <span className="text-foreground">{scheme.minAge} - {scheme.maxAge} years</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("incomeLimitLabel")}</span>
              <span className="text-foreground">{formatCurrency(scheme.incomeLimit)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("occupationReq")}</span>
              <span className="text-foreground">{scheme.occupationRequired.join(", ")}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("genderReq")}</span>
              <span className="text-foreground">{scheme.genderRequired || t("any")}</span>
            </div>
          </CardContent>
        </Card>

        {/* Financial Impact */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">{t("estimatedImpact")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg bg-accent/10 p-4">
              <IndianRupee className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(scheme.estimatedFinancialImpact)}</p>
                <p className="text-xs text-muted-foreground">Estimated annual benefit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            {t("benefits")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{scheme.benefits}</p>
        </CardContent>
      </Card>

      {/* Risks */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <AlertTriangle className="h-4 w-4 text-chart-4" />
            {t("risks")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{scheme.risks}</p>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <FileText className="h-4 w-4 text-primary" />
            {t("requiredDocuments")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {scheme.requiredDocuments.map((doc, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {doc}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Official Government Portal / Directory */}
      {scheme.officialPortalUrl && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <ExternalLink className="h-4 w-4 text-primary" />
              {t("officialPortal")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("applyOnPortal")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href={scheme.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
            >
              {scheme.officialPortalUrl}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>
      )}

      {/* Application Action */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between p-4">
          {existingApp ? (
            <div className="flex items-center gap-3">
              <Badge
                className={
                  existingApp.status === "Completed"
                    ? "bg-accent text-accent-foreground"
                    : existingApp.status === "Approved"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                }
              >
                {existingApp.status === "Applied"
                  ? t("applied")
                  : existingApp.status === "Approved"
                    ? t("approved")
                    : t("completed")}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {t("applicationStatus")}: {existingApp.status}
              </span>
            </div>
          ) : (
            <p className="text-sm text-foreground">Ready to apply for this scheme?</p>
          )}

          {!existingApp && (
            <Button onClick={handleApply}>
              {scheme.officialPortalUrl ? (
                <>
                  {t("applyNow")} — {t("openPortal")}
                </>
              ) : (
                t("applyNow")
              )}
            </Button>
          )}
          {existingApp && existingApp.status !== "Completed" && (
            <Button variant="outline" onClick={handleMarkCompleted}>
              {t("markCompleted")}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
