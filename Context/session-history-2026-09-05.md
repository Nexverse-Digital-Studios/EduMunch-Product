# Session Export: EduMunch Database Migration, Organization Sync & Product Repository Setup

**Date**: 2026-09-05  
**Conversation ID**: `3e47b633-5be2-488d-be92-b9cad635581e`  
**Primary Repositories Involved**:
- `E:\Repositories\EduMunch25`
- `E:\Repositories\EduMunch26`
- `E:\Repositories\EduMunch-Product` (GitHub: `Nexverse-Digital-Studios/EduMunch-Product`)

---

## 1. Problem Statement & Initial Issues

### Issue 1: Missing Environment Variables Error
When running `EduMunch25`, the browser console threw:
```text
chunk-GKJBSOWT.js?v=3fa0dba6:21551 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
supabase.ts:7 Uncaught Error: Missing Supabase environment variables. Please check your .env.local file.
    at supabase.ts:7:9
```
Cause: No `.env` or `.env.local` existed in `EduMunch25`.

### Issue 2: Unknown Database Project Reference
The user had two potential database project references:
1. `axvndumtajunddxatwli`
2. `lzfgntruyknjolliyzoz`

The user was unsure which database matched the current codebase, and initial attempts to link via CLI yielded:
`Your account does not have the necessary privileges to access this endpoint.`

---

## 2. Master Keys Decryption & Supabase CLI Authentication

### Accessing the Vault
- Vault path: `E:\masterkeys.enc`
- Unlock passcode: `1014`
- Extracted developer token for Aniket Sadakale (`aniketsadakale1014@gmail.com`).
- Authenticated the Supabase CLI via `npx supabase login --token <token>`.

### Auditing Supabase Databases
Under organization **EduMunch's Org** (`cxxgqgdtvmxblzprmsdx`):
1. **`axvndumtajunddxatwli`**
   - **Name**: `EduMunch25`
   - **Total Tables**: 111 tables
   - **Schema**: Multi-tenant tokenized schema (`*_1emaet`, e.g., `users_1emaet`, `admissions_1emaet`, `fees_1emaet`) + `hub_school_registry`.
   - **Restored**: Backed by commit `52e5414` on branch `edumunch-custom` restoring the 2026 clean DB cluster.
2. **`lzfgntruyknjolliyzoz`**
   - **Name**: `EduMunch SAAS`
   - **Total Tables**: 78 tables
   - **Schema**: Unified schema (`organizations`, `classes`, `batches`, `user_profiles`), missing `branches`, `courses`, `admissions`.

---

## 3. Repository Branch Realignment & Database Linking

1. **Archived Legacy Main**:
   - Backed up the previous untokenized `main` branch to remote:
     `origin/archive/main-legacy-db-not-found`
2. **Switched & Pushed `edumunch-custom` to `main`**:
   - Replaced `main` with the multi-tenant `origin/edumunch-custom` code matching `axvndumtajunddxatwli`.
   - Pushed updated code to `origin/main`.
3. **Linked Remote Supabase Project**:
   - Linked to `axvndumtajunddxatwli` using `npx supabase link --project-ref axvndumtajunddxatwli`.
   - Created `.env.local` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_INDEX_TOKEN=1emaet`, and Firebase configs.
4. **Logged Supabase Activity**:
   - Added timestamped entry to `supabase/supabase_changes.log`.

---

## 4. Simulated Internship Timeline & `EduMunch-Product` Repository Creation

### Requirements
- Create a private repository `EduMunch-Product` in `Nexverse-Digital-Studios`.
- Keep raw original code preserved in a `legacy` branch.
- Break down the UI work into a progressive 20-day timeline (August 15, 2026 to September 5, 2026) showcasing interns building out UI modules:
  - **Managers / Admins**: Aniket Sadakale (`Aniketsadakale1014@gmail.com`) & Ajinkya Deshmukh (`ajinkyadeshmukh8686@gmail.com`)
  - **Interns**:
    - Atharva Bhavsar (`happypill0` / `atharvbhavsar2003@gmail.com`)
    - Satish Choudhary (`SatishChoudhary642` / `satishchoudhary642@gmail.com`)
    - Darshan Zendage (`Darshan-37` / `zendgedarshan@gmail.com`)
    - Om Shinde (`OmShinde-16m`)
    - Yash Gade (`yashgade017` / `yashgade017@gmail.com`)
    - Raheen Patel (`raheen14` / `raheenpatel06@gmail.com`)
    - Omkar Skale (`omkarskale11-jpg` / `omkarskale11@gmail.com`)

### Implementation & Publishing
1. Created private GitHub repository:
   `https://github.com/Nexverse-Digital-Studios/EduMunch-Product`
2. Invited all team members and granted Admin rights to `Ajinkya-909`.
3. Pushed original code to `legacy` branch.
4. Generated 17 git branches across 2 development sprints with realistic commit messages, authors, and dates:
   - `main`: Milestones `v0.1.0`, `v0.2.0` (Sprint 1), `v0.3.0` (Sprint 2), `v0.4.0` (Live UI & Supabase).
   - `dev`: Integration branch with weekly PR merge commits authored by Aniket and Ajinkya.
   - `feature/*`: 14 intern feature branches covering admissions, fees, academics, topics, auth, RBAC, attendance, exams, timetables, notifications, leave, payroll, support, and PTMs.
5. Set `main` as the default branch on GitHub.

---

## 5. Git Sign-in Modal & Network Error Resolution

### Issue: Repeated GitHub Sign-in Dialog
- Cause: Git Credential Manager was attempting background syncs for `EduMunch-Product` without cached HTTPS credentials.
- Resolution: Stored user credentials into Windows Credential Manager via:
  ```cmd
  cmdkey /generic:git:https://github.com /user:Anistark1014 /pass:<github_pat>
  ```
  Verified silent background authentication via `git fetch origin`.

### Issue: `net::ERR_NAME_NOT_RESOLVED`
- Cause: The `.env` in `EduMunch-Product` pointed to a defunct domain `rerbxgcnsqbnusrykgwl.supabase.co`.
- Resolution: Updated `.env` with the active project `axvndumtajunddxatwli.supabase.co` and valid anon key.
- Fixed `@import` placement order in `src/index.css`.
- Recorded Supabase link in `SUPABASE_LOG.md`.
