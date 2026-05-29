import React, {useState} from 'react';
import {Plus, Trash, BookOpen, AlertCircle} from 'lucide-react';
import {Subject} from '../types';
import {getColorPalette, AVAILABLE_COLORS} from '../lib/colors';

interface SubjectManagerProps {
  subjects: Subject[];
  onAddSubject: (name: string, color: string) => void;
  onDeleteSubject: (id: string) => void;
  taskCountsBySubject: Record<string, number>;
}

export default function SubjectManager({
  subjects,
  onAddSubject,
  onDeleteSubject,
  taskCountsBySubject,
}: SubjectManagerProps) {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = newSubjectName.trim();
    if (!trimmed) {
      setError('El nombre de la materia no puede estar vacío.');
      return;
    }

    if (subjects.some((sub) => sub.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Ya existe una materia con ese nombre.');
      return;
    }

    onAddSubject(trimmed, selectedColor);
    setNewSubjectName('');
    setError('');
  };

  return (
    <div id="subject-manager-card" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
          <BookOpen className="w-5 h-5" id="book-icon" />
        </div>
        <h2 id="subject-manager-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Gestionar Materias
        </h2>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
        Clasifica tus asignaciones escolares por materias para tener un mejor control.
      </p>

      {/* Formulario */}
      <form onSubmit={handleSubmit} id="subject-form" className="space-y-4 mb-6">
        <div>
          <label htmlFor="new-subject" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
            Nueva Materia
          </label>
          <input
            id="new-subject"
            type="text"
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-400"
            placeholder="Ej. Física Moderna, Geografía..."
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
          />
        </div>

        {/* Selector de color */}
        <div>
          <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
            Color Temático
          </label>
          <div className="flex flex-wrap gap-2" id="color-selectors">
            {AVAILABLE_COLORS.map((colorKey) => {
              const pal = getColorPalette(colorKey);
              const isSelected = selectedColor === colorKey;
              return (
                <button
                  key={colorKey}
                  type="button"
                  onClick={() => setSelectedColor(colorKey)}
                  className={`color-dot-btn w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900 scale-110' : 'hover:scale-105'
                  }`}
                  style={{
                    // Standard color map matches Tailwind tints
                    backgroundColor:
                      colorKey === 'emerald'
                        ? '#059669'
                        : colorKey === 'indigo'
                        ? '#4f46e5'
                        : colorKey === 'amber'
                        ? '#d97706'
                        : colorKey === 'rose'
                        ? '#e11d48'
                        : colorKey === 'cyan'
                        ? '#0891b2'
                        : colorKey === 'violet'
                        ? '#7c3aed'
                        : colorKey === 'sky'
                        ? '#0284c7'
                        : '#ea580c', // orange
                  }}
                  title={pal.name}
                  id={`color-btn-${colorKey}`}
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div id="subject-error-msg" className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs text-balance">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          id="btn-add-subject"
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Añadir Materia
        </button>
      </form>

      {/* Lista de materias creadas */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
          Materias Registradas ({subjects.length})
        </label>
        <div id="subjects-list" className="max-h-56 overflow-y-auto space-y-1.5 pr-1 py-1">
          {subjects.map((sub) => {
            const pal = getColorPalette(sub.color);
            const taskCount = taskCountsBySubject[sub.id] || 0;
            return (
              <div
                key={sub.id}
                id={`subject-item-${sub.id}`}
                className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-200 ${pal.bg} ${pal.border}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0`} style={{
                    backgroundColor:
                      sub.color === 'emerald'
                        ? '#10b981'
                        : sub.color === 'indigo'
                        ? '#6366f1'
                        : sub.color === 'amber'
                        ? '#f59e0b'
                        : sub.color === 'rose'
                        ? '#f43f5e'
                        : sub.color === 'cyan'
                        ? '#06b6d4'
                        : sub.color === 'violet'
                        ? '#8b5cf6'
                        : sub.color === 'sky'
                        ? '#0ea5e9'
                        : '#f97316'
                  }} />
                  <span className={`text-sm font-medium ${pal.text} truncate text-balance`}>
                    {sub.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-zinc-500 font-medium bg-zinc-200/50 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full">
                    {taskCount} {taskCount === 1 ? 'tarea' : 'tareas'}
                  </span>
                  
                  <button
                    id={`btn-del-subject-${sub.id}`}
                    onClick={() => onDeleteSubject(sub.id)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    title={`Eliminar ${sub.name}`}
                    disabled={subjects.length <= 1} // At least one subject should remain
                    style={{ visibility: subjects.length <= 1 ? 'hidden' : 'visible' }}
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
