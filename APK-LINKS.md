# Milo APKs — build #24 (versionCode 124 / 1.0.124)

Release page: https://github.com/milpardi40-netizen/App/releases/tag/milo-requested-24

این بیلد از `main` در کامیت `50e0e79` ساخته شده است و محتوایش همان بازنویسی کامل دورۀ روسی است: **Pre-A1** (۲۸ گام، ۲۲۴ خطِ گفت‌وگو، همۀ چک‌ها بازنشانی شد: `ru-pre-a1-a1-content-9`) و **A1** (۵۶ درس، ۴۴۸ خط، ۰ خطِ درجۀبهدست‌مانده، تکیه‌گذاری روی ۹۸٪ خط‌ها). مقایسۀ خط‌به‌خطِ پیش‌ازاین/اکنون در `docs/reports/a1-bands-before-after.md` و پیش‌نمایش مستقلِ همان چیزی که یادگیرنده می‌بیند در `docs/reports/a1-preview.html` است (بدون دارایی بیرونی، با `file://` باز می‌شود).

| فایل | زبان‌ها | ورود | حجم | لینک مستقیم |
|---|---|---|---|---|
| `5update.apk` | en, fr, tr, es, de | ندارد | ۳۶٫۹ MB | https://github.com/milpardi40-netizen/App/releases/download/milo-requested-24/5update.apk |
| `2update.apk` | en, ru | ندارد | ۳۶٫۹ MB | https://github.com/milpardi40-netizen/App/releases/download/milo-requested-24/2update.apk |
| `english.apk` | en | ندارد | ۳۶٫۹ MB | https://github.com/milpardi40-netizen/App/releases/download/milo-requested-24/english.apk |
| `login.5update.apk` | en, de, fr, tr, es | دارد | ۳۶٫۹ MB | https://github.com/milpardi40-netizen/App/releases/download/milo-requested-24/login.5update.apk |
| `login.2update.apk` | en, ru | دارد | ۳۶٫۹ MB | https://github.com/milpardi40-netizen/App/releases/download/milo-requested-24/login.2update.apk |
| `AdminApp.apk` | en, tr (پنل مدیریت) | — | ۳۶٫۷ MB | https://github.com/milpardi40-netizen/App/releases/download/milo-requested-24/AdminApp.apk |
| `AdminApp-web.zip` | پنل مدیریت وب | — | ۸٫۲ MB | https://github.com/milpardi40-netizen/App/releases/download/milo-requested-24/AdminApp-web.zip |

## SHA-256

این مقادیر از متادیتای خودِ ریلیز (فیلد `digest` هر asset) خوانده شده‌اند، نه از فایل محلی — `curl` روی asset‌ها در این محیط به `release-assets.githubusercontent.com` می‌رسد که دسترسی بیرونی‌اش بسته است، پس فایل‌ها داخل سندباکس دانلود و محلی هاش نشدند.

```
2update.apk        a8772b6ccc201819e9de0f2e3c2dceeeb3a5c5da1173b0302312d77e3803191e
5update.apk        b5d1de724f0a29a4a0fb415a6bb24405c2b9e31f301d907527d0a506c245a6c0
english.apk        e71c57248cc1da30a0fbcbfaddd801fc1bb2c99495d37d1401f5875a8a6e1efc
login.2update.apk  a673ba3358272c8a8750e3a7a410f52b37c6173e744fcb4688ccf4b373a73d7c
login.5update.apk  84c3cab286e29e6ff112573b84207a04542ff9f3450bc2245721102fdc1ed97a
AdminApp.apk       2d81ca9b499224f9f356796fe364eaf470b2adedcf96607c29962ffbc25d1409
AdminApp-web.zip   d9375b08e4e81e6559be887f960c1c5b68b4dd2a7b2d3152fedfb03cd89fe4f6
```

کنار هر فایل، `<name>.sha256` هم روی همان ریلیز است (مثلاً `2update.apk.sha256`).

## یادداشت

- `versionCode` در CI برابر `100 + شمارهٔ ریلیز` است، پس این بیلد **۱۲۴** است؛ در پنل مدیریت (Admin App → به‌روزرسانی اپ‌ها) همان عدد را وارد کنید.
- **رکوردهای به‌روزرسانی درون‌اپ خودکار نوشته نشد** («In-app release records: not registered automatically» در متن ریلیز): secret مربوطه در این اجرا فعال نبود. یعنی گوشی‌ها خودکار این بیلد را پیشنهاد نمی‌گیرند؛ برای فعال‌شدنش URLِ همان APK و شمارۀ ۱۲۴ را از پنل مدیریت منتشر کنید.
- برخلاف بیلدهای ۵۱ تا ۱۳۰، این بیلد **دو ABI** دارد: `arm64-v8a` و `armeabi-v7a` (به همین دلیل روی گوشی‌های ۳۲‌بیتی هم نصب می‌شود و حجم به ۳۶٫۹ MB رسیده).
- `minSdk` 24 است و امضای همهٔ APKها یک گواهی است: SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c` — پس نصب روی نسخۀ قبلی بدون حذف برنامه بررسی شده (جدول «Android upgrade checks» در متن ریلیز: ۱۲۳ → ۱۲۴ و ۱۲۲ → ۱۲۴ پاس).
- دورۀ روسی (Pre-A1 و A1) در `2update.apk` و `login.2update.apk` است؛ در `5update.apk` و `login.5update.apk` روسی نیست (دامنۀ زبان‌ها در CI).
- ساختار حجم `5update.apk` (از متن ریلیز): JS bundle ۱۵٫۶ MB · res ۶٫۹ MB · lib/arm64 ۴٫۴ MB · classes.dex ۴٫۴ MB · lib/armeabi ۳٫۹ MB · resources.arsc ۱٫۳ MB.
- برای اطمینان از اینکه APK همین محتوا را دارد: درخت `main` با کامیت راستی‌آزمایى‌شده یکی است (`git diff 9c7412a origin/main -- lib docs` خالی) و همهٔ گیت‌ها روی همان درخت پاس شدند: `tsc --noEmit` پاک، `verify-russian-course` ۹۵ بررسی پاس (۱۸۰۸ جمله)، `verify-russian-redesign` PASS، `verify-russian-studio` ×۲ PASS، `validate:content` PASS، و باندل وب سرو‌شده ۴۴۸/۴۴۸ خط نو را داشت.
