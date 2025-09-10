"use client";

import { useState, useEffect } from 'react';
import useSWR from 'swr'; // For data fetching
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/protected-route'; // Import ProtectedRoute
import { listReports } from '@/app/actions/reports'; // Import server action for reports
import { useAuth } from '@/lib/auth'; // Import useAuth to get the token for WebSocket
import { useRouter } from 'next/navigation';

interface Report {
  _id: string;
  type: 'LOST' | 'FOUND';
  subject_type: 'PERSON' | 'ITEM';
  ref_ids: string[];
  description_text: string;
  language: string;
  photo_ids: string[]; // These are GridFS IDs now
  location: string;
  status: 'OPEN' | 'MATCHED' | 'REUNITED' | 'CLOSED';
  created_at: string; // ISO 8601 string
}

interface Match {
  _id: string;
  lost_report_id: string;
  found_report_id: string;
  scores: { [key: string]: number };
  fused_score: number;
  status: 'PENDING' | 'CONFIRMED_REUNITED' | 'FALSE_MATCH';
  created_at: string;
}

// Define your backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000';

// Fetcher for SWR
const fetcher = async (url: string, token: string | null) => {
  if (!token) throw new Error('No authentication token found.');
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch data');
  }
  return response.json();
};

export default function AdminPage() {
  const { token, user, isAuthenticated } = useAuth();
  const router = useRouter();

  // SWR hooks for fetching reports and matches
  const { data: rawLostReports, error: lostReportsError, isLoading: lostReportsLoading, mutate: mutateLostReports } = useSWR(
    isAuthenticated && token ? [`${BACKEND_API_URL}/reports/?type=lost`, token] : null,
    ([url, tokenValue]) => fetcher(url, tokenValue)
  );

  const { data: rawFoundReports, error: foundReportsError, isLoading: foundReportsLoading, mutate: mutateFoundReports } = useSWR(
    isAuthenticated && token ? [`${BACKEND_API_URL}/reports/?type=found`, token] : null,
    ([url, tokenValue]) => fetcher(url, tokenValue)
  );

  const { data: rawMatches, error: matchesError, isLoading: matchesLoading, mutate: mutateMatches } = useSWR(
    isAuthenticated && token ? [`${BACKEND_API_URL}/matches`, token] : null,
    ([url, tokenValue]) => fetcher(url, tokenValue)
  );

  // Ensure data is always an array
  const lostReports: Report[] = Array.isArray(rawLostReports) ? rawLostReports : [];
  const foundReports: Report[] = Array.isArray(rawFoundReports) ? rawFoundReports : [];
  const matches: Match[] = Array.isArray(rawMatches) ? rawMatches : [];

  // WebSocket for real-time match updates
  useEffect(() => {
    let ws: WebSocket;
    if (isAuthenticated && user?.id) { // Only connect if authenticated and user ID is available
      ws = new WebSocket(`${WEBSOCKET_URL}/ws/${user.id}`);

      ws.onopen = () => {
        console.log('WebSocket connected for admin dashboard');
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'New match') {
          console.log('New match received:', message.payload);
          mutateMatches(); // Revalidate matches data
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected for admin dashboard');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

    return () => {
      ws?.close();
    };
  }, [isAuthenticated, user?.id, mutateMatches]);

  if (lostReportsError || foundReportsError || matchesError) {
    return <div className="text-red-500 text-center py-4">Failed to load data. Please try again.</div>;
  }

  // Render content only within ProtectedRoute
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen p-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lost-reports">Lost Reports</TabsTrigger>
            <TabsTrigger value="found-reports">Found Reports</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Lost Reports</CardTitle>
                <CardDescription>Number of active lost reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{lostReportsLoading ? '...' : lostReports.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Found Reports</CardTitle>
                <CardDescription>Number of active found reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{foundReportsLoading ? '...' : foundReports.length || 0}</p>
              </CardContent>
            </Card>
        <Card>
          <CardHeader>
                <CardTitle>Pending Matches</CardTitle>
                <CardDescription>Matches awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{matchesLoading ? '...' : matches.filter(m => m.status === 'PENDING').length || 0}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lost-reports">
            <h2 className="text-2xl font-bold mb-4">Lost Reports</h2>
            {lostReportsLoading && <p>Loading lost reports...</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lostReports.map((report) => (
                <Card key={report._id}>
                  <CardHeader>
                    <CardTitle>{report.description_text}</CardTitle>
                    <CardDescription>Type: {report.type} | Subject: {report.subject_type}</CardDescription>
          </CardHeader>
          <CardContent>
                    <p>Location: {report.location}</p>
                    <p>Status: {report.status}</p>
                    <p>Created: {new Date(report.created_at).toLocaleDateString()}</p>
                    {/* Add more report details here */}
                    <Button variant="outline" className="mt-2" onClick={() => router.push(`/report/${report._id}`)}>View Details</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="found-reports">
            <h2 className="text-2xl font-bold mb-4">Found Reports</h2>
            {foundReportsLoading && <p>Loading found reports...</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {foundReports.map((report) => (
                <Card key={report._id}>
                  <CardHeader>
                    <CardTitle>{report.description_text}</CardTitle>
                    <CardDescription>Type: {report.type} | Subject: {report.subject_type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Location: {report.location}</p>
                    <p>Status: {report.status}</p>
                    <p>Created: {new Date(report.created_at).toLocaleDateString()}</p>
                    {/* Add more report details here */}
                    <Button variant="outline" className="mt-2" onClick={() => router.push(`/report/${report._id}`)}>View Details</Button>
          </CardContent>
        </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matches">
            <h2 className="text-2xl font-bold mb-4">Pending Matches</h2>
            {matchesLoading && <p>Loading matches...</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.filter(m => m.status === 'PENDING').map((match) => (
                <Card key={match._id}>
          <CardHeader>
                    <CardTitle>Match ID: {match._id}</CardTitle>
                    <CardDescription>Fused Score: {(match.fused_score * 100).toFixed(2)}%</CardDescription>
          </CardHeader>
          <CardContent>
                    <p>Lost Report: {match.lost_report_id}</p>
                    <p>Found Report: {match.found_report_id}</p>
                    <p>Status: {match.status}</p>
                    <Button variant="outline" className="mt-2" onClick={() => router.push(`/match/${match._id}`)}>Review Match</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
