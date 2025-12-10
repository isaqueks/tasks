import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { tasksService, Priority } from '../services/tasks.service';
import type { Task, TaskFilters, CreateTaskDto } from '../services/tasks.service';
import { companiesService } from '../services/companies.service';
import type { Company } from '../services/companies.service';
import { Dialog } from '@headlessui/react';

export const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Formulário de filtros (separado)
  const { register: registerFilter, watch } = useForm<TaskFilters>();
  const filters = watch();
  
  // Formulário de criação/edição de tarefa
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<CreateTaskDto>();

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [filters.companyId, filters.priority, filters.completed, filters.date]);

  const loadCompanies = async () => {
    try {
      const data = await companiesService.getAll();
      setCompanies(data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const filterData: TaskFilters = {
        companyId: filters.companyId || undefined,
        priority: filters.priority || undefined,
        completed: filters.completed === 'true' ? true : filters.completed === 'false' ? false : undefined,
        date: filters.date || undefined,
      };
      const data = await tasksService.getAll(filterData);
      setTasks(data);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    setApiError(null);
    reset({
      name: '',
      description: '',
      priority: Priority.MEDIUM,
      companyId: '',
      date: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setApiError(null);
    reset({
      name: task.name,
      description: task.description,
      priority: task.priority,
      companyId: task.companyId,
      date: task.date ? format(new Date(task.date), 'yyyy-MM-dd') : '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: CreateTaskDto) => {
    try {
      setApiError(null);
      if (editingTask) {
        await tasksService.update(editingTask.id, data);
      } else {
        await tasksService.create(data);
      }
      setIsModalOpen(false);
      reset();
      loadTasks();
    } catch (error: any) {
      const message = error.response?.data?.message;
      setApiError(Array.isArray(message) ? message.join(', ') : message || 'Erro ao salvar tarefa');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }
    try {
      await tasksService.delete(id);
      loadTasks();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      await tasksService.update(task.id, { completed: !task.completed });
      loadTasks();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return 'bg-red-100 text-red-800';
      case Priority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case Priority.LOW:
        return 'bg-green-100 text-green-800';
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return 'Alta';
      case Priority.MEDIUM:
        return 'Média';
      case Priority.LOW:
        return 'Baixa';
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          + Nova Tarefa
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa
            </label>
            <select
              {...registerFilter('companyId')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <select
              {...registerFilter('priority')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas</option>
              <option value={Priority.HIGH}>Alta</option>
              <option value={Priority.MEDIUM}>Média</option>
              <option value={Priority.LOW}>Baixa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              {...registerFilter('completed')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas</option>
              <option value="false">Pendentes</option>
              <option value="true">Concluídas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <input
              type="date"
              {...registerFilter('date')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500">Carregando...</div>
        ) : tasks.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <p className="mb-4">Nenhuma tarefa encontrada.</p>
            <button
              onClick={handleCreate}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Criar primeira tarefa
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-6 hover:bg-gray-50 ${task.completed ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(task)}
                      className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          to={`/tasks/${task.id}`}
                          className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}
                        >
                          {task.name}
                        </Link>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}
                        >
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{task.company?.name}</span>
                        {task.date && (
                          <span>
                            {format(new Date(task.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        )}
                        {!task.date && <span className="text-gray-400">Backlog</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Tarefa */}
      <Dialog open={isModalOpen} onClose={() => { setIsModalOpen(false); setApiError(null); }} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">
              {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </Dialog.Title>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {apiError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  {...register('name', { required: 'Nome é obrigatório' })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nome da tarefa"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  {...register('description', { required: 'Descrição é obrigatória' })}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Descrição da tarefa"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa *
                  </label>
                  <select
                    {...register('companyId', { required: 'Empresa é obrigatória' })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      errors.companyId ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione...</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  {errors.companyId && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={Priority.MEDIUM}>Média</option>
                    <option value={Priority.HIGH}>Alta</option>
                    <option value={Priority.LOW}>Baixa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data (deixe em branco para backlog)
                </label>
                <input
                  type="date"
                  {...register('date')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setApiError(null); }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

