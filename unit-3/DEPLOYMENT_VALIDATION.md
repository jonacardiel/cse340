# Unit 3 Deployment Validation Checklist

**Date:** [Fill in date]  
**Validator:** [Your name]  
**Status:** [ ] PASS [ ] FAIL

## 1. Environment & Server Startup

- [ ] `.env` file exists with required variables (PORT, DB_URL, SESSION_SECRET)
- [ ] Server starts without errors: `npm run dev` or `pnpm dev`
- [ ] Console shows "Database seeded successfully" or "listening on http://127.0.0.1:5600"
- [ ] No unhandled errors in terminal after startup

**Evidence:**  
Screenshot or terminal output: ________________

---

## 2. Public Routes (No Login Required)

- [ ] **Home page** (`/`) loads and displays content
- [ ] **About page** (`/about`) loads
- [ ] **Catalog** (`/catalog`) loads and shows course list
- [ ] **Catalog detail** (`/catalog/:slugId`) loads with course details
- [ ] **Faculty list** (`/faculty`) loads with faculty cards + images display
- [ ] **Faculty detail** (`/faculty/:slugId`) loads with profile info + image
- [ ] **Contact form** (`/contact`) renders form with input fields

**Evidence:**  
List working URLs: ________________

---

## 3. Form Validation & Flash Feedback

### Contact Form
- [ ] Submit empty form → validation error flash message appears
- [ ] Submit with short subject (<2 chars) → error flash
- [ ] Submit with short message (<10 chars) → error flash
- [ ] Submit valid form → success flash message appears
- [ ] Flash message disappears on page refresh (not persisted)

**Evidence:**  
Test result (pass/fail): ________________

### Registration Form
- [ ] Submit empty form → validation error flash appears
- [ ] Submit with weak password (no uppercase) → error flash
- [ ] Submit with mismatched email confirm → error flash
- [ ] Submit with mismatched password confirm → error flash
- [ ] Submit duplicate email → warning flash appears
- [ ] Submit valid form → success flash appears, redirects to login

**Evidence:**  
Test result (pass/fail): ________________

### Login Form
- [ ] Submit empty form → validation error flash
- [ ] Submit with nonexistent email → "Invalid email or password" flash
- [ ] Submit with wrong password → "Invalid email or password" flash
- [ ] Submit valid credentials → success flash "Welcome back, [name]!"

**Evidence:**  
Test result (pass/fail): ________________

---

## 4. Protected Routes & Login Flow

- [ ] Unauthenticated user visiting `/dashboard` → redirects to `/login` with error flash
- [ ] Unauthenticated user visiting `/register/list` → redirects to `/login` with error flash
- [ ] After successful login, `/dashboard` is accessible and shows user info + role
- [ ] After successful login, `/register/list` is accessible
- [ ] Logout button works and clears session

**Evidence:**  
Test result (pass/fail): ________________

---

## 5. Role-Based Access Control

### As Regular User
- [ ] Can view other users in `/register/list`
- [ ] Can click "Edit" on own account in list
- [ ] Cannot see "Edit" button on other users' accounts
- [ ] Cannot see "Delete" button on any account
- [ ] Trying to access `/register/[other-id]/edit` directly → error flash, redirect

**Evidence:**  
Test result (pass/fail): ________________

### As Admin User
- [ ] Can see "Edit" button on ALL accounts
- [ ] Can see "Delete" button on all accounts except own
- [ ] Edit account: change name/email, submit, confirm update succeeds
- [ ] Delete account: click delete, confirm dialog, confirm deletion succeeds
- [ ] Cannot delete own account (error flash "cannot delete own account")

**Evidence:**  
Test result (pass/fail): ________________

---

## 6. Faculty Image Display

- [ ] Faculty list page: each card displays faculty photo image
- [ ] Faculty detail page: profile image displays to left of info
- [ ] Image fallback (placeholder) shows if file missing
- [ ] Images are responsive on mobile (detail page stacks vertically)

**Evidence:**  
Screenshot or test: ________________

---

## 7. Database Schema & Data

- [ ] `roles` table exists with at least 'user' and 'admin' roles
- [ ] `users` table has `role_id` column
- [ ] Existing users have `role_id` assigned (not NULL)
- [ ] Query result includes `roleName` in user object

**Test Query (in pgAdmin):**
```sql
SELECT users.id, users.name, users.email, roles.role_name 
FROM users 
LEFT JOIN roles ON users.role_id = roles.id 
LIMIT 1;
```

Result shows `role_name`: ________________

---

## 8. Error Handling

- [ ] Invalid URL (e.g., `/fake-route`) → 404 error page
- [ ] Database error scenario (if testable) → user sees friendly error flash
- [ ] Session expired → user redirected to login
- [ ] No console errors or warnings (check browser dev tools)

**Evidence:**  
Test result (pass/fail): ________________

---

## Summary

**Total Checks:** 8 sections  
**Passed:** _____ / 8  
**Failed:** _____ / 8  

**Overall Status:** [ ] READY FOR SUBMISSION [ ] NEEDS FIXES

### Issues Found:
1. ________________
2. ________________
3. ________________

### Next Steps:
- [ ] Fix issues listed above
- [ ] Re-run validation
- [ ] Submit to instructor

---

**Validator Signature:** ________________ **Date:** ________________
