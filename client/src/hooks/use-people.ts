import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type errorSchemas } from "@shared/routes";
import { type InsertPerson, type PersonWithCards } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function usePeople() {
  return useQuery({
    queryKey: [api.people.list.path],
    queryFn: async () => {
      const res = await fetch(api.people.list.path);
      if (!res.ok) throw new Error("Failed to fetch people");
      return api.people.list.responses[200].parse(await res.json());
    },
  });
}

export function usePerson(id: number) {
  return useQuery({
    queryKey: [api.people.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.people.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch person");
      return api.people.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertPerson) => {
      const res = await fetch(api.people.create.path, {
        method: api.people.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create person");
      }
      return api.people.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.people.list.path] });
      toast({ title: "Success", description: "Person added successfully" });
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

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertPerson }) => {
      const url = buildUrl(api.people.update.path, { id });
      const res = await fetch(url, {
        method: api.people.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update person");
      return api.people.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.people.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.people.get.path, data.id] });
      toast({ title: "Updated", description: "Person updated successfully" });
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

export function useDeletePerson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.people.delete.path, { id });
      const res = await fetch(url, { method: api.people.delete.method });
      if (!res.ok) throw new Error("Failed to delete person");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.people.list.path] });
      toast({ title: "Deleted", description: "Person removed successfully" });
    },
  });
}
