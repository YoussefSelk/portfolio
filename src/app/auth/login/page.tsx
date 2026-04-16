import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAuthenticatedAdminFromCookies } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const authenticatedUser = await getAuthenticatedAdminFromCookies();

  if (authenticatedUser) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0b0d] px-4 py-12">
      <div className="w-full max-w-md">
        <AdminLoginForm />
      </div>
    </main>
  );
}
