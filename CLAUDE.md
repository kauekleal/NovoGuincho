# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NovoGuincho** is an Ionic/Angular mobile application for managing tow truck services and financial transactions. The app provides user authentication, expense tracking, reporting dashboards, and transaction history management.

## Tech Stack

- **Framework**: Angular 20 + Ionic 8
- **Language**: TypeScript 5.9
- **HTTP Client**: HttpClient with RxJS observables
- **Mobile**: Capacitor 8.3 (Android/iOS support)
- **Styling**: SCSS with Ionic themes
- **Charts**: Chart.js + ng2-charts
- **Testing**: Jasmine + Karma

## Commands

```bash
# Development
npm start                    # Run dev server (http://localhost:4200)
npm run watch              # Build with watch mode
npm run lint               # Run ESLint

# Testing
npm test                   # Run unit tests with Karma
ng test --watch=false      # Single test run

# Build
npm run build              # Production build
npm run build:apk          # Build Android APK (requires Gradle)

# CLI shortcuts
npm run ng -- [command]    # Use Angular CLI directly
```

## Architecture

### Folder Structure

```
src/app/
├── pages/              # Feature pages
│   ├── login/          # User authentication
│   ├── cadastro/       # User account registration
│   ├── historico/      # Transaction and service history
│   └── relatorios/     # Dashboard with financial reports and service/expense registration
├── services/           # Core services (Auth, API, Financeiro, Service)
├── folder/             # Navigation folder module (default Ionic template)
└── app.component.*     # Root component with navigation menu

src/
├── environments/       # Environment configs (dev/prod API URLs)
├── theme/             # Global SCSS theme variables
└── global.scss        # Global styles
```

### Core Layers

**1. Authentication Service** (`services/auth.service.ts`)
- Handles login/register with JWT tokens
- Stores token in `localStorage` under key `apiGuinchoToken`
- Emits token changes via `BehaviorSubject` for reactive updates
- Provides auth headers for API requests

**2. API Service** (`services/api.service.ts`)
- HTTP wrapper for `/expenses` endpoints (expenses/costs CRUD)
- Automatically includes auth headers from `AuthService`
- Interfaces: `ExpenseResponse`, `CreateExpensePayload`

**3. Service Service** (`services/service.service.ts`)
- HTTP wrapper for `/service` endpoints (services/income CRUD)
- Automatically includes auth headers from `AuthService`
- Interfaces: `ServiceResponse`, `CreateServicePayload`, `UpdateServicePayload`

**4. Financeiro Service** (`services/financeiro.service.ts`)
- Business logic layer for expenses and services management
- Maintains `despesas$` and `guinchadas$` BehaviorSubjects for reactive UI updates
- Separates backend calls: `loadExpenses()` → ApiService, `loadServices()` → ServiceService
- Provides `getResumo()` for financial summary (total expenses, income, net profit)

**5. Pages**
- **Login**: Username + password authentication, password recovery via email
- **Cadastro**: User account registration with email validation and password confirmation
- **Relatorios**: Dashboard with Chart.js visualizations + modals to register new services and expenses (monthly revenue, expense breakdown)
- **Historico**: View transaction and service history with delete capability

### Data Flow

User Input → Page Component → Service (validation) → API Call → AuthService headers → Response handling → Toast/Alert feedback

## Key Integration Points

- **Environment Config**: `src/environments/environment.ts` contains `apiUrl` (currently `https://apiguincho-production.up.railway.app`)
- **Navigation**: Main app menu is in `app.component.ts` - update if adding new pages
- **HTTP Interceptors**: None currently configured; auth headers are manually added via `AuthService.getAuthHeaders()`
- **Storage**: Only localStorage is used for token persistence (no session management)

## Notes for Development

- Pages are standalone modules (not using Angular standalone components despite `standalone: false` in decorators)
- All pages use Ionic components (AlertController, ToastController) for UI feedback
- Email validation is implemented in both Login and Cadastro pages - consider extracting to shared utility
- Router guards for authentication are not currently implemented; consider adding to protected routes
- Capacitor config is minimal; actual Android/iOS setup requires Gradle/Xcode configuration

## API Contract

**Authentication Endpoints**:
- `POST /auth/register` - User registration (returns JWT token)
- `POST /auth/login` - User login (returns JWT token)

**Expense Endpoints** (costs/expenses):
- `GET /expenses` - Fetch all user expenses
- `POST /expenses` - Create new expense (requires `category`, `value`, `description`)
- `DELETE /expenses/{id}` - Delete expense by ID

**Service Endpoints** (services/income):
- `GET /service` - Fetch all user services
- `GET /service/{id}` - Fetch specific service
- `POST /service` - Create new service (requires `value` (number), `description` (max 11 chars))
- `PATCH /service/{id}` - Update service (optional `value`, `description`)
- `DELETE /service/{id}` - Delete service by ID

**Auth**: All requests require `Authorization: Bearer <token>` header
