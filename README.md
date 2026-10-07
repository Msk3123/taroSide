# TaroSide AI

**An AI-powered tarot reading platform.** Users chat with an AI tarot reader that draws real cards from a seeded 78-card deck, interprets them in context, and remembers the conversation — with daily usage limits enforced per subscription tier.

> 🚧 Actively in development. Built solo as a full-stack portfolio project.

---

## What this project demonstrates

| Area | What I did |
|---|---|
| **Clean Architecture** | Backend split into `Domain` → `Application` → `Infrastructure` → `API`, with dependencies pointing inward. Services depend on interfaces (`ICardRepository`, `IChatAiService`, …), not on EF Core. |
| **LLM integration with tool calling** | The AI doesn't invent cards — it calls a backend function to draw them from the database. Built on the provider-agnostic `Microsoft.Extensions.AI` abstraction (`IChatClient`) with automatic function invocation; currently backed by OpenAI. |
| **Auth & security** | JWT authentication with ASP.NET Core Identity, role-based authorization (`Guest`, `Free`, `Premium`, `Vip`, `Admin`), and ownership checks on every user/conversation endpoint to prevent IDOR. |
| **Business rules** | Per-role policy (`RolePolicy`) defines daily message limits, max cards per spread, and history depth. Exceeding a limit returns HTTP `429`. |
| **Error handling** | Custom exception hierarchy (validation / not found / forbidden / limit exceeded) mapped to RFC 7807 `ProblemDetails` by a central `IExceptionHandler`. |
| **Data layer** | PostgreSQL via EF Core 9, Fluent API configurations, versioned migrations including seed data for cards and spreads. |
| **Frontend** | React 19 + TypeScript SPA with React Router, a typed API client, and pages for chat, readings, card library, journal, profile and admin panel. |
| **Testing** | xUnit test project for the Application layer (growing). |

---

## Tech stack

**Backend:** C# · .NET 9 · ASP.NET Core Web API · Entity Framework Core 9 · PostgreSQL · ASP.NET Core Identity · JWT · FluentValidation · Microsoft.Extensions.AI · OpenAI API · Swagger · xUnit

**Frontend:** React 19 · TypeScript · Vite · React Router 7 · ESLint

---

## Architecture

```
backend/
├── TaroSideAI.Domain           # Entities, enums, role policies — no business dependencies
├── TaroSideAI.Application      # Services, DTOs, interfaces, validation, AI chat logic
├── TaroSideAI.Infrastructure   # EF Core DbContext, repositories, migrations, SMTP email
├── TaroSideAI.API              # Controllers, JWT setup, exception handler, Swagger
└── TaroSideAI.Application.Tests

frontend/
└── src/
    ├── pages/        # Chat, Reading, Library, Journal, Profile, Admin, …
    ├── components/
    └── lib/api.ts    # Typed HTTP client
```

**Request flow — sending a chat message:**

```
React (Chat page)
  → POST /api/conversations/{id}/messages   (JWT)
  → ConversationsController   — checks the conversation belongs to the caller
  → ConversationService       — checks the role's daily limit (429 if exceeded)
  → ChatAiService → LLM       — model calls the "draw cards" tool
  → CardService / Repository  — draws cards from PostgreSQL
  → reply + drawn cards saved and returned to the client
```

---

## API overview

| Controller | Purpose |
|---|---|
| `AuthController` | Register, login, change password |
| `UserController` | Current profile (`/me`), daily usage |
| `ConversationsController` | Create / list / delete chats, send messages to the AI |
| `CardsController` | Card library, daily card |
| `SpreadsController` | Available tarot spreads |
| `AdminController` | User management, role changes, stats (`Admin` only) |

Full interactive docs are available via Swagger at `/swagger` when running locally.

---

## Running locally

**Requirements:** .NET 9 SDK, Node.js 20+, PostgreSQL, an OpenAI API key.

```bash
# 1. Backend
cd backend
# create TaroSideAI.API/appsettings.Development.json with:
#   ConnectionStrings:DefaultConnection, Jwt settings, OpenAI:OpenAiApiKey
dotnet ef database update --project TaroSideAI.Infrastructure --startup-project TaroSideAI.API
dotnet run --project TaroSideAI.API

# 2. Frontend
cd frontend
npm install
npm run dev
```

Secrets are never committed — `appsettings.Development.json` is git-ignored.

---

## Roadmap

- [ ] Persist structured readings (spread history) and the reading journal
- [ ] Enforce spread access by subscription tier
- [ ] Broader unit and integration test coverage
- [ ] CI pipeline (build + tests on every push)
- [ ] Deployment and a public demo

---

## About me

I'm **Maksym Palii**, a junior .NET developer. I built this project end to end — from database schema and API design to the React UI — to practise production-style backend engineering: layered architecture, auth, security fixes, and integrating LLMs safely into a real product.

- GitHub: [@Msk3123](https://github.com/Msk3123)
- LinkedIn: _[LinkedIn](https://www.linkedin.com/in/maksym-paliy-82336b2b4/)_
