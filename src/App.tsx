import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import { Login } from './pages/auth/Login'
import { Signup } from './pages/auth/Signup'
import { MinimalDashboard as AdminDashboard } from './pages/admin/MinimalDashboard'
import { UserManagement } from './pages/admin/UserManagement'
import { AdvancedAnalytics } from './pages/admin/AdvancedAnalytics'
import { SubAdminDashboard } from './pages/subadmin/Dashboard'
import { LoanApprovals } from './pages/subadmin/LoanApprovals'
import { AgentManagement } from './pages/subadmin/AgentManagement'
import { CustomerPortfolio } from './pages/subadmin/CustomerPortfolio'
import { BranchAnalytics } from './pages/subadmin/BranchAnalytics'
import { Disbursements } from './pages/subadmin/Disbursements'
import { AgentDashboard } from './pages/agent/Dashboard'
import { RegisterCustomer } from './pages/agent/RegisterCustomer'
import { ApplyLoan } from './pages/agent/ApplyLoan'
import { WeeklyPayments } from './pages/agent/WeeklyPayments'
import { CustomerList } from './pages/agent/CustomerList'
import { LoanList } from './pages/agent/LoanList'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <PWAInstallPrompt />
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes - Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdvancedAnalytics />
              </ProtectedRoute>
            }
          />
          
          {/* Protected Routes - Sub-Admin */}
          <Route
            path="/subadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['subadmin']}>
                <SubAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subadmin/loan-approvals"
            element={
              <ProtectedRoute allowedRoles={['subadmin']}>
                <LoanApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subadmin/agents"
            element={
              <ProtectedRoute allowedRoles={['subadmin']}>
                <AgentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subadmin/customers"
            element={
              <ProtectedRoute allowedRoles={['subadmin']}>
                <CustomerPortfolio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subadmin/analytics"
            element={
              <ProtectedRoute allowedRoles={['subadmin']}>
                <BranchAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subadmin/disbursements"
            element={
              <ProtectedRoute allowedRoles={['subadmin']}>
                <Disbursements />
              </ProtectedRoute>
            }
          />
          
          {/* Protected Routes - Agent */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/register-customer"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <RegisterCustomer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/apply-loan"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <ApplyLoan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/payments"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <WeeklyPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/customers"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <CustomerList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/loans"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <LoanList />
              </ProtectedRoute>
            }
          />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
