# EduMunch Phase 4 - Deployment Guide

## Pre-Deployment Checklist

- ✅ TypeScript Compilation: **PASS** (0 errors)
- ✅ Production Build: **SUCCESS** (683.66 KB)
- ✅ Gzip Compression: **170.03 KB**
- ✅ All routes properly configured
- ✅ Authentication integration verified
- ✅ Database migrations prepared

## Deployment Steps

### Step 1: Deploy Database Migration

The migration file is ready at: `supabase/migrations/20251213142027_add_remaining_features.sql`

**Option A: Using Supabase Dashboard**
1. Log into Supabase console
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the entire migration file content
5. Click "Execute" or press Ctrl+Enter
6. Verify all tables are created successfully

**Option B: Using CLI (if Supabase is running locally)**
```bash
cd "d:\All Code\EduMunch"
npx supabase migration up
```

**Tables to Verify Creation:**
- [ ] board_exams
- [ ] exam_results
- [ ] competitive_exams
- [ ] support_tickets
- [ ] working_hours
- [ ] salary_structures
- [ ] salary_earnings
- [ ] salary_deductions
- [ ] timetables
- [ ] timetable_slots
- [ ] topics
- [ ] topic_content

### Step 2: Verify RLS Policies

All tables have Row-Level Security policies. Verify by:
1. Checking each table in Supabase console
2. Ensuring "Enable RLS" is toggled ON
3. Verifying policies exist for SELECT, INSERT, UPDATE, DELETE

**Expected RLS Pattern:**
- Users can view records in their organization
- Only admins can create/edit/delete records
- Data isolation via `org_id` field

### Step 3: Build for Production

```bash
cd "d:\All Code\EduMunch"
npm run build
```

Expected output:
```
✓ built in 3.04s
dist/index.html                   0.50 kB │ gzip:   0.32 kB
dist/assets/index-*.css           38.78 kB │ gzip:   6.73 kB
dist/assets/index-*.js            683.66 kB │ gzip: 170.03 kB
```

### Step 4: Deploy to Production

Choose your deployment platform:

#### **Option A: Vercel (Recommended)**
```bash
npm install -g vercel
vercel --prod
```

#### **Option B: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### **Option C: Docker**
```bash
docker build -t edumunch:latest .
docker run -p 3000:3000 edumunch:latest
```

### Step 5: Post-Deployment Testing

**Test New Features:**

1. **Board Exams** (`/admin/academics/results`)
   - Create an exam
   - Add marks for students
   - Verify statistics display

2. **Support Tickets** (`/admin/communications/support`)
   - Create a ticket
   - Verify status tabs update
   - Check statistics
   - Assign ticket to staff

3. **Working Hours** (`/admin/hr/working-hours`)
   - Select employee
   - Configure working hours
   - Set week-off days
   - Save changes

4. **Salary Structures** (`/admin/hr/salary`)
   - Create structure
   - Add earnings and deductions
   - View structure summary

5. **Topics & Content** (`/admin/academics/topics`)
   - Select subject
   - Create topics
   - Add subtopics
   - Add content

6. **Timetables** (`/admin/academics/timetables`)
   - Select batch
   - Assign subjects to time slots
   - Verify grid layout

### Step 6: Performance Monitoring

**Monitor Key Metrics:**
- API response times (target: <200ms)
- Database query times (target: <100ms)
- Page load times (target: <2s)
- Error rates (target: <0.1%)

**Tools to Use:**
- Supabase Dashboard: Monitor database performance
- Google Analytics: Track page metrics
- Sentry/LogRocket: Monitor errors

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Run `npm install` again
```bash
npm install
npm run build
```

### Issue: Database connection fails
**Solution**: Verify Supabase connection string
1. Check `.env.local` file
2. Verify SUPABASE_URL and SUPABASE_ANON_KEY
3. Test connection in Supabase console

### Issue: RLS policies blocking access
**Solution**: Verify user's organization is set correctly
1. Check auth store has `user.orgId`
2. Verify RLS policies reference `auth.jwt() ->> 'org_id'`
3. Test with different roles

### Issue: Build bundle size warning
**Current**: 683.66 KB (acceptable)
**If larger**: Implement code splitting
```typescript
// Convert to dynamic imports
const BoardExamsPage = lazy(() => import('./pages/admin/BoardExamsPage'));
```

## Rollback Plan

If deployment encounters critical issues:

1. **Revert Code**:
   ```bash
   git revert <commit-hash>
   ```

2. **Revert Database** (if migration failed):
   ```bash
   npx supabase migration down
   ```

3. **Restore Previous Build**:
   - Vercel: Use deployment rollback in dashboard
   - Netlify: Redeploy previous version
   - Docker: Roll back to previous image

## Performance Optimization Notes

### Current Metrics
- Bundle Size: 683.66 KB (acceptable)
- Gzip Size: 170.03 KB (good)
- Build Time: 3.04s (good)

### Future Optimizations
1. Implement route-based code splitting
2. Add service worker for offline support
3. Optimize database queries with proper indexing
4. Cache frequently accessed data

## Success Criteria

✅ All 6 new pages load without errors
✅ Database migrations applied successfully
✅ RLS policies protecting data
✅ All CRUD operations functioning
✅ Search and filter features working
✅ Statistics calculating correctly
✅ UI rendering matches VRaZ design
✅ No console errors or warnings
✅ Mobile responsive design confirmed
✅ Authentication properly integrated

## Support & Documentation

For issues or questions:
1. Check PHASE_4_IMPLEMENTATION_SUMMARY.md
2. Review REMAINING_FEATURES.md
3. Check specific service documentation in src/services/
4. Review Supabase documentation at https://supabase.com/docs

## Contact & Maintenance

**For Updates:**
- Keep Node.js and npm up to date
- Monitor Supabase announcements
- Update dependencies monthly

**Monitoring:**
- Set up error tracking (Sentry)
- Monitor API usage
- Track user feedback

---

**Deployment Date**: [TO BE FILLED]
**Deployed By**: [TO BE FILLED]
**Status**: [TO BE FILLED]
