import { useQuery } from "@tanstack/react-query";
import supabase from "../lib/supabase";

export function useSupabaseQuery({
  table,
  queryKey,
  select = "*",
  filters = {},
  enabled = true,
}) {
  return useQuery({
    queryKey,
    enabled,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      let query = supabase
        .from(table)
        .select(select)
        .order("created_at", { ascending: false });

      // Apply filters dynamically
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
