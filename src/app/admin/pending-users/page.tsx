// WHY: Admin page to review and approve registration requests
// WHAT: List pending users; approve or reject

import {
  listPendingUsers,
  approvePendingUser,
  rejectPendingUser,
} from "@/app/actions/userActions";
import { PendingUserRow } from "@/components/admin/PendingUserRow";

export const dynamic = "force-dynamic";

export default async function PendingUsersPage() {
  const pending = await listPendingUsers();

  async function approveAction(id: string) {
    "use server";
    return await approvePendingUser(id);
  }

  async function rejectAction(id: string) {
    "use server";
    return await rejectPendingUser(id);
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Pending User Registrations</h1>

      {pending.length === 0 ? (
        <p className="text-sm text-gray-500">No pending requests.</p>
      ) : (
        <div className="overflow-x-auto rounded border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Reason</th>
                <th className="p-2">Requested</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((req) => (
                <PendingUserRow
                  key={req.id}
                  request={req}
                  onApprove={approveAction}
                  onReject={rejectAction}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
