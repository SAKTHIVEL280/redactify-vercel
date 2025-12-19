# Pre-Deployment Testing Checklist

## Application URL
**Development:** http://localhost:5174/

---

## ✅ Code Quality (All Fixed)

### High Priority Issues
- [x] React hook dependencies fixed (Redactor.jsx)
- [x] Console.error removed from production (DocumentViewer.jsx)
- [x] XSS protection with DOMPurify (DocumentViewer.jsx)
- [x] Memory leaks fixed (exportUtils.js)
- [x] Dead code removed (Redactor.jsx - backdropRef, renderHighlightedText)

### Medium Priority Issues
- [x] Duplicate code extracted (fileHelpers.js)
- [x] Error boundary added (ErrorBoundary.jsx + main.jsx)
- [x] alert() replaced with toast (Sidebar.jsx + toast.js)
- [x] useCallback added for performance (Redactor, DocumentViewer)

### Code Quality
- [x] PropTypes added to all components
- [x] Error handling improved
- [x] Build successful (npm run build)
- [x] Dev server running (npm run dev)

---

## 🧪 Manual Testing Required

### Core Functionality

#### 1. File Upload - TXT ⏳
- [ ] Drag and drop .txt file
- [ ] Click to upload .txt file
- [ ] Load sample resume button
- [ ] Verify text is displayed correctly
- [ ] Verify PII is detected and highlighted

#### 2. File Upload - PDF ⏳
- [ ] Drag and drop .pdf file
- [ ] Click to upload .pdf file
- [ ] Verify PDF text is extracted
- [ ] Verify document structure preserved
- [ ] Verify PII highlighting works

#### 3. File Upload - DOCX ⏳
- [ ] Drag and drop .docx file
- [ ] Click to upload .docx file
- [ ] Verify DOCX rendered correctly
- [ ] Verify formatting preserved
- [ ] Verify PII highlighting works

### PII Detection

#### Email Detection ⏳
- [ ] Detects email addresses
- [ ] Highlights in blue
- [ ] Shows in sidebar
- [ ] Toggle on/off works

#### Phone Detection ⏳
- [ ] Detects phone numbers
- [ ] Highlights in green
- [ ] Shows in sidebar
- [ ] Toggle on/off works

#### URL Detection ⏳
- [ ] Detects URLs
- [ ] Highlights in purple
- [ ] Shows in sidebar
- [ ] Toggle on/off works

#### Name Detection ⏳
- [ ] Detects names
- [ ] Highlights in red
- [ ] Shows in sidebar
- [ ] Toggle on/off works

#### Location Detection ⏳
- [ ] Detects locations
- [ ] Highlights in orange
- [ ] Shows in sidebar
- [ ] Toggle on/off works

### Export Functionality

#### TXT Export (Free) ⏳
- [ ] Click "TXT" button
- [ ] File downloads
- [ ] Filename format: `redacted-resume-{timestamp}.txt`
- [ ] Redacted content correct
- [ ] No errors in console
- [ ] No toast errors

#### PDF Export (Pro) ⏳
- [ ] Without Pro: Shows upgrade modal
- [ ] With Pro: Exports PDF
- [ ] File downloads
- [ ] Filename format: `redacted-resume-{timestamp}.pdf`
- [ ] Redacted content correct
- [ ] PDF readable
- [ ] No errors in console

#### DOCX Export (Pro) ⏳
- [ ] Without Pro: Shows upgrade modal
- [ ] With Pro: Exports DOCX
- [ ] File downloads
- [ ] Filename format: `redacted-resume-{timestamp}.docx`
- [ ] Redacted content correct
- [ ] DOCX opens correctly
- [ ] No errors in console

### Error Handling

#### Toast Notifications ⏳
- [ ] Success toasts appear (top-right)
- [ ] Error toasts appear (top-right)
- [ ] Toast auto-dismisses after 4s
- [ ] Toast styling correct (dark theme)
- [ ] Multiple toasts stack correctly

#### Error Boundary ⏳
- [ ] Catches component errors
- [ ] Shows error screen
- [ ] Refresh button works
- [ ] No app crash

### UI/UX

#### Document Viewer ⏳
- [ ] Scrolling works smoothly
- [ ] Headings styled correctly (h2, h3)
- [ ] Bullet points formatted
- [ ] Line spacing appropriate
- [ ] Font rendering correct
- [ ] Colors match original (as close as possible)

#### Sidebar ⏳
- [ ] PII items listed
- [ ] Stats accurate (Detected/Accepted)
- [ ] Toggle switches work
- [ ] Export buttons enabled/disabled correctly
- [ ] Pro badges shown on paid features
- [ ] AdSense slots rendered (if not Pro)

#### Landing Page ⏳
- [ ] Upload zone animates on drag
- [ ] Gradient border on hover
- [ ] Sample resume button works
- [ ] File input click works
- [ ] Responsive design works

### Performance

#### Large Files ⏳
- [ ] Upload 100KB+ file
- [ ] PII detection completes < 5s
- [ ] UI remains responsive
- [ ] No browser freezing
- [ ] Progress indicators shown

#### Multiple Operations ⏳
- [ ] Upload → Detect → Export (TXT)
- [ ] Upload → Toggle PII → Export
- [ ] Multiple file uploads in sequence
- [ ] No memory leaks
- [ ] Console clean (no errors)

### Browser Compatibility

#### Chrome ⏳
- [ ] File upload works
- [ ] PII detection works
- [ ] Export works
- [ ] Toast notifications work
- [ ] No console errors

#### Firefox ⏳
- [ ] File upload works
- [ ] PII detection works
- [ ] Export works
- [ ] Toast notifications work
- [ ] No console errors

#### Edge ⏳
- [ ] File upload works
- [ ] PII detection works
- [ ] Export works
- [ ] Toast notifications work
- [ ] No console errors

#### Safari (if available) ⏳
- [ ] File upload works
- [ ] PII detection works
- [ ] Export works
- [ ] Toast notifications work
- [ ] No console errors

---

## 🔒 Security Testing

### XSS Prevention ⏳
- [ ] Upload file with `<script>alert('XSS')</script>`
- [ ] Verify script doesn't execute
- [ ] HTML entities escaped
- [ ] DOMPurify sanitizes content

### Input Validation ⏳
- [ ] Invalid file types rejected
- [ ] Large files handled gracefully
- [ ] Empty files handled
- [ ] Corrupted files show error

---

## 📊 Build & Production

### Build Process ✅
- [x] `npm run build` completes
- [x] No errors in build
- [x] Bundle size acceptable (<2MB)
- [x] Assets optimized

### Production Build Testing ⏳
- [ ] `npm run preview` works
- [ ] All features work in production build
- [ ] Service worker registers
- [ ] PWA installable
- [ ] Offline mode works (cached assets)

---

## 🚀 Deployment Prep

### Environment Variables ⏳
- [ ] VITE_ADSENSE_CLIENT_ID set
- [ ] VITE_SUPABASE_URL set
- [ ] VITE_SUPABASE_ANON_KEY set
- [ ] VITE_RAZORPAY_KEY_ID set

### Vercel Configuration ⏳
- [ ] vercel.json created (if needed)
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Node version specified

### DNS & Domain ⏳
- [ ] Domain purchased
- [ ] DNS configured
- [ ] SSL certificate added
- [ ] HTTPS enabled

---

## 📈 Analytics & Monetization

### AdSense ⏳
- [ ] Site ownership verified
- [ ] AdSense code added
- [ ] Ads showing (after approval)
- [ ] Cookie consent implemented
- [ ] GDPR compliant

### Razorpay ⏳
- [ ] Account created
- [ ] API keys obtained
- [ ] Test payment works
- [ ] Webhook configured
- [ ] Pro upgrade flow works

---

## 📝 Documentation

### User Docs ⏳
- [ ] README.md updated
- [ ] Usage instructions clear
- [ ] Screenshots added
- [ ] FAQ section

### Developer Docs ✅
- [x] FIXES_SUMMARY.md created
- [x] Code commented
- [x] PropTypes documented
- [x] API contracts clear

---

## 🎯 Final Checks

### Code Health ✅
- [x] Health score: 9.0/10
- [x] All high-priority issues fixed
- [x] All medium-priority issues fixed
- [x] Code quality improvements done

### Deployment Readiness ⏳
- [ ] All manual tests passed
- [ ] No console errors
- [ ] No broken features
- [ ] Performance acceptable
- [ ] Security verified

---

## Test Results

### Date: ___________
### Tester: ___________

### Issues Found:
1. 
2. 
3. 

### Status:
- [ ] All tests passed ✅
- [ ] Minor issues (deploy anyway)
- [ ] Critical issues (fix before deploy)

---

## Sign-off

**Code Quality Lead:** ✅ Approved (AI fixes complete)
**Manual Tester:** ⏳ Pending
**Deployment Engineer:** ⏳ Pending

---

**Ready for production deployment once manual testing is complete!**
