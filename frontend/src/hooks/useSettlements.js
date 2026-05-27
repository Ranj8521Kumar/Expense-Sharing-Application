import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settlementsApi } from '../api/settlements';

export function useBalances() {
  return useQuery({
    queryKey: ['settlements', 'balances'],
    queryFn: () => settlementsApi.getBalances().then((r) => r.data.data),
  });
}

export function useGroupBalance(groupId) {
  return useQuery({
    queryKey: ['settlements', 'group', groupId],
    queryFn: () => settlementsApi.getGroupBalance(groupId).then((r) => r.data.data),
    enabled: !!groupId,
  });
}

export function useSettlementHistory() {
  return useQuery({
    queryKey: ['settlements', 'history'],
    queryFn: () => settlementsApi.getHistory().then((r) => r.data.data.settlements),
  });
}

export function useSettle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => settlementsApi.settle(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settlements'] });
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
