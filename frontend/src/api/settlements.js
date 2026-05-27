import { client } from './client';

export const settlementsApi = {
  getBalances: () => client.get('/settlements/balances'),
  getGroupBalance: (groupId) => client.get(`/settlements/group/${groupId}`),
  getHistory: () => client.get('/settlements/history'),
  getUserBalance: (userId) => client.get(`/settlements/balance/${userId}`),
  settle: (data) => client.post('/settlements/settle', data),
};
