import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/ProfileForm";

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
      <div className="rounded border bg-white p-6 shadow-sm">
        <ProfileForm user={user} />
      </div>
    </main>
  );
}
