# Development Setup

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Prerequisites

Before setting up the development environment, ensure you have:

1. **Git** (Latest version) - [Download](https://git-scm.com)
2. **Node.js 18+** - [Download](https://nodejs.org)
3. **npm 9+** - Comes with Node.js
4. **VS Code** - [Download](https://code.visualstudio.com)
5. **GitHub Account** - For code repository
6. **Supabase Account** - [Create free account](https://app.supabase.com)

---

## Step 1: Check Prerequisites

Open terminal/PowerShell and verify installations:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version (should be 9+)
npm --version

# Check Git version
git --version
```

All should return version numbers. If not, install the missing tools.

---

## Step 2: Clone the Repository

```bash
# Navigate to your desired directory
cd /path/where/you/want/project

# Clone the repository (replace with actual repo URL)
git clone https://github.com/yourusername/edumunch.git

# Navigate into project
cd edumunch
```

---

## Step 3: Install Dependencies

```bash
# Install all npm packages
npm install

# This installs:
# - React 18
# - TypeScript
# - Vite
# - Tailwind CSS
# - Shadcn/ui
# - Zustand
# - React Router
# - React Hook Form + Zod
# - Supabase JS client
# - And 50+ other dependencies
```

**Estimated installation time:** 3-5 minutes

**Expected result:** `node_modules/` folder created with all dependencies

---

## Step 4: Environment Configuration

### Create `.env.local` file

In the project root, create a file named `.env.local`:

```bash
# Linux/Mac
touch .env.local

# Windows PowerShell
New-Item -Path .env.local -ItemType File
```

### Add Environment Variables

Copy and paste into `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
VITE_API_URL=http://localhost:5173
VITE_API_TIMEOUT=30000

# Feature Flags (Defaults)
VITE_ENABLE_2FA=true
VITE_ENABLE_PAYMENT=true
VITE_ENABLE_LMS=true

# External Services
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
VITE_SENDGRID_KEY=your-sendgrid-key
VITE_TWILIO_ACCOUNT_SID=your-twilio-sid
```

### Get Supabase Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project (or use existing)
3. Click "Settings" → "API"
4. Copy `Project URL` → paste as `VITE_SUPABASE_URL`
5. Copy `anon public` key → paste as `VITE_SUPABASE_ANON_KEY`
6. Save `.env.local`

---

## Step 5: Set Up Supabase Locally (Optional but Recommended)

### Install Supabase CLI

```bash
# Using npm (global)
npm install -g supabase

# Verify installation
supabase --version
```

### Start Local Supabase

```bash
# Navigate to project root
cd edumunch

# Start local Supabase instance
supabase start

# First time will take 2-3 minutes downloading Docker images
# Result: Local database running on localhost
```

### Update `.env.local` for Local Development

When using local Supabase:

```env
# Local Supabase
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 6: Start Development Server

```bash
# From project root
npm run dev

# Output:
# ➜  local:   http://localhost:5173/
# ➜  press h to show help
```

### Access the Application

Open browser and navigate to: `http://localhost:5173`

You should see the EduMunch login page (or welcome page if first run).

---

## Step 7: VS Code Setup

### Install Recommended Extensions

```
1. ES7+ React/Redux/React-Native snippets (by dsznajder.es7-react-js-snippets)
2. Prettier - Code formatter (by esbenp.prettier-vscode)
3. ESLint (by dbaeumer.vscode-eslint)
4. Tailwind CSS IntelliSense (by bradlc.vscode-tailwindcss)
5. Thunder Client (by rangav.vscode-thunder-client)
6. SQL Tools (by mtxr.sqltools)
```

### VS Code Settings

Create `.vscode/settings.json` in project root:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.exclude": {
    "node_modules": true,
    ".next": true
  },
  "search.exclude": {
    "node_modules": true,
    ".next": true
  }
}
```

---

## Step 8: Verify Setup

### Run Development Build

```bash
npm run dev
```

### Check Console Output

Look for:
```
  VITE v4.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Test Supabase Connection

In browser console (F12):

```javascript
// This should work without errors
console.log("Setup OK");
```

### Check Package Scripts

```bash
npm run
```

Should show:
- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build
- `lint` - Run ESLint
- `format` - Format code with Prettier
- `type-check` - Check TypeScript types

---

## Common Issues & Solutions

### Issue 1: Node version mismatch

```bash
# Solution: Update Node.js
# Download from nodejs.org or use nvm

# For Linux/Mac with nvm:
nvm install 18
nvm use 18

# For Windows with nvm-windows:
# Download and install from github.com/coreybutler/nvm-windows
```

### Issue 2: Port 5173 already in use

```bash
# Solution: Use different port
npm run dev -- --port 3000
```

### Issue 3: npm install fails

```bash
# Solution: Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Supabase connection failed

```bash
# Check if .env.local has correct values
# Check if Supabase project is active
# Try: npm run dev and check browser console for errors
```

### Issue 5: TypeScript errors in IDE

```bash
# Solution: Reload VS Code window
# Cmd/Ctrl + Shift + P → Developer: Reload Window
```

---

## Project Structure After Setup

```
edumunch/
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/               # Page components
│   ├── services/            # API and external services
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main app component
│   └── main.tsx             # App entry point
├── public/                  # Static assets
├── database/
│   └── migrations/          # SQL migration files
├── .env.local               # Environment variables (LOCAL ONLY)
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── docs/                    # Documentation (this folder)
```

---

## Development Workflow

### Daily Development

```bash
# Morning: Start dev server
npm run dev

# During development:
# - Edit files in src/
# - Browser auto-refreshes (HMR)
# - Check console for errors

# Before committing:
npm run lint          # Check for linting issues
npm run format        # Format code
npm run type-check    # Check TypeScript types

# Commit and push to GitHub
git add .
git commit -m "Feature: Add xyz"
git push origin feature/xyz
```

### Database Changes

```bash
# Create migration file
supabase migration new feature_name

# Edit the migration file in: database/migrations/

# Apply migration locally
supabase migration up

# Verify changes in Supabase dashboard
```

### Code Formatting

```bash
# Format all files with Prettier
npm run format

# Or format specific file
npx prettier --write src/components/Button.tsx
```

---

## Debugging Tips

### Browser DevTools (F12)

1. **Console Tab:** View logs and errors
2. **Network Tab:** Check API requests
3. **Application Tab:** Check local storage, cookies
4. **Sources Tab:** Set breakpoints and debug

### VS Code Debugging

Press F5 to start debugger (if configured).

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Click "Logs" in left sidebar
3. Check database and API logs

---

## Next Development Steps

### For First Time

1. ✅ Run `npm run dev`
2. ✅ Open `http://localhost:5173`
3. ✅ Create test Supabase project
4. ✅ Read `04_PROJECT_STRUCTURE.md`
5. ✅ Look at `src/components/` for component examples

### For Phase 2 Development

1. Read `06_AUTHENTICATION_SYSTEM.md`
2. Understand Supabase Auth setup
3. Create first authentication components
4. Set up JWT token handling

---

## Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server on localhost:5173

# Building
npm run build            # Build for production
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Check for linting errors
npm run format           # Format code with Prettier
npm run type-check       # Check TypeScript types

# Database
supabase start           # Start local Supabase
supabase stop            # Stop local Supabase
supabase migration new   # Create new migration file
supabase migration up    # Apply migrations

# Dependencies
npm install              # Install dependencies
npm update               # Update dependencies
npm list                 # List installed packages
```

---

## Performance Tips

### Development Speed

1. Use `npm run dev` with HMR enabled
2. Keep component files small (< 300 lines)
3. Use React Router code splitting
4. Lazy load heavy components with React.lazy()

### Build Performance

1. Vite automatically optimizes bundles
2. Remove unused dependencies
3. Use dynamic imports for large libraries
4. Monitor bundle size: `npm run build` shows size

---

## Security Checklist

- ✅ Never commit `.env.local` to Git
- ✅ Use environment variables for secrets
- ✅ Keep dependencies updated: `npm update`
- ✅ Check for vulnerabilities: `npm audit`
- ✅ Use HTTPS in production

---

## Production Deployment

### Prerequisites
- GitHub account with repository
- Vercel account (free tier available)
- Supabase production project

### Deployment Steps

1. Push code to GitHub main branch
2. Connect Vercel to GitHub repository
3. Set environment variables in Vercel dashboard
4. Vercel automatically deploys

More details in Phase 15 documentation.

---

## Support & Resources

### Documentation
- [React](https://react.dev)
- [Supabase](https://supabase.io/docs)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

### Community Channels
- Stack Overflow
- React Discord
- Supabase Discord
- GitHub Issues

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Setup Complete  
**Next Phase:** 04_PROJECT_STRUCTURE.md
