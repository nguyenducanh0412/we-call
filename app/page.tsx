import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Welcome to WebCall</h1>
        <p className="text-zinc-400 mb-8">
          Logged in as {session.user.name}
        </p>
        <div className="bg-zinc-900 rounded-lg p-6">
          <p className="text-zinc-300">
            Dashboard coming in Phase 2...
          </p>
        </div>
      </div>
    </div>
  );
}
