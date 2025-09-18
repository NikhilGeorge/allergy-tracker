// Re-export all types for easy importing
export * from './incident';
export * from './analytics';
export * from './api';

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data?: T | null;
}

// Form component types
export interface FormFieldProps extends BaseComponentProps {
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
}

// Theme and styling
export interface ThemeColors {
  severity: {
    Mild: string;
    Moderate: string;
    Severe: string;
  };
  chart: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

// Constants
export const SEVERITY_COLORS: ThemeColors['severity'] = {
  Mild: '#10b981', // green-500
  Moderate: '#f59e0b', // amber-500
  Severe: '#ef4444', // red-500
};

export const CHART_COLORS: ThemeColors['chart'] = {
  primary: '#3b82f6', // blue-500
  secondary: '#8b5cf6', // violet-500
  accent: '#06b6d4', // cyan-500
  background: '#f8fafc', // slate-50
};

// Common symptoms for autocomplete
export const COMMON_SYMPTOMS = [
  'Sneezing',
  'Runny nose',
  'Stuffy nose',
  'Itchy eyes',
  'Watery eyes',
  'Red eyes',
  'Itchy throat',
  'Scratchy throat',
  'Coughing',
  'Wheezing',
  'Shortness of breath',
  'Chest tightness',
  'Skin rash',
  'Hives',
  'Itchy skin',
  'Swelling',
  'Nausea',
  'Vomiting',
  'Diarrhea',
  'Stomach cramps',
  'Headache',
  'Fatigue',
  'Dizziness',
];

// Common allergens for autocomplete
export const COMMON_ALLERGENS = [
  // Foods
  'Peanuts',
  'Tree nuts',
  'Milk',
  'Eggs',
  'Wheat',
  'Soy',
  'Fish',
  'Shellfish',
  'Sesame',
  'Chocolate',
  'Strawberries',
  'Tomatoes',
  
  // Environmental
  'Pollen',
  'Dust mites',
  'Pet dander',
  'Mold',
  'Grass',
  'Ragweed',
  'Tree pollen',
  'Latex',
  'Perfume',
  'Cleaning products',
  'Cigarette smoke',
];

// Common activities
export const COMMON_ACTIVITIES = [
  'Outdoor exercise',
  'Indoor exercise',
  'Gardening',
  'Cleaning',
  'Cooking',
  'Pet interaction',
  'Travel',
  'Work',
  'Social gathering',
  'Eating out',
  'Shopping',
  'Walking',
  'Running',
  'Cycling',
  'Swimming',
];