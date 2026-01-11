# Loading Animation Update

## Summary
Replaced all full-page loading states with a custom animated logo featuring a shimmer/reflection effect.

## What Was Created

### 1. LoadingLogo Component
**Path:** `src/modules/common/components/loading-logo/`

**Features:**
- Uses the SVG logo (`Final Logo BW.svg`)
- Shimmer/reflection effect that sweeps across diagonally
- Subtle pulse animation
- Three sizes: `sm`, `md`, `lg`
- Auto-adapts to light/dark backgrounds

**Usage:**
```tsx
import LoadingLogo from "@modules/common/components/loading-logo"

<LoadingLogo size="md" />
```

### 2. CSS Animations
**File:** `src/modules/common/components/loading-logo/loading-logo.css`

**Animations:**
- `shimmer`: 2.5s diagonal reflection sweep
- `pulse`: Subtle breathing effect

## What Was Updated

### Full-Page Loading States
All replaced with `<LoadingLogo />`:

1. ✅ **Account Loading** - `src/app/[countryCode]/(main)/account/loading.tsx`
2. ✅ **Dashboard Loading** - `src/app/[countryCode]/(main)/account/@dashboard/loading.tsx`
3. ✅ **Page Transition Loader** - `src/modules/common/components/page-transition-loader/index.tsx`
   - Removed "Loading..." text
   - Removed DotSpinner
   - Added animated logo in center

### What Was NOT Changed
- **LoadingButton** - Still uses DotSpinner (appropriate for inline buttons)
- **Cart Loading** - Uses SkeletonCartPage (shows cart structure)
- **Order Confirmed Loading** - Uses SkeletonOrderConfirmed (shows order structure)

## Testing

### Demo Page
Visit: `/loading-demo` to see the animation in different contexts:
- Light background
- Dark background
- Different sizes

### Test Loading States
1. Navigate to account page to see loading state
2. Click between pages to see page transition loader
3. Check that the animation is smooth and professional

## Technical Details

### Why SVG?
- Infinitely scalable (crisp on any screen)
- Smaller file size
- Better animation performance
- Perfect for geometric shapes like the logo

### Animation Performance
- Uses CSS transforms and opacity (GPU accelerated)
- No JavaScript after initial render
- Minimal performance impact

## Future Improvements
- Could add different animation styles (rotate, fade, etc.)
- Could make animation speed customizable
- Could add color variants for different themes
