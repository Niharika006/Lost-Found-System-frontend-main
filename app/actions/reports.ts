// frontend/app/actions/reports.ts
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'; // Import cookies for server-side token access
import { Report } from '@/lib/types'; // Import Report interface

// Define your backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

interface ReportData {
  type: 'LOST' | 'FOUND';
  subject_type: 'PERSON' | 'ITEM';
  ref_ids_str: string;
  description_text: string;
  language: string;
  latitude: string;
  longitude: string;
  location_desc?: string;
  photos?: File[]; // Use File type for actual file uploads
  item_color?: string; // Conditional fields based on subject_type
  item_brand?: string;
  person_name?: string;
  person_age?: string;
  guardian_contact?: string;
  is_child?: boolean;
  height_cm?: string;
  weight_kg?: string;
  identifying_features?: string;
  clothing_description?: string;
}

// Helper function to get the JWT token from cookies
function getAuthToken(): string | null {
  // On the server, we read from cookies
  const accessToken = cookies().get('accessToken')?.value;
  return accessToken || null;
}

export async function createReportFromForm(formData: FormData): Promise<{ success: boolean; message?: string; reportId?: string }> {
  const type = formData.get('type') as 'LOST' | 'FOUND';
  const subject_type = formData.get('subject_type') as 'PERSON' | 'ITEM';
  const description_text = formData.get('description_text') as string;
  const language = formData.get('language') as string;
  const latitude = formData.get('latitude') as string;
  const longitude = formData.get('longitude') as string;
  const location_desc = formData.get('location_desc') as string | undefined;
  const photos = formData.getAll('photos') as File[]; // Get all photo files

  // These are optional fields and might be empty strings if not provided
  const item_color = formData.get('item_color') as string | undefined;
  const item_brand = formData.get('item_brand') as string | undefined;
  const person_name = formData.get('person_name') as string | undefined;
  const person_age = formData.get('person_age') as string | undefined;
  const guardian_contact = formData.get('guardian_contact') as string | undefined;
  const is_child = formData.get('is_child') === 'true'; // Checkbox value is 'true' or 'false' string
  const height_cm = formData.get('height_cm') as string | undefined;
  const weight_kg = formData.get('weight_kg') as string | undefined;
  const identifying_features = formData.get('identifying_features') as string | undefined;
  const clothing_description = formData.get('clothing_description') as string | undefined;

  // For `ref_ids_str`, we might need to create a dummy ID or handle actual IDs later
  // For now, let's use a placeholder if it's empty
  const ref_ids_str = formData.get('ref_ids_str') as string || 'placeholder_id';

  const reportData: ReportData = {
    type,
    subject_type,
    ref_ids_str,
    description_text,
    language,
    latitude,
    longitude,
    location_desc: location_desc || undefined,
    photos: photos.filter(photo => photo.size > 0), // Filter out empty files
    item_color: item_color || undefined,
    item_brand: item_brand || undefined,
    person_name: person_name || undefined,
    person_age: person_age || undefined,
    guardian_contact: guardian_contact || undefined,
    is_child: is_child,
    height_cm: height_cm || undefined,
    weight_kg: weight_kg || undefined,
    identifying_features: identifying_features || undefined,
    clothing_description: clothing_description || undefined,
  };

  try {
    const token = getAuthToken(); // Get token from cookies
    if (!token) {
      return { success: false, message: 'Authentication token not found. Please log in.' };
    }

    const reportEndpoint = `${BACKEND_API_URL}/reports/${type.toLowerCase()}`;
    const requestFormData = new FormData();
    
    // Append all relevant fields using the backend's expected alias names
    // Changed 'subject_type' to 'subject'
    requestFormData.append('subject', reportData.subject_type); 
    // Changed 'ref_ids_str' to 'refs'
    requestFormData.append('refs', reportData.ref_ids_str); 
    // Changed 'description_text' to 'desc_text'
    requestFormData.append('desc_text', reportData.description_text); 
    // Changed 'language' to 'lang'
    requestFormData.append('lang', reportData.language); 
    requestFormData.append('latitude', reportData.latitude);
    requestFormData.append('longitude', reportData.longitude);
    if (reportData.location_desc) {
      requestFormData.append('location_desc', reportData.location_desc);
    }
    // Removed conditional fields (item_color, item_brand, person_name, person_age, guardian_contact)
    // as they are not direct Form parameters for report creation in the backend's current schema.
    // If you need to save these, you'll need separate API calls or modified backend endpoints.
    // Append person-specific details if subject_type is PERSON
    if (reportData.subject_type === 'PERSON') {
      requestFormData.append('is_child', String(reportData.is_child));
      if (reportData.height_cm) requestFormData.append('height_cm', reportData.height_cm);
      if (reportData.weight_kg) requestFormData.append('weight_kg', reportData.weight_kg);
      if (reportData.identifying_features) requestFormData.append('identifying_features', reportData.identifying_features);
      if (reportData.clothing_description) requestFormData.append('clothing_description', reportData.clothing_description);
    }

    // Append photos
    if (reportData.photos) {
      reportData.photos.forEach((photo) => {
        requestFormData.append('photos', photo);
      });
    }

    const response = await fetch(reportEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}` || '', // Ensure token is not null/undefined
      },
      credentials: 'include', // Important for sending HttpOnly cookies (like refresh token)
      body: requestFormData, // FormData handles Content-Type: multipart/form-data automatically
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to create report:', errorData);
      return { success: false, message: errorData.detail || 'Failed to create report.' };
    }

    const createdReport = await response.json();
    console.log('Report created successfully:', createdReport);
    // Redirect should happen from the client component for better UX/error handling
    return { success: true, reportId: createdReport._id, message: 'Report created successfully.' };
  } catch (error: any) {
    console.error('Error creating report:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}

// Function to fetch reports
export async function listReports(type?: 'LOST' | 'FOUND', status?: 'OPEN' | 'MATCHED' | 'REUNITED' | 'CLOSED', skip: number = 0, limit: number = 10): Promise<{ success: boolean; data?: Report[]; message?: string }> {
  const token = getAuthToken();
  if (!token) {
    console.error('Authentication token not found for listing reports.');
    return { success: false, message: 'Authentication token not found. Please log in.' };
  }

  let queryParams = new URLSearchParams();
  if (type) queryParams.append('type', type);
  if (status) queryParams.append('status', status);
  queryParams.append('skip', skip.toString());
  queryParams.append('limit', limit.toString());

  const url = `${BACKEND_API_URL}/reports/?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` || '',
      },
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch reports:', errorData);
      return { success: false, message: errorData.detail || 'Failed to fetch reports.' };
    }

    const reports = await response.json();
    return { success: true, data: reports as Report[] };
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return { success: false, message: error.message || 'An unexpected error occurred while fetching reports.' };
  }
}

// Function to fetch a single report by ID
export async function getReportById(reportId: string): Promise<{ success: boolean; data?: Report; message?: string }> {
  const token = getAuthToken();
  if (!token) {
    console.error('Authentication token not found for fetching a single report.');
    return { success: false, message: 'Authentication token not found. Please log in.' };
  }

  const url = `${BACKEND_API_URL}/reports/${reportId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` || '',
      },
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to fetch report ${reportId}:`, errorData);
      return { success: false, message: errorData.detail || `Failed to fetch report ${reportId}.` };
    }

    const report = await response.json();
    return { success: true, data: report as Report };
  } catch (error: any) {
    console.error(`Error fetching report ${reportId}:`, error);
    return { success: false, message: error.message || `An unexpected error occurred while fetching report ${reportId}.` };
  }
}
export async function deleteReport(reportId: string): Promise<{ success: boolean; message?: string }> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, message: 'Authentication token not found. Please log in.' };
  }

  const url = `${BACKEND_API_URL}/reports/${reportId}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}` || '',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to delete report:', errorData);
      return { success: false, message: errorData.detail || 'Failed to delete report.' };
    }

    return { success: true, message: 'Report deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting report:', error);
    return { success: false, message: error.message || 'An unexpected error occurred during report deletion.' };
  }
}

export async function updateReportStatus(reportId: string, status: 'OPEN' | 'MATCHED' | 'REUNITED' | 'CLOSED'): Promise<{ success: boolean; message?: string }> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, message: 'Authentication token not found. Please log in.' };
  }

  const url = `${BACKEND_API_URL}/reports/${reportId}/status`;

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
      console.error('Failed to update report status:', errorData);
      return { success: false, message: errorData.detail || 'Failed to update report status.' };
    }

    return { success: true, message: 'Report status updated successfully.' };
  } catch (error: any) {
    console.error('Error updating report status:', error);
    return { success: false, message: error.message || 'An unexpected error occurred during report status update.' };
  }
}

