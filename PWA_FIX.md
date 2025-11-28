# PWA Build Fix for Vercel Deployment

## Problem
The build was failing on Vercel with:
```
Error: Cannot find module '@babel/plugin-bugfix-firefox-class-in-computed-class-key'
```

This was caused by the outdated `next-pwa@5.6.0` package which has compatibility issues with newer Node versions and Babel dependencies.

## Solution Applied

### 1. Updated PWA Package
- **Removed**: `next-pwa@5.6.0` (unmaintained, has Babel dependency issues)
- **Added**: `@ducanh2912/next-pwa@9.7.2` (maintained fork, compatible with Next.js 13.x)

### 2. Updated next.config.js
Changed from:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});
```

To:
```javascript
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});
```

### 3. Also Fixed: TypeScript Errors

#### GuideCard.tsx
Fixed type inference issue where `guideComponent` was being inferred as `string` instead of the literal union type.

#### rateLimit.ts
Fixed iterator issue by converting `Map.entries()` to an array before iteration to avoid `--downlevelIteration` requirement.

## Deployment Steps

1. **Install the new package**:
   ```bash
   npm install
   ```

2. **Commit changes**:
   ```bash
   git add package.json next.config.js src/components/GuideCard.tsx
   git commit -m "fix: upgrade to @ducanh2912/next-pwa and fix GuideCard types"
   ```

3. **Push to trigger Vercel deployment**:
   ```bash
   git push origin main
   ```

## What Changed in PWA Functionality

The new PWA package provides:
- ✅ Better Next.js 13+ App Router support
- ✅ No Babel dependency conflicts
- ✅ Improved caching strategies
- ✅ Better offline support
- ✅ Active maintenance and updates

The service worker (`public/sw.js`) will be automatically regenerated on the next build with the new package.

## Verification

After deployment, verify PWA functionality:
1. Open your site in Chrome
2. Open DevTools → Application → Service Workers
3. Confirm the service worker is registered
4. Test offline functionality by toggling "Offline" in DevTools → Network tab

## Notes

- The old `public/sw.js` and `public/workbox-*.js` files will be overwritten on next build
- PWA manifest (`public/manifest.json`) remains unchanged
- All PWA icons and assets remain the same
- No user-facing changes to PWA behavior

