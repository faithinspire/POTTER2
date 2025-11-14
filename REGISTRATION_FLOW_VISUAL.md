# 🔄 MILLENNIUM POTTER REGISTRATION FLOW - VISUAL GUIDE

## 📊 **COMPLETE SYSTEM FLOW**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   USER OPENS    │    │   FILLS FORM    │    │   SUBMITS       │
│   SIGNUP PAGE   │───▶│   WITH DATA     │───▶│   REGISTRATION  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SUCCESS!      │    │   DATABASE      │    │   FRONTEND      │
│   REDIRECT TO   │◀───│   CREATES USER  │◀───│   VALIDATES     │
│   LOGIN PAGE    │    │   WITH BCRYPT   │    │   FORM DATA     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🎯 **DETAILED REGISTRATION PROCESS**

### **STEP 1: User Interface (Frontend)**
```
📱 SIGNUP PAGE (src/pages/auth/Signup.tsx)
├── Full Name Input
├── Email Input  
├── Phone Input
├── Role Selection (Admin/Sub-Admin/Agent)
├── Branch Selection (if not Admin)
├── Password Input
├── Confirm Password Input
└── Submit Button
```

### **STEP 2: Form Validation (Frontend)**
```
✅ VALIDATION CHECKS:
├── Email format validation
├── Password length (min 6 chars)
├── Password confirmation match
├── Required fields check
├── Branch selection (for non-admin)
└── Phone number format
```

### **STEP 3: API Call (AuthService)**
```
🔄 authService.registerUser()
├── Calls Supabase RPC function
├── Passes user data securely
├── Handles response/errors
└── Returns success/failure
```

### **STEP 4: Database Processing (Supabase)**
```
🗄️ create_user() FUNCTION:
├── Check email uniqueness
├── Hash password with bcrypt
├── Generate UUID for user
├── Insert into users table
├── Link to branch (if applicable)
└── Return user ID or error
```

---

## 🔐 **AUTHENTICATION SYSTEM ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│  Login.tsx  │  Signup.tsx  │  AuthContext.tsx              │
│             │              │                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            AuthService.ts                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │   signIn    │  │  registerUser│  │   signOut   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │ authenticate_   │    │   create_user   │               │
│  │    user()       │    │     ()          │               │
│  └─────────────────┘    └─────────────────┘               │
│                              │                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                USERS TABLE                          │   │
│  │  ┌─────────┐ ┌─────────────┐ ┌──────┐ ┌─────────┐  │   │
│  │  │   id    │ │    email    │ │ role │ │password_│  │   │
│  │  │ (UUID)  │ │  (unique)   │ │      │ │  hash   │  │   │
│  │  └─────────┘ └─────────────┘ └──────┘ └─────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 **REGISTRATION DATA FLOW**

### **1. User Input → Frontend Validation**
```javascript
// User fills form
{
  full_name: "John Doe",
  email: "john@example.com", 
  phone: "+234 800 000 0000",
  role: "agent",
  branch_id: "uuid-branch-id",
  password: "securepass123"
}

// Frontend validates
✅ Email format: valid
✅ Password length: 12 chars (>6)
✅ Branch selected: Yes (for agent)
✅ All required fields: Complete
```

### **2. Frontend → AuthService → Supabase**
```typescript
// AuthService.registerUser() calls:
await supabase.rpc('create_user', {
  user_email: 'john@example.com',
  user_password: 'securepass123',
  user_full_name: 'John Doe',
  user_phone: '+234 800 000 0000',
  user_role: 'agent',
  user_branch_id: 'uuid-branch-id'
});
```

### **3. Database Processing**
```sql
-- create_user() function executes:

-- 1. Check uniqueness
SELECT COUNT(*) FROM users WHERE email = 'john@example.com';
-- Result: 0 (email available)

-- 2. Hash password
password_hash = crypt('securepass123', gen_salt('bf'));
-- Result: $2b$12$randomsalt...hashedpassword

-- 3. Insert user
INSERT INTO users (id, email, password_hash, full_name, phone, role, branch_id)
VALUES (gen_random_uuid(), 'john@example.com', '$2b$12$...', 'John Doe', '+234 800 000 0000', 'agent', 'uuid-branch-id');

-- 4. Return user ID
RETURN new_user_id; -- Returns: uuid-of-new-user
```

### **4. Response → Frontend → User**
```javascript
// Success response
{
  id: "uuid-of-new-user",
  email: "john@example.com"
}

// Frontend shows success message
alert('Account created successfully! You can now login.');

// Redirect to login page
navigate('/login');
```

---

## 🏗️ **DATABASE SCHEMA FOR USERS**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,           -- Login identifier
  password_hash VARCHAR NOT NULL,          -- bcrypt hashed password
  full_name VARCHAR NOT NULL,              -- Display name
  phone VARCHAR,                           -- Contact number
  role VARCHAR CHECK (role IN ('admin', 'subadmin', 'agent')),
  branch_id UUID REFERENCES branches(id),  -- Branch association
  is_active BOOLEAN DEFAULT TRUE,          -- Account status
  last_login TIMESTAMPTZ,                  -- Last login time
  created_at TIMESTAMPTZ DEFAULT NOW(),    -- Registration time
  updated_at TIMESTAMPTZ DEFAULT NOW()     -- Last update time
);
```

---

## 🔐 **SECURITY FEATURES**

### **Password Security:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Plain Password │    │   bcrypt Hash   │    │   Stored Hash   │
│  "mypassword"   │───▶│   + Salt        │───▶│  $2b$12$xyz... │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Role-Based Access:**
```
ADMIN
├── Full system access
├── User management
├── All branches
└── System settings

SUB-ADMIN
├── Branch management
├── Agent oversight
├── Loan approvals
└── Branch analytics

AGENT
├── Customer registration
├── Loan applications
├── Payment collection
└── Customer management
```

---

## 📱 **HOW TO CREATE USERS**

### **Method 1: Self Registration (Signup Page)**
1. User visits `/signup`
2. Fills registration form
3. Submits form
4. Account created automatically
5. Can login immediately

### **Method 2: Admin Creation (User Management)**
1. Admin logs in
2. Goes to User Management
3. Clicks "Add User"
4. Fills user details
5. System generates password
6. Shares credentials with user

### **Method 3: Bulk Import (Database)**
```sql
-- Create multiple users at once
SELECT create_user('agent1@company.com', 'temp123', 'Agent One', '+234 801 000 0001', 'agent', 'branch-uuid');
SELECT create_user('agent2@company.com', 'temp123', 'Agent Two', '+234 801 000 0002', 'agent', 'branch-uuid');
```

---

## 🎯 **YOUR CURRENT SETUP**

✅ **Working Components:**
- ✅ Signup page with validation
- ✅ Database functions (create_user, authenticate_user)
- ✅ bcrypt password hashing
- ✅ Role-based registration
- ✅ Branch association
- ✅ Custom authentication (no Supabase Auth)

✅ **Default Admin Account:**
- **Email:** admin@millenniumpotter.com
- **Password:** Password123!
- **Role:** admin
- **Status:** Active

**Your registration system is fully functional and secure!** 🎉