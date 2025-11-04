"use client";

// WHY: Admin UI row to approve or reject pending user
// WHAT: Display request details; actions call server and show toasts

import { useState } from "react";
import { toast } from "sonner";

type Request = {
  id: string;
  name: string;
  email: string;
  reason?: string | null;
  createdAt: Date;
};

export function PendingUserRow({
  request,
  onApprove,
  onReject,
}: {
  request: Request;
  onApprove: (id: string) => Promise<{ success?: string; error?: string }>;
  onReject: (id: string) => Promise<{ success?: string; error?: string }>;
}) {
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    if (processing) return;
    setProcessing(true);
    const res = await onApprove(request.id);
    if (res.error) toast.error(res.error);
    else toast.success(res.success || "Approved");
    setProcessing(false);
  };

  const handleReject = async () => {
    if (processing) return;
    if (!confirm(`Reject registration for ${request.email}?`)) return;
    setProcessing(true);
    const res = await onReject(request.id);
    if (res.error) toast.error(res.error);
    else toast.success(res.success || "Rejected");
    setProcessing(false);
  };

  const cell = "p-2";
  const approve =
    "rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700";
  const reject =
    "rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700";

  return (
    <tr className="border-t">
      <td className={cell}>{request.name}</td>
      <td className={cell}>{request.email}</td>
      <td className={cell}>{request.reason || "—"}</td>
      <td className={cell}>
        {new Date(request.createdAt).toLocaleDateString()}
      </td>
      <td className={`${cell} text-right`}>
        <button
          className={approve}
          onClick={handleApprove}
          disabled={processing}
        >
          Approve
        </button>
        <button
          className={`${reject} ml-2`}
          onClick={handleReject}
          disabled={processing}
        >
          Reject
        </button>
      </td>
    </tr>
  );
}
