"use server"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export async function runMatching(): Promise<{ created: number }> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/match/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Assuming the backend handles the report fetching and matching logic
      // No specific body needed for now, as it's triggered from the backend
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to run matching");
    }

    const result = await response.json();
    // The backend's /match/run endpoint doesn't return 'created', but a message.
    // We'll return a placeholder for now or adjust based on actual backend response.
    console.log(result.message);
    return { created: 1 }; // Placeholder, actual count not returned by backend yet
  } catch (error: any) {
    console.error("Error running matching:", error);
    return { created: 0 };
  }
}

export async function setMatchStatus(matchId: string, status: "confirmed" | "rejected") {
  try {
    const backendStatus = status === "confirmed" ? "confirm" : "flag_false";
    const response = await fetch(`${BACKEND_API_URL}/matches/${matchId}/${backendStatus}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { ok: false, error: errorData.detail || `Failed to set match status to ${status}` };
    }

    return { ok: true };
  } catch (error: any) {
    console.error(`Error setting match status to ${status} for ${matchId}:`, error);
    return { ok: false, error: error.message || "An unexpected error occurred" };
  }
}
