import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <Dashboard user={session.user} />;
}
