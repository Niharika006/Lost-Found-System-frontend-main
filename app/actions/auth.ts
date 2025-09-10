// frontend/app/actions/auth.ts
'use server';

import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

// This action is now solely for clearing cookies and invalidating refresh token on backend
export async function logoutAction(): Promise<{ success: boolean; message?: string }> {
  try {
    const accessToken = cookies().get('accessToken')?.value; // Still need access token to call backend logout
    
    // Clear the access token cookie from the browser (optional, as backend logout will handle refresh token)
    cookies().delete('accessToken');

    // Call backend /auth/logout endpoint to invalidate refresh token in DB and clear HttpOnly cookie
    const response = await fetch(`${BACKEND_API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : '', // Send access token if available
      },
      // Ensure cookies are sent (needed for the HttpOnly refresh token)
      credentials: 'include', 
    });

    if (!response.ok) {
      console.error('Failed to logout on backend:', response.statusText);
      // Even if backend logout fails, we clear client-side state
      return { success: false, message: 'Failed to log out on backend.' };
    }

    return { success: true, message: 'Logged out successfully.' };
  } catch (error: any) {
    console.error('Error during logout action:', error);
    return { success: false, message: error.message || 'An unexpected error occurred during logout.' };
  }
}
