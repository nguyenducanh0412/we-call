"use client";

import { useState, useRef } from "react";
import { LocalVideoTrack } from "livekit-client";
import { X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackgroundMode } from "@/hooks/useVirtualBackground";
import { getBackgroundSupportLevel } from "@/lib/backgroundSupport";

const PRESET_BACKGROUNDS = [
  { id: "office", label: "Office", url: "/backgrounds/bg-office.jpg" },
  { id: "library", label: "Library", url: "/backgrounds/bg-library.jpg" },
  { id: "nature", label: "Nature", url: "/backgrounds/bg-nature.jpg" },
  { id: "city", label: "City", url: "/backgrounds/bg-city.jpg" },
  { id: "beach", label: "Beach", url: "/backgrounds/bg-beach.jpg" },
  { id: "abstract", label: "Abstract", url: "/backgrounds/bg-abstract.jpg" },
];

interface BackgroundPickerProps {
  localVideoTrack: LocalVideoTrack | null;
  currentMode: BackgroundMode;
  isApplying: boolean;
  onApply: (mode: BackgroundMode) => void;
  onRemove: () => void;
  onClose: () => void;
}

export function BackgroundPicker({
  localVideoTrack,
  currentMode,
  isApplying,
  onApply,
  onRemove,
  onClose,
}: BackgroundPickerProps) {
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supportLevel = getBackgroundSupportLevel();

  if (supportLevel === "none") {
    return (
      <div className="w-80 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">🎨 Virtual Background</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-zinc-400">
          Your browser doesn&apos;t support virtual backgrounds. Try Chrome or Edge.
        </p>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setCustomImageUrl(url);
      onApply({ type: "image", url });
    }
  };

  const isSelected = (mode: BackgroundMode) => {
    if (mode.type === "none" && currentMode.type === "none") return true;
    if (mode.type === "blur" && currentMode.type === "blur") {
      return currentMode.radius === mode.radius;
    }
    if (mode.type === "image" && currentMode.type === "image") {
      return currentMode.url === mode.url;
    }
    return false;
  };

  return (
    <div className="w-96 p-4 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🎨 Virtual Background</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Options */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={isSelected({ type: "none" }) ? "default" : "outline"}
          size="sm"
          onClick={onRemove}
          disabled={isApplying || !localVideoTrack}
          className="flex-1"
        >
          None
        </Button>
        <Button
          variant={isSelected({ type: "blur", radius: 10 }) ? "default" : "outline"}
          size="sm"
          onClick={() => onApply({ type: "blur", radius: 10 })}
          disabled={isApplying || !localVideoTrack}
          className="flex-1"
        >
          Blur
        </Button>
        <Button
          variant={isSelected({ type: "blur", radius: 25 }) ? "default" : "outline"}
          size="sm"
          onClick={() => onApply({ type: "blur", radius: 25 })}
          disabled={isApplying || !localVideoTrack}
          className="flex-1"
        >
          Blur+
        </Button>
      </div>

      {/* Preset Backgrounds */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 text-zinc-300">Custom Backgrounds</h4>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onApply({ type: "image", url: bg.url })}
              disabled={isApplying || !localVideoTrack}
              className={`
                relative aspect-video rounded-md overflow-hidden border-2 transition-all
                ${
                  isSelected({ type: "image", url: bg.url })
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-zinc-600 hover:border-zinc-500"
                }
                ${isApplying || !localVideoTrack ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              aria-label={`Apply ${bg.label} background`}
            >
              <img
                src={bg.url}
                alt={bg.label}
                className="w-full h-full object-cover"
              />
              {isApplying && isSelected({ type: "image", url: bg.url }) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                <span className="text-xs text-white font-medium">{bg.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Image Upload */}
      {customImageUrl && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 text-zinc-300">Your Custom Image</h4>
          <button
            onClick={() => onApply({ type: "image", url: customImageUrl })}
            disabled={isApplying || !localVideoTrack}
            className={`
              relative w-full aspect-video rounded-md overflow-hidden border-2 transition-all
              ${
                isSelected({ type: "image", url: customImageUrl })
                  ? "border-blue-500 ring-2 ring-blue-500"
                  : "border-zinc-600 hover:border-zinc-500"
              }
            `}
          >
            <img
              src={customImageUrl}
              alt="Custom background"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      )}

      {/* Upload Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={isApplying || !localVideoTrack}
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload your own image
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Warning for basic support */}
      {supportLevel === "basic" && (
        <p className="text-xs text-yellow-500 mt-3">
          ⚠️ Performance may be limited on this browser
        </p>
      )}

      {/* No track warning */}
      {!localVideoTrack && (
        <p className="text-xs text-zinc-400 mt-3">
          Enable your camera to use virtual backgrounds
        </p>
      )}
    </div>
  );
}
