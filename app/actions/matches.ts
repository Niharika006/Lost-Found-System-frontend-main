'use server';

import { cookies } from 'next/headers';
import { Match } from '@/lib/types'; // Import the Match interface
import { getReportById } from './reports'; // Import getReportById to fetch report photos

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

function getAuthToken(): string | null {
  const accessToken = cookies().get('accessToken')?.value;
  return accessToken || null;
}

export async function listMatches(): Promise<{ success: boolean; data?: Match[]; message?: string }> {
  const token = getAuthToken();
  if (!token) {
    console.error('Authentication token not found for listing matches.');
    return { success: false, message: 'Authentication token not found. Please log in.' };
  }

  const url = `${BACKEND_API_URL}/matches/`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` || '',
      },
      cache: 'no-store',
      credentials: 'include', // Important for sending HttpOnly cookies (like refresh token)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch matches:', errorData);
      return { success: false, message: errorData.detail || 'Failed to fetch matches.' };
    }

    const matches: Match[] = await response.json();

    // For each match, fetch associated report photos
    const matchesWithPhotos: Match[] = await Promise.all(
      matches.map(async (match) => {
        const lostReport = await getReportById(match.lost_report_id);
        const foundReport = await getReportById(match.found_report_id);

        return {
          ...match,
          lostPhotoUrl: lostReport.success ? lostReport.data.photo_urls[0] : undefined,
          foundPhotoUrl: foundReport.success ? foundReport.data.photo_urls[0] : undefined,
        };
      })
    );

    return { success: true, data: matchesWithPhotos };
  } catch (error: any) {
    console.error('Error fetching matches:', error);
    return { success: false, message: error.message || 'An unexpected error occurred while fetching matches.' };
  }
}

export async function updateMatchStatus(matchId: string, status: Match['status']): Promise<{ success: boolean; message?: string }> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, message: 'Authentication token not found. Please log in.' };
  }

  const url = `${BACKEND_API_URL}/matches/${matchId}/status`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` || '',
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to update match status:', errorData);
      return { success: false, message: errorData.detail || 'Failed to update match status.' };
    }

    return { success: true, message: 'Match status updated successfully.' };
  } catch (error: any) {
    console.error('Error updating match status:', error);
    return { success: false, message: error.message || 'An unexpected error occurred while updating match status.' };
  }
}
