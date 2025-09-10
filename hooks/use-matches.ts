"use client"

import useSWR, { mutate } from "swr"
import { Match } from "@/lib/types" // Import the Match interface
import { useAuth } from "@/lib/auth" // Import useAuth

export type MatchRecord = {
  id: string
  lost_report_id: string
  found_report_id: string
  lostPhotoUrl?: string // URL for the lost report's primary photo
  foundPhotoUrl?: string // URL for the found report's primary photo
  fused_score: number // 0..1 from backend
  status: Match['status'] // Use Match status types
  created_at: string
  scores: { face?: number; image?: number; text?: number; distance?: number; } // Include distance score
}

type MatchesData = { list: Match[] } // Use the Match interface directly

export function useMatches() {
  const { axiosInstance, isAuthenticated } = useAuth(); // Get axiosInstance and isAuthenticated
  const { data, error, isLoading } = useSWR<MatchesData>(
    isAuthenticated ? ["/api/matches", axiosInstance] : null, // SWR key includes axiosInstance and isAuthenticated
    async ([key, axiosInstance]) => {
      if (!axiosInstance) throw new Error("Axios instance not available.");
      try {
        const response = await axiosInstance.get(key); // Use axiosInstance to fetch
        if (response.status === 200) {
          return { list: response.data || [] };
        }
        throw new Error(response.data.detail || "Failed to fetch matches.");
      } catch (err: any) {
        throw new Error(err.response?.data?.detail || err.message || "An unexpected error occurred while fetching matches.");
      }
    }
  );

  const current: MatchesData = data || { list: [] };

  const updateMatch = async (id: string, status: Match['status']) => {
    if (!axiosInstance) {
      console.error("Axios instance not available for updating match.");
      return;
    }
    try {
      const response = await axiosInstance.put(`/matches/${id}/status`, { status });
      if (response.status === 200) {
        // Optimistically update the cache and then revalidate
        mutate(isAuthenticated ? ["/api/matches", axiosInstance] : null, { list: current.list.map((m) => (m.id === id ? { ...m, status } : m)) }, false);
        mutate(isAuthenticated ? ["/api/matches", axiosInstance] : null); // Revalidate to ensure data consistency
      } else {
        console.error("Failed to update match status:", response.data.detail || "Unknown error.");
      }
    } catch (err: any) {
      console.error("Error updating match status:", err.response?.data?.detail || err.message || "An unexpected error occurred.");
    }
  };

  return {
    data: current,
    updateMatch, // Expose updateMatch
    isLoading,
    error,
  }
}
