// WHY: User registration page with admin approval flow
// WHAT: Form to request account creation; admin must approve before user can sign in

import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="mb-2 text-3xl font-bold">Register</h1>
      <p className="mb-6 text-sm text-gray-600">
        Request an account. An admin will review and approve your request.
      </p>
      <RegisterForm />
    </main>
  );
}
