"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Calendar,
  Phone,
  MapPin,
  Briefcase,
  User,
  FileText,
  AlertTriangle,
  Skull,
  LogOut,
  Heart,
  Handshake,
  ArrowLeftRight,
} from "lucide-react";
import { Employee } from "@/lib/excel-data";
import {
  getEmployeeEdit,
  updateEmployeeEdit,
  type EmployeeEdit,
} from "@/lib/employee-store";
import { TransferModal } from "@/components/transfer-modal";

interface EmployeeEditModalProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeUpdated?: () => void;
}

function formatDate(date: any) {
  if (!date) return "";
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

function toInputDate(date: any) {
  if (!date) return "";
  try {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

const exitReasons = [
  {
    value: "resignation",
    label: "Resignation",
    icon: LogOut,
    color: "text-amber-600",
    bg: "bg-amber-50 hover:bg-amber-100 border-amber-200",
  },
  {
    value: "retirement",
    label: "Retirement",
    icon: Handshake,
    color: "text-blue-600",
    bg: "bg-blue-50 hover:bg-blue-100 border-blue-200",
  },
  {
    value: "death",
    label: "Death",
    icon: Skull,
    color: "text-red-600",
    bg: "bg-red-50 hover:bg-red-100 border-red-200",
  },
  {
    value: "termination",
    label: "Termination",
    icon: AlertTriangle,
    color: "text-orange-600",
    bg: "bg-orange-50 hover:bg-orange-100 border-orange-200",
  },
] as const;

export function EmployeeEditModal({
  employee,
  open,
  onOpenChange,
  onEmployeeUpdated,
}: EmployeeEditModalProps) {
  const [endOfContract, setEndOfContract] = React.useState("");
  const [selectedReason, setSelectedReason] = React.useState<string>("");
  const [confirmExit, setConfirmExit] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [transferModalOpen, setTransferModalOpen] = React.useState(false);

  // Load existing edits when employee changes
  React.useEffect(() => {
    if (employee) {
      const edit = getEmployeeEdit(employee.name || "");
      setEndOfContract(
        edit?.endOfContract
          ? toInputDate(edit.endOfContract)
          : toInputDate(employee.validUntil),
      );
      setSelectedReason("");
      setConfirmExit(false);
      setSaved(false);
    }
  }, [employee]);

  if (!open || !employee) return null;

  const handleSaveContract = () => {
    if (employee.name && endOfContract) {
      updateEmployeeEdit(employee.name, { endOfContract });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onEmployeeUpdated?.();
    }
  };

  const handleExitEmployee = () => {
    if (!employee.name || !selectedReason) return;
    updateEmployeeEdit(employee.name, {
      exitReason: selectedReason as EmployeeEdit["exitReason"],
      exitDate: new Date().toISOString(),
      isDeparted: true,
    });
    setConfirmExit(false);
    onOpenChange(false);
    onEmployeeUpdated?.();
  };

  const existingEdit = getEmployeeEdit(employee.name || "");
  const isAlreadyDeparted = existingEdit?.isDeparted;

  const getLicenseStatusColor = (validUntil?: any) => {
    if (!validUntil) return "bg-gray-100 text-gray-800";
    const expireDate = new Date(validUntil);
    const today = new Date();
    const days = Math.floor(
      (expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days < 0) return "bg-red-100 text-red-800";
    if (days < 30) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const daysUntilExpiry = (() => {
    const date = endOfContract || employee.validUntil;
    if (!date) return null;
    const d = new Date(date);
    return Math.floor(
      (d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-popover p-0 shadow-2xl ring-1 ring-foreground/10 mx-4">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-popover px-6 py-4 rounded-t-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold truncate">
                {employee.name || "Unknown"}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {employee.designation || "No designation"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Departure Banner */}
          {isAlreadyDeparted && existingEdit?.exitReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-sm font-medium text-red-800">
                  Employee has exited — {existingEdit.exitReason}
                  {existingEdit.exitDate &&
                    ` on ${formatDate(existingEdit.exitDate)}`}
                </p>
              </div>
            </div>
          )}

          {/* Personal Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium text-sm">{employee.phone || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">ID Number</p>
                <p className="font-medium text-sm">{employee.idNo || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">
                  County / Sub-County
                </p>
                <p className="font-medium text-sm">
                  {employee.county || "-"}{" "}
                  {employee.subCounty ? `/ ${employee.subCounty}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Station</p>
                <p className="font-medium text-sm">{employee.station || "-"}</p>
              </div>
            </div>
          </div>

          {/* Education & Age */}
          <div className="grid gap-4 md:grid-cols-2">
            {employee.educationLevel && (
              <div>
                <p className="text-xs text-muted-foreground">Education Level</p>
                <p className="font-medium text-sm">{employee.educationLevel}</p>
              </div>
            )}
            {employee.age && (
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-medium text-sm">{employee.age} years</p>
              </div>
            )}
          </div>

          {/* License & Compliance Section */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              License & Contract
            </h4>

            {employee.regulatoryBody && (
              <div>
                <p className="text-xs text-muted-foreground">Regulatory Body</p>
                <p className="font-medium text-sm">{employee.regulatoryBody}</p>
              </div>
            )}

            {employee.practiseeLicence && (
              <div>
                <p className="text-xs text-muted-foreground">License Number</p>
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono inline-block mt-1">
                  {employee.practiseeLicence}
                </code>
              </div>
            )}

            {/* End of Contract / Valid Until */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                End of Contract / License Valid Until
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    value={endOfContract}
                    onChange={(e) => setEndOfContract(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {daysUntilExpiry !== null && (
                  <Badge
                    className={getLicenseStatusColor(
                      endOfContract || employee.validUntil,
                    )}
                  >
                    {daysUntilExpiry < 0
                      ? `Expired ${Math.abs(daysUntilExpiry)}d ago`
                      : daysUntilExpiry < 30
                        ? `Expires in ${daysUntilExpiry}d`
                        : `${daysUntilExpiry}d remaining`}
                  </Badge>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveContract}
                  disabled={!endOfContract}
                >
                  {saved ? "✓ Saved!" : "Save Contract Date"}
                </Button>
                {existingEdit?.endOfContract &&
                  existingEdit.endOfContract !==
                    toInputDate(employee.validUntil) && (
                    <p className="text-xs text-muted-foreground">
                      Previously edited:{" "}
                      {formatDate(existingEdit.endOfContract)}
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Transfer Button */}
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-700">
                  <ArrowLeftRight className="h-4 w-4" />
                  Transfer Employee
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Move this employee to a different county or facility
                </p>
              </div>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 gap-1.5"
                onClick={() => {
                  setTransferModalOpen(true);
                }}
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                Transfer
              </Button>
            </div>
          </div>

          {/* Exit Employee Section */}
          {!isAlreadyDeparted && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Exit Employee from Organization
              </h4>

              {!confirmExit ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    Select the reason for this employee&apos;s departure:
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {exitReasons.map((reason) => {
                      const Icon = reason.icon;
                      return (
                        <button
                          key={reason.value}
                          onClick={() => {
                            setSelectedReason(reason.value);
                            setConfirmExit(true);
                          }}
                          className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm font-medium transition-all ${reason.bg}`}
                        >
                          <Icon className={`h-5 w-5 ${reason.color}`} />
                          <span>{reason.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border border-red-300 bg-white p-3">
                    <p className="text-sm font-medium text-red-800">
                      Confirm exit: <strong>{employee.name}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reason:{" "}
                      {
                        exitReasons.find((r) => r.value === selectedReason)
                          ?.label
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This will mark the employee as departed effective today (
                      {new Date().toLocaleDateString()})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleExitEmployee}
                      className="gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Confirm Exit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedReason("");
                        setConfirmExit(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      <TransferModal
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
        onSuccess={() => {}}
        preselectedEmployee={
          employee
            ? {
                name: employee.name,
                county: employee.county,
                station: employee.station,
                designation: employee.designation,
              }
            : undefined
        }
      />
    </div>
  );
}
