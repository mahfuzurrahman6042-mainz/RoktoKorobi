# RoktoKorobi Testing Guide

## **TESTING CHECKLIST**

### **1. Application Startup & Basic Connectivity**

**Test Steps:**
1. Start the application: `npm run dev`
2. Open browser to: `http://localhost:3000`
3. Check if homepage loads correctly
4. Test health endpoint: `http://localhost:3000/api/health-simple`

**Expected Results:**
- Homepage loads without errors
- Health endpoint returns `{"status": "ok"}`
- No console errors in browser

---

### **2. User Registration Flow**

**Test Steps:**
1. Navigate to `/register`
2. Fill out registration form:
   - Name: Test User
   - Email: test@example.com
   - Phone: +8801234567890
   - Blood Group: A+
   - Age: 25
   - Weight: 70
   - Password: TestPassword123!
3. Click "Register"

**Expected Results:**
- Form validation works
- User is created in database
- Redirect to login or dashboard
- No sensitive data in console

---

### **3. User Login & Authentication**

**Test Steps:**
1. Navigate to `/login`
2. Enter credentials:
   - Email: test@example.com
   - Password: TestPassword123!
3. Click "Login"

**Expected Results:**
- Authentication succeeds
- JWT token received
- User redirected to dashboard
- Session management works

---

### **4. Blood Donation Request Workflow**

**Test Steps:**
1. Login as user
2. Navigate to `/request`
3. Fill out blood request form:
   - Patient Name: John Doe
   - Blood Group: A+
   - Hospital Location: Dhaka Medical College
   - Urgency: Critical
   - Phone: +8801234567890
   - Units Needed: 2
4. Submit request

**Expected Results:**
- Form validation works
- Request saved to database
- Location services work
- Map displays correctly

---

### **5. Map & Location Services**

**Test Steps:**
1. Go to request page
2. Click "Get Location" button
3. Allow location access
4. Verify map shows current location
5. Test hospital location search

**Expected Results:**
- GPS location retrieved
- Map loads with tiles
- Markers display correctly
- No map console errors

---

### **6. File Upload & Image Handling**

**Test Steps:**
1. Prepare test image (JPEG/PNG, <5MB)
2. Test upload via API or form
3. Verify EXIF data is stripped
4. Check malware scanning works

**Expected Results:**
- File validation works
- EXIF data removed
- Malware scanning runs
- File stored securely

---

### **7. API Endpoints & Security**

**Test Steps:**
1. Test `/api/auth/register` endpoint
2. Test `/api/auth/login` endpoint
3. Test `/api/upload` endpoint
4. Test CSRF protection
5. Test rate limiting

**Expected Results:**
- All endpoints respond correctly
- CSRF tokens required
- Rate limiting works
- Security headers present

---

### **8. Performance & Load Handling**

**Test Steps:**
1. Run performance monitoring
2. Test concurrent requests
3. Check response times
4. Monitor memory usage

**Expected Results:**
- Response times <500ms
- Memory usage stable
- No memory leaks
- Load handling works

---

### **9. Security Audit Features**

**Test Steps:**
1. Run security audit: `POST /api/security/audit`
2. Check vulnerability scan results
3. Test penetration testing
4. Review security recommendations

**Expected Results:**
- Audit runs successfully
- Vulnerabilities identified
- Recommendations provided
- Security score calculated

---

### **10. Deployment Configuration**

**Test Steps:**
1. Test deployment validation
2. Check environment variables
3. Verify Docker configuration
4. Test deployment scripts

**Expected Results:**
- Configuration validates
- Environment variables set
- Docker builds successfully
- Scripts execute correctly

---

## **TESTING COMMANDS**

### **Start Application:**
```bash
npm run dev
```

### **Run Tests:**
```bash
# Health check
curl http://localhost:3000/api/health-simple

# Test API endpoints
curl -X POST http://localhost:3000/api/security/audit \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: test-token" \
  -d '{"action":"run-audit"}'

# Performance monitoring
curl http://localhost:3000/api/monitoring

# Deployment validation
curl -X POST http://localhost:3000/api/deployment \
  -H "Content-Type: application/json" \
  -d '{"action":"validate"}'
```

---

## **SUCCESS CRITERIA**

### **Must Pass:**
- [ ] Application starts without errors
- [ ] User registration works
- [ ] User authentication works
- [ ] Blood request workflow works
- [ ] API endpoints respond correctly
- [ ] Security measures are active
- [ ] File upload works safely
- [ ] Deployment configuration validates

### **Should Pass:**
- [ ] Map services work
- [ ] Performance is acceptable
- [ ] Security audit runs
- [ ] Load testing works

---

## **TROUBLESHOOTING**

### **Common Issues:**
1. **Database Connection**: Check Supabase credentials
2. **Map Loading**: Verify OpenStreetMap tiles
3. **File Upload**: Check storage bucket permissions
4. **Authentication**: Verify JWT secret
5. **Rate Limiting**: Check Redis connection

### **Debug Tools:**
- Browser DevTools Console
- Network Tab for API calls
- Database query logs
- Performance monitoring logs

---

## **TESTING REPORT**

After completing all tests, document:
- Tests passed/failed
- Performance metrics
- Security findings
- Issues discovered
- Recommendations for improvement
