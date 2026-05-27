import { client } from './client';

export const expensesApi = {
  getAll: (params) => client.get('/expenses', { params }),
  getById: (id) => client.get(`/expenses/${id}`),
  getByGroup: (groupId) => client.get(`/expenses/group/${groupId}`),
  create: (data) => client.post('/expenses', data),
  update: (id, data) => client.put(`/expenses/${id}`, data),
  delete: (id) => client.delete(`/expenses/${id}`),
};
