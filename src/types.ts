export type Priority = 'baja' | 'media' | 'alta';

export interface Subject {
  id: string;
  name: string;
  color: string; // Tailind class name suffix (e.g. 'emerald', 'sky', 'rose') or Hex
  icon?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  subjectId: string;
  priority: Priority;
  completed: boolean;
  completionDate?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  taskId?: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
}

export interface TaskFilters {
  search: string;
  subjectId: string;
  priority: Priority | 'todas';
  status: 'todas' | 'pendientes' | 'completadas';
  sortBy: 'fechaAsc' | 'fechaDesc' | 'prioridad';
}
