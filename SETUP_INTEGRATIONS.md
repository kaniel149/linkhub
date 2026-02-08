# מדריך הגדרת אינטגרציות - LinkHub

מדריך מלא להגדרת כל שירותי הצד השלישי עבור LinkHub.

---

## תוכן עניינים

1. [Google Calendar](#google-calendar)
2. [PayMe](#payme)
3. [LemonSqueezy](#lemonsqueezy)
4. [מיגרציית Supabase](#מיגרציית-supabase)
5. [סיכום משתני סביבה](#סיכום-משתני-סביבה)

---

## Google Calendar

הגדרת Google Calendar מאפשרת למשתמשים לאפשר לגולשים לקבוע פגישות ישירות מעמוד הפרופיל.

### שלב 1: יצירת פרויקט ב-Google Cloud

1. היכנסו ל-[Google Cloud Console](https://console.cloud.google.com)
2. לחצו על **Select a project** בראש העמוד, ואז **New Project**
3. תנו שם לפרויקט: `LinkHub`
4. לחצו **Create**

### שלב 2: הפעלת Google Calendar API

1. בתפריט הצד: **APIs & Services** > **Library**
2. חפשו `Google Calendar API`
3. לחצו על התוצאה ואז **Enable**

### שלב 3: הגדרת OAuth Consent Screen

1. בתפריט הצד: **APIs & Services** > **OAuth consent screen**
2. בחרו **External** ולחצו **Create**
3. מלאו:
   - **App name**: `LinkHub`
   - **User support email**: הכתובת שלכם
   - **Developer contact email**: הכתובת שלכם
4. לחצו **Save and Continue**
5. בעמוד **Scopes** לחצו **Add or Remove Scopes** והוסיפו:
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/calendar.readonly`
6. לחצו **Save and Continue**
7. בעמוד **Test users** הוסיפו את כתובת ה-Gmail שלכם (בשלב פיתוח)
8. לחצו **Save and Continue** > **Back to Dashboard**

### שלב 4: יצירת OAuth 2.0 Client ID

1. בתפריט הצד: **APIs & Services** > **Credentials**
2. לחצו **+ Create Credentials** > **OAuth client ID**
3. בחרו **Web application**
4. שם: `LinkHub Web Client`
5. תחת **Authorized redirect URIs** לחצו **+ Add URI** והוסיפו:
   ```
   https://linkhub-iota-red.vercel.app/api/integrations/google-calendar/callback
   ```
   (לפיתוח מקומי הוסיפו גם: `http://localhost:3000/api/integrations/google-calendar/callback`)
6. לחצו **Create**
7. העתיקו את ה-**Client ID** וה-**Client Secret**

### שלב 5: הגדרת משתני סביבה

הוסיפו ב-Vercel (או ב-`.env.local` לפיתוח מקומי):

```
GOOGLE_CALENDAR_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
```

---

## PayMe

PayMe הוא מעבד תשלומים ישראלי. ההגדרה מאפשרת למשתמשים לקבל תשלומים על שירותים ישירות מעמוד הפרופיל.

### שלב 1: הרשמה ל-PayMe

1. היכנסו ל-[PayMe](https://www.payme.io) ולחצו **הרשמה**
2. מלאו את פרטי העסק והשלימו את תהליך האימות

### שלב 2: קבלת Seller ID

1. לאחר ההרשמה, היכנסו ל-[לוח הבקרה של PayMe](https://ng.paymeservice.com/merchant)
2. ה-**Seller ID** מופיע בהגדרות החשבון (Settings) או ב-URL של לוח הבקרה
3. העתיקו אותו

### שלב 3: יצירת API Key

1. בלוח הבקרה: **הגדרות** > **API**
2. לחצו **צור מפתח API חדש**
3. העתיקו את המפתח (הוא מוצג פעם אחת בלבד)

### שלב 4: הגדרת Webhook

1. בלוח הבקרה: **הגדרות** > **Webhooks** (או **Callback URL**)
2. הגדירו את ה-URL הבא:
   ```
   https://linkhub-iota-red.vercel.app/api/webhooks/payme
   ```
3. שמרו

### שלב 5: חיבור ב-LinkHub

1. המשתמש נכנס ל-**Dashboard** > **Integrations**
2. מוצא את כרטיס **PayMe** ולוחץ **Connect**
3. מזין את ה-**Seller ID** וה-**API Key**
4. לוחץ **Save**

### מצב Sandbox (בדיקות)

PayMe מספקת סביבת בדיקות נפרדת:
- URL: `https://preprod.paymeservice.com`
- ניתן להפעיל מצב בדיקות בהגדרות האינטגרציה (שדה `test_mode: true` ב-config)
- בסביבת בדיקות, התשלומים לא אמיתיים

---

## LemonSqueezy

LemonSqueezy מאפשר מכירת מוצרים דיגיטליים (קורסים, קבצים, מנויים). מתאים למכירת שירותים עם variant ספציפי.

### שלב 1: הרשמה ל-LemonSqueezy

1. היכנסו ל-[LemonSqueezy](https://www.lemonsqueezy.com) ולחצו **Get Started**
2. צרו חשבון והשלימו את פרטי התשלום (Stripe Connect)

### שלב 2: יצירת חנות ומוצר

1. בלוח הבקרה: **Store** > צרו חנות חדשה (אם אין)
2. לחצו **+ New Product**
3. מלאו:
   - **Name**: שם המוצר/שירות
   - **Price**: מחיר
4. לאחר יצירת המוצר, ייווצר **Variant** ברירת מחדל (Default)
5. העתיקו את ה-**Variant ID** מה-URL (או מעמוד פרטי ה-Variant)

### שלב 3: יצירת API Key

1. בלוח הבקרה: **Settings** > **API**
2. לחצו **+ Generate API Key**
3. תנו שם: `LinkHub Integration`
4. העתיקו את המפתח (מוצג פעם אחת בלבד)

### שלב 4: קבלת Store ID

1. ה-Store ID מופיע ב-URL של לוח הבקרה:
   ```
   https://app.lemonsqueezy.com/store/XXXXX/...
   ```
   ה-`XXXXX` הוא ה-Store ID

### שלב 5: הגדרת Webhook

1. בלוח הבקרה: **Settings** > **Webhooks**
2. לחצו **+ Add Webhook**
3. הגדירו:
   - **URL**: `https://linkhub-iota-red.vercel.app/api/webhooks/lemonsqueezy`
   - **Events**: סמנו `order_created`
   - **Signing Secret**: צרו סיסמה חזקה והעתיקו אותה
4. לחצו **Save**
5. הוסיפו את ה-signing secret כמשתנה סביבה:
   ```
   LEMONSQUEEZY_WEBHOOK_SECRET=your_signing_secret_here
   ```

### שלב 6: חיבור ב-LinkHub

1. המשתמש נכנס ל-**Dashboard** > **Integrations**
2. מוצא את כרטיס **LemonSqueezy** ולוחץ **Connect**
3. מזין את ה-**API Key** וה-**Store ID**
4. לוחץ **Save**

### שלב 7: קישור Variant לשירות

כאשר המשתמש יוצר שירות עם `action_type: "buy_now"`, עליו להגדיר את ה-`variant_id` של LemonSqueezy ב-`action_config` של השירות. ה-variant_id מפנה למוצר/תוכנית ספציפית ב-LemonSqueezy.

---

## מיגרציית Supabase

לפני שמתחילים להשתמש באינטגרציות, יש להריץ את המיגרציה שמוסיפה את הספקים החדשים.

### שלב 1: פתיחת SQL Editor

1. היכנסו ל-[Supabase Dashboard](https://supabase.com/dashboard)
2. בחרו את הפרויקט שלכם
3. בתפריט הצד: **SQL Editor**

### שלב 2: הרצת המיגרציה

1. לחצו **+ New Query**
2. העתיקו והדביקו את התוכן של הקובץ:
   ```
   supabase/migrations/007_new_integrations.sql
   ```
3. תוכן המיגרציה:
   ```sql
   -- Drop and recreate the CHECK constraint to include new providers
   ALTER TABLE public.integrations
     DROP CONSTRAINT IF EXISTS integrations_provider_check;

   ALTER TABLE public.integrations
     ADD CONSTRAINT integrations_provider_check
     CHECK (provider IN ('calendly', 'cal_com', 'stripe', 'webhook', 'zapier', 'google_calendar', 'payme', 'lemonsqueezy'));
   ```
4. לחצו **Run** (או Ctrl+Enter)
5. וודאו שההרצה הצליחה (הודעת **Success**)

---

## סיכום משתני סביבה

כל משתני הסביבה שצריך להגדיר ב-Vercel (**Settings** > **Environment Variables**):

| משתנה | תיאור | נדרש? |
|--------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | כתובת פרויקט Supabase | כן |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | מפתח Anon של Supabase | כן |
| `SUPABASE_SERVICE_ROLE_KEY` | מפתח Service Role של Supabase (לא חשוף ללקוח) | כן |
| `GOOGLE_CALENDAR_CLIENT_ID` | Client ID מ-Google Cloud Console | לחיבור Google Calendar |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Client Secret מ-Google Cloud Console | לחיבור Google Calendar |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Signing Secret מ-LemonSqueezy Webhooks | לאימות webhooks מ-LemonSqueezy |
| `PAYME_WEBHOOK_SECRET` | Secret לאימות callbacks מ-PayMe | לאימות webhooks מ-PayMe |

### הגדרה ב-Vercel

1. היכנסו ל-[Vercel Dashboard](https://vercel.com/dashboard)
2. בחרו את פרויקט **linkhub**
3. לחצו **Settings** > **Environment Variables**
4. הוסיפו כל משתנה עם הערך המתאים
5. וודאו שהמשתנים מוגדרים ל-**Production**, **Preview**, ו-**Development** לפי הצורך
6. לאחר הוספת משתנים, בצעו **Redeploy** כדי שהשינויים ייכנסו לתוקף

---

## בדיקת תקינות

לאחר הגדרת הכל, בדקו:

1. **Google Calendar**: היכנסו ל-Dashboard > Integrations > Connect Google Calendar > וודאו שה-OAuth flow עובד ומחזיר לאפליקציה
2. **PayMe**: צרו שירות עם מחיר > בעמוד הפרופיל הציבורי לחצו **Buy Now** > וודאו שנפתח עמוד תשלום של PayMe
3. **LemonSqueezy**: צרו שירות עם variant_id > בעמוד הפרופיל הציבורי לחצו **Buy Now** > וודאו שנפתח checkout של LemonSqueezy
