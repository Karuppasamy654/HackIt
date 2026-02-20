"use client"

import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LayoutDashboard, BookOpen, Sliders, ShieldCheck, LogOut, Globe, Menu, X,
} from "lucide-react"
import { useState } from "react"

type Page = "dashboard" | "schemes" | "simulator" | "admin"

export function AppNav({
  currentPage,
  onNavigate,
}: {
  currentPage: Page
  onNavigate: (page: Page) => void
}) {
  const { t, currentUser, language, setLanguage, logout } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems: { page: Page; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { page: "dashboard", label: t("dashboard"), icon: <LayoutDashboard className="h-4 w-4" /> },
    { page: "schemes", label: t("schemes"), icon: <BookOpen className="h-4 w-4" /> },
    { page: "simulator", label: t("simulator"), icon: <Sliders className="h-4 w-4" /> },
    { page: "admin", label: t("admin"), icon: <ShieldCheck className="h-4 w-4" />, adminOnly: true },
  ]

  const visibleItems = navItems.filter((item) => !item.adminOnly || currentUser?.role === "admin")

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="hidden text-lg font-bold text-foreground sm:block">{t("appNameShort")}</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex" role="navigation" aria-label="Main navigation">
          {visibleItems.map((item) => (
            <Button
              key={item.page}
              variant={currentPage === item.page ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onNavigate(item.page)}
              className="gap-2"
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "ta")}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <Globe className="mr-1 h-3 w-3" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ta">Tamil</SelectItem>
            </SelectContent>
          </Select>

          {/* User info & Logout */}
          <span className="hidden text-sm text-muted-foreground lg:block">
            {currentUser?.name}
          </span>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-1 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("logout")}</span>
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-card px-4 py-3 md:hidden" role="navigation" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            {visibleItems.map((item) => (
              <Button
                key={item.page}
                variant={currentPage === item.page ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  onNavigate(item.page)
                  setMobileOpen(false)
                }}
                className="justify-start gap-2"
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
