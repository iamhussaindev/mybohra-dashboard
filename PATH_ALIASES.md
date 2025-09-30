# Path Aliases Configuration

This document outlines the correct path aliases used in this project based on `tsconfig.json`.

## Available Path Aliases

Based on your `tsconfig.json`, the following path aliases are configured:

```json
{
  "@components/*": ["src/components/*"],
  "@containers/*": ["src/containers/*"],
  "@pageComponents/*": ["src/pageComponents/*"],
  "@lib/*": ["src/lib/*"],
  "@styles/*": ["src/styles/*"],
  "@hooks/*": ["src/hooks/*"],
  "@utils/*": ["src/lib/utils/*"],
  "@types/*": ["src/types/*"],
  "@constants/*": ["src/constants/*"],
  "@contexts/*": ["src/contexts/*"],
  "@services/*": ["src/services/*"],
  "@features/*": ["src/features/*"],
  "@data/*": ["src/data/*"]
}
```

## Correct Usage Examples

### ✅ Correct Imports

```typescript
// Components
import LoginPage from '@components/auth/LoginPage'
import AuthGuard from '@components/auth/AuthGuard'
import AuthNav from '@components/layout/AuthNav'

// Hooks
import { useAuth } from '@hooks/useSupabase'

// Library/API
import { supabase, authService } from '@lib/api'
import { isSupabaseConfigured } from '@lib/config/supabase'

// Utils
import { cn } from '@utils/index'

// Data
import { projects } from '@data/projects'
```

### ❌ Incorrect Imports (Don't Use)

```typescript
// These will NOT work:
import { useAuth } from '@/hooks/useSupabase' // ❌ Wrong
import LoginPage from '@/components/auth/LoginPage' // ❌ Wrong
import { supabase } from '@/lib/api' // ❌ Wrong
```

## Updated Files

The following files have been updated to use the correct path aliases:

### Authentication Components

- `src/components/auth/LoginPage.tsx`
- `src/components/auth/AuthGuard.tsx`
- `src/components/layout/AuthNav.tsx`

### Pages

- `app/login/page.tsx`
- `app/dashboard/page.tsx`

### Hooks

- `src/hooks/useSupabase.tsx`

### Library Files

- `src/lib/api/supabase.ts`
- `src/lib/api/index.ts`

### Documentation

- `SUPABASE_SETUP.md`
- `GOOGLE_OAUTH_SETUP.md`
- `README.md`

## Best Practices

1. **Always use the configured aliases** from `tsconfig.json`
2. **Don't use `@/` prefix** - it's not configured in this project
3. **Use `@components/*`** for component imports
4. **Use `@hooks/*`** for custom hooks
5. **Use `@lib/*`** for library utilities
6. **Use `@utils/*`** for utility functions

## Future Development

When creating new files, always use the correct path aliases:

```typescript
// ✅ Good
import { useAuth } from '@hooks/useSupabase'
import { Button } from '@components/ui/Button'
import { supabase } from '@lib/api'

// ❌ Bad
import { useAuth } from '@/hooks/useSupabase'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/api'
```

This ensures consistency across the entire codebase and prevents import errors.
