export const getTodayDateString = (): string => {
  // Use local timezone or direct ISO string depending on system format
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDaysDifference = (dueDateStr: string, benchmarkDateStr?: string): number => {
  // Parses YYYY-MM-DD and computes date difference in days.
  // Benchmark defaults to today.
  const benchmark = benchmarkDateStr ? new Date(benchmarkDateStr) : new Date();
  // Clear times to strictly compare dates
  benchmark.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - benchmark.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const formatRelativeDays = (dueDateStr: string): { text: string; color: string; isUrgent: boolean; isLate: boolean } => {
  const diff = getDaysDifference(dueDateStr);
  if (diff < 0) {
    const absDiff = Math.abs(diff);
    return {
      text: `Atrasada por ${absDiff} ${absDiff === 1 ? 'día' : 'días'}`,
      color: 'text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900',
      isUrgent: true,
      isLate: true
    };
  } else if (diff === 0) {
    return {
      text: 'Vence hoy ⚡',
      color: 'text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900',
      isUrgent: true,
      isLate: false
    };
  } else if (diff === 1) {
    return {
      text: 'Vence mañana ⏰',
      color: 'text-orange-700 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900',
      isUrgent: true,
      isLate: false
    };
  } else if (diff <= 3) {
    return {
      text: `Quedan ${diff} días`,
      color: 'text-amber-700 dark:text-amber-400 font-medium bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900',
      isUrgent: false,
      isLate: false
    };
  } else {
    return {
      text: `Vence en ${diff} días`,
      color: 'text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800',
      isUrgent: false,
      isLate: false
    };
  }
};

export const formatPrettyDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  const monthIndex = parseInt(month, 10) - 1;
  const prettyMonth = months[monthIndex] || '';
  
  // Format beautifully: "29 de May"
  return `${parseInt(day, 10)} ${prettyMonth}, ${year}`;
};
