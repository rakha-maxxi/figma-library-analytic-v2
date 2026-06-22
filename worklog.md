# Project Worklog — Design System Component Usage Tracker

This file is the single source of truth for project progress across all agents.
Every agent MUST read this file before starting and append a new section after finishing.

---

Task ID: 1
Agent: main (orchestrator)
Task: Read PRD, set up project worklog, and scaffold landing page foundation.

Work Log:
- Read PRD at /home/z/my-project/upload/Pasted Content_1781797508004.txt (1566 lines).
- Identified product: **Design System Component Usage Tracker** — an internal Design Ops dashboard that tracks design system / UI Kit component usage across registered Figma files based on scan history.
- Captured key design directives from PRD section 6:
  - Inspiration: Figma Library Analytics (analytics model) + Linear (interaction/density) + shadcn/ui (component library).
  - Design keywords: clean, compact, calm, data-first, fast, operational, precise, modern internal tool.
  - Visual style: neutral background, subtle borders, minimal shadows, compact typography, dense but readable tables, small status badges, calm accent color, light mode first.
  - Avoid: overly colorful generic SaaS dashboard style, decorative charts, landing page-style visuals in the dashboard (note: this landing page is the marketing site, so landing page visuals are appropriate here).
- Decided accent color: emerald/teal (calm, professional, "data-first"). NO indigo or blue per project rules.
- Information architecture from PRD: Overview, Components, Files, Scans, Insights, Settings.
- Positioning statement to use on hero: "Track design system component usage across registered Figma files based on scan history."
- Verified existing project structure: Next.js 16 + TypeScript + Tailwind 4 + full shadcn/ui component set + framer-motion + lucide-react + recharts.
- Created worklog file (this file).

Stage Summary:
- Product understanding complete. Landing page will be a single-route marketing site that introduces the product, its personas, core features, how-it-works flow, UX principles, MVP scope, and FAQ.
- Next step: build modular landing page section components under `src/components/landing/`, compose them in `src/app/page.tsx`, ensure sticky footer, then lint, dev, and browser-verify.

---
Task ID: 2
Agent: main (orchestrator)
Task: Build the complete landing page for Componently (Design System Component Usage Tracker) based on the PRD, then verify rendering and interactivity with agent-browser.

Work Log:
- Created modular landing section components under src/components/landing/:
  - site-header.tsx — sticky translucent header with logo, nav links, CTA buttons, mobile hamburger menu (framer-motion animated).
  - hero.tsx — hero with headline, subtext, CTAs, and a CSS-built dashboard mockup (sidebar, metric cards, component usage table with status pills & trend deltas). Emerald/teal accent on neutral background.
  - stats-strip.tsx — 4 scope stats (source UI Kit, registered files, components tracked, scan history).
  - problem.tsx — 5 pain-point cards + a highlighted quote card with the core question.
  - features.tsx — bento-grid of 5 core features (Component usage dashboard, Component detail, Scan management, Snapshot & change detection, Insights & governance) each with a unique mini visual (table, detail tabs, scan progress, change feed, insight cards) + 3 mini features.
  - how-it-works.tsx — 4-step onboarding flow with numbered cards + scope/freshness honesty callout.
  - personas.tsx — 3 persona cards (Design Ops primary, Product Designer, Design Lead) with pain points & needs.
  - principles.tsx — 5 UX principles with quotes + a "Linear-fast. Figma-fluent." gradient card.
  - scope.tsx — In-scope vs Out-of-scope two-column lists + 4-milestone roadmap + future opportunities.
  - faq.tsx — accordion with 8 honest FAQs (framer-motion expand/collapse, aria-expanded).
  - cta.tsx — final CTA section with gradient background, trust chips.
  - site-footer.tsx — footer with brand, 3 link columns, social icons, data-scope disclaimer, bottom bar with status indicator.
- Composed all sections in src/app/page.tsx using flex min-h-screen flex-col wrapper + mt-auto footer (sticky footer pattern).
- Updated src/app/layout.tsx metadata: title, description, keywords, OG, Twitter for Componently product.
- Ran `bun run lint` — clean, no errors.
- Dev server already running on port 3000; all GET / responses 200, no runtime errors.

Verification with agent-browser:
- Opened http://localhost:3000/ — title correct "Componently — Design System Component Usage Tracker".
- agent-browser errors — none. console — only React DevTools info + HMR connected.
- VLM analysis of full-page desktop screenshot confirmed: hero renders fully (headline, subtext, buttons, dashboard mockup); no layout issues/overlaps/blank areas; color scheme consistent emerald/teal on neutral background (NO blue/indigo); footer complete at bottom; no text overflow.
- FAQ accordion: clicked first question → aria-expanded toggled to true, answer text visible ("No. Componently is a scoped tracker...").
- Mobile menu (390px viewport): hamburger button visible, aria-expanded toggles, mobile nav opens with all 6 nav links + Read docs + Open dashboard buttons.
- VLM analysis of mobile full-page screenshot confirmed: headline readable and properly wrapped, both buttons fit width, dashboard mockup renders without horizontal overflow.
- Sticky footer: wrapper has flex min-h-screen flex-col, footer has mt-auto — correct pattern (footer naturally pushed down by long content here; would stick on short pages).
- Responsive design verified at both desktop (1280px) and mobile (390px).

Stage Summary:
- Landing page COMPLETE and browser-verified. Single route (/), 12 modular section components, sticky footer, mobile-first responsive, emerald/teal accent (no blue/indigo), all PRD content represented (problem, features, how-it-works, personas, principles, scope/milestones, FAQ, CTA).
- No outstanding bugs. Lint clean. Dev server healthy.
- Next step: create the recurring webDevReview cron job (every 15 minutes) to continue QA + feature expansion autonomously.

---
Task ID: 3
Agent: webDevReview cron (round 1)
Task: QA the landing page, then redesign per user feedback: minimalist, Linear/Vercel-inspired but unique, DM Sans font, balanced density. User rated original design "bad" (plain, dull, weak typography, generic SaaS).

Work Log:
- Reviewed worklog — landing page was complete and dashboard build was in progress (mock-data, store, sidebar, topbar, shell, primitives, overview-page created).
- QA via agent-browser: landing rendered 200, no errors, clean console. Decided to pause dashboard build and prioritize the landing redesign per user's direct feedback.
- Switched fonts in src/app/layout.tsx from Geist/Geist_Mono to DM_Sans/DM_Mono (next/font/google), with font variables --font-sans and --font-mono.
- Rewrote src/app/globals.css:
  - Bound --font-sans/--font-mono to DM Sans/Mono.
  - Refined palette to minimalist warm near-white background (oklch 0.992) + near-black foreground (oklch 0.18), emerald as single restrained accent token (--accent-emerald / --ring).
  - Tightened radius to 0.5rem for technical feel.
  - Added @layer components utilities: .label-mono, .label-mono-emerald, .section-rule, .hairline-card, .num-mono for the editorial spec-sheet signature.
  - Added refined ::selection, .scroll-slim custom scrollbar.
- Created src/components/landing/primitives.tsx with shared editorial primitives: SectionHeader, NumberedSection (hairline-top + mono numbered rail), FadeIn, MonoTag.
- Redesigned ALL 11 landing components to the new visual language:
  - site-header.tsx — solid foreground logo mark, mono "v1.0" tag, hairline border on scroll, refined nav.
  - hero.tsx — EDITORIAL: mono status tags (live·v1.0), huge tight DM Sans headline (-0.035em tracking) with hand-drawn emerald underline on "lives.", slash-separated mono meta line, solid black primary CTA. Product preview is a clean framed data view (no fake traffic-light window chrome) with hairline borders, mono labels, dotted emerald annotation callout "scan-based / not real-time". Removed all gradient blobs; kept a faint dot-grid only in hero.
  - stats-strip.tsx — mono labels, hairline grid, mono caption.
  - problem.tsx — NumberedSection (01 / The gap), hairline grid of pain cards, one inverted black card for the core question.
  - features.tsx — NumberedSection (02), bento grid with hairline cards + refined mini visuals (table/detail/scan/changes/insights), mono tags.
  - how-it-works.tsx — NumberedSection (03), 4 numbered step cards, dashed honesty callout with MonoTags.
  - personas.tsx — NumberedSection (04), persona cards with mono labels, emerald ring on primary persona.
  - principles.tsx — NumberedSection (05), principle figures with blockquotes, inverted black "Linear-fast. Figma-fluent." card.
  - scope.tsx — NumberedSection (06), in/out scope cards + milestone roadmap + future opportunities.
  - faq.tsx — NumberedSection (07), refined accordion (still framer-motion, aria-expanded).
  - cta.tsx — solid black CTA card with dot-grid bg, mono trust line, emerald ping dot.
  - site-footer.tsx — solid logo mark, mono labels, mono data-scope disclaimer, mono bottom bar.
- Ran `bun run lint` — clean.
- Dev server: 200s, no runtime errors (one transient 500 during fast-refresh, resolved).

Verification with agent-browser + VLM (glm-4.6v):
- Desktop hero VLM: 8/10 — "Polished & distinctive, minimalist Vercel-inspired but unique... avoids generic SaaS bloat... strong typography hierarchy... clean/refined product preview... better than typical generic SaaS."
- Full-page desktop VLM: 9/10 — "visual language consistent across all sections (numbered mono labels, hairline borders, no heavy gradients)... footer complete and well-aligned... no broken/misaligned sections... cohesive and premium."
- Mobile (390px) VLM: 8/10 — "hero wraps cleanly, no overflow, CTAs fit... product preview renders without horizontal overflow... no mobile layout problems."
- FAQ accordion: clicking toggles aria-expanded correctly, answer text shows.
- Mobile menu: hamburger opens with aria-expanded=true and full Mobile nav.
- Footer: well-aligned at bottom, complete.

Stage Summary:
- LANDING REDESIGN COMPLETE and verified. Distinctive minimalist aesthetic: DM Sans/DM Mono, near-black-on-warm-white, emerald as restrained single accent, numbered editorial sections (01–07), hairline borders, mono metadata labels, solid black CTA card. VLM ratings 8–9/10. No gradient blobs, no generic SaaS feel.
- Dashboard build (started this round) is PAUSED — mock-data.ts, store/app-store.ts, dashboard sidebar/topbar/shell/primitives/overview-page exist but are NOT yet wired into page.tsx. Next phase should resume dashboard build and wire it via the view-state store.

Unresolved / next-phase priorities:
1. Resume dashboard build: wire DashboardShell into page.tsx via useAppStore.view toggle; build remaining pages (components table + detail drawer, files, scans, insights, settings) — the OverviewPage already exists.
2. Apply the same redesigned minimalist visual language (DM Sans, mono labels, hairlines, emerald accent) to the dashboard pages for consistency.
3. Wire landing CTAs ("Open dashboard") to switch view to dashboard.
4. Consider dark mode toggle (PRD nice-to-have).

---
Task ID: 4
Agent: main (orchestrator) — user-requested dashboard build
Task: Build the complete dashboard frontend for Componently based on the PRD (frontend only, mock data, no backend). Apply the redesigned minimalist visual language (DM Sans, mono labels, hairline borders, emerald accent).

Work Log:
- Reviewed existing dashboard scaffolding from round 3 (mock-data.ts, store/app-store.ts, dashboard sidebar/topbar/shell/primitives, overview-page) — aligned all to the new minimalist language.
- Updated dashboard-sidebar.tsx: solid foreground logo mark (matching landing), mono "v1.0" tag, .label-mono section labels, foreground active nav state, mono badges, refined source UI Kit card.
- Updated dashboard-topbar.tsx: mono "latest scan" line, foreground "scan all" button, emerald scan-complete state, removed unused imports.
- Updated primitives.tsx (MetricCard): switched label to .label-mono, delta to font-mono. Fixed a PageHeader template bug.
- Updated dashboard-shell.tsx: mobile logo mark now solid foreground SVG grid, removed unused Boxes import.
- Built all 5 remaining dashboard pages (frontend-only, mock-data-driven):
  - components-page.tsx — searchable/filterable/sortable table (search by name/set, status filter All/Active/Low/Unused, set filter dropdown, sortable columns with asc/desc indicators). Clicking a row opens a right-side detail SHEET (w-xl/2xl) with 5 tabs: Overview (stats + top files + open in Figma), Files (per-file usage with status), Instances (instance location list), Trend (recharts area chart per component), Metadata (key/value dl). Empty states for unused components.
  - files-page.tsx — registered files table (name, team, instances, components, status, last scan, rescan action) + status filter chips + "Add files" sheet (textarea for paste links, validate UX). File detail sheet: stats (instances, unique components, adoption %, last scanned), components-used list, Open in Figma + Rescan buttons, metadata dl.
  - scans-page.tsx — snapshot summary strip (6 snapshots), scan history with expandable rows (status icon, scope, started, duration, ok/failed counts), expanded detail shows error message for failed scans + Retry/Resume buttons + View snapshot. Scan policy disclaimer.
  - insights-page.tsx — 5 insight summary stat cards (Unused/Low/Most used/Stale/Failed), 6 panels: Unused components, Low usage (with counts), Most used (with progress bars), Recent changes (with change-type pills), Stale files, Failed scans. Thresholds disclaimer.
  - settings-page.tsx — 4 sections: Figma access (connected token, replace/disconnect), Source UI Kit (file name, refresh/replace, 4 stats), Usage thresholds (low-usage + stale-days range sliders with live values), Scan configuration (auto-scan toggle, preserve-on-failure switch). Data freshness disclaimer.
- Wired landing<->dashboard view toggle in src/app/page.tsx via useAppStore.view ("landing" | "dashboard"). Zustand store persists view + dashboardPage to localStorage.
- Wired landing CTAs to open the dashboard: site-header "Open dashboard" (desktop + mobile), hero "Start tracking", cta "Open the dashboard" — all call openDashboard("overview").
- Dashboard "back to landing" (sidebar brand button + footer link) calls backToLanding().

Bug found & fixed during QA:
- scans-page.tsx used formatNumber() but didn't import it → runtime ReferenceError ("formatNumber is not defined") crashed the Scans page on render. Fixed by adding formatNumber to the import. Root cause: the page was rendered via persisted view state ("scans"), surfacing the error immediately on reload.

Verification with agent-browser + VLM:
- Landing → "Start tracking" → dashboard Overview renders: sidebar (Overview/Components 248/Files 42/Scans/Insights 38/Settings), topbar (search + scan all), metric cards, instance trend area chart (emerald fill confirmed visible), scan status, top used components, recent changes, health alerts. No errors.
- Components page: search + status filters work (Unused filter → 2 rows), sorting works, row click opens detail sheet with 5 tabs (Overview/Files/Instances/Trend/Metadata), tab switching works.
- Files page: table renders, status filter chips work, "Add files" sheet opens, file detail sheet opens (components used, Open in Figma, Rescan).
- Scans page: snapshot strip + scan history render, expandable rows show error + Retry for failed scans.
- Insights page: 5 stat cards + 6 panels render (unused, low usage, most used with bars, recent changes, stale, failed).
- Settings page: 4 sections render, range sliders + toggles interactive.
- "Back to landing" returns to landing hero.
- Mobile (390px): hamburger menu opens drawer with full nav, content renders without horizontal overflow, layout usable.
- VLM overall dashboard quality: 9/10 — "clean, minimalist, consistent (DM Sans, mono labels, hairline borders, emerald accent), no broken layouts/overflow/missing content, avoids generic SaaS feel."
- `bun run lint` — clean.

Stage Summary:
- DASHBOARD COMPLETE (frontend-only, mock data). All 6 pages built and verified: Overview, Components (with detail sheet + 5 tabs), Files (with detail sheet + add-files sheet), Scans (with expandable history), Insights (6 governance panels), Settings (4 config sections with live sliders/toggles). Landing<->dashboard navigation wired and persisted. Same minimalist visual language as the redesigned landing.
- No backend — all data from src/lib/mock-data.ts (realistic PRD-aligned seed data: 28 components, 15 files, 6 scans, 8 changes, 6 snapshots). Ready to swap for Prisma + Figma API later.

Unresolved / next-phase priorities:
1. Backend: replace mock-data selectors with Prisma models + Figma API scan logic (read-only).
2. The topbar search input is present but not yet wired to filter the active page (cosmetic for now).
3. "Scan all" simulates progress client-side; real scan needs backend job runner.
4. Consider dark mode toggle (PRD nice-to-have) — tokens already defined in globals.css .dark.
5. CSV export, scheduled scan, command menu (⌘K) are future enhancements per PRD.

---
Task ID: 5
Agent: main (orchestrator) — user-requested backend build
Task: Build the complete backend for Componently using SQLite (Prisma). Frontend untouched — backend tested independently via curl only.

Work Log:
- Designed Prisma schema (prisma/schema.prisma) with 8 models aligned to PRD data model:
  - SourceUiKit (1 source design system file; MVP tracks one)
  - Component (from source UI Kit; unique on [sourceUiKitId, figmaNodeKey])
  - RegisteredFile (consumer Figma files to track; unique figmaFileKey; disabled flag)
  - ScanJob (executions; scope all/single; status Pending/Running/Success/Failed/Paused)
  - Snapshot (one per successful scan; powers latest dashboard + trend)
  - ComponentUsage (per snapshot × component × file instance count — core fact table)
  - Change (detected diffs between latest & previous snapshot; type Newly Used/Increased/Decreased/Removed)
  - Setting (key/value app config)
  - All relations + cascades + indexes (sqlite) configured.
- Ran `bun run db:push` — SQLite tables created at db/custom.db, Prisma client generated.
- Created prisma/seed.ts (run via `bun run db:seed`): seeds 1 source UI kit, 28 components across 8 sets, 15 registered files across teams, 9 scan jobs (Success/Failed/Paused), 4 snapshots with full ComponentUsage rows, 52 change records (auto-computed from latest vs previous snapshot), 6 settings. Includes change-detection logic that diffs the last two snapshots.
- Added `db:seed` script to package.json.
- Created src/lib/api.ts — backend query helpers:
  - getLatestSnapshot / getPreviousSnapshot (latest scan powers dashboard; previous powers change detection)
  - getThresholds (from Settings, with defaults)
  - computeComponentStatus (Active/Low Usage/Unused/Not Scanned from instance count + thresholds)
  - computeFileStatus (Healthy/Low Adoption/Zero Usage/Failed/Stale/Not Scanned/Disabled from adoption + freshness + scan history)
  - getComponentsWithUsage / getFilesWithUsage (aggregate ComponentUsage from latest snapshot into per-entity summaries)
  - json / qs / qi response helpers
- Built 9 API route groups (Next.js App Router, src/app/api/):
  - GET /api/overview — dashboard summary (totals, last scan, adoption, health alerts)
  - GET/POST/PATCH /api/source-ui-kit — current source UI Kit, register/replace, refresh inventory
  - GET /api/components (+ filters: search, status, set, sort, dir) + GET /api/components/:id (detail with per-file usage + trend)
  - GET/POST /api/files (+ filters) + GET/PATCH/DELETE /api/files/:id (detail with components-used, disable/enable, remove)
  - GET/POST /api/scans (+ filters) + GET/PATCH /api/scans/:id (detail, retry/resume via PATCH action)
  - GET /api/snapshots + GET /api/snapshots/:id (full per-component-per-file usage)
  - GET /api/changes (recent changes with type filter)
  - GET /api/insights (unused/lowUsage/mostUsed/staleFiles/failedScans/recentChanges summary)
  - GET/PUT /api/settings (figma access, thresholds, scan config — upsert)

Backend verification (curl, independent of frontend — frontend NOT touched):
- All 9 GET collection endpoints return 200: overview, source-ui-kit, components, files, scans, snapshots, changes, insights, settings.
- Filters work: components?status=Unused → 5 results; files?status=Failed → 1; scans?status=Success; changes?type=Increased.
- Detail routes work: components/:id (name, status, per-file usage, 4-point trend), files/:id (adoption + components-used), scans/:id, snapshots/:id (57 usage rows for latest).
- POST /api/scans {scope:all} → 201, creates Pending job labelled "Scan #10".
- POST /api/files {files:[...]} → 201, added 1 + skipped 1 duplicate (with reason).
- PATCH /api/scans/:id {action:retry} → flipped Failed → Pending.
- PUT /api/settings {lowUsageThreshold:750} → persisted and propagated to /api/insights thresholds.
- Error handling: GET /api/components/nonexistent → 404; POST /api/scans {scope:invalid} → 400; POST /api/scans {scope:single} (no targetFileId) → 400.
- Re-seeded DB clean after testing.
- `bun run lint` — clean. No runtime errors in dev.log.

Stage Summary:
- BACKEND COMPLETE (SQLite + Prisma + Next.js API routes). 8 models, 9 route groups, ~15 endpoints. Fully tested via curl — all return correct data and status codes. Realistic seed data (28 components, 15 files, 9 scans, 4 snapshots, 52 changes). Change detection auto-computes from snapshot diffs. Settings persist. Frontend is UNTOUCHED (still uses src/lib/mock-data.ts) — backend is decoupled and ready to be wired in when desired.

Unresolved / next-phase priorities:
1. Wire frontend to call /api/* instead of src/lib/mock-data.ts (replace mock-data selectors with fetch calls — the response shapes are intentionally compatible).
2. Implement the actual scan worker: POST /api/scans currently creates a Pending job but doesn't run it. Real backend needs a Figma API integration that reads component instances from registered files and writes ComponentUsage rows + a Snapshot on success.
3. Add a scan status poll endpoint or SSE for real-time progress.
4. Add CSV export endpoints (PRD future).
5. Authentication / Figma token storage is stubbed in Settings — needs secure secret storage.

---
Task ID: 6
Agent: main (orchestrator) — connect frontend to backend
Task: Connect the existing frontend to the existing SQLite backend (API routes). Both were ready; this round wires them together with zero breakage.

Work Log:
- Set up TanStack Query: created src/components/providers.tsx (QueryClientProvider with 30s staleTime, no refetch-on-focus), wrapped app in layout.tsx. Added Sonner Toaster for mutation toasts.
- Created src/lib/api-client.ts — typed fetch layer with:
  - Types matching all API response shapes (OverviewStats, SourceUiKit, ComponentItem/Detail, FileItem/Detail, ScanItem, SnapshotItem, ChangeItem, InsightsData, Settings).
  - Query hooks: useOverview, useSourceUiKit, useComponents(params), useComponent(id), useFiles(params), useFile(id), useScans(params), useSnapshots, useChanges(params), useInsights, useSettings.
  - Mutation hooks: useStartScan, useRetryScan, useAddFiles, useUpdateSettings, useRefreshSourceUiKit, useUpdateFile — each with targeted query invalidation (overview/components/files/scans/snapshots/changes/insights as relevant).
- Created src/components/dashboard/loading-states.tsx (LoadingRows, LoadingGrid, ErrorBanner) for consistent loading/error UX.
- Wired every dashboard component to live data:
  - dashboard-sidebar.tsx: useOverview (badges) + useSourceUiKit (source UI Kit card).
  - dashboard-topbar.tsx: useOverview (last-scan line) + useStartScan (real POST /api/scans, toast feedback). Removed the old simulated scan-progress state.
  - overview-page.tsx: useOverview + useComponents(top 5) + useChanges + useScans(latest) + useSnapshots (instance-trend chart from real snapshot history). Loading/error states.
  - components-page.tsx: useComponents(search/status/set/sort/dir) with 250ms debounced search — server-side filtering. useComponent(id) for the detail sheet (fetches on row click). Adapted detail sheet to API's flat fileUsage shape + real trend data. Loading/error/empty states.
  - files-page.tsx: useFiles(search/status) + useFile(id) for detail + useSourceUiKit (adoption %) + useAddFiles mutation (parses pasted Figma links, POSTs, toast). Loading/error/empty states.
  - scans-page.tsx: useScans + useSnapshots + useRetryScan (PATCH /api/scans/:id action:retry) + useStartScan. Uses scan.label for display. Loading/error/empty states.
  - insights-page.tsx: single useInsights() fetch drives all 6 panels + summary cards + thresholds note. Loading/error states.
  - settings-page.tsx: useSettings + useSourceUiKit + useOverview + useUpdateSettings (PUT /api/settings) + useRefreshSourceUiKit (PATCH). Sliders/toggles call mutations live.
- Cleaned up app-store.ts: removed the now-unused scan-simulation state (scanRunning/scanProgress/startScan/finishScan) since scanning is now a real API mutation.
- Fixed seed data inconsistency: scan filesOk numbers now ≤ 15 (registered file count) so the overview progress bar renders correctly. Added `label` field to the scans API response for clean display.
- Lint clean.

Verification (agent-browser + VLM, all with LIVE backend data):
- Overview: metric cards show 28 components / 15 files / 7,241 instances / 5 unused (matches /api/overview). Instance-trend chart renders from real snapshots (+11.1% over 4 scans). Scan status 13/15 files. VLM 9/10.
- Sidebar badges: Components 28 / Files 15 / Insights 5 (live). Topbar: "latest scan · 1h ago · Scan #128" (live).
- Components: 28 rows load; Unused filter → 5 rows (server-side); row click opens detail sheet with real fileUsage + trend chart (verified Trend tab renders recharts from API trend array).
- Files: 15 rows with real statuses (Admin Console/Low Adoption/266 instances). Detail sheet fetches componentsUsed.
- Scans: scan history loads with labels (Scan #128 etc.); failed scans show error + Retry button (wired to useRetryScan).
- Insights: 5 Unused / 18 Low usage / 8 Most used / 1 Stale / 1 Failed (matches /api/insights). Thresholds note shows live values.
- Settings: sliders show live values (low-usage=500); verified PUT /api/settings persists (changed to 750, UI refetched and showed 750, then restored).
- Mutations verified end-to-end: topbar "scan all" → POST /api/scans created a new job (scan count went 9→13 during testing) + toast "Scan started" + queries invalidated.
- Mobile (390px): renders without horizontal overflow, real data visible.
- No console errors, no broken/loading-forever areas.

Stage Summary:
- FRONTEND ↔ BACKEND FULLY CONNECTED. Every dashboard page now reads from /api/* via TanStack Query and writes via mutations. The old src/lib/mock-data.ts is no longer imported by any dashboard component (only its type definitions are reused for status unions). Loading skeletons, error banners, empty states, and toast notifications are in place. Scan trigger, retry, add-files, settings update, and source-UI-Kit refresh all hit the real API and refetch affected queries. Lint clean, no runtime errors, VLM 9/10.

Unresolved / next-phase priorities:
1. The actual scan worker still doesn't run (POST /api/scans creates a Pending job but nothing executes it against Figma). Next: add a Figma API integration that processes Pending jobs, writes ComponentUsage + a Snapshot, and flips status to Success/Failed.
2. The topbar search input is present but not wired to filter the active page (cosmetic).
3. CSV export, scheduled scans, command menu (⌘K) — PRD future enhancements.
4. Dark mode toggle (tokens already defined in globals.css).

---
Task ID: 7
Agent: main (orchestrator) — make Figma PAT + source UI Kit replace/disconnect functional
Task: User requested the ability to disconnect and replace the Figma PAT, and replace the source UI Kit. Implement full-stack: API endpoints, mutations, and dialog UIs.

Work Log:
- Created src/app/api/settings/figma-token/route.ts:
  - PUT /api/settings/figma-token { token } — validates (min 8 chars), masks the token (prefix + last 4), upserts figma_connected=true + figma_token_hint. Never stores the full token.
  - DELETE /api/settings/figma-token — sets figma_connected=false, clears figma_token_hint.
- Updated POST /api/source-ui-kit (src/app/api/source-ui-kit/route.ts) to PRESERVE the component inventory on replace: rejects duplicate file key (409), creates the new kit, re-assigns all Components from the old kit to the new one (updateMany), deletes the old kit, updates componentCount, returns the refreshed kit with actualComponentCount.
- Added 3 API client mutation hooks (src/lib/api-client.ts):
  - useReplaceFigmaToken(token) → PUT /api/settings/figma-token; updates settings query cache.
  - useDisconnectFigma() → DELETE /api/settings/figma-token; updates settings query cache.
  - useReplaceSourceUiKit({fileName, figmaFileKey, url}) → POST /api/source-ui-kit; updates source-ui-kit cache + invalidates overview.
- Wired Settings page (src/components/dashboard/pages/settings-page.tsx):
  - Figma access section now shows connected (green check) vs disconnected (amber alert) states with the live token hint. Connected state shows "Replace token" + "Disconnect"; disconnected shows "Connect token".
  - Disconnect button calls useDisconnectFigma with toast feedback.
  - ReplaceTokenDialog: Radix dialog with password input, validation (min 8 chars), masked-hint note, calls useReplaceFigmaToken, toast on success.
  - ReplaceSourceUiKitDialog: Radix dialog with Figma URL input + display name input (auto-derives name from the URL file key), validates URL format, calls useReplaceSourceUiKit, toast on success. Description warns the existing kit will be replaced (inventory preserved).
  - Source UI Kit "Replace" button opens the dialog.
- Lint clean.

Verification (curl backend + agent-browser UI):
- PUT figma-token (curl): replaced token → hint updated to "figd_newPA••••2345", figmaConnected=true. ✓
- DELETE figma-token (curl): figmaConnected=false, hint cleared. ✓
- POST source-ui-kit (curl): new kit created, 28 components preserved (componentCount=28, actualComponentCount=28), old kit deleted. ✓
- UI — Replace token: opened dialog, filled token, clicked "Save token" → API hint updated to "figd_testP••••2345", toast "Figma token updated", dialog closed. ✓
- UI — Disconnect: clicked "Disconnect" → API figmaConnected=false, UI switched to "Connect token" state. ✓
- UI — Connect (from disconnected): opened dialog, filled token, saved → API figmaConnected=true. ✓
- UI — Replace source UI Kit: opened dialog, filled URL "https://www.figma.com/file/acme-ui-kit-v5-next" (display name auto-derived), clicked "Replace source" → API returned new kit "Acme Design System — UI Kit v5" fileKey acme-ui-kit-v5-next, 28 components preserved, toast "Source UI Kit replaced", sidebar source-UI-Kit card updated to the new name. ✓
- No console/runtime errors. VLM Settings page 8/10.

Stage Summary:
- Figma PAT connect/replace/disconnect AND source UI Kit replace are now fully functional end-to-end. The token is never stored in full (only a masked hint), and replacing the source UI Kit preserves the component inventory + historical snapshots/usage. All flows have loading states + toast feedback + query cache invalidation. Re-seeded DB to restore original data after testing.

Unresolved / next-phase priorities:
1. The scan worker still doesn't execute Pending jobs against Figma (POST /api/scans creates the job; a real Figma API integration would process it).
2. Add a confirm dialog before Disconnect (currently immediate — acceptable but a confirm is nicer).
3. CSV export, scheduled scans, command menu (⌘K) — PRD future enhancements.
