# Phase 6 — Virtual Background & Background Blur

> Paste into GitHub Copilot Agent (Agent mode) hoặc tạo GitHub Issue assign cho Copilot.
> Prerequisites: Phase 1-5 complete, LiveKit call UI đang hoạt động.

---

## Task
Thêm tính năng Virtual Background và Background Blur vào WebCall,
sử dụng `@livekit/track-processors` — chạy hoàn toàn trong browser qua WebAssembly,
không cần API bên ngoài.

---

## Step 1 — Install dependency

```bash
npm install @livekit/track-processors
```

---

## Step 2 — Chuẩn bị background images

Tạo thư mục `public/backgrounds/` và thêm 6 ảnh background mặc định:

```
public/
  backgrounds/
    bg-office.jpg        ← văn phòng hiện đại
    bg-library.jpg       ← thư viện
    bg-nature.jpg        ← thiên nhiên / rừng
    bg-city.jpg          ← thành phố ban đêm
    bg-beach.jpg         ← bãi biển
    bg-abstract.jpg      ← abstract gradient
```

Dùng ảnh free từ Unsplash (thêm script download hoặc dùng placeholder URL).
Tạo file `scripts/download-backgrounds.sh`:
```bash
#!/bin/bash
mkdir -p public/backgrounds
curl -L "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1280&q=80" -o public/backgrounds/bg-office.jpg
curl -L "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1280&q=80" -o public/backgrounds/bg-library.jpg
curl -L "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1280&q=80" -o public/backgrounds/bg-nature.jpg
curl -L "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1280&q=80" -o public/backgrounds/bg-city.jpg
curl -L "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280&q=80" -o public/backgrounds/bg-beach.jpg
curl -L "https://images.unsplash.com/photo-1557683316-973673baf926?w=1280&q=80" -o public/backgrounds/bg-abstract.jpg
echo "✅ Backgrounds downloaded"
```

---

## Step 3 — Hook: useVirtualBackground

Tạo `hooks/useVirtualBackground.ts`:

```ts
import { useState, useCallback, useRef } from "react";
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

export function useVirtualBackground(): VirtualBackgroundState {
  const [currentMode, setCurrentMode] = useState<BackgroundMode>({ type: "none" });
  const [isApplying, setIsApplying] = useState(false);
  const processorRef = useRef<ReturnType<typeof BackgroundProcessor> | null>(null);
  const isSupported = supportsBackgroundProcessors();

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
```

---

## Step 4 — Component: BackgroundPicker

Tạo `components/room/BackgroundPicker.tsx` (client component):

Layout — Popover hiện lên khi click button "Background":

```
┌─────────────────────────────────┐
│ 🎨 Virtual Background      [X]  │  ← header
├─────────────────────────────────┤
│ [None]  [Blur]  [Blur+]         │  ← quick options row
├─────────────────────────────────┤
│  Custom Backgrounds             │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │office│ │library│ │nature│   │  ← thumbnail grid 3 cols
│  └──────┘ └──────┘ └──────┘   │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ city │ │beach │ │abstr.│   │
│  └──────┘ └──────┘ └──────┘   │
├─────────────────────────────────┤
│ [+ Upload your own image]       │  ← file upload button
└─────────────────────────────────┘
```

Backgrounds config (hardcode trong component):
```ts
const PRESET_BACKGROUNDS = [
  { id: "office",   label: "Office",   url: "/backgrounds/bg-office.jpg" },
  { id: "library",  label: "Library",  url: "/backgrounds/bg-library.jpg" },
  { id: "nature",   label: "Nature",   url: "/backgrounds/bg-nature.jpg" },
  { id: "city",     label: "City",     url: "/backgrounds/bg-city.jpg" },
  { id: "beach",    label: "Beach",    url: "/backgrounds/bg-beach.jpg" },
  { id: "abstract", label: "Abstract", url: "/backgrounds/bg-abstract.jpg" },
];
```

Behavior:
- **None**: gọi `removeBackground(track)`
- **Blur**: `applyBackground({ type: "blur", radius: 10 }, track)`
- **Blur+**: `applyBackground({ type: "blur", radius: 25 }, track)`
- **Preset image**: `applyBackground({ type: "image", url }, track)`
- **Upload**: `<input type="file" accept="image/*">` → `URL.createObjectURL(file)` → apply
- Selected option: hiển thị `ring-2 ring-blue-500` border
- Đang apply: hiển thị spinner overlay trên thumbnail
- Nếu `!isSupported`: hiển thị message "Your browser doesn't support virtual backgrounds. Try Chrome or Edge."

Props:
```ts
interface BackgroundPickerProps {
  localVideoTrack: LocalVideoTrack | null;
  onClose: () => void;
}
```

---

## Step 5 — Tích hợp vào ControlBar

Cập nhật `components/room/ControlBar.tsx`:

1. Import và dùng `useVirtualBackground()` hook
2. Lấy `localVideoTrack` từ LiveKit:
```ts
import { useLocalParticipant } from "@livekit/components-react";

const { localParticipant } = useLocalParticipant();
const videoTrack = localParticipant
  .getTrackPublications()
  .find(p => p.kind === "video")
  ?.track as LocalVideoTrack | undefined;
```

3. Thêm button "Background" vào ControlBar (giữa Camera và Chat):
```tsx
// Icon: dùng lucide-react "Image" hoặc "Layers"
<Button
  variant="ghost"
  size="icon"
  className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700"
  onClick={() => setShowBgPicker(true)}
  aria-label="Virtual background"
  title="Virtual background"
>
  <Layers className="w-5 h-5" />
  {/* Dot indicator khi có background active */}
  {currentMode.type !== "none" && (
    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
  )}
</Button>
```

4. Render `BackgroundPicker` dưới dạng Popover hoặc Dialog khi `showBgPicker === true`

---

## Step 6 — Lưu preference vào localStorage

Trong `useVirtualBackground`, thêm persistence:
```ts
// Khi apply background thành công:
localStorage.setItem("webcall-bg-preference", JSON.stringify(mode));

// Khi init hook:
const saved = localStorage.getItem("webcall-bg-preference");
// Dùng để auto-apply khi user vào call lần sau
// (chỉ apply nếu track đã sẵn sàng)
```

---

## Step 7 — Hiển thị indicator trên participant tile

Cập nhật `components/room/ParticipantTile.tsx`:
- Thêm icon nhỏ "✨" hoặc badge "BG" ở góc tile khi participant local đang dùng background
- Chỉ hiện cho local participant (người dùng chính), không hiện cho remote

---

## Step 8 — Browser support check

Tạo `lib/backgroundSupport.ts`:
```ts
import {
  supportsBackgroundProcessors,
  supportsModernBackgroundProcessors,
} from "@livekit/track-processors";

export function getBackgroundSupportLevel(): "full" | "basic" | "none" {
  if (!supportsBackgroundProcessors()) return "none";
  if (supportsModernBackgroundProcessors()) return "full";
  return "basic";
}
```

Dùng trong `BackgroundPicker`:
- `"full"` → Chrome/Edge mới → chạy mượt
- `"basic"` → Firefox/Safari cũ → hiển thị warning nhẹ "Performance may be limited"
- `"none"` → disable toàn bộ tính năng, ẩn button Background

---

## Acceptance Criteria
- [ ] Button "Background" xuất hiện trong ControlBar
- [ ] Click button mở BackgroundPicker popover
- [ ] Chọn "Blur" → background camera bị blur, video vẫn rõ
- [ ] Chọn "Blur+" → blur mạnh hơn
- [ ] Chọn preset image → background thay bằng ảnh đó
- [ ] Chọn "None" → trả về camera gốc
- [ ] Upload ảnh tùy chỉnh → apply thành công
- [ ] Blue dot xuất hiện trên button khi có background active
- [ ] Preference được lưu, tự động apply khi vào call lần sau
- [ ] Browser không hỗ trợ → hiển thị thông báo rõ ràng, không crash
- [ ] Performance ổn định (không lag >200ms) khi switch giữa các mode
- [ ] Không có TypeScript errors