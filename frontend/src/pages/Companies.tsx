import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { companiesService } from '../services/companies.service';
import type { Company, CreateCompanyDto } from '../services/companies.service';
import { Dialog } from '@headlessui/react';

export const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<CreateCompanyDto>();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await companiesService.getAll();
      setCompanies(data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCompany(null);
    setApiError(null);
    reset();
    setIsModalOpen(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setApiError(null);
    reset({
      name: company.name,
      cnpj: company.cnpj || '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: CreateCompanyDto) => {
    try {
      setApiError(null);
      if (editingCompany) {
        await companiesService.update(editingCompany.id, data);
      } else {
        await companiesService.create(data);
      }
      setIsModalOpen(false);
      reset();
      loadCompanies();
    } catch (error: any) {
      const message = error.response?.data?.message;
      setApiError(Array.isArray(message) ? message.join(', ') : message || 'Erro ao salvar empresa');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) {
      return;
    }
    try {
      await companiesService.delete(id);
      loadCompanies();
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          + Nova Empresa
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {companies.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <p className="mb-4">Nenhuma empresa cadastrada.</p>
            <button
              onClick={handleCreate}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Criar primeira empresa
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  CNPJ
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{company.name}</td>
                  <td className="px-6 py-4 text-gray-600">{company.cnpj || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(company)}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={isModalOpen} onClose={() => { setIsModalOpen(false); setApiError(null); }} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">
              {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nome da empresa"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ
                </label>
                <input
                  {...register('cnpj')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setApiError(null); }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
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

