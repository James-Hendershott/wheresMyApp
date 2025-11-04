import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const user = session.user;
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-3xl font-bold">My Account</h1>
      <div className="rounded border bg-white p-4 shadow-sm">
        <dl className="grid grid-cols-3 gap-2 text-sm">
          <dt className="text-gray-500">Name</dt>
          <dd className="col-span-2">{user.name || "—"}</dd>
          <dt className="text-gray-500">Email</dt>
          <dd className="col-span-2">{user.email || "—"}</dd>
        </dl>
      </div>
    </main>
  );
}
