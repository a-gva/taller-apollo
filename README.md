# taller-apollo

**feat: GraphQL API with automated test suite**

Implements a minimal **GraphQL API** in TypeScript/Node.js a fully automated test suite.

- Added `User` schema with `getUser(id)` and `listUsers(limit)` queries
- Implemented resolvers with proper null handling and limit support
- Introduced Jest-based test suite covering

Delivers a lightweight, testable GraphQL service demonstrating schema design, resolver logic, and testing best practices.

## Test Result

<img width="1294" height="434" alt="image" src="https://github.com/user-attachments/assets/be9b3a69-314c-4f26-a6e2-ad2b2f2c5845" />

## Database Mock Data (SQlite)

<img width="1036" height="369" alt="image" src="https://github.com/user-attachments/assets/2e812526-0bd8-4879-928f-7768500f109f" />

## How to run

```bash
pnpm install
pnpm run db:generate
pnpm run db:migrate
pnpm run db:seed
pnpm run dev
```

## How to test

```bash
pnpm run test
```
