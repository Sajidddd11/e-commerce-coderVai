# ZAHAN Custom Fonts Usage Guide

## 🎨 Fonts Implemented

### **North** (OTF)
- **Usage**: Headings, Titles, CTAs, Brand Text, Focus Areas
- **Purpose**: Draws attention, creates impact
- **File**: `/public/North.otf`

### **Neue Hans Kendrick** (TTF)  
- **Usage**: Body text, Descriptions, Navigation, General Content
- **Purpose**: Readable, clean, professional
- **File**: `/public/NeueHansKendrick-Regular.ttf`

---

## 🚀 How to Use

### **Method 1: Typography Utility Classes (Recommended)**

```tsx
// Headings & Focus Areas
<h1 className="typography-hero">Welcome to ZAHAN</h1>
<h2 className="typography-section-heading">Featured Products</h2>
<h3 className="typography-subheading">Limited Edition</h3>

// Product Titles (North - for attention)
<h4 className="typography-product-title">Premium Perfume</h4>

// Body Text & Descriptions (Neue Hans Kendrick)
<p className="typography-body">This is a description of our amazing products...</p>
<p className="typography-product-desc">Product details go here...</p>

// Buttons & CTAs (North - for focus)
<button className="typography-button">Add to Cart</button>

// Navigation (Neue Hans Kendrick)
<nav className="typography-nav">Menu Items</nav>

// Footer (Neue Hans Kendrick)
<footer className="typography-footer">© 2026 ZAHAN</footer>
```

---

### **Method 2: Direct Font Classes**

```tsx
// Use North directly
<h1 className="font-north text-3xl font-bold">Heading with North</h1>

// Use Neue Hans Kendrick directly
<p className="font-kendrick text-base">Body text with Kendrick</p>

// Default (Neue Hans Kendrick is now the default sans)
<div className="font-sans">This will use Neue Hans Kendrick</div>
```

---

### **Method 3: Legacy Support**

Old code will still work! We've mapped the legacy font classes:
- `font-montserrat` → now uses **North**
- `font-inter` → now uses **Neue Hans Kendrick**

```tsx
// These still work (legacy code)
<h1 className="font-montserrat">Uses North</h1>
<p className="font-inter">Uses Neue Hans Kendrick</p>
```

---

## 📋 Complete Typography System

| Class | Font | Usage |
|-------|------|-------|
| `.typography-brand` | North | Logo, Brand Text |
| `.typography-hero` | North | Main Hero Headings |
| `.typography-section-heading` | North | Section Titles |
| `.typography-subheading` | North | Subheadings |
| `.typography-product-title` | North | Product Names (focus) |
| `.typography-button` | North | Buttons & CTAs |
| `.typography-body` | Kendrick | Body Paragraphs |
| `.typography-product-desc` | Kendrick | Product Details |
| `.typography-nav` | Kendrick | Navigation Menus |
| `.typography-footer` | Kendrick | Footer Text |

---

## 🎯 Design Philosophy

**North**: Bold, attention-grabbing
- Headings that need to stand out
- Call-to-action buttons
- Product titles
- Brand elements

**Neue Hans Kendrick**: Clean, readable  
- Long-form content
- Descriptions
- Navigation
- General UI text

---

## ✅ Already Applied Site-Wide

The fonts are now the default across your entire site:
- All headings automatically use **North**
- All body text automatically uses **Neue Hans Kendrick**
- No code changes needed for existing components!

---

## 🔧 Technical Details

### Font Loading
```css
@font-face {
  font-family: 'North';
  src: url('/North.otf') format('opentype');
  font-display: swap;
}

@font-face {
  font-family: 'Neue Hans Kendrick';
  src: url('/NeueHansKendrick-Regular.ttf') format('truetype');
  font-display: swap;
}
```

### Performance
- `font-display: swap` ensures text remains visible during font loading
- Fonts are loaded from local `/public` directory for fast access
- No external HTTP requests needed

---

## 🌟 Examples in Your Site

**Footer Headings** (North):
```tsx
<h3 className="text-white font-semibold text-base mb-4">Shop</h3>
// Uses North via font-semibold
```

**Footer Links** (Neue Hans Kendrick):
```tsx
<a className="text-gray-400 text-sm">About ZAHAN</a>
// Uses Neue Hans Kendrick (default sans)
```

**Product Cards** (Mixed):
```tsx
<h3 className="typography-product-title">Product Name</h3>  {/* North */}
<p className="typography-product-desc">Description...</p>   {/* Kendrick */}
```

---

Enjoy your new premium typography! 🎨✨
