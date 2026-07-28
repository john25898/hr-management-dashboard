"use client";

import React from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TenureChart } from "@/components/better-charts";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/back-button";
import { Calendar, TrendingUp, Award, Users, Clock, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ExperiencePage() {
  const { data: employees, isLoading: employeesLoading } = useSWR(
    "/api/employees?limit=1000",
    fetcher,
  );
  const { data: analytics, isLoading: analyticsLoading } = useSWR(
    "/api/analytics",
    fetcher,
  );

  const isLoading = employeesLoading || analyticsLoading;

  const tenureStats = React.useMemo(() => {
    if (!employees?.data) return { avg: 0, ranges: [] };

    const now = new Date();
    const tenures = employees.data
      .map((emp: any) => {
        if (!emp.dateEmployed) return null;
        const employed = new Date(emp.dateEmployed);
        return (
          Math.floor(
            (now.getTime() - employed.getTime()) /
              (1000 * 60 * 60 * 24 * 365 * 10),
          ) / 10
        );
      })
      .filter((t: any) => t !== null && t >= 0);

    const avg =
      tenures.length > 0
        ? Math.round(
            (tenures.reduce((a: any, b: any) => a + b, 0) / tenures.length) *
              10,
          ) / 10
        : 0;
    const min = tenures.length > 0 ? Math.min(...tenures) : 0;
    const max = tenures.length > 0 ? Math.max(...tenures) : 0;

    return { avg, min, max, ranges: tenures, count: tenures.length };
  }, [employees?.data]);

  const careerProgressionData = React.useMemo(() => {
    if (!employees?.data) return [];

    const designationTenure: Record<string, number[]> = {};

    employees.data.forEach((emp: any) => {
      const designation = emp.designation || "Unknown";
      const tenure = emp.dateEmployed
        ? Math.floor(
            (new Date().getTime() - new Date(emp.dateEmployed).getTime()) /
              (1000 * 60 * 60 * 24 * 365 * 10),
          ) / 10
        : 0;

      if (!designationTenure[designation]) {
        designationTenure[designation] = [];
      }
      designationTenure[designation].push(tenure);
    });

    return Object.entries(designationTenure)
      .map(([designation, tenures]) => ({
        designation,
        avgTenure:
          Math.round(
            (tenures.reduce((a, b) => a + b, 0) / tenures.length) * 10,
          ) / 10,
        count: tenures.length,
        maxTenure: Math.max(...tenures),
      }))
      .sort((a, b) => b.avgTenure - a.avgTenure)
      .slice(0, 10);
  }, [employees?.data]);

  const seniorStaff = React.useMemo(() => {
    if (!employees?.data) return [];

    return employees.data
      .map((emp: any) => ({
        ...emp,
        tenure: emp.dateEmployed
          ? Math.floor(
              (new Date().getTime() - new Date(emp.dateEmployed).getTime()) /
                (1000 * 60 * 60 * 24 * 365),
            )
          : 0,
      }))
      .filter((emp: any) => emp.tenure >= 10)
      .sort((a: any, b: any) => b.tenure - a.tenure)
      .slice(0, 20);
  }, [employees?.data]);

  const experienceByDesignation = React.useMemo(() => {
    if (!analytics?.designationDistribution) return [];
    return analytics.designationDistribution
      .slice(0, 10)
      .map((d: any, idx: number) => ({
        name: d.name,
        value: d.value,
        color: `hsl(${idx * 36}, 70%, 50%)`,
      }));
  }, [analytics]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <BackButton />

      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Experience & Career
        </h2>
        <p className="text-muted-foreground mt-1">
          Tenure analysis, career progression, and staff experience tracking
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Tenure</CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenureStats.avg}</div>
            <p className="text-xs text-muted-foreground mt-1">
              years of service
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Experienced
            </CardTitle>
            <Award className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenureStats.max}</div>
            <p className="text-xs text-muted-foreground mt-1">maximum tenure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Senior Staff (10+ yrs)
            </CardTitle>
            <Star className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seniorStaff.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              experienced professionals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              With Tenure Data
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenureStats.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              employees tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tenure Distribution */}
      {analytics?.tenureDistribution && (
        <TenureChart data={analytics.tenureDistribution} />
      )}

      {/* Career Progression by Designation */}
      <Card>
        <CardHeader>
          <CardTitle>Career Progression by Designation</CardTitle>
          <CardDescription>
            Average tenure and staff count by position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {careerProgressionData.map((item: any) => (
              <div key={item.designation} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium truncate">
                      {item.designation}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.count} staff members
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">
                      {item.avgTenure} yrs
                    </p>
                    <p className="text-xs text-muted-foreground">avg tenure</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(item.avgTenure / Math.max(...careerProgressionData.map((d: any) => d.avgTenure), 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Senior Staff Table */}
      {seniorStaff.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Senior Staff (10+ Years Experience)</CardTitle>
            <CardDescription>
              Most experienced employees in the organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>County</TableHead>
                    <TableHead className="text-center">
                      Tenure (Years)
                    </TableHead>
                    <TableHead>Employment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seniorStaff.map((emp: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {emp.name || "-"}
                      </TableCell>
                      <TableCell>{emp.designation || "-"}</TableCell>
                      <TableCell>{emp.county || "-"}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {emp.tenure} yrs
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {emp.dateEmployed
                          ? new Date(emp.dateEmployed).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
