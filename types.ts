
export enum FlowIntensity {
  None = 0,
  Light = 1,
  Medium = 2,
  Heavy = 3,
}

export enum Mood {
  Calm = 'Calm',
  Happy = 'Happy',
  Irritable = 'Irritable',
  Sad = 'Sad',
  Anxious = 'Anxious',
  Energetic = 'Energetic',
  Depressed = 'Depressed',
  MoodSwings = 'Mood Swings',
}

export const MoodTranslation: Record<string, string> = {
  'Calm': 'Спокойствие',
  'Happy': 'Счастье',
  'Irritable': 'Раздражение',
  'Sad': 'Грусть',
  'Anxious': 'Тревога',
  'Energetic': 'Энергия',
  'Depressed': 'Апатия',
  'Mood Swings': 'Перепады',
};

export enum BleedingColor {
  Red = 'Red',
  Brown = 'Brown',
  Pink = 'Pink',
  Black = 'Black',
}

export enum DischargeType {
  None = 'None',
  Sticky = 'Sticky',
  Creamy = 'Creamy',
  EggWhite = 'Egg White',
  Watery = 'Watery',
  Unusual = 'Unusual',
}

export const DischargeTranslation: Record<string, string> = {
  'None': 'Нет',
  'Sticky': 'Липкие',
  'Creamy': 'Кремовые',
  'Egg White': 'Яичный белок',
  'Watery': 'Водянистые',
  'Unusual': 'Необычные',
};

export type SexType = 'None' | 'Protected' | 'Unprotected';

export interface DayLog {
  date: string; // ISO YYYY-MM-DD
  flow: FlowIntensity;
  bleedingColor?: BleedingColor;
  bleedingClots?: boolean;
  moods: Mood[]; 
  symptoms: string[]; // Flat list of all symptoms
  painLevel: number; // 0-10
  painLocations: string[]; // e.g. "Head", "Back", "Breasts"
  sleepHours: number;
  waterGlasses: number;
  sex: SexType;
  sexDetails?: string[]; // e.g. "Libido High", "Discomfort"
  energy?: 'Low' | 'Medium' | 'High';
  stress?: 'Low' | 'Medium' | 'High';
  discharge?: DischargeType;
  temperature?: number; // BBT
  weight?: number;
  notes: string;
  contraceptiveTaken?: boolean;
  medications?: string[]; // e.g. "Magnesium", "Painkillers"
  nutrition?: string[]; // e.g. "Sweets", "Alcohol"
}

export type UserGoal = 'track' | 'conceive' | 'avoid' | 'pregnancy' | 'postpartum' | 'menopause';

export interface UserSettings {
  isOnboarded: boolean;
  name?: string;
  age?: number;
  lastPeriodDate: string; // ISO YYYY-MM-DD
  avgCycleLength: number; // e.g. 28
  avgPeriodLength: number; // e.g. 5
  goal?: UserGoal;
  contraceptionType?: string;
  hasConsented?: boolean;
  isPro: boolean;
}

export interface CyclePhase {
  phase: 'Menstruation' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Pregnancy' | 'Postpartum' | 'Menopause';
  dayInCycle: number;
  daysUntilNextPeriod: number;
  isFertile: boolean;
}

export const PhaseTranslation: Record<string, string> = {
    'Menstruation': 'Менструация',
    'Follicular': 'Фолликулярная',
    'Ovulation': 'Овуляция',
    'Luteal': 'Лютеиновая',
    'Pregnancy': 'Беременность',
    'Postpartum': 'После родов',
    'Menopause': 'Менопауза'
};

// Organized Categories for UI
export const SYMPTOM_CATEGORIES = {
    General: ['Спазмы', 'Головная боль', 'Головокружение', 'Отеки'],
    GI: ['Вздутие', 'Тошнота', 'Тяга к сладкому', 'Аппетит++', 'Диарея', 'Запор'],
    Skin: ['Акне', 'Жирная кожа', 'Сухость', 'Выпадение волос'],
    Breasts: ['Чувствительность', 'Боль в груди', 'Увеличение']
};

export const MEDS_LIST = ['Обезболивающее (НПВС)', 'Магний', 'Железо', 'Витамины', 'Мелатонин'];
export const NUTRITION_LIST = ['Сладкое', 'Фастфуд', 'Алкоголь', 'Кофеин', 'Белок++', 'Овощи++'];
export const SEX_DETAILS_LIST = ['Высокое либидо', 'Низкое либидо', 'Дискомфорт', 'Использовали смазку', 'Оргазм'];
export const PAIN_LOCATIONS = ['Низ живота', 'Поясница', 'Голова', 'Грудь', 'Ноги'];

export const SYMPTOMS_LIST = [
    ...SYMPTOM_CATEGORIES.General,
    ...SYMPTOM_CATEGORIES.GI,
    ...SYMPTOM_CATEGORIES.Skin,
    ...SYMPTOM_CATEGORIES.Breasts
];

// --- Analytics Types ---

export interface CycleHistoryItem {
    startDate: string;
    endDate: string;
    length: number;
    periodLength: number;
}

export type AnomalyType = 'ShortCycle' | 'LongCycle' | 'Irregular' | 'Spotting' | 'HighPain';

export interface CycleAnalysis {
    history: CycleHistoryItem[];
    avgLength: number;
    avgPeriod: number;
    variability: number; // Standard Deviation in days
    predictionConfidence: 'High' | 'Medium' | 'Low';
    anomalies: { type: AnomalyType; date?: string; details: string }[];
    correlations: {
        sleepEffect: string; 
        stressEffect: string;
    };
}
