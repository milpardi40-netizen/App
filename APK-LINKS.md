# Milo APKs — build #25 (versionCode 125 / 1.0.125)

Release page: https://github.com/milpardi40-netizen/App/releases/tag/milo-requested-25

این بیلد از `main` در کامیت `c0c84fe` ساخته شده است. محتوایش بازنویسی کامل باند **Pre-A1** روسی است: ۲۸ گام، **۲۵۲ خط** (شش خطِ گفتاری + خطِ پایانی + دو کارتِ خواندن در هر گام) که همۀ‌شان از الگوهایِ کنترل‌شده‌اند — «این X / این X نیست»، «من X می‌خواهم»، «X کجاست؟ → اینجاست/آنجاست»، پاسخ‌هایِ آماده و پنج فعلِ حالِ ساده؛ **صفر خطِ حرفِ اضافه**، **صفر برخورد با خط‌های A1**، ۱٫۸۱ واژه در خط و ۸۱٪ خط‌ها یک‌/دوواژه‌ای. باند **A1** (۵۶ درس، ۴۴۸ خط) دست‌نخورده است. همۀ چک‌های سطح بازنشانی شد: `ru-pre-a1-a1-content-11`. جدولِ خط‌به‌خطِ پیش‌ازاین/اکنون و سنجه‌ها در `docs/reports/prea1-band-before-after.md` است.

| فایل | زبان‌ها | ورود | حجم | لینک مستقیم |
|---|---|---|---|---|
| `5update.apk` | en, fr, tr, es, de | ندارد | ۳۶٫۹ MB | https://github.com/milpardi40-netizen/App/releases/download/milo-requested-25/5update.apk |
| `2update.apk` | en, ru | ندارد | ۳۶٫۹ MB | https://github.com/milpardi40-netizen/App/releases/download/milo-requested-25/2update.apk |
| `english.apk` | en | ندارد | ۳۶٫۹ MB | https://github.com/milpardi40-netizen/App/releases/download/milo-requested-25/english.apk |
| `login.5update.apk` | en, de, fr, tr, es | دارد | ۳۶٫۹ MB | https://github.com/milpardi40-netizen/App/releases/download/milo-requested-25/login.5update.apk |
| `login.2update.apk` | en, ru | دارد | ۳۶٫۹ MB | https://github.com/milpardi40-netizen/App/releases/download/milo-requested-25/login.2update.apk |
| `AdminApp.apk` | en, tr (پنل مدیریت) | — | ۳۶٫۸ MB | https://github.com/milpardi40-netizen/App/releases/download/milo-requested-25/AdminApp.apk |
| `AdminApp-web.zip` | پنل مدیریت وب | — | ۸٫۲ MB | https://github.com/milpardi40-netizen/App/releases/download/milo-requested-25/AdminApp-web.zip |

## SHA-256

این مقادیر از متادیتای خودِ ریلیز (فیلد `digest` هر asset) خوانده شده‌اند، نه از فایل محلی — `curl` روی asset‌ها در این محیط به `release-assets.githubusercontent.com` می‌رسد که دسترسی بیرونی‌اش بسته است، پس فایل‌ها داخل سندباکس دانلود و محلی هاش نشدند.

```
2update.apk        fe937d1b4dc1b7c7957f9abdd6f5b3ad2951f3c97eb8472ee7b42050fb62f78e
5update.apk        05446ecc671795faec52dae2d55a064629a0f5c1b75972b79b7168ea9eb9e821
english.apk        780b36bf5485314b766da1c47eb57fb7f86e51f807860173a618831b42efd0c1
login.2update.apk  8fb115c319f8d54bcd79c04cff38c34707caee1cb128148a35c5a41e5b13186c
login.5update.apk  b8be258e1b711ec12fbbb7002f9f6cbc7390cb7633672cceb4078c40e1fe3455
AdminApp.apk       459d3e2eb14e1e9c8d32b87996d338b1182d8a9258e0d40c77a5bd6644f43291
AdminApp-web.zip   ac6151910e1de399c90371917573f1a2bd655343d95b78c9622353e168892f7a
```

کنار هر فایل، `<name>.sha256` هم روی همان ریلیز است (مثلاً `2update.apk.sha256`).

## یادداشت

- `versionCode` در CI برابر `100 + شمارهٔ ریلیز` است، پس این بیلد **۱۲۵** است؛ در پنل مدیریت (Admin App → به‌روزرسانی اپ‌ها) همان عدد را وارد کنید.
- **رکوردهای به‌روزرسانی درون‌اپ خودکار نوشته نشد** («In-app release records: not registered automatically» در متن ریلیز): secret مربوطه در این اجرا فعال نبود. یعنی گوشی‌ها خودکار این بیلد را پیشنهاد نمی‌گیرند؛ برای فعال‌شدنش URLِ همان APK و شمارۀ ۱۲۵ را از پنل مدیریت منتشر کنید.
- مانند بیلد ‎#24، این بیلد **دو ABI** دارد: `arm64-v8a` و `armeabi-v7a` (به همین دلیل روی گوشی‌های ۳۲‌بیتی هم نصب می‌شود و حجم به ۳۶٫۹ MB رسیده).
- `minSdk` 24 است و امضای همهٔ APKها یک گواهی است: SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c` — پس نصب روی نسخۀ قبلی بدون حذف برنامه بررسی شده (جدول «Android upgrade checks» در متن ریلیز: ۱۲۴ → ۱۲۵ و ۱۲۳ → ۱۲۵ پاس، روی شبیه‌ساز Android API 30 با marker در دادهٔ خصوصیِ اپ).
- دورۀ روسی (Pre-A1 و A1) در `2update.apk` و `login.2update.apk` است؛ در `5update.apk` و `login.5update.apk` روسی نیست (دامنۀ زبان‌ها در CI).
- ساختار حجم `5update.apk` (از متن ریلیز): JS bundle ۱۵٫۶ MB · res ۶٫۹ MB · lib/arm64 ۴٫۴ MB · classes.dex ۴٫۴ MB · lib/armeabi ۳٫۹ MB · resources.arsc ۱٫۳ MB — یعنی محتوایِ تازهٔ Pre-A1 حجم باندلِ JS را تغییر نداده است.
- برای اطمینان از اینکه APK همین محتوا را دارد: `main` روی همین درخت همهٔ گیت‌ها را دید — `tsc --noEmit` پاک، `verify-russian-course` ۹۵ بررسی پاس (۱۸۰۸ جمله)، `verify-russian-redesign` PASS، `verify-russian-studio` PASS، `verify-lesson-gender` PASS (ru: 99 / en: 55)، ۲۹ از ۳۰ اسکریپت `validate:*` (فقط `validate:word-lab` که روی `b63d25f` هم قرمز بود) — و باندلِ وبِ سرو‌شده **۲۵۲/۲۵۲ خطِ نو** را داشت و هیچ جملهٔ قدیمیِ باند در آن نمانده بود.
- `verify-russian-browser.cjs` در این محیط اجرا نشد (Playwright نصب نیست) و پیش از این بازنویسی هم با برچسب‌هایِ UI هم‌زمان نبود؛ اگر دستی اجراش می‌کنی، انتظارِ خط‌هایِ گفت‌وگویش را با گام‌هایِ تازه هم‌خط کنم بگو.

بیلد قبلی: `milo-requested-24` (versionCode ۱۲۴) — https://github.com/milpardi40-netizen/App/releases/tag/milo-requested-24
