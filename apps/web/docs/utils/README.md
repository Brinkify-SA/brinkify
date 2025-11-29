## Cookies Utility functions

The cookie utility functions are for both server and client side to avoid Next.js errors.

### `getClientCookie(key: string)`
  
Must be used in: `Client`

```typescript
    import { getClientCookie, setClientCookie } from '@/utils/client/cookies.ts'

    //works only in client
    const user = getClientCookie("app-user");

```
### `getServerCookie(key: string)`
Must be used in: `Server`
```typescript
    import { getServerCookie, setServerCookie } from '@/utils/server/cookies.ts'

    const user = await getServerCookie("app-user");
    //user will be a javascript object instead of encoded string.
```

### `setServerCookie(key: string, value: Object, maxAge: number)`
Must be used in: `Server`
```typescript
    import { getServerCookie, setServerCookie } from '@/utils/server/cookies.ts'

    const user = {name: "John Doe", age: "27", gender: "M"};
    const maxAge = 60 * 60;

    await setServerCookie("app-user", user, maxAge);
```