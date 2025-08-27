# Cookie Consent Implementation (Currently Disabled)

## 📍 Location
This folder contains the complete cookie consent implementation that's ready to use when needed.

## 📁 Files in this folder:
- `cookie-consent-provider.tsx` - Main provider component
- `cookie-consent.css` - Black glassmorphism styling
- `cookie-policy/page.tsx` - Cookie policy page

## 🚀 How to Re-Enable Cookie Consent

### Step 1: Move files back to their original locations
```bash
# From the project root, run these commands:

# Move provider back
mv src/_unused/cookie-consent/cookie-consent-provider.tsx src/providers/

# Move CSS back
mv src/_unused/cookie-consent/cookie-consent.css src/styles/

# Move cookie policy page back
mv src/_unused/cookie-consent/cookie-policy src/app/
```

### Step 2: Update layout.tsx
```tsx
// In src/app/layout.tsx, add the import at the top:
import { CookieConsentProvider } from "@/providers/cookie-consent-provider";

// Then wrap the app with CookieConsentProvider:
return (
  <html lang="en">
    <body>
      <CookieConsentProvider>  {/* Add this line */}
        <SelectiveThemeProvider>
          {/* ... rest of your app ... */}
        </SelectiveThemeProvider>
      </CookieConsentProvider>  {/* Add this line */}
    </body>
  </html>
);
```

## 🎨 Current Design
- **Style**: Black glassmorphism with blur effects
- **Position**: Bottom right corner
- **Layout**: Inline cloud, compact design
- **Theme**: Dark with white text

## ⚙️ Configuration

### To add Google Analytics:
1. Install GA script in your app
2. Update the `analytics` category in `cookie-consent-provider.tsx`:
```javascript
onAccept: () => {
  // Enable Google Analytics
  window.gtag('consent', 'update', {
    'analytics_storage': 'granted'
  });
},
onReject: () => {
  // Disable Google Analytics
  window.gtag('consent', 'update', {
    'analytics_storage': 'denied'
  });
}
```

### To add Meta Pixel:
1. Install Meta Pixel script
2. Update the `marketing` category:
```javascript
onAccept: () => {
  // Enable Meta Pixel
  fbq('consent', 'grant');
},
onReject: () => {
  // Disable Meta Pixel
  fbq('consent', 'revoke');
}
```

## 📦 Package Info
The `vanilla-cookieconsent` package is still installed in your project.
- Version: ^3.1.0
- No need to reinstall when re-enabling

## 🔧 Quick Edits

### Change position:
In `cookie-consent-provider.tsx`, find:
```javascript
position: 'bottom right'  // Change to: 'bottom left', 'bottom center', etc.
```

### Change colors:
In `cookie-consent.css`, modify the color variables at the top.

### Simplify to essential cookies only:
Remove the `analytics` and `marketing` categories from the provider, keep only `necessary`.

## 💡 When to Use This
Enable cookie consent when you:
- Add Google Analytics
- Add Meta Pixel / Facebook tracking  
- Add any third-party tracking scripts
- Need GDPR/CCPA compliance
- Expand to EU markets

## 🚫 When NOT to Use
Don't enable if you're only using:
- Supabase auth cookies (essential)
- No tracking or analytics
- US-only audience
- No marketing pixels

---
*Last updated: January 2025*
*Design: Black glassmorphism theme*
*Status: Ready to deploy when needed*