import React, {useState} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {
  Check,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {Task, Subject} from '../types';
import {getColorPalette} from '../lib/colors';
import {formatRelativeDays, formatPrettyDate} from '../lib/dates';

interface TaskCardProps {
  key?: string;
  task: Task;
  subject: Subject | undefined;
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskCard({
  task,
  subject,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorPal = getColorPalette(subject?.color || 'indigo');
  const relativeDate = formatRelativeDays(task.dueDate);

  // Priority layout styles
  const priorityInfo = {
    alta: {
      label: 'Prioridad Alta',
      badge: 'bg-rose-50 border-rose-100 dark:border-rose-950 text-rose-700 dark:bg-rose-950/25 dark:text-rose-400',
      dot: 'bg-rose-500',
    },
    media: {
      label: 'Prioridad Media',
      badge: 'bg-amber-50 border-amber-100 dark:border-amber-950 text-amber-700 dark:bg-amber-950/25 dark:text-amber-400',
      dot: 'bg-amber-500',
    },
    baja: {
      label: 'Prioridad Baja',
      badge: 'bg-blue-50 border-blue-100 dark:border-blue-950 text-blue-700 dark:bg-blue-950/25 dark:text-blue-400',
      dot: 'bg-blue-500',
    },
  }[task.priority];

  return (
    <motion.div
      id={`task-card-${task.id}`}
      layout
      initial={{opacity: 0, y: 15}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, scale: 0.95}}
      transition={{duration: 0.25}}
      className={`group border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-zinc-900 ${
        task.completed
          ? 'border-zinc-200 dark:border-zinc-800 opacity-75'
          : relativeDate.isLate
          ? 'border-rose-200 dark:border-rose-950Bg ring-1 ring-rose-500/10'
          : 'border-zinc-150 dark:border-zinc-800'
      }`}
    >
      <div className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
        {/* Checkbox circular interactivo */}
        <button
          id={`task-check-btn-${task.id}`}
          onClick={() => onToggleComplete(task.id)}
          className={`shrink-0 w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full border-2 flex items-center justify-center transition-all duration-250 cursor-pointer ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white scale-105'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 bg-zinc-50 dark:bg-zinc-950 hover:bg-indigo-50/25 dark:hover:bg-indigo-950/15'
          }`}
          title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
        >
          {task.completed && (
            <motion.div
              initial={{scale: 0, rotate: -45}}
              animate={{scale: 1, rotate: 0}}
              transition={{type: 'spring', damping: 12}}
            >
              <Check className="w-4 h-4 stroke-[3px]" />
            </motion.div>
          )}
        </button>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 cursor-pointer">
            {/* Materia Badge */}
            <span
              id={`task-subject-badge-${task.id}`}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${colorPal.badge}`}
            >
              {subject?.name || 'Materia general'}
            </span>

            {/* Prioridad Badge */}
            <span
              id={`task-priority-badge-${task.id}`}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${priorityInfo.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`} />
              {priorityInfo.label}
            </span>
          </div>

          <h3
            id={`task-title-${task.id}`}
            className={`text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-100 leading-tight truncate cursor-pointer ${
              task.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
            }`}
          >
            {task.title}
          </h3>

          {/* Fila inferior de meta-datos */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-zinc-500 dark:text-zinc-400">
            {/* Fecha de entrega */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] ${
              task.completed 
                ? 'bg-zinc-50 dark:bg-zinc-800/30 text-zinc-400 border-zinc-100 dark:border-zinc-800' 
                : relativeDate.color
            }`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{task.completed ? `Entregada: ${formatPrettyDate(task.dueDate)}` : relativeDate.text}</span>
            </div>

            {/* Indicador de descripción */}
            {task.description && (
              <span className="flex items-center gap-1 text-[11px] hover:text-indigo-600 transition-colors cursor-pointer">
                Ver detalles
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </span>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div id="card-actions" className="flex items-center gap-1.5 shrink-0 self-center">
          <button
            id={`btn-edit-task-${task.id}`}
            disabled={task.completed}
            onClick={(e) => {
              e.stopPropagation();
              onEditTask(task);
            }}
            className={`p-2 rounded-xl text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-850 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all ${
              task.completed ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title="Editar Tarea"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          <button
            id={`btn-delete-task-${task.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
            className="p-2 rounded-xl text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-850 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
            title="Borrar Tarea"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Panel Expandido de Detalles */}
      <AnimatePresence initial={false}>
        {isExpanded && task.description && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: 'auto', opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.25}}
          >
            <div id={`task-expanded-${task.id}`} className="px-5 pb-5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/15">
              <h4 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Instrucciones / Detalles:
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-350 leading-relaxed whitespace-pre-wrap break-words">
                {task.description}
              </p>

              {task.completed && task.completionDate && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  Completada el {new Date(task.completionDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
