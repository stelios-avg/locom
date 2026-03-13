# 🎨 App Logo Guide

## Logo Files Needed

### For Google Play Store:
- **512x512px PNG** (required)
- Transparent background (optional but recommended)

### For Android App Icons:
- **mdpi**: 48x48px
- **hdpi**: 72x72px
- **xhdpi**: 96x96px
- **xxhdpi**: 144x144px
- **xxxhdpi**: 192x192px

## Quick Options

### Option 1: Use Online Tools

**Android Asset Studio** (Recommended):
1. Go to: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. Upload your 512x512px logo
3. Download all sizes automatically
4. Extract to `android/app/src/main/res/mipmap-*/`

**Canva**:
1. Create 512x512px design
2. Export as PNG
3. Use Android Asset Studio to generate all sizes

### Option 2: Convert SVG to PNG

I've created a basic SVG logo at `public/logo.svg`. You can convert it:

**Using Online Converter:**
- https://convertio.co/svg-png/
- Upload `public/logo.svg`
- Set size to 512x512px
- Download PNG

**Using Command Line (if you have ImageMagick):**
```bash
# Install ImageMagick first: brew install imagemagick
convert -background none -resize 512x512 public/logo.svg public/logo-512.png
```

### Option 3: Design Your Own

**Tools:**
- **Figma** (free, web-based)
- **Canva** (free, templates)
- **Adobe Illustrator** (paid)
- **GIMP** (free, desktop)

**Design Tips:**
- Keep it simple and recognizable
- Use your brand colors (#16a34a green)
- Ensure it looks good at small sizes
- Test on different backgrounds

## Current Logo

I've created a basic SVG logo with:
- Green background (#16a34a - your brand color)
- "LO" letters (for Locom)
- Simple, modern design

**Location:** `public/logo.svg`

## Steps to Use

1. **Convert SVG to PNG:**
   - Use online converter or ImageMagick
   - Create 512x512px PNG

2. **Generate All Sizes:**
   - Use Android Asset Studio
   - Upload your 512x512px PNG
   - Download generated icons

3. **Replace Android Icons:**
   ```bash
   # Copy icons to Android project
   # mdpi: 48x48
   # hdpi: 72x72
   # xhdpi: 96x96
   # xxhdpi: 144x144
   # xxxhdpi: 192x192
   ```

4. **Update App Icon:**
   - Icons should be in: `android/app/src/main/res/mipmap-*/ic_launcher.png`
   - Also update `ic_launcher_round.png` and `ic_launcher_foreground.png`

## Google Play Store Icon

For Google Play, you need:
- **512x512px PNG**
- No transparency (solid background recommended)
- High quality
- Upload in Google Play Console → Store listing → App icon

## Quick Command to Generate All Sizes

If you have ImageMagick installed:

```bash
# Create all Android icon sizes
sizes=(48 72 96 144 192)
density=(mdpi hdpi xhdpi xxhdpi xxxhdpi)

for i in "${!sizes[@]}"; do
  size=${sizes[$i]}
  density_name=${density[$i]}
  convert -background none -resize ${size}x${size} public/logo.svg android/app/src/main/res/mipmap-${density_name}/ic_launcher.png
done
```

## Need a Better Logo?

If you want a more professional logo:
1. Hire a designer (Fiverr, 99designs)
2. Use AI tools (DALL-E, Midjourney)
3. Use logo generators (LogoMaker, Hatchful)

---

**Current Status:**
- ✅ Basic SVG logo created at `public/logo.svg`
- ⏳ Need to convert to PNG
- ⏳ Need to generate all Android sizes
- ⏳ Need to update Android project




