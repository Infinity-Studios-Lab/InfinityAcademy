# Infinity Academy - Development Guide

## 👨‍💻 Development Overview

This guide provides comprehensive information for developers working on the Infinity Academy project, including coding standards, development workflow, and best practices.

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (or yarn)
- **Git**: Version 2.0.0 or higher
- **VS Code**: Recommended editor with extensions
- **Supabase CLI**: For local development (optional)

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/your-org/infinity-academy.git
cd infinity-academy

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-eslint"
  ]
}
```

## 🏗️ Project Structure

### Directory Organization
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes (grouped)
│   ├── admin/             # Admin-specific routes
│   ├── parent/            # Parent-specific routes
│   ├── student/           # Student-specific routes
│   ├── tutor/             # Tutor-specific routes
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # Reusable components
│   ├── ui/                # Basic UI components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   └── features/          # Feature-specific components
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase client
│   ├── utils/             # Helper functions
│   └── types/             # TypeScript definitions
├── hooks/                 # Custom React hooks
├── context/               # React context providers
├── styles/                # Additional styling
└── types/                 # Global type definitions
```

### File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Pages**: kebab-case (e.g., `student-profile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `UserTypes.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

## 📝 Coding Standards

### TypeScript Guidelines

#### Type Definitions
```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

// Use types for unions and complex types
type UserRole = 'student' | 'tutor' | 'parent' | 'admin';

// Use enums sparingly, prefer const assertions
const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

type UserStatus = typeof USER_STATUSES[keyof typeof USER_STATUSES];
```

#### Component Props
```typescript
// Use interface for component props
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}

// Use React.FC for functional components
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
}) => {
  // Component implementation
};
```

#### Generic Types
```typescript
// Use generics for reusable components
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

// Use constraints when needed
interface ApiResponse<T extends Record<string, any>> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}
```

### React Best Practices

#### Component Structure
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. Types
interface ComponentProps {
  // Props definition
}

// 3. Component
const Component: React.FC<ComponentProps> = (props) => {
  // 4. Hooks
  const [state, setState] = useState();
  const router = useRouter();

  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 6. Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 8. Export
export default Component;
```

#### State Management
```typescript
// Use local state for component-specific data
const [isOpen, setIsOpen] = useState(false);

// Use context for shared state
const UserContext = createContext<UserContextType | undefined>(undefined);

// Use custom hooks for complex state logic
const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data
  }, []);

  return { user, loading, setUser };
};
```

#### Performance Optimization
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo<ComponentProps>(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return data.reduce((acc, item) => acc + item.value, 0);
}, [data]);

// Use useCallback for stable function references
const handleSubmit = useCallback((formData: FormData) => {
  // Submit logic
}, []);
```

### CSS and Styling

#### Tailwind CSS Guidelines
```typescript
// Use semantic class names
const buttonClasses = clsx(
  'px-4 py-2 rounded-lg font-medium transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
    'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500': variant === 'secondary',
  }
);

// Use responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

// Use dark mode support
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  {/* Content */}
</div>
```

#### CSS Modules (Alternative)
```typescript
// styles/Button.module.css
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.primary {
  background-color: #3b82f6;
  color: white;
}

// Component usage
import styles from './Button.module.css';

const Button = ({ variant = 'primary', children }) => (
  <button className={`${styles.button} ${styles[variant]}`}>
    {children}
  </button>
);
```

## 🔧 Development Workflow

### Git Workflow

#### Branch Naming
```bash
# Feature branches
feature/user-authentication
feature/calendar-integration
feature/homework-management

# Bug fix branches
fix/login-validation
fix/calendar-timezone
fix/mobile-responsive

# Hotfix branches
hotfix/security-vulnerability
hotfix/critical-bug
```

#### Commit Messages
```bash
# Use conventional commits
feat: add user authentication system
fix: resolve calendar timezone issues
docs: update API documentation
style: improve button component styling
refactor: restructure user management logic
test: add unit tests for auth service
chore: update dependencies
```

#### Pull Request Process
1. **Create Feature Branch**: `git checkout -b feature/new-feature`
2. **Make Changes**: Implement your feature
3. **Commit Changes**: Use conventional commit messages
4. **Push Branch**: `git push origin feature/new-feature`
5. **Create PR**: Use the PR template
6. **Code Review**: Address feedback from reviewers
7. **Merge**: Squash and merge when approved

### Development Commands

#### Package Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

#### Development Tools
```bash
# Linting
npm run lint          # Check for linting issues
npm run lint:fix      # Auto-fix linting issues

# Type checking
npm run type-check    # Check TypeScript types

# Testing
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Storybook
npm run storybook     # Start Storybook
npm run build-storybook # Build Storybook
```

## 🧪 Testing Strategy

### Testing Pyramid
```
    /\
   /  \     E2E Tests (Few)
  /____\    Integration Tests (Some)
 /      \   Unit Tests (Many)
/________\
```

### Unit Testing

#### Component Testing
```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant classes', () => {
    render(<Button variant="secondary">Click me</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('bg-gray-200', 'text-gray-900');
  });
});
```

#### Hook Testing
```typescript
// __tests__/hooks/useUser.test.ts
import { renderHook, act } from '@testing-library/react';
import { useUser } from '@/hooks/useUser';

describe('useUser', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useUser());
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('fetches user data on mount', async () => {
    const { result } = renderHook(() => useUser());
    
    await act(async () => {
      // Wait for async operations
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeDefined();
  });
});
```

#### Utility Testing
```typescript
// __tests__/utils/formatDate.test.ts
import { formatDate, formatRelativeTime } from '@/utils/formatDate';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = formatDate(date);
    
    expect(formatted).toBe('Jan 15, 2024');
  });

  it('handles invalid dates', () => {
    const invalidDate = new Date('invalid');
    const formatted = formatDate(invalidDate);
    
    expect(formatted).toBe('Invalid Date');
  });
});
```

### Integration Testing

#### API Testing
```typescript
// __tests__/api/auth.test.ts
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/auth/login/route';

describe('/api/auth/login', () => {
  it('returns 400 for invalid email', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { email: 'invalid-email', password: 'password' },
    });

    await POST(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });

  it('returns 200 for valid credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { email: 'test@example.com', password: 'password' },
    });

    await POST(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toHaveProperty('token');
  });
});
```

### E2E Testing

#### Playwright Setup
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
```

## 📊 Code Quality

### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

### Prettier Configuration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## 🔌 API Development

### API Route Structure
```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const supabase = createClient();
    
    // Update user in database
    const { data: user, error } = await supabase
      .from('users')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 400 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Error Handling
```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.email) {
      throw new ValidationError('Email is required', 'email');
    }
    
    // Process request...
    
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { message: error.message, code: error.code } },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
```

## 🎨 Component Development

### Component Patterns

#### Compound Components
```typescript
// components/DataTable/DataTable.tsx
interface DataTableProps {
  children: React.ReactNode;
  data: any[];
}

const DataTable: React.FC<DataTableProps> & {
  Header: typeof DataTableHeader;
  Row: typeof DataTableRow;
  Cell: typeof DataTableCell;
} = ({ children, data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  );
};

// Sub-components
const DataTableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-gray-50">{children}</thead>
);

const DataTableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr className="hover:bg-gray-50">{children}</tr>
);

const DataTableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
    {children}
  </td>
);

// Assign sub-components
DataTable.Header = DataTableHeader;
DataTable.Row = DataTableRow;
DataTable.Cell = DataTableCell;

export default DataTable;

// Usage
<DataTable data={users}>
  <DataTable.Header>
    <tr>
      <DataTable.Cell>Name</DataTable.Cell>
      <DataTable.Cell>Email</DataTable.Cell>
    </tr>
  </DataTable.Header>
  <tbody>
    {users.map(user => (
      <DataTable.Row key={user.id}>
        <DataTable.Cell>{user.name}</DataTable.Cell>
        <DataTable.Cell>{user.email}</DataTable.Cell>
      </DataTable.Row>
    ))}
  </tbody>
</DataTable>
```

#### Render Props Pattern
```typescript
// components/AsyncData/AsyncData.tsx
interface AsyncDataProps<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  children: (props: { data: T[]; loading: boolean; error: Error | null }) => React.ReactNode;
}

const AsyncData = <T,>({ data, loading, error, children }: AsyncDataProps<T>) => {
  return <>{children({ data: data || [], loading, error })}</>;
};

// Usage
<AsyncData data={users} loading={loading} error={error}>
  {({ data, loading, error }) => {
    if (loading) return <Spinner />;
    if (error) return <ErrorMessage error={error} />;
    return <UserList users={data} />;
  }}
</AsyncData>
```

### Form Handling

#### React Hook Form
```typescript
// components/forms/UserForm.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['student', 'tutor', 'parent', 'admin']),
});

type UserFormData = z.infer<typeof userSchema>;

const UserForm: React.FC<{ onSubmit: (data: UserFormData) => void }> = ({ onSubmit }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              id="firstName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          )}
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save User'}
      </button>
    </form>
  );
};
```

## 🔍 Debugging

### Development Tools

#### React Developer Tools
- Install React Developer Tools browser extension
- Use Components tab to inspect component hierarchy
- Use Profiler tab to analyze performance

#### Next.js Debugging
```bash
# Enable Next.js debugging
DEBUG=* npm run dev

# Enable specific debugging
DEBUG=next:*,next:server* npm run dev
```

#### Console Logging
```typescript
// Use structured logging
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
};

// Usage
logger.info('User logged in', { userId: user.id });
logger.error('Failed to fetch user', error);
```

### Performance Debugging

#### React Profiler
```typescript
import { Profiler } from 'react';

const onRenderCallback = (
  id: string,
  phase: string,
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  console.log(`Component ${id} took ${actualDuration}ms to render`);
};

<Profiler id="UserList" onRender={onRenderCallback}>
  <UserList users={users} />
</Profiler>
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

# Run analysis
ANALYZE=true npm run build
```

## 📚 Documentation

### Code Documentation

#### JSDoc Comments
```typescript
/**
 * Calculates the total score for a student across all subjects
 * @param scores - Object containing subject scores
 * @param weights - Optional weights for each subject
 * @returns The weighted average score
 * @example
 * ```typescript
 * const scores = { math: 85, science: 90, english: 88 };
 * const total = calculateTotalScore(scores);
 * console.log(total); // 87.67
 * ```
 */
function calculateTotalScore(
  scores: Record<string, number>,
  weights?: Record<string, number>
): number {
  // Implementation
}
```

#### Component Documentation
```typescript
/**
 * UserProfile component displays user information in a card format
 * 
 * @component
 * @example
 * ```tsx
 * <UserProfile
 *   user={user}
 *   showActions={true}
 *   onEdit={() => handleEdit(user.id)}
 * />
 * ```
 */
interface UserProfileProps {
  /** User data to display */
  user: User;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Callback when edit button is clicked */
  onEdit?: (userId: string) => void;
}
```

### Storybook Stories
```typescript
// stories/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import Button from '@/components/Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Button',
    variant: 'secondary',
  },
};

export const Large: Story = {
  args: {
    children: 'Button',
    size: 'lg',
  },
};
```

## 🚀 Performance Optimization

### Code Splitting
```typescript
// Lazy load components
const UserProfile = dynamic(() => import('@/components/UserProfile'), {
  loading: () => <UserProfileSkeleton />,
  ssr: false,
});

// Lazy load pages
const AdminDashboard = dynamic(() => import('@/app/admin/page'), {
  loading: () => <PageSkeleton />,
});
```

### Image Optimization
```typescript
import Image from 'next/image';

// Use Next.js Image component for optimization
<Image
  src="/user-avatar.jpg"
  alt="User avatar"
  width={64}
  height={64}
  className="rounded-full"
  priority={true} // For above-the-fold images
/>
```

### Memoization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return data.reduce((acc, item) => acc + item.value, 0);
}, [data]);

// Memoize callback functions
const handleSubmit = useCallback((formData: FormData) => {
  submitForm(formData);
}, [submitForm]);

// Memoize components
const ExpensiveComponent = React.memo<ComponentProps>(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
});
```

## 🔒 Security Best Practices

### Input Validation
```typescript
// Use Zod for runtime validation
import { z } from 'zod';

const userInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['student', 'tutor', 'parent', 'admin']),
});

// Validate input before processing
const validateUserInput = (input: unknown) => {
  try {
    return userInputSchema.parse(input);
  } catch (error) {
    throw new ValidationError('Invalid input data');
  }
};
```

### Authentication
```typescript
// Use middleware for route protection
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

### Data Sanitization
```typescript
// Sanitize user input
import DOMPurify from 'dompurify';

const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html);
};

// Use in components
const UserBio: React.FC<{ bio: string }> = ({ bio }) => {
  const sanitizedBio = sanitizeHtml(bio);
  
  return (
    <div 
      className="prose"
      dangerouslySetInnerHTML={{ __html: sanitizedBio }}
    />
  );
};
```

---

This development guide provides comprehensive information for developers working on the Infinity Academy project. For additional questions or clarifications, please refer to the project documentation or contact the development team.
