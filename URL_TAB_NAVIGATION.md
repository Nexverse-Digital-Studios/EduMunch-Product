# URL-Based Tab Navigation Implementation

## Overview

All tabs in the application now use URL query parameters to maintain state, making navigation history-proof and shareable.

## Timetable Module Navigation

### Main Timetable Route

Base route: `/timetable`

### Tab-Based Sub-Routes

| Tab                 | URL                                        | Module    | Action |
| ------------------- | ------------------------------------------ | --------- | ------ |
| Dashboard (Default) | `/timetable` or `/timetable?tab=dashboard` | timetable | view   |
| View Timetables     | `/timetable?tab=view`                      | timetable | view   |
| Create Timetable    | `/timetable?tab=create`                    | timetable | create |
| Bulk Schedule       | `/timetable?tab=bulk`                      | timetable | create |
| View Conflicts      | `/timetable?tab=conflicts`                 | timetable | view   |
| Substitute Teacher  | `/timetable?tab=substitute`                | timetable | update |
| Period Settings     | `/timetable?tab=periods`                   | timetable | update |
| Export Timetable    | `/timetable?tab=export`                    | timetable | export |

### Special Routes

- Section Timetable: `/timetable/view/:sectionId`
- Edit Timetable: `/timetable/:id/edit`
- My Timetable: `/my-timetable`

## Implementation Details

### Benefits

✅ **History-Proof**: Browser back/forward buttons work correctly
✅ **Shareable**: URLs can be bookmarked and shared with specific tabs
✅ **SEO-Friendly**: Each tab is indexable as a separate page
✅ **Persistent State**: Tab state survives page refreshes
✅ **Clean Navigation**: No separate routes cluttering the router config

### How It Works

1. **URL Parameter Reading**

   ```typescript
   const [searchParams, setSearchParams] = useSearchParams();
   const activeTab = searchParams.get("tab") || "dashboard";
   ```

2. **Tab Change Handler**

   ```typescript
   const handleTabChange = (tab: string) => {
     setSearchParams({ tab }, { replace: true });
   };
   ```

3. **Tab Binding**
   ```typescript
   <Tabs value={activeTab} onValueChange={handleTabChange}>
   ```

### Adding New Tabs

To add a new tab with URL navigation:

1. Add to `TabsList`:

   ```typescript
   <TabsTrigger value="new-tab">New Tab</TabsTrigger>
   ```

2. Add to `TabsContent`:

   ```typescript
   <TabsContent value="new-tab">
     <NewTabComponent />
   </TabsContent>
   ```

3. Update route config in `routeConfig.ts`:
   ```typescript
   { path: '/timetable?tab=new-tab', title: 'New Tab', module: 'timetable', action: 'view', tier: 1 },
   ```

## Example Usage

**User clicks "View Timetables" tab:**

```
Before: /timetable
After: /timetable?tab=view
```

**Browser back button:**

```
/timetable?tab=view → /timetable (back to dashboard)
```

**Direct URL access:**

```
User types: /timetable?tab=create
App loads: Create Timetable tab directly
```

**Bookmark:**

```
User bookmarks: /timetable?tab=conflicts
Next visit opens Conflicts tab directly
```

## Route Configuration

All routes are defined in `src/routes/routeConfig.ts` under `timetableRoutes` array.

## Components Affected

- `TimetableDashboard.tsx`: Uses `useSearchParams` hook for URL-based tab management
- Route config updated to reflect tab-based URLs
