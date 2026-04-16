import type { Metadata } from "next";

import { AdminCms } from "@/components/admin/AdminCms";
import { requireAdminOrNotFound } from "@/lib/auth/guard";
import { getPortfolioContent } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Private Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminOrNotFound();
  const content = await getPortfolioContent();

  return <AdminCms initialContent={content} />;
}
