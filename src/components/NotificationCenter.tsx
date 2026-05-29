import {useEffect, useState} from 'react';
import {
  Bell,
  BellOff,
  Clock,
  AlertOctagon,
  CheckCheck,
  X,
  Volume2,
} from 'lucide-react';
import {Task, Subject, AppNotification} from '../types';
import {getDaysDifference, formatPrettyDate} from '../lib/dates';

interface NotificationCenterProps {
  tasks: Task[];
  subjects: Subject[];
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onGenerateOverdueNotifications: () => void;
}

export default function NotificationCenter({
  tasks,
  subjects,
  notifications,
  onMarkAsRead,
  onClearAll,
  onGenerateOverdueNotifications,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Run automatically on mount to alert upcoming tasks
  useEffect(() => {
    onGenerateOverdueNotifications();
  }, [tasks]);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Sound effect simulator
  const handleSimulateBeep = () => {
    try {
      // Create lightweight audio context beep
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio Context is not allowed or supported prior to UI interaction.', e);
    }
  };

  return (
    <div id="notification-center-panel" className="relative">
      {/* Botón de campana */}
      <button
        id="bell-notification-btn"
        onClick={() => {
          toggleOpen();
          handleSimulateBeep();
        }}
        className={`relative p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'bg-indigo-600 border-indigo-600 text-white'
            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
        }`}
        title="Bandeja de Recordatorios"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 && !isOpen ? 'animate-bounce' : ''}`} />
        {unreadCount > 0 && (
          <span
            id="notif-badge-count"
            className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 animate-pulse"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Contenedor flotante de notificaciones */}
      {isOpen && (
        <>
          {/* Backdrop invisible to dismiss on click outside */}
          <div
            id="notif-backdrop"
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div
            id="notifications-dropdown-card"
            className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[480px] bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden flex flex-col animate-fadeIn"
          >
            {/* Header */}
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-150 dark:border-zinc-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Recordatorios y Avisos
                </span>
                {unreadCount > 0 && (
                  <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    {unreadCount} nuevos
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2" id="notif-menu-actions">
                {notifications.length > 0 && (
                  <button
                    id="btn-clear-notifications"
                    onClick={onClearAll}
                    className="text-[11px] text-rose-600 dark:text-rose-450 hover:underline font-semibold cursor-pointer"
                  >
                    Limpiar todo
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div id="notif-list-scroller" className="overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-850 max-h-[360px] p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 space-y-2">
                  <BellOff className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                  <p className="text-xs italic font-medium">Bandeja al día</p>
                  <p className="text-[11px] text-zinc-400 text-balance leading-normal">
                    La aplicación te avisará aquí de manera automática cuando se aproximen las fechas límite de entrega de tus tareas activas.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isRead = notif.read;
                  return (
                    <div
                      key={notif.id}
                      id={`notif-item-${notif.id}`}
                      className={`p-3 rounded-xl transition-all duration-200 border relative overflow-hidden ${
                        isRead
                          ? 'bg-zinc-50/40 border-zinc-100 dark:border-zinc-900 text-zinc-500 dark:text-zinc-400'
                          : notif.type === 'warning'
                          ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-100/60 dark:border-rose-900/40 text-rose-900 dark:text-rose-300'
                          : notif.type === 'alert'
                          ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-100/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-300'
                          : 'bg-blue-50/80 dark:bg-blue-950/20 border-blue-100/60 dark:border-blue-900/40 text-blue-900 dark:text-blue-300'
                      }`}
                    >
                      {/* Unread Indicator Bar */}
                      {!isRead && (
                        <span className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-500" />
                      )}

                      <div className="flex items-start justify-between gap-2 pl-1.5">
                        <div className="space-y-0.5">
                          <p className={`text-xs font-bold leading-tight ${!isRead ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            {notif.title}
                          </p>
                          <p className="text-[11px] leading-relaxed text-balance">
                            {notif.message}
                          </p>
                          
                          {/* Timer status */}
                          <div className="flex items-center gap-1.5 mt-2 text-[9px] font-medium text-zinc-400">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(notif.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        {/* Mark read button */}
                        {!isRead ? (
                          <button
                            id={`btn-mark-read-${notif.id}`}
                            onClick={() => {
                              onMarkAsRead(notif.id);
                              handleSimulateBeep();
                            }}
                            className="p-1 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-indigo-600 hover:border-indigo-100 dark:hover:bg-zinc-850 dark:hover:text-indigo-400 shrink-0 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                            title="Marcar como leído"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-400 italic shrink-0 select-none">
                            Leído
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Simulated Desktop Alert Option / Trigger */}
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-150 dark:border-zinc-850 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500 font-medium">Bocina de alerta escolar:</span>
              <button
                id="btn-simulate-alert"
                onClick={() => {
                  handleSimulateBeep();
                  alert('🔔 Alerta Escolar: Mantente al pendiente de tus fechas límite de examen.');
                }}
                className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-950 px-2 py-1 rounded-lg border border-indigo-200 dark:border-indigo-900 font-bold transition-all cursor-pointer"
              >
                Probar campana
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
