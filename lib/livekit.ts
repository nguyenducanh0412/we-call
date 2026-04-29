import { AccessToken } from "livekit-server-sdk";

export async function generateLiveKitToken(
  roomCode: string,
  userId: string,
  userName: string,
  userAvatar: string | null
): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit credentials not configured");
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: userId,
    name: userName,
    metadata: JSON.stringify({ avatar: userAvatar }),
    ttl: "4h",
  });

  token.addGrant({
    roomJoin: true,
    room: roomCode,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return token.toJwt();
}
