# 🛡️ Overdrive Shield - Brand Identity

## Brand Name

**Overdrive Shield**

**Tagline:** *Advanced MEV Protection Dashboard*

---

## Logo

### Current Logo
The logo is a **shield emoji** (🛡️) displayed in a gradient red square with yellow border.

### Logo Container Specs
```css
.logo-container {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #E10600 0%, #FF1E00 100%);
    border-radius: 12px;
    border: 2px solid #FFD700;
    box-shadow: 0 0 20px rgba(225, 6, 0, 0.5);
}
```

### Logo Placement
- **Location:** Top-left of header
- **Size:** 60x60px
- **Position:** Next to brand name

### To Replace with Custom Logo

**Option 1 - Image File:**
```html
<!-- In index.html, replace: -->
<div class="logo-container">
    🛡️
</div>

<!-- With: -->
<div class="logo-container">
    <img src="./assets/overdrive-shield-logo.png" alt="Overdrive Shield" style="width: 100%; height: 100%; object-fit: contain;">
</div>
```

**Option 2 - SVG:**
```html
<div class="logo-container">
    <svg viewBox="0 0 60 60" style="width: 100%; height: 100%;">
        <!-- Your SVG code here -->
    </svg>
</div>
```

**Option 3 - Keep Emoji:**
Current setup uses 🛡️ emoji which works cross-platform.

---

## Color Palette

### Primary Colors
```css
Red (Primary):     #E10600  /* Main brand color */
Red Glow:          #FF1E00  /* Highlights, gradients */
Yellow (Accent):   #FFD700  /* "SHIELD" text, warnings */
```

### Background Colors
```css
Black:             #15151E  /* Main background */
Dark:              #1C1C27  /* Cards, panels */
Track (Lines):     #2D2D3A  /* Subtle backgrounds */
```

### Utility Colors
```css
White:             #FFFFFF  /* Primary text */
Grey:              #6B7280  /* Secondary text */
Green (Success):   #10B981  /* Status, safe alerts */
```

---

## Typography

### Font Families

**Headers (Orbitron):**
```css
font-family: 'Orbitron', sans-serif;
font-weight: 900; /* Extra Bold */
letter-spacing: 3px;
text-transform: uppercase;
```

**Body (Rajdhani):**
```css
font-family: 'Rajdhani', sans-serif;
font-weight: 500; /* Medium */
```

---

## Brand Usage

### Header Structure

```html
<div class="branding">
    <div class="logo-container">🛡️</div>
    <div class="title">
        OVERDRIVE <span class="shield">SHIELD</span>
    </div>
</div>
```

**Visual Result:**
```
[🛡️]  OVERDRIVE SHIELD
      ─────────────────
      White    Yellow
```

### Title Styling

**"OVERDRIVE":** White (#FFFFFF)  
**"SHIELD":** Yellow (#FFD700)

```css
.title {
    color: #FFFFFF;
}

.title .shield {
    color: #FFD700;
}
```

---

## Design Elements

### Animations

**Race Line (Header top border):**
- Gradient: Red → Yellow → Red
- Animation: 3s linear infinite
- Effect: Racing stripe feel

**Status Light:**
- Green pulsing glow
- 2s pulse cycle
- Indicates: Live connection

**Alert Cards:**
- Slide-in animation
- 0.5s ease-out
- From left

---

## Brand Voice

### Tone
- **Professional** - Serious security focus
- **Technical** - Blockchain/Web3 terminology
- **Protective** - Emphasis on safety
- **Speed-focused** - Real-time monitoring

### Key Messages
- "Advanced MEV Protection"
- "Real-time Monitoring"
- "Alchemy-Powered Detection"
- "Shield Against Bots"

---

## File Naming

### Project Files
```
overdrive-shield/
├── index.html
├── server.js
├── package.json (name: "overdrive-shield")
└── assets/
    ├── overdrive-shield-logo.png (if custom logo)
    ├── overdrive-shield-favicon.ico
    └── overdrive-shield-og-image.png (for social media)
```

### Document Titles
```html
<title>🛡️ Overdrive Shield - MEV Protection</title>
```

---

## Logo Recommendations

### If Creating Custom Logo:

**Concept Ideas:**
1. **Shield + Lightning bolt** - Protection + Speed
2. **Shield + Blockchain hexagons** - Protection + Web3
3. **Shield + Racing flag** - Protection + F1 theme
4. **Shield + Circuit pattern** - Protection + Tech

**Design Guidelines:**
- Keep it simple (works at 60x60px)
- Use red and yellow from palette
- Make it recognizable as a shield
- Ensure good contrast
- SVG format preferred (scalable)

**File Formats:**
- **Logo**: SVG (primary), PNG (fallback)
- **Favicon**: ICO or PNG 32x32
- **Social**: PNG 1200x630 (Open Graph)

---

## Favicon Setup

Add to `<head>` in index.html:

```html
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="icon" type="image/png" href="/assets/favicon.png">
```

Or use emoji favicon:
```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>">
```

---

## Social Media / OG Tags

Add to `<head>`:

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://overdriveshield.io/">
<meta property="og:title" content="Overdrive Shield - MEV Protection">
<meta property="og:description" content="Advanced MEV Protection Dashboard with real-time Alchemy-powered bot detection">
<meta property="og:image" content="https://overdriveshield.io/og-image.png">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://overdriveshield.io/">
<meta property="twitter:title" content="Overdrive Shield - MEV Protection">
<meta property="twitter:description" content="Advanced MEV Protection Dashboard with real-time bot detection">
<meta property="twitter:image" content="https://overdriveshield.io/og-image.png">
```

---

## Brand Assets Checklist

- [x] Logo container with emoji (✅ Done)
- [x] Brand name updated (✅ Done)
- [x] Color scheme (✅ Done)
- [ ] Custom logo file (Optional - Add your own)
- [ ] Favicon (Optional - Add your own)
- [ ] OG social image (Optional - For sharing)
- [ ] Brand guidelines doc (This file ✅)

---

## Usage Examples

### In Documentation
```markdown
# 🛡️ Overdrive Shield

Welcome to **Overdrive Shield**, the advanced MEV protection dashboard...
```

### In Code Comments
```javascript
/**
 * Overdrive Shield - MEV Protection Dashboard
 * Real-time Alchemy-powered bot detection
 */
```

### In Package
```json
{
  "name": "overdrive-shield",
  "description": "🛡️ Overdrive Shield - Advanced MEV Protection Dashboard"
}
```

---

## Future Branding

### Potential Additions
- **Subdomain:** shield.yourdomain.com
- **Email:** team@overdriveshield.io
- **GitHub:** github.com/username/overdrive-shield
- **Twitter:** @OverdriveShield

### Merch Ideas
- T-shirts with shield logo
- Stickers for laptops
- Conference booth graphics

---

## Quick Reference

**Name:** Overdrive Shield  
**Icon:** 🛡️  
**Colors:** Red (#E10600) + Yellow (#FFD700)  
**Fonts:** Orbitron + Rajdhani  
**Theme:** Protection, Speed, Technology  

---

**🛡️ Your brand identity is now set! Add custom logo to complete.**
