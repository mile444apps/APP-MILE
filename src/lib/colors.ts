export interface ColorPalette {
  name: string;
  badge: string;
  bg: string;
  border: string;
  text: string;
  accent: string;
  accentHover: string;
}

export const COLOR_MAP: Record<string, ColorPalette> = {
  emerald: {
    name: 'Verde Esmeralda',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    accent: 'bg-emerald-600 text-white',
    accentHover: 'hover:bg-emerald-700',
  },
  indigo: {
    name: 'Azul Índigo',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300',
    bg: 'bg-indigo-50 dark:bg-indigo-950/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-700 dark:text-indigo-300',
    accent: 'bg-indigo-600 text-white',
    accentHover: 'hover:bg-indigo-700',
  },
  amber: {
    name: 'Ámbar Cálido',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    accent: 'bg-amber-600 text-white',
    accentHover: 'hover:bg-amber-700',
  },
  rose: {
    name: 'Rosa Suave',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    border: 'border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-300',
    accent: 'bg-rose-600 text-white',
    accentHover: 'hover:bg-rose-700',
  },
  cyan: {
    name: 'Cian Claro',
    badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300',
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    border: 'border-cyan-200 dark:border-cyan-800',
    text: 'text-cyan-700 dark:text-cyan-300',
    accent: 'bg-cyan-600 text-white',
    accentHover: 'hover:bg-cyan-700',
  },
  violet: {
    name: 'Violeta Profundo',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    border: 'border-violet-200 dark:border-violet-800',
    text: 'text-violet-700 dark:text-violet-300',
    accent: 'bg-violet-600 text-white',
    accentHover: 'hover:bg-violet-700',
  },
  sky: {
    name: 'Celeste',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    border: 'border-sky-200 dark:border-sky-800',
    text: 'text-sky-700 dark:text-sky-300',
    accent: 'bg-sky-600 text-white',
    accentHover: 'hover:bg-sky-700',
  },
  orange: {
    name: 'Naranja Vibrante',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-700 dark:text-orange-300',
    accent: 'bg-orange-600 text-white',
    accentHover: 'hover:bg-orange-700',
  },
};

export const getColorPalette = (colorKey: string): ColorPalette => {
  return COLOR_MAP[colorKey] || COLOR_MAP.indigo;
};

export const AVAILABLE_COLORS = Object.keys(COLOR_MAP);
