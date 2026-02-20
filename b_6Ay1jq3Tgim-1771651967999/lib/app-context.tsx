"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { User, Profile, Application, Notification } from "@/lib/types"
import type { Language, TranslationKey } from "@/lib/translations"
import { translations } from "@/lib/translations"

interface AppState {
  currentUser: User | null
  users: User[]
  profiles: Record<string, Profile>
  applications: Application[]
  notifications: Notification[]
  language: Language
}

interface AppContextType extends AppState {
  t: (key: TranslationKey) => string
  setLanguage: (lang: Language) => void
  login: (idNumber: string, password: string) => boolean
  register: (user: Omit<User, "id">) => boolean
  logout: () => void
  updateProfile: (profile: Profile) => void
  addApplication: (userId: string, schemeId: string) => void
  updateApplicationStatus: (appId: string, status: Application["status"]) => void
  addNotification: (userId: string, message: string) => void
  getProfile: (userId: string) => Profile | null
  getUserApplications: (userId: string) => Application[]
  getUserNotifications: (userId: string) => Notification[]
}

const AppContext = createContext<AppContextType | null>(null)

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

const SEED_USERS: User[] = [
  { id: "admin-1", name: "Admin Officer", idNumber: "999999999999", password: "admin123", role: "admin" },
  { id: "user-1", name: "Ravi Kumar", idNumber: "100000000001", password: "test123", role: "user" },
  { id: "user-2", name: "Priya Devi", idNumber: "100000000002", password: "test123", role: "user" },
  { id: "user-3", name: "Muthu Selvam", idNumber: "100000000003", password: "test123", role: "user" },
  { id: "user-4", name: "Lakshmi Narayan", idNumber: "100000000004", password: "test123", role: "user" },
  { id: "user-5", name: "Suresh Babu", idNumber: "100000000005", password: "test123", role: "user" },
]

const SEED_PROFILES: Record<string, Profile> = {
  "user-1": {
    userId: "user-1", age: 28, income: 180000, occupation: "Farmer",
    education: "Secondary", gender: "Male", ruralUrban: "Rural",
    state: "Tamil Nadu", familySize: 5, familyMembers: [
      { occupation: "Housewife", annualIncome: 0 },
      { occupation: "Student", annualIncome: 0 },
    ], hasHealthInsurance: false, hasPension: false,
  },
  "user-2": {
    userId: "user-2", age: 22, income: 80000, occupation: "Student",
    education: "Graduate", gender: "Female", ruralUrban: "Urban",
    state: "Kerala", familySize: 4, hasHealthInsurance: true, hasPension: false,
  },
  "user-3": {
    userId: "user-3", age: 65, income: 120000, occupation: "Retired",
    education: "Primary", gender: "Male", ruralUrban: "Rural",
    state: "Tamil Nadu", familySize: 3, hasHealthInsurance: false, hasPension: false,
  },
  "user-4": {
    userId: "user-4", age: 35, income: 450000, occupation: "Salaried",
    education: "Postgraduate", gender: "Female", ruralUrban: "Urban",
    state: "Karnataka", familySize: 4, familyMembers: [
      { occupation: "Salaried", annualIncome: 380000 },
    ], hasHealthInsurance: true, hasPension: true,
  },
  "user-5": {
    userId: "user-5", age: 40, income: 250000, occupation: "Self-employed",
    education: "Higher Secondary", gender: "Male", ruralUrban: "Rural",
    state: "Andhra Pradesh", familySize: 6, familyMembers: [
      { occupation: "Homemaker", annualIncome: 0 },
      { occupation: "Daily wage worker", annualIncome: 72000 },
    ], hasHealthInsurance: false, hasPension: false,
  },
}

const SEED_APPLICATIONS: Application[] = [
  { id: "app-1", userId: "user-1", schemeId: "agri-1", status: "Approved", appliedAt: "2026-01-15" },
  { id: "app-2", userId: "user-1", schemeId: "health-1", status: "Applied", appliedAt: "2026-02-01" },
  { id: "app-3", userId: "user-2", schemeId: "edu-1", status: "Completed", appliedAt: "2025-11-20" },
  { id: "app-4", userId: "user-3", schemeId: "senior-1", status: "Approved", appliedAt: "2026-01-10" },
  { id: "app-5", userId: "user-5", schemeId: "msme-1", status: "Applied", appliedAt: "2026-02-10" },
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: SEED_USERS,
    profiles: SEED_PROFILES,
    applications: SEED_APPLICATIONS,
    notifications: [
      { id: "n-1", userId: "user-1", message: "Your PM-KISAN application has been approved!", createdAt: "2026-02-15" },
      { id: "n-2", userId: "user-1", message: "New health scheme available in your area.", createdAt: "2026-02-10" },
    ],
    language: "en",
  })

  const t = useCallback(
    (key: TranslationKey) => translations[state.language][key] || key,
    [state.language]
  )

  const setLanguage = useCallback((lang: Language) => {
    setState((s) => ({ ...s, language: lang }))
  }, [])

  const login = useCallback((idNumber: string, password: string): boolean => {
    const user = state.users.find((u) => u.idNumber === idNumber && u.password === password)
    if (user) {
      setState((s) => ({ ...s, currentUser: user }))
      return true
    }
    return false
  }, [state.users])

  const register = useCallback((userData: Omit<User, "id">): boolean => {
    const exists = state.users.some((u) => u.idNumber === userData.idNumber)
    if (exists) return false
    const newUser: User = { ...userData, id: generateId() }
    setState((s) => ({
      ...s,
      users: [...s.users, newUser],
      currentUser: newUser,
    }))
    return true
  }, [state.users])

  const logout = useCallback(() => {
    setState((s) => ({ ...s, currentUser: null }))
  }, [])

  const updateProfile = useCallback((profile: Profile) => {
    setState((s) => ({
      ...s,
      profiles: { ...s.profiles, [profile.userId]: profile },
    }))
  }, [])

  const addApplication = useCallback((userId: string, schemeId: string) => {
    const newApp: Application = {
      id: generateId(),
      userId,
      schemeId,
      status: "Applied",
      appliedAt: new Date().toISOString().split("T")[0],
    }
    setState((s) => ({
      ...s,
      applications: [...s.applications, newApp],
    }))
  }, [])

  const updateApplicationStatus = useCallback(
    (appId: string, status: Application["status"]) => {
      setState((s) => ({
        ...s,
        applications: s.applications.map((a) =>
          a.id === appId ? { ...a, status } : a
        ),
      }))
    },
    []
  )

  const addNotification = useCallback((userId: string, message: string) => {
    const n: Notification = {
      id: generateId(),
      userId,
      message,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setState((s) => ({
      ...s,
      notifications: [...s.notifications, n],
    }))
  }, [])

  const getProfile = useCallback(
    (userId: string) => state.profiles[userId] || null,
    [state.profiles]
  )

  const getUserApplications = useCallback(
    (userId: string) => state.applications.filter((a) => a.userId === userId),
    [state.applications]
  )

  const getUserNotifications = useCallback(
    (userId: string) =>
      state.notifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.notifications]
  )

  return (
    <AppContext.Provider
      value={{
        ...state,
        t,
        setLanguage,
        login,
        register,
        logout,
        updateProfile,
        addApplication,
        updateApplicationStatus,
        addNotification,
        getProfile,
        getUserApplications,
        getUserNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
