'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProtectedRoute } from '@/components/protected-route';
import { listReports } from '@/app/actions/reports'; // fetch from API
import { useAuth } from '@/lib/auth'; // token + auth state

// ✅ Fixed interface (matches backend fields)
interface Report {
  _id: string;
  type: 'LOST' | 'FOUND';
  subject: 'PERSON' | 'ITEM';
  refs: string[];
  desc_text: string;
  language: string;
  photo_ids: string[];
  location: string;
  status: 'OPEN' | 'MATCHED' | 'REUNITED' | 'CLOSED';
  created_at: string;
}

// ✅ Fetcher for SWR
const fetcher = async (args: [string, string | null]) => {
  const [_, token] = args;
  if (!token) throw new Error('No authentication token found.');

  const result = await listReports('LOST');

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch lost reports.');
  }
  return result.data || [];
};

export default function ReportLostPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: reportsData,
    error,
    isLoading,
  } = useSWR(isAuthenticated && token ? ['/api/reports/lost', token] : null, fetcher);

  // ✅ Ensure array
  const reports: Report[] = Array.isArray(reportsData) ? reportsData : [];

  const filteredReports = reports.filter((report: Report) =>
    report.desc_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <ProtectedRoute>
        <div className="text-red-500 text-center py-4">
          Error loading reports: {error.message}
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8">
        <h1 className="text-4xl font-bold mb-8">Lost Reports</h1>

        <div className="flex justify-between items-center mb-6">
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={() => router.push('/new-report?type=lost')}>
            Report New Lost Item
          </Button>
        </div>

        {isLoading ? (
          <p className="text-center">Loading lost reports...</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.length > 0 ? (
              filteredReports.slice(0, 6).map((r: Report) => (
                <Card key={r._id} className="rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-base">{r.desc_text}</CardTitle>
                    <CardDescription>
                      Type: {r.type} | Subject: {r.subject}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Location: {r.location || 'Not specified'}</p>
                    <p>Status: {r.status}</p>
                    <p>Created: {new Date(r.created_at).toLocaleDateString()}</p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => router.push(`/report/${r._id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">
                No lost reports found.
              </p>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
