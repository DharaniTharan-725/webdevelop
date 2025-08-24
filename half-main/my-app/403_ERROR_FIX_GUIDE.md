# 403 Error Fix Guide for Admin Portal

## Problem Description
You're experiencing 403 (Forbidden) errors when trying to fetch feedback data in the admin portal and dashboard. This indicates an authorization/authentication issue.

## Potential Causes and Solutions

### 1. **Authentication Token Issues**

**Symptoms:**
- 403 errors on admin endpoints
- Token missing or expired
- Wrong user role

**Solutions:**
- Check if you're logged in as an admin user
- Verify the token is stored correctly in localStorage
- Ensure the token hasn't expired

**Debug Steps:**
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Check localStorage for:
   - `token` - should contain a valid JWT
   - `userRole` - should be "ADMIN"
   - `userEmail` - should contain admin email

### 2. **Backend CORS Configuration**

**Symptoms:**
- 403 errors on preflight requests
- Network errors in console

**Solutions:**
Ensure your backend has proper CORS configuration:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

### 3. **JWT Token Validation**

**Symptoms:**
- Token present but still getting 403
- Backend rejecting valid tokens

**Solutions:**
1. Check JWT secret configuration in backend
2. Verify token expiration settings
3. Ensure admin role is properly set in JWT claims

### 4. **Backend Security Configuration**

**Symptoms:**
- All endpoints returning 403
- Admin role not recognized

**Solutions:**
Check your Spring Security configuration:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### 5. **Database Role/Permission Issues**

**Symptoms:**
- User exists but can't access admin features
- Role not properly assigned

**Solutions:**
1. Check database user table for correct role assignment
2. Verify admin user has "ADMIN" role in database
3. Check if role enum values match between frontend and backend

## Immediate Debugging Steps

### Step 1: Check Authentication State
1. Open the admin portal
2. Look for the debug section (gray box) at the top
3. Verify:
   - Token: Should show "Present"
   - Role: Should show "ADMIN"
   - User ID/Email: Should show valid values

### Step 2: Test Backend Connection
1. Click the "Test Connection" button in the debug section
2. Check browser console for detailed logs
3. Look for any error messages

### Step 3: Check Network Tab
1. Open browser developer tools
2. Go to Network tab
3. Try to load the admin page
4. Look for failed requests (red entries)
5. Check request headers for Authorization token
6. Check response for detailed error messages

### Step 4: Verify Backend Status
1. Ensure backend is running on localhost:8080
2. Test backend health endpoint: `http://localhost:8080/actuator/health`
3. Check backend logs for any errors

## Common Fixes

### Fix 1: Re-login as Admin
```javascript
// Clear all auth data and re-login
localStorage.clear();
// Then login again with admin credentials
```

### Fix 2: Check Token Format
Ensure the token is being sent correctly:
```javascript
// Should be: "Bearer <token>"
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Fix 3: Verify API Endpoints
Check if the backend endpoints match:
- `/api/v1/admin/feedback` - for search
- `/api/v1/admin/feedback/all` - for all feedback
- `/api/v1/admin/categories/all` - for categories

### Fix 4: Check Backend Logs
Look for these common issues in backend logs:
- JWT signature verification failed
- User not found
- Role not authorized
- CORS preflight failed

## Testing the Fix

After implementing fixes:

1. **Clear browser data:**
   - Clear localStorage
   - Clear cookies
   - Hard refresh (Ctrl+F5)

2. **Re-login as admin:**
   - Use admin credentials
   - Verify role is set to "ADMIN"

3. **Test endpoints:**
   - Check admin portal loads
   - Verify feedback data appears
   - Test dashboard functionality

## Additional Debugging

If issues persist, enable detailed logging:

1. **Frontend logging** - Check browser console
2. **Backend logging** - Enable DEBUG level for security
3. **Network monitoring** - Use browser network tab
4. **Token inspection** - Decode JWT at jwt.io

## Contact Support

If none of these solutions work:
1. Check backend logs for specific error messages
2. Verify database user permissions
3. Test with a fresh admin user account
4. Check if the issue is environment-specific 