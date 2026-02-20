"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { t, login } = useApp()
  const [idNumber, setIdNumber] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!idNumber || !password) {
      setError(t("required"))
      return
    }
    if (!/^\d{12}$/.test(idNumber)) {
      setError(t("invalidId"))
      return
    }
    const success = login(idNumber, password)
    if (!success) {
      setError("Invalid credentials. Please check your ID number and password.")
    }
  }

  return (
    <Card className="w-full max-w-md border-border shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">{t("loginTitle")}</CardTitle>
        <CardDescription className="text-muted-foreground">{t("loginSubtitle")}</CardDescription>
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
            <Label htmlFor="idNumber" className="text-foreground">{t("idNumber")}</Label>
            <Input
              id="idNumber"
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
            <Label htmlFor="password" className="text-foreground">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full mt-2">
            {t("loginBtn")}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <button
              type="button"
              onClick={onSwitch}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("register")}
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
