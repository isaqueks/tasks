import { useEffect, useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { tasksService } from '../services/tasks.service';
import type { WeeklyViewData, Task } from '../services/tasks.service';
import { LoadingBar } from '../components/LoadingBar';
import { EyeIcon } from '../components/Icons';
import { Link } from 'react-router-dom';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export const Dashboard = () => {
  const [data, setData] = useState<WeeklyViewData | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  const loadWeeklyData = async (weekStart: Date, isInitial = false) => {
    if (isInitial) {
      setInitialLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const result = await tasksService.getWeekly(weekStartStr);
      setData(result);
    } catch (error) {
      console.error('Erro ao carregar dados semanais:', error);
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    loadWeeklyData(weekStart, true);
  }, []);

  useEffect(() => {
    if (!initialLoading && data) {
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      loadWeeklyData(weekStart, false);
    }
  }, [currentWeek]);

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  const toggleTaskComplete = async (task: Task) => {
    try {
      await tasksService.update(task.id, { completed: !task.completed });
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      await loadWeeklyData(weekStart, false);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedTask(null);
    setDragOverDay(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, day: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedTask) {
      setDragOverDay(day);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent, targetDay: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedTask || !dragOverDay) return;

    // Usar dragOverDay que está sendo atualizado corretamente pelo handleDragEnter
    const day = dragOverDay;

    const dayIndex = DAYS.indexOf(day as typeof DAYS[number]);
    
    if (dayIndex === -1) {
      setDraggedTask(null);
      setDragOverDay(null);
      return;
    }

    // Calcular a data baseada na semana atual exibida
    // Usar o data que está sendo exibida no cabeçalho (weekStart + dayIndex)
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const targetDate = addDays(weekStart, dayIndex);
    
    // Formatar usando componentes da data local para evitar problemas de timezone
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(targetDate.getDate()).padStart(2, '0');
    const targetDateStr = `${year}-${month}-${dayOfMonth}`;

    try {
      await tasksService.update(draggedTask.id, { date: targetDateStr });
      await loadWeeklyData(weekStart, false);
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
    } finally {
      setDraggedTask(null);
      setDragOverDay(null);
    }
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'border-l-red-500 bg-red-50';
      case 'MEDIUM':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'LOW':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  return (
    <div>
      <LoadingBar isLoading={isRefreshing} />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visão Semanal</h1>
          <p className="text-sm text-gray-500 mt-1">
            {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePreviousWeek}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            ← Semana Anterior
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            Hoje
          </button>
          <button
            onClick={handleNextWeek}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            Próxima Semana →
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">
                  Empresa
                </th>
                {DAYS.map((day, index) => {
                  const dayDate = addDays(weekStart, index);
                  return (
                    <th
                      key={day}
                      className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]"
                    >
                      <div>{DAY_LABELS[index]}</div>
                      <div className="text-gray-400 font-normal">{format(dayDate, 'd/MM')}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.data.map((row) => (
                <tr key={row.company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white">
                    {row.company.name}
                  </td>
                  {DAYS.map((day) => (
                    <td
                      key={day}
                      data-day={day}
                      className={`px-4 py-4 align-top transition-colors ${
                        draggedTask
                          ? dragOverDay === day
                            ? 'bg-primary-100 border-2 border-primary-500 border-dashed'
                            : 'bg-primary-50 border-2 border-primary-300 border-dashed'
                          : 'border-2 border-transparent'
                      }`}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, day)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-2">
                        {row.tasks[day].map((task) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            onDragEnd={handleDragEnd}
                            className={`p-3 rounded-lg border-l-4 ${getPriorityColor(task.priority)} ${
                              task.completed ? 'opacity-60' : ''
                            } cursor-move hover:shadow-md transition-shadow ${
                              draggedTask?.id === task.id ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTaskComplete(task)}
                                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                                onDragStart={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1 min-w-0">
                                <div className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {task.completed ? '✓' : '➤'} {task.name}
                                </div>
                              </div>
                              <Link
                                to={`/tasks/${task.id}`}
                                className="ml-2 text-gray-600 hover:text-primary-600 transition-colors cursor-pointer"
                                title="Abrir tarefa"
                                onClick={(e) => e.stopPropagation()}
                                onDragStart={(e) => e.stopPropagation()}
                              >
                                <EyeIcon size={16} />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
              {data.data.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma empresa cadastrada. Adicione empresas na página de Empresas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

