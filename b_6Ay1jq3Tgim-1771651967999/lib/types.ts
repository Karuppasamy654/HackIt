export interface User {
  id: string
  name: string
  idNumber: string
  password: string
  role: "user" | "admin"
}

export type Occupation =
  | "Student"
  | "Farmer"
  | "Salaried"
  | "Self-employed"
  | "Government"
  | "Unemployed"
  | "Housewife"
  | "Homemaker"
  | "Retired"
  | "Daily wage worker"

export interface FamilyMember {
  occupation: Occupation
  annualIncome: number
}

export interface Profile {
  userId: string
  age: number
  income: number
  occupation: Occupation
  education: "None" | "Primary" | "Secondary" | "Higher Secondary" | "Graduate" | "Postgraduate"
  gender: "Male" | "Female" | "Other"
  ruralUrban: "Rural" | "Urban"
  state: string
  familySize: number
  familyMembers?: FamilyMember[]
  hasHealthInsurance: boolean
  hasPension: boolean
}

export interface Scheme {
  id: string
  name: string
  domain: "Education" | "Agriculture" | "Health" | "Women" | "Senior" | "MSME" | "Financial"
  description: string
  minAge: number
  maxAge: number
  incomeLimit: number
  occupationRequired: string[]
  genderRequired: string | null
  benefits: string
  risks: string
  requiredDocuments: string[]
  estimatedFinancialImpact: number
  /** Official government portal / directory URL to apply for this scheme */
  officialPortalUrl?: string
}

export interface Application {
  id: string
  userId: string
  schemeId: string
  status: "Applied" | "Approved" | "Completed"
  appliedAt: string
}

export interface Notification {
  id: string
  userId: string
  message: string
  createdAt: string
}

export interface WelfareScore {
  total: number
  income: number
  dependents: number
  insurance: number
  occupation: number
  education: number
  riskCategory: "High" | "Medium" | "Low"
}

export interface SchemeRecommendation {
  scheme: Scheme
  matchScore: number
  reason: string
}
