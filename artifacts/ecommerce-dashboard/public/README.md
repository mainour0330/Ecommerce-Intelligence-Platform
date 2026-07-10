# 🎨 StreamIQ Logo - Quick Setup

## ⚡ What You Need To Do

**Save your logo image to this folder as `streamiq-logo.png`**

That's it! The code is already set up to use it.

---

## 📍 File Location

```
📁 public/
   ├── streamiq-logo.png     ← Save your logo here
   ├── opengraph.jpg
   └── README.md              ← You are here
```

---

## ✅ Verification

After saving the logo, check these pages:

1. **Landing Page**: `http://localhost:3000/landing`
   - Logo should appear in the top-left navigation bar

2. **Dashboard**: `http://localhost:3000/dashboard`
   - Logo should appear in the sidebar (top-left)

---

## 🔧 Technical Details

- **File name**: `streamiq-logo.png` (exact, case-sensitive)
- **Format**: PNG with transparent background
- **Recommended size**: 512×512px or larger
- **Used in**:
  - `frontend/landing.html` (40×40px display)
  - `frontend/index.html` (48×48px display)

---

## 🎯 Quick Test

Run these commands to test:

```bash
# Make sure you're in the project root
cd "e:\ECommerce-Platform (1)\ECommerce-Platform\artifacts\ecommerce-dashboard"

# Start the server
npm start

# Open in browser
# Landing: http://localhost:3000/landing
# Dashboard: http://localhost:3000/dashboard
```

---

## 📝 Notes

- The logo scales automatically with `object-fit: contain`
- Works in both light and dark mode
- CSS styling is already configured in `landing.css` and `style.css`

**Need more help?** Check `LOGO_SETUP.md` in the parent folder for detailed instructions.
