"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import type { Profile, Occupation, FamilyMember } from "@/lib/types"
import type { TranslationKey } from "@/lib/translations"
import { validateProfile } from "@/lib/scoring"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react"

const OCCUPATIONS: Occupation[] = [
  "Student",
  "Farmer",
  "Salaried",
  "Self-employed",
  "Government",
  "Unemployed",
  "Housewife",
  "Homemaker",
  "Retired",
  "Daily wage worker",
]

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
]

export function ProfileEditor({ onSave }: { onSave?: () => void }) {
  const { t, currentUser, getProfile, updateProfile } = useApp()
  const existing = currentUser ? getProfile(currentUser.id) : null

  const [profile, setProfile] = useState<Profile>(
    existing || {
      userId: currentUser?.id || "",
      age: 25,
      income: 200000,
      occupation: "Salaried",
      education: "Graduate",
      gender: "Male",
      ruralUrban: "Urban",
      state: "Tamil Nadu",
      familySize: 4,
      familyMembers: [],
      hasHealthInsurance: false,
      hasPension: false,
    }
  )
  const [warnings, setWarnings] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setWarnings(validateProfile(profile))
  }, [profile])

  // Restrict family members to at most (familySize - 1)
  useEffect(() => {
    const maxMembers = Math.max(0, profile.familySize - 1)
    const current = profile.familyMembers || []
    if (current.length > maxMembers) {
      setProfile((p) => ({ ...p, familyMembers: (p.familyMembers || []).slice(0, maxMembers) }))
    }
  }, [profile.familySize])

  function handleSave() {
    if (!currentUser) return
    updateProfile({ ...profile, userId: currentUser.id })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSave?.()
  }

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }))
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground">{t("editProfile")}</CardTitle>
        <CardDescription className="text-muted-foreground">{t("completeProfileDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">{t("age")}</Label>
            <Input
              type="number"
              min={1}
              max={120}
              value={profile.age}
              onChange={(e) => update("age", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">{t("incomeLabel")}</Label>
            <Input
              type="number"
              min={0}
              value={profile.income}
              onChange={(e) => update("income", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">{t("occupationLabel")}</Label>
            <Select value={profile.occupation} onValueChange={(v) => update("occupation", v as Occupation)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OCCUPATIONS.map((o) => (
                  <SelectItem key={o} value={o}>{t(("occupation_" + o.replace(/\s+/g, "").replace(/-/g, "")) as TranslationKey) || o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">{t("educationLabel")}</Label>
            <Select value={profile.education} onValueChange={(v) => update("education", v as Profile["education"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["None", "Primary", "Secondary", "Higher Secondary", "Graduate", "Postgraduate"].map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">{t("gender")}</Label>
            <Select value={profile.gender} onValueChange={(v) => update("gender", v as Profile["gender"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">{t("male")}</SelectItem>
                <SelectItem value="Female">{t("female")}</SelectItem>
                <SelectItem value="Other">{t("other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">{t("ruralUrban")}</Label>
            <Select value={profile.ruralUrban} onValueChange={(v) => update("ruralUrban", v as Profile["ruralUrban"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Rural">{t("rural")}</SelectItem>
                <SelectItem value="Urban">{t("urban")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">{t("state")}</Label>
            <Select value={profile.state} onValueChange={(v) => update("state", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">{t("familySize")}</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={profile.familySize}
              onChange={(e) => {
                const newSize = Math.min(20, Math.max(1, parseInt(e.target.value) || 1))
                const maxMembers = Math.max(0, newSize - 1)
                setProfile((p) => {
                  const current = p.familyMembers || []
                  const trimmed = current.length > maxMembers ? current.slice(0, maxMembers) : current
                  return { ...p, familySize: newSize, familyMembers: trimmed }
                })
              }}
            />
          </div>

          <div className="col-span-full mt-2 flex flex-col gap-3 rounded-lg border border-border p-4">
            <div>
              <h4 className="font-medium text-foreground">{t("familyMembers")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("familyMembersDesc")} {t("familyMembersMax")}
              </p>
            </div>
            {(profile.familyMembers || []).map((member, idx) => (
              <div key={idx} className="flex flex-wrap items-end gap-2 rounded border border-border/60 bg-muted/30 p-3">
                <div className="flex-1 min-w-[120px]">
                  <Label className="text-xs text-muted-foreground">{t("memberOccupation")}</Label>
                  <Select
                    value={member.occupation}
                    onValueChange={(v) => {
                      const next = [...(profile.familyMembers || [])]
                      next[idx] = { ...next[idx], occupation: v as Occupation }
                      setProfile((p) => ({ ...p, familyMembers: next }))
                    }}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OCCUPATIONS.map((o) => (
                        <SelectItem key={o} value={o}>{t(("occupation_" + o.replace(/\s+/g, "").replace(/-/g, "")) as TranslationKey) || o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[100px]">
                  <Label className="text-xs text-muted-foreground">{t("memberSalary")}</Label>
                  <Input
                    type="number"
                    min={0}
                    className="mt-1"
                    value={member.annualIncome || ""}
                    onChange={(e) => {
                      const next = [...(profile.familyMembers || [])]
                      next[idx] = { ...next[idx], annualIncome: parseInt(e.target.value) || 0 }
                      setProfile((p) => ({ ...p, familyMembers: next }))
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    const next = (profile.familyMembers || []).filter((_, i) => i !== idx)
                    setProfile((p) => ({ ...p, familyMembers: next }))
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {(profile.familyMembers || []).length < Math.max(0, profile.familySize - 1) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => setProfile((p) => ({
                ...p,
                familyMembers: [...(p.familyMembers || []), { occupation: "Student", annualIncome: 0 }],
              }))}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("addMember")} ({ (profile.familyMembers || []).length } / { Math.max(0, profile.familySize - 1) })
            </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={profile.hasHealthInsurance}
              onCheckedChange={(v) => update("hasHealthInsurance", v)}
            />
            <Label className="text-foreground">{t("healthInsurance")}</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={profile.hasPension}
              onCheckedChange={(v) => update("hasPension", v)}
            />
            <Label className="text-foreground">{t("pension")}</Label>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="mt-4 rounded-lg border border-chart-4/30 bg-chart-4/10 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-chart-4">
              <AlertCircle className="h-4 w-4" />
              {t("profileWarnings")}
            </p>
            <ul className="mt-1 text-sm text-chart-4/80">
              {warnings.map((w, i) => (
                <li key={i}>- {w}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSave}>{t("saveProfile")}</Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-accent">
              <CheckCircle2 className="h-4 w-4" />
              {t("profileSaved")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
