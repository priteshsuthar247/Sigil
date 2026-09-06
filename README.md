# Sigil

A production-ready single-user invoicing workspace built with Next.js 16 App
Router. Manage clients, invoices and company profiles, generate client-side PDFs
in INR, with NextAuth JWT sessions and Drizzle PostgreSQL.

## Overview

This application provides a complete invoicing workflow for a single
authenticated user. Data is isolated per user via `userId` foreign keys across
`clients`, `invoices`, `invoice_items` and `company_profiles`. Invoices are
rendered to PDF client-side using Forme / pdfcn and downloaded locally. No PDFs
are stored on the server.

> [!NOTE] Designed for single-user operation. Currency is fixed to INR with
> whole rupee formatting.

## Features

- Authentication with NextAuth Credentials, JWT session
  - `maxAge: 7 days`
  - Idle timeout 8 hours via `token.lastSeen` in `jwt` callback
  - `updateAge: 24 hours`
- Dashboard with summary and navigation
- Clients CRUD with mobile stacked cards and responsive table
- Invoices CRUD with items, status `sent` / `paid`, total calculation
- Company profile per user with 7 required fields
- Account management with current password verification
- Client-side PDF generation with `@formepdf` / `pdfcn` `invoice-minimal` block
- Responsive UI with Base UI + shadcn/ui, Tailwind CSS v4
- Type-safe forms with React Hook Form + Zod
- Server Actions with `ActionResult<T>` generic typing

## Tech Stack

- **Framework**: Next.js 16.3.3 App Router, React 19.2.8, TypeScript 5
- **Auth**: next-auth 5.0.0-beta.32, bcryptjs
- **Database**: Drizzle ORM 1.0.0-rc.4, drizzle-kit, drizzle-zod, PostgreSQL
- **Forms**: react-hook-form 7.87.0, @hookform/resolvers, zod 4.5.4
- **UI**: @base-ui/react 1.7.0, shadcn 4.19.1, class-variance-authority,
  tailwind-merge, tw-animate-css, lucide-react, sonner
- **PDF**: @formepdf/core 0.17.0, @formepdf/react 0.17.0
- **Package Manager**: pnpm 11.25.0

## Getting Started

> [!IMPORTANT] Set `NEXTAUTH_SECRET` to a secure random string for production.

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open http://localhost:3000

Environment variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/invoicing
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

## Credentials

* Email: `pritesh@example.com`
* Password: `Password123`

Password requirements for changes:
* Minimum 8 characters
* At least one uppercase letter
* At least one lowercase letter
* At least one digit

Changing password requires current password verification and will force
immediate logout with mandatory re-authentication.

## Database Setup

```bash
pnpm dlx drizzle-kit push
pnpm db:seed
```

Schema files: `db/schema.ts`, `db/validators.ts`

Tables:
- `users` – id, name, email unique, password hash, created_at
- `company_profiles` – 1:1 with users via user_id unique FK
- `clients` – user_id FK, name, email, phone, address
- `invoices` – user_id FK, client_id FK, number, status, total_amount
- `invoice_items` – invoice_id FK, quantity, description, price

Migrations are in `/migrations`.

## Project Structure

```
/app
  /(auth)
    /login
  /dashboard
    /clients
    /invoices
    /account
    /settings
/components
  /ui
  /pdf
  /client
  /invoice
/server
  /invoices.ts
  /clients.ts
  /users.ts
  /company.ts
/db
  schema.ts
  validators.ts
  drizzle.ts
/lib
  schemas.ts
  utils.ts
  pdf-themes/
```



## Development

```bash
pnpm dev          # start dev server
pnpm build        # production build
pnpm start        # start production server
pnpm lint         # eslint
pnpm db:seed      # seed database
```

Typecheck:
```bash
npx tsc --noEmit --skipLibCheck
```

## Screenshots

![Dashboard overview](./docs/screenshots/dashboard.png)

![Invoices table](./docs/screenshots/invoices.png)

![Invoice PDF preview](./docs/screenshots/invoice-pdf.png)



## Resources

- Next.js Documentation
- NextAuth.js
- Drizzle ORM
- Forme PDF
