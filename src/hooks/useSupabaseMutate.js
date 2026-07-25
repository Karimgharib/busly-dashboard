import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../lib/supabase";

export function useSupabaseMutate({
  table,
  method = "insert",
  queryKeysToInvalidate = [],
  onSuccess,
  onError,
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body) => {
      let query;

      if (method === "insert") {
        query = supabase.from(table).insert(body).select();
      } else if (method === "update") {
        const { id, ...rest } = body;
        query = supabase.from(table).update(rest).eq("id", id).select();
      } else if (method === "delete") {
        query = supabase.from(table).delete().eq("id", body.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryKeysToInvalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      );
      onSuccess?.(data);
    },
    onError: (error) => {
      console.error(error);
      onError?.(error);
    },
  });
}
