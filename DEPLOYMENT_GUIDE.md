# Deployment Guide - Redactify

## 📋 Pre-Deployment Checklist

Before deploying to production, ensure:

- ✅ Code health score: **9.0/10**
- ✅ Production build successful
- ✅ All critical issues fixed
- ⏳ Manual testing complete (see TESTING_CHECKLIST.md)
- ⏳ Environment variables configured

---

## 🚀 Step 1: Vercel Deployment

### 1.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 1.2 Login to Vercel
```bash
vercel login
```

### 1.3 Deploy to Production
```bash
# From project root
vercel --prod
```

### 1.4 Set Environment Variables

In Vercel Dashboard (https://vercel.com/dashboard):

1. Go to your project
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:

```bash
# AdSense
VITE_ADSENSE_CLIENT_ID=ca-pub-YOUR_ADSENSE_ID

# Supabase (for Pro license management)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Razorpay (for payments)
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
```

4. Save and redeploy:
```bash
vercel --prod
```

---

## 💰 Step 2: AdSense Integration

### 2.1 Sign Up for AdSense
1. Go to https://www.google.com/adsense/
2. Sign up with Google account
3. Submit your website URL (your Vercel URL)

### 2.2 Verify Site Ownership
1. AdSense will provide verification code
2. Already added in `index.html` (check head section)
3. Submit for verification

### 2.3 Create Ad Units
1. In AdSense Dashboard → **Ads** → **Overview**
2. Click **By ad unit** → **Display ads**
3. Create 3 ad units:
   - **Sidebar Ad** (300x250 rectangle)
   - **Results Footer Ad** (728x90 leaderboard)
   - **Additional Ad** (responsive)

### 2.4 Get Ad Unit IDs
```javascript
// Update in AdSenseSlot.jsx usage:
SIDEBAR_SLOT_ID = "1234567890"  // Your sidebar ad ID
RESULTS_FOOTER_SLOT_ID = "0987654321"  // Your footer ad ID
```

### 2.5 Wait for Approval
- Can take 1-3 days
- Ads will show after approval
- Check AdSense dashboard for status

---

## 💳 Step 3: Razorpay Integration

### 3.1 Create Razorpay Account
1. Go to https://razorpay.com/
2. Sign up for business account
3. Complete KYC verification

### 3.2 Get API Keys
1. Dashboard → **Settings** → **API Keys**
2. Generate new key pair
3. Copy **Key ID** (starts with `rzp_`)
4. Copy **Key Secret** (keep secure, don't expose)

### 3.3 Configure Payment Gateway

#### Test Mode (for testing):
```javascript
// Use test keys
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY
```

#### Live Mode (for production):
```javascript
// Use live keys after activation
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
```

### 3.4 Set Up Webhooks (Optional)
1. Dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/razorpay/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy webhook secret

### 3.5 Activate Live Account
1. Complete business verification
2. Submit required documents
3. Wait for activation (1-2 business days)

---

## 🌐 Step 4: Custom Domain Setup

### 4.1 Purchase Domain
Recommended registrars:
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare

### 4.2 Add Domain to Vercel
1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `redactify.com`)
4. Click **Add**

### 4.3 Configure DNS

Vercel will provide DNS records. Add these to your domain registrar:

**Option A: Using Nameservers (Recommended)**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option B: Using A/CNAME Records**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4.4 Wait for DNS Propagation
- Takes 1-48 hours
- Check status: https://www.whatsmydns.net/
- Vercel will auto-provision SSL certificate

### 4.5 Force HTTPS
1. Vercel Dashboard → **Settings** → **Domains**
2. Enable **Force HTTPS**
3. Enable **Automatic HTTPS Redirects**

---

## 🔒 Step 5: Security & Compliance

### 5.1 Add Cookie Consent Banner

Create `src/components/CookieConsent.jsx`:
```javascript
import React, { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setShow(true);
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      necessary: true,
      analytics: true,
      adsense: true
    }));
    setShow(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      necessary: true,
      analytics: false,
      adsense: false
    }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/10 p-6 z-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-white text-sm">
          We use cookies to improve your experience and show personalized ads.
        </p>
        <div className="flex gap-3">
          <button onClick={acceptNecessary} className="px-4 py-2 text-sm text-white border border-white/20 rounded-lg hover:bg-white/10">
            Necessary Only
          </button>
          <button onClick={acceptAll} className="px-4 py-2 text-sm bg-white text-black rounded-lg hover:bg-gray-200">
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
```

Add to App.jsx:
```javascript
import CookieConsent from './components/CookieConsent';

// In render:
<CookieConsent />
```

### 5.2 Create Privacy Policy
1. Use generator: https://www.privacypolicygenerator.info/
2. Include sections:
   - Data collection
   - Cookie usage
   - AdSense advertising
   - Payment processing (Razorpay)
   - User rights (GDPR)

3. Create `src/pages/PrivacyPolicy.jsx`
4. Add link in footer

### 5.3 Create Terms of Service
1. Define acceptable use
2. Pro subscription terms
3. Refund policy
4. Limitation of liability

5. Create `src/pages/TermsOfService.jsx`
6. Add link in footer

---

## 📊 Step 6: Analytics Setup (Optional)

### 6.1 Google Analytics
```html
<!-- Add to index.html head -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 6.2 Vercel Analytics
1. Enable in Vercel Dashboard
2. Free tier includes basic metrics
3. Upgrade for advanced features

---

## 🧪 Step 7: Post-Deployment Testing

### 7.1 Verify Production Deployment
- [ ] Site loads at custom domain
- [ ] HTTPS works (green padlock)
- [ ] All pages accessible
- [ ] No console errors

### 7.2 Test Core Features
- [ ] File upload (PDF, DOCX, TXT)
- [ ] PII detection working
- [ ] Export working (TXT, PDF, DOCX)
- [ ] Pro upgrade flow

### 7.3 Test Monetization
- [ ] AdSense ads showing (after approval)
- [ ] Razorpay payment works
- [ ] Pro features unlock after payment

### 7.4 Performance Check
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 5s

---

## 🔧 Step 8: Monitoring & Maintenance

### 8.1 Set Up Error Tracking

**Sentry** (Recommended):
```bash
npm install @sentry/react @sentry/vite-plugin
```

```javascript
// src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### 8.2 Monitor Revenue
- Check AdSense dashboard daily
- Track Razorpay transactions
- Monitor conversion rates

### 8.3 Update Dependencies
```bash
# Monthly
npm update
npm audit fix
npm run build
vercel --prod
```

---

## 📈 Step 9: Growth & Optimization

### 9.1 SEO Optimization
- [ ] Add meta descriptions
- [ ] Add Open Graph tags
- [ ] Create sitemap.xml
- [ ] Submit to Google Search Console

### 9.2 Marketing
- [ ] Create social media accounts
- [ ] Write blog posts about PII redaction
- [ ] Submit to Product Hunt
- [ ] Share on Reddit, HackerNews

### 9.3 Feature Roadmap
- [ ] Bulk document processing
- [ ] Custom redaction rules
- [ ] API access for enterprise
- [ ] Mobile app

---

## 🆘 Troubleshooting

### Issue: Ads not showing
**Solution:**
- Check AdSense approval status
- Verify ad unit IDs correct
- Check cookie consent granted
- Wait 24-48 hours after setup

### Issue: Payment fails
**Solution:**
- Check Razorpay live mode activated
- Verify API keys correct
- Test with test keys first
- Check webhook configuration

### Issue: Build fails on Vercel
**Solution:**
- Check environment variables set
- Run `npm run build` locally
- Check Vercel build logs
- Verify Node version compatibility

### Issue: Domain not resolving
**Solution:**
- Check DNS propagation (up to 48h)
- Verify DNS records correct
- Clear browser cache
- Try different DNS server

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **AdSense Help:** https://support.google.com/adsense
- **Razorpay Docs:** https://razorpay.com/docs/
- **Vite Docs:** https://vitejs.dev/

---

## ✅ Final Checklist

Before going live:

- [ ] Code health score 9.0/10 ✅
- [ ] Production build successful ✅
- [ ] Manual testing complete
- [ ] Environment variables configured
- [ ] Vercel deployment successful
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] AdSense account created
- [ ] Razorpay account activated
- [ ] Cookie consent banner added
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Error tracking configured
- [ ] Analytics enabled
- [ ] Post-deployment testing complete

---

**🎉 Congratulations! Your app is now live!**

Monitor the first few days closely:
- Check error logs
- Verify payments working
- Watch ad revenue
- Gather user feedback

**Next:** Scale and optimize based on usage patterns!
