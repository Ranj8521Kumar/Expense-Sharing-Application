import { client } from './client';

export const groupsApi = {
  getAll: () => client.get('/groups'),
  getById: (id) => client.get(`/groups/${id}`),
  create: (data) => client.post('/groups', data),
  update: (id, data) => client.put(`/groups/${id}`, data),
  delete: (id) => client.delete(`/groups/${id}`),
  addMember: (id, data) => client.post(`/groups/${id}/members`, data),
  removeMember: (id, userId) => client.delete(`/groups/${id}/members/${userId}`),
  leave: (id) => client.post(`/groups/${id}/leave`),
};
