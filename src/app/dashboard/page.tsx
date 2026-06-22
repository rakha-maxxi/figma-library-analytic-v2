import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardIndex() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }
  redirect("/dashboard/overview");
}
