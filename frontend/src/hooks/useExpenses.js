import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../api/expenses';

export function useExpenses(params) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expensesApi.getAll(params).then((r) => r.data.data.expenses),
  });
}

export function useGroupExpenses(groupId) {
  return useQuery({
    queryKey: ['expenses', 'group', groupId],
    queryFn: () => expensesApi.getByGroup(groupId).then((r) => r.data.data.expenses),
    enabled: !!groupId,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => expensesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['settlements'] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => expensesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['settlements'] });
    },
  });
}
