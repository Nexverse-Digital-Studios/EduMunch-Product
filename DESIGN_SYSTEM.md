# EduMunch - Design System & Style Guide

## 🎨 Color Palette

### Primary Color Scheme
```
Primary Blue (Cyan):
  50:  #f0f9ff
  100: #e0f2fe
  200: #bae6fd
  300: #7dd3fc
  400: #38bdf8
  500: #0ea5e9  ← Main color
  600: #0284c7
  700: #0369a1
  800: #075985
  900: #0c3d66
```

Used for:
- Primary buttons and actions
- Links and highlights
- Active states
- Brand elements

### Success Color (Green)
```
  50:  #f0fdf4
  100: #dcfce7
  200: #bbf7d0
  300: #86efac
  400: #4ade80
  500: #22c55e  ← Success color
  600: #16a34a
  700: #15803d
```

Used for:
- Success messages
- Positive feedback
- Completed items
- Growth indicators

### Warning Color (Amber)
```
  50:  #fffbeb
  100: #fef3c7
  200: #fde68a
  300: #fcd34d
  400: #fbbf24
  500: #f59e0b  ← Warning color
  600: #d97706
  700: #b45309
```

Used for:
- Warnings and cautions
- Pending items
- Items needing attention
- Alternative actions

### Danger Color (Red)
```
  50:  #fef2f2
  100: #fee2e2
  200: #fecaca
  300: #fca5a5
  400: #f87171
  500: #ef4444  ← Danger color
  600: #dc2626
  700: #b91c1c
```

Used for:
- Errors and critical items
- Delete actions
- Alert messages
- Negative feedback

### Neutral Color (Gray)
```
  50:  #f9fafb
  100: #f3f4f6
  200: #e5e7eb
  300: #d1d5db
  400: #9ca3af
  500: #6b7280
  600: #4b5563
  700: #374151
  800: #1f2937
  900: #111827
```

Used for:
- Text (700-900)
- Backgrounds (50-100)
- Borders (200-300)
- Disabled states (400-500)

---

## 📐 Typography

### Font Family
- Body: System default (sans-serif)
- Monospace: System default (monospace)

### Font Sizes
```
xs:   0.75rem  (12px)  - Small labels, badges
sm:   0.875rem (14px)  - Form labels, hints
base: 1rem     (16px)  - Body text
lg:   1.125rem (18px)  - Subsections
xl:   1.25rem  (20px)  - Section headers
2xl:  1.5rem   (24px)  - Page headers
3xl:  1.875rem (30px)  - Large titles
4xl:  2.25rem  (36px)  - Hero sections
```

### Font Weights
- Regular: 400 - Body text
- Medium: 500 - Emphasis, form labels
- Semibold: 600 - Section titles, buttons
- Bold: 700 - Headers, emphasis
- Bold: 900 - Major headings

### Line Heights
- Tight: 1rem
- Normal: 1.5rem
- Relaxed: 1.75rem
- Loose: 2rem

---

## 🎯 Components & States

### Buttons

#### Primary Button
```
Background: Primary Blue 600
Text: White
Padding: 0.5rem 1rem
Border Radius: 0.5rem
Hover: Primary Blue 700
Active: Primary Blue 800
Disabled: Neutral 300 (bg), Neutral 500 (text)
```

#### Secondary Button
```
Background: Neutral 200
Text: Neutral 900
Padding: 0.5rem 1rem
Border Radius: 0.5rem
Hover: Neutral 300
```

#### Danger Button
```
Background: Danger 600
Text: White
Padding: 0.5rem 1rem
Hover: Danger 700
```

### Cards & Containers

#### Stats Card
```
Background: White
Border: 2px solid (color-specific)
Padding: 1.5rem
Border Radius: 0.5rem
Hover: Shadow increase (md)
Colors: Primary, Success, Warning, Danger variants
```

#### Data Table
```
Header Background: Neutral 100
Header Text: Neutral 700
Row Background: White
Hover Row: Neutral 50
Border: 1px solid Neutral 200
```

### Form Elements

#### Input Fields
```
Background: White
Border: 1px solid Neutral 200
Padding: 0.5rem 1rem
Border Radius: 0.5rem
Focus: Ring 2px Primary 500, Offset 2px
Text: Neutral 900
Placeholder: Neutral 500
Disabled: Neutral 100 bg, Neutral 400 text
```

#### Labels
```
Font Size: sm (14px)
Font Weight: medium (500)
Color: Neutral 700
Margin Bottom: 0.5rem
```

### Badges

#### Success Badge
```
Background: Success 100
Text: Success 800
Padding: 0.25rem 0.625rem
Border Radius: 9999px
Font Size: xs
Font Weight: semibold
```

Similar variations for Warning, Danger, Primary

---

## 🌓 Spacing System

### Margin & Padding Units (in rem)
```
0:    0
1:    0.25rem (4px)
2:    0.5rem  (8px)
3:    0.75rem (12px)
4:    1rem    (16px)
6:    1.5rem  (24px)
8:    2rem    (32px)
12:   3rem    (48px)
16:   4rem    (64px)
```

### Common Spacing Patterns
- Small spacing: `gap-2`, `p-3`, `m-2`
- Medium spacing: `gap-4`, `p-4`, `m-4`
- Large spacing: `gap-6`, `p-6`, `m-6`
- Extra large: `gap-8`, `p-8`, `m-8`

---

## 🎬 Animations

### Transitions
```
Duration: 300ms (default)
Timing: ease-out
Property: colors, shadows, transforms
```

### Entrance Animations
- `animate-slide-in-left`: Slide from left
- `animate-slide-in-right`: Slide from right
- Used on page loads and modal opens

### Hover Effects
- `card-hover`: Shadow increase + scale
- Smooth color transitions
- Icon color changes

---

## 📱 Responsive Breakpoints

```
Mobile:    < 640px   (sm)
Tablet:    640px - 1024px (md, lg)
Desktop:   1024px+   (xl, 2xl)
```

### Responsive Patterns
- Stack vertically on mobile
- 2 columns on tablet
- 3-4 columns on desktop
- Hide secondary elements on mobile
- Show hamburger menu on mobile

---

## 🎨 Sidebar Styling

### Expanded State
- Width: 264px (16rem)
- Shows logo, text labels, section titles
- Background: White
- Border right: 1px solid Neutral 200

### Collapsed State
- Width: 80px (5rem)
- Shows only icons
- Tooltip on hover
- Smooth 300ms transition

### Active Item
- Background: Primary 100
- Text: Primary 700
- Rounded: 0.5rem
- Padding: 0.75rem 1rem

### Hover Item (Inactive)
- Background: Neutral 100
- Text: Neutral 700
- Transition: Smooth 300ms

---

## 🧩 Common Layout Patterns

### Dashboard Grid
```
1 Column:  Mobile (< 640px)
2 Columns: Tablet (640px - 1023px)
4 Columns: Desktop (1024px+)
Gap: 1.5rem
```

### Form Layout
```
Label above input (full width)
Gap between fields: 1.5rem
Error text: sm size, Danger 600 color
Help text: xs size, Neutral 500 color
```

### Modal/Dialog
```
Max Width: 28rem (md) or 36rem (lg)
Padding: 1.5rem
Border Radius: 0.5rem
Shadow: lg
Backdrop: black/50
```

---

## 🌐 CSS Custom Properties (Ready to Implement)

```css
--color-primary: #0ea5e9
--color-success: #22c55e
--color-warning: #f59e0b
--color-danger: #ef4444
--color-neutral-900: #111827

--spacing-sidebar: 16rem
--spacing-sidebar-collapsed: 5rem

--duration-fast: 150ms
--duration-normal: 300ms
--duration-slow: 500ms

--radius-sm: 0.375rem
--radius-md: 0.5rem
--radius-lg: 0.75rem
```

---

## 🎯 Design Principles Applied

1. **Consistency**: Same colors, spacing, typography across all pages
2. **Hierarchy**: Clear visual hierarchy with sizes and weights
3. **Accessibility**: WCAG AA compliant contrast ratios
4. **Responsiveness**: Mobile-first, works on all devices
5. **Feedback**: Hover, active, disabled states for all interactive elements
6. **Clarity**: Clear icons, labels, and visual feedback
7. **Performance**: GPU-accelerated animations

---

## 📊 Color Usage Examples

### Admin Dashboard Stats
- Active Students: Primary (Blue)
- New Admissions: Success (Green)
- Total Batches: Warning (Yellow)
- Open Doubts: Success (Green)
- Staff on Leave: Warning (Yellow)
- Payslips: Primary (Purple/Blue)
- Open Tickets: Danger (Red)
- Open Grievances: Danger (Red)

### Form States
- Default: Neutral 200 border
- Focus: Primary 500 ring
- Error: Danger 500 ring
- Success: Success 500 ring
- Disabled: Neutral 200 bg, Neutral 400 text

---

## 🚀 Implementing Custom Themes

To add a dark theme or custom color scheme:

1. Create new colors in `tailwind.config.js`
2. Add theme toggle in `App.tsx`
3. Use CSS variables or Tailwind classes
4. Apply to `html` or body element

Example:
```
html.dark {
  @apply bg-neutral-900 text-neutral-50;
}

html.dark .card {
  @apply bg-neutral-800 border-neutral-700;
}
```

---

## ✅ Checklist for New Components

- [ ] Color scheme matches design system
- [ ] Typography follows hierarchy
- [ ] Spacing is consistent (multiples of 4px)
- [ ] Hover/active states defined
- [ ] Mobile responsive
- [ ] Accessibility standards met
- [ ] Icons are Lucide React
- [ ] Animation is smooth (300ms default)

---

**Design System Complete!** 🎉

All components follow this system for consistency and professionalism.
