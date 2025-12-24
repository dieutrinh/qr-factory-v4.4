# QR Factory v4.4 (Repo skeleton)

Mục tiêu: lấy code v4.3 của bạn, merge các module v4.4:
- Auto-create runtime folders (runtime/data|imports|exports|templates|logs)
- Excel import/export ổn định + lỗi có tọa độ
- QR login/out không dính 127.0.0.1 (publicBaseUrl)
- Workflow GitHub Actions build & release

## Quick start (dev)
```bash
npm ci
npm start
```

## Build (local)
```bash
npm run dist
```

## Release (GitHub)
- Tạo tag: `v4.4.0` rồi push tag lên GitHub
- Workflow sẽ build Windows/Mac/Linux và đính artifacts vào release

## Merge từ v4.3
- Copy toàn bộ UI/HTML/CSS/JS (folder `www/` + các html root) từ repo v4.3 của bạn sang repo này.
- Merge logic ở `main.js` (đừng phá routing/UI).
- Thay các điểm export/import Excel gọi vào `src/excel/*`.
- Thay QR URL generator gọi `src/qr/qr-generator.js`.
