import type {
  ObjectiveDomainMeta,
  ObjectiveIndicatorMeta,
  ObjectiveDomainId,
  CategoryId,
} from './types'

// ===== ドメイン定義 =====

export const OBJECTIVE_DOMAINS: readonly ObjectiveDomainMeta[] = [
  {
    id: 'livingEnvironment',
    label: '生活環境',
    description: '医療・福祉・商業・住環境・交通・安全・行政・環境・防災・教育施設',
    color: '#0031D8',
    icon: 'house_fill.svg',
    subDomains: [
      { id: 'healthcare', label: '医療', indicatorIds: ['LE_HC_001', 'LE_HC_002', 'LE_HC_003', 'LE_HC_004', 'LE_HC_005', 'LE_HC_006'] },
      { id: 'welfare', label: '福祉', indicatorIds: ['LE_WF_001', 'LE_WF_002', 'LE_WF_003', 'LE_WF_004', 'LE_WF_005', 'LE_WF_006'] },
      { id: 'commerce', label: '商業', indicatorIds: ['LE_CM_001', 'LE_CM_002', 'LE_CM_003', 'LE_CM_004', 'LE_CM_005'] },
      { id: 'housing', label: '住環境', indicatorIds: ['LE_HS_001', 'LE_HS_002', 'LE_HS_003', 'LE_HS_004', 'LE_HS_005', 'LE_HS_006'] },
      { id: 'transport', label: '交通', indicatorIds: ['LE_TR_001', 'LE_TR_002', 'LE_TR_003', 'LE_TR_004', 'LE_TR_005', 'LE_TR_006'] },
      { id: 'safety', label: '安全', indicatorIds: ['LE_SF_001', 'LE_SF_002', 'LE_SF_003', 'LE_SF_004', 'LE_SF_005'] },
      { id: 'governance', label: '行政', indicatorIds: ['LE_GV_001', 'LE_GV_002', 'LE_GV_003', 'LE_GV_004', 'LE_GV_005', 'LE_GV_006'] },
      { id: 'environment', label: '環境', indicatorIds: ['LE_EN_001', 'LE_EN_002', 'LE_EN_003', 'LE_EN_004', 'LE_EN_005', 'LE_EN_006'] },
      { id: 'disaster', label: '防災', indicatorIds: ['LE_DS_001', 'LE_DS_002', 'LE_DS_003', 'LE_DS_004'] },
      { id: 'education_facility', label: '教育施設', indicatorIds: ['LE_EF_001', 'LE_EF_002', 'LE_EF_003', 'LE_EF_004'] },
    ],
  },
  {
    id: 'regionalRelations',
    label: '地域の人間関係',
    description: '地域参加・世帯構成・市民活動・多様性',
    color: '#5B6FAF',
    icon: 'family_fill.svg',
    subDomains: [
      { id: 'participation', label: '地域参加', indicatorIds: ['RR_PT_001', 'RR_PT_002', 'RR_PT_003', 'RR_PT_004', 'RR_PT_005'] },
      { id: 'household', label: '世帯構成', indicatorIds: ['RR_HH_001', 'RR_HH_002', 'RR_HH_003', 'RR_HH_004'] },
      { id: 'civic', label: '市民活動', indicatorIds: ['RR_CV_001', 'RR_CV_002', 'RR_CV_003', 'RR_CV_004'] },
      { id: 'diversity_rel', label: '多様性', indicatorIds: ['RR_DV_001', 'RR_DV_002', 'RR_DV_003', 'RR_DV_004', 'RR_DV_005'] },
    ],
  },
  {
    id: 'authenticLiving',
    label: '自分らしい生き方',
    description: '政治参加・雇用・健康長寿・文化・教育・イノベーション',
    color: '#4979F5',
    icon: 'me_fill.svg',
    subDomains: [
      { id: 'political', label: '政治参加', indicatorIds: ['AL_PL_001', 'AL_PL_002', 'AL_PL_003'] },
      { id: 'employment', label: '雇用', indicatorIds: ['AL_EM_001', 'AL_EM_002', 'AL_EM_003', 'AL_EM_004', 'AL_EM_005'] },
      { id: 'longevity', label: '健康長寿', indicatorIds: ['AL_LG_001', 'AL_LG_002', 'AL_LG_003'] },
      { id: 'culture', label: '文化', indicatorIds: ['AL_CL_001', 'AL_CL_002', 'AL_CL_003', 'AL_CL_004'] },
      { id: 'lifelong_edu', label: '教育', indicatorIds: ['AL_ED_001', 'AL_ED_002', 'AL_ED_003'] },
      { id: 'innovation', label: 'イノベーション', indicatorIds: ['AL_IN_001', 'AL_IN_002', 'AL_IN_003', 'AL_IN_004'] },
    ],
  },
] as const

// ===== 指標メタデータ定義 =====

function ind(
  id: string,
  domainId: ObjectiveDomainId,
  subDomainId: string,
  label: string,
  unit: string,
  source: string,
  higherIsBetter: boolean,
  relatedCategories: readonly CategoryId[],
  description: string = '',
): ObjectiveIndicatorMeta {
  return { id, domainId, subDomainId, label, unit, description: description || label, source, higherIsBetter, relatedCategories }
}

// --- 生活環境 ---

const LIVING_ENV_HEALTHCARE: readonly ObjectiveIndicatorMeta[] = [
  ind('LE_HC_001', 'livingEnvironment', 'healthcare', '人口10万人あたり医療施設数', '施設/10万人', '厚生労働省 医療施設調査', true, ['health']),
  ind('LE_HC_002', 'livingEnvironment', 'healthcare', '医療施設従事者人口カバー率', '%', '厚生労働省 医師・歯科医師・薬剤師統計', true, ['health']),
  ind('LE_HC_003', 'livingEnvironment', 'healthcare', '人口あたり国民健康保険医療費', '万円/人', '厚生労働省 国民健康保険事業年報', false, ['health']),
  ind('LE_HC_004', 'livingEnvironment', 'healthcare', '人口あたり診療所数', '件/千人', '厚生労働省 医療施設調査', true, ['health']),
  ind('LE_HC_005', 'livingEnvironment', 'healthcare', '特定健康診査受診率', '%', '厚生労働省 特定健康診査実施状況', true, ['health']),
  ind('LE_HC_006', 'livingEnvironment', 'healthcare', '救急医療体制充実度', 'スコア', '消防庁 救急・救助の概況', true, ['health']),
]

const LIVING_ENV_WELFARE: readonly ObjectiveIndicatorMeta[] = [
  ind('LE_WF_001', 'livingEnvironment', 'welfare', '待機児童率', '%', '厚生労働省 保育所等関連状況', false, ['childcare']),
  ind('LE_WF_002', 'livingEnvironment', 'welfare', '人口あたり児童福祉施設数', '施設/万人', '厚生労働省 社会福祉施設等調査', true, ['childcare']),
  ind('LE_WF_003', 'livingEnvironment', 'welfare', '福祉施設従事者数', '人/千人', '厚生労働省 社会福祉施設等調査', true, ['health', 'childcare']),
  ind('LE_WF_004', 'livingEnvironment', 'welfare', '人口あたり生活保護率', '‰', '厚生労働省 被保護者調査', false, ['health']),
  ind('LE_WF_005', 'livingEnvironment', 'welfare', '介護施設定員充足率', '%', '厚生労働省 介護サービス施設調査', true, ['health']),
  ind('LE_WF_006', 'livingEnvironment', 'welfare', '障害者福祉サービス利用率', '%', '厚生労働省 障害福祉サービス等の利用状況', true, ['diversity']),
]

const LIVING_ENV_COMMERCE: readonly ObjectiveIndicatorMeta[] = [
  ind('LE_CM_001', 'livingEnvironment', 'commerce', '大型商業施設数', '施設/万人', '経済産業省 商業統計', true, ['transport']),
  ind('LE_CM_002', 'livingEnvironment', 'commerce', '人口あたりコンビニエンスストア数', '店/千人', '経済産業省 商業統計', true, ['transport']),
  ind('LE_CM_003', 'livingEnvironment', 'commerce', '商業施設アクセス圏人口カバー率', '%', '経済産業省 買物弱者対策', true, ['transport']),
  ind('LE_CM_004', 'livingEnvironment', 'commerce', '小売業年間販売額', '万円/人', '経済産業省 商業統計', true, ['efficacy']),
  ind('LE_CM_005', 'livingEnvironment', 'commerce', '飲食店密度', '店/km²', '総務省 経済センサス', true, ['community']),
]

const LIVING_ENV_HOUSING: readonly ObjectiveIndicatorMeta[] = [
  ind('LE_HS_001', 'livingEnvironment', 'housing', '住宅あたり延べ床面積', '㎡/戸', '総務省 住宅・土地統計調査', true, ['health']),
  ind('LE_HS_002', 'livingEnvironment', 'housing', '平均地価（住宅地）', '万円/㎡', '国土交通省 地価公示', false, ['efficacy']),
  ind('LE_HS_003', 'livingEnvironment', 'housing', '可住地面積あたり都市公園面積', '㎡/人', '国土交通省 都市公園等整備現況', true, ['health', 'childcare']),
  ind('LE_HS_004', 'livingEnvironment', 'housing', '空き家率', '%', '総務省 住宅・土地統計調査', false, ['community']),
  ind('LE_HS_005', 'livingEnvironment', 'housing', '住宅耐震化率', '%', '国土交通省 耐震改修促進計画', true, ['health']),
  ind('LE_HS_006', 'livingEnvironment', 'housing', '上下水道普及率', '%', '厚生労働省 水道統計', true, ['health']),
]

const LIVING_ENV_TRANSPORT: readonly ObjectiveIndicatorMeta[] = [
  ind('LE_TR_001', 'livingEnvironment', 'transport', 'バス路線数', '路線', '国土交通省 乗合バス事業統計', true, ['transport']),
  ind('LE_TR_002', 'livingEnvironment', 'transport', '歩道整備率', '%', '国土交通省 道路統計年報', true, ['transport', 'health']),
  ind('LE_TR_003', 'livingEnvironment', 'transport', '公共交通カバー率', '%', '国土交通省 地域公共交通計画', true, ['transport']),
  ind('LE_TR_004', 'livingEnvironment', 'transport', '歩行者交通量', '人/日', '国土交通省 全国道路・街路交通情勢調査', true, ['transport', 'community']),
  ind('LE_TR_005', 'livingEnvironment', 'transport', '自転車通行空間整備延長', 'km/万人', '国土交通省 自転車活用推進計画', true, ['transport', 'health']),
  ind('LE_TR_006', 'livingEnvironment', 'transport', '鉄道駅勢圏人口カバー率', '%', '国土交通省 鉄道統計年報', true, ['transport']),
]

const LIVING_ENV_SAFETY: readonly ObjectiveIndicatorMeta[] = [
  ind('LE_SF_001', 'livingEnvironment', 'safety', '人口あたり犯罪認知件数', '件/千人', '警察庁 犯罪統計', false, ['health']),
  ind('LE_SF_002', 'livingEnvironment', 'safety', '人口あたり交通事故件数', '件/万人', '警察庁 交通事故統計', false, ['transport']),
  ind('LE_SF_003', 'livingEnvironment', 'safety', '街灯設置密度', '基/km', '自治体統計', true, ['transport']),
  ind('LE_SF_004', 'livingEnvironment', 'safety', '防犯カメラ設置率', '台/km²', '自治体統計', true, ['health']),
  ind('LE_SF_005', 'livingEnvironment', 'safety', '通学路安全対策実施率', '%', '文部科学省 通学路安全対策', true, ['childcare']),
]

const LIVING_ENV_GOVERNANCE: readonly ObjectiveIndicatorMeta[] = [
  ind('LE_GV_001', 'livingEnvironment', 'governance', '財政力指数', 'スコア', '総務省 地方財政状況調査', true, ['efficacy']),
  ind('LE_GV_002', 'livingEnvironment', 'governance', 'デジタルトランスフォーメーション指標', 'スコア', '総務省 自治体DX推進計画', true, ['efficacy']),
  ind('LE_GV_003', 'livingEnvironment', 'governance', '白書活用度', 'スコア', '内閣府 地方公共団体調査', true, ['efficacy']),
  ind('LE_GV_004', 'livingEnvironment', 'governance', '行政手続オンライン化率', '%', '総務省 行政手続等の棚卸し結果', true, ['efficacy']),
  ind('LE_GV_005', 'livingEnvironment', 'governance', '住民1人あたり行政コスト', '万円/人', '総務省 地方公営企業年鑑', false, ['efficacy']),
  ind('LE_GV_006', 'livingEnvironment', 'governance', '公共施設マネジメント進捗率', '%', '総務省 公共施設等総合管理計画', true, ['efficacy']),
]

const LIVING_ENV_ENVIRONMENT: readonly ObjectiveIndicatorMeta[] = [
  ind('LE_EN_001', 'livingEnvironment', 'environment', 'ゴミのリサイクル率', '%', '環境省 一般廃棄物処理実態調査', true, ['health']),
  ind('LE_EN_002', 'livingEnvironment', 'environment', '1人あたりCO2排出量', 't-CO2/人', '環境省 温室効果ガス排出量', false, ['health']),
  ind('LE_EN_003', 'livingEnvironment', 'environment', '再生可能エネルギー導入率', '%', '資源エネルギー庁 エネルギー白書', true, ['efficacy']),
  ind('LE_EN_004', 'livingEnvironment', 'environment', '自然環境ポテンシャル', 'スコア', '環境省 自然環境保全基礎調査', true, ['health']),
  ind('LE_EN_005', 'livingEnvironment', 'environment', '水質環境基準達成率', '%', '環境省 公共用水域水質測定結果', true, ['health']),
  ind('LE_EN_006', 'livingEnvironment', 'environment', '緑被率', '%', '国土交通省 都市緑化データベース', true, ['health']),
]

const LIVING_ENV_DISASTER: readonly ObjectiveIndicatorMeta[] = [
  ind('LE_DS_001', 'livingEnvironment', 'disaster', '防災まちづくり指標', 'スコア', '内閣府 防災白書', true, ['health']),
  ind('LE_DS_002', 'livingEnvironment', 'disaster', '避難所カバー率', '%', '内閣府 防災情報', true, ['health', 'community']),
  ind('LE_DS_003', 'livingEnvironment', 'disaster', '防災デジタル対応度', 'スコア', '消防庁 地方防災行政の現況', true, ['efficacy']),
  ind('LE_DS_004', 'livingEnvironment', 'disaster', 'ハザードマップ整備率', '%', '国土交通省 ハザードマップポータルサイト', true, ['health']),
]

const LIVING_ENV_EDU_FACILITY: readonly ObjectiveIndicatorMeta[] = [
  ind('LE_EF_001', 'livingEnvironment', 'education_facility', '人口あたり図書館数', '館/万人', '文部科学省 社会教育調査', true, ['childcare']),
  ind('LE_EF_002', 'livingEnvironment', 'education_facility', '人口あたり児童館数', '館/万人', '厚生労働省 社会福祉施設等調査', true, ['childcare']),
  ind('LE_EF_003', 'livingEnvironment', 'education_facility', '学校ICT環境整備率', '%', '文部科学省 学校におけるICT環境整備状況', true, ['childcare', 'efficacy']),
  ind('LE_EF_004', 'livingEnvironment', 'education_facility', '放課後児童クラブ充足率', '%', '厚生労働省 放課後児童クラブの実施状況', true, ['childcare']),
]

// --- 地域の人間関係 ---

const REGIONAL_PARTICIPATION: readonly ObjectiveIndicatorMeta[] = [
  ind('RR_PT_001', 'regionalRelations', 'participation', '自治会・町内会参加率', '%', '総務省 地域コミュニティに関する調査', true, ['community']),
  ind('RR_PT_002', 'regionalRelations', 'participation', '祭り・地域イベント数', '件/年', '自治体文化振興課', true, ['community']),
  ind('RR_PT_003', 'regionalRelations', 'participation', '人口あたりNPO法人事業所数', '所/万人', '内閣府 NPOポータルサイト', true, ['community']),
  ind('RR_PT_004', 'regionalRelations', 'participation', '人口あたり民生委員数', '人/千人', '厚生労働省 福祉行政報告例', true, ['community', 'health']),
  ind('RR_PT_005', 'regionalRelations', 'participation', 'ボランティア活動参加率', '%', '総務省 社会生活基本調査', true, ['community']),
]

const REGIONAL_HOUSEHOLD: readonly ObjectiveIndicatorMeta[] = [
  ind('RR_HH_001', 'regionalRelations', 'household', '拡大家族世帯割合', '%', '総務省 国勢調査', true, ['community']),
  ind('RR_HH_002', 'regionalRelations', 'household', '高齢独身世帯割合', '%', '総務省 国勢調査', false, ['community', 'health']),
  ind('RR_HH_003', 'regionalRelations', 'household', '居住期間20年以上の割合', '%', '総務省 住宅・土地統計調査', true, ['community']),
  ind('RR_HH_004', 'regionalRelations', 'household', '要援護者割合', '%', '厚生労働省 被保護者調査', false, ['health', 'community']),
]

const REGIONAL_CIVIC: readonly ObjectiveIndicatorMeta[] = [
  ind('RR_CV_001', 'regionalRelations', 'civic', '関係人口創出活動団体数', '団体/万人', '総務省 関係人口ポータル', true, ['community']),
  ind('RR_CV_002', 'regionalRelations', 'civic', '人口あたり都市再生推進法人数', '法人/10万人', '国土交通省 都市再生', true, ['community', 'efficacy']),
  ind('RR_CV_003', 'regionalRelations', 'civic', '人口あたり政治団体等の数', '団体/万人', '総務省 政治資金収支報告', true, ['community', 'efficacy']),
  ind('RR_CV_004', 'regionalRelations', 'civic', '人口あたり都市再開発件数', '件/10万人', '国土交通省 市街地再開発事業', true, ['community']),
]

const REGIONAL_DIVERSITY: readonly ObjectiveIndicatorMeta[] = [
  ind('RR_DV_001', 'regionalRelations', 'diversity_rel', '議会の女性議員割合', '%', '総務省 地方公共団体の議会の議員調査', true, ['diversity']),
  ind('RR_DV_002', 'regionalRelations', 'diversity_rel', '自治体女性職員割合', '%', '総務省 地方公共団体の勤務条件等調査', true, ['diversity']),
  ind('RR_DV_003', 'regionalRelations', 'diversity_rel', '自治体管理職の女性割合', '%', '内閣府 地方公共団体における男女共同参画', true, ['diversity']),
  ind('RR_DV_004', 'regionalRelations', 'diversity_rel', '人口あたり外国籍住民数', '人/千人', '総務省 住民基本台帳', true, ['diversity']),
  ind('RR_DV_005', 'regionalRelations', 'diversity_rel', '多様性政策指数', 'スコア', '内閣府 多文化共生推進プラン', true, ['diversity']),
]

// --- 自分らしい生き方 ---

const AUTH_POLITICAL: readonly ObjectiveIndicatorMeta[] = [
  ind('AL_PL_001', 'authenticLiving', 'political', '首長選挙投票率', '%', '総務省 選挙関連資料', true, ['efficacy', 'community']),
  ind('AL_PL_002', 'authenticLiving', 'political', '市区町村議選投票率', '%', '総務省 選挙関連資料', true, ['efficacy', 'community']),
  ind('AL_PL_003', 'authenticLiving', 'political', '転入超過率', '%', '総務省 住民基本台帳人口移動報告', true, ['efficacy']),
]

const AUTH_EMPLOYMENT: readonly ObjectiveIndicatorMeta[] = [
  ind('AL_EM_001', 'authenticLiving', 'employment', '完全失業率', '%', '総務省 労働力調査', false, ['efficacy']),
  ind('AL_EM_002', 'authenticLiving', 'employment', '正規雇用率', '%', '総務省 労働力調査', true, ['efficacy']),
  ind('AL_EM_003', 'authenticLiving', 'employment', '高齢者有業率', '%', '総務省 就業構造基本調査', true, ['efficacy', 'health']),
  ind('AL_EM_004', 'authenticLiving', 'employment', '市区町村内従業割合', '%', '総務省 国勢調査', true, ['transport', 'efficacy']),
  ind('AL_EM_005', 'authenticLiving', 'employment', '女性就業率', '%', '総務省 労働力調査', true, ['diversity', 'efficacy']),
]

const AUTH_LONGEVITY: readonly ObjectiveIndicatorMeta[] = [
  ind('AL_LG_001', 'authenticLiving', 'longevity', '健康寿命（女性）', '歳', '厚生労働省 健康寿命の算定方法の指針', true, ['health']),
  ind('AL_LG_002', 'authenticLiving', 'longevity', '健康寿命（男性）', '歳', '厚生労働省 健康寿命の算定方法の指針', true, ['health']),
  ind('AL_LG_003', 'authenticLiving', 'longevity', '特定健診によるメタボ該当率', '%', '厚生労働省 特定健康診査実施状況', false, ['health']),
]

const AUTH_CULTURE: readonly ObjectiveIndicatorMeta[] = [
  ind('AL_CL_001', 'authenticLiving', 'culture', '芸術・音楽文化団体数', '団体/万人', '文化庁 文化芸術活動調査', true, ['diversity', 'community']),
  ind('AL_CL_002', 'authenticLiving', 'culture', 'カルチャーセンター・教室数', '施設/万人', '文部科学省 社会教育調査', true, ['diversity']),
  ind('AL_CL_003', 'authenticLiving', 'culture', '国指定文化財数', '件', '文化庁 国指定文化財等データベース', true, ['diversity']),
  ind('AL_CL_004', 'authenticLiving', 'culture', '人口あたり博物館・美術館数', '館/10万人', '文部科学省 社会教育調査', true, ['diversity']),
]

const AUTH_EDUCATION: readonly ObjectiveIndicatorMeta[] = [
  ind('AL_ED_001', 'authenticLiving', 'lifelong_edu', '人口あたり生涯学習施設数', '施設/万人', '文部科学省 社会教育調査', true, ['childcare', 'efficacy']),
  ind('AL_ED_002', 'authenticLiving', 'lifelong_edu', '大学・短大数', '校/10万人', '文部科学省 学校基本調査', true, ['childcare', 'efficacy']),
  ind('AL_ED_003', 'authenticLiving', 'lifelong_edu', '人口あたり教育関連施設利用数', '人/千人', '文部科学省 社会教育調査', true, ['childcare']),
]

const AUTH_INNOVATION: readonly ObjectiveIndicatorMeta[] = [
  ind('AL_IN_001', 'authenticLiving', 'innovation', '大学発ベンチャー企業数', '社/10万人', '経済産業省 大学発ベンチャー実態調査', true, ['efficacy']),
  ind('AL_IN_002', 'authenticLiving', 'innovation', 'コワーキングスペース数', '施設/万人', '経済産業省 シェアリングエコノミー調査', true, ['efficacy']),
  ind('AL_IN_003', 'authenticLiving', 'innovation', 'クリエイティブ産業事業者数', '社/万人', '経済産業省 工業統計', true, ['efficacy']),
  ind('AL_IN_004', 'authenticLiving', 'innovation', 'イノベーション政策指数', 'スコア', '内閣府 科学技術・イノベーション白書', true, ['efficacy']),
]

// ===== 全指標のレジストリ =====

export const OBJECTIVE_INDICATORS: readonly ObjectiveIndicatorMeta[] = [
  ...LIVING_ENV_HEALTHCARE,
  ...LIVING_ENV_WELFARE,
  ...LIVING_ENV_COMMERCE,
  ...LIVING_ENV_HOUSING,
  ...LIVING_ENV_TRANSPORT,
  ...LIVING_ENV_SAFETY,
  ...LIVING_ENV_GOVERNANCE,
  ...LIVING_ENV_ENVIRONMENT,
  ...LIVING_ENV_DISASTER,
  ...LIVING_ENV_EDU_FACILITY,
  ...REGIONAL_PARTICIPATION,
  ...REGIONAL_HOUSEHOLD,
  ...REGIONAL_CIVIC,
  ...REGIONAL_DIVERSITY,
  ...AUTH_POLITICAL,
  ...AUTH_EMPLOYMENT,
  ...AUTH_LONGEVITY,
  ...AUTH_CULTURE,
  ...AUTH_EDUCATION,
  ...AUTH_INNOVATION,
] as const

export function getIndicatorMeta(id: string): ObjectiveIndicatorMeta | undefined {
  return OBJECTIVE_INDICATORS.find((i) => i.id === id)
}

export function getIndicatorsByDomain(domainId: ObjectiveDomainId): readonly ObjectiveIndicatorMeta[] {
  return OBJECTIVE_INDICATORS.filter((i) => i.domainId === domainId)
}

export function getIndicatorsBySubDomain(subDomainId: string): readonly ObjectiveIndicatorMeta[] {
  return OBJECTIVE_INDICATORS.filter((i) => i.subDomainId === subDomainId)
}

export function getIndicatorsForCategory(categoryId: CategoryId): readonly ObjectiveIndicatorMeta[] {
  return OBJECTIVE_INDICATORS.filter((i) => i.relatedCategories.includes(categoryId))
}

export function getDomainMeta(domainId: ObjectiveDomainId): ObjectiveDomainMeta | undefined {
  return OBJECTIVE_DOMAINS.find((d) => d.id === domainId)
}
