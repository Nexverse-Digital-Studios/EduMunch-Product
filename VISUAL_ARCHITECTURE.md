# EduMunch - Visual Architecture & UI Guide

## 🎯 Application Layout

```
┌─────────────────────────────────────────────────────────────┐
│                         NAVBAR                              │
│  ┌──────────┬────────────────────────────────────────────┐ │
│  │ Title    │  Notifications    User Profile   Logout    │ │
│  └──────────┴────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  │                                                           │
│  │  SIDEBAR    MAIN CONTENT AREA                           │
│  │  ┌──────┐  ┌──────────────────────────────────────┐   │
│  │  │ Logo │  │  Welcome Section (Gradient BG)       │   │
│  │  │      │  │                                       │   │
│  │  │ Menu │  │  Stat Cards (Responsive Grid)        │   │
│  │  │Items │  │  ┌──────┐ ┌──────┐ ┌──────┐        │   │
│  │  │  >   │  │  │      │ │      │ │      │        │   │
│  │  │  >   │  │  └──────┘ └──────┘ └──────┘        │   │
│  │  │  >   │  │                                       │   │
│  │  │      │  │  Announcements   Quick Actions       │   │
│  │  │      │  │  ┌─────────────┐  ┌──────────────┐  │   │
│  │  │      │  │  │             │  │              │  │   │
│  │  │      │  │  └─────────────┘  └──────────────┘  │   │
│  │  │      │  │                                       │   │
│  │  │      │  │  More Stats & Info Cards             │   │
│  │  │      │  │  ┌──────┐ ┌──────┐ ┌──────┐        │   │
│  │  │      │  │  │      │ │      │ │      │        │   │
│  │  └──────┘  │  └──────┘ └──────┘ └──────┘        │   │
│  │            │                                       │   │
│  └────────────┴──────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────────┘

Mobile Version (< 768px):
┌────────────────────────┐
│  ☰ (Hamburger)  |Title │  ← Navbar
├────────────────────────┤
│                        │
│  MAIN CONTENT          │
│  (Full Width)          │
│                        │
│  [Floating FAB] ↙      │  ← Sidebar on overlay
│                        │
└────────────────────────┘
```

---

## 🎨 Component Hierarchy

```
App (Root)
├── MainLayout
│   ├── Sidebar
│   │   ├── Logo Section
│   │   ├── NavSection[]
│   │   │   └── SidebarNavItem[]
│   │   │       ├── Text + Icon
│   │   │       └── Dropdown Menu
│   │   └── Mobile Overlay
│   │
│   ├── Navbar
│   │   ├── Title Display
│   │   ├── Notification Bell
│   │   └── User Menu
│   │
│   └── Content Area (Routes)
│       ├── AdminDashboard
│       │   ├── Welcome Card
│       │   ├── StatCard[] (14 items)
│       │   ├── Announcements Section
│       │   ├── Quick Actions
│       │   └── Info Cards
│       │
│       ├── StudentDashboard
│       ├── TeacherDashboard
│       ├── ParentDashboard
│       │
│       └── Feature Pages (PlaceholderPage)
│           ├── Search Bar
│           ├── Filter Button
│           └── Empty State
```

---

## 📱 Responsive Breakpoints Visual

```
MOBILE (< 640px)              TABLET (640px - 1024px)
┌──────────────────┐          ┌────────────────────────┐
│ ☰ Title          │          │ ☰ | Title              │
├──────────────────┤          ├────────────────────────┤
│                  │          │    │                    │
│  Full Width      │          │ S  │  Content (2 cols)  │
│  Content         │          │ I  │  ┌──────┬──────┐   │
│                  │          │ D  │  │      │      │   │
│  ┌──────────┐    │          │ E  │  └──────┴──────┘   │
│  │  CARD   │    │          │ B  │                    │
│  └──────────┘    │          │ A  │                    │
│                  │          │ R  │                    │
│  ┌──────────┐    │          │    │                    │
│  │  CARD   │    │          │    │                    │
│  └──────────┘    │          └────────────────────────┘
│                  │          
│  [+] FAB         │          DESKTOP (> 1024px)
└──────────────────┘          ┌────────────────────────┐
                              │ Dashboard              │
                              ├────────────────────────┤
                              │ │ SIDEBAR │            │
                              │ │ (264px) │  Content  │
                              │ │         │  (4 cols) │
                              │ │         │  ┌─┬─┬─┬─┐│
                              │ │ MENU    │  │ │ │ │ ││
                              │ │         │  └─┴─┴─┴─┘│
                              │ │  >  >   │            │
                              │ │         │            │
                              │ │         │            │
                              └────────────────────────┘
```

---

## 🎯 Stat Card Design

```
┌──────────────────────────────────────┐
│ Label (Small Gray Text)              │
│                                      │
│ 42   ┐                               │
│ (Large Bold)  └─ Icon Box (colored) │
│                                      │
│ ↗ 12% this month  (Trend)            │
└──────────────────────────────────────┘

Colors:
Primary:  Blue BG    | Blue Border    | Blue Icon
Success:  Green BG   | Green Border   | Green Icon
Warning:  Yellow BG  | Yellow Border  | Yellow Icon
Danger:   Red BG     | Red Border     | Red Icon
```

---

## 🧭 Navigation Sidebar States

### EXPANDED (Desktop)
```
┌──────────────┐
│ [EM] EduMunch│
│═════════════════
│ MAIN         │
│ • Dashboard  │
│              │
│ ACADEMICS    │
│ • Admissions │
│   > Admissions
│   > Enrollments
│   > Payments
│ • Academics  │
│   > Courses  │
│   > Subjects │
│   > ...      │
│              │
│ MANAGEMENT   │
│ • Admin [>]  │
│ • HR [>]     │
│              │
│ COMMUNICATION│
│ • Comms [>]  │
│              │
│ ANALYTICS    │
│ • Analytics [>]
│              │
│ CONFIGURATION│
│ • Settings   │
└──────────────┘
```

### COLLAPSED (Desktop)
```
┌──┐
│EM│
├──┤
│∷ │  ← Dashboard
│   │
│📋│  ← Admissions (hovering shows label)
│📚│  ← Academics
│👥│  ← Administration
│⚙ │  ← Settings
│   │
└──┘
```

### MOBILE (Hamburger)
```
When closed: ☰ button in navbar
When open:  Full sidebar overlay with:
             - Logo
             - All items with labels
             - X close button
             - Transparent backdrop
```

---

## 📊 Dashboard Layout

### Welcome Card
```
┌────────────────────────────────────────┐
│  Welcome back, Super Admin!            │
│  Here's a quick overview of your portal│
│                                        │  ← Gradient Blue
│                 (Padding)              │
└────────────────────────────────────────┘
```

### Stats Grid
```
Desktop (4 columns):
┌──────┬──────┬──────┬──────┐
│ Stat1│ Stat2│ Stat3│ Stat4│
├──────┼──────┼──────┼──────┤
│ Stat5│ Stat6│ Stat7│ Stat8│
└──────┴──────┴──────┴──────┘

Tablet (2 columns):
┌──────┬──────┐
│ Stat1│ Stat2│
├──────┼──────┤
│ Stat3│ Stat4│
├──────┼──────┤
│ Stat5│ Stat6│
└──────┴──────┘

Mobile (1 column):
┌──────┐
│ Stat1│
├──────┤
│ Stat2│
├──────┤
│ Stat3│
└──────┘
```

### Content Sections
```
3-Column Layout (Desktop):
┌─────────────────────────┬─────────────┐
│  Announcements (2/3)    │ Actions(1/3)│
├─────────────────────────┼─────────────┤
│                         │             │
│                         │             │
└─────────────────────────┴─────────────┘

2-Column Layout (Tablet):
┌─────────────┐
│Announcements│
├─────────────┤
│ Actions     │
├─────────────┤
│Stats        │
└─────────────┘

1-Column Layout (Mobile):
┌─────────────┐
│Announcements│
├─────────────┤
│ Actions     │
├─────────────┤
│Stats        │
└─────────────┘
```

---

## 🎨 Color Usage in UI

```
Primary (Blue):
├─ Logo background
├─ Active navigation item
├─ Primary buttons
├─ Links and highlights
└─ Primary stat cards

Success (Green):
├─ Success stat cards
├─ Positive trends
├─ Available/Present indicators
└─ Success badges

Warning (Yellow):
├─ Warnings and cautions
├─ Pending items
├─ Staff on leave
└─ Installments due

Danger (Red):
├─ Errors
├─ Critical items
├─ Open grievances
├─ Close buttons
└─ Danger badges

Neutral (Gray):
├─ Text (700-900 for dark)
├─ Backgrounds (50-100 for light)
├─ Borders (200-300)
└─ Disabled states (400)
```

---

## ✨ Animations & Transitions

### Sidebar
```
Expansion: 300ms ease-out
├─ Width: 80px → 264px
├─ Labels fade in
├─ Menu items slide right
└─ Icons move left

Mobile Open: 300ms ease-out
├─ Slide from left
├─ Backdrop fade in
└─ X button appears
```

### Page Transitions
```
Entry: animate-slide-in-left (300ms)
├─ Opacity: 0 → 1
├─ Transform: translateX(-10px) → 0
└─ Applied to main content

Hover Effects: 300ms smooth
├─ Card shadow increase
├─ Background color change
└─ Icon color change
```

### Interactive States
```
Button:
├─ Normal: Primary 600
├─ Hover: Primary 700 + shadow
├─ Active: Primary 800
└─ Disabled: Neutral 300

Input:
├─ Normal: White bg, Neutral 200 border
├─ Focus: Ring 2px Primary 500
├─ Error: Ring 2px Danger 500
└─ Disabled: Neutral 100 bg
```

---

## 📐 Spacing & Alignment

```
Vertical Rhythm (Base = 0.25rem / 4px):
├─ xs:  4px   (1 unit)
├─ sm:  8px   (2 units)
├─ base: 16px (4 units)
├─ md:  24px  (6 units)
├─ lg:  32px  (8 units)
└─ xl:  48px  (12 units)

Horizontal Alignment:
├─ Component padding: 24px (6 units)
├─ Gap between items: 24px (6 units)
├─ Max width: 80rem (1280px)
└─ Content padding: 24px-32px

Responsive Padding:
├─ Mobile: 16px
├─ Tablet: 24px
└─ Desktop: 32px
```

---

## 🔄 User Flows

### Navigation Flow
```
1. User clicks menu item
2. Highlight active item (Primary 100 bg)
3. Navigate to page
4. Page title updates in navbar
5. Breadcrumb shows location (future)
```

### Dashboard Interaction
```
1. Load dashboard
2. Show welcome card (gradient)
3. Load stat cards with animation
4. Show recent announcements
5. Display quick actions
```

### Mobile Menu Flow
```
1. User clicks hamburger menu
2. Sidebar slides from left
3. Backdrop appears (semi-transparent)
4. User clicks item
5. Navigation happens
6. Sidebar closes automatically
```

---

## 🎯 Icon Usage

```
Size Conventions:
├─ Navbar icons:    20px (w-5 h-5)
├─ Sidebar icons:   20px (w-5 h-5)
├─ Stat card icons: 24px (w-6 h-6)
├─ Buttons:         20px (w-5 h-5)
└─ Large blocks:    40-48px

Common Icons:
├─ Dashboard:       LayoutGrid
├─ Courses:         BookOpen
├─ Users:           Users
├─ Settings:        Settings
├─ Logout:          LogOut
├─ Menu:            Menu
├─ Close:           X
├─ Expand:          ChevronDown
├─ Search:          Search
└─ Notifications:   Bell
```

---

## 📊 Typography Hierarchy

```
Page Title (36px, Bold)
├─ EduMunch Dashboard

Section Header (24px, Semibold)
├─ Dashboard
├─ Welcome back, Super Admin!

Card Title (16px, Semibold)
├─ Recent Announcements
├─ Quick Actions

Body Text (14px, Regular)
├─ Description text
├─ Card content

Label (14px, Medium)
├─ Form labels
├─ Section labels

Small Text (12px, Regular)
├─ Timestamps
├─ Helper text
├─ Badges
```

---

## 🖼️ Grid System

```
Sidebar (Desktop):
├─ Expanded: 264px (16rem)
├─ Collapsed: 80px (5rem)
├─ Transition: 300ms

Content Area:
├─ Full width minus sidebar
├─ Max content width: 1280px
├─ Padding: 24-32px

Layout Grid:
├─ 1 column: Mobile (< 640px)
├─ 2 columns: Tablet (640px - 1023px)
├─ 3-4 columns: Desktop (1024px+)
├─ Gap: 24px (6 units)
└─ Responsive margins: auto
```

---

This visual guide helps understand the UI structure, layouts, and design system implementation.

**Ready to implement!** 🚀
