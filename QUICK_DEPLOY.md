# Quick Deployment for Testing with Friends

## **Vercel Deployment (5 minutes)**

### **Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

### **Step 2: Login to Vercel**
```bash
vercel login
```

### **Step 3: Deploy**
```bash
vercel --prod
```

### **Step 4: Get Public URL**
After deployment, Vercel will give you a public URL like:
```
https://roktokorobi.vercel.app
```

## **Netlify Deployment (3 minutes)**

### **Step 1: Build Application**
```bash
npm run build
```

### **Step 2: Deploy to Netlify**
```bash
npx netlify-cli deploy --prod --dir=.next
```

### **Step 3: Get Public URL**
Netlify will provide a public URL for sharing.

## **Environment Variables Needed**

Before deploying, set these environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET

## **Testing Checklist for Friends**

### **Registration Test:**
1. Go to `/register`
2. Fill out form with test data
3. Verify registration works

### **Login Test:**
1. Go to `/login`
2. Use registered credentials
3. Verify authentication works

### **Blood Request Test:**
1. Login as user
2. Go to `/request`
3. Submit blood donation request
4. Verify location services work

### **Map Test:**
1. Test map loading
2. Test location services
3. Verify markers display

## **Share This URL:**
Once deployed, share the public URL with your friends for testing!
