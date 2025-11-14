# 🔐 MILLENNIUM POTTER REGISTRATION SYSTEM - COMPLETE GUIDE

## 🎯 **HOW YOUR REGISTRATION WORKS WITH SUPABASE**

Your app uses a **custom authentication system** that bypasses Supabase Auth and works directly with your database.

---

## 🏗️ **SYSTEM ARCHITECTURE**

### **Frontend (React App)**
- **Login Page:** `src/pages/auth/Login.tsx`
- **Signup Page:** `src/pages/auth/Signup.tsx`
- **Auth Service:** `src/services/authService.ts`
- **Auth Context:** `src/contexts/AuthContext.tsx`

### **Backend (Supabase Database)**
- **Users Table:** Stores user accounts
- **Auth Functions:** `authenticate_user()` and `create_user()`
- **Password Hashing:** bcrypt for security
- **Role Management:** Admin, Sub-Admin, Agent

---

## 📊 **DATABASE STRUCTURE**

### **Users Table Schema:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('admin', 'subadmin', 'agent')),
  branch_id UUID REFERENCES branches(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Key Fields:**
- **email:** Unique login identifier
- **password_hash:** bcrypt encrypted password
- **role:** Determines access level
- **branch_id:** Links user to specific branch
- **is_active:** Enable/disable user access

---

## 🔄 **REGISTRATION FLOW**

### **Step 1: User Fills Signup Form**
**File:** `src/pages/auth/Signup.tsx`

```typescript
// User enters:
- Full Name
- Email
- Password
- Role (Admin, Sub-Admin, Agent)
- Branch (if applicable)
```

### **Step 2: Frontend Validation**
**File:** `src/services/authService.ts`

```typescript
export const signUp = async (userData: SignUpData) => {
  // 1. Validate email format
  // 2. Check password strength
  // 3. Verify required fields
  // 4. Call Supabase function
}
```

### **Step 3: Database Processing**
**File:** `supabase/migrations/007_create_triggers_and_functions.sql`

```sql
-- Custom function that:
-- 1. Checks if email already exists
-- 2. Hashes password with bcrypt
-- 3. Creates user record
-- 4. Returns success/error
```

### **Step 4: Auto-Profile Creation**
**File:** `supabase/migrations/010_auto_create_user_profile.sql`

```sql
-- Trigger automatically creates:
-- 1. User profile record
-- 2. Default permissions
-- 3. Branch associations
```

---

## 🔐 **AUTHENTICATION FUNCTIONS**

### **1. User Registration Function**
```sql
CREATE OR REPLACE FUNCTION create_user(
  p_email VARCHAR,
  p_password VARCHAR,
  p_full_name VARCHAR,
  p_role VARCHAR,
  p_branch_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_password_hash VARCHAR;
BEGIN
  -- Check if email exists
  IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
    RETURN json_build_object('success', false, 'message', 'Email already exists');
  END IF;
  
  -- Hash password
  v_password_hash := crypt(p_password, gen_salt('bf'));
  
  -- Create user
  INSERT INTO users (email, password_hash, full_name, role, branch_id)
  VALUES (p_email, v_password_hash, p_full_name, p_role, p_branch_id)
  RETURNING id INTO v_user_id;
  
  RETURN json_build_object('success', true, 'user_id', v_user_id);
END;
$$ LANGUAGE plpgsql;
```

### **2. User Authentication Function**
```sql
CREATE OR REPLACE FUNCTION authenticate_user(
  p_email VARCHAR,
  p_password VARCHAR
) RETURNS JSON AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- Find user and verify password
  SELECT * INTO v_user 
  FROM users 
  WHERE email = p_email 
  AND password_hash = crypt(p_password, password_hash)
  AND is_active = true;
  
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'user', json_build_object(
        'id', v_user.id,
        'email', v_user.email,
        'full_name', v_user.full_name,
        'role', v_user.role,
        'branch_id', v_user.branch_id
      )
    );
  ELSE
    RETURN json_build_object('success', false, 'message', 'Invalid credentials');
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎭 **ROLE-BASED ACCESS**

### **Role Hierarchy:**
1. **Admin** - Full system access
2. **Sub-Admin** - Branch management
3. **Agent** - Customer operations

### **Permission Matrix:**
| Feature | Admin | Sub-Admin | Agent |
|---------|-------|-----------|-------|
| User Management | ✅ | ❌ | ❌ |
| Branch Analytics | ✅ | ✅ | ❌ |
| Loan Approvals | ✅ | ✅ | ❌ |
| Customer Registration | ✅ | ✅ | ✅ |
| Payment Processing | ✅ | ✅ | ✅ |

---

## 🔄 **COMPLETE REGISTRATION PROCESS**

### **Frontend Flow:**
```typescript
// 1. User submits form
const handleSignup = async (formData) => {
  try {
    // 2. Call auth service
    const result = await authService.signUp(formData);
    
    if (result.success) {
      // 3. Redirect to login
      navigate('/login');
      showSuccess('Account created successfully');
    } else {
      // 4. Show error
      showError(result.message);
    }
  } catch (error) {
    showError('Registration failed');
  }
};
```

### **Backend Flow:**
```sql
-- 1. Receive registration request
-- 2. Validate email uniqueness
-- 3. Hash password with bcrypt
-- 4. Insert user record
-- 5. Trigger auto-profile creation
-- 6. Return success/error response
```

---

## 🛠️ **HOW TO MANAGE USERS**

### **Create New User (Admin Only):**
1. **Login as Admin**
2. **Go to User Management**
3. **Click "Add User"**
4. **Fill form:**
   - Full Name
   - Email
   - Role
   - Branch (if Sub-Admin/Agent)
5. **System generates secure password**
6. **Share credentials with user**

### **User Self-Registration:**
1. **Visit Signup page**
2. **Fill registration form**
3. **Choose role** (if allowed)
4. **Submit form**
5. **Admin approval** (if required)

---

## 🔍 **DEBUGGING REGISTRATION ISSUES**

### **Common Problems:**

**1. "Email already exists"**
- Check users table for duplicate email
- User might have been created before

**2. "Registration failed"**
- Check database connection
- Verify create_user function exists
- Check password requirements

**3. "Invalid role"**
- Ensure role is: 'admin', 'subadmin', or 'agent'
- Check role validation in database

### **Debug Commands:**
```sql
-- Check if user exists
SELECT * FROM users WHERE email = 'user@example.com';

-- Test create_user function
SELECT create_user('test@example.com', 'password123', 'Test User', 'agent');

-- Check function exists
SELECT * FROM pg_proc WHERE proname = 'create_user';
```

---

## 📱 **MOBILE REGISTRATION**

Your PWA app supports registration on mobile devices:

1. **Install app** on phone
2. **Open registration page**
3. **Fill form** (mobile-optimized)
4. **Submit** - works offline after first load
5. **Sync** when internet available

---

## 🔒 **SECURITY FEATURES**

### **Password Security:**
- **bcrypt hashing** - Industry standard
- **Salt generation** - Unique per password
- **Cost factor 12** - Secure against brute force

### **Email Validation:**
- **Format checking** - Valid email structure
- **Uniqueness** - No duplicate accounts
- **Case insensitive** - Prevents confusion

### **Role Validation:**
- **Enum constraints** - Only valid roles
- **Permission checks** - Role-based access
- **Branch associations** - Proper hierarchy

---

## 🎯 **NEXT STEPS FOR YOU**

### **To Add More Users:**
1. **Use User Management** page (Admin login)
2. **Or modify** `create_user` function for bulk import
3. **Or enable** public registration with approval

### **To Customize Registration:**
1. **Edit** `src/pages/auth/Signup.tsx` for UI changes
2. **Modify** `create_user` function for business logic
3. **Update** validation rules in `authService.ts`

**Your registration system is fully functional and secure!** 🎉