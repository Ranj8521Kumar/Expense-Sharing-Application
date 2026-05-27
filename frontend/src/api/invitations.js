import { client } from './client';

export const invitationsApi = {
  /** Get invitation details by token (public) */
  getByToken: (token) => client.get(`/invitations/${token}`),

  /** Accept invitation after registration (authenticated) */
  accept: (token) => client.post(`/invitations/${token}/accept`),
};
