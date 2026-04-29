# 📞 WebCall — Copilot Agent Prompt Kit

Bộ prompt tách theo phase để dùng với **GitHub Copilot Agent mode**.

---

## 📁 Cấu trúc

```
webcall-copilot/
├── .github/
│   └── copilot-instructions.md   ← Global rules (tự động load bởi Copilot)
└── prompts/
    ├── phase-1-setup-auth.md           ← Setup dự án + DB + Google Login
    ├── phase-2-dashboard-room-api.md   ← Dashboard + Room API
    ├── phase-3-livekit-call.md         ← Call UI với LiveKit
    ├── phase-4-socket-chat-reactions.md ← Chat + Reactions realtime
    └── phase-5-host-controls-polish-deploy.md ← Host controls + Deploy
```

---

## 🚀 Cách dùng

### Bước 1 — Setup file global
Đặt file `.github/copilot-instructions.md` vào trong thư mục gốc của project.
Copilot Agent sẽ tự động đọc file này ở mỗi session — không cần paste lại.

### Bước 2 — Chạy từng phase theo thứ tự
Với mỗi phase:
1. Mở **VS Code** → **Copilot Chat** (icon chat ở sidebar)
2. Chuyển sang **Agent mode** (dropdown phía trên chat box)
3. Gõ: `@workspace` rồi **paste nội dung file prompt tương ứng**
4. Copilot sẽ tự tạo files, chạy lệnh, và hỏi nếu cần confirm

### Bước 3 — Kiểm tra Acceptance Criteria
Cuối mỗi phase prompt đều có checklist `[ ]`.
Verify thủ công trước khi chuyển sang phase tiếp theo.

---

## ⏱ Ước tính thời gian (với Copilot Agent)

| Phase | Nội dung | Thời gian ước tính |
|-------|----------|-------------------|
| 1 | Setup + Auth | 15–20 phút |
| 2 | Dashboard + API | 10–15 phút |
| 3 | LiveKit Call UI | 20–30 phút |
| 4 | Chat + Reactions | 20–25 phút |
| 5 | Host Controls + Deploy | 20–30 phút |
| **Total** | | **~90–120 phút** |

---

## ⚠️ Lưu ý quan trọng

- Luôn chạy **đúng thứ tự** Phase 1 → 5
- Sau Phase 1: test login thủ công trước khi đi tiếp
- Phase 3 cần **LiveKit account** (miễn phí tại livekit.io)
- Phase 4 cần chạy socket server song song: `npm run dev:all`
- Nếu Copilot hỏi "proceed?", luôn review diff trước khi confirm

---

## 🔑 Tài khoản cần tạo trước

- [ ] Google Cloud Console → OAuth 2.0 credentials
- [ ] LiveKit Cloud → free project
- [ ] Vercel account
- [ ] Railway account (socket server + PostgreSQL)
