# 🎨 Logo Integration Guide - Overdrive Shield

## ✅ Logo Space Ready

The header now has a dedicated logo container **without text branding**, ready for your complete SVG or image logo.

---

## 📐 Logo Specifications

### Container Dimensions
- **Height:** 50px (fixed)
- **Width:** Auto (expands with logo)
- **Max Width:** 300px (to prevent oversized logos)

### Recommended Logo Size
- **Height:** 50px
- **Width:** 150-250px (horizontal logo)
- **Format:** SVG (preferred) or PNG/WebP

---

## 🖼️ How to Add Your Logo

### Option 1: SVG Logo (Recommended)

**Step 1:** In `index.html`, find this section (around line 480):
```html
<div class="logo-container">
    <!-- INSERT YOUR LOGO SVG HERE -->
    <!-- Temporary placeholder - replace with your logo -->
    <svg viewBox="0 0 240 50">
        ...
    </svg>
</div>
```

**Step 2:** Replace the placeholder SVG with your logo:
```html
<div class="logo-container">
    <svg viewBox="0 0 YOUR_WIDTH YOUR_HEIGHT" xmlns="http://www.w3.org/2000/svg">
        <!-- Paste your complete SVG code here -->
        <path d="..." fill="#E10600"/>
        <text x="..." y="..." fill="#FFD700">...</text>
        <!-- etc. -->
    </svg>
</div>
```

**Example with actual SVG:**
```html
<div class="logo-container">
    <svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
        <!-- Shield icon -->
        <path d="M25,5 L35,5 L40,25 L30,45 L20,45 L10,25 Z" 
              fill="#E10600" stroke="#FFD700" stroke-width="2"/>
        
        <!-- Text -->
        <text x="50" y="32" font-family="Orbitron" font-size="24" 
              font-weight="900" fill="#FFFFFF">OVERDRIVE SHIELD</text>
    </svg>
</div>
```

---

### Option 2: Image File (SVG/PNG/WebP)

**Step 1:** Create assets folder and add logo:
```bash
mkdir e:\mev-dashboard\assets
# Place your logo file there: overdrive-shield-logo.svg
```

**Step 2:** Replace placeholder in `index.html`:
```html
<div class="logo-container">
    <img src="./assets/overdrive-shield-logo.svg" alt="Overdrive Shield">
</div>
```

**Or for PNG:**
```html
<div class="logo-container">
    <img src="./assets/overdrive-shield-logo.png" alt="Overdrive Shield">
</div>
```

---

## 🎨 Logo Design Recommendations

### For Best Results

**If creating a new logo:**

1. **Aspect Ratio:** 4:1 to 5:1 (horizontal)
   - Example: 250px × 50px
   - Example: 200px × 50px

2. **Colors:**
   - Use from your palette:
     - Primary Red: `#E10600`
     - Yellow Accent: `#FFD700`
     - White: `#FFFFFF`

3. **Visibility:**
   - Test on dark background (`#15151E`)
   - Ensure good contrast
   - Avoid thin lines (<2px)

4. **Style:**
   - Modern, clean design
   - Tech/Security theme
   - Readable at 50px height

---

## 🔧 CSS Styling (Already Applied)

The logo container has these styles:

```css
.logo-container {
    height: 50px;              /* Fixed height */
    display: flex;
    align-items: center;
    justify-content: flex-start;
}

.logo-container svg,
.logo-container img {
    height: 100%;              /* Fills 50px height */
    width: auto;               /* Maintains aspect ratio */
    max-width: 300px;          /* Prevents oversized logos */
}
```

**What this means:**
- Your logo will be **50px tall**
- Width adjusts automatically
- Won't exceed 300px wide
- Centered vertically in header

---

## 📍 Current Layout

```
┌───────────────────────────────────────────────────────┐
│ [Your Logo Here - 50px height]      [● Live] [Wallet] │
│ ←─ Auto width (max 300px) ─→                          │
├───────────────────────────────────────────────────────┤
│ Contract: 0xe723...4ec1                               │
│ 🔬 Alchemy: 0 addresses tracked                       │
└───────────────────────────────────────────────────────┘
```

---

## ✏️ Quick Copy-Paste Templates

### Template 1: Simple SVG Text Logo
```html
<div class="logo-container">
    <svg viewBox="0 0 260 50" xmlns="http://www.w3.org/2000/svg">
        <!-- Shield icon -->
        <circle cx="25" cy="25" r="20" fill="#E10600" stroke="#FFD700" stroke-width="3"/>
        <text x="30" y="30" font-size="24" fill="#FFD700" font-weight="bold">🛡️</text>
        
        <!-- Brand name -->
        <text x="55" y="32" font-family="Orbitron, sans-serif" font-size="26" 
              font-weight="900" fill="#FFFFFF">OVERDRIVE SHIELD</text>
    </svg>
</div>
```

### Template 2: Image File
```html
<div class="logo-container">
    <img src="./assets/overdrive-shield-logo.svg" 
         alt="Overdrive Shield"
         style="filter: drop-shadow(0 0 10px rgba(225, 6, 0, 0.3));">
</div>
```

### Template 3: Inline SVG with Gradient
```html
<div class="logo-container">
    <svg viewBox="0 0 240 50" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#E10600;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FF1E00;stop-opacity:1" />
            </linearGradient>
        </defs>
        <text x="10" y="35" font-family="Orbitron" font-size="32" 
              font-weight="900" fill="url(#logoGradient)">OVERDRIVE SHIELD</text>
    </svg>
</div>
```

---

## 🎯 Adding Effects (Optional)

### Glow Effect
```html
<div class="logo-container">
    <svg viewBox="0 0 240 50" style="filter: drop-shadow(0 0 20px rgba(225, 6, 0, 0.5));">
        <!-- Your logo SVG -->
    </svg>
</div>
```

### Hover Animation
Add to CSS:
```css
.logo-container svg,
.logo-container img {
    transition: all 0.3s ease;
}

.logo-container:hover svg,
.logo-container:hover img {
    transform: scale(1.05);
    filter: drop-shadow(0 0 25px rgba(225, 6, 0, 0.7));
}
```

---

## 📏 Testing Your Logo

### Checklist

After adding your logo, verify:

- [ ] Logo displays at correct size (50px height)
- [ ] Logo is readable/clear
- [ ] Colors match brand (red/yellow/white)
- [ ] Logo doesn't overlap status bar
- [ ] Logo looks good on dark background
- [ ] No pixelation (if using PNG, use 2x size: 100px height)
- [ ] Mobile-friendly (test at smaller widths)

### Test at Different Sizes

```css
/* Temporary test - add to CSS, then remove */
.logo-container { height: 40px; } /* Small */
.logo-container { height: 50px; } /* Normal (default) */
.logo-container { height: 60px; } /* Large */
```

---

## 🐛 Troubleshooting

### Logo Too Small
```css
.logo-container {
    height: 60px; /* Increase from 50px */
}
```

### Logo Too Large/Wide
Already limited to 300px max width. If still too wide:
```css
.logo-container svg,
.logo-container img {
    max-width: 200px; /* Reduce from 300px */
}
```

### Logo Not Centered
```css
.logo-container {
    align-items: center; /* Already set */
    justify-content: center; /* Change from flex-start */
}
```

### SVG Not Rendering
- Check XML syntax (closing tags, quotes)
- Verify `viewBox` attribute
- Ensure SVG namespace: `xmlns="http://www.w3.org/2000/svg"`

### Image Not Loading
- Check file path: `./assets/logo.svg`
- Verify file exists in correct location
- Check file permissions
- Try absolute path for testing: `/assets/logo.svg`

---

## 📦 Exporting from Design Software

### From Figma
1. Select your logo
2. Export as SVG
3. Copy SVG code
4. Paste into `<div class="logo-container">`

### From Adobe Illustrator
1. File → Export → Export As
2. Format: SVG
3. SVG Options: Presentation Attributes
4. Copy code from exported file

### From Inkscape
1. File → Save As
2. Save as: Optimized SVG
3. Copy code from file

---

## 🎨 Color Codes Quick Reference

Use these in your logo:

```
Primary Red:    #E10600
Red Glow:       #FF1E00
Yellow:         #FFD700
White:          #FFFFFF
Black:          #15151E (background)
```

---

## ✅ Final Steps

1. **Replace placeholder** in `index.html` (line ~480)
2. **Save file**
3. **Refresh browser** (Ctrl+F5)
4. **Verify logo displays** correctly
5. **Test responsive** (resize browser window)

---

## 📞 Need Help?

### Common Issues:

**Q: Logo is blurry**  
A: Use SVG instead of PNG, or use 2x resolution PNG (100px height)

**Q: Logo colors don't match**  
A: Update SVG `fill` attributes to match color palette

**Q: Logo gets cut off on mobile**  
A: Reduce `max-width` or use responsive viewBox

---

## 🚀 Example: Complete Integration

Here's a complete example showing where everything goes:

```html
<!-- In index.html around line 477 -->
<div class="header">
    <div class="header-content">
        <div class="branding">
            <div class="logo-container">
                <!-- YOUR LOGO GOES HERE -->
                <svg viewBox="0 0 240 50" xmlns="http://www.w3.org/2000/svg">
                    <text x="10" y="35" font-family="Orbitron" 
                          font-size="32" font-weight="900" fill="#FFFFFF">
                        OVERDRIVE
                    </text>
                    <text x="180" y="35" font-family="Orbitron" 
                          font-size="32" font-weight="900" fill="#FFD700">
                        SHIELD
                    </text>
                </svg>
            </div>
        </div>
        <div class="status-bar">
            <!-- Status and wallet button here -->
        </div>
    </div>
</div>
```

---

**🎨 Your logo space is ready! Just paste your SVG code or add an image file path.**
