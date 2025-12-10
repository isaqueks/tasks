import { useEffect, useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { tasksService } from '../services/tasks.service';
import type { WeeklyViewData, Task } from '../services/tasks.service';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export const Dashboard = () => {
  const [data, setData] = useState<WeeklyViewData | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const loadWeeklyData = async (weekStart: Date) => {
    setLoading(true);
    try {
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const result = await tasksService.getWeekly(weekStartStr);
      setData(result);
    } catch (error) {
      console.error('Erro ao carregar dados semanais:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    loadWeeklyData(weekStart);
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
      await loadWeeklyData(weekStart);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
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

  if (loading) {
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Semana Anterior
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hoje
          </button>
          <button
            onClick={handleNextWeek}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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
                {DAYS.map((day, index) => (
                  <th
                    key={day}
                    className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]"
                  >
                    {DAY_LABELS[index]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.data.map((row) => (
                <tr key={row.company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white">
                    {row.company.name}
                  </td>
                  {DAYS.map((day) => (
                    <td key={day} className="px-4 py-4 align-top">
                      <div className="space-y-2">
                        {row.tasks[day].map((task) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-lg border-l-4 ${getPriorityColor(task.priority)} ${
                              task.completed ? 'opacity-60' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTaskComplete(task)}
                                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <div className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {task.completed ? '✓' : '➤'} {task.name}
                                </div>
                                {task.description && (
                                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {task.description}
                                  </div>
                                )}
                              </div>
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

