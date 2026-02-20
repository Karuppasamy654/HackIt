"use client"

import { useMemo, useState } from "react"
import { useApp } from "@/lib/app-context"
import { SCHEMES } from "@/lib/schemes"
import { getEligibleSchemes } from "@/lib/scoring"
import type { Scheme } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Leaf, Heart, Users, Clock, Briefcase, Wallet, ChevronRight } from "lucide-react"

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  Education: <BookOpen className="h-4 w-4" />,
  Agriculture: <Leaf className="h-4 w-4" />,
  Health: <Heart className="h-4 w-4" />,
  Women: <Users className="h-4 w-4" />,
  Senior: <Clock className="h-4 w-4" />,
  MSME: <Briefcase className="h-4 w-4" />,
  Financial: <Wallet className="h-4 w-4" />,
}

const ALL_DOMAINS = ["All", "Education", "Agriculture", "Health", "Women", "Senior", "MSME", "Financial"]

export function SchemeBrowser({ onSelectScheme }: { onSelectScheme: (id: string) => void }) {
  const { t, currentUser, getProfile } = useApp()
  const [domain, setDomain] = useState("All")
  const [tab, setTab] = useState<"all" | "eligible">("all")

  const profile = currentUser ? getProfile(currentUser.id) : null
  const eligible = useMemo(
    () => (profile ? getEligibleSchemes(profile, SCHEMES) : []),
    [profile]
  )

  const schemes = useMemo(() => {
    const source = tab === "eligible" ? eligible : SCHEMES
    return domain === "All" ? source : source.filter((s) => s.domain === domain)
  }, [tab, domain, eligible])

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("allSchemes")}</h1>
        <div className="flex items-center gap-3">
          <Select value={domain} onValueChange={setDomain}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t("filterByDomain")} />
            </SelectTrigger>
            <SelectContent>
              {ALL_DOMAINS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d === "All" ? t("allDomains") : d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {profile && (
        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "eligible")}>
          <TabsList>
            <TabsTrigger value="all">{t("allSchemes")} ({SCHEMES.length})</TabsTrigger>
            <TabsTrigger value="eligible">{t("eligibleSchemes")} ({eligible.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schemes.map((scheme) => (
          <SchemeCard
            key={scheme.id}
            scheme={scheme}
            isEligible={eligible.some((e) => e.id === scheme.id)}
            onClick={() => onSelectScheme(scheme.id)}
            formatCurrency={formatCurrency}
          />
        ))}
      </div>

      {schemes.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No schemes found for the selected filter.</p>
      )}
    </div>
  )
}

function SchemeCard({
  scheme,
  isEligible,
  onClick,
  formatCurrency,
}: {
  scheme: Scheme
  isEligible: boolean
  onClick: () => void
  formatCurrency: (v: number) => string
}) {
  return (
    <Card
      className="group cursor-pointer border-border transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            {DOMAIN_ICONS[scheme.domain]}
            {scheme.domain}
          </Badge>
          {isEligible && (
            <Badge className="bg-accent text-accent-foreground text-xs">Eligible</Badge>
          )}
        </div>
        <CardTitle className="text-base leading-tight text-foreground">{scheme.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{scheme.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Impact: {formatCurrency(scheme.estimatedFinancialImpact)}</span>
          <ChevronRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </CardContent>
    </Card>
  )
}
