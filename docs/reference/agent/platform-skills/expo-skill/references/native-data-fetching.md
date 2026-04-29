# native-data-fetching

Source: https://github.com/expo/skills/tree/main/plugins/expo/skills/native-data-fetching

## Source SKILL.md

---
name: native-data-fetching
description: Use when implementing or debugging ANY network request, API call, or data fetching. Covers fetch API, React Query, SWR, error handling, caching, offline support, and Expo Router data loaders (`useLoaderData`).
version: 1.0.0
license: MIT
---

# Expo Networking

**You MUST use this skill for ANY networking work including API requests, data fetching, caching, or network debugging.**

## References

Consult these resources as needed:

```
references/
  expo-router-loaders.md   Route-level data loading with Expo Router loaders (web, SDK 55+)
```

## When to Use

Use this skill when:

- Implementing API requests
- Setting up data fetching (React Query, SWR)
- Using Expo Router data loaders (`useLoaderData`, web SDK 55+)
- Debugging network failures
- Implementing caching strategies
- Handling offline scenarios
- Authentication/token management
- Configuring API URLs and environment variables

## Preferences

- Avoid axios, prefer expo/fetch

## Common Issues & Solutions

### 1. Basic Fetch Usage

**Simple GET request**:

```tsx
const fetchUser = async (userId: string) => {
  const response = await fetch(`https://api.example.com/users/${userId}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
```

**POST request with body**:

```tsx
const createUser = async (userData: UserData) => {
  const response = await fetch("https://api.example.com/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};
```

---

### 2. React Query (TanStack Query)

**Setup**:

```tsx
// app/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
```

**Fetching data**:

```tsx
import { useQuery } from "@tanstack/react-query";

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <Profile user={data} />;
}
```

**Mutations**:

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreateUserForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleSubmit = (data: UserData) => {
    mutation.mutate(data);
  };

  return <Form onSubmit={handleSubmit} isLoading={mutation.isPending} />;
}
```

---

### 3. Error Handling

**Comprehensive error handling**:

```tsx
class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.message || "Request failed",
        response.status,
        error.code
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network error (no internet, timeout, etc.)
    throw new ApiError("Network error", 0, "NETWORK_ERROR");
  }
};
```

**Retry logic**:

```tsx
const fetchWithRetry = async (
  url: string,
  options?: RequestInit,
  retries = 3
) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchWithErrorHandling(url, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      // Exponential backoff
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
};
```

---

### 4. Authentication

**Token management**:

```tsx
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

export const auth = {
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  setToken: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  removeToken: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

// Authenticated fetch wrapper
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = await auth.getToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};
```

**Token refresh**:

```tsx
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

const getValidToken = async (): Promise<string> => {
  const token = await auth.getToken();

  if (!token || isTokenExpired(token)) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }
    return refreshPromise!;
  }

  return token;
};
```

---

### 5. Offline Support

**Check network status**:

```tsx
import NetInfo from "@react-native-community/netinfo";

// Hook for network status
function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });
  }, []);

  return isOnline;
}
```

**Offline-first with React Query**:

```tsx
import { onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// Sync React Query with network status
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(state.isConnected ?? true);
  });
});

// Queries will pause when offline and resume when online
```

---

### 6. Environment Variables

**Using environment variables for API configuration**:

Expo supports environment variables with the `EXPO_PUBLIC_` prefix. These are inlined at build time and available in your JavaScript code.

```tsx
// .env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_API_VERSION=v1

// Usage in code
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const fetchUsers = async () => {
  const response = await fetch(`${API_URL}/users`);
  return response.json();
};
```

**Environment-specific configuration**:

```tsx
// .env.development
EXPO_PUBLIC_API_URL=http://localhost:3000

// .env.production
EXPO_PUBLIC_API_URL=https://api.production.com
```

**Creating an API client with environment config**:

```tsx
// api/client.ts
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not defined");
}

export const apiClient = {
  get: async <T,>(path: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  post: async <T,>(path: string, body: unknown): Promise<T> => {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};
```

**Important notes**:

- Only variables prefixed with `EXPO_PUBLIC_` are exposed to the client bundle
- Never put secrets (API keys with write access, database passwords) in `EXPO_PUBLIC_` variables—they're visible in the built app
- Environment variables are inlined at **build time**, not runtime
- Restart the dev server after changing `.env` files
- For server-side secrets in API routes, use variables without the `EXPO_PUBLIC_` prefix

**TypeScript support**:

```tsx
// types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_API_VERSION?: string;
    }
  }
}

export {};
```

---

### 7. Request Cancellation

**Cancel on unmount**:

```tsx
useEffect(() => {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal })
    .then((response) => response.json())
    .then(setData)
    .catch((error) => {
      if (error.name !== "AbortError") {
        setError(error);
      }
    });

  return () => controller.abort();
}, [url]);
```

**With React Query** (automatic):

```tsx
// React Query automatically cancels requests when queries are invalidated
// or components unmount
```

---

## Decision Tree

```
User asks about networking
  |-- Route-level data loading (web, SDK 55+)?
  |   \-- Expo Router loaders — see references/expo-router-loaders.md
  |
  |-- Basic fetch?
  |   \-- Use fetch API with error handling
  |
  |-- Need caching/state management?
  |   |-- Complex app -> React Query (TanStack Query)
  |   \-- Simpler needs -> SWR or custom hooks
  |
  |-- Authentication?
  |   |-- Token storage -> expo-secure-store
  |   \-- Token refresh -> Implement refresh flow
  |
  |-- Error handling?
  |   |-- Network errors -> Check connectivity first
  |   |-- HTTP errors -> Parse response, throw typed errors
  |   \-- Retries -> Exponential backoff
  |
  |-- Offline support?
  |   |-- Check status -> NetInfo
  |   \-- Queue requests -> React Query persistence
  |
  |-- Environment/API config?
  |   |-- Client-side URLs -> EXPO_PUBLIC_ prefix in .env
  |   |-- Server secrets -> Non-prefixed env vars (API routes only)
  |   \-- Multiple environments -> .env.development, .env.production
  |
  \-- Performance?
      |-- Caching -> React Query with staleTime
      |-- Deduplication -> React Query handles this
      \-- Cancellation -> AbortController or React Query
```

## Common Mistakes

**Wrong: No error handling**

```tsx
const data = await fetch(url).then((r) => r.json());
```

**Right: Check response status**

```tsx
const response = await fetch(url);
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data = await response.json();
```

**Wrong: Storing tokens in AsyncStorage**

```tsx
await AsyncStorage.setItem("token", token); // Not secure!
```

**Right: Use SecureStore for sensitive data**

```tsx
await SecureStore.setItemAsync("token", token);
```

## Example Invocations

User: "How do I make API calls in React Native?"
-> Use fetch, wrap with error handling

User: "Should I use React Query or SWR?"
-> React Query for complex apps, SWR for simpler needs

User: "My app needs to work offline"
-> Use NetInfo for status, React Query persistence for caching

User: "How do I handle authentication tokens?"
-> Store in expo-secure-store, implement refresh flow

User: "API calls are slow"
-> Check caching strategy, use React Query staleTime

User: "How do I configure different API URLs for dev and prod?"
-> Use EXPO*PUBLIC* env vars with .env.development and .env.production files

User: "Where should I put my API key?"
-> Client-safe keys: EXPO*PUBLIC* in .env. Secret keys: non-prefixed env vars in API routes only

User: "How do I load data for a page in Expo Router?"
-> See references/expo-router-loaders.md for route-level loaders (web, SDK 55+). For native, use React Query or fetch.

## Source Reference: references / expo-router-loaders.md

# Expo Router Data Loaders

Route-level data loading for web apps using Expo SDK 55+. Loaders are async functions exported from route files that load data before the route renders, following the Remix/React Router loader model.

**Dual execution model:**

- **Initial page load (SSR):** The loader runs server-side. Its return value is serialized as JSON and embedded in the HTML response.
- **Client-side navigation:** The browser fetches the loader data from the server via HTTP. The route renders once the data arrives.

You write one function and the framework manages when and how it executes.

## Configuration

**Requirements:** Expo SDK 55+, web output mode (`npx expo serve` or `npx expo export --platform web`) set in `app.json` or `app.config.js`.

**Server rendering:**

```json
{
  "expo": {
    "web": {
      "output": "server"
    },
    "plugins": [
      ["expo-router", {
        "unstable_useServerDataLoaders": true,
        "unstable_useServerRendering": true
      }]
    ]
  }
}
```

**Static/SSG:**

```json
{
  "expo": {
    "web": {
      "output": "static"
    },
    "plugins": [
      ["expo-router", {
        "unstable_useServerDataLoaders": true
      }]
    ]
  }
}
```

| | `"server"` | `"static"` |
|---|-----------|------------|
| `unstable_useServerDataLoaders` | Required | Required |
| `unstable_useServerRendering` | Required | Not required |
| Loader runs on | Live server (every request) | Build time (static generation) |
| `request` object | Full access (headers, cookies) | Not available |
| Hosting | Node.js server (EAS Hosting) | Any static host (Netlify, Vercel, S3) |

## Imports

Loaders use two packages:

- **`expo-router`** — `useLoaderData` hook
- **`expo-server`** — `LoaderFunction` type, `StatusError`, `setResponseHeaders`. Always available (dependency of `expo-router`), no install needed.

## Basic Loader

For loaders without params, a plain async function works:

```tsx
// app/posts/index.tsx
import { Suspense } from "react";
import { useLoaderData } from "expo-router";
import { ActivityIndicator, View, Text } from "react-native";

export async function loader() {
  const response = await fetch("https://api.example.com/posts");
  const posts = await response.json();
  return { posts };
}

function PostList() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <View>
      {posts.map((post) => (
        <Text key={post.id}>{post.title}</Text>
      ))}
    </View>
  );
}

export default function Posts() {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <PostList />
    </Suspense>
  );
}
```

`useLoaderData` is typed via `typeof loader` — the generic parameter infers the return type.

## Dynamic Routes

For loaders with params, use the `LoaderFunction<T>` type from `expo-server`. The first argument is the request (an immutable `Request`-like object, or `undefined` in static mode). The second is `params` (`Record<string, string | string[]>`), which contains **path parameters only**. Access individual params with a cast like `params.id as string`. For query parameters, use `new URL(request.url).searchParams`:

```tsx
// app/posts/[id].tsx
import { Suspense } from "react";
import { useLoaderData } from "expo-router";
import { StatusError, type LoaderFunction } from "expo-server";
import { ActivityIndicator, View, Text } from "react-native";

type Post = {
  id: number;
  title: string;
  body: string;
};

export const loader: LoaderFunction<{ post: Post }> = async (
  request,
  params,
) => {
  const id = params.id as string;
  const response = await fetch(`https://api.example.com/posts/${id}`);

  if (!response.ok) {
    throw new StatusError(404, `Post ${id} not found`);
  }

  const post: Post = await response.json();
  return { post };
};

function PostContent() {
  const { post } = useLoaderData<typeof loader>();

  return (
    <View>
      <Text>{post.title}</Text>
      <Text>{post.body}</Text>
    </View>
  );
}

export default function PostDetail() {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <PostContent />
    </Suspense>
  );
}
```

Catch-all routes access `params.slug` the same way:

```tsx
// app/docs/[...slug].tsx
import { type LoaderFunction } from "expo-server";

type Doc = { title: string; content: string };

export const loader: LoaderFunction<{ doc: Doc }> = async (request, params) => {
  const slug = params.slug as string[];
  const path = slug.join("/");
  const doc = await fetchDoc(path);
  return { doc };
};
```

Query parameters are available via the `request` object (server output mode only):

```tsx
// app/search.tsx
import { type LoaderFunction } from "expo-server";

export const loader: LoaderFunction<{ results: any[]; query: string }> = async (request) => {
  // Assuming request.url is `/search?q=expo&page=2`
  const url = new URL(request!.url);
  const query = url.searchParams.get("q") ?? "";
  const page = Number(url.searchParams.get("page") ?? "1");

  const results = await fetchSearchResults(query, page);
  return { results, query };
};
```

## Server-Side Secrets & Request Access

Loaders run on the server, so you can access secrets and server-only resources directly:

```tsx
// app/dashboard.tsx
import { type LoaderFunction } from "expo-server";

export const loader: LoaderFunction<{ balance: any; isAuthenticated: boolean }> = async (
  request,
  params,
) => {
  const data = await fetch("https://api.stripe.com/v1/balance", {
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    },
  });

  const sessionToken = request?.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

  const balance = await data.json();
  return { balance, isAuthenticated: !!sessionToken };
};
```

The `request` object is available in server output mode. In static output mode, `request` is always `undefined`.

## Response Utilities

### Setting Response Headers

```tsx
// app/products.tsx
import { setResponseHeaders } from "expo-server";

export async function loader() {
  setResponseHeaders({
    "Cache-Control": "public, max-age=300",
  });

  const products = await fetchProducts();
  return { products };
}
```

### Throwing HTTP Errors

```tsx
// app/products/[id].tsx
import { StatusError, type LoaderFunction } from "expo-server";

export const loader: LoaderFunction<{ product: Product }> = async (request, params) => {
  const id = params.id as string;
  const product = await fetchProduct(id);

  if (!product) {
    throw new StatusError(404, "Product not found");
  }

  return { product };
};
```

## Suspense & Error Boundaries

### Loading States with Suspense

`useLoaderData()` suspends during client-side navigation. Push it into a child component and wrap with `<Suspense>`:

```tsx
// app/posts/index.tsx
import { Suspense } from "react";
import { useLoaderData } from "expo-router";
import { ActivityIndicator, View, Text } from "react-native";

export async function loader() {
  const response = await fetch("https://api.example.com/posts");
  return { posts: await response.json() };
}

function PostList() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <View>
      {posts.map((post) => (
        <Text key={post.id}>{post.title}</Text>
      ))}
    </View>
  );
}

export default function Posts() {
  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      }
    >
      <PostList />
    </Suspense>
  );
}
```

The `<Suspense>` boundary must be above the component calling `useLoaderData()`. On initial page load the data is already in the HTML, suspension only occurs during client-side navigation.

### Error Boundaries

```tsx
// app/posts/[id].tsx
export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Error: {error.message}</Text>
    </View>
  );
}
```

When a loader throws (including `StatusError`), the nearest `ErrorBoundary` catches it.

## Static vs Server Rendering

| | Server (`"server"`) | Static (`"static"`) |
|---|---|---|
| **When loader runs** | Every request (live) | At build time (`npx expo export`) |
| **Data freshness** | Fresh on initial server request | Stale until next build |
| **`request` object** | Full access | Not available |
| **Hosting** | Node.js server (EAS Hosting) | Any static host |
| **Use case** | Personalized/dynamic content | Marketing pages, blogs, docs |

**Choose server** when data changes frequently or content is personalized (cookies, auth, headers).

**Choose static** when content is the same for all users and changes infrequently.

## Best Practices

- Loaders are web-only; use client-side fetching (React Query, fetch) for native
- Loaders cannot be used in `_layout` files — only in route files
- Use `LoaderFunction<T>` from `expo-server` to type loaders that use params
- The request object is immutable — use optional chaining (`request?.headers`) as it may be `undefined` in static mode
- Return only JSON-serializable values (no `Date`, `Map`, `Set`, class instances, functions)
- Use non-prefixed `process.env` vars for secrets in loaders, not `EXPO_PUBLIC_` (which is embedded in the client bundle)
- Use `StatusError` from `expo-server` for HTTP error responses
- Use `setResponseHeaders` from `expo-server` to set headers
- Export `ErrorBoundary` from route files to handle loader failures gracefully
- Validate and sanitize user input (params, query strings) before using in database queries or API calls
- Handle errors gracefully with try/catch; log server-side for debugging
- Loader data is currently cached for the session. This is a known limitation that will be lifted in a future release

