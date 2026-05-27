import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../api/groups';

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll().then((r) => r.data.data.groups),
  });
}

export function useGroup(id) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => groupsApi.getById(id).then((r) => r.data.data.group),
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => groupsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => groupsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }) => groupsApi.addMember(groupId, { userId }),
    onSuccess: (_, { groupId }) => qc.invalidateQueries({ queryKey: ['groups', groupId] }),
  });
}

export function useLeaveGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => groupsApi.leave(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}
