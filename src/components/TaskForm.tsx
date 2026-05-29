import React, {useState, useEffect} from 'react';
import {CheckCircle2, X, Calendar, AlertTriangle, Book, FileText, Sparkles} from 'lucide-react';
import {Task, Subject, Priority} from '../types';

interface TaskFormProps {
  subjects: Subject[];
  onSaveTask: (task: Omit<Task, 'id' | 'completed' | 'completionDate'> & { id?: string }) => void;
  editorTask?: Task | null;
  onCancelEdit?: () => void;
  onCloseModal?: () => void;
}

export default function TaskForm({
  subjects,
  onSaveTask,
  editorTask,
  onCancelEdit,
  onCloseModal,
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [error, setError] = useState('');

  // Setup values when editing an existing task
  useEffect(() => {
    if (editorTask) {
      setTitle(editorTask.title);
      setDescription(editorTask.description);
      setDueDate(editorTask.dueDate);
      setSubjectId(editorTask.subjectId);
      setPriority(editorTask.priority);
    } else {
      resetForm();
    }
  }, [editorTask, subjects]);

  // Handle setting initial subject if none is selected
  useEffect(() => {
    if (!subjectId && subjects.length > 0 && !editorTask) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects, subjectId, editorTask]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setSubjectId(subjects[0]?.id || '');
    setPriority('media');
    setError('');
  };

  const handleQuickDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    setDueDate(`${year}-${month}-${day}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Por favor introduce un título para la tarea.');
      return;
    }
    if (!dueDate) {
      setError('Por favor selecciona una fecha límite/entrega.');
      return;
    }
    if (!subjectId) {
      setError('Por favor selecciona una materia.');
      return;
    }

    onSaveTask({
      id: editorTask?.id,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      subjectId,
      priority,
    });

    resetForm();
    if (onCloseModal) onCloseModal();
  };

  return (
    <div id="task-form-wrapper" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 id="form-container-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {editorTask ? 'Editar Tarea Escolar' : 'Añadir Nueva Tarea'}
          </h2>
        </div>
        {onCloseModal && (
          <button
            onClick={onCloseModal}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            id="close-form-btn"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} id="actual-task-form" className="space-y-4">
        {/* Materia & Alerta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="form-subject" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Materia / Asignatura
            </label>
            <div className="relative">
              <select
                id="form-subject"
                className="w-full text-sm pl-9 pr-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              <Book className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Nivel de Prioridad
            </label>
            <div className="grid grid-cols-3 gap-2" id="priority-options">
              {(['baja', 'media', 'alta'] as Priority[]).map((level) => {
                const colors =
                  level === 'baja'
                    ? 'border-blue-200 text-blue-700 bg-blue-50/50 dark:border-blue-950 dark:text-blue-400 dark:bg-blue-950/20'
                    : level === 'media'
                    ? 'border-amber-200 text-amber-700 bg-amber-50/50 dark:border-amber-950 dark:text-amber-400 dark:bg-amber-950/20'
                    : 'border-rose-200 text-rose-700 bg-rose-50/50 dark:border-rose-950 dark:text-rose-400 dark:bg-rose-950/20';

                const selectedColors =
                  level === 'baja'
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-100 dark:bg-blue-950/55 text-blue-800 dark:text-blue-300'
                    : level === 'media'
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-100 dark:bg-amber-950/55 text-amber-800 dark:text-amber-300'
                    : 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-100 dark:bg-rose-950/55 text-rose-800 dark:text-rose-300';

                const isSelected = priority === level;

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPriority(level)}
                    id={`priority-btn-${level}`}
                    className={`py-2 px-1 text-center font-medium capitalize text-xs rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected ? selectedColors : `${colors} hover:bg-zinc-100 dark:hover:bg-zinc-800/50`
                    }`}
                  >
                    {level === 'alta' ? '⚠️ Alta' : level === 'media' ? '⚡ Media' : '✓ Baja'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Título de la Tarea/Actividad */}
        <div>
          <label htmlFor="form-title" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
            Título de la Tarea
          </label>
          <div className="relative">
            <input
              id="form-title"
              type="text"
              className="w-full text-sm pl-9 pr-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-400"
              placeholder="Ej. Resolver guía de ecuaciones, Leer capítulo 3..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <FileText className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Descripción / Instrucciones */}
        <div>
          <label htmlFor="form-description" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
            Detalles / Notas Adicionales
          </label>
          <textarea
            id="form-description"
            rows={3}
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-400 resize-none"
            placeholder="Anota páginas de libros, instrucciones del profesor o integrantes de equipo..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Fecha Límite de Entrega */}
        <div>
          <label htmlFor="form-due-date" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider font-sans">
            Fecha Límite (Entrega)
          </label>
          <div className="relative mb-2">
            <input
              id="form-due-date"
              type="date"
              className="w-full text-sm pl-9 pr-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
          
          {/* Quick presets for due dates */}
          <div className="flex flex-wrap gap-1.5" id="form-quick-dates">
            <button
              id="quick-date-today"
              type="button"
              onClick={() => handleQuickDate(0)}
              className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Hoy
            </button>
            <button
              id="quick-date-tomorrow"
              type="button"
              onClick={() => handleQuickDate(1)}
              className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Mañana
            </button>
            <button
              id="quick-date-3days"
              type="button"
              onClick={() => handleQuickDate(3)}
              className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              En 3 días
            </button>
            <button
              id="quick-date-week"
              type="button"
              onClick={() => handleQuickDate(7)}
              className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Siguiente semana
            </button>
          </div>
        </div>

        {error && (
          <div id="form-error-msg" className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3 pt-2" id="form-actions">
          {editorTask && onCancelEdit && (
            <button
              id="btn-cancel-edit"
              type="button"
              onClick={onCancelEdit}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-all"
            >
              Cancelar
            </button>
          )}
          <button
            id="btn-submit-task"
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm shadow-indigo-200 dark:shadow-none"
          >
            <CheckCircle2 className="w-4 h-4" />
            {editorTask ? 'Guardar Cambios' : 'Añadir Tarea'}
          </button>
        </div>
      </form>
    </div>
  );
}
