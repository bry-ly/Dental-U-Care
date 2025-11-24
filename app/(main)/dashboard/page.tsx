import { auth } from "@/lib/auth-session/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const role = session.user.role;

  if (role === "admin") {
    redirect("/dashboard/admin");
  } else if (role === "dentist") {
    redirect("/dashboard/dentist");
  } else {
    // Default to patient dashboard for "patient" role, "user" role, or any other role
    redirect("/dashboard/patient");
  }
}
