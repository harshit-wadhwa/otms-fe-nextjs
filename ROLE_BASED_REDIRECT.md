# Role-Based Redirect System

## Overview

The OTMS application now includes a comprehensive role-based redirect system that automatically routes users to their appropriate dashboards and prevents unauthorized access to role-specific pages.

## How It Works

### 1. Global Layout Integration

The `RoleBasedRedirect` component is integrated into the main layout (`src/app/layout.tsx`) and wraps all pages, ensuring that redirects are checked on every route change.

### 2. Role-Based Routing Logic

#### Public Paths
- `/` (home page)
- `/login`

When authenticated users visit these paths, they are automatically redirected based on their role:
- **Students** → `/student/dashboard`
- **Teachers/Admins** → `/dashboard`

#### Student Access Control
Students can access:
- `/student/dashboard`
- `/give-test/*` (test taking pages)
- `/scores` (their own scores)
- `/login`

If a student tries to access any other path, they are redirected to `/student/dashboard`.

#### Teacher/Admin Access Control
Teachers and Admins can access:
- `/dashboard` (teacher dashboard)
- `/add-test`
- `/tests`
- `/add-student`
- `/assign-test`
- `/scores` (all student scores)
- `/login`

If a teacher/admin tries to access student-specific paths, they are redirected to `/dashboard`.

### 3. Cross-Dashboard Protection

The system prevents:
- Students from accessing teacher dashboard pages
- Teachers from accessing student dashboard pages
- Unauthorized access to role-specific features

## Implementation Details

### Component Location
- **File**: `src/components/RoleBasedRedirect.tsx`
- **Integration**: `src/app/layout.tsx`

### Key Features

1. **Automatic Redirects**: Users are automatically sent to their appropriate dashboard after login
2. **Route Protection**: Prevents access to unauthorized pages
3. **Loading States**: Shows loading spinner while checking authentication
4. **Console Logging**: Debug information for development
5. **Clean URLs**: Uses `router.replace()` to avoid browser history issues

### Debugging

The component includes console logging to help debug redirect issues:
- Logs current pathname and user role
- Logs when redirects are triggered
- Logs the reason for each redirect

## Usage Examples

### Student Login Flow
1. Student visits `/login`
2. Enters credentials
3. Automatically redirected to `/student/dashboard`
4. If they try to visit `/dashboard`, redirected back to `/student/dashboard`

### Teacher Login Flow
1. Teacher visits `/login`
2. Enters credentials
3. Automatically redirected to `/dashboard`
4. Can access all teacher-specific pages

### Unauthorized Access Prevention
- Student trying to access `/add-test` → redirected to `/student/dashboard`
- Teacher trying to access `/student/dashboard` → redirected to `/dashboard`

## Benefits

1. **Security**: Prevents unauthorized access to role-specific features
2. **User Experience**: Automatic routing to appropriate dashboards
3. **Maintainability**: Centralized redirect logic
4. **Consistency**: Uniform behavior across the application
5. **Debugging**: Clear logging for troubleshooting

## Future Enhancements

Potential improvements could include:
- Role-based navigation menus
- Dynamic route generation based on user permissions
- More granular permission controls
- Audit logging for access attempts 