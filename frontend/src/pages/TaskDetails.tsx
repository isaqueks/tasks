import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { tasksService, observationsService, Priority } from '../services/tasks.service';
import type { Task, Observation, CreateTaskDto } from '../services/tasks.service';

export const TaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateTaskDto>();
  const { register: registerObs, handleSubmit: handleSubmitObs, reset: resetObs, formState: { isSubmitting: isSubmittingObs } } = useForm<{ content: string }>();

  useEffect(() => {
    if (id) {
      loadTask();
      loadObservations();
    }
  }, [id]);

  const loadTask = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await tasksService.getById(id);
      setTask(data);
      reset({
        name: data.name,
        description: data.description,
        priority: data.priority,
        companyId: data.companyId,
        date: data.date ? format(new Date(data.date), 'yyyy-MM-dd') : '',
      });
    } catch (error) {
      console.error('Erro ao carregar tarefa:', error);
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadObservations = async () => {
    if (!id) return;
    try {
      const data = await observationsService.getAll(id);
      setObservations(data);
    } catch (error) {
      console.error('Erro ao carregar observações:', error);
    }
  };

  const onSubmit = async (data: CreateTaskDto) => {
    if (!id) return;
    try {
      await tasksService.update(id, data);
      setIsEditing(false);
      loadTask();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const onSubmitObservation = async (data: { content: string }) => {
    if (!id) return;
    try {
      await observationsService.create(id, data.content);
      resetObs({ content: '' });
      loadObservations();
    } catch (error) {
      console.error('Erro ao criar observação:', error);
    }
  };

  const handleDeleteObservation = async (obsId: string) => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja excluir esta observação?')) {
      return;
    }
    try {
      await observationsService.delete(id, obsId);
      loadObservations();
    } catch (error) {
      console.error('Erro ao excluir observação:', error);
    }
  };

  const toggleComplete = async () => {
    if (!task || !id) return;
    try {
      await tasksService.update(id, { completed: !task.completed });
      loadTask();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }
    try {
      await tasksService.delete(id);
      navigate('/tasks');
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/tasks"
          className="text-primary-600 hover:text-primary-700 font-medium text-sm mb-4 inline-block"
        >
          ← Voltar para Tarefas
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Detalhes da Tarefa</h1>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-primary-600 bg-primary-50 rounded-lg font-medium hover:bg-primary-100"
                >
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 bg-red-50 rounded-lg font-medium hover:bg-red-100"
                >
                  Excluir
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                {...register('name', { required: 'Nome é obrigatório' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                {...register('description', { required: 'Descrição é obrigatória' })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={toggleComplete}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Tarefa concluída
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
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
        ) : (
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={toggleComplete}
                  className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <h2 className={`text-xl font-bold mb-2 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.name}
                  </h2>
                  <p className="text-gray-600 mb-4">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium text-gray-700">Empresa:</span>
                    <span className="text-gray-600">{task.company?.name}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                    {task.date && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          {format(new Date(task.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </>
                    )}
                    {!task.date && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">Backlog</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Observações */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Observações</h3>

        <form onSubmit={handleSubmitObs(onSubmitObservation)} className="mb-6">
          <div className="flex gap-2">
            <textarea
              {...registerObs('content', { required: 'Conteúdo é obrigatório' })}
              rows={3}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Adicionar uma observação..."
            />
            <button
              type="submit"
              disabled={isSubmittingObs}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 self-start"
            >
              {isSubmittingObs ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {observations.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma observação ainda.</p>
          ) : (
            observations.map((obs) => (
              <div key={obs.id} className="border-l-4 border-primary-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900">{obs.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(obs.createdAt), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteObservation(obs.id)}
                    className="text-red-600 hover:text-red-700 text-sm ml-4"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

