# WebhookHub - Frontend

React + TypeScript dashboard for managing webhook subscriptions and monitoring event deliveries in real-time.

**Live App:** https://webhook-platform-frontend.vercel.app  
**Backend API:** https://webhook-platform-backend-production.up.railway.app/api

---

## Features

- **Auth** -- Register, login, and auto-logout on token expiry
- **Subscription Management** -- Create, view, cancel, and delete webhook subscriptions
- **Real-time Event Feed** -- Live SSE stream shows delivery status updates as they happen
- **Event History** -- Paginated list of all events with status, retry count, and timestamps
- **Event Detail View** -- Full payload, headers, delivery attempts, and error messages
- **Manual Retry** -- Re-queue permanently failed events with one click
- **Send Test Event** -- Built-in button to fire sample webhooks for instant testing (no curl needed)
- **Event Filtering** -- Configure subscriptions to only accept specific event types

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| State | Zustand (auth) + TanStack Query (server state) |
| HTTP | Axios with JWT interceptors |
| Real-time | EventSource (SSE) |
| Icons | Lucide React |
| Notifications | React Hot Toast |

---

## Design Choices

### Zustand for Auth, TanStack Query for Server State
Auth state (token, user) is global and synchronous -- Zustand is perfect for this. Server data (subscriptions, events) benefits from caching, invalidation, and pagination -- TanStack Query handles all of this out of the box.

### SSE via EventSource API
The browser's native `EventSource` API gives us real-time updates with zero dependencies. It auto-reconnects on network drops and works over standard HTTP. Since `EventSource` can't set headers, JWT is passed as a query parameter.

### Inline Styles
The app uses inline styles with CSS custom properties (defined in `index.css`). This keeps the styling co-located with components, avoids class name collisions, and makes the component files self-contained.

### Send Test Event Button
A built-in "Send Test" button on the dashboard lets reviewers test the full webhook flow without curl, Postman, or any external tool. It picks a random sample event (Stripe payment, GitHub push, Shopify order, etc.) and fires it directly at the subscription's incoming webhook URL.

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Email + password login |
| `/register` | Register | New user registration |
| `/dashboard` | Dashboard | List all subscriptions with stats |
| `/subscriptions/new` | New Subscription | Create a webhook subscription |
| `/subscriptions/:id` | Subscription Detail | Live feed + event history + endpoint info |
| `/subscriptions/:id/events/:eventId` | Event Detail | Full payload, headers, delivery log |

---

## Local Setup

### Prerequisites
- Node.js 18+
- Backend server running (see [backend repo](https://github.com/Dhruv-Gupta01/webhook-platform-backend))

### 1. Clone and install

```bash
git clone https://github.com/Dhruv-Gupta01/webhook-platform-frontend.git
cd webhook-platform-frontend
npm install
```

### 2. Configure environment (optional)

For local development, the Vite dev server proxies `/api` to `localhost:3000` automatically. No env file needed.

For connecting to the deployed backend instead:

```bash
echo "VITE_API_URL=https://webhook-platform-backend-production.up.railway.app" > .env
```

### 3. Start the dev server

```bash
npm run dev
```

Opens at `http://localhost:5173`.

---

## Quick Test (deployed version)

1. Go to https://webhook-platform-frontend.vercel.app
2. Register a new account
3. Create a subscription (use `https://httpbin.org/post` as the callback URL)
4. Click **Send test** on the dashboard to fire a sample webhook
5. Click **View events** to see real-time delivery status

---

## Related

- **Backend repo:** https://github.com/Dhruv-Gupta01/webhook-platform-backend
