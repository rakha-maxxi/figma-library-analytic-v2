import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isDashboardPage } from "@/lib/dashboard";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { page } = await params;
  if (!isDashboardPage(page)) {
    notFound();
  }

  return <DashboardShell page={page} />;
}
