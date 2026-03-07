# RANOTE EXIM — Production-Readiness Task List

> **Generated**: March 5, 2026 | **Last Audited**: March 5, 2026 (page-by-page line-level audit)  
> **Total Tasks**: 245 across 12 phases  
> **Goal**: Production-grade, industry-standard, fully working, fully immersive, everything connected

---

## PHASE 1: CRITICAL FOUNDATIONS (Must-Have Before Go-Live)

### 1.1 Security Hardening

| #   | Task                                                                                                                                      | Current State                                           | Status |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------ |
| 1   | **Remove `.env.local` from git** — rotate all Supabase keys, DB passwords; add to `.gitignore` properly                                   | Credentials committed to repo                           | ☐      |
| 2   | **Add rate limiting** on auth endpoints (`/api/auth/login`, `/api/auth/register`) and all API routes                                      | None                                                    | ☐      |
| 3   | **Add security headers** via `next.config.mjs` — CSP, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy | None                                                    | ☐      |
| 4   | **Add CSRF protection** on all form submissions and state-changing API calls                                                              | None                                                    | ☐      |
| 5   | **Implement account lockout** after 5 failed login attempts                                                                               | None                                                    | ☐      |
| 6   | **Add input sanitization** on all user-generated content (XSS prevention beyond what React does)                                          | Partial (Zod validates types but doesn't sanitize HTML) | ☐      |
| 7   | **Configure CORS policy** explicitly in API routes                                                                                        | Using defaults                                          | ☐      |
| 8   | **Add file upload validation** — type whitelist, max size, virus scanning hooks                                                           | File uploads not implemented yet                        | ☐      |

**What happens after these tasks are done:**

- **Task 1:** The `.env.local` file will be removed from the Git history entirely. All existing Supabase keys, DB passwords, and API secrets will be rotated (old ones invalidated). A proper `.gitignore` entry ensures credentials are never accidentally committed again. The app will read secrets from environment variables set in your hosting platform (Netlify/Vercel).
- **Task 2:** When a user or bot tries to spam the login or register endpoints (e.g., 100 requests per minute), they will be automatically blocked with a `429 Too Many Requests` response. This is implemented via a rate-limiting middleware (using Upstash Redis or an in-memory store) that sits in front of all API routes.
- **Task 3:** Every HTTP response from your server will include protective headers. The browser will refuse to load your site inside an iframe (preventing clickjacking), refuse to guess content types (preventing MIME sniffing), and enforce HTTPS-only connections. This is configured once in `next.config.mjs`.
- **Task 4:** Every form submission (login, register, checkout, settings update) will include a hidden CSRF token. The server validates this token before processing the request — so even if an attacker tricks a user into clicking a malicious link, the request will be rejected because the token won't match.
- **Task 5:** After 5 incorrect password attempts on any account, that account is temporarily locked for 15–30 minutes. The user sees a message like "Too many failed attempts. Try again in 15 minutes." This prevents automated password guessing attacks.
- **Task 6:** When a user types `<script>alert('hack')</script>` into any text field (product descriptions, messages, profile bio), the server will strip out all HTML tags and scripts before saving to the database. This uses DOMPurify or sanitize-html as an extra layer beyond React's built-in escaping.
- **Task 7:** The API will only accept requests from your own domain (e.g., `ranoteexim.com`). Requests from unknown origins will be rejected. This prevents other websites from making unauthorized API calls using your users' cookies.
- **Task 8:** When users upload files (product images, documents, avatars), the system will check: (a) Is the file type allowed? (only .jpg, .png, .pdf, etc.), (b) Is it under the max size? (e.g., 5MB for images), (c) Does the file content match its extension? (prevents disguising .exe as .jpg). Invalid uploads are rejected with a clear error message.

### 1.2 Error Handling & Resilience

| #   | Task                                                                                                                                          | Current State                                  | Status |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------ |
| 9   | **Create global `error.tsx`** (app-level error boundary)                                                                                      | Missing — unhandled errors crash the page      | ☐      |
| 10  | **Create `not-found.tsx`** pages (app-level + per route group)                                                                                | Missing — 404s show default Next.js page       | ☐      |
| 11  | **Add error boundaries** to each dashboard layout (exporter, importer, admin)                                                                 | None                                           | ☐      |
| 12  | **Add API error logging** — structured error logging to a service (Sentry, LogRocket, or at minimum server-side `console.error` with context) | No logging                                     | ☐      |
| 13  | **Add retry logic** for failed API calls on the client side                                                                                   | None                                           | ☐      |
| 14  | **Add database connection error handling** in `client/lib/prisma.ts`                                                                          | Basic singleton, no connection pool monitoring | ☐      |

**What happens after these tasks are done:**

- **Task 9:** If any page crashes due to a JavaScript error, instead of showing a blank white screen, users will see a friendly error page with a "Go back to home" button and an option to report the issue. The `app/error.tsx` component catches all unhandled errors at the top level.
- **Task 10:** When users visit a URL that doesn't exist (e.g., `/random-page`), they'll see a custom branded 404 page with helpful links (Home, Products, Contact) instead of the ugly default Next.js 404. Each route group (dashboard, marketplace) can have its own custom 404.
- **Task 11:** If the Exporter Analytics chart crashes, only that section breaks — the sidebar, header, and other dashboard elements remain functional. The user sees a "Something went wrong" message with a "Try Again" button in just that section. Each dashboard (exporter, importer, admin) gets its own `error.tsx`.
- **Task 12:** Every time an API route throws an error (e.g., database timeout, validation failure), the error details (message, stack trace, user ID, route, timestamp) are automatically sent to Sentry. Developers get notified in Slack/email. No more silent failures — every backend crash is tracked and searchable.
- **Task 13:** If a user's internet briefly drops while loading their orders, the app will automatically retry the request 2–3 times with a small delay between attempts. If all retries fail, it shows a "Connection lost — tap to retry" message instead of just showing nothing.
- **Task 14:** If the database connection pool is exhausted (too many simultaneous connections), the app will queue new requests and wait briefly instead of crashing instantly. The Prisma client is properly configured as a singleton to avoid creating duplicate connections in serverless environments (Netlify/Vercel).

### 1.3 Authentication Completeness

| #   | Task                                                                | Current State                          | Status |
| --- | ------------------------------------------------------------------- | -------------------------------------- | ------ |
| 15  | **Add "Forgot Password" flow** — email link → reset page            | Missing entirely                       | ☐      |
| 16  | **Add email verification** after registration                       | Missing — users are active immediately | ☐      |
| 17  | **Add refresh token rotation** — handle expired JWTs gracefully     | No refresh logic                       | ☐      |
| 18  | **Add 2FA support** (TOTP authenticator app)                        | None                                   | ☐      |
| 19  | **Add login/session audit trail** — log login times, IPs, devices   | None                                   | ☐      |
| 20  | **Add "Remember Me" functionality** with secure persistent sessions | None                                   | ☐      |

**What happens after these tasks are done:**

- **Task 15:** On the login page, there will be a "Forgot Password?" link. Clicking it takes the user to `/forgot-password` where they enter their email. Supabase sends them a password reset link. Clicking the link opens a `/reset-password` page with a new password form. After submitting, they can log in with the new password.
- **Task 16:** After registering, instead of being logged in immediately, the user sees "Check your email to verify your account." They receive a verification email with a confirmation link. Until they click it, they cannot log in. This prevents fake/bot accounts from cluttering the system.
- **Task 17:** Users will no longer be randomly logged out after their JWT token expires (usually 1 hour). The middleware will silently refresh their session token in the background using a refresh token. The user stays logged in seamlessly without knowing any technical exchange happened.
- **Task 18:** In Settings, users can enable Two-Factor Authentication. They scan a QR code with Google Authenticator or Authy. From then on, after entering their password, they must also enter a 6-digit code from their authenticator app. This makes accounts nearly impossible to hack even if the password is stolen.
- **Task 19:** A new `LoginHistory` table in the database stores every login event: timestamp, IP address, browser/device info, and whether it succeeded or failed. Users can view their "Recent Login Activity" in their Settings page to spot unauthorized access.
- **Task 20:** The login form will have a "Remember Me" checkbox. If checked, the session cookie lasts 30 days — the user won't need to log in again for a month. If unchecked, the session expires when they close the browser. The cookie is set with `httpOnly` and `secure` flags for safety.

---

## PHASE 2: CORE FEATURE COMPLETION (All Dashboard Functionality)

### 2.1 Exporter Dashboard — 9 Sub-Pages

| #   | Task                                                                                                                  | Current State | Status |
| --- | --------------------------------------------------------------------------------------------------------------------- | ------------- | ------ |
| 21  | **Build Exporter Analytics page** — revenue trends chart, order volume chart, top products, geographic breakdown      | Complete      | [x]    |
| 22  | **Build Exporter Orders page** — orders table with status filters, order detail modal, accept/reject/ship actions     | Stub          | ☐      |
| 23  | **Build Exporter Inventory page** — product CRUD table, add/edit product modal with image upload, stock management    | Stub          | ☐      |
| 24  | **Build Exporter Shipments page** — shipment tracking table, create shipment form, status updates, timeline view      | Stub          | ☐      |
| 25  | **Build Exporter Finance page** — revenue summary, payment history, invoice generation, pending payments              | Stub          | ☐      |
| 26  | **Build Exporter Categories page** — product category breakdown, performance per category                             | Complete      | [x]    |
| 27  | **Build Exporter Directory page** — importer/partner list, contact info, trade history per partner                    | Complete      | [x]    |
| 28  | **Build Exporter Notifications page** — notification list with read/unread, mark all read, filters by type            | Complete      | [x]    |
| 29  | **Build Exporter Settings page** — profile edit, company info edit, avatar upload, password change, email preferences | Stub          | ☐      |

**What happens after these tasks are done:**

- **Task 21 (Analytics):** The exporter sees a full dashboard with interactive Recharts line/bar graphs showing monthly revenue trends, order volume over time, their top 5 selling products, and a geographic breakdown of where their buyers are located. All data is pulled live from the database.
- **Task 22 (Orders):** The exporter sees a table of all orders placed by importers. Each row shows order number, product, quantity, amount, and status. They can click status filter pills (Pending / Processing / Shipped / Delivered) to filter the table. Each row has "Accept", "Reject", and "Mark Shipped" action buttons. Clicking "View" opens a detailed order modal.
- **Task 23 (Inventory):** The exporter sees all their products in a table with columns for name, price, stock quantity, category, and status. They can click "Add New Product" to open a form with image upload. Each row has Edit and Delete buttons. Search and filter controls let them find products quickly.
- **Task 24 (Shipments):** The exporter sees a table of all their shipments with tracking numbers, carrier info, status, and timeline. They can create new shipments by linking them to an order, entering carrier and tracking number. They can update shipment status as goods move through the supply chain.
- **Task 25 (Finance):** The exporter sees a financial summary: total revenue, pending payments, completed payments, and a payment history table. They can download PDF invoices for each completed order and see a revenue chart showing earnings over time.
- **Task 26 (Categories):** The exporter sees which product categories (e.g., Textiles, Spices, Electronics) perform best with bar charts comparing revenue and order counts per category.
- **Task 27 (Directory):** The exporter sees a list of all importers they've traded with, showing company name, contact info, country, and total trade volume. They can view the trade history for each partner.
- **Task 28 (Notifications):** The exporter sees a list of all notifications (new order, payment received, shipment update) with read/unread badges. They can mark individual or all notifications as read, and filter by type.
- **Task 29 (Settings):** The exporter can edit their profile (name, email, phone), company information (company name, website, description), upload a profile picture, change their password, and manage email notification preferences — all from a single settings form.

### 2.2 Importer Dashboard — 9 Sub-Pages

| #   | Task                                                                                                      | Current State | Status |
| --- | --------------------------------------------------------------------------------------------------------- | ------------- | ------ |
| 30  | **Build Importer Analytics page** — spending trends, order frequency, supplier breakdown, cost analysis   | Stub          | ☐      |
| 31  | **Build Importer Orders page** — order history table, order detail view, reorder, dispute flow            | Stub          | ☐      |
| 32  | **Build Importer Inventory page** — procurement wishlist, saved products, price tracking                  | Stub          | ☐      |
| 33  | **Build Importer Shipments page** — inbound shipment tracker, ETA, customs status, delivery confirmation  | Stub          | ☐      |
| 34  | **Build Importer Finance page** — spending analytics, budget tracking, payment history, invoice downloads | Stub          | ☐      |
| 35  | **Build Importer Categories page** — category preferences, spending per category                          | Stub          | ☐      |
| 36  | **Build Importer Notifications page** — same pattern as exporter                                          | Stub          | ☐      |
| 37  | **Build Importer Directory page** — exporter/supplier directory with ratings and trade history            | Stub          | ☐      |
| 38  | **Build Importer Settings page** — same pattern as exporter                                               | Stub          | ☐      |

**What happens after these tasks are done:**

- **Task 30 (Analytics):** The importer sees interactive charts showing how much they've spent over time, how frequently they order, which suppliers they buy from most, and a cost analysis breakdown. All data is aggregated from their real order history.
- **Task 31 (Orders):** The importer sees a table of all their past orders with status tracking. They can click any order to see full details. They can reorder a previous order with one click. If something is wrong with an order, they can raise a dispute with a reason and evidence.
- **Task 32 (Inventory/Wishlist):** The importer sees a list of products they've saved for later (wishlisted). They can track price changes on saved products and quickly move items to their cart when ready to buy.
- **Task 33 (Shipments):** The importer sees all inbound shipments with estimated arrival dates, current location/status, customs clearance status, and can confirm delivery when goods arrive.
- **Task 34 (Finance):** The importer sees their total spending, budget tracking, payment history with dates and amounts, and can download PDF invoices/receipts for any completed order.
- **Task 35 (Categories):** The importer can set their category preferences (what types of products they're interested in) and see a breakdown of their spending per category.
- **Task 36 (Notifications):** Same as exporter — a notification inbox with read/unread indicators, mark all read, and type filters.
- **Task 37 (Directory):** The importer sees a directory of exporters/suppliers with ratings, reviews, and their trade history with each supplier.
- **Task 38 (Settings):** Same as exporter — profile edit, company info, avatar upload, password change, email preferences.

### 2.3 Admin Dashboard — 11 Sub-Pages

| #   | Task                                                                                                             | Current State | Status |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------------- | ------ |
| 39  | **Build Admin main dashboard** — platform KPIs (total users, revenue, products, orders), charts, recent activity | Minimal stub  | ☐      |
| 40  | **Build Admin Users page** — user table, search/filter, role management, ban/suspend, verify, detail view        | Stub          | ☐      |
| 41  | **Build Admin Products page** — product moderation, approve/reject, feature toggle, bulk actions                 | Stub          | ☐      |
| 42  | **Build Admin Orders page** — all orders oversight, dispute resolution, order detail                             | Stub          | ☐      |
| 43  | **Build Admin Shipments page** — all shipments monitoring, carrier management                                    | Stub          | ☐      |
| 44  | **Build Admin Analytics page** — platform-wide analytics, growth charts, user acquisition funnel                 | Stub          | ☐      |
| 45  | **Build Admin Categories page** — category management, add/edit/delete categories                                | Stub          | ☐      |
| 46  | **Build Admin Feed page** — platform activity feed, moderation queue                                             | Stub          | ☐      |
| 47  | **Build Admin Trends page** — market trends, popular products, geographic heat maps                              | Stub          | ☐      |
| 48  | **Build Admin Notifications page** — system notifications, broadcast to users                                    | Stub          | ☐      |
| 49  | **Build Admin Directory page** — all users directory, export data                                                | Stub          | ☐      |

**What happens after these tasks are done:**

- **Task 39 (Dashboard):** The admin lands on a page showing live KPI cards (total users, total revenue, total products, total orders) pulled from the real database. Below are charts showing growth trends and a feed of the most recent platform activity (new registrations, orders, shipments).
- **Task 40 (Users):** The admin sees a searchable, filterable table of ALL users. They can search by name/email, filter by role (Exporter/Importer/Admin), country, or verification status. Each row has action buttons: View Profile, Edit Role, Verify Business, Suspend, or Ban.
- **Task 41 (Products):** The admin sees all products across the platform. They can approve new product listings, reject inappropriate ones, toggle "Featured" status, and perform bulk actions (approve all selected, delete all selected).
- **Task 42 (Orders):** The admin sees every order on the platform. They can search by order number, filter by status, and resolve disputes between exporters and importers by reviewing evidence and making a ruling.
- **Task 43 (Shipments):** The admin monitors all active shipments platform-wide, sees which carriers are being used, and can flag delayed or stuck shipments.
- **Task 44 (Analytics):** The admin sees platform-wide growth charts: user signups over time, revenue growth, order volume trends, and a user acquisition funnel (visits → signups → first order).
- **Task 45 (Categories):** The admin can create, edit, rename, and delete product categories that appear across the marketplace. Changes instantly reflect in the product listing filters.
- **Task 46 (Feed):** The admin sees a live activity feed of everything happening on the platform: new product listings for review, flagged content, and a moderation queue for items needing attention.
- **Task 47 (Trends):** The admin sees which product categories are trending up or down, which products have the most views/orders, and geographic heat maps showing where buyer demand is highest.
- **Task 48 (Notifications):** The admin can compose and send broadcast notifications to all users, specific user groups (all exporters, all importers), or individual users. They also see system-generated alerts about platform health.
- **Task 49 (Directory):** The admin sees a master list of all registered companies and users with the ability to export the data as CSV for business analysis.

### 2.4 Marketplace Flow

| #   | Task                                                                                                                                     | Current State     | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------ |
| 50  | **Complete Product Detail page** — full product info, image gallery/carousel, exporter info, inquiry form, add-to-cart, related products | Partial           | ☐      |
| 51  | **Complete Cart page** — server-synced cart (not just localStorage), quantity management, remove items, price calculation, promo codes   | localStorage only | ☐      |
| 52  | **Build Checkout flow** — shipping info form, order summary, payment integration, order confirmation                                     | Stub UI, no logic | ☐      |
| 53  | **Build Order Confirmation page** — success/failure states, order number, email confirmation trigger                                     | Missing           | ☐      |
| 54  | **Complete Orders (market) page** — order history for logged-in user, status tracking, reorder                                           | Stub              | ☐      |

**What happens after these tasks are done:**

- **Task 50 (Product Detail):** When a user clicks on any product from the marketplace, they see a full product page with: an image gallery/carousel they can click through, complete product specifications, the exporter's company info with a link to their profile, an inquiry form to ask questions, an "Add to Cart" button, and a section showing related products from the same category.
- **Task 51 (Cart):** The cart is synced to the server (not just browser localStorage). If a user adds items on their phone and opens the laptop, they see the same cart. They can adjust quantities, remove items, see real-time price calculations (subtotal, tax, shipping estimate), and apply promo/discount codes.
- **Task 52 (Checkout):** After clicking "Proceed to Checkout" from the cart, the user goes through a 3-step wizard: Step 1 — enter shipping address and select shipping method; Step 2 — enter payment details (credit card via Stripe/Razorpay); Step 3 — review the complete order summary before confirming.
- **Task 53 (Order Confirmation):** After successful payment, the user lands on an order confirmation page showing: "Order Placed Successfully!", the order number, a summary of items ordered, estimated delivery date, and a confirmation email is automatically sent to their inbox.
- **Task 54 (Orders):** On the marketplace `/orders` page, logged-in users see their complete order history in a table. Each row shows order number, date, items, total, and current status (Pending → Processing → Shipped → Delivered). They can click any order for full details and have a "Reorder" button to quickly buy the same items again.

---

## PHASE 3: CRITICAL INTEGRATIONS

### 3.1 Payment Processing

| #   | Task                                                                                       | Current State   | Status |
| --- | ------------------------------------------------------------------------------------------ | --------------- | ------ |
| 55  | **Integrate Stripe/Razorpay** — payment gateway for order checkout                         | Not implemented | ☐      |
| 56  | **Build payment webhooks** — handle payment success/failure, update order & payment status | Not implemented | ☐      |
| 57  | **Add invoice generation** — PDF invoices from order data                                  | Not implemented | ☐      |
| 58  | **Add refund flow** — partial and full refunds via API                                     | Not implemented | ☐      |

**What happens after these tasks are done:**

- **Task 55:** On the checkout page, when the user clicks "Pay Now", a Stripe/Razorpay payment form appears (credit card number, expiry, CVV). After entering payment details, the money is charged securely via the payment gateway. The order status changes to PAID, and the user sees a success confirmation. All payment processing happens server-side — no card details ever touch your database.
- **Task 56:** When Stripe/Razorpay confirms a payment (or a payment fails/is disputed), they automatically send a webhook to `/api/webhooks/stripe`. This server endpoint receives the event, verifies its authenticity using a secret signing key, and updates the corresponding Order and Payment records in the database. This ensures your database stays in sync with the real payment status even if the user closes their browser mid-payment.
- **Task 57:** For every completed order, a professional PDF invoice is generated containing: invoice number, date, buyer/seller details, line items with quantities and prices, subtotal, tax, shipping, and total. Users can click "Download Invoice" from their Finance or Order Detail page and get a printable PDF.
- **Task 58:** Admins (and eventually exporters) can issue full or partial refunds. On the admin's Order Detail page, there's a "Refund" button that calls the Stripe/Razorpay refund API. The order status updates to REFUNDED, and the customer receives their money back in 5–10 business days.

### 3.2 File Upload System

| #   | Task                                                                                   | Current State            | Status |
| --- | -------------------------------------------------------------------------------------- | ------------------------ | ------ |
| 59  | **Integrate Cloudinary** (or Supabase Storage) — product images, documents, avatars    | Stubbed env vars only    | ☐      |
| 60  | **Build image upload component** — drag & drop, preview, crop, multi-image             | None                     | ☐      |
| 61  | **Build document upload** — business licenses, invoices, bills of lading, certificates | None                     | ☐      |
| 62  | **Add document verification flow** — admin can verify uploaded docs                    | Schema exists, no UI/API | ☐      |

**What happens after these tasks are done:**

- **Task 59:** Your app connects to Cloudinary (a cloud image/file hosting service). When files are uploaded, they're stored on Cloudinary's CDN (globally fast delivery) instead of your server. Product images load faster because Cloudinary automatically optimizes and resizes them based on the device viewing them.
- **Task 60:** Exporters adding products see a beautiful drag-and-drop area where they can drop multiple images at once. Each image shows a preview before upload. They can crop/resize images within the browser. A progress bar shows upload status. Once uploaded, images appear in the product gallery.
- **Task 61:** Users can upload business documents (trade licenses, certificates of origin, bills of lading, export permits) as PDFs. Files are validated for type and size, uploaded to Cloudinary, and linked to the user's profile. These docs appear in their profile's "Documents" section.
- **Task 62:** After a user uploads their business license, an admin sees it in a verification queue. The admin can click "View Document" to see the PDF, then click "Approve" or "Reject". Approved users get a "Verified Business" badge on their profile. Rejected users are notified with a reason and can re-upload.

### 3.3 Email System

| #   | Task                                                                                                                   | Current State   | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------- | --------------- | ------ |
| 63  | **Set up transactional email** (Resend, SendGrid, or Nodemailer) — welcome email, order confirmation, shipment updates | Not implemented | ☐      |
| 64  | **Build email templates** — HTML email templates for all notifications                                                 | None            | ☐      |
| 65  | **Add email preferences** — user can toggle which emails to receive                                                    | None            | ☐      |

**What happens after these tasks are done:**

- **Task 63:** The system can now send automated emails. When a user registers, they get a "Welcome to Ranote Exim" email. When they place an order, they get an "Order Confirmed" email. When their shipment ships, they get a "Your Order Has Shipped" email with tracking info. All powered by Resend (or SendGrid) for reliable delivery.
- **Task 64:** Every email sent by the system looks professional with the Ranote Exim branding — logo at top, styled content, call-to-action buttons (e.g., "Track Your Order"), and a footer with unsubscribe link. Templates are built with `react-email` so they render beautifully across Gmail, Outlook, Apple Mail, etc.
- **Task 65:** In Settings, users see checkboxes to control which emails they receive: ☑ Order updates, ☑ Shipment notifications, ☐ Marketing emails, ☑ Security alerts. Unchecking a box stops those emails. Critical security emails (password changed, suspicious login) are always sent regardless.

### 3.4 Messaging System

| #   | Task                                                                           | Current State                | Status |
| --- | ------------------------------------------------------------------------------ | ---------------------------- | ------ |
| 66  | **Build messaging API** — send/receive messages between users, thread by order | Schema exists, no API routes | ☐      |
| 67  | **Build messaging UI** — inbox, conversation view, compose, attachments        | None                         | ☐      |
| 68  | **Add real-time messaging** — Supabase Realtime or WebSockets for live chat    | None                         | ☐      |

**What happens after these tasks are done:**

- **Task 66:** The backend API endpoints exist for sending and receiving messages between any two users. Messages are threaded by order (so conversations about Order #12345 are grouped together). The API supports creating conversations, sending messages, marking as read, and listing all conversations for a user.
- **Task 67:** In the dashboard, users see a "Messages" section with an inbox. The left panel shows a list of conversations (with the other party's name, last message preview, and unread badge). Clicking a conversation opens the chat view on the right — showing a timeline of messages with sender names, timestamps, and a text input at the bottom to send new messages. Users can also attach files.
- **Task 68:** Messages appear instantly without refreshing the page. When an exporter sends a message, the importer sees it pop up in real-time (like WhatsApp). This uses Supabase Realtime WebSockets that listen for new rows in the Message table and push them to the connected client immediately.

---

## PHASE 4: API COMPLETENESS & BACKEND

### 4.1 Missing API Routes

| #   | Task                                                                                           | Current State       | Status |
| --- | ---------------------------------------------------------------------------------------------- | ------------------- | ------ |
| 69  | **Add `PUT/PATCH /api/orders/[id]`** — update order status (confirm, process, cancel, dispute) | Only GET/POST exist | ☐      |
| 70  | **Add `GET/POST /api/messages`** — messaging endpoints                                         | None                | ☐      |
| 71  | **Add `GET/POST /api/documents`** — document upload & management                               | None                | ☐      |
| 72  | **Add `PUT /api/user/profile`** — update user profile, company info, avatar                    | Only GET exists     | ☐      |
| 73  | **Add `POST /api/shipments`** — create shipment for an order                                   | Only GET exists     | ☐      |
| 74  | **Add `PUT /api/shipments/[id]`** — update shipment status, tracking                           | None                | ☐      |
| 75  | **Add `DELETE /api/user/account`** — account deletion (GDPR compliance)                        | None                | ☐      |
| 76  | **Add admin-specific API routes** — user management, product moderation, platform stats        | None                | ☐      |
| 77  | **Add `/api/health`** — health check endpoint for monitoring                                   | None                | ☐      |

**What happens after these tasks are done:**

- **Task 69:** Exporters can now change order status from the dashboard (Accept → Processing → Shipped). The API validates that transitions make sense (can't go from Shipped back to Pending). Each status change triggers a notification to the importer.
- **Task 70:** The messaging feature has backend support. `GET /api/messages?conversationId=X` returns messages, `POST /api/messages` creates a new message. Both are authenticated and only return messages the current user is authorized to see.
- **Task 71:** Users can upload/list/delete documents via API. `POST /api/documents` accepts a file upload and metadata (document type, linked user). `GET /api/documents` returns all documents for the current user.
- **Task 72:** When users edit their profile in Settings and click Save, the form data is sent to `PUT /api/user/profile` which validates and updates the User record in the database. Changes are reflected immediately across the app.
- **Task 73:** When an exporter clicks "Create Shipment" for an order, the form data (carrier, tracking number, estimated delivery) is sent to `POST /api/shipments` which creates a Shipment record linked to that order and notifies the importer.
- **Task 74:** As a shipment progresses, the exporter can update its status (In Transit → Customs → Out for Delivery → Delivered) via `PUT /api/shipments/[id]`. Each update triggers an email/notification to the importer.
- **Task 75:** Users can delete their account from Settings. Clicking "Delete My Account" triggers `DELETE /api/user/account` which permanently removes the user and all their associated data from the database. This is required for GDPR compliance.
- **Task 76:** Admin-only endpoints exist for: `GET /api/admin/users` (list all users), `PATCH /api/admin/users/[id]` (ban/verify a user), `PATCH /api/admin/products/[id]` (approve/reject a product), `GET /api/admin/stats` (platform-wide statistics). All routes verify the caller has ADMIN role.
- **Task 77:** A simple `GET /api/health` endpoint returns `{ status: "ok", timestamp: "..." }`. Uptime monitoring services (e.g., UptimeRobot) ping this endpoint every minute. If it doesn't respond, the team gets alerted that the app is down.

### 4.2 Database Optimization

| #   | Task                                                                                                      | Current State     | Status |
| --- | --------------------------------------------------------------------------------------------------------- | ----------------- | ------ |
| 78  | **Add database indexes** — on `email`, `role`, `exporterId`, `importerId`, `orderNumber`, `status` fields | No custom indexes | ☐      |
| 79  | **Add full-text search** — PostgreSQL `tsvector` on product name + description                            | None              | ☐      |
| 80  | **Add soft deletes** — `deletedAt` field on User, Product, Order instead of hard delete                   | Hard deletes only | ☐      |
| 81  | **Add audit trail table** — log all changes to sensitive records                                          | None              | ☐      |
| 82  | **Database seed script** — realistic demo data for development/testing                                    | None              | ☐      |

**What happens after these tasks are done:**

- **Task 78:** Database queries become significantly faster. Looking up a user by email (login) goes from scanning every row to an instant indexed lookup. Filtering orders by status or listing products by exporterId becomes near-instant even with 100,000+ records. Added via `@@index` in `schema.prisma`.
- **Task 79:** When users search "organic cotton yarn" in the marketplace search bar, PostgreSQL performs a full-text search across product names AND descriptions simultaneously, returning results ranked by relevance. Much faster and smarter than simple `LIKE '%keyword%'` queries.
- **Task 80:** When a product or user is "deleted," it's not actually removed from the database. Instead, a `deletedAt` timestamp is set. The app filters out soft-deleted records in queries. This means: (a) data can be recovered if deleted by accident, (b) historical order records still reference the original product/user data, (c) admins can see deleted items if needed.
- **Task 81:** Every time an admin bans a user, approves a product, changes an order status, or modifies any sensitive record, a row is inserted into the `AuditLog` table recording: who did it, what they did, when, the old value, and the new value. This creates an immutable history of all administrative actions for accountability and compliance.
- **Task 82:** Running `npx prisma db seed` populates the database with realistic fake data: 50 exporters, 100 importers, 500 products across multiple categories, 200 orders in various statuses, 50 shipments, and sample messages. This makes development and testing much easier because you're working with realistic data instead of empty pages.

---

## PHASE 5: TESTING & QUALITY ASSURANCE

| #   | Task                                                                                                              | Current State                             | Status |
| --- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------ |
| 83  | **Set up testing framework** — Vitest + React Testing Library + Playwright                                        | Zero test infrastructure                  | ☐      |
| 84  | **Write unit tests for lib functions** — `auth-client.ts`, `cart.ts`, `api-utils.ts`, `utils.ts`, all validations | None                                      | ☐      |
| 85  | **Write API route integration tests** — all 20+ endpoints with auth/unauth scenarios                              | None                                      | ☐      |
| 86  | **Write component tests** — auth forms, product card, cart, sidebar, header                                       | None                                      | ☐      |
| 87  | **Write E2E tests** — registration → login → browse → add to cart → checkout → order flow                         | None                                      | ☐      |
| 88  | **Add TypeScript strict checks** — fix any `any` types, enable `noUncheckedIndexedAccess`                         | Strict mode on but likely has `any` types | ☐      |
| 89  | **Run ESLint with strict rules** — clean up all warnings and errors                                               | Basic ESLint only                         | ☐      |

**What happens after these tasks are done:**

- **Task 83:** The project has a fully configured testing infrastructure. Running `npm run test` executes unit tests with Vitest. Running `npm run test:e2e` launches Playwright browser tests. React Testing Library is available for rendering and testing React components in isolation.
- **Task 84:** All utility functions have tests confirming they work correctly. For example: the cart calculation function is tested with edge cases (empty cart, single item, discount applied, MAX quantity). Auth helper functions are tested for proper token handling. If someone accidentally changes how cart math works, the test fails immediately.
- **Task 85:** Every API endpoint is tested with automated HTTP requests. Tests verify: authenticated users get the right data, unauthenticated users get 401, invalid input returns 400 with proper error messages, creating/updating/deleting records works correctly, and admin-only routes reject non-admin users.
- **Task 86:** Key UI components are tested in isolation. The Login form is tested: type email + password + click submit → verify the API is called with the right data. The Product Card is tested: pass in product data → verify it displays name, price, and image correctly. The Cart is tested: add item → quantity goes up, remove item → it disappears.
- **Task 87:** A real browser (Chromium via Playwright) automatically runs through the entire user journey: opens the app → registers a new account → logs in → browses products → adds item to cart → goes to checkout → fills shipping info → completes payment → verifies order confirmation page. If any step fails, the test catches it with screenshots.
- **Task 88:** Every variable and function has explicit types — no `any` anywhere in the codebase. TypeScript catches more bugs at compile time: accessing a property that might not exist, passing wrong argument types, or forgetting to handle nullable values. This prevents runtime errors in production.
- **Task 89:** ESLint runs with strict rules, catching: unused variables, missing dependencies in React hooks, accessibility issues (images without alt text), import order violations, and potential bugs. Running `npm run lint` reports zero warnings and zero errors — the codebase is clean.

---

## PHASE 6: SEO, PERFORMANCE & ACCESSIBILITY

### 6.1 SEO

| #   | Task                                                                                          | Current State                 | Status |
| --- | --------------------------------------------------------------------------------------------- | ----------------------------- | ------ |
| 90  | **Add per-page metadata** — unique title/description for every route using `generateMetadata` | Only root layout has metadata | ☐      |
| 91  | **Add OpenGraph & Twitter Card meta** — images, descriptions for social sharing               | None                          | ☐      |
| 92  | **Add `sitemap.xml`** (dynamic, generated from products/pages)                                | None                          | ☐      |
| 93  | **Add `robots.txt`**                                                                          | None                          | ☐      |
| 94  | **Add structured data** (JSON-LD) — Product, Organization, BreadcrumbList schemas             | None                          | ☐      |
| 95  | **Fix title typo** — "Renote Exim" → "Ranote Exim" in `client/app/layout.tsx`                 | Typo                          | ☐      |
| 96  | **Add canonical URLs** on all pages                                                           | None                          | ☐      |

**What happens after these tasks are done:**

- **Task 90:** Every page now has its own unique title and description. The Products page says "Browse Export Products — Ranote Exim", a product detail page says "Organic Cotton Yarn — Ranote Exim", the Login page says "Sign In — Ranote Exim". This helps Google understand what each page is about and rank them properly.
- **Task 91:** When someone shares a product link on LinkedIn, Twitter, or WhatsApp, a beautiful preview card appears with the product image, title, price, and description — instead of just a plain URL. This is done by adding `<meta property="og:image">`, `og:title`, `og:description` tags to each page.
- **Task 92:** A dynamic `sitemap.xml` is generated at `/sitemap.xml` listing every page on the site, including all product detail pages. Google's crawler reads this file to discover and index all your pages. New products added to the database automatically appear in the sitemap.
- **Task 93:** A `robots.txt` file at `/robots.txt` tells search engine crawlers: "You CAN crawl the marketplace, product pages, and public content. You CANNOT crawl dashboard pages, admin pages, or API routes." This keeps private pages out of Google search results.
- **Task 94:** Product pages include invisible JSON-LD structured data that tells Google: "This is a Product called 'Organic Cotton Yarn', priced at $25/kg, rated 4.5 stars, sold by 'ABC Exports'." Google can show this as a rich snippet in search results with star ratings and price — increasing click-through rates.
- **Task 95:** The browser tab and search results now correctly show "Ranote Exim" instead of the misspelled "Renote Exim". A one-line fix in `layout.tsx`.
- **Task 96:** Every page has a `<link rel="canonical" href="...">` tag pointing to its definitive URL. This prevents Google from penalizing the site for duplicate content (e.g., if the same page is accessible via `?page=1` or without query params).

### 6.2 Performance

| #   | Task                                                                                                                   | Current State                     | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------ |
| 97  | **Add image lazy loading** with `next/image` on product listings and detail pages                                      | Not using `next/image` everywhere | ☐      |
| 98  | **Implement API response caching** (Redis or Next.js `revalidate`) for product listings, stats                         | All routes `force-dynamic`        | ☐      |
| 99  | **Add bundle analyzer** — identify and optimize large dependencies                                                     | None                              | ☐      |
| 100 | **Optimize font loading** — remove duplicate Google Fonts imports (Manrope via next/font + Material Icons in `<head>`) | Dual loading                      | ☐      |
| 101 | **Add service worker** for offline support / PWA capabilities                                                          | None                              | ☐      |
| 102 | **Database query optimization** — use `select` to fetch only needed fields, avoid N+1 queries                          | Fetching full records             | ☐      |

**What happens after these tasks are done:**

- **Task 97:** Images on product listing pages only load when the user scrolls near them (lazy loading). Images are automatically resized and served in modern formats (WebP) by Next.js `<Image>` component. A product listing page that previously loaded 2MB of images now loads under 200KB on initial view.
- **Task 98:** The Products listing API response is cached for 60 seconds. If 100 users load the products page within the same minute, only 1 database query runs — the other 99 get the cached response instantly. Dashboard statistics are cached for 5 minutes. This dramatically reduces database load and page load times.
- **Task 99:** Running `npm run analyze` opens a visual treemap showing every JavaScript library in your bundle and how much space it takes. You can identify if a single chart library is adding 500KB to every page, or if there's a library being imported but never used. This guides optimization decisions.
- **Task 100:** Fonts load once, correctly. Currently Manrope is loaded twice (via `next/font` AND via a `<link>` tag in `<head>`). After this fix, it loads once via `next/font` (which is faster and prevents layout shift). Material Icons are loaded efficiently via a CSS import only where needed.
- **Task 101:** After the first visit, the app works partially offline. Previously visited pages load from cache instantly. If the internet drops while browsing, users see cached content instead of a blank page. The app can be installed on mobile home screens like a native app (PWA).
- **Task 102:** Instead of `SELECT * FROM products` (fetching ALL 30 columns), queries now fetch only the 5 columns needed (name, price, image, category, id). API responses become smaller and faster. N+1 queries (fetching a list, then individually fetching details for each item) are replaced with a single JOIN query.

### 6.3 Accessibility

| #   | Task                                                                           | Current State                          | Status |
| --- | ------------------------------------------------------------------------------ | -------------------------------------- | ------ |
| 103 | **Add skip-to-content link** on all pages                                      | Missing                                | ☐      |
| 104 | **Audit all interactive elements** for ARIA labels, roles, keyboard navigation | Partial                                | ☐      |
| 105 | **Add `prefers-reduced-motion`** respect for animations                        | None — heavy animations may harm users | ☐      |
| 106 | **Test with screen reader** — VoiceOver/NVDA compatibility pass                | Not done                               | ☐      |
| 107 | **Add focus-visible styles** consistently across all interactive elements      | Partial                                | ☐      |

**What happens after these tasks are done:**

- **Task 103:** Keyboard users (and screen reader users) can press Tab once on any page and see a "Skip to main content" link appear. Pressing Enter jumps them directly to the main content, skipping the header, navigation, and sidebar. This saves them from tabbing through 20+ navigation links on every page.
- **Task 104:** Every button, link, icon, and form element has proper ARIA labels. The hamburger menu icon is labeled "Open navigation menu." The search icon is labeled "Search products." Users navigating with keyboard can use Tab/Shift+Tab to move between all interactive elements in a logical order, and Enter/Space to activate them.
- **Task 105:** Users who have enabled "Reduce Motion" in their OS settings will see the app without animations. The fancy homepage hero animations, page transitions, and hover effects are replaced with instant state changes. This prevents motion sickness and seizures for sensitive users.
- **Task 106:** A complete screen reader test pass has been done. VoiceOver (Mac) and NVDA (Windows) correctly read out all page content in logical order, announce form fields with their labels, announce buttons with their actions, and announce status changes (like "Item added to cart").
- **Task 107:** When users navigate the app using keyboard Tab, every focused element (button, link, input) has a clearly visible blue outline ring. This makes it obvious which element is currently selected. The outline only appears on keyboard focus (not mouse clicks) thanks to `:focus-visible`.

---

## PHASE 7: DEVOPS & MONITORING

| #   | Task                                                                                 | Current State              | Status |
| --- | ------------------------------------------------------------------------------------ | -------------------------- | ------ |
| 108 | **Set up CI/CD pipeline** — GitHub Actions for lint → test → build → deploy          | None                       | ☐      |
| 109 | **Add pre-commit hooks** (Husky + lint-staged) — format + lint before every commit   | None                       | ☐      |
| 110 | **Set up error tracking** (Sentry) — frontend + API error capture                    | None                       | ☐      |
| 111 | **Set up performance monitoring** (Vercel Analytics or Lighthouse CI)                | None                       | ☐      |
| 112 | **Set up uptime monitoring** — health check endpoint + external monitoring           | None                       | ☐      |
| 113 | **Configure staging environment** — separate Supabase project + database for testing | None                       | ☐      |
| 114 | **Add database migration CI** — automated Prisma migrations on deploy                | Manual only                | ☐      |
| 115 | **Set up log aggregation** — structured logging to a central service                 | None                       | ☐      |
| 116 | **Configure automated backups** for database                                         | Relies on Supabase default | ☐      |

**What happens after these tasks are done:**

- **Task 108:** Every time someone pushes code to GitHub or opens a pull request, GitHub Actions automatically: (1) runs ESLint to check code quality, (2) runs all unit and integration tests, (3) builds the app to make sure it compiles, (4) if all pass and it's the main branch, automatically deploys to production. Broken code can never reach production.
- **Task 109:** Every time a developer runs `git commit`, Husky intercepts it and runs Prettier (to auto-format code) and ESLint (to catch errors) on the changed files only. If there are linting errors, the commit is blocked until they're fixed. This ensures every commit in the repo meets quality standards.
- **Task 110:** When any error occurs in production (frontend crash or API exception), Sentry captures it with: the error message, full stack trace, the user's browser/device info, the URL they were on, and a breadcrumb trail of what they did before the error. Developers get an email/Slack alert immediately and can debug without asking the user to reproduce it.
- **Task 111:** A performance dashboard shows: page load times for every route (home page: 1.2s, product detail: 0.8s), Core Web Vitals (LCP, FID, CLS), performance over time, and slowest pages. If a deployment makes the app slower, it's immediately visible.
- **Task 112:** An external service (UptimeRobot, BetterUptime) pings `/api/health` every 60 seconds. If it doesn't respond within 5 seconds, the team gets an SMS/Slack/email alert: "Ranote Exim is DOWN." When it recovers, another alert: "Ranote Exim is back UP (was down 3 minutes)."
- **Task 113:** There's a separate staging environment with its own Supabase database. Before deploying to production, code is deployed to staging first. The team can test new features with realistic data without risking the production database. Staging URL is something like `staging.ranoteexim.com`.
- **Task 114:** When the codebase includes a new Prisma migration (new table, new field, etc.), the CI/CD pipeline automatically runs `prisma migrate deploy` during the build step. Database schema changes are applied to production automatically and safely — no manual SSH needed.
- **Task 115:** All server logs (API requests, errors, database queries, auth events) are sent to a central logging service (Datadog, Papertrail, or CloudWatch). Developers can search logs: "Show me all 500 errors from the past hour" or "Show me all login attempts for user X." Much easier than SSH-ing into a server and reading raw files.
- **Task 116:** The production database is backed up automatically every day with point-in-time recovery enabled. If something catastrophic happens (accidental data deletion, corruption), the database can be restored to any point in the last 7 days. Supabase PITR is enabled for this.

---

## PHASE 8: UX POLISH & COMPLETENESS

| #   | Task                                                                                            | Current State                                      | Status |
| --- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------ |
| 117 | **Complete Footer component** — links, social media, newsletter signup, company info            | Incomplete                                         | ☐      |
| 118 | **Add breadcrumb navigation** on all inner pages                                                | None                                               | ☐      |
| 119 | **Add page transition animations** between routes                                               | None (homepage has animations, dashboard doesn't)  | ☐      |
| 120 | **Add empty states** with CTAs on all data-driven pages (no orders? → "Place your first order") | Partial — component exists but not used everywhere | ☐      |
| 121 | **Add onboarding flow** for new users — first-login wizard, profile completion prompt           | None                                               | ☐      |
| 122 | **Add search functionality** in header/navbar (global product search)                           | None — only works on products page                 | ☐      |
| 123 | **Add product comparison feature**                                                              | None                                               | ☐      |
| 124 | **Add wishlist/favorites** feature                                                              | None (localStorage cart only)                      | ☐      |
| 125 | **Add user avatar/profile picture** display in header + dashboard                               | Schema supports it, no upload or display           | ☐      |
| 126 | **Add notification bell/badge** in header showing unread count                                  | None                                               | ☐      |
| 127 | **Add terms of service & privacy policy** pages                                                 | Missing                                            | ☐      |
| 128 | **Add contact/support page** with form                                                          | Missing                                            | ☐      |
| 129 | **Add about page**                                                                              | Missing                                            | ☐      |

**What happens after these tasks are done:**

- **Task 117:** The footer now appears on every page with: company info (address, phone, email), quick links (About, Pricing, FAQ, Contact), social media icons (LinkedIn, Twitter, Instagram) linking to your handles, a newsletter signup input where visitors can enter their email and click "Subscribe", and a copyright notice. The footer is consistent across the entire site.
- **Task 118:** On every inner page, a breadcrumb trail appears below the header: "Home > Dashboard > Exporter > Orders" with each level being a clickable link. Users always know exactly where they are in the app and can navigate back to any parent page with one click.
- **Task 119:** When navigating between routes, pages smoothly fade in/out or slide in with Framer Motion animations (150-300ms). This gives the app a polished, native-app feel instead of jarring instant page swaps. The homepage hero animations are extended to dashboard pages.
- **Task 120:** When an exporter has zero orders, instead of an empty white table, they see a friendly illustration with text: "No orders yet — Share your product listings to start receiving orders" and a CTA button "Go to Inventory". Every data-driven page (orders, shipments, messages, notifications) has its own tailored empty state.
- **Task 121:** When a new user logs in for the first time after registration, a guided wizard modal appears: Step 1 — "Complete your profile" (name, phone, company), Step 2 — "Upload your business license", Step 3 — "Set your preferences". A progress bar shows 3/3 steps. Users can skip but see a "Complete your profile (60%)" reminder until done.
- **Task 122:** The header/navbar has a search input visible on every page. As users type, it searches across all product names and descriptions. Pressing Enter or clicking search navigates to `/products?search=organic+cotton`. Results appear on the products page filtered by the search term.
- **Task 123:** On the products page, users can check up to 3 products to compare. A "Compare" button appears at the bottom. Clicking it opens a side-by-side comparison table showing: name, price, MOQ, category, origin country, specifications, and seller info for all selected products.
- **Task 124:** Every product card and product detail page has a "heart" icon (♡). Clicking it saves the product to the user's wishlist (stored in the database, not localStorage). Users can view their wishlist from the dashboard and move items to their cart when ready to buy. The heart fills in (♥) for wishlisted products.
- **Task 125:** The user's profile picture (or a colored circle with their initials if no picture uploaded) appears in the header next to their name. In the dashboard sidebar, a larger avatar appears at the top. Clicking the avatar opens a dropdown with "Profile", "Settings", and "Logout".
- **Task 126:** A bell icon (🔔) appears in the header next to the user's avatar. When there are unread notifications, a red badge shows the count (e.g., "3"). Clicking the bell opens a dropdown showing the 5 most recent notifications with a "View All" link to the full notifications page.
- **Task 127:** `/terms` and `/privacy` routes now exist and display professionally formatted legal pages. The registration page "I agree to the Terms of Service and Privacy Policy" links are no longer dead — they open these pages in a new tab.
- **Task 128:** `/contact` route has a form with fields: Name, Email, Subject, Message, and a Submit button. Submitting the form sends an email to the Ranote Exim support team via Resend. The user sees "Message sent! We'll get back to you within 24 hours."
- **Task 129:** `/about` route displays a marketing-style page with: the company mission/vision, founding story, team photos (if available), key statistics, and a call-to-action to sign up.

---

## PHASE 9: LEGAL, COMPLIANCE & CONTENT

| #   | Task                                                                      | Current State | Status |
| --- | ------------------------------------------------------------------------- | ------------- | ------ |
| 130 | **Add Cookie Consent banner** (GDPR/ePrivacy compliance)                  | Missing       | ☐      |
| 131 | **Add Cookie Policy page**                                                | Missing       | ☐      |
| 132 | **Add GDPR data export** — user can download all their data               | None          | ☐      |
| 133 | **Add GDPR account deletion** — user can request full data deletion       | None          | ☐      |
| 134 | **Add Pricing page** — footer links to `/pricing` but route doesn't exist | Dead link     | ☐      |
| 135 | **Add How It Works page** — referenced in footer, route missing           | Dead link     | ☐      |
| 136 | **Add FAQ / Help Center page**                                            | Missing       | ☐      |
| 137 | **Add Changelog / Release Notes page**                                    | Missing       | ☐      |
| 138 | **Add Status page** (incident communication)                              | Missing       | ☐      |

**What happens after these tasks are done:**

- **Task 130:** On first visit, a banner appears at the bottom of the screen: "We use cookies to enhance your experience. [Accept All] [Manage Preferences] [Decline]." The user's choice is saved to localStorage. If they decline non-essential cookies, analytics scripts don't load. This is required by GDPR for EU visitors.
- **Task 131:** `/cookie-policy` route explains what cookies the site uses, why, and how long they last. Categories include: Essential (login sessions — always on), Analytics (visitor counting — optional), and Marketing (none currently). The page links to the consent management settings.
- **Task 132:** In Settings, users see a "Download My Data" button. Clicking it triggers an API call that collects ALL their data (profile, orders, messages, documents, activity history) and packages it as a JSON file download. This is a GDPR requirement — users have the right to receive a copy of all data a company holds about them.
- **Task 133:** In Settings, users see a "Delete My Account" button with a red warning. Clicking it shows a confirmation dialog: "This will permanently delete your account and all associated data. This action cannot be undone. Type DELETE to confirm." After confirming, all user data is permanently erased from the database.
- **Task 134:** The footer's "Pricing" link now works. The `/pricing` page shows pricing tiers or subscription plans (if applicable), or a clear explanation of how the platform charges (transaction fees, listing fees, or "Free to use" if that's the model).
- **Task 135:** `/how-it-works` shows a step-by-step visual guide: Step 1 — Register as Exporter or Importer, Step 2 — List or Browse Products, Step 3 — Connect and Negotiate, Step 4 — Place Orders and Pay Securely, Step 5 — Track Shipments. Each step has an illustration and description.
- **Task 136:** `/faq` shows an accordion-style FAQ page organized by sections: "Getting Started", "Payments", "Shipping", "Account & Security". Clicking a question expands the answer. Common questions include "How do I become a verified seller?" and "What payment methods are accepted?"
- **Task 137:** `/changelog` shows a timeline of platform updates: "March 2026 — Added product reviews and ratings", "February 2026 — Launched real-time messaging", etc. Users and developers can see what's new at a glance.
- **Task 138:** `/status` shows the operational status of core services: Website ✅ Operational, API ✅ Operational, Payments ✅ Operational, Email ✅ Operational. During outages, the status page is updated manually or via an integration with a monitoring service to show which service is affected and estimated recovery time.

---

## PHASE 10: ADVANCED FEATURES & BUSINESS LOGIC

### 10.1 Internationalization & Localization

| #   | Task                                                                                             | Current State                       | Status |
| --- | ------------------------------------------------------------------------------------------------ | ----------------------------------- | ------ |
| 139 | **Add i18n / multi-language support** — locale routing, translation files (next-intl or similar) | None — English hardcoded everywhere | ☐      |
| 140 | **Add multi-currency support** — currency selector, conversion rates, display formatting         | Hardcoded USD only                  | ☐      |
| 141 | **Add timezone-aware date/time handling** — user timezone detection, UTC storage, local display  | No timezone handling                | ☐      |

**What happens after these tasks are done:**

- **Task 139:** The app can be viewed in multiple languages. A language switcher in the header/footer lets users choose Hindi, English, Spanish, etc. All UI text (button labels, navigation, error messages, placeholder text) is loaded from JSON translation files. URLs include the locale prefix (`/en/products`, `/hi/products`). Adding a new language just requires adding a new JSON file.
- **Task 140:** A currency selector in the header lets users switch between USD ($), EUR (€), GBP (£), INR (₹), etc. Product prices are stored in a base currency and displayed in the selected currency using live exchange rates from an API. The checkout converts the final amount accurately at the time of purchase.
- **Task 141:** All dates and times in the database are stored in UTC. When displayed to users, they're automatically converted to the user's local timezone. An order placed at "2:00 PM IST" by an Indian importer shows as "2:00 PM" to them but "9:30 AM" to a UK exporter. This prevents confusion in international B2B trade.

### 10.2 Data Management & Exports

| #   | Task                                                                                    | Current State | Status |
| --- | --------------------------------------------------------------------------------------- | ------------- | ------ |
| 142 | **Add CSV/Excel export** from all dashboard tables (orders, products, users, analytics) | None          | ☐      |
| 143 | **Add PDF export** for reports, invoices, shipment documents                            | None          | ☐      |
| 144 | **Add bulk CSV product import** for exporters                                           | None          | ☐      |
| 145 | **Add print stylesheets** for invoices, order details, reports                          | None          | ☐      |

**What happens after these tasks are done:**

- **Task 142:** On every dashboard table (orders, products, users, shipments), there's an "Export CSV" button. Clicking it downloads the currently displayed/filtered data as a .csv file that opens in Excel. Exporters can download their complete order history, admins can download user lists, etc.
- **Task 143:** Users can download PDF versions of invoices, shipment documents, and financial reports. The PDFs are professionally formatted with company logos, proper tables, and print-ready layouts. Generated using `@react-pdf/renderer`.
- **Task 144:** Instead of adding products one by one, exporters can click "Bulk Import" and upload a CSV file with columns: name, description, price, category, quantity. The system parses the CSV, validates each row, shows a preview with any errors highlighted, and creates all valid products in one batch.
- **Task 145:** When users press Ctrl+P (print) on invoice or order detail pages, the print output is clean: sidebar and navigation are hidden, colors are print-friendly (no dark backgrounds), tables fit on A4 paper, and page breaks are in logical places. This uses CSS `@media print` rules.

### 10.3 Advanced Marketplace Features

| #   | Task                                                                       | Current State                 | Status |
| --- | -------------------------------------------------------------------------- | ----------------------------- | ------ |
| 146 | **Add product reviews/ratings** — UI for submitting and displaying reviews | Schema may support, no UI/API | ☐      |
| 147 | **Add search autocomplete/suggestions** in global search                   | None                          | ☐      |
| 148 | **Add discount/promo code system**                                         | None                          | ☐      |
| 149 | **Add tax calculation** per jurisdiction                                   | None — no tax logic           | ☐      |
| 150 | **Add social login** (Google, LinkedIn — relevant for B2B)                 | Email/password only           | ☐      |

**What happens after these tasks are done:**

- **Task 146:** On each product detail page, below the product info, there's a "Reviews" section showing star ratings, written reviews from buyers, and a "Write a Review" form (only visible to users who've purchased the product). The overall star rating (e.g., ★★★★☆ 4.2) is computed from all reviews and displayed on product cards in listings.
- **Task 147:** As users type in the header search bar, a dropdown appears showing matching product names in real-time (like Google Autocomplete). Typing "cot" shows suggestions: "Cotton Yarn", "Cotton Fabric", "Organic Cotton". Clicking a suggestion navigates directly to that product or filtered search results.
- **Task 148:** At checkout, users see a "Promo Code" input field. Entering a valid code (e.g., `WELCOME20`) and clicking "Apply" instantly recalculates the order total with the discount. Invalid or expired codes show an error. Admins can create promo codes with: discount amount, expiration date, usage limit, and minimum order value.
- **Task 149:** During checkout, after entering the shipping address, the system automatically calculates applicable taxes based on the shipping destination (state/country). The order summary shows a "Tax" line item with the calculated amount. Tax rates are configured per jurisdiction.
- **Task 150:** The login and register pages show "Continue with Google" and "Continue with LinkedIn" buttons alongside the email/password form. Clicking either button redirects to the provider's OAuth page. After authorization, the user is logged in (or registered if new) automatically. Their avatar and name are pulled from the social account.

### 10.4 Third-Party Integrations

| #   | Task                                                                                 | Current State                       | Status |
| --- | ------------------------------------------------------------------------------------ | ----------------------------------- | ------ |
| 151 | **Add shipping carrier API integration** (FedEx, DHL, Maersk APIs for live tracking) | Manual tracking numbers only        | ☐      |
| 152 | **Add customs documentation automation** (HS code lookup, duty calculation)          | HS code field exists, no automation | ☐      |
| 153 | **Add webhook system** — outgoing webhooks for order/shipment events                 | None                                | ☐      |
| 154 | **Add API documentation** (Swagger/OpenAPI spec)                                     | None                                | ☐      |

**What happens after these tasks are done:**

- **Task 151:** Instead of manually entering tracking numbers, exporters select a carrier (FedEx, DHL, Maersk) and the system automatically fetches live tracking status updates. Importers see real-time shipment location on a map and receive automatic notifications when status changes (Picked Up → In Transit → Customs → Delivered).
- **Task 152:** When creating a product listing or shipment, entering an HS code (Harmonized System code) automatically looks up the item classification and calculates estimated import duties for the destination country. Customs declaration documents are auto-generated with the correct tariff information.
- **Task 153:** Businesses can register webhook URLs in their settings. When an order status changes (OrderPlaced, PaymentReceived, Shipped, Delivered), Ranote Exim sends a POST request to their URL with the event data in JSON format. This lets businesses integrate with their own ERP, accounting, or inventory systems.
- **Task 154:** Visiting `/api-docs` shows a Swagger UI page documenting every API endpoint: the URL, HTTP method, required parameters, request body format, example responses, and authentication requirements. External developers can use this documentation to build integrations with the Ranote Exim platform.

### 10.5 Infrastructure Extras

| #   | Task                                                                                | Current State                                        | Status |
| --- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- | ------ |
| 155 | **Add favicon.ico + app icons** (PWA manifest, Apple touch icons)                   | Missing from public directory                        | ☐      |
| 156 | **Add web analytics** (Google Analytics, Plausible, or Vercel Analytics)            | None                                                 | ☐      |
| 157 | **Add environment variable validation on startup** (using Zod or t3-env)            | No validation — app crashes silently on missing vars | ☐      |
| 158 | **Add feature flags system** (for gradual rollouts)                                 | None                                                 | ☐      |
| 159 | **Add maintenance mode toggle** (admin can put site in maintenance)                 | None                                                 | ☐      |
| 160 | **Add SMS notifications** for critical events (order confirmed, shipment delivered) | None                                                 | ☐      |

**What happens after these tasks are done:**

- **Task 155:** The browser tab shows a proper Ranote Exim logo icon instead of the default Next.js icon or no icon. When users add the site to their phone home screen (PWA), a proper app icon appears. Apple touch icons ensure it looks good on iOS home screens too.
- **Task 156:** The admin can see a dashboard of real visitor data: how many people visit per day, which pages are most popular, where visitors come from (country, referral source), bounce rate, and session duration. This uses Vercel Analytics or Plausible (privacy-friendly) — no personal data is collected.
- **Task 157:** When the app starts, it checks that all required environment variables exist and are in the correct format (e.g., `DATABASE_URL` is a valid PostgreSQL connection string, `STRIPE_SECRET_KEY` starts with `sk_`). If any are missing or malformed, the app fails immediately with a clear error message listing exactly what's wrong — instead of crashing randomly at runtime.
- **Task 158:** Developers can wrap features in feature flags: `if (featureFlags.newCheckout) { show new checkout } else { show old checkout }`. Features can be enabled for specific users (beta testers), a percentage of users (10% rollout), or everyone. This allows deploying unfinished features without exposing them to all users.
- **Task 159:** An admin can toggle "Maintenance Mode" from the admin dashboard. When enabled, all non-admin users see a friendly page: "We're performing scheduled maintenance. We'll be back shortly." The admin can still access the dashboard. This is used during deployments, database migrations, or emergency fixes.
- **Task 160:** For critical events, users receive SMS notifications on their registered phone number. Examples: "Your order #12345 has been confirmed — ₹25,000 charged." or "Your shipment has arrived at Mumbai port — customs clearance in progress." Powered by Twilio. Users can opt out of SMS in their notification preferences.

### 10.6 Code Quality Issues Found

| #   | Task                                                                                                      | Current State                                 | Status |
| --- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------ |
| 161 | **Replace `<img>` tags with `next/image`** in dashboard pages (exporter/inventory, exporter/orders, etc.) | Using raw `<img>` — performance regression    | ☐      |
| 162 | **Remove unused imports** (e.g., `Search` in exporter/inventory/page.tsx)                                 | Dead code in several files                    | ☐      |
| 163 | **Fix hardcoded mock data** in admin dashboard pages — connect to real APIs                               | Charts say "placeholder"                      | ☐      |
| 164 | **Add loading.tsx** to all route groups that don't have one (dashboard sub-pages)                         | Only top-level dashboards have loading states | ☐      |
| 165 | **Add user feedback / bug report mechanism** — in-app feedback widget                                     | None                                          | ☐      |

**What happens after these tasks are done:**

- **Task 161:** All `<img>` tags in dashboard pages are replaced with Next.js `<Image>` components. Images are automatically lazy-loaded (only load when scrolled into view), optimized (served as WebP), and properly sized (no layout shift when loading). Product thumbnails in the inventory table load faster and use less bandwidth.
- **Task 162:** All dead/unused import statements are removed from every file. The codebase is cleaner, bundle sizes may decrease slightly, and ESLint no longer shows import warnings. This makes the code easier to read and maintain.
- **Task 163:** Admin dashboard pages that currently show hardcoded fake data ("Active Shipments: 128", "Verified Partners: 3,420") are now connected to real database queries. The KPI cards show actual counts from the User, Product, Order, and Shipment tables. Charts display real historical trends instead of "Chart coming soon" placeholders.
- **Task 164:** When navigating to any dashboard sub-page (e.g., exporter/analytics, admin/users), a skeleton loading animation appears while data is being fetched. This prevents the user from seeing a blank screen for 1-2 seconds. Each route group has its own `loading.tsx` with a tailored skeleton layout.
- **Task 165:** A small floating button (💬 or 🐛) appears in the bottom-right corner of every page. Clicking it opens a feedback form: "Report a Bug" or "Suggest a Feature" with a text field and optional screenshot capture. Submissions are sent to the development team via email or Sentry user feedback. This lets real users report issues without needing to contact support.

---

## SUMMARY BY PRIORITY

> See **UPDATED SUMMARY BY PRIORITY** at the end of Phase 12 for the complete priority table covering all 245 tasks.

---

## PHASE 11: MISSED FEATURES — DISCOVERED VIA DEEP AUDIT (Tasks 166–195)

> **Added after cross-referencing HTML prototypes, Prisma schema, sidebar nav items, API routes, and checkout flows**

### 11.1 Data Model & Schema Gaps

| #   | Task                                                                                                                                                                     | Current State               | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | ------ |
| 166 | **Add `OrderItem` model** — current `Order` has single `productId`. Multi-product orders need an `OrderItem[]` join table (productId, quantity, unitPrice per line item) | Single-product orders only  | ☐      |
| 167 | **Add `Address` model** — shipping + billing address storage (street, city, state, zip, country). Link to User and Order                                                 | No address fields anywhere  | ☐      |
| 168 | **Add `Wishlist` model** — userId + productId relation, DB-backed saved items                                                                                            | No wishlist table in schema | ☐      |
| 169 | **Add `PromoCode` model** — code, discount type (% or flat), active dates, usage limits, min order value                                                                 | No coupon/promo system      | ☐      |
| 170 | **Add `Review` model** — productId, userId, rating (1-5), comment, verified purchase flag                                                                                | No reviews table in schema  | ☐      |

**What happens after these tasks are done:**

- **Task 166:** Orders can now contain multiple products. When a user adds 3 different items to their cart and checks out, a single Order is created with 3 OrderItem rows (one per product, each storing productId, quantity, unitPrice). The order total is the sum of all OrderItems. This is how real e-commerce works — without this, users can only buy 1 product per order.
- **Task 167:** Users can save multiple shipping/billing addresses to their profile. At checkout, they pick from saved addresses or add a new one. Each Order record stores a `shippingAddressId` and `billingAddressId` pointing to the Address table. The Address model has fields: street, city, state, postalCode, country, isDefault, label (e.g., "Home", "Office").
- **Task 168:** The "Save for Later" / "Wishlist" feature is now backed by a database table. Each row stores `userId + productId + addedAt`. Unlike localStorage, the wishlist persists across devices and browsers. Duplicate entries are prevented by a unique constraint on `(userId, productId)`.
- **Task 169:** Admins can create promo codes in the admin dashboard. Each PromoCode record has: `code` (e.g., "WELCOME20"), `discountType` (PERCENTAGE or FLAT), `discountValue` (20), `minOrderValue` (₹500), `maxUses` (1000), `usedCount` (tracks usage), `startsAt`, `expiresAt`, and `isActive`. The checkout API validates codes against all these rules.
- **Task 170:** A Review table stores product reviews from verified buyers. Each row has: `productId`, `userId`, `rating` (1-5 integer), `comment` (text), `verifiedPurchase` (boolean — true if the user actually bought this product), and `createdAt`. Products display an average rating computed from all their reviews.

### 11.2 Missing API Endpoints

| #   | Task                                                                                                       | Current State                                                                   | Status |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------ |
| 171 | **Add `POST /api/products`** — product creation endpoint for exporters                                     | Only GET (list) and PUT (update) exist; exporters can't create products via API | ☐      |
| 172 | **Add Wishlist API** — `GET/POST/DELETE /api/wishlist` for save-for-later and wishlist management          | No endpoints                                                                    | ☐      |
| 173 | **Add `POST /api/orders/[id]/cancel`** — order cancellation by user (before shipment)                      | CANCELLED status in schema, no cancel API                                       | ☐      |
| 174 | **Add `POST /api/orders/[id]/dispute`** — dispute initiation by importer with reason/evidence              | DISPUTED status in schema, no dispute API                                       | ☐      |
| 175 | **Add `POST /api/rfq`** — Request for Quote submission (buyer inquiry to exporter)                         | No RFQ system at all                                                            | ☐      |
| 176 | **Add `GET/POST /api/addresses`** — user saved addresses CRUD                                              | No address storage                                                              | ☐      |
| 177 | **Add `POST /api/promo/validate`** — promo code validation at checkout                                     | No endpoint                                                                     | ☐      |
| 178 | **Add `GET /api/products/[id]/reviews`** + `POST` — product reviews CRUD                                   | No endpoint                                                                     | ☐      |
| 179 | **Add `GET /api/products/recommended`** — recommended/related products based on category, purchase history | No endpoint                                                                     | ☐      |

**What happens after these tasks are done:**

- **Task 171:** Exporters can now create new products from the dashboard. The "Add New Product" form sends data to `POST /api/products` which creates a Product record with all fields (name, description, price, category, images, MOQ, origin country). The endpoint validates that the user is an EXPORTER and that all required fields are filled.
- **Task 172:** The wishlist feature has full API support. `POST /api/wishlist` adds a product (sends `{ productId }`), `GET /api/wishlist` returns all wishlisted products for the current user with product details, `DELETE /api/wishlist/[productId]` removes an item. All endpoints are authenticated.
- **Task 173:** Users can cancel orders that haven't been shipped yet. Calling `POST /api/orders/[id]/cancel` with a reason changes the order status to CANCELLED. The API prevents cancellation if the order is already SHIPPED or DELIVERED. A cancellation email is sent to both buyer and seller.
- **Task 174:** If an importer receives damaged goods or the wrong product, they call `POST /api/orders/[id]/dispute` with `{ reason, description, evidenceUrls }`. The order status changes to DISPUTED. The admin gets a notification with the dispute details and can review the evidence before making a ruling.
- **Task 175:** Importers can send a Request for Quote to an exporter: `POST /api/rfq` with `{ exporterId, productId, quantity, message, deliveryTimeline }`. The exporter receives a notification and can respond with a custom price quote. If the importer accepts, the quote converts into an order.
- **Task 176:** Users can manage saved addresses. `POST /api/addresses` creates a new address. `GET /api/addresses` returns all of the user's saved addresses. `PUT /api/addresses/[id]` updates an address. `DELETE /api/addresses/[id]` removes one. One address can be marked as default.
- **Task 177:** At checkout, when the user enters a promo code and clicks "Apply", the frontend calls `POST /api/promo/validate` with `{ code, orderTotal }`. The API checks: Does this code exist? Is it active? Has it expired? Has it hit its usage limit? Is the order above the minimum value? If valid, it returns the discount amount. If not, it returns an error message (e.g., "Code expired" or "Minimum order ₹500 required").
- **Task 178:** `GET /api/products/[id]/reviews` returns all reviews for a product (rating, comment, reviewer name, date, verified purchase badge). `POST /api/products/[id]/reviews` lets a logged-in user submit a review (with rating 1-5 and comment). The API checks if the user actually purchased this product before allowing submission.
- **Task 179:** `GET /api/products/recommended` returns a list of recommended products based on: (a) products in the same category as the one being viewed, (b) products frequently bought together, (c) popular products the user hasn't seen yet. These appear in a "You Might Also Like" section on product detail and cart pages.

### 11.3 Sidebar & Navigation Gaps

| #   | Task                                                                                                                                                                       | Current State                       | Status |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------ |
| 180 | **Add missing Admin sidebar links** — Feed, Trends, Categories, Directory routes exist but are NOT in the AdminSidebar nav array (only 7 items shown, 4 pages unreachable) | Routes exist, sidebar missing links | ☐      |
| 181 | **Add missing Exporter sidebar links** — Categories (`/exporter/categories`) and Directory (`/exporter/directory`) routes exist but NOT in ExporterSidebar nav             | Routes exist, sidebar missing links | ☐      |
| 182 | **Add missing Importer sidebar links** — Notifications (`/importer/notifications`) and Categories (`/importer/categories`) routes exist but NOT in ClientSidebar nav       | Routes exist, sidebar missing links | ☐      |
| 183 | **Build mobile responsive hamburger menu** — all 3 sidebars use `hidden lg:flex`, no mobile navigation exists. Users on mobile cannot access any nav                       | Desktop-only sidebar                | ☐      |

**What happens after these tasks are done:**

- **Task 180:** The Admin sidebar now shows ALL 11 links instead of just 7. Feed, Trends, Categories, and Directory are added to the navigation array. Admins can now reach all 11 admin pages from the sidebar without needing to type URLs manually.
- **Task 181:** The Exporter sidebar now includes Categories and Directory links. Exporters can access their category performance and importer directory from the sidebar navigation.
- **Task 182:** The Importer sidebar now includes Notifications and Categories links. Importers can access their notifications and category preferences from the sidebar.
- **Task 183:** On mobile devices (screens below 1024px), a hamburger menu icon (☰) appears in the top-left corner. Tapping it slides in a full-height drawer from the left with all the sidebar navigation links. Tapping outside or pressing X closes it. Previously, mobile users had NO way to navigate between dashboard pages — now all pages are accessible on phones and tablets.

### 11.4 Checkout & Order Completion Gaps

| #   | Task                                                                                                                                      | Current State                   | Status |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------ |
| 184 | **Store shipping/billing address in orders** — checkout collects address via form but it goes nowhere (no Address model, not saved to DB) | Form exists, data discarded     | ☐      |
| 185 | **Build order cancellation UI** — "Cancel Order" button on order detail (before SHIPPED status), with confirmation dialog                 | No cancel flow                  | ☐      |
| 186 | **Build dispute resolution workflow** — importer raises dispute → admin reviews → resolve/refund. Full UI flow for all 3 roles            | Schema supports DISPUTED, no UI | ☐      |
| 187 | **Add Web3/Crypto payment option** — prototype shows MetaMask wallet connect for crypto payments                                          | Shown in prototype, not in code | ☐      |

**What happens after these tasks are done:**

- **Task 184:** When a user fills in their shipping address during checkout, the address data is properly saved to the database (linked to both the User and the Order). The order detail page shows the delivery address. This data is used for shipping labels and delivery estimation.
- **Task 185:** On the order detail page, orders with status PENDING or PROCESSING show a red "Cancel Order" button. Clicking it opens a confirmation dialog: "Are you sure you want to cancel this order? This action cannot be undone." After confirming, the order status changes to CANCELLED, any payment is refunded, and both parties are notified.
- **Task 186:** A complete dispute workflow exists: (1) The importer clicks "Raise Dispute" on an order detail page, fills in a reason and uploads evidence photos. (2) The admin sees the dispute in their queue with both sides' info. (3) The admin can rule in favor of either party, issue a refund, or request more info. (4) Both parties are notified of the outcome.
- **Task 187:** On the checkout payment step, alongside "Credit Card" there's a "Pay with Crypto" option. Clicking it triggers a MetaMask wallet connection popup. The user approves a transaction in their wallet. The payment is verified on-chain, and the order is marked as PAID. This is an optional, experimental payment method.

### 11.5 Wishlist & Cart Enhancements

| #   | Task                                                                                                                             | Current State                         | Status |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------ |
| 188 | **Build Wishlist tab UI in Cart page** — prototype shows Cart/Wishlist dual-tab with "Save for Later" and "Move to Cart" actions | Prototype shows it, no implementation | ☐      |
| 189 | **Build recommended products section** in cart and product detail pages — algorithm based on category/history                    | Prototype shows it, no implementation | ☐      |

**What happens after these tasks are done:**

- **Task 188:** The Cart page has two tabs at the top: "Cart (3)" and "Saved for Later (5)". The Cart tab shows items ready to buy. The Saved for Later tab shows wishlisted items with "Move to Cart" and "Remove" buttons on each. Users can move items between tabs freely. This is the standard Amazon/Flipkart cart pattern.
- **Task 189:** Below the cart items, a "You Might Also Like" section shows 4-6 recommended products based on: the categories of items in the cart, the user's browsing history, and popular products. On the product detail page, a similar section shows "Related Products" from the same category. Each recommended product card has an "Add to Cart" button.

### 11.6 B2B-Specific Missing Features

| #   | Task                                                                                                                                    | Current State                          | Status |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------ |
| 190 | **Build RFQ (Request for Quote) system** — buyer sends inquiry to exporter, exporter responds with custom quote, convert quote to order | Core B2B feature, entirely missing     | ☐      |
| 191 | **Add multi-warehouse inventory tracking** — prototype shows warehouse locations, capacity gauges, per-warehouse stock levels           | Prototype shows it, no Warehouse model | ☐      |
| 192 | **Add user profile completion progress bar** — show % of profile fields filled, prompt to complete (company info, avatar, documents)    | None                                   | ☐      |
| 193 | **Add bulk admin actions** — mass approve products, mass verify users, mass delete, select all + checkboxes on admin tables             | No bulk operations                     | ☐      |

**What happens after these tasks are done:**

- **Task 190:** The full RFQ (Request for Quote) flow works end-to-end: (1) An importer browsing a product clicks "Request Quote" and fills in quantity, delivery timeline, and special requirements. (2) The exporter receives the RFQ in their dashboard and can respond with a custom price, delivery schedule, and terms. (3) The importer reviews the quote and clicks "Accept" which creates an order at the quoted price. This is the core B2B procurement workflow.
- **Task 191:** Exporters can manage inventory across multiple warehouses. A new `Warehouse` model stores location, capacity, and name. On the Inventory page, each product shows stock levels per warehouse (e.g., "Mumbai: 500 units, Delhi: 200 units"). Capacity gauges visualize how full each warehouse is.
- **Task 192:** In the dashboard header or sidebar, a profile completion progress bar shows "Profile: 60% complete." It checks: name ✅, email ✅, phone ✅, company name ✅, company description ❌, avatar ❌, business license ❌. Clicking it navigates to Settings with incomplete fields highlighted.
- **Task 193:** On admin tables (Users, Products, Orders), each row has a checkbox. A "Select All" checkbox at the top selects all visible rows. When rows are selected, a bulk action bar appears: "3 selected — [Approve All] [Reject All] [Delete All]". This allows admins to moderate hundreds of items efficiently instead of one-by-one.

### 11.7 Dashboard Table & UI Completeness

| #   | Task                                                                                                                                      | Current State                     | Status |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------ |
| 194 | **Add pagination to ALL dashboard tables** — exporter orders, admin users, admin orders, shipments tables need client/server pagination   | Only products page has pagination | ☐      |
| 195 | **Add in-app notification preferences** — per-type toggles (order updates, messages, system alerts) separate from email preferences (#65) | No in-app preference UI           | ☐      |

**What happens after these tasks are done:**

- **Task 194:** All dashboard tables show 10-25 rows per page with page navigation at the bottom: "← Previous | Page 1 of 12 | Next →". For tables with server-side data (orders, users), pagination is server-side (only 1 page of data is fetched at a time, keeping the page fast even with 10,000+ records). The products page pagination pattern is extended to all other data tables.
- **Task 195:** In Settings, separate from email preferences, users see in-app notification toggles: ☑ Order updates (new order, status change), ☑ Messages (new message received), ☑ Shipment updates (tracking changes), ☐ Marketing (promotions, new features). These control which notifications appear in the bell icon dropdown — not which emails are sent (that's controlled by Task 65).

---

## PHASE 12: PER-PAGE FEATURE GAPS — DISCOVERED VIA LINE-BY-LINE READ (Tasks 196–230)

> **Added after reading every single page.tsx file in the codebase line-by-line**

### 12.1 Exporter Dashboard — Page-Specific Gaps

| #   | Task                                                                                                                                                                                           | Current State                     | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------ |
| 196 | **Create `/dashboard/exporter/inventory/new` page** — "Add Listing" button links here but **page does not exist** (causes 404). Need full product creation form with all fields + image upload | 404 — file missing entirely       | ☐      |
| 197 | **Add edit/delete product actions on Exporter Inventory rows** — products display as read-only table rows with no action buttons                                                               | No edit/delete buttons per row    | ☐      |
| 198 | **Wire Exporter Inventory search & filters** — page has no search/filter UI at all, displays up to 100 products unfiltered                                                                     | No search or filter controls      | ☐      |
| 199 | **Wire Exporter Orders status filter pills** — page shows 4 status pills (Pending, Processing, Shipped, Delivered) as display badges, but clicking them doesn't filter the table               | Clickable badges, no filter logic | ☐      |
| 200 | **Add Exporter order detail page** — `/dashboard/exporter/orders/[id]` — "View" links on each order row point to this route but it likely doesn't exist                                        | Links to non-existent route       | ☐      |
| 201 | **Wire Exporter Finance "Download Statement" button** — button renders but has no onClick handler                                                                                              | Display-only button               | ☐      |
| 202 | **Replace Exporter Finance revenue chart placeholder** — shows literal text "Chart coming soon — use Analytics page for detailed charts" instead of a real Recharts chart                      | Placeholder text, no chart        | ☐      |
| 203 | **Wire Exporter Analytics "Export Report" button** — button renders but has no onClick handler                                                                                                 | Display-only button               | ☐      |
| 204 | **Add chart interactivity to Exporter Analytics** — bar chart has no hover tooltips, no click-to-drill-down. Should use Recharts properly                                                      | CSS-only bars, no interactivity   | ☐      |
| 205 | **Add Exporter Dashboard search functionality** — search input "Search shipments, IDs..." has no onChange handler                                                                              | Display-only input                | ☐      |

**What happens after these tasks are done:**

- **Task 196:** Clicking "Add Listing" on the Exporter Inventory page now navigates to `/dashboard/exporter/inventory/new` — a fully functional product creation form with fields for: product name, description, price, MOQ, category (dropdown), origin country, HS code, specifications, and a multi-image upload area (drag & drop). Submitting creates the product via `POST /api/products` and redirects back to the inventory list. No more 404 error.
- **Task 197:** Each product row in the Exporter Inventory table now has an "Edit" (pencil icon) and "Delete" (trash icon) button. Clicking Edit opens a pre-filled modal/page with all product details editable. Clicking Delete shows a confirmation dialog and removes the product (soft delete). Exporters can now manage their product catalog.
- **Task 198:** The Exporter Inventory page now has a search bar (search by product name) and filter dropdowns (filter by category, status, price range). Typing in the search bar instantly filters the table. Selecting a category from the dropdown shows only products in that category.
- **Task 199:** The 4 status pills (Pending, Processing, Shipped, Delivered) on the Exporter Orders page are now clickable filters. Clicking "Pending" shows only pending orders. Clicking "All" shows everything. An active pill has a highlighted/filled style. The filter works by passing a query parameter to the API, so pagination still works correctly.
- **Task 200:** Clicking "View" on any order row in the Exporter Orders table navigates to `/dashboard/exporter/orders/[id]` — a detailed order page showing: order number, date, importer info, all line items with quantities and prices, shipping address, payment status, shipment tracking info, and action buttons (Accept, Reject, Mark Shipped). No more dead link.
- **Task 201:** Clicking "Download Statement" on the Exporter Finance page generates and downloads a PDF financial statement containing: all transactions for the selected period, revenue summary, pending payments, and a list of all completed orders with amounts. The button now has a working onClick handler.
- **Task 202:** The "Chart coming soon" placeholder text on the Exporter Finance page is replaced with a real Recharts area chart showing monthly revenue over the last 12 months. The chart has hover tooltips showing exact amounts and is colored to match the dashboard theme.
- **Task 203:** Clicking "Export Report" on the Exporter Analytics page downloads a CSV or PDF report containing all the analytics data currently displayed: revenue trends, order volumes, top products, and geographic breakdown.
- **Task 204:** The bar chart on the Exporter Analytics page is rebuilt using Recharts instead of plain CSS divs. Each bar has a hover tooltip showing the exact value. The chart has axis labels, a legend, and responsive sizing. Clicking a bar could drill down to show details for that specific time period.
- **Task 205:** The search input "Search shipments, IDs..." on the Exporter main dashboard now has a working onChange handler. Typing filters the displayed data (recent orders, shipments) in real-time. Pressing Enter navigates to the relevant search results page.

### 12.2 Importer Dashboard — Page-Specific Gaps

| #   | Task                                                                                                                                                                   | Current State               | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------ |
| 206 | **Replace Importer Dashboard spending trend with real chart** — currently a hardcoded SVG line with no real data binding                                               | Static SVG, not data-driven | ☐      |
| 207 | **Make Importer Dashboard bubble chart interactive** — shows 6 regions (Asia Pac, North Am, Europe, MENA, LATAM, Africa) as animated circles but clicking does nothing | Visual-only, no drill-down  | ☐      |
| 208 | **Add filters to Importer Orders page** — table has no search, date range, status filter, or sort. Shows up to 50 orders unsorted                                      | No filters or search        | ☐      |
| 209 | **Add order detail page for Importer** — no order detail modal/page. "Track" link redirects to general shipments page instead of specific order                        | No per-order detail view    | ☐      |
| 210 | **Replace Importer Finance "Cash Flow Analysis" placeholder** — shows "Detailed charts available in Analytics" instead of a real chart                                 | Placeholder text, no chart  | ☐      |
| 211 | **Wire Importer Analytics "Export Report" + "Share Dashboard" buttons** — both render but have no onClick handlers                                                     | Display-only buttons        | ☐      |
| 212 | **Add chart tooltips to Importer Analytics monthly spending bars** — bar chart has no hover tooltips or interactivity                                                  | CSS-only bars               | ☐      |
| 213 | **Add category drill-down on Importer Categories page** — clicking a category card does nothing. Should navigate to filtered product list                              | No onClick, display-only    | ☐      |

**What happens after these tasks are done:**

- **Task 206:** The Importer Dashboard spending trend is now a real Recharts line chart showing actual monthly spending from the database over the last 12 months. The hardcoded SVG is replaced with a dynamic, data-driven chart that updates as new orders are placed.
- **Task 207:** The regional bubble chart on the Importer Dashboard is now interactive. Clicking "Asia Pacific" filters the supplier list to show only Asia-Pacific exporters. Hovering over a bubble shows the exact trade volume for that region.
- **Task 208:** The Importer Orders page now has: a search bar (search by order number or product name), a date range picker (show orders from last 7 days / 30 days / custom range), status filter pills (All / Pending / Shipped / Delivered), and column sorting (click column header to sort by date, amount, etc.).
- **Task 209:** Clicking on any order row (or the "View" button) on the Importer Orders page navigates to `/dashboard/importer/orders/[id]` — showing full order details: items ordered, quantities, prices, exporter info, shipping address, payment status, shipment tracking, and buttons for "Reorder", "Cancel" (if not shipped), and "Raise Dispute".
- **Task 210:** The "Cash Flow Analysis" placeholder on the Importer Finance page is replaced with a real Recharts stacked bar chart showing monthly spending broken down by category (Electronics, Textiles, Food, etc.). Hover tooltips show exact amounts per category per month.
- **Task 211:** "Export Report" downloads a CSV/PDF of the Importer Analytics data. "Share Dashboard" copies a shareable link to the clipboard (or opens a share dialog) so the importer can share their analytics view with team members.
- **Task 212:** The monthly spending bar chart on the Importer Analytics page now has Recharts hover tooltips. Hovering over any bar shows: "March 2026: ₹5,45,000 spent across 12 orders." The chart is rebuilt from CSS-only div bars to proper Recharts `<BarChart>` components.
- **Task 213:** Clicking a category card on the Importer Categories page (e.g., "Textiles — ₹2,50,000 spent") navigates to `/products?category=textiles` showing all products in that category filtered in the marketplace. The importer can quickly browse and order more from categories they buy frequently.

### 12.3 Admin Dashboard — Page-Specific Gaps

| #   | Task                                                                                                                                                                                   | Current State                            | Status |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------ |
| 214 | **Replace Admin Dashboard hardcoded KPIs with real API data** — "Active Shipments: 128, Verified Partners: 3,420" etc. are all hardcoded mock values, no API call                      | All data is fake                         | ☐      |
| 215 | **Replace Admin Dashboard mock feed events with real data** — 4 static feed cards (Shipment Arrived, Payment Action, etc.) are hardcoded                                               | Static mock events                       | ☐      |
| 216 | **Wire Admin Dashboard search bar** — "Search shipments, IDs..." input has no handler                                                                                                  | Display-only input                       | ☐      |
| 217 | **Wire Admin Analytics charts** — page shows placeholder text "Trend line placeholder (wire Recharts here)" and "Radar chart placeholder"                                              | Explicit placeholders, zero charts       | ☐      |
| 218 | **Wire Admin Notifications alert actions** — "Filter" shows toast "Filter UI-only in this pass", "View details" shows "Details view not wired yet", "Mark all as read" doesn't persist | All actions are stubs via toast          | ☐      |
| 219 | **Replace Admin Notifications hardcoded alerts with real API data** — 6 static alerts across 3 categories, no database fetch                                                           | All data is mock                         | ☐      |
| 220 | **Replace Admin Feed hardcoded data and wire Refresh button** — 4 static feed items, refresh button has no handler, control settings are all static text                               | All data is mock, no handlers            | ☐      |
| 221 | **Replace Admin Trends hardcoded data** — "Cotton yarn (+6.1%)" etc. are all static. Add real trend calculation engine                                                                 | All data is mock                         | ☐      |
| 222 | **Replace Admin Categories hardcoded data and wire buttons** — 6 static categories, "New Category" button has no handler, "Edit" button has no handler, search doesn't work            | All data is mock, buttons non-functional | ☐      |
| 223 | **Replace Admin Directory hardcoded data and wire search** — 6 static partner cards, search input has no handler, cards don't link to detail views                                     | All data is mock, search non-functional  | ☐      |
| 224 | **Add search/filter/sort to Admin Users page** — table lists users with real data but has no search by name/email, no filter by role/country/verified, no column sorting               | No search, filter, or sort               | ☐      |
| 225 | **Add action buttons to Admin Users rows** — no view/edit/delete/verify/ban buttons on user rows. Currently display-only                                                               | No row actions at all                    | ☐      |
| 226 | **Add search/filter/sort to Admin Products page** — real data but no search by name, no filter by category/status, no sorting                                                          | No search, filter, or sort               | ☐      |
| 227 | **Add action buttons to Admin Products rows** — no approve/reject/feature/delete buttons. Only product name is a link                                                                  | No row actions                           | ☐      |
| 228 | **Add search/filter/sort to Admin Orders page** — real data but no search by order number, no filter by status/date, no sorting                                                        | No search, filter, or sort               | ☐      |
| 229 | **Add search/filter to Admin Shipments page** — real data but no search by tracking number, no filter by status/carrier/date                                                           | No search or filter                      | ☐      |

**What happens after these tasks are done:**

- **Task 214:** The Admin Dashboard KPI cards ("Total Users", "Total Revenue", "Active Shipments", "Verified Partners") now show real-time counts from the database via `GET /api/admin/stats`. The numbers update on each page load. No more fake "3,420" placeholders.
- **Task 215:** The Admin Dashboard activity feed shows real recent events from the database: "User John Doe registered 5 min ago", "Order #12345 placed 12 min ago", "Product 'Organic Cotton' approved 1hr ago". Events are fetched from an activity/audit log table and sorted by recency.
- **Task 216:** The Admin Dashboard search bar now works. Typing searches across orders (by order number), shipments (by tracking number), users (by name/email), and products (by name). Results appear in a dropdown with categorized sections.
- **Task 217:** The Admin Analytics page placeholder texts are replaced with real Recharts charts: a trend line chart showing user growth over 12 months, a radar chart comparing different performance metrics (orders, revenue, user satisfaction), and a pie chart showing user distribution by role.
- **Task 218:** Admin Notification actions are fully functional. "Filter" opens a dropdown to filter by type (Security, Orders, System). "View details" navigates to the relevant page (e.g., clicking a "New order" notification goes to that order). "Mark all as read" sends a PATCH request that updates all unread notifications in the database.
- **Task 219:** Admin notifications are fetched from the real Notification table in the database. New notifications appear in real-time (via Supabase Realtime). Each notification shows: type icon, message, timestamp, and read/unread status.
- **Task 220:** The Admin Feed shows real platform activity pulled from the database. The "Refresh" button re-fetches the latest events. Feed items are clickable — clicking one navigates to the relevant entity (user, order, product).
- **Task 221:** The Admin Trends page calculates real trends from order and product data: "Cotton Yarn: +6.1% this month vs last month" is computed from actual order quantities. Trending products, declining categories, and hot regions are all data-driven.
- **Task 222:** Admin Categories displays real categories from the database. "New Category" opens a modal to create a new category (name, description, icon). "Edit" opens an edit modal. Search filters categories by name. Delete removes a category (with a check for any products using it).
- **Task 223:** Admin Directory shows real user/company data from the database. Search filters by company name, user name, or country. Each card links to that user's profile detail page where the admin can view all their info, orders, and documents.
- **Task 224:** The Admin Users table gets a search bar (search by name or email), filter dropdowns (filter by role: Exporter/Importer/Admin, by verification status, by country), and clickable column headers for sorting (sort by name, date joined, order count).
- **Task 225:** Each row in the Admin Users table now has action buttons: "View" (opens profile detail), "Edit Role" (change between Exporter/Importer/Admin), "Verify" (mark business as verified), "Suspend" (temporarily disable account), "Ban" (permanently disable account). Destructive actions require confirmation.
- **Task 226:** The Admin Products table gets search (by product name), filter dropdowns (by category, by status: Active/Pending/Rejected, by date range), and sortable columns (sort by name, price, date listed, order count).
- **Task 227:** Each row in the Admin Products table now has action buttons: "Approve" (makes product visible in marketplace), "Reject" (hides product with reason sent to exporter), "Feature" (toggles featured status for homepage display), "Delete" (soft deletes the product with confirmation).
- **Task 228:** The Admin Orders table gets search (by order number or buyer/seller name), filter dropdowns (by status, by date range, by disputed/non-disputed), and sortable columns (sort by date, amount, status).
- **Task 229:** The Admin Shipments table gets search (by tracking number or order number), filter dropdowns (by status, by carrier, by date range). Admins can quickly find stuck or delayed shipments.

### 12.4 Marketplace & Auth — Page-Specific Gaps

| #   | Task                                                                                                                                                                  | Current State                          | Status |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------ |
| 230 | **Fix Product Detail hardcoded reviews** — page shows "4.5 stars (128 reviews)" but these are hardcoded strings, not from any data source                             | Fake ratings/reviews                   | ☐      |
| 231 | **Fix Product Detail hardcoded "In Stock" badge** — always shows "In Stock" in emerald regardless of actual product availability                                      | `available` field not used for display | ☐      |
| 232 | **Fix "Buy Now" button to add product to cart before redirect** — button navigates to `/checkout` but doesn't add the current product to cart first                   | Navigates without cart action          | ☐      |
| 233 | **Wire Cart "Save for later" buttons** — each cart item has a "Save for later" button but it has no onClick handler                                                   | Display-only button                    | ☐      |
| 234 | **Wire Cart promo code input** — "APPLY" button next to promo input has no onClick handler or validation                                                              | Display-only                           | ☐      |
| 235 | **Add checkout Step 3 (Review)** — progress bar shows 3 steps but only goes to 2/3. The review/confirmation step is not built                                         | Step 3 doesn't exist                   | ☐      |
| 236 | **Add checkout shipping address form** — checkout page has no shipping address input, only card/payment form. Address fields are completely missing                   | No shipping address collection         | ☐      |
| 237 | **Add post-checkout order confirmation page/redirect** — after placing orders, cart clears and toast shows, but no redirect to a confirmation page with order summary | No confirmation page or redirect       | ☐      |
| 238 | **Wire Marketplace Orders filter & search buttons** — "Filter" and "Search" icon buttons in the Order Archive section have no onClick handlers                        | Display-only buttons                   | ☐      |
| 239 | **Create `/forgot-password` page** — login page "Lost key?" link navigates to `/forgot-password` but the page/route does not exist                                    | 404 — file missing entirely            | ☐      |
| 240 | **Create `/terms` and `/privacy` pages** — register page links to both but neither route exists                                                                       | 404 — files missing entirely           | ☐      |
| 241 | **Wire Login "Remember Me" checkbox** — checkbox renders but has no backend or cookie handler                                                                         | Display-only checkbox                  | ☐      |

**What happens after these tasks are done:**

- **Task 230:** The product detail page shows real reviews from the database. The star rating ("★★★★☆ 4.2") is computed as the average of all review ratings for that product. "(128 reviews)" shows the actual count. Below, a reviews section lists individual reviews with reviewer name, rating, date, and comment.
- **Task 231:** The "In Stock" / "Out of Stock" badge on the product detail page now reads the product's actual `available` field (and/or `quantity`) from the database. If quantity is 0 or available is false, it shows a red "Out of Stock" badge, and the "Add to Cart" button is disabled.
- **Task 232:** Clicking "Buy Now" now: (1) adds the current product to the cart (1 unit, or selected quantity), (2) then immediately redirects to `/checkout`. The user arrives at checkout with the product already in their cart, ready to pay.
- **Task 233:** Clicking "Save for later" on a cart item: (1) removes it from the cart, (2) adds it to the user's wishlist (database-backed), (3) shows a toast "Item moved to Saved for Later". The item appears in the "Saved for Later" tab on the cart page.
- **Task 234:** Clicking "APPLY" next to the promo code input: (1) calls `POST /api/promo/validate` with the entered code and current order total, (2) if valid, shows a green "Discount applied: -₹200" and updates the order total, (3) if invalid, shows a red error "Invalid promo code" or "Code has expired".
- **Task 235:** The checkout flow now has all 3 steps: Step 1 — Shipping Address (select or add address), Step 2 — Payment (enter card details), Step 3 — Review & Confirm (shows complete order summary: items, shipping address, payment method, total — with a "Place Order" button). Users can go back to previous steps to edit before confirming.
- **Task 236:** Checkout Step 1 now has a complete shipping address form with fields: Full Name, Phone Number, Address Line 1, Address Line 2, City, State/Province, Postal Code, Country. If the user has saved addresses, they can pick one from a dropdown. The entered/selected address is saved with the order.
- **Task 237:** After successful payment, the user is redirected to `/order-confirmation/[orderId]` showing: "✅ Order Placed Successfully!", the order number, items ordered with images, shipping address, estimated delivery date, payment method used, and total paid. An email confirmation is also sent automatically.
- **Task 238:** The "Filter" button on the Marketplace Orders page opens a dropdown with filter options: by status (All, Pending, Shipped, Delivered, Cancelled), by date range, by price range. The "Search" button expands a search input to search by order number or product name. Both filters update the displayed order list in real-time.
- **Task 239:** `/forgot-password` page now exists. It shows a simple form: "Enter your email address" with an email input and a "Send Reset Link" button. Submitting calls Supabase's `resetPasswordForEmail()`. The user sees "Check your inbox for a reset link." Clicking the emailed link opens `/reset-password` where they can set a new password. The login page "Lost key?" link no longer 404s.
- **Task 240:** `/terms` and `/privacy` pages now exist with professionally formatted legal content. The `/terms` page contains Terms of Service (account rules, payment terms, dispute resolution, liability). The `/privacy` page contains Privacy Policy (data collection, usage, third-party sharing, cookies, GDPR rights). Registration "I agree to Terms" links now work.
- **Task 241:** The "Remember Me" checkbox on the login page is now functional. When checked, the session cookie is set with a 30-day expiry (user stays logged in for a month). When unchecked, the session is browser-session only (expires when the browser closes). The preference is passed to Supabase's `signInWithPassword()` options.

### 12.5 Settings Pages — Shared Gaps (Both Exporter & Importer)

| #   | Task                                                                                                                                    | Current State            | Status |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------ |
| 242 | **Add password change section to Settings pages** — both exporter and importer settings have profile edit only, no password change form | No password change UI    | ☐      |
| 243 | **Add avatar upload to Settings pages** — avatar shows initials but there's no upload/change button                                     | Display-only avatar      | ☐      |
| 244 | **Add form validation to Settings pages** — no client-side validation before PATCH submit (empty names, invalid URLs, etc.)             | No validation            | ☐      |
| 245 | **Add feedback auto-dismiss on Settings pages** — success/error message stays forever, should auto-dismiss after 3–5 seconds            | Message never disappears | ☐      |

**What happens after these tasks are done:**

- **Task 242:** The Settings page now has a "Change Password" section below the profile edit form. It has 3 fields: Current Password, New Password, Confirm New Password. Submitting validates that the current password is correct, the new password meets strength requirements (8+ chars, one uppercase, one number), and both new password fields match. The password is updated via Supabase Auth.
- **Task 243:** The avatar circle on the Settings page now has a camera icon overlay on hover. Clicking it opens a file picker to select an image (jpg, png, max 2MB). The selected image is uploaded to Cloudinary, and the user's `avatarUrl` field is updated in the database. The new avatar immediately appears in the header and sidebar across the app.
- **Task 244:** All Settings form fields now have client-side validation using Zod + React Hook Form. Name fields require at least 2 characters. Email must be a valid email format. Website URL must start with `http://` or `https://`. Phone number must be digits only. Invalid fields show red error messages below them, and the Save button is disabled until all errors are resolved.
- **Task 245:** After saving settings successfully ("Profile updated ✅") or failing ("Failed to update ❌"), the feedback message automatically fades out and disappears after 4 seconds using a `setTimeout`. Users don't need to manually close it. This uses a toast notification system (e.g., react-hot-toast or sonner) for consistent styling across the app.

---

## UPDATED SUMMARY BY PRIORITY

| Priority                     | Tasks                                  | Description                                      |
| ---------------------------- | -------------------------------------- | ------------------------------------------------ |
| **P0 — Security**            | #1–8                                   | Blocking for production                          |
| **P0 — Error Handling**      | #9–14                                  | Blocking for production                          |
| **P0 — Broken Links/404s**   | #196, #200, #239, #240                 | Pages that DON'T EXIST but are linked to         |
| **P1 — Auth Complete**       | #15–20, #241                           | Critical for user trust                          |
| **P1 — Core Dashboards**     | #21–49                                 | Core product value (sub-page buildout)           |
| **P1 — Dashboard Data Gaps** | #214–223                               | Admin pages showing 100% fake data               |
| **P1 — Marketplace Flow**    | #50–54, #230–237                       | Revenue-generating flow with broken buttons      |
| **P1 — Schema/Data Model**   | #166–170                               | OrderItem, Address, Wishlist, PromoCode, Review  |
| **P1 — Missing APIs**        | #171–179                               | Product creation, wishlist, cancel, dispute, RFQ |
| **P2 — Payments**            | #55–58, #187                           | Revenue enablement                               |
| **P2 — File Uploads**        | #59–62                                 | Core feature dependency                          |
| **P2 — Email**               | #63–65                                 | User engagement                                  |
| **P2 — Messaging**           | #66–68                                 | B2B communication                                |
| **P2 — Navigation**          | #180–183                               | Sidebar links, mobile menu                       |
| **P2 — Wiring Stub Buttons** | #197–199, #201–213, #233–234, #238     | Buttons/filters that render but do nothing       |
| **P2 — Admin Table Actions** | #224–229                               | Admin can see data but can't act on it           |
| **P2 — Wishlist & Cart**     | #188–189                               | Wishlist tab, recommended products               |
| **P2 — B2B Features**        | #190–193                               | RFQ system, multi-warehouse, bulk admin          |
| **P3 — API Gaps**            | #69–77                                 | Backend completeness                             |
| **P3 — DB Optimization**     | #78–82                                 | Scalability                                      |
| **P3 — Chart/Viz Quality**   | #202, #204, #206–207, #210, #212, #217 | Charts that are placeholders or CSS-only         |
| **P3 — Settings UX**         | #242–245                               | Password, avatar, validation, auto-dismiss       |
| **P3 — Testing**             | #83–89                                 | Quality assurance                                |
| **P3 — Dashboard Tables**    | #194–195                               | Pagination, notification prefs                   |
| **P4 — SEO**                 | #90–96                                 | Discoverability                                  |
| **P4 — Performance**         | #97–102                                | User experience                                  |
| **P4 — Accessibility**       | #103–107                               | Compliance                                       |
| **P5 — DevOps**              | #108–116                               | Operational maturity                             |
| **P5 — UX Polish**           | #117–129                               | Completeness                                     |
| **P6 — Legal/Compliance**    | #130–138                               | GDPR, legal pages, dead links                    |
| **P7 — Advanced Features**   | #139–165                               | i18n, exports, integrations, code quality        |

---

## WHAT'S ALREADY DONE ✅

| Feature                                                                                     | Status      |
| ------------------------------------------------------------------------------------------- | ----------- |
| Authentication (login/register/session/RBAC middleware)                                     | ✅ Complete |
| Prisma schema (User, Product, Order, Shipment, Message, Document, Notification)             | ✅ Complete |
| Homepage with animations (GSAP, Framer Motion, parallax)                                    | ✅ Complete |
| Products list page with filters/search/pagination                                           | ✅ Complete |
| Exporter main dashboard with KPIs                                                           | ✅ Complete |
| Importer main dashboard with KPIs                                                           | ✅ Complete |
| Dark/light theme toggle                                                                     | ✅ Complete |
| 20 API endpoints (auth, products, orders, stats, notifications, shipments, cart, dashboard) | ✅ Complete |
| Responsive design (mobile-first, TailwindCSS breakpoints)                                   | ✅ Complete |
| UI component library (Button, Card, Input, Badge, Skeleton, EmptyState, ErrorState)         | ✅ Complete |
| Zod input validation on API routes                                                          | ✅ Complete |
| Role-based route protection via middleware                                                  | ✅ Complete |

---

## TECH STACK REFERENCE

| Component     | Technology           | Version         |
| ------------- | -------------------- | --------------- |
| Frontend      | Next.js              | 14.2.0          |
| UI            | React + TailwindCSS  | 18.3.0 + 3.4.0  |
| ORM           | Prisma               | 5.15.0          |
| Database      | Supabase PostgreSQL  | —               |
| Auth          | Supabase Auth        | 2.49.1          |
| Animations    | Framer Motion + GSAP | 11.0.0 + 3.14.2 |
| Validation    | Zod                  | 3.23.0          |
| Charts        | Recharts             | 2.12.0          |
| UI Components | ShadCN + Radix       | Custom          |
| Deployment    | Netlify              | —               |
