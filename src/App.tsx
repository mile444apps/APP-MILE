import {useState, useEffect, useMemo} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {
  BookOpen,
  Plus,
  Search,
  Sparkles,
  Filter,
  Calendar,
  TrendingUp,
  X,
  FileText,
  SlidersHorizontal,
  GraduationCap,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';

import {Task, Subject, AppNotification, TaskFilters, Priority} from './types';
import {getTodayDateString, getDaysDifference} from './lib/dates';

// Components
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import SubjectManager from './components/SubjectManager';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import NotificationCenter from './components/NotificationCenter';

// Default initial subjects
const DEFAULT_SUBJECTS: Subject[] = [
  {id: 'sub-mat', name: 'Matemáticas', color: 'emerald'},
  {id: 'sub-cie', name: 'Ciencias Naturales', color: 'indigo'},
  {id: 'sub-his', name: 'Historia Universal', color: 'amber'},
  {id: 'sub-lit', name: 'Literatura & Español', color: 'rose'},
  {id: 'sub-idi', name: 'Idiomas Extranjeros', color: 'cyan'},
];

// Default initial tasks
const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Resolver ejercicios de Geometría Analítica',
    description: 'Completar los problemas de la página 124 a la 128 sobre circunferencias. Presentar en hojas numeradas.',
    dueDate: (() => {
      // Set to today
      const d = new Date();
      return d.toISOString().split('T')[0];
    })(),
    subjectId: 'sub-mat',
    priority: 'alta',
    completed: false,
  },
  {
    id: 'task-2',
    title: 'Investigación histórica del Imperio Romano',
    description: 'Redactar un ensayo corto (máximo 2 páginas) sobre las causas de la caída del Imperio Romano de Occidente.',
    dueDate: (() => {
      // Set to tomorrow
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    })(),
    subjectId: 'sub-his',
    priority: 'media',
    completed: false,
  },
  {
    id: 'task-3',
    title: 'Lectura de Bodas de Sangre',
    description: 'Terminar la lectura obligatoria del segundo acto de la obra de Federico García Lorca.',
    dueDate: (() => {
      // Set to 3 days from now
      const d = new Date();
      d.setDate(d.getDate() + 3);
      return d.toISOString().split('T')[0];
    })(),
    subjectId: 'sub-lit',
    priority: 'baja',
    completed: true,
    completionDate: (() => {
      const d = new Date();
      d.setHours(d.getHours() - 10);
      return d.toISOString();
    })(),
  },
];

export default function App() {
  // System state
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('school_subjects');
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('school_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Navigation tab states: 'dashboard' | 'calendar' | 'stats' | 'subjects'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'stats' | 'subjects'>('dashboard');

  // Dark mode setting
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('school_theme');
    return saved === 'dark';
  });

  // Editor states
  const [editorTask, setEditorTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter/sorting state
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    subjectId: 'todas',
    priority: 'todas',
    status: 'pendientes', // Default to active tasks
    sortBy: 'fechaAsc',
  });

  // Sync to database/localStorage
  useEffect(() => {
    localStorage.setItem('school_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('school_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('school_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle automatic generation of alarms/reminders
  const generateOverdueNotifications = () => {
    const todayStr = getTodayDateString();
    const newNotifs: AppNotification[] = [];

    tasks.forEach((task) => {
      if (task.completed) return;

      const diff = getDaysDifference(task.dueDate, todayStr);
      const sub = subjects.find((s) => s.id === task.subjectId);

      // Check if task expires in <= 1 day (today or tomorrow) and generate notification
      if (diff <= 1) {
        const notifId = `notif-${task.id}-${diff < 0 ? 'overdue' : 'imminent'}`;
        
        // Avoid duplicate active notifications
        if (notifications.some((n) => n.id === notifId)) return;

        let title = '';
        let message = '';
        let type: 'warning' | 'alert' | 'info' = 'info';

        if (diff < 0) {
          title = '⚠️ Tarea Atrasada';
          message = `La asignación "${task.title}" de ${sub?.name || 'Materia'} superó su fecha de entrega (${task.dueDate}).`;
          type = 'warning';
        } else if (diff === 0) {
          title = '⏰ Vence Hoy';
          message = `¡Urgente! Hoy es el último día para entregar "${task.title}" de ${sub?.name || 'Materia'}.`;
          type = 'warning';
        } else if (diff === 1) {
          title = '🔔 Entrega Mañana';
          message = `Recuerda realizar "${task.title}" para tu clase de ${sub?.name || 'Materia'}.`;
          type = 'alert';
        }

        newNotifs.push({
          id: notifId,
          title,
          message,
          taskId: task.id,
          type,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    });

    if (newNotifs.length > 0) {
      setNotifications((prev) => {
        // Filter out duplicates and merge
        const filteredPrev = prev.filter((p) => !newNotifs.some((n) => n.id === p.id));
        return [...newNotifs, ...filteredPrev];
      });
    }
  };

  // Add and Delete Subjects
  const handleAddSubject = (name: string, color: string) => {
    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name,
      color,
    };
    setSubjects((prev) => [...prev, newSub]);
  };

  const handleDeleteSubject = (id: string) => {
    // Only delete if subjects length is > 1 to avoid blank states
    if (subjects.length <= 1) return;
    
    // Check if there are assignments linked to it
    const linkedTasks = tasks.filter((t) => t.subjectId === id);
    if (linkedTasks.length > 0) {
      const confirmDelete = window.confirm(
        `Al eliminar esta materia, también se borrarán las ${linkedTasks.length} tareas asociadas a ella. ¿Estás seguro/a?`
      );
      if (!confirmDelete) return;
      
      // Delete child tasks as well
      setTasks((prev) => prev.filter((t) => t.subjectId !== id));
    }
    
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // Save Tasks (Add or Update)
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed' | 'completionDate'> & { id?: string }) => {
    if (taskData.id) {
      // Update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskData.id
            ? {
                ...t,
                title: taskData.title,
                description: taskData.description,
                dueDate: taskData.dueDate,
                subjectId: taskData.subjectId,
                priority: taskData.priority,
              }
            : t
        )
      );
      setEditorTask(null);
    } else {
      // Add
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        completed: false,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setIsFormOpen(false);
  };

  // Toggle Task Completion
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const completedState = !t.completed;
          return {
            ...t,
            completed: completedState,
            completionDate: completedState ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  // Edit Initiator
  const handleEditInit = (task: Task) => {
    setEditorTask(task);
    setIsFormOpen(true);
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Clear Editor
  const handleCancelEdit = () => {
    setEditorTask(null);
    setIsFormOpen(false);
  };

  // Mark specific notification read
  const handleMarkNotifRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? {...n, read: true} : n))
    );
  };

  // Clear notifications
  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Filtering Logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Text search match
        const matchesSearch =
          task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          task.description.toLowerCase().includes(filters.search.toLowerCase());

        // Subject match
        const matchesSubject =
          filters.subjectId === 'todas' || task.subjectId === filters.subjectId;

        // Priority match
        const matchesPriority =
          filters.priority === 'todas' || task.priority === filters.priority;

        // Status match
        const matchesStatus =
          filters.status === 'todas' ||
          (filters.status === 'completadas' && task.completed) ||
          (filters.status === 'pendientes' && !task.completed);

        return matchesSearch && matchesSubject && matchesPriority && matchesStatus;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'fechaAsc') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (filters.sortBy === 'fechaDesc') {
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        } else if (filters.sortBy === 'prioridad') {
          const weight = {alta: 3, media: 2, baja: 1};
          return weight[b.priority] - weight[a.priority];
        }
        return 0;
      });
  }, [tasks, filters]);

  // Tasks remaining indicators
  const tasksPendingTodayCount = useMemo(() => {
    const today = getTodayDateString();
    return tasks.filter((t) => t.dueDate === today && !t.completed).length;
  }, [tasks]);

  const taskCountsBySubject = useMemo(() => {
    const m: Record<string, number> = {};
    tasks.forEach((t) => {
      m[t.subjectId] = (m[t.subjectId] || 0) + 1;
    });
    return m;
  }, [tasks]);

  return (
    <div id="school-planner-app" className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-200 selection:bg-indigo-500 selection:text-white">
      {/* Barra de Navegación Superior */}
      <header className="sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-850 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none font-bold text-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 id="brand-header-title" className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
                Agenda Escolar
              </h1>
              {/* User Email Indicator */}
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                Estudiante: <span className="text-zinc-700 dark:text-zinc-300 font-semibold">mileherriquez@gmail.com</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2" id="header-right-actions">
            {/* Notification Center */}
            <NotificationCenter
              tasks={tasks}
              subjects={subjects}
              notifications={notifications}
              onMarkAsRead={handleMarkNotifRead}
              onClearAll={handleClearAllNotifications}
              onGenerateOverdueNotifications={generateOverdueNotifications}
            />

            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              title="Alternar tema"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Quick Add Button */}
            <button
              id="header-quick-add-btn"
              onClick={() => {
                setEditorTask(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 sm:px-4 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Nueva Tarea</span>
            </button>
          </div>
        </div>
      </header>

      {/* Banner de Bienvenida / Alertas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div id="greeting-banner" className="bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-950/20 dark:to-zinc-900 border border-indigo-100/60 dark:border-indigo-950 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              ¡Hola de nuevo! <Sparkles className="w-5 h-5 text-amber-550 shrink-0" />
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Mantener organizadas tus actividades te ayudará a obtener mejores calificaciones.
            </p>
          </div>

          <div className="flex gap-4 items-center shrink-0">
            <div className="text-center px-4 py-2 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Pendientes Hoy
              </span>
              <strong id="banner-today-count" className="text-xl sm:text-2xl font-black text-rose-650 dark:text-rose-400">
                {tasksPendingTodayCount}
              </strong>
            </div>

            <div className="text-center px-4 py-2 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Asignadas Total
              </span>
              <strong id="banner-total-count" className="text-xl sm:text-2xl font-black text-indigo-650 dark:text-indigo-400">
                {tasks.filter((t) => !t.completed).length}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
        <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-px mb-6 overflow-x-auto scrollbar-none" id="tabs-navigation">
          <button
            id="tab-btn-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Tareas y Filtros
          </button>

          <button
            id="tab-btn-calendar"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'calendar'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendario Escolar
          </button>

          <button
            id="tab-btn-stats"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'stats'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Rendimiento y Rachas
          </button>

          <button
            id="tab-btn-subjects"
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'subjects'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Mis Materias ({subjects.length})
          </button>
        </div>

        {/* Sección de Paneles */}
        <div id="active-panel-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeTab === 'dashboard' && (
            <>
              {/* Barra de filtros izquierda */}
              <div id="filters-left-panel" className="lg:col-span-1 space-y-6">
                {/* Panel de Control de Filtros */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <Filter className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    <h3 className="font-bold text-sm text-zinc-850 dark:text-zinc-100 uppercase tracking-wide">
                      Buscador e Incentivos
                    </h3>
                  </div>

                  {/* Campo de búsqueda */}
                  <div className="space-y-1.5">
                    <label htmlFor="search-input" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Buscar en título o notas
                    </label>
                    <div className="relative">
                      <input
                        id="search-input"
                        type="search"
                        className="w-full text-xs pl-8 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-400"
                        placeholder="Ej. examen, Álgebra, informe..."
                        value={filters.search}
                        onChange={(e) => setFilters((f) => ({...f, search: e.target.value}))}
                      />
                      <Search className="absolute left-2.5 top-3 w-4.5 h-4.5 text-zinc-400" />
                    </div>
                  </div>

                  {/* Filtrar por Materia */}
                  <div className="space-y-1.5">
                    <label htmlFor="filter-subject" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Materias
                    </label>
                    <select
                      id="filter-subject"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      value={filters.subjectId}
                      onChange={(e) => setFilters((f) => ({...f, subjectId: e.target.value}))}
                    >
                      <option value="todas">Todas las materias</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtrar por prioridad */}
                  <div className="space-y-1.5">
                    <label htmlFor="filter-priority" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Nivel de Prioridad
                    </label>
                    <select
                      id="filter-priority"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      value={filters.priority}
                      onChange={(e) => setFilters((f) => ({...f, priority: e.target.value as Priority | 'todas'}))}
                    >
                      <option value="todas">Todas las prioridades</option>
                      <option value="alta">⚠️ Prioridad Alta</option>
                      <option value="media">⚡ Prioridad Media</option>
                      <option value="baja">✓ Prioridad Baja</option>
                    </select>
                  </div>

                  {/* Filtrar por Estado */}
                  <div className="space-y-1.2">
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                      Estado de la Actividad
                    </label>
                    <div className="grid grid-cols-3 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden" id="status-toggle-filter">
                      {(['todas', 'pendientes', 'completadas'] as const).map((statusKey) => (
                        <button
                          key={statusKey}
                          onClick={() => setFilters((f) => ({...f, status: statusKey}))}
                          id={`filter-status-btn-${statusKey}`}
                          className={`py-1.5 text-[11px] font-semibold text-center transition-all border-r dark:border-zinc-800 last:border-r-0 cursor-pointer capitalize ${
                            filters.status === statusKey
                              ? 'bg-indigo-600 text-white'
                              : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50'
                          }`}
                        >
                          {statusKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clasificación / Orden */}
                  <div className="space-y-1.5">
                    <label htmlFor="filter-sort" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Ordenar por
                    </label>
                    <select
                      id="filter-sort"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      value={filters.sortBy}
                      onChange={(e) => setFilters((f) => ({...f, sortBy: e.target.value as any}))}
                    >
                      <option value="fechaAsc">📅 Entrega próxima primero</option>
                      <option value="fechaDesc">📅 Entrega lejana primero</option>
                      <option value="prioridad">⚠️ Mayor prioridad primero</option>
                    </select>
                  </div>
                </div>

                {/* Subject miniature helper card */}
                <div className="hidden lg:block">
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/40 text-xs text-indigo-755 dark:text-indigo-300">
                    <p className="font-semibold mb-1">💡 Consejos de Estudio</p>
                    <p className="leading-relaxed">
                      Ordena por "Fecha próxima primero" para ver de inmediato los trabajos que vencen hoy o mañana, evitando retrasos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de tareas derecha */}
              <div id="tasks-list-panel" className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 id="tasks-results-count" className="text-sm font-semibold text-zinc-505 dark:text-zinc-400">
                      Lista de Trabajos ({filteredTasks.length})
                    </h3>
                  </div>

                  {/* Reset Filters Option if filters are active */}
                  {(filters.search || filters.subjectId !== 'todas' || filters.priority !== 'todas' || filters.status !== 'todas') && (
                    <button
                      id="reset-filters-btn"
                      onClick={() =>
                        setFilters({
                          search: '',
                          subjectId: 'todas',
                          priority: 'todas',
                          status: 'todas',
                          sortBy: 'fechaAsc',
                        })
                      }
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Restaurar filtros
                    </button>
                  )}
                </div>

                {/* List output */}
                <div id="task-cards-output" className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.length === 0 ? (
                      <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        id="empty-tasks-alert"
                        className="text-center py-12 px-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3 bg-white dark:bg-zinc-900/20"
                      >
                        <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-750 mx-auto" />
                        <h4 className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">
                          {filters.status === 'completadas'
                            ? 'No tienes tareas marcadas como completadas todavía.'
                            : 'No se encontraron tareas.'}
                        </h4>
                        <p className="text-xs text-zinc-400 text-balance leading-normal max-w-sm mx-auto">
                          Empieza hoy mismo agregando tus tareas escolares desde el botón superior o regístralas de forma simple.
                        </p>
                        <button
                          id="btn-create-one"
                          onClick={() => {
                            setEditorTask(null);
                            setIsFormOpen(true);
                          }}
                          className="mt-2 text-xs py-2 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300 font-bold border border-indigo-200/50 dark:border-indigo-900/50 transition-all cursor-pointer"
                        >
                          Crear mi primera tarea
                        </button>
                      </motion.div>
                    ) : (
                      filteredTasks.map((task) => {
                        const sub = subjects.find((s) => s.id === task.subjectId);
                        return (
                          <TaskCard
                            key={task.id}
                            task={task}
                            subject={sub}
                            onToggleComplete={handleToggleComplete}
                            onEditTask={handleEditInit}
                            onDeleteTask={handleDeleteTask}
                          />
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}

          {activeTab === 'calendar' && (
            <div className="lg:col-span-3">
              <CalendarView
                tasks={tasks}
                subjects={subjects}
                onToggleComplete={handleToggleComplete}
              />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="lg:col-span-3">
              <StatsView tasks={tasks} subjects={subjects} />
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="lg:col-span-3 max-w-2xl mx-auto w-full">
              <SubjectManager
                subjects={subjects}
                onAddSubject={handleAddSubject}
                onDeleteSubject={handleDeleteSubject}
                taskCountsBySubject={taskCountsBySubject}
              />
            </div>
          )}
        </div>
      </main>

      {/* Modal / Diálogo Flotante del Formulario de Tareas */}
      <AnimatePresence>
        {isFormOpen && (
          <div id="modal-backdrop-layer" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop obscuro */}
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              onClick={handleCancelEdit}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs"
            />

            {/* Contenedor del Formulario flotante */}
            <motion.div
              initial={{scale: 0.95, opacity: 0, y: 15}}
              animate={{scale: 1, opacity: 1, y: 0}}
              exit={{scale: 0.95, opacity: 0, y: 15}}
              transition={{type: 'spring', damping: 25, stiffness: 350}}
              className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl"
            >
              <TaskForm
                subjects={subjects}
                onSaveTask={handleSaveTask}
                editorTask={editorTask}
                onCancelEdit={handleCancelEdit}
                onCloseModal={handleCancelEdit}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer footer-caption */}
      <footer className="border-t border-zinc-200 dark:border-zinc-850 mt-16 bg-white dark:bg-zinc-900/50 py-6 text-center text-xs text-zinc-400">
        <p className="font-sans">
          Organizador de Tareas Escolares © {new Date().getFullYear()} • Clasificación, Prioridades y Recordatorios personalizados.
        </p>
      </footer>
    </div>
  );
}
