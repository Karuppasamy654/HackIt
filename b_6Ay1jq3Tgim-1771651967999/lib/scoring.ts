import type { Profile, WelfareScore, Scheme, SchemeRecommendation } from "./types"

export function getHouseholdIncome(profile: Profile): number {
  const memberIncome = (profile.familyMembers || []).reduce((sum, m) => sum + (m.annualIncome || 0), 0)
  return profile.income + memberIncome
}

export interface FutureRecommendation {
  yearRange: string
  title: string
  action: string
}

/** Actionable recommendations for the next 5–10 years based on profile (used in simulator). */
export function getFutureRecommendations(profile: Profile): FutureRecommendation[] {
  const recs: FutureRecommendation[] = []
  const age = profile.age
  const householdIncome = getHouseholdIncome(profile)
  const members = profile.familyMembers || []
  const hasStudents = profile.occupation === "Student" || members.some((m) => m.occupation === "Student")

  if (!profile.hasHealthInsurance) {
    recs.push({
      yearRange: "0–2 years",
      title: "Health coverage",
      action: "Apply for Ayushman Bharat (PM-JAY) on the official portal to get Rs 5 lakh family health cover.",
    })
  }
  if (!profile.hasPension && age >= 45) {
    recs.push({
      yearRange: age >= 55 ? "0–1 year" : "5–10 years",
      title: "Pension planning",
      action: "Enroll in Indira Gandhi National Old Age Pension (IGNOAP) when you turn 60. Check NSAP portal for eligibility.",
    })
  }
  if (age >= 58 && age < 65) {
    recs.push({
      yearRange: "0–2 years",
      title: "Senior citizen schemes",
      action: "You will be eligible for senior pension and Rashtriya Vayoshri Yojana soon. Keep Aadhaar and BPL documents ready.",
    })
  }
  if (hasStudents) {
    recs.push({
      yearRange: "0–5 years",
      title: "Education support",
      action: "Apply for National Scholarship Portal (NSP) when the student is in class 9 or above. Renew annually with mark sheets.",
    })
  }
  if (profile.occupation === "Farmer" || members.some((m) => m.occupation === "Farmer")) {
    recs.push({
      yearRange: "0–10 years",
      title: "Agriculture schemes",
      action: "Keep PM-KISAN and Kisan Credit Card (KCC) updated. Get Soil Health Card every 2 years for better crop planning.",
    })
  }
  if (profile.familySize >= 4 && householdIncome < 300000) {
    recs.push({
      yearRange: "0–5 years",
      title: "Family welfare",
      action: "Apply for PM-JAY for entire family. Consider Skill India or MUDRA if any member wants to start a small business.",
    })
  }
  if (profile.occupation === "Housewife" || profile.occupation === "Homemaker" || members.some((m) => m.occupation === "Housewife" || m.occupation === "Homemaker")) {
    recs.push({
      yearRange: "0–10 years",
      title: "Women & livelihood",
      action: "Check Beti Bachao Beti Padhao for girl children and Mahila Shakti Kendra for skill development on WCD portal.",
    })
  }
  recs.push({
    yearRange: "0–10 years",
    title: "Financial inclusion",
    action: "Ensure all family members have PM Jan Dhan accounts. Link Aadhaar for direct benefit transfers.",
  })
  if (profile.education === "None" || profile.education === "Primary") {
    recs.push({
      yearRange: "0–5 years",
      title: "Adult education",
      action: "Enroll in Digital Literacy or Skill India programs to improve employability and access to more schemes.",
    })
  }
  return recs.slice(0, 8)
}

export function calculateWelfareScore(profile: Profile, completedSchemes: number): WelfareScore {
  // Income Score (30 points) - lower household income = higher score (more need)
  const householdIncome = getHouseholdIncome(profile)
  let income = 0
  if (householdIncome <= 100000) income = 30
  else if (householdIncome <= 200000) income = 25
  else if (householdIncome <= 300000) income = 20
  else if (householdIncome <= 500000) income = 15
  else if (householdIncome <= 800000) income = 10
  else income = 5

  // Dependents Score (20 points) - more family = higher need
  let dependents = 0
  if (profile.familySize >= 7) dependents = 20
  else if (profile.familySize >= 5) dependents = 16
  else if (profile.familySize >= 4) dependents = 12
  else if (profile.familySize >= 3) dependents = 8
  else dependents = 4

  // Insurance Coverage (25 points) - less coverage = higher need
  let insurance = 0
  if (!profile.hasHealthInsurance && !profile.hasPension) insurance = 25
  else if (!profile.hasHealthInsurance) insurance = 18
  else if (!profile.hasPension) insurance = 12
  else insurance = 5

  // Occupation Stability (15 points) - less stable = higher need
  let occupation = 0
  const occScores: Record<string, number> = {
    Unemployed: 15,
    "Daily wage worker": 14,
    Farmer: 12,
    Student: 10,
    Housewife: 10,
    Homemaker: 10,
    Retired: 10,
    "Self-employed": 8,
    Salaried: 4,
    Government: 2,
  }
  occupation = occScores[profile.occupation] ?? 8

  // Education Level (10 points) - less education = higher need
  let education = 0
  const eduScores: Record<string, number> = {
    None: 10,
    Primary: 8,
    Secondary: 6,
    "Higher Secondary": 5,
    Graduate: 3,
    Postgraduate: 1,
  }
  education = eduScores[profile.education] ?? 5

  // Bonus for completed schemes (slight increase)
  const completionBonus = Math.min(completedSchemes * 2, 10)

  const total = Math.min(income + dependents + insurance + occupation + education + completionBonus, 100)

  let riskCategory: "High" | "Medium" | "Low"
  if (total >= 65) riskCategory = "High"
  else if (total >= 40) riskCategory = "Medium"
  else riskCategory = "Low"

  return { total, income, dependents, insurance, occupation, education, riskCategory }
}

export function getEligibleSchemes(profile: Profile, schemes: Scheme[]): Scheme[] {
  const householdIncome = getHouseholdIncome(profile)
  return schemes.filter((scheme) => {
    if (profile.age < scheme.minAge || profile.age > scheme.maxAge) return false
    if (householdIncome > scheme.incomeLimit) return false
    if (
      scheme.occupationRequired.length > 0 &&
      !scheme.occupationRequired.includes(profile.occupation)
    )
      return false
    if (scheme.genderRequired && scheme.genderRequired !== profile.gender) return false
    return true
  })
}

export function rankSchemes(
  profile: Profile,
  eligible: Scheme[],
  welfareScore: WelfareScore
): SchemeRecommendation[] {
  return eligible
    .map((scheme) => {
      let matchScore = 0
      let reasons: string[] = []

      // Income match weight (0-30)
      const householdIncome = getHouseholdIncome(profile)
      const incomeRatio = 1 - householdIncome / scheme.incomeLimit
      const incomeMatchScore = Math.round(incomeRatio * 30)
      matchScore += incomeMatchScore
      if (incomeRatio > 0.5) reasons.push("Your income qualifies you well within the limit")

      // Domain relevance (0-25)
      const domainMap: Record<string, string[]> = {
        Education: ["Student", "Unemployed"],
        Agriculture: ["Farmer", "Daily wage worker"],
        Health: ["Farmer", "Unemployed", "Student", "Housewife", "Homemaker", "Retired"],
        Women: ["Student", "Farmer", "Unemployed", "Self-employed", "Housewife", "Homemaker"],
        Senior: ["Unemployed", "Farmer", "Retired", "Housewife", "Homemaker"],
        MSME: ["Self-employed", "Farmer", "Daily wage worker"],
        Financial: ["Student", "Farmer", "Salaried", "Self-employed", "Government", "Unemployed", "Housewife", "Homemaker", "Retired"],
      }
      if (domainMap[scheme.domain]?.includes(profile.occupation)) {
        matchScore += 25
        reasons.push(`Highly relevant for ${profile.occupation} in ${scheme.domain} domain`)
      } else {
        matchScore += 10
        reasons.push(`${scheme.domain} domain provides supplementary support`)
      }

      // Risk level priority (0-25)
      if (welfareScore.riskCategory === "High") {
        matchScore += 25
        reasons.push("Priority recommended due to high welfare need")
      } else if (welfareScore.riskCategory === "Medium") {
        matchScore += 15
        reasons.push("Beneficial for improving welfare coverage")
      } else {
        matchScore += 8
        reasons.push("Additional welfare enhancement opportunity")
      }

      // Family size relevance (0-20)
      if (profile.familySize >= 5) {
        matchScore += 20
        reasons.push("Large family size increases benefit value")
      } else if (profile.familySize >= 3) {
        matchScore += 12
        reasons.push("Family coverage benefits apply")
      } else {
        matchScore += 5
      }

      return {
        scheme,
        matchScore,
        reason: reasons.join(". ") + ".",
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}

export function getCoverageGaps(profile: Profile): string[] {
  const gaps: string[] = []
  if (!profile.hasHealthInsurance) gaps.push("Health Insurance")
  if (!profile.hasPension) gaps.push("Pension Coverage")
  if (profile.education === "None" || profile.education === "Primary") gaps.push("Education Support")
  if (profile.income < 200000) gaps.push("Income Support")
  if (profile.occupation === "Unemployed" || profile.occupation === "Daily wage worker") gaps.push("Employment Assistance")
  if (profile.occupation === "Housewife" || profile.occupation === "Homemaker") gaps.push("Women & Livelihood Support")
  if (profile.familySize >= 5 && profile.income < 300000) gaps.push("Family Welfare Support")
  return gaps
}

export function validateProfile(profile: Partial<Profile>): string[] {
  const warnings: string[] = []

  if (profile.income !== undefined && profile.occupation) {
    if (profile.occupation === "Government" && profile.income < 100000) {
      warnings.push("Income seems low for a Government employee")
    }
    if (profile.occupation === "Salaried" && profile.income < 50000) {
      warnings.push("Income seems unusually low for salaried employment")
    }
    if (profile.occupation === "Student" && profile.income > 500000) {
      warnings.push("Income seems high for a Student")
    }
    if ((profile.occupation === "Housewife" || profile.occupation === "Homemaker") && profile.income > 800000) {
      warnings.push("Income seems high for Homemaker/Housewife (consider listing as other occupation if self-employed)")
    }
  }

  if (profile.age !== undefined) {
    if (profile.age < 14 || profile.age > 120) {
      warnings.push("Age value appears invalid")
    }
    if (profile.occupation === "Student" && profile.age > 50) {
      warnings.push("Age seems high for Student occupation")
    }
  }

  if (profile.familySize !== undefined) {
    if (profile.familySize < 1 || profile.familySize > 20) {
      warnings.push("Family size value appears unusual")
    }
  }

  return warnings
}
