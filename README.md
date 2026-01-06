# Task Management App

A modern, full-featured task management application built with Next.js 16, React 19, and TypeScript. This application provides a complete solution for managing personal tasks with user authentication, CRUD operations, filtering, sorting, and pagination.

## Table of Contents

-   [Project Overview](#project-overview)
-   [Prerequisites](#prerequisites)
-   [Local Development Setup](#local-development-setup)
-   [Environment Variables](#environment-variables)
-   [Functional Features](#functional-features)
-   [Non-Functional Features](#non-functional-features)
-   [Technology Stack](#technology-stack)
-   [Project Structure](#project-structure)
-   [Available Scripts](#available-scripts)
-   [Database Schema](#database-schema)
-   [API Endpoints](#api-endpoints)
-   [Testing](#testing)
-   [Additional Notes](#additional-notes)

## Project Overview

TaskFlow is a comprehensive task management application that allows users to:

-   Create and manage personal tasks
-   Organize tasks by status (Pending, Completed, Canceled)
-   Search and filter tasks efficiently
-   View task statistics on a dashboard
-   Manage user profile and account settings
-   Experience a modern, responsive UI with dark mode support

The application follows modern web development best practices with server-side rendering, API routes, and a clean, maintainable codebase.

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js** (v18 or higher recommended)
-   **PostgreSQL** (v12 or higher)
-   **npm**, **yarn**, or **pnpm** package manager

You can verify your installations:

```bash
node --version
npm --version
psql --version
```

## Local Development Setup

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd task-management-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local  # If .env.example exists
# or create .env.local manually
```

Add the following environment variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/task_management?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

**Important:**

-   Replace `username`, `password`, and `task_management` with your PostgreSQL credentials and database name
-   Use a strong, random string for `JWT_SECRET` in production
-   Never commit `.env.local` to version control

### 4. Set Up the Database

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE task_management;

# Exit psql
\q
```

#### Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# (Optional) Seed the database if seed script exists
npx prisma db seed
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 6. Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Environment Variables

| Variable       | Description                      | Required | Example                                        |
| -------------- | -------------------------------- | -------- | ---------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string     | Yes      | `postgresql://user:pass@localhost:5432/dbname` |
| `JWT_SECRET`   | Secret key for JWT token signing | Yes      | `your-secret-key-change-in-production`         |

### Environment Variable Details

-   **DATABASE_URL**: Full PostgreSQL connection string including username, password, host, port, database name, and schema
-   **JWT_SECRET**: Used to sign and verify JWT tokens for authentication. Should be a long, random string in production

## Functional Features

### Authentication

-   **User Registration**: Create a new account with name, email, and password
-   **User Login**: Authenticate with email and password
-   **User Logout**: Securely log out and clear session
-   **Session Management**: JWT-based authentication with HTTP-only cookies
-   **Protected Routes**: Automatic redirection for unauthenticated users

### Task Management

-   **Create Tasks**: Add new tasks with title and optional description
-   **View Tasks**: Display all tasks in a paginated table view
-   **Update Tasks**: Edit task title, description, and status
-   **Delete Tasks**: Remove tasks from the system
-   **Task Status**: Three status types:
    -   `PENDING` - Tasks that are not yet completed
    -   `COMPLETED` - Finished tasks
    -   `CANCELED` - Cancelled tasks

### Task Filtering & Search

-   **Status Filtering**: Filter tasks by status (All, Pending, Completed, Canceled)
-   **Search Functionality**: Search tasks by title or description
-   **Combined Filters**: Use search and status filter together

### Task Sorting

-   **Sort by Date**: Newest first or oldest first
-   **Sort by Status**: Group tasks by status
-   **Sort by Title**: Alphabetical sorting

### Pagination

-   **Server-side Pagination**: Efficient data loading with configurable page size
-   **Page Navigation**: Navigate between pages of results
-   **Items Per Page**: Default 10 items per page (configurable)

### User Profile Management

-   **View Profile**: Display user information (name, email)
-   **Update Profile**: Modify name and email
-   **Change Password**: Update account password securely
-   **Account Deletion**: Permanently delete user account and associated data

### Dashboard

-   **Task Statistics**: View total, pending, and completed task counts
-   **Recent Activity**: Display the 5 most recently created tasks
-   **Visual Indicators**: Color-coded status badges

## Non-Functional Features

### User Interface

-   **Dark Mode / Light Mode**: Toggle between themes with persistent preference
-   **Responsive Design**: Fully responsive layout for mobile, tablet, and desktop
-   **Loading States**: Skeleton loaders and loading indicators during data fetching
-   **Error Handling**: User-friendly error messages and error boundaries
-   **Toast Notifications**: Success and error notifications using Sonner

### Form Handling

-   **Form Validation**: Client and server-side validation using Zod schemas
-   **Error Messages**: Clear, contextual validation error messages
-   **Form State Management**: React Hook Form for efficient form handling

### Security

-   **Protected Routes**: Auth guard component prevents unauthorized access
-   **HTTP-only Cookies**: Secure cookie storage for JWT tokens
-   **Password Hashing**: bcrypt for secure password storage
-   **Input Validation**: Server-side validation for all API endpoints

### Performance

-   **Server-side Pagination**: Reduces data transfer and improves performance
-   **Server-side Filtering**: Efficient database queries with proper indexing
-   **Optimistic Updates**: React Query for optimistic UI updates
-   **Code Splitting**: Next.js automatic code splitting

### Developer Experience

-   **TypeScript**: Full type safety throughout the application
-   **ESLint**: Code linting and quality checks
-   **Testing**: Jest and React Testing Library for unit and integration tests
-   **Hot Reload**: Fast refresh during development

## Technology Stack

### Frontend

-   **Next.js 16.1.1** - React framework with App Router
-   **React 19.2.3** - UI library
-   **TypeScript 5** - Type-safe JavaScript
-   **Tailwind CSS 4** - Utility-first CSS framework
-   **shadcn/ui** - High-quality React components built on Radix UI

### Backend

-   **Next.js API Routes** - Serverless API endpoints
-   **Prisma 7.2.0** - Next-generation ORM
-   **PostgreSQL** - Relational database
-   **@prisma/adapter-pg** - PostgreSQL adapter for Prisma

### Authentication & Security

-   **jose 6.1.3** - JWT implementation
-   **bcrypt 6.0.0** - Password hashing
-   **cookie 1.1.1** - Cookie parsing and serialization

### State Management & Data Fetching

-   **@tanstack/react-query 5.90.16** - Server state management
-   **@tanstack/react-query-devtools 5.91.2** - Development tools

### Form Handling & Validation

-   **react-hook-form 7.70.0** - Performant forms
-   **zod 4.3.5** - Schema validation
-   **@hookform/resolvers 5.2.2** - Zod resolver for React Hook Form

### UI Components & Icons

-   **Radix UI** - Unstyled, accessible component primitives:
    -   `@radix-ui/react-avatar`
    -   `@radix-ui/react-checkbox`
    -   `@radix-ui/react-dialog`
    -   `@radix-ui/react-dropdown-menu`
    -   `@radix-ui/react-label`
    -   `@radix-ui/react-select`
    -   `@radix-ui/react-separator`
    -   `@radix-ui/react-slot`
    -   `@radix-ui/react-tooltip`
-   **lucide-react 0.562.0** - Icon library
-   **sonner 2.0.7** - Toast notifications

### Styling & Theming

-   **next-themes 0.4.6** - Theme management
-   **class-variance-authority 0.7.1** - Component variants
-   **clsx 2.1.1** - Conditional class names
-   **tailwind-merge 3.4.0** - Merge Tailwind classes

### Utilities

-   **date-fns 4.1.0** - Date formatting and manipulation

### Development Tools

-   **Jest 30.2.0** - Testing framework
-   **@testing-library/react 16.3.1** - React component testing
-   **@testing-library/jest-dom 6.6.3** - DOM matchers
-   **@testing-library/user-event 14.5.2** - User interaction simulation
-   **jest-environment-jsdom 30.2.0** - Browser-like environment
-   **ESLint 9** - Code linting
-   **eslint-config-next 16.1.1** - Next.js ESLint config
-   **babel-plugin-react-compiler 1.0.0** - React compiler plugin
-   **dotenv 17.2.3** - Environment variable management

## Project Structure

```
task-management-app/
├── prisma/
│   └── schema.prisma          # Database schema definition
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication routes group
│   │   │   ├── login/          # Login page
│   │   │   └── register/       # Registration page
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   ├── page.tsx        # Dashboard/Overview page
│   │   │   ├── tasks/          # Tasks management page
│   │   │   └── settings/       # User settings page
│   │   └── api/                # API routes
│   │       ├── auth/           # Authentication endpoints
│   │       │   ├── login/
│   │       │   ├── register/
│   │       │   ├── logout/
│   │       │   ├── me/
│   │       │   ├── profile/
│   │       │   ├── password/
│   │       │   └── account/
│   │       └── tasks/          # Task endpoints
│   │           ├── route.ts   # GET (list), POST (create)
│   │           └── [id]/       # GET, PUT, PATCH, DELETE
│   ├── components/             # React components
│   │   ├── auth/              # Authentication components
│   │   ├── tasks/             # Task-related components
│   │   ├── settings/          # Settings components
│   │   ├── shared/            # Shared components (sidebar, navbar)
│   │   └── ui/                # Reusable UI components (shadcn/ui)
│   ├── context/               # React context providers
│   │   └── auth-context.tsx   # Authentication context
│   ├── generated/             # Generated code
│   │   └── prisma/            # Prisma generated client
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   │   ├── prisma.ts          # Prisma client instance
│   │   ├── jwt.ts             # JWT utilities
│   │   ├── cookies.ts         # Cookie utilities
│   │   ├── date.ts            # Date formatting utilities
│   │   └── utils.ts           # General utilities
│   ├── providers/            # Context providers
│   ├── services/             # Business logic services
│   │   ├── auth.service.ts   # Authentication service
│   │   └── task.service.ts   # Task service
│   ├── types/                # TypeScript type definitions
│   └── validators/           # Zod validation schemas
│       ├── auth.schema.ts    # Auth validation schemas
│       └── task.schema.ts    # Task validation schemas
├── .eslintrc.json            # ESLint configuration
├── jest.config.ts            # Jest configuration
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Available Scripts

| Script                  | Description                                                                    |
| ----------------------- | ------------------------------------------------------------------------------ |
| `npm run dev`           | Start the development server at [http://localhost:3000](http://localhost:3000) |
| `npm run build`         | Create an optimized production build                                           |
| `npm run start`         | Start the production server (run `build` first)                                |
| `npm run lint`          | Run ESLint to check code quality                                               |
| `npm run test`          | Run all tests once                                                             |
| `npm run test:watch`    | Run tests in watch mode                                                        |
| `npm run test:coverage` | Run tests and generate coverage report                                         |

## Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]
}
```

**Fields:**

-   `id`: Unique identifier (CUID)
-   `name`: Optional user name
-   `email`: Unique email address
-   `password`: Hashed password
-   `createdAt`: Account creation timestamp
-   `updatedAt`: Last update timestamp
-   `tasks`: One-to-many relationship with Task model

### Task Model

```prisma
model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      Status   @default(PENDING)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, status])
  @@index([userId, createdAt])
}
```

**Fields:**

-   `id`: Unique identifier (CUID)
-   `title`: Task title (required)
-   `description`: Optional task description
-   `status`: Task status (enum: PENDING, COMPLETED, CANCELED)
-   `createdAt`: Task creation timestamp
-   `updatedAt`: Last update timestamp
-   `userId`: Foreign key to User
-   `user`: Many-to-one relationship with User model

**Indexes:**

-   Index on `userId` for efficient user queries
-   Composite index on `userId` and `status` for filtered queries
-   Composite index on `userId` and `createdAt` for sorted queries

### Status Enum

```prisma
enum Status {
  PENDING
  COMPLETED
  CANCELED
}
```

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

**Response:**

```json
{
    "success": true,
    "user": {
        "id": "clx...",
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

#### POST `/api/auth/login`

Authenticate user and create session.

**Request Body:**

```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response:**

```json
{
    "success": true,
    "user": {
        "id": "clx...",
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

#### POST `/api/auth/logout`

Log out the current user and clear session.

**Response:**

```json
{
    "success": true
}
```

#### GET `/api/auth/me`

Get current authenticated user information.

**Response:**

```json
{
    "success": true,
    "user": {
        "id": "clx...",
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

#### PUT `/api/auth/profile`

Update user profile (name, email).

**Request Body:**

```json
{
    "name": "Jane Doe",
    "email": "jane@example.com"
}
```

#### PUT `/api/auth/password`

Change user password.

**Request Body:**

```json
{
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
}
```

#### DELETE `/api/auth/account`

Delete user account and all associated tasks.

### Task Endpoints

#### GET `/api/tasks`

Get paginated list of tasks with filtering, sorting, and search.

**Query Parameters:**

-   `page` (optional): Page number (default: 1)
-   `limit` (optional): Items per page (default: 10, max: 100)
-   `status` (optional): Filter by status (`PENDING`, `COMPLETED`, `CANCELED`)
-   `search` (optional): Search in title and description
-   `sortBy` (optional): Sort field (`createdAt`, `status`, `title`)
-   `sortOrder` (optional): Sort direction (`asc`, `desc`)

**Example:**

```
GET /api/tasks?page=1&limit=10&status=PENDING&search=meeting&sortBy=createdAt&sortOrder=desc
```

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": "clx...",
            "title": "Task title",
            "description": "Task description",
            "status": "PENDING",
            "userId": "clx...",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "updatedAt": "2024-01-01T00:00:00.000Z"
        }
    ],
    "pagination": {
        "total": 25,
        "page": 1,
        "limit": 10,
        "totalPages": 3
    }
}
```

#### POST `/api/tasks`

Create a new task.

**Request Body:**

```json
{
    "title": "New Task",
    "description": "Task description (optional)",
    "status": "PENDING"
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "id": "clx...",
        "title": "New Task",
        "description": "Task description",
        "status": "PENDING",
        "userId": "clx...",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
}
```

#### GET `/api/tasks/[id]`

Get a specific task by ID.

**Response:**

```json
{
    "success": true,
    "data": {
        "id": "clx...",
        "title": "Task title",
        "description": "Task description",
        "status": "PENDING",
        "userId": "clx...",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
}
```

#### PUT `/api/tasks/[id]`

Update a task (full update).

**Request Body:**

```json
{
    "title": "Updated Task",
    "description": "Updated description",
    "status": "COMPLETED"
}
```

#### PATCH `/api/tasks/[id]`

Update a task (partial update). Uses same logic as PUT.

#### DELETE `/api/tasks/[id]`

Delete a task.

**Response:**

```json
{
    "success": true,
    "message": "Task deleted successfully"
}
```

**Note:** All task endpoints require authentication via JWT token in HTTP-only cookie.

## Testing

The project uses Jest and React Testing Library for testing.

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

Tests are located alongside the code they test:

-   Component tests: `src/components/__tests__/`
-   API route tests: `src/app/api/__tests__/`
-   Service tests: `src/services/__tests__/`
-   Utility tests: `src/lib/__tests__/`
-   Validator tests: `src/validators/__tests__/`

### Test Utilities

Test utilities and mocks are available in `src/__tests__/utils/`:

-   `test-utils.tsx` - Testing utilities and providers
-   `prisma-mock.ts` - Prisma client mock
-   `mock-data.ts` - Mock data generators

## Additional Notes

### Code Style

-   The project uses TypeScript with strict mode enabled
-   ESLint is configured with Next.js recommended rules
-   Components follow React best practices with proper TypeScript typing

### Database Migrations

When making schema changes:

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy
```

### Prisma Client Generation

After schema changes, regenerate Prisma Client:

```bash
npx prisma generate
```

### Environment-Specific Configuration

-   Development: Uses `.env.local` (not committed to git)
-   Production: Set environment variables in your hosting platform

### Browser Support

The application supports modern browsers:

-   Chrome (latest)
-   Firefox (latest)
-   Safari (latest)
-   Edge (latest)

### Performance Considerations

-   Server-side pagination reduces initial load time
-   Database indexes optimize query performance
-   React Query provides efficient caching and data synchronization
-   Next.js automatic code splitting improves bundle size

### Security Best Practices

-   Passwords are hashed using bcrypt
-   JWT tokens are stored in HTTP-only cookies
-   Input validation on both client and server
-   SQL injection protection via Prisma ORM
-   XSS protection through React's built-in escaping

---

**Built with ❤️ using Next.js, React, and TypeScript**
