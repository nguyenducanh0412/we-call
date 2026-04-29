import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RoomNotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl text-white">
            Room not found
          </CardTitle>
          <CardDescription className="text-zinc-400">
            This room doesn't exist or has already ended
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
