'use client';

import React from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users2 } from 'lucide-react';
import { BackButton } from '@/components/back-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function LayworkersPage() {
  const { data, isLoading } = useSWR('/api/layworkers', fetcher);

  const layworkers = data?.layworkers || [];

  // Group by county
  const byCounty = React.useMemo(() => {
    return (data?.layworkers || []).reduce((acc: any, worker: any) => {
      const county = worker.county || 'Unknown';
      if (!acc[county]) acc[county] = [];
      acc[county].push(worker);
      return acc;
    }, {});
  }, [data?.layworkers]);

  const counties = Object.keys(byCounty).sort();

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Navigation */}
      <BackButton />

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Layworkers Management</h2>
        <p className="text-muted-foreground mt-1">View and manage casual laborers and temporary staff</p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Layworkers</CardTitle>
          <Users2 className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{layworkers.length}</div>
          <p className="text-xs text-muted-foreground mt-1">Across {counties.length} counties</p>
        </CardContent>
      </Card>

      {/* County Breakdown */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-lg" />
          ))}
        </div>
      ) : counties.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No layworker data available</p>
          </CardContent>
        </Card>
      ) : (
        counties.map((county) => (
          <Card key={county}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {county}
                <span className="text-sm font-normal text-muted-foreground">
                  ({byCounty[county].length})
                </span>
              </CardTitle>
              <CardDescription>Casual laborers and temporary staff</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Facility</TableHead>
                      <TableHead className="font-semibold">Sub County</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byCounty[county].map((worker: any, idx: number) => (
                      <TableRow key={idx} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{worker.name || '-'}</TableCell>
                        <TableCell className="text-sm">{worker.facility || '-'}</TableCell>
                        <TableCell className="text-sm">{worker.subCounty || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
