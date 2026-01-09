# Sign-Out Fix - Complete Solution

## Files Changed

### 1. `src/lib/auth.ts`
**Added cookie configuration** for proper session clearing on localhost:
```typescript
cookies: {
  sessionToken: {
    name: process.env.NODE_ENV === "production" 
      ? "__Secure-next-auth.session-token" 
      : "next-auth.session-token",
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    },
  },
},
```

**Updated redirect callback** to handle OAuth flow properly:
- Detects OAuth callback and redirects to dashboard
- Prevents redirect loops

### 2. `src/app/dashboard/am/components/UserInfoCard.tsx`
**Fixed sign-out implementation**:
- Uses `redirect: false` to clear session first
- Then uses `window.location.href` for hard navigation (clears router cache)
- Ensures cookies are fully cleared before redirect

## Environment Variables Required

Make sure you have these in `.env.local`:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
DATABASE_URL=your-database-url
```

## How to Test

1. Sign in with Google
2. Click "Sign Out"
3. Check browser DevTools → Application → Cookies
   - `next-auth.session-token` should be deleted
4. Try signing in again - should work immediately

## If Still Not Working

1. **Clear all cookies manually** in DevTools
2. **Hard refresh** (Cmd+Shift+R / Ctrl+Shift+R)
3. **Check server logs** for NextAuth errors
4. **Verify NEXTAUTH_URL** matches your localhost URL exactly

