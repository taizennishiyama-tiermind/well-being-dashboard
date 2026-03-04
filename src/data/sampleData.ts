import type {
  Resident,
  Gender,
  AgeGroup,
  Region,
  Employment,
  CategoryScore,
  SubIndicator,
  CategoryId,
} from './types'
import { CATEGORIES } from './constants'

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gaussianRandom(rng: () => number, mean: number, stddev: number): number {
  const u1 = rng()
  const u2 = rng()
  const z = Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2)
  return mean + z * stddev
}

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, value)) * 10) / 10
}

function pickWeighted<T>(rng: () => number, items: readonly { readonly value: T; readonly weight: number }[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  let r = rng() * total
  for (const item of items) {
    r -= item.weight
    if (r <= 0) return item.value
  }
  return items[items.length - 1].value
}

function getAgeGroup(age: number): AgeGroup {
  if (age < 30) return '18-29'
  if (age < 40) return '30-39'
  if (age < 50) return '40-49'
  if (age < 60) return '50-59'
  if (age < 70) return '60-69'
  return '70+'
}

interface RegionProfile {
  readonly health: number
  readonly community: number
  readonly diversity: number
  readonly childcare: number
  readonly efficacy: number
  readonly transport: number
}

const REGION_PROFILES: Record<Region, RegionProfile> = {
  '御坊市': { health: 7.2, community: 4.8, diversity: 6.8, childcare: 6.0, efficacy: 7.5, transport: 7.8 },
  '日高町': { health: 6.5, community: 7.2, diversity: 5.0, childcare: 5.8, efficacy: 5.8, transport: 5.5 },
  'みなべ町': { health: 7.5, community: 7.8, diversity: 4.5, childcare: 7.2, efficacy: 6.0, transport: 4.5 },
  '印南町': { health: 5.8, community: 7.5, diversity: 4.2, childcare: 5.5, efficacy: 5.5, transport: 4.2 },
  '由良町': { health: 5.2, community: 6.8, diversity: 3.8, childcare: 4.5, efficacy: 5.0, transport: 3.8 },
  '美浜町': { health: 6.8, community: 5.8, diversity: 6.0, childcare: 5.5, efficacy: 6.8, transport: 6.5 },
  '日高川町': { health: 4.8, community: 8.2, diversity: 3.8, childcare: 4.2, efficacy: 5.0, transport: 3.2 },
}

// Per-category offset: subjective vs objective divergence
// positive = subjective > objective (people feel better than data shows)
// negative = objective > subjective (data is better than people feel)
const SUBJECTIVE_OBJECTIVE_OFFSET: Record<CategoryId, { subjectiveBias: number; objectiveBias: number }> = {
  health: { subjectiveBias: -0.4, objectiveBias: 0.8 },       // 客観データ良いが実感が追いつかない
  community: { subjectiveBias: 0.6, objectiveBias: -0.5 },     // 住民は繋がり実感あるが統計は低い
  diversity: { subjectiveBias: -0.3, objectiveBias: 0.3 },     // ほぼ均衡
  childcare: { subjectiveBias: -0.8, objectiveBias: 1.0 },     // 施設充実だが親の満足度低い
  efficacy: { subjectiveBias: 0.8, objectiveBias: -0.6 },      // 自己効力感は主観が高い
  transport: { subjectiveBias: -1.0, objectiveBias: 0.5 },     // 交通は不満が強い（主観低い）
}

interface AgeEffect {
  readonly health: number
  readonly community: number
  readonly diversity: number
  readonly childcare: number
  readonly efficacy: number
  readonly transport: number
}

function getAgeEffect(age: number): AgeEffect {
  if (age < 30) return { health: 0.5, community: -0.8, diversity: 0.6, childcare: -0.3, efficacy: 0.8, transport: 0.3 }
  if (age < 40) return { health: 0.3, community: -0.3, diversity: 0.3, childcare: 0.8, efficacy: 0.5, transport: 0.2 }
  if (age < 50) return { health: 0.0, community: 0.0, diversity: 0.0, childcare: 0.3, efficacy: 0.2, transport: 0.0 }
  if (age < 60) return { health: -0.2, community: 0.3, diversity: -0.1, childcare: -0.2, efficacy: 0.0, transport: -0.1 }
  if (age < 70) return { health: -0.5, community: 0.8, diversity: -0.3, childcare: -0.5, efficacy: -0.3, transport: -0.5 }
  return { health: -0.8, community: 1.0, diversity: -0.5, childcare: -0.8, efficacy: -0.5, transport: -1.0 }
}

function getGenderEffect(gender: Gender): Record<CategoryId, number> {
  if (gender === '女性') {
    return { health: 0.1, community: 0.3, diversity: 0.4, childcare: 0.2, efficacy: -0.1, transport: -0.2 }
  }
  if (gender === 'その他') {
    return { health: -0.2, community: -0.3, diversity: 0.8, childcare: -0.1, efficacy: 0.1, transport: 0.0 }
  }
  return { health: 0.0, community: -0.2, diversity: -0.2, childcare: -0.1, efficacy: 0.2, transport: 0.1 }
}

function generateSubIndicators(
  rng: () => number,
  categoryId: CategoryId,
  baseScore: number,
): readonly SubIndicator[] {
  const meta = CATEGORIES.find((c) => c.id === categoryId)
  if (!meta) return []

  return meta.subIndicatorLabels.map((label, i) => ({
    id: `${categoryId}_sub_${i}`,
    label,
    score: clamp(gaussianRandom(rng, baseScore, 0.8), 1, 10),
  }))
}

function generateResident(rng: () => number, index: number): Resident {
  const age = Math.floor(gaussianRandom(rng, 48, 15))
  const clampedAge = Math.min(80, Math.max(18, age))
  const ageGroup = getAgeGroup(clampedAge)

  const gender = pickWeighted(rng, [
    { value: '男性' as Gender, weight: 48 },
    { value: '女性' as Gender, weight: 49 },
    { value: 'その他' as Gender, weight: 3 },
  ])

  const region = pickWeighted(rng, [
    { value: '御坊市' as Region, weight: 30 },
    { value: 'みなべ町' as Region, weight: 15 },
    { value: '日高川町' as Region, weight: 15 },
    { value: '日高町' as Region, weight: 12 },
    { value: '印南町' as Region, weight: 12 },
    { value: '由良町' as Region, weight: 8 },
    { value: '美浜町' as Region, weight: 8 },
  ])

  const employmentOptions: readonly { readonly value: Employment; readonly weight: number }[] =
    clampedAge < 25
      ? [
          { value: '学生', weight: 60 },
          { value: 'パート・アルバイト', weight: 25 },
          { value: '正社員', weight: 15 },
        ]
      : clampedAge >= 65
        ? [
            { value: '退職', weight: 55 },
            { value: 'パート・アルバイト', weight: 20 },
            { value: '自営業', weight: 15 },
            { value: '主婦・主夫', weight: 10 },
          ]
        : [
            { value: '正社員', weight: 45 },
            { value: 'パート・アルバイト', weight: 15 },
            { value: '自営業', weight: 12 },
            { value: '主婦・主夫', weight: 15 },
            { value: '求職中', weight: 8 },
            { value: '学生', weight: 5 },
          ]

  const employment = pickWeighted(rng, employmentOptions)

  const regionProfile = REGION_PROFILES[region]
  const ageEffect = getAgeEffect(clampedAge)
  const genderEffect = getGenderEffect(gender)

  const categoryIds: readonly CategoryId[] = [
    'health',
    'community',
    'diversity',
    'childcare',
    'efficacy',
    'transport',
  ]

  const categories: readonly CategoryScore[] = categoryIds.map((catId) => {
    const base =
      regionProfile[catId as keyof RegionProfile] +
      ageEffect[catId as keyof AgeEffect] +
      genderEffect[catId] +
      gaussianRandom(rng, 0, 0.6)

    const catOffset = SUBJECTIVE_OBJECTIVE_OFFSET[catId]
    const subjective = clamp(base + catOffset.subjectiveBias + gaussianRandom(rng, 0, 0.5), 1, 10)
    const objective = clamp(base + catOffset.objectiveBias + gaussianRandom(rng, 0, 0.5), 1, 10)
    const subIndicators = generateSubIndicators(rng, catId, subjective)
    const meta = CATEGORIES.find((c) => c.id === catId)

    return {
      id: catId,
      label: meta?.label ?? catId,
      subjectiveScore: subjective,
      objectiveScore: objective,
      subIndicators,
    }
  })

  const overallScore =
    Math.round(
      (categories.reduce((sum, c) => sum + (c.subjectiveScore + c.objectiveScore) / 2, 0) / categories.length) * 10,
    ) / 10

  return {
    id: `R${String(index + 1).padStart(3, '0')}`,
    age: clampedAge,
    ageGroup,
    gender,
    region,
    employment,
    categories,
    overallScore,
  }
}

function generateAllResidents(): readonly Resident[] {
  const rng = mulberry32(42)
  const residents: Resident[] = []

  for (let i = 0; i < 300; i++) {
    residents.push(generateResident(rng, i))
  }

  return residents
}

let cachedResidents: readonly Resident[] | null = null

export function getResidents(): readonly Resident[] {
  if (!cachedResidents) {
    cachedResidents = generateAllResidents()
  }
  return cachedResidents
}
