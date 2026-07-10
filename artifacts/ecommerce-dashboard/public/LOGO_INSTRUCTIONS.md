# StreamIQ Logo Integration Guide

## Quick Start

Your StreamIQ logo has been integrated into the project! Here's what you need to do:

### Step 1: Save the Logo Image

1. Save the StreamIQ logo image you provided as `streamiq-logo.png`
2. Place it in this folder: `e:\ECommerce-Platform (1)\ECommerce-Platform\artifacts\ecommerce-dashboard\public\`

The image should be named exactly: **streamiq-logo.png**

### Step 2: That's it!

The code has already been updated to use your logo in:
- ✅ Landing page (`landing.html`) - in the navigation bar
- ✅ Dashboard page (`index.html`) - in the sidebar branding

### What Was Changed

#### Landing Page (landing.html)
```html
<div class="nav-logo">
  <img src="../public/streamiq-logo.png" alt="StreamIQ Logo" 
       style="width: 40px; height: 40px; object-fit: contain;" />
</div>
```

#### Dashboard (index.html)
```html
<div class="brand-icon">
  <img src="../public/streamiq-logo.png" alt="StreamIQ Logo" 
       style="width: 48px; height: 48px; object-fit: contain;" />
</div>
```

### Logo Specifications

- **Recommended size**: 1024x1024 px (or any square format)
- **Format**: PNG with transparent background
- **File name**: `streamiq-logo.png`
- **Location**: `public/` folder

### Customization

If you want to adjust the logo size, modify the `width` and `height` values in the style attributes:

**For Landing Page (Navbar):**
- Current size: 40px × 40px
- Location: `frontend/landing.html` line ~82

**For Dashboard (Sidebar):**
- Current size: 48px × 48px  
- Location: `frontend/index.html` line ~21

### Troubleshooting

**Logo not showing?**
1. Verify the file is named exactly `streamiq-logo.png` (case-sensitive)
2. Verify it's in the `public/` folder
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser console for 404 errors

**Logo looks pixelated?**
- Use a higher resolution image (min 512x512px recommended)
- Ensure PNG format with transparency

**Logo size issues?**
- The `object-fit: contain` property ensures the logo scales proportionally
- Adjust width/height values as needed

---

**Your logo integration is complete!** Just add the `streamiq-logo.png` file to the `public/` folder and refresh your browser.
