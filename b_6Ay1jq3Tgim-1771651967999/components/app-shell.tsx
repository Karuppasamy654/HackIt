"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { AppNav } from "@/components/app-nav"
import { UserDashboard } from "@/components/user-dashboard"
import { SchemeBrowser } from "@/components/scheme-browser"
import { SchemeDetail } from "@/components/scheme-detail"
import { ScenarioSimulator } from "@/components/scenario-simulator"
import { AdminDashboard } from "@/components/admin-dashboard"
import { ShieldCheck, Loader2 } from "lucide-react"

type Page = "dashboard" | "schemes" | "simulator" | "admin"

export function AppShell() {
  const { currentUser, t } = useApp()
  const [page, setPage] = useState<Page>("dashboard")
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not logged in - show auth
  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-center text-2xl font-bold text-foreground text-balance">{t("appName")}</h1>
        </div>
        {authMode === "login" ? (
          <LoginForm onSwitch={() => setAuthMode("register")} />
        ) : (
          <RegisterForm onSwitch={() => setAuthMode("login")} />
        )}
      </div>
    )
  }

  // Logged in - show app
  return (
    <div className="min-h-screen bg-background">
      <AppNav currentPage={page} onNavigate={(p) => { setPage(p); setSelectedScheme(null) }} />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {page === "dashboard" && (
          <UserDashboard
            onNavigateScheme={(id) => {
              setSelectedScheme(id)
              setPage("schemes")
            }}
            onNavigateSimulator={() => setPage("simulator")}
            onNavigateSchemes={() => setPage("schemes")}
          />
        )}
        {page === "schemes" && (
          selectedScheme ? (
            <SchemeDetail
              schemeId={selectedScheme}
              onBack={() => setSelectedScheme(null)}
            />
          ) : (
            <SchemeBrowser onSelectScheme={setSelectedScheme} />
          )
        )}
        {page === "simulator" && <ScenarioSimulator />}
        {page === "admin" && <AdminDashboard />}
      </main>
    </div>
  )
}
