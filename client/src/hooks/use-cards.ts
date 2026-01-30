import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertCard } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCardsByType(type: string) {
  return useQuery({
    queryKey: [api.cards.listByType.path, type],
    queryFn: async () => {
      const url = buildUrl(api.cards.listByType.path, { type });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch cards");
      return api.cards.listByType.responses[200].parse(await res.json());
    },
    enabled: !!type,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertCard) => {
      const res = await fetch(api.cards.create.path, {
        method: api.cards.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error("Failed to add card");
      return api.cards.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.people.get.path, variables.personId] });
      queryClient.invalidateQueries({ queryKey: [api.cards.listByType.path] });
      toast({ title: "Success", description: "Card added successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, personId }: { id: number, personId: number }) => {
      const url = buildUrl(api.cards.delete.path, { id });
      const res = await fetch(url, { method: api.cards.delete.method });
      if (!res.ok) throw new Error("Failed to delete card");
      return { personId };
    },
    onSuccess: ({ personId }) => {
      queryClient.invalidateQueries({ queryKey: [api.people.get.path, personId] });
      queryClient.invalidateQueries({ queryKey: [api.cards.listByType.path] });
      toast({ title: "Deleted", description: "Card removed successfully" });
    },
  });
}
