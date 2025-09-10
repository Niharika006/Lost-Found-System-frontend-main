'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface Report {
  _id: string;
  type: 'LOST' | 'FOUND';
  subject: 'PERSON' | 'ITEM';
  refs: string[]; // These will be IDs of Person/Item documents
  desc_text: string;
  language: string;
  photo_ids: string[]; // GridFS file IDs
  photo_urls?: string[]; // URLs to images served by backend
  location: {
    latitude: number;
    longitude: number;
    description?: string;
  };
  status: 'OPEN' | 'MATCHED' | 'REUNITED' | 'CLOSED';
  created_at: string;
  posted_by_contact?: string; // Add posted_by_contact
  person_details?: { // Add person_details matching backend schema
    is_child?: boolean;
    height_cm?: number;
    weight_kg?: number;
    identifying_features?: string;
    clothing_description?: string;
    age?: number; // Also include age if it's stored in person_details
    name?: string; // Also include name if it's stored in person_details
    language: string; // From PersonSchema
    photo_ids: string[]; // From PersonSchema
    qr_id?: string; // From PersonSchema
    guardian_contact?: string; // From PersonSchema
  };
}

const fetcher = async (args: [string, string, string | null]) => {
  const [_, reportId, axiosInstance] = args; // Now takes axiosInstance
  if (!axiosInstance) throw new Error('Axios instance not found.');

  try {
    const response = await axiosInstance.get(`/reports/${reportId}`);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error(response.data.detail || 'Failed to fetch report.');
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || error.message || 'An unexpected error occurred while fetching reports.');
  }
};

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.report_id as string;
  const { isAuthenticated, axiosInstance } = useAuth(); // Get axiosInstance
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: report, error, isLoading } = useSWR(
    isAuthenticated && axiosInstance && reportId ? ['/api/reports', reportId, axiosInstance] : null, // Pass axiosInstance
    fetcher
  );

  useEffect(() => {
    if (error) {
      setErrorMessage(error.message || 'An error occurred while loading the report.');
    }
  }, [error]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading report details...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (errorMessage) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen p-8">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="text-red-500 text-center py-4">
            Error: {errorMessage}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!report) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen p-8">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="text-center py-4">
            Report not found.
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold mb-6">Report Details</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Report ID: {report._id}</CardTitle>
            <CardDescription>Created: {new Date(report.created_at).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p><strong>Type:</strong> {report.type}</p>
            <p><strong>Subject:</strong> {report.subject}</p>
            <p><strong>Description:</strong> {report.desc_text}</p>
            <div>
              <strong>Location:</strong>
              <p>Latitude: {report.location.latitude}</p>
              <p>Longitude: {report.location.longitude}</p>
              {report.location.description && <p>Description: {report.location.description}</p>}
            </div>
            <div>
              {report.posted_by_contact && <p><strong>Posted By:</strong> {report.posted_by_contact}</p>}
            </div>
            <p><strong>Language:</strong> {report.language}</p>
            <p><strong>Status:</strong> {report.status}</p>
            {report.subject_type === 'PERSON' && report.person_details && (
              <div className="space-y-2 mt-4 p-4 border rounded-md bg-gray-50">
                <h3 className="text-lg font-semibold">Person Details:</h3>
                {report.person_details.name && <p><strong>Name:</strong> {report.person_details.name}</p>}
                {report.person_details.age !== undefined && <p><strong>Age:</strong> {report.person_details.age}</p>}
                {report.person_details.is_child !== undefined && <p><strong>Is Child:</strong> {report.person_details.is_child ? 'Yes' : 'No'}</p>}
                {report.person_details.height_cm && <p><strong>Height:</strong> {report.person_details.height_cm} cm</p>}
                {report.person_details.weight_kg && <p><strong>Weight:</strong> {report.person_details.weight_kg} kg</p>}
                {report.person_details.identifying_features && <p><strong>Identifying Features:</strong> {report.person_details.identifying_features}</p>}
                {report.person_details.clothing_description && <p><strong>Clothing:</strong> {report.person_details.clothing_description}</p>}
                {report.person_details.guardian_contact && <p><strong>Guardian Contact:</strong> {report.person_details.guardian_contact}</p>}
                {/* You might want to display person_details.photo_ids or language here if different from report's main photo/language */}
              </div>
            )}
            {report.refs && report.refs.length > 0 && (
              <p><strong>References (IDs):</strong> {report.refs.join(', ')}</p>
            )}

            {report.photo_urls && report.photo_urls.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Photos:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {report.photo_urls.map((photoUrl, index) => (
                    <div key={index} className="relative w-full aspect-square overflow-hidden rounded-md">
                      <Image
                        src={photoUrl}
                        alt={`Report photo ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
