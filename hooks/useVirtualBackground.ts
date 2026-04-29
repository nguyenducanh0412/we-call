import { useState, useCallback, useRef, useEffect } from "react";
import {
  BackgroundProcessor,
  supportsBackgroundProcessors,
} from "@livekit/track-processors";
import { LocalVideoTrack } from "livekit-client";

export type BackgroundMode =
  | { type: "none" }
  | { type: "blur"; radius?: number }
  | { type: "image"; url: string };

export interface VirtualBackgroundState {
  currentMode: BackgroundMode;
  isSupported: boolean;
  isApplying: boolean;
  applyBackground: (mode: BackgroundMode, track: LocalVideoTrack) => Promise<void>;
  removeBackground: (track: LocalVideoTrack) => Promise<void>;
}

const STORAGE_KEY = "webcall-bg-preference";

export function useVirtualBackground(): VirtualBackgroundState {
  const [currentMode, setCurrentMode] = useState<BackgroundMode>(() => {
    // Load saved preference on init
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved) as BackgroundMode;
        }
      } catch (error) {
        console.error("Failed to load background preference:", error);
      }
    }
    return { type: "none" };
  });
  const [isApplying, setIsApplying] = useState(false);
  const processorRef = useRef<ReturnType<typeof BackgroundProcessor> | null>(null);
  const isSupported = supportsBackgroundProcessors();

  // Save preference to localStorage whenever currentMode changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentMode));
      } catch (error) {
        console.error("Failed to save background preference:", error);
      }
    }
  }, [currentMode]);

  const applyBackground = useCallback(
    async (mode: BackgroundMode, track: LocalVideoTrack) => {
      if (!isSupported) return;
      setIsApplying(true);
      try {
        // Nếu chưa có processor, tạo mới
        if (!processorRef.current) {
          const processor = BackgroundProcessor({ mode: "disabled" });
          await track.setProcessor(processor);
          processorRef.current = processor;
        }

        // Switch sang mode mới
        if (mode.type === "none") {
          await processorRef.current.switchTo({ mode: "disabled" });
        } else if (mode.type === "blur") {
          await processorRef.current.switchTo({
            mode: "background-blur",
            blurRadius: mode.radius ?? 15,
          });
        } else if (mode.type === "image") {
          await processorRef.current.switchTo({
            mode: "virtual-background",
            imagePath: mode.url,
          });
        }

        setCurrentMode(mode);
      } catch (error) {
        console.error("Failed to apply background:", error);
      } finally {
        setIsApplying(false);
      }
    },
    [isSupported]
  );

  const removeBackground = useCallback(async (track: LocalVideoTrack) => {
    if (processorRef.current) {
      await track.stopProcessor();
      processorRef.current = null;
    }
    setCurrentMode({ type: "none" });
  }, []);

  return { currentMode, isSupported, isApplying, applyBackground, removeBackground };
}
