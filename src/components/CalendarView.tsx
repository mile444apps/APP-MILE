import {useState} from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {Task, Subject} from '../types';
import {getColorPalette} from '../lib/colors';
import {formatPrettyDate} from '../lib/dates';

interface CalendarViewProps {
  tasks: Task[];
  subjects: Subject[];
  onToggleComplete: (id: string) => void;
}

export default function CalendarView({
  tasks,
  subjects,
  onToggleComplete,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date()); // Defaults to current date
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Calculate days in the current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Calculate the first weekday of the current month (0: Sun, 1: Mon, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDateStr(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDateStr(null);
  };

  // Match tasks for a specific date (expects date format: YYYY-MM-DD)
  const getTasksForDate = (dayNum: number): Task[] => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const targetDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    return tasks.filter((t) => t.dueDate === targetDateStr);
  };

  const dayCells: (number | null)[] = [];
  // Pad the first week with null values
  for (let i = 0; i < firstDayIndex; i++) {
    dayCells.push(null);
  }
  // Populate the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    dayCells.push(day);
  }

  // Handle clicking on a calendar cell
  const handleDayClick = (dayNum: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const targetDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    setSelectedDateStr(targetDateStr);
  };

  // Find tasks to show beneath the calendar if a day is clicked
  const selectedTasks = selectedDateStr
    ? tasks.filter((t) => t.dueDate === selectedDateStr)
    : [];

  // Color dots utility
  const renderDots = (dayNum: number) => {
    const dayTasks = getTasksForDate(dayNum);
    if (dayTasks.length === 0) return null;

    // Show up to 3 dots as preview to avoid UI spill
    return (
      <div className="flex justify-center gap-1 mt-1 flex-wrap overflow-hidden h-2.5 max-w-full">
        {dayTasks.slice(0, 3).map((task) => {
          const sub = subjects.find((s) => s.id === task.subjectId);
          const colorKey = sub?.color || 'indigo';
          
          return (
            <span
              key={task.id}
              className={`w-1.5 h-1.5 rounded-full ${
                task.completed ? 'bg-zinc-300 dark:bg-zinc-700 line-through' : ''
              }`}
              style={{
                backgroundColor: task.completed
                  ? undefined
                  : colorKey === 'emerald'
                  ? '#10b981'
                  : colorKey === 'indigo'
                  ? '#6366f1'
                  : colorKey === 'amber'
                  ? '#f59e0b'
                  : colorKey === 'rose'
                  ? '#f43f5e'
                  : colorKey === 'cyan'
                  ? '#06b6d4'
                  : colorKey === 'violet'
                  ? '#8b5cf6'
                  : colorKey === 'sky'
                  ? '#0ea5e9'
                  : '#f97316',
              }}
              title={`${sub?.name || 'Materia'}: ${task.title}`}
            />
          );
        })}
        {dayTasks.length > 3 && (
          <span className="text-[7px] text-zinc-400 font-bold leading-none shrink-0" style={{ marginTop: '-1px' }}>
            +{dayTasks.length - 3}
          </span>
        )}
      </div>
    );
  };

  return (
    <div id="calendar-container-card" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 id="calendar-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Calendario Escolar
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Visualiza tus entregas programadas mensualmente.
            </p>
          </div>
        </div>

        {/* Controles de mes */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-150 dark:border-zinc-850">
          <button
            id="btn-prev-month"
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span id="calendar-active-month" className="text-sm font-semibold px-2 text-zinc-800 dark:text-zinc-200 min-w-28 text-center select-none capitalize">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            id="btn-next-month"
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid del calendario */}
      <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-inner-sm">
        {/* Cabecera de días de la semana */}
        <div className="grid grid-cols-7 bg-zinc-50/50 dark:bg-zinc-950/40 border-b border-zinc-150 dark:border-zinc-850 text-center py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 select-none">
          {weekdayNames.map((name) => (
            <div key={name}>{name}</div>
          ))}
        </div>

        {/* Celdas de los días */}
        <div className="grid grid-cols-7 divide-x divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
          {dayCells.map((dayNum, idx) => {
            if (dayNum === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-16 sm:min-h-20 bg-zinc-50/30 dark:bg-zinc-950/10 border-zinc-100 dark:border-zinc-800"
                />
              );
            }

            const isToday =
              new Date().getDate() === dayNum &&
              new Date().getMonth() === currentMonth &&
              new Date().getFullYear() === currentYear;

            const formattedMonth = String(currentMonth + 1).padStart(2, '0');
            const formattedDay = String(dayNum).padStart(2, '0');
            const targetDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
            const isSelected = selectedDateStr === targetDateStr;

            const cellTasks = getTasksForDate(dayNum);
            const pendingTasks = cellTasks.filter((t) => !t.completed);

            return (
              <div
                key={`day-${dayNum}`}
                id={`calendar-day-cell-${dayNum}`}
                onClick={() => handleDayClick(dayNum)}
                className={`min-h-16 sm:min-h-20 p-1.5 focus:outline-none transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
                  isSelected
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/30'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-850/50'
                }`}
              >
                {/* Indicador Numérico */}
                <div className="flex justify-between items-center select-none">
                  <span
                    id={`calendar-day-num-${dayNum}`}
                    className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isSelected
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-950/50'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  
                  {pendingTasks.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse sm:hidden" />
                  )}
                </div>

                {/* Vista para Tablet/Desktop: Puntos de color para tareas */}
                <div className="hidden sm:block">
                  {renderDots(dayNum)}
                </div>
                {/* Pequeña burbuja con contador para vista móvil */}
                {cellTasks.length > 0 && (
                  <div className="sm:hidden flex justify-center mt-1">
                    <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1 rounded-md font-bold scale-90">
                      {cellTasks.length}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pane de tareas del día seleccionado */}
      {selectedDateStr && (
        <div id="calendar-day-details" className="mt-5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-150 dark:border-zinc-850 animate-fadeIn">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-200 dark:border-zinc-850 pb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Asignaciones para el {formatPrettyDate(selectedDateStr)}
            </span>
            <button
              onClick={() => setSelectedDateStr(null)}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-medium transition-colors cursor-pointer"
            >
              Cerrar detalles
            </button>
          </div>

          {selectedTasks.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 italic py-2 text-center">
              Sin entregas o exámenes programados para esta fecha. ¡Tarde libre! 🎉
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {selectedTasks.map((task) => {
                const sub = subjects.find((s) => s.id === task.subjectId);
                const pal = getColorPalette(sub?.color || 'indigo');
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {/* Checkbox circular miniatura */}
                      <button
                        onClick={() => onToggleComplete(task.id)}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 cursor-pointer ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 bg-zinc-50 dark:bg-zinc-950'
                        }`}
                      >
                        {task.completed && <CheckCircle className="w-3.5 h-3.5" />}
                      </button>

                      <div className="truncate">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mr-2 ${pal.badge}`}>
                          {sub?.name || 'Materia'}
                        </span>
                        <span className={`text-sm font-medium text-zinc-800 dark:text-zinc-200 ${
                          task.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
                        }`}>
                          {task.title}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400 shrink-0 font-medium capitalize ml-2">
                      {task.priority === 'alta' ? '⚠️ Alta' : task.priority === 'media' ? '⚡ Media' : '✓ Baja'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
