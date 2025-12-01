
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
  moods: Mood[]; // Changed from optional single mood to array
  symptoms: string[]; // e.g., "Спазмы", "Головная боль"
  painLevel?: number; // 0-10
  painLocations?: string[]; // e.g. "Back", "Breasts"
  sleepHours: number;
  waterGlasses: number;
  sex: SexType; // Updated from boolean
  libido?: 'Low' | 'Medium' | 'High';
  energy?: 'Low' | 'Medium' | 'High';
  stress?: 'Low' | 'Medium' | 'High';
  discharge?: DischargeType;
  temperature?: number; // BBT
  weight?: number;
  notes: string;
  contraceptiveTaken?: boolean;
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

export const SYMPTOMS_LIST = ['Спазмы', 'Головная боль', 'Вздутие', 'Акне', 'Боль в спине', 'Тяга к еде', 'Тошнота', 'Головокружение'];
