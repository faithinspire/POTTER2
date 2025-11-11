# Implementation Plan

- [x] 1. Project setup and configuration




  - Initialize React project with Vite and TypeScript
  - Install dependencies: Supabase client, React Router, Tailwind CSS, date-fns, recharts
  - Configure Tailwind with custom colors (banking blue, gold accents)
  - Set up environment variables for Supabase URL and anon key
  - Create folder structure for components, pages, services, hooks, types, and utils
  - _Requirements: 1.1, 7.3_

- [-] 2. Supabase database setup

  - [x] 2.1 Create database schema



    - Write SQL migration for branches table
    - Write SQL migration for users table with role enum
    - Write SQL migration for customers table with branch and agent references
    - Write SQL migration for guarantors table with customer reference
    - Write SQL migration for loans table with status workflow
    - Write SQL migration for payments table with status tracking
    - _Requirements: 6.1, 9.2_
  
  - [x] 2.2 Implement Row Level Security policies


    - Create RLS policy for admin full access across all tables
    - Create RLS policy for sub-admin branch-specific access
    - Create RLS policy for agent own-data access
    - Enable RLS on all tables
    - _Requirements: 6.2, 9.1, 9.3_
  
  - [x] 2.3 Create database triggers and indexes

    - Write trigger function to link agents to sub-admins on creation
    - Write trigger function to update timestamps automatically
    - Create indexes on branch_id, agent_id, customer_id, loan_id, payment_date
    - _Requirements: 6.3, 6.4_
  
  - [x] 2.4 Seed initial data
    - Insert two branches (Igando and Abule-Egba)
    - Create admin user account (via Supabase Auth)
    - Create sub-admin accounts for each branch (via Supabase Auth)
    - Create sample agent accounts (via Supabase Auth)
    - _Requirements: 9.4_

- [x] 3. Authentication system
  - [x] 3.1 Create Supabase service and auth utilities
    - Initialize Supabase client with environment variables
    - Create authService with login, logout, and session management functions
    - Implement getUserProfile function to fetch user role and branch
    - _Requirements: 1.1, 1.2_
  
  - [x] 3.2 Build AuthContext and provider
    - Create AuthContext with user, role, branch, loading, and auth functions
    - Implement useAuth hook for consuming auth context
    - Add session persistence with localStorage
    - Handle session refresh and expiration
    - _Requirements: 1.5_
  
  - [x] 3.3 Create login page and auth layout
    - Build Login component with email and password fields
    - Add form validation for login credentials
    - Implement login submission with error handling
    - Create AuthLayout with bank building background and glassmorphism
    - Add floating currency animations (USD, EUR, GBP, NGN, JPY, CAD)
    - _Requirements: 1.1, 7.1, 7.2_
  
  - [x] 3.4 Implement protected routes
    - Create ProtectedRoute component that checks user role
    - Redirect unauthenticated users to login
    - Redirect users to appropriate dashboard based on role
    - _Requirements: 1.5_

- [x] 4. Shared UI components and layouts
  - [x] 4.1 Create reusable UI components
    - Build Card component with glassmorphism styling
    - Build Table component with sorting and pagination
    - Build Modal component for dialogs
    - Build LoadingSpinner component
    - Build Button component with variants (primary, secondary, danger)
    - _Requirements: 7.3, 7.4_
  
  - [x] 4.2 Build navigation components
    - Create Navbar with user profile, notifications, and logout
    - Create Sidebar with role-based menu items
    - Add active route highlighting
    - Implement mobile-responsive hamburger menu
    - _Requirements: 7.4_
  
  - [x] 4.3 Create dashboard layouts
    - Build AdminLayout with sidebar and navbar
    - Build SubAdminLayout with sidebar and navbar
    - Build AgentLayout with sidebar and navbar
    - Add bank building background with overlay to all layouts
    - _Requirements: 7.1, 7.3_

- [-] 5. Admin dashboard implementation
  - [x] 5.1 Create admin dashboard overview page
    - Build StatsCard components for KPIs (total loans, customers, collections)
    - Fetch and display aggregated data from both branches
    - Create ChartWidget for loan trends using recharts
    - Display recent activity feed
    - _Requirements: 2.1, 2.2_
  
  - [ ] 5.2 Build branch comparison page
    - Create comparison table for Igando vs Abule-Egba metrics
    - Add side-by-side bar charts for visual comparison
    - Display branch-specific KPIs (active loans, collection rate, customers)
    - _Requirements: 2.2_
  
  - [ ] 5.3 Implement user management page
    - Create table displaying all users with role and branch
    - Add search and filter by role and branch
    - Build modal for adding new users (sub-admin or agent)
    - Implement user edit and deactivation functionality
    - _Requirements: 2.3_
  
  - [ ] 5.4 Build all loans management page
    - Display loans table with customer, agent, branch, amount, status
    - Add filters for status, branch, date range
    - Implement search by customer name or loan ID
    - Show loan details modal with customer and guarantor info
    - _Requirements: 2.4_
  
  - [ ] 5.5 Create transaction monitoring page
    - Build real-time transaction table with Supabase subscription
    - Display payment date, customer, agent, amount, status
    - Add filters for branch, date range, status
    - Implement export to CSV functionality
    - _Requirements: 2.5, 8.2_
  
  - [ ] 5.6 Build reports and analytics page
    - Create date range selector for custom reports
    - Display detailed analytics charts (collection trends, loan performance)
    - Add export functionality for PDF reports
    - Show agent performance rankings across both branches
    - _Requirements: 2.6, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 6. Sub-admin dashboard implementation
  - [x] 6.1 Create sub-admin dashboard overview
    - Display branch-specific KPIs (active loans, customers, collection rate)
    - Show weekly collection trends chart
    - Display pending loan approvals count
    - List recent transactions for the branch
    - _Requirements: 3.1_
  
  - [x] 6.2 Build agent management page
    - Create table of agents assigned to the branch
    - Display agent performance metrics (customers, loans, collections)
    - Add modal for adding new agents to the branch
    - Implement agent edit and deactivation
    - _Requirements: 3.2_
  
  - [x] 6.3 Implement customer portfolio page
    - Display all customers for the branch with search and filters
    - Show customer details including guarantors
    - Display customer loan history and payment status
    - Add customer edit functionality
    - _Requirements: 3.3_
  
  - [x] 6.4 Create loan approval workflow page
    - Display pending loans queue for the branch
    - Build loan review modal with customer, guarantor, and loan details
    - Implement approve button with confirmation
    - Implement reject button with reason textarea
    - Send real-time notification to agent on approval/rejection
    - _Requirements: 3.4, 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 6.5 Build branch analytics page
    - Display branch-specific performance charts
    - Show agent performance leaderboard
    - Create collection rate trends over time
    - Add loan disbursement vs repayment analysis
    - _Requirements: 3.5, 11.1, 11.3_

- [x] 7. Agent dashboard implementation
  - [x] 7.1 Create agent dashboard overview
    - Display personal performance metrics (customers registered, loans submitted, collections)
    - Show target vs achievement progress bars
    - Display today's collection tasks
    - List recent customer registrations
    - _Requirements: 4.5_
  
  - [x] 7.2 Build customer registration form
    - Create multi-step form with customer personal info step
    - Add customer identification details step
    - Build guarantor information step (minimum 1, maximum 3)
    - Implement form validation for all fields
    - Add review and submit step with summary
    - Submit customer and guarantors to Supabase
    - _Requirements: 4.1, 4.2, 12.1, 12.2, 12.3, 12.4_
  
  - [x] 7.3 Implement loan application form
    - Create form to select existing customer
    - Add loan amount, interest rate, and duration inputs
    - Calculate and display weekly payment amount automatically
    - Validate loan parameters
    - Submit loan application with pending status
    - _Requirements: 4.3, 4.4_
  
  - [x] 7.4 Build customer list page
    - Display agent's customers in a table
    - Add search by name, phone, or ID number
    - Show customer loan status and payment history
    - Implement customer details modal
    - _Requirements: 12.5_

- [x] 8. Weekly payment tracking sheet
  - [x] 8.1 Create payment grid component
    - Build grid layout with customers as rows and days (Mon-Sat) as columns
    - Fetch active loans for agent's customers
    - Generate payment cells for current week
    - Display customer name and loan amount in row header
    - _Requirements: 5.1, 5.6_
  
  - [x] 8.2 Implement payment cell interactions
    - Create touch-friendly checkbox for each payment cell
    - Handle checkbox toggle to mark payment as paid/unpaid
    - Update payment record in Supabase on toggle
    - Apply color coding: green (paid), red (overdue), yellow (partial), gray (unpaid)
    - _Requirements: 5.2, 5.4, 5.5_
  
  - [x] 8.3 Add real-time synchronization
    - Subscribe to payment changes using Supabase realtime
    - Update grid cells automatically when payments are recorded
    - Show connection status indicator
    - _Requirements: 5.3, 8.1, 8.3_
  
  - [x] 8.4 Implement mobile optimizations
    - Add horizontal scroll for grid on mobile
    - Implement swipe gestures for week navigation
    - Optimize touch targets for mobile devices
    - Add offline capability with local storage fallback
    - _Requirements: 5.5, 7.4_

- [ ] 9. Real-time features and notifications
  - [ ] 9.1 Create real-time subscription hooks
    - Build useRealtime hook for generic Supabase subscriptions
    - Create usePaymentUpdates hook for payment changes
    - Create useLoanUpdates hook for loan status changes
    - Implement connection status tracking
    - _Requirements: 6.5, 8.1_
  
  - [ ] 9.2 Implement dashboard real-time updates
    - Subscribe to payment changes in admin dashboard
    - Subscribe to loan changes in sub-admin dashboard
    - Update KPIs automatically when data changes
    - Refresh charts and tables without page reload
    - _Requirements: 8.2, 8.3_
  
  - [ ] 9.3 Build notification system
    - Create notification context and provider
    - Display toast notifications for real-time events
    - Show notification badge in navbar
    - Implement notification list modal
    - _Requirements: 8.4_
  
  - [ ] 9.4 Handle connection loss and recovery
    - Detect when real-time connection is lost
    - Display connection status indicator to user
    - Attempt automatic reconnection
    - Refresh data when connection is restored
    - _Requirements: 8.5_

- [x] 10. Service layer and API integration
  - [x] 10.1 Create customer service
    - Implement createCustomer function with guarantors
    - Implement getCustomers function with branch filtering
    - Implement updateCustomer function
    - Implement searchCustomers function
    - _Requirements: 4.1, 4.2, 12.3, 12.5_
  
  - [x] 10.2 Create loan service
    - Implement createLoan function
    - Implement getLoans function with filters
    - Implement approveLoan function for sub-admins
    - Implement rejectLoan function with reason
    - Implement getLoanDetails with customer and guarantor data
    - _Requirements: 4.3, 10.3, 10.4_
  
  - [x] 10.3 Create payment service
    - Implement recordPayment function
    - Implement getPaymentsByWeek function for grid
    - Implement updatePaymentStatus function
    - Implement getPaymentHistory function
    - _Requirements: 5.2, 5.3_
  
  - [x] 10.4 Create analytics service
    - Implement getBranchKPIs function
    - Implement getAgentPerformance function
    - Implement getCollectionTrends function
    - Implement exportReportData function
    - _Requirements: 11.1, 11.2, 11.3, 11.5_

- [x] 11. Utility functions and helpers
  - [x] 11.1 Create formatters
    - Implement currency formatter for Nigerian Naira
    - Implement date formatter for consistent display
    - Implement phone number formatter
    - Implement percentage formatter
    - _Requirements: 7.3_
  
  - [x] 11.2 Create validators
    - Implement email validation
    - Implement phone number validation
    - Implement ID number validation
    - Implement loan amount validation
    - _Requirements: 12.1_
  
  - [x] 11.3 Create constants file
    - Define user roles enum
    - Define loan status enum
    - Define payment status enum
    - Define branch names and IDs
    - Define currency symbols for animations
    - _Requirements: 1.2, 7.1_

- [ ] 12. Error handling and loading states
  - [ ] 12.1 Create error boundary component
    - Implement React error boundary
    - Display user-friendly error message
    - Add retry functionality
    - Log errors to console
    - _Requirements: 1.1_
  
  - [ ] 12.2 Implement API error handling
    - Create handleApiError utility function
    - Map Supabase errors to user-friendly messages
    - Handle authentication errors with redirect to login
    - Handle permission errors with appropriate messaging
    - _Requirements: 1.1, 9.3_
  
  - [ ] 12.3 Add loading states
    - Create loading spinner component
    - Add loading states to all data fetching operations
    - Implement skeleton loaders for tables and cards
    - Add loading overlay for form submissions
    - _Requirements: 7.4_

- [x] 13. Routing and navigation
  - [x] 13.1 Set up React Router
    - Configure BrowserRouter in App.tsx
    - Define routes for auth pages (login, forgot password)
    - Define routes for admin pages (dashboard, users, loans, transactions, reports)
    - Define routes for sub-admin pages (dashboard, agents, customers, approvals, analytics)
    - Define routes for agent pages (dashboard, register, loan, payments, performance)
    - _Requirements: 1.5_
  
  - [x] 13.2 Implement role-based navigation
    - Create navigation menu items based on user role
    - Hide/show menu items based on permissions
    - Redirect to appropriate dashboard after login
    - Handle 404 not found page
    - _Requirements: 1.2, 1.5_

- [x] 14. Visual design and animations
  - [x] 14.1 Implement background design
    - Add bank building background image to auth and dashboard layouts
    - Create gradient overlay for readability
    - Implement parallax effect on scroll
    - _Requirements: 7.1_
  
  - [x] 14.2 Create currency floating animations
    - Build CurrencyAnimation component
    - Animate currency symbols (USD, EUR, GBP, NGN, JPY, CAD) floating upward
    - Add fade-in and fade-out effects
    - Position symbols randomly across the screen
    - _Requirements: 7.1_
  
  - [x] 14.3 Apply glassmorphism effects
    - Create glass-card CSS class with backdrop blur
    - Apply glassmorphism to all cards and modals
    - Add glassmorphism to navbar and sidebar
    - Ensure proper contrast for readability
    - _Requirements: 7.2, 7.3_
  
  - [x] 14.4 Implement color scheme
    - Apply banking blue primary color throughout
    - Add gold accents to important elements (buttons, highlights)
    - Use status colors consistently (green, red, yellow, gray)
    - Ensure WCAG accessibility standards for contrast
    - _Requirements: 7.3_

- [ ] 15. Performance optimization
  - [ ] 15.1 Implement code splitting
    - Add lazy loading for route components
    - Split admin, sub-admin, and agent bundles
    - Add loading fallback for lazy components
    - _Requirements: 7.4_
  
  - [ ] 15.2 Optimize data fetching
    - Implement pagination for large tables
    - Add debouncing to search inputs
    - Cache frequently accessed data
    - Use React Query or SWR for data caching
    - _Requirements: 6.4_
  
  - [ ] 15.3 Optimize images and assets
    - Compress bank building background image
    - Use WebP format for images
    - Implement lazy loading for images
    - _Requirements: 7.1_

- [ ] 16. Testing and validation
  - [ ] 16.1 Write service layer tests
    - Test authService login and logout functions
    - Test customerService CRUD operations
    - Test loanService approval workflow
    - Test paymentService recording and updates
    - _Requirements: 1.1, 4.1, 10.3, 5.2_
  
  - [ ] 16.2 Write component tests
    - Test Login component form submission
    - Test CustomerForm validation and submission
    - Test LoanApplicationForm calculations
    - Test WeeklyPaymentGrid interactions
    - _Requirements: 1.1, 4.1, 4.3, 5.2_
  
  - [ ] 16.3 Write integration tests
    - Test complete customer registration flow
    - Test loan application and approval workflow
    - Test payment recording and real-time sync
    - Test role-based access control
    - _Requirements: 4.1, 10.1, 5.3, 1.5_

- [ ] 17. Documentation and deployment
  - [ ] 17.1 Create README documentation
    - Document project setup instructions
    - List environment variables required
    - Provide database setup instructions
    - Include development and build commands
    - _Requirements: 6.1_
  
  - [ ] 17.2 Prepare for deployment
    - Configure build scripts for production
    - Set up environment variables for production Supabase
    - Test production build locally
    - Create deployment configuration for Vercel/Netlify
    - _Requirements: 6.1_
