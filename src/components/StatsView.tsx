import {
  CheckCircle,
  Clock,
  Flame,
  AlertTriangle,
  GraduationCap,
  Trophy,
} from 'lucide-react';
import {Task, Subject} from '../types';
import {getColorPalette} from '../lib/colors';

interface StatsViewProps {
  tasks: Task[];
  subjects: Subject[];
}

export default function StatsView({tasks, subjects}: StatsViewProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Count high priority pending tasks
  const urgentCount = tasks.filter((t) => t.priority === 'alta' && !t.completed).length;

  // Simple streak calculator:
  // Count tasks completed in the last 7 days to simulate a productivity streak
  const completedRecentCount = tasks.filter((t) => {
    if (!t.completed || !t.completionDate) return false;
    const dateComp = new Date(t.completionDate);
    const diffTime = Math.abs(new Date().getTime() - dateComp.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  // Let's approximate a fun level or study streak day count
  const streakDays = completedRecentCount > 0 ? Math.min(completedRecentCount * 2, 14) : 0;

  // Calculate task distribution by subject
  const subjectDistribution = subjects.map((sub) => {
    const totalSubjectTasks = tasks.filter((t) => t.subjectId === sub.id).length;
    const completedSubjectTasks = tasks.filter((t) => t.subjectId === sub.id && t.completed).length;
    const pct = totalSubjectTasks > 0 ? Math.round((completedSubjectTasks / totalSubjectTasks) * 100) : 0;

    return {
      subject: sub,
      total: totalSubjectTasks,
      completed: completedSubjectTasks,
      percentage: pct,
    };
  });

  // Calculate student title / levels based on completed tasks
  const getStudentTitle = () => {
    if (completed === 0) return 'Principiante';
    if (completed < 5) return 'Estudiante Constante';
    if (completed < 12) return 'Explorador Escolar';
    return 'Maestro del Calendario 🎓';
  };

  return (
    <div id="stats-container-card" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h2 id="stats-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Rendimiento Escolar
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Tu rango actual: <strong className="text-indigo-600 dark:text-indigo-400">{getStudentTitle()}</strong>
          </p>
        </div>
      </div>

      {/* Grid de Bento-metricas */}
      <div className="grid grid-cols-2 gap-4 mb-6" id="stats-grid">
        {/* Progreso General */}
        <div className="col-span-2 sm:col-span-1 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl p-4 border border-zinc-150 dark:border-zinc-850 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Completado
            </span>
            <div className="flex items-baseline gap-1">
              <span id="stats-completed-count" className="text-2xl font-extrabold text-zinc-850 dark:text-zinc-100">
                {completionPct}%
              </span>
              <span className="text-xs text-zinc-400">
                ({completed}/{total})
              </span>
            </div>
          </div>
          {/* Circular Progress Indicator */}
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-200 dark:text-zinc-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-600 dark:text-indigo-400 transition-all duration-500"
                strokeDasharray={`${completionPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
              ✔️
            </div>
          </div>
        </div>

        {/* Día de Racha de Estudio */}
        <div id="stats-streak-block" className="col-span-1 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl p-4 border border-zinc-150 dark:border-zinc-850 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Racha de Estudio
            </span>
            <div className="flex items-baseline gap-1" id="stats-streak-container">
              <span id="streak-days-count" className="text-2xl font-extrabold text-amber-650 dark:text-amber-400">
                {streakDays}
              </span>
              <span className="text-xs text-zinc-400">días</span>
            </div>
          </div>
          <div id="streak-icon-bg" className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Flame className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* Urgentes Pendientes */}
        <div id="stats-urgents-block" className="col-span-1 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl p-4 border border-zinc-150 dark:border-zinc-850 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Tareas Urgentes
            </span>
            <div className="flex items-baseline gap-1">
              <span id="urgents-count-value" className="text-2xl font-extrabold text-rose-600 dark:text-rose-450">
                {urgentCount}
              </span>
              <span className="text-xs text-rose-400">alta priority</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-450 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Distribución de Materias */}
      <div>
        <label className="block text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-3">
          Rendimiento por Asignatura ({subjects.length})
        </label>
        
        {subjects.length === 0 ? (
          <p className="text-xs text-zinc-450 italic py-2">
            No hay materias registradas para analizar.
          </p>
        ) : (
          <div className="space-y-3" id="stats-subject-bars">
            {subjectDistribution.map(({subject, total: subTotal, percentage, completed: subComp}) => {
              const pal = getColorPalette(subject.color);

              return (
                <div key={subject.id} id={`sub-progress-${subject.id}`} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                      {subject.name}
                    </span>
                    <span className="text-zinc-400">
                      {subComp}/{subTotal} ({percentage}%)
                    </span>
                  </div>
                  
                  {/* Custom animated progress bar */}
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-850 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500`}
                      style={{
                        width: subTotal > 0 ? `${percentage}%` : '0%',
                        backgroundColor:
                          percentage === 0
                            ? '#d1d5db' // gray
                            : subject.color === 'emerald'
                            ? '#10b981'
                            : subject.color === 'indigo'
                            ? '#6366f1'
                            : subject.color === 'amber'
                            ? '#f59e0b'
                            : subject.color === 'rose'
                            ? '#f43f5e'
                            : subject.color === 'cyan'
                            ? '#06b6d4'
                            : subject.color === 'violet'
                            ? '#8b5cf6'
                            : subject.color === 'sky'
                            ? '#0ea5e9'
                            : '#f97316',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
