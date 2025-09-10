'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ListFilter, Grid, ChevronLeft, ChevronRight, MoreVertical, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Report } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { ProtectedRoute } from '@/components/protected-route';


const ITEMS_PER_PAGE = 10;

export default function FeedPage() {
  const router = useRouter();
  const { user, isAuthenticated, axiosInstance } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayFormat, setDisplayFormat] = useState<'grid' | 'vertical'>('grid');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalReports, setTotalReports] = useState(0);

  const canDelete = user?.role === 'ADMIN';
  const canClaimDeny = user?.role === 'ADMIN' || user?.role === 'VOLUNTEER';

  // Auth check and redirect
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isAuthenticated, router]);

  // Fetch reports when authenticated or page changes
  useEffect(() => {
    async function fetchReports() {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get('/reports/', {
          params: { skip: currentPage * ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE },
        });
        if (response.status === 200) {
          setReports(response.data);
          setTotalReports(response.data.length > 0 ? currentPage * ITEMS_PER_PAGE + response.data.length + (response.data.length === ITEMS_PER_PAGE ? 1 : 0) : 0);
        } else {
          setError(response.data.detail || 'Failed to fetch reports.');
        }
      } catch (err: any) {
        console.error('Error fetching reports:', err);
        setError(err.response?.data?.detail || err.message || 'An unexpected error occurred while fetching reports.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchReports();
  }, [isAuthenticated, currentPage, axiosInstance]);

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await axiosInstance.delete(`/reports/${reportId}`);
      if (response.status === 200) {
        toast({ title: 'Report Deleted', description: response.data.message || 'Report deleted successfully.' });
        setReports(prev => prev.filter(r => r.id !== reportId));
      } else {
        toast({ title: 'Error', description: response.data.detail || 'Failed to delete report.', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.detail || err.message || 'An unexpected error occurred.', variant: 'destructive' });
    }
  };

  const handleUpdateStatus = async (reportId: string, status: Report['status']) => {
    try {
      const response = await axiosInstance.put(`/reports/${reportId}/status`, { status });
      if (response.status === 200) {
        toast({ title: 'Status Updated', description: response.data.message || 'Report status updated successfully.' });
        setReports(prev => prev.map(r => (r.id === reportId ? { ...r, status } : r)));
      } else {
        toast({ title: 'Error', description: response.data.detail || 'Failed to update report status.', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.detail || err.message || 'An unexpected error occurred.', variant: 'destructive' });
    }
  };

  const ReportCard = ({ report }: { report: Report }) => (
    <Card className={cn('relative', displayFormat === 'grid' ? 'h-full flex flex-col' : 'flex flex-row items-center space-x-4')}>
      <CardHeader className={cn(displayFormat === 'grid' ? 'pb-2' : 'flex-shrink-0')}>
        {report.photo_urls && report.photo_urls.length > 0 ? (
          <Image
            src={report.photo_urls[0]}
            alt={`Report ${report.id} image`}
            width={displayFormat === 'grid' ? 300 : 100}
            height={displayFormat === 'grid' ? 200 : 100}
            className={cn('object-cover rounded-md', displayFormat === 'grid' ? 'w-full h-48' : 'w-24 h-24')}
          />
        ) : (
          <div className={cn('bg-gray-100 rounded-md flex items-center justify-center text-gray-500', displayFormat === 'grid' ? 'w-full h-48' : 'w-24 h-24')}>
            No Image
          </div>
        )}
      </CardHeader>
      <CardContent className={cn('space-y-1', displayFormat === 'grid' ? 'flex-grow' : 'flex-grow p-4')}>
        <p className="text-xs text-muted-foreground uppercase">{report.type} - {report.subject_type}</p>
        <CardTitle className={cn('text-lg font-bold', displayFormat === 'vertical' && 'line-clamp-1')}>
          {(report.description_text ?? '').substring(0, 50)}...
        </CardTitle>
        <CardDescription>Status: {report.status}</CardDescription>
        {report.posted_by_contact && <p className="text-sm">Posted by: {report.posted_by_contact}</p>}
        {report.location && (
          <p className="text-sm">
            Location: {report.location.description || `Lat: ${report.location.latitude.toFixed(4)}, Lng: ${report.location.longitude.toFixed(4)}`}
          </p>
        )}
        {report.subject_type === 'PERSON' && report.person_details && (
          <div className="text-sm">
            {report.person_details.is_child && <p className="font-semibold text-red-600">Child Report</p>}
            {report.person_details.age !== undefined && <p>Age: {report.person_details.age}</p>}
            {report.person_details.height_cm && <p>Height: {report.person_details.height_cm} cm</p>}
            {report.person_details.weight_kg && <p>Weight: {report.person_details.weight_kg} kg</p>}
            {report.person_details.identifying_features && <p className="line-clamp-1">Features: {report.person_details.identifying_features}</p>}
            {report.person_details.clothing_description && <p className="line-clamp-1">Clothing: {report.person_details.clothing_description}</p>}
            {report.person_details.guardian_contact && <p>Guardian: {report.person_details.guardian_contact}</p>}
          </div>
        )}
      </CardContent>
      <CardFooter className="absolute top-2 right-2 flex space-x-2 p-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/report/${report.id}`)}>
              View Full Report
            </DropdownMenuItem>
            {canDelete && (
              <DropdownMenuItem onClick={() => handleDelete(report.id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
            {canClaimDeny && report.status === 'OPEN' && (
              <DropdownMenuItem onClick={() => handleUpdateStatus(report.id, 'MATCHED')}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Matched
              </DropdownMenuItem>
            )}
             {canClaimDeny && report.status === 'MATCHED' && (
              <DropdownMenuItem onClick={() => handleUpdateStatus(report.id, 'REUNITED')}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Reunited
              </DropdownMenuItem>
            )}
            {canClaimDeny && (report.status === 'MATCHED' || report.status === 'REUNITED') && (
              <DropdownMenuItem onClick={() => handleUpdateStatus(report.id, 'OPEN')} className="text-orange-600">
                <XCircle className="h-4 w-4 mr-2" /> Revert to Open
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );

  // Display loading state if not authenticated or data is still loading
  if (!isAuthenticated || isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-8 text-center">
          <p>Loading feed...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-8 text-red-500">
          <p>Error: {error}</p>
          <Button onClick={() => router.back()} className="mt-4">Back</Button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Reports Feed</h1>

        <div className="flex justify-between items-center mb-6">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
              <TabsTrigger value="found">Found</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => setDisplayFormat('grid')} className={cn(displayFormat === 'grid' && 'bg-gray-200')}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setDisplayFormat('vertical')} className={cn(displayFormat === 'vertical' && 'bg-gray-200')}>
              <ListFilter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {reports.length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground">No reports found.</div>
        )}

        <div className={cn(displayFormat === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6')}>
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>

        <div className="flex justify-center items-center space-x-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          <span className="text-sm">Page {currentPage + 1}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={reports.length < ITEMS_PER_PAGE || isLoading}
          >
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

      </div>
    </ProtectedRoute>
  );
}
