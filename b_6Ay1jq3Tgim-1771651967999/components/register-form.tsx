"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"

export function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { t, register } = useApp()
  const [name, setName] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"user" | "admin">("user")
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!name || !idNumber || !password) {
      setError(t("required"))
      return
    }
    if (name.length < 2) {
      setError(t("nameMin"))
      return
    }
    if (!/^\d{12}$/.test(idNumber)) {
      setError(t("invalidId"))
      return
    }
    if (password.length < 6) {
      setError(t("passwordMin"))
      return
    }

    const success = register({ name, idNumber, password, role })
    if (!success) {
      setError("An account with this ID number already exists.")
    }
  }

  return (
    <Card className="w-full max-w-md border-border shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">{t("registerTitle")}</CardTitle>
        <CardDescription className="text-muted-foreground">{t("registerSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="regName" className="text-foreground">{t("name")}</Label>
            <Input
              id="regName"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="regId" className="text-foreground">{t("idNumber")}</Label>
            <Input
              id="regId"
              type="text"
              inputMode="numeric"
              maxLength={12}
              placeholder="000000000000"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ""))}
            />
            <p className="text-xs text-muted-foreground">{t("idNumberHelp")}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="regPassword" className="text-foreground">{t("password")}</Label>
            <Input
              id="regPassword"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="regRole" className="text-foreground">{t("role")}</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "user" | "admin")}>
              <SelectTrigger id="regRole">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{t("user")}</SelectItem>
                <SelectItem value="admin">{t("adminRole")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full mt-2">
            {t("registerBtn")}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t("hasAccount")}{" "}
            <button
              type="button"
              onClick={onSwitch}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("login")}
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
