import {
  supportsBackgroundProcessors,
} from "@livekit/track-processors";

export function getBackgroundSupportLevel(): "full" | "basic" | "none" {
  if (!supportsBackgroundProcessors()) return "none";
  // Note: supportsModernBackgroundProcessors is not available in current version
  // We'll use supportsBackgroundProcessors as the main check
  return "full";
}
