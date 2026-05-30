# 🚀 دليل النشر - ونّسني

## 📋 المتطلبات

- Node.js 18+
- pnpm (مدير الحزم)
- Firebase Project (موجود مسبقاً)

## 🔧 الإعداد

### 1. تثبيت الحزم
```bash
pnpm install
```

### 2. البناء للإنتاج
```bash
pnpm build
```

سيتم إنشاء مجلد `dist/` يحتوي على الملفات الجاهزة للنشر.

## 🌐 النشر

### خيار 1: Vercel (مُوصى به)

1. قم بتثبيت Vercel CLI:
```bash
pnpm add -g vercel
```

2. قم بالنشر:
```bash
vercel
```

3. اتبع التعليمات لربط المشروع

### خيار 2: Netlify

1. قم بتثبيت Netlify CLI:
```bash
pnpm add -g netlify-cli
```

2. قم بالنشر:
```bash
netlify deploy --prod
```

### خيار 3: Firebase Hosting

1. قم بتثبيت Firebase CLI:
```bash
pnpm add -g firebase-tools
```

2. سجل الدخول:
```bash
firebase login
```

3. ابدأ المشروع:
```bash
firebase init hosting
```

4. اختر:
   - Build directory: `dist`
   - Single-page app: Yes
   - Rewrites: Yes

5. قم بالنشر:
```bash
firebase deploy
```

## 🔄 التحديثات التلقائية

### كيف تعمل؟

عند نشر نسخة جديدة:
1. Service Worker يكتشف التحديث تلقائياً
2. يظهر إشعار للمستخدمين: "تحديث جديد متوفر!"
3. المستخدم يضغط "تحديث الآن"
4. التطبيق يُحمّل النسخة الجديدة فوراً

### فحص التحديثات

Service Worker يفحص التحديثات:
- كل 60 ثانية تلقائياً
- عند فتح التطبيق
- عند الضغط على زر 🔄

## 📱 تثبيت التطبيق

### على الموبايل (iOS)
1. افتح الرابط في Safari
2. اضغط على زر المشاركة
3. اختر "Add to Home Screen"

### على الموبايل (Android)
1. افتح الرابط في Chrome
2. ستظهر رسالة "Add to Home screen"
3. اضغط "Install"

### على الكمبيوتر (Chrome)
1. افتح الرابط في Chrome
2. اضغط على أيقونة التثبيت في شريط العنوان
3. اختر "Install"

## 🔗 الروابط

### الرابط الأساسي
```
https://your-domain.com/wansni
```

### رابط الانضمام بـ QR
```
https://your-domain.com/wansni?room=1234
```

## 🎯 ملاحظات مهمة

### الأيقونات
- تأكد من وجود `icon-192.png` و `icon-512.png` في مجلد `public/`
- الأيقونات يجب أن تكون مربعة (1:1 ratio)

### Firebase Configuration
- تأكد من تحديث بيانات Firebase في `src/app/App.tsx`
- البيانات الحالية تشير إلى مشروع "wansni"

### HTTPS
- **مهم جداً**: PWA يعمل فقط على HTTPS
- استخدم خدمة استضافة توفر HTTPS مجاناً (Vercel, Netlify, Firebase)
- localhost يعمل بدون HTTPS للتطوير فقط

## 🐛 استكشاف الأخطاء

### التحديثات لا تعمل؟
1. تحقق من Console في المتصفح
2. افتح DevTools → Application → Service Workers
3. تحقق من أن SW مُسجل بنجاح

### التطبيق لا يعمل أوفلاين؟
1. تحقق من Cache Storage في DevTools
2. تأكد من وجود `wansni-cache`

### الأيقونات لا تظهر؟
1. تحقق من مسار الأيقونات في `manifest.json`
2. تحقق من أن الأيقونات موجودة في `public/`
3. امسح الـ cache وأعد التحميل

## 📊 المراقبة

راقب:
- عدد المستخدمين النشطين
- معدل التحديث
- الأخطاء في Firebase Console

---

تم ✅ جميع الميزات جاهزة للنشر!
