// WHY: Admin page to seed test accounts for development
// WHAT: Button to create or update test admin and user accounts

import { SeedAccountsButton } from "@/components/admin/SeedAccountsButton";

export default function SeedAccountsPage() {
  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="mb-4 text-3xl font-bold">Seed Test Accounts</h1>
      <p className="mb-4 text-sm text-gray-600">
        This will create or update test accounts with the following credentials:
      </p>
      <ul className="mb-6 list-inside list-disc text-sm text-gray-700">
        <li>Admin: admin@test.local</li>
        <li>User: user@test.local</li>
      </ul>
      <SeedAccountsButton />
    </main>
  );
}
