# ⛩ Manga Peario

موقع قراءة مانجا مبني بـ Next.js يسحب البيانات من [lekmanga.net](https://lekmanga.net/)

## المميزات
- 📚 الصفحة الرئيسية - أحدث التحديثات
- 🔎 البحث عن مانجا
- 📖 صفحة تفاصيل المانجا (غلاف، مؤلف، حالة، وصف، فصول)
- 📄 قارئ الفصول (عمودي / أفقي)
- 🌙 وضع ليلي / نهاري

## 🚀 النشر على Vercel عبر GitHub

### الخطوة 1: رفع المشروع على GitHub
```bash
cd manga-peario
git init
git add .
git commit -m "Initial commit - Manga Peario"
git branch -M main
git remote add origin https://github.com/USERNAME/manga-peario.git
git push -u origin main
```

### الخطوة 2: ربط Vercel بـ GitHub
1. اذهب إلى [vercel.com](https://vercel.com) وسجل دخول
2. اضغط **Add New Project**
3. اختر **Import Git Repository**
4. اختر مستودع `manga-peario`
5. اضغط **Deploy** - سينتهي في دقيقة!

### الخطوة 3: ✅ تم!
سيحصل موقعك على رابط مثل: `https://manga-peario.vercel.app`

## تشغيل محلياً
```bash
npm install
npm run dev
# افتح http://localhost:3000
```

## API Endpoints
| Endpoint | الوصف |
|----------|-------|
| `GET /api/latest?page=1` | أحدث التحديثات |
| `GET /api/search?q=ناروتو` | البحث |
| `GET /api/manga?url=URL` | تفاصيل مانجا |
| `GET /api/chapter?url=URL` | صور الفصل |
