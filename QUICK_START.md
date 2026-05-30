# 🚀 تشغيل WanSni محلياً

## الخطوات:

### 1️⃣ تثبيت المكتبات:
```bash
pnpm install
```

إذا لم يكن لديك `pnpm`:
```bash
npm install -g pnpm
pnpm install
```

أو استخدم `npm`:
```bash
npm install
```

### 2️⃣ تشغيل السيرفر:
```bash
pnpm dev
```

أو:
```bash
npm run dev
```

### 3️⃣ فتح المتصفح:
افتح: `http://localhost:5173`

---

## ملاحظات:

- **Node.js** يجب أن يكون مثبت (الإصدار 18 أو أحدث)
- **الأصوات**: ملفات MP3 موجودة في `public/sounds/`
- **Firebase**: متصل بقاعدة البيانات مباشرة
- **الأيقونات**: موجودة في `public/`

---

## إذا واجهت مشاكل:

### مشكلة: `pnpm: command not found`
**الحل:**
```bash
npm install -g pnpm
```

### مشكلة: `ENOENT: no such file or directory`
**الحل:** تأكد أنك في مجلد المشروع:
```bash
cd Wansni
pnpm install
pnpm dev
```

### مشكلة: Port 5173 مستخدم
**الحل:** Vite سيختار port آخر تلقائياً (مثل 5174)

---

## 🎮 الاستخدام:

1. **إنشاء قعدة كأدمن**: أدخل اسمك واختر نقاط الفوز
2. **دخول القعدة**: أدخل رقم القعدة (الكود)
3. **اللعب**: استمتع! 🇰🇼

---

© 2026 WanSni - لعبة القعدة الكويتية
