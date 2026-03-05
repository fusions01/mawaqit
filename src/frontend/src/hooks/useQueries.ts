import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useSettings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!actor)
        return {
          notificationsEnabled: false,
          adhanEnabled: true,
          calculationMethod: "MWL",
        };
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useTasbihCount() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tasbihCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTasbihCount();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useIncrementTasbih() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return BigInt(0);
      return actor.incrementTasbih();
    },
    onSuccess: (newCount) => {
      queryClient.setQueryData(["tasbihCount"], newCount);
    },
  });
}

export function useResetTasbih() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      return actor.resetTasbih();
    },
    onSuccess: () => {
      queryClient.setQueryData(["tasbihCount"], BigInt(0));
    },
  });
}

export function useSaveSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      calculationMethod,
      adhanEnabled,
      notificationsEnabled,
    }: {
      calculationMethod: string;
      adhanEnabled: boolean;
      notificationsEnabled: boolean;
    }) => {
      if (!actor) return;
      return actor.saveSettings(
        calculationMethod,
        adhanEnabled,
        notificationsEnabled,
      );
    },
    onSuccess: (_, vars) => {
      queryClient.setQueryData(["settings"], {
        calculationMethod: vars.calculationMethod,
        adhanEnabled: vars.adhanEnabled,
        notificationsEnabled: vars.notificationsEnabled,
      });
    },
  });
}
