# Requirements Document

## Introduction

Millennium Potter is a comprehensive fintech loan management platform designed for microfinance operations across multiple branches. The system supports three distinct user roles (Admin, Sub-Admin, and Agent) with branch-specific operations for Igando and Abule-Egba locations. The platform features real-time payment tracking, loan management, customer registration with guarantor details, and automated branch-based data segregation using Supabase as the backend database.

## Glossary

- **Platform**: The Millennium Potter fintech loan management web application
- **Admin**: Global administrator with oversight across all branches
- **Sub-Admin**: Branch-level administrator managing specific branch operations (Igando or Abule-Egba)
- **Agent**: Field agent who registers customers, processes loans, and collects daily payments
- **Supabase**: The backend-as-a-service platform providing database, authentication, and real-time subscriptions
- **RLS**: Row Level Security policies in Supabase that enforce branch-based data access
- **Weekly Payment Sheet**: Interactive grid interface for tracking customer payments Monday through Saturday
- **Branch**: Physical location (Igando or Abule-Egba) where operations are conducted
- **Guarantor**: Person who provides security for a customer's loan application
- **Glassmorphism**: UI design pattern featuring frosted glass effects with transparency

## Requirements

### Requirement 1: User Authentication and Role Management

**User Story:** As a user, I want to authenticate with role-based access so that I can access features appropriate to my position

#### Acceptance Criteria

1. WHEN a user attempts to log in, THE Platform SHALL authenticate credentials through Supabase Auth
2. WHEN authentication succeeds, THE Platform SHALL assign the user to exactly one role (Admin, Sub-Admin, or Agent)
3. WHERE a user has Sub-Admin role, THE Platform SHALL associate the user with exactly one branch (Igando or Abule-Egba)
4. WHERE a user has Agent role, THE Platform SHALL associate the user with exactly one branch and link to the corresponding Sub-Admin
5. WHEN a user session is established, THE Platform SHALL enforce role-based access control for all subsequent operations

### Requirement 2: Admin Dashboard Global Oversight

**User Story:** As an Admin, I want global oversight across both branches so that I can monitor and manage all operations from a central location

#### Acceptance Criteria

1. THE Platform SHALL provide Admin users access to data from both Igando and Abule-Egba branches
2. WHEN an Admin views the dashboard, THE Platform SHALL display comparison analytics between both branches
3. THE Platform SHALL enable Admin users to view and manage all users across both branches
4. THE Platform SHALL enable Admin users to view and manage all loans across both branches
5. WHEN an Admin requests transaction monitoring, THE Platform SHALL display real-time transaction data from both branches
6. THE Platform SHALL provide Admin users with data export functionality for reporting purposes

### Requirement 3: Sub-Admin Branch-Specific Operations

**User Story:** As a Sub-Admin, I want to manage operations for my specific branch so that I can oversee agents and customers in my location

#### Acceptance Criteria

1. WHEN a Sub-Admin accesses the dashboard, THE Platform SHALL display only data associated with their assigned branch
2. THE Platform SHALL enable Sub-Admin users to manage agents assigned to their branch
3. THE Platform SHALL enable Sub-Admin users to view customer portfolios within their branch
4. WHEN a loan requires approval, THE Platform SHALL present the loan to the Sub-Admin for their branch
5. THE Platform SHALL provide Sub-Admin users with branch-specific analytics and reports
6. WHEN an agent submits a transaction, THE Platform SHALL automatically link the transaction to the Sub-Admin for inspection

### Requirement 4: Agent Customer and Loan Management

**User Story:** As an Agent, I want to register customers and process loan applications so that I can serve customers in the field

#### Acceptance Criteria

1. THE Platform SHALL enable Agent users to register new customers with complete profile information
2. WHEN an Agent registers a customer, THE Platform SHALL require at least one guarantor with complete details
3. THE Platform SHALL enable Agent users to submit loan applications on behalf of customers
4. WHEN an Agent submits a loan application, THE Platform SHALL associate the loan with the Agent's branch
5. THE Platform SHALL enable Agent users to view their performance metrics and targets

### Requirement 5: Weekly Payment Tracking Interface

**User Story:** As an Agent, I want to track daily payments on a weekly grid so that I can efficiently record collections in the field

#### Acceptance Criteria

1. THE Platform SHALL display a weekly payment grid with customers as rows and days (Monday through Saturday) as columns
2. WHEN an Agent marks a payment as collected, THE Platform SHALL update the payment status in real-time
3. THE Platform SHALL synchronize payment data with Admin and Sub-Admin dashboards in real-time
4. THE Platform SHALL provide color-coded visual indicators for payment status (paid, unpaid, overdue)
5. THE Platform SHALL optimize the weekly payment interface for mobile device touch interactions
6. WHEN an Agent views the payment sheet, THE Platform SHALL display only customers assigned to their branch

### Requirement 6: Supabase Database Integration

**User Story:** As a system, I want to persist all data in Supabase with proper security so that data is reliable and protected

#### Acceptance Criteria

1. THE Platform SHALL store all user, customer, loan, and transaction data in Supabase PostgreSQL database
2. THE Platform SHALL implement Row Level Security policies to enforce branch-based data access
3. WHEN an Agent is created, THE Platform SHALL execute a database trigger to link the Agent to their branch Sub-Admin
4. THE Platform SHALL create database indexes on frequently queried fields to optimize performance
5. THE Platform SHALL establish real-time subscriptions for dashboard updates without page refresh

### Requirement 7: Visual Design and User Experience

**User Story:** As a user, I want a premium banking aesthetic so that the platform conveys professionalism and trust

#### Acceptance Criteria

1. THE Platform SHALL display bank building background images with multi-currency floating animations (USD, EUR, GBP, NGN, JPY, CAD)
2. THE Platform SHALL apply glassmorphism effects over background images for modern visual appeal
3. THE Platform SHALL use banking blue color themes with gold accent colors throughout the interface
4. THE Platform SHALL ensure all interactive elements are touch-friendly for mobile field agents
5. THE Platform SHALL maintain consistent visual design across all dashboard pages

### Requirement 8: Real-Time Data Synchronization

**User Story:** As a user, I want to see live updates without refreshing so that I have current information at all times

#### Acceptance Criteria

1. WHEN data changes in the database, THE Platform SHALL push updates to connected clients through Supabase real-time subscriptions
2. THE Platform SHALL update dashboard metrics in real-time when transactions are recorded
3. WHEN an Agent marks a payment, THE Platform SHALL immediately reflect the change in Sub-Admin and Admin dashboards
4. THE Platform SHALL maintain real-time connection status indicators for users
5. IF the real-time connection is lost, THEN THE Platform SHALL notify the user and attempt reconnection

### Requirement 9: Branch Data Segregation

**User Story:** As a Sub-Admin or Agent, I want to see only my branch data so that I can focus on my responsibilities without confusion

#### Acceptance Criteria

1. WHEN a Sub-Admin or Agent queries data, THE Platform SHALL filter results to include only their assigned branch
2. THE Platform SHALL enforce branch segregation at the database level through RLS policies
3. THE Platform SHALL prevent Sub-Admin and Agent users from accessing data from other branches
4. WHERE a user has Admin role, THE Platform SHALL bypass branch filters to provide global access
5. WHEN displaying branch-specific data, THE Platform SHALL clearly indicate which branch is being viewed

### Requirement 10: Loan Approval Workflow

**User Story:** As a Sub-Admin, I want to review and approve loan applications so that I can ensure proper lending practices

#### Acceptance Criteria

1. WHEN an Agent submits a loan application, THE Platform SHALL set the loan status to pending approval
2. THE Platform SHALL notify the appropriate Sub-Admin when a loan requires approval
3. THE Platform SHALL enable Sub-Admin users to review complete loan details including customer and guarantor information
4. THE Platform SHALL enable Sub-Admin users to approve or reject loan applications with optional comments
5. WHEN a loan status changes, THE Platform SHALL notify the submitting Agent in real-time

### Requirement 11: Performance Analytics and Reporting

**User Story:** As an Admin or Sub-Admin, I want comprehensive analytics so that I can make informed business decisions

#### Acceptance Criteria

1. THE Platform SHALL calculate and display key performance indicators including total loans, active customers, and collection rates
2. WHEN an Admin views analytics, THE Platform SHALL provide comparison metrics between branches
3. THE Platform SHALL generate visual charts for loan disbursement trends, payment collection rates, and agent performance
4. THE Platform SHALL enable users to filter analytics by date range, branch, and agent
5. THE Platform SHALL provide data export functionality in CSV and PDF formats

### Requirement 12: Customer and Guarantor Management

**User Story:** As an Agent, I want to maintain complete customer records with guarantor details so that loan applications are properly documented

#### Acceptance Criteria

1. THE Platform SHALL require customer registration to include full name, contact information, address, and identification details
2. WHEN registering a customer, THE Platform SHALL require at least one guarantor with full name, contact information, address, and relationship to customer
3. THE Platform SHALL enable Agent users to update customer and guarantor information
4. THE Platform SHALL associate each customer with the Agent who registered them and their branch
5. THE Platform SHALL enable search and filtering of customers by name, phone number, or identification number
