"use client";

"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Employee } from "@/lib/excel-data";
import { getEmployeeEdit } from "@/lib/employee-store";

interface EmployeesTableProps {
  employees: Employee[];
  onEmployeeClick?: (employee: Employee) => void;
}

function getStatusColor(status: string | undefined) {
  if (!status) return "bg-gray-100 text-gray-800";
  const statusLower = status.toLowerCase();
  if (statusLower.includes("active") || statusLower.includes("valid")) {
    return "bg-green-100 text-green-800";
  }
  if (statusLower.includes("expired") || statusLower.includes("invalid")) {
    return "bg-red-100 text-red-800";
  }
  if (statusLower.includes("expiring") || statusLower.includes("pending")) {
    return "bg-yellow-100 text-yellow-800";
  }
  return "bg-gray-100 text-gray-800";
}

function getGenderBadge(gender: string | undefined) {
  if (!gender) return null;
  const genderUpper = gender.toUpperCase();
  if (genderUpper === "M" || genderUpper === "MALE") {
    return <Badge variant="secondary">Male</Badge>;
  }
  if (genderUpper === "F" || genderUpper === "FEMALE") {
    return <Badge variant="outline">Female</Badge>;
  }
  return <Badge variant="outline">{gender}</Badge>;
}

function formatDate(date: any) {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(date);
  }
}

export function EmployeesTable({
  employees,
  onEmployeeClick,
}: EmployeesTableProps) {
  const [storeVersion, setStoreVersion] = React.useState(0);

  // Refresh when component gets focus (user may have edited contract dates)
  React.useEffect(() => {
    const onFocus = () => setStoreVersion((v) => v + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Gender</TableHead>
            <TableHead className="font-semibold">Designation</TableHead>
            <TableHead className="font-semibold">County</TableHead>
            <TableHead className="font-semibold">Station</TableHead>
            <TableHead className="font-semibold">License Status</TableHead>
            <TableHead className="font-semibold">Valid Until</TableHead>
            <TableHead className="font-semibold">Contract End</TableHead>
            <TableHead className="font-semibold">Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee, idx) => {
            const edit = employee.name
              ? getEmployeeEdit(employee.name)
              : undefined;
            // Show edited endOfContract if available, otherwise fall back to validUntil from Excel
            const contractEnd =
              edit?.endOfContract || employee.validUntil || null;

            return (
              <TableRow
                key={idx}
                className={`hover:bg-muted/50 ${onEmployeeClick ? "cursor-pointer" : ""}`}
                onClick={() => onEmployeeClick?.(employee)}
              >
                <TableCell className="font-medium">
                  {employee.name || "-"}
                </TableCell>
                <TableCell>
                  {getGenderBadge(employee.gender as string)}
                </TableCell>
                <TableCell className="text-sm">
                  {employee.designation || "-"}
                </TableCell>
                <TableCell className="text-sm">
                  {employee.county || "-"}
                </TableCell>
                <TableCell className="text-sm">
                  {employee.station || "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${getStatusColor(employee.status as string)}`}
                  >
                    {employee.status || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(employee.validUntil)}
                </TableCell>
                <TableCell className="text-sm">
                  {contractEnd ? (
                    <span
                      className={`font-medium ${new Date(contractEnd) < new Date() ? "text-red-600" : "text-amber-600"}`}
                    >
                      {formatDate(contractEnd)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {employee.phone || "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
