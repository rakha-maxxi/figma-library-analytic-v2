/**
 * Mock data for the Componently dashboard.
 * Realistic, PRD-aligned. Scoped to registered files & latest scan.
 *
 * NOTE: This is static seed data for the MVP front-end. A future backend
 * (Prisma + Figma API) will replace these selectors.
 */

export type ComponentStatus =
  | "Active"
  | "Low Usage"
  | "Unused"
  | "Not Scanned";

export type FileStatus =
  | "Healthy"
  | "Low Adoption"
  | "Zero Usage"
  | "Failed"
  | "Stale"
  | "Not Scanned"
  | "Disabled";

export type ScanStatus =
  | "Pending"
  | "Running"
  | "Success"
  | "Failed"
  | "Paused";

export type ChangeType = "Newly Used" | "Increased" | "Decreased" | "Removed" | "No Change";

export interface DSComponent {
  id: string;
  name: string;
  set: string;
  description: string;
  totalInstances: number;
  filesUsed: number;
  status: ComponentStatus;
  lastSeen: string; // ISO
  prevInstances: number; // for change detection
  figmaNodeKey?: string;
}

export interface RegisteredFile {
  id: string;
  name: string;
  url: string;
  team: string;
  totalInstances: number;
  uniqueComponents: number;
  status: FileStatus;
  lastScanned: string | null; // ISO
  disabled?: boolean;
}

export interface ScanJob {
  id: string;
  target: string; // file name or "All files"
  scope: "all" | "single";
  status: ScanStatus;
  startedAt: string; // ISO
  finishedAt: string | null; // ISO
  durationMs: number | null;
  filesOk: number;
  filesFailed: number;
  error?: string;
}

export interface ChangeEvent {
  id: string;
  componentName: string;
  fileName: string;
  previous: number;
  current: number;
  type: ChangeType;
  scanId: string;
  at: string; // ISO
}

export interface Snapshot {
  id: string;
  label: string;
  at: string; // ISO
  filesScanned: number;
  totalInstances: number;
  componentsUsed: number;
}

/* -------------------------------------------------------------------------- */
/* Source UI Kit                                                              */
/* -------------------------------------------------------------------------- */

export const sourceUiKit = {
  fileName: "Acme Design System — UI Kit v3",
  url: "https://www.figma.com/file/acme-ui-kit-v3",
  figmaFileKey: "acme-ui-kit-v3",
  connectedAt: "2026-02-14T09:12:00Z",
  componentCount: 248,
  lastSyncedAt: "2026-06-01T08:30:00Z",
};

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

const now = Date.now();
const hours = (h: number) => new Date(now - h * 3600_000).toISOString();
const days = (d: number) => new Date(now - d * 86_400_000).toISOString();

export const components: DSComponent[] = [
  { id: "c1", name: "Button / Primary", set: "Actions", description: "Primary call-to-action button", totalInstances: 3240, filesUsed: 38, status: "Active", lastSeen: hours(2), prevInstances: 3198, figmaNodeKey: "1:2" },
  { id: "c2", name: "Button / Secondary", set: "Actions", description: "Secondary action button", totalInstances: 2118, filesUsed: 35, status: "Active", lastSeen: hours(2), prevInstances: 2100, figmaNodeKey: "1:3" },
  { id: "c3", name: "Button / Ghost", set: "Actions", description: "Low-emphasis button", totalInstances: 884, filesUsed: 28, status: "Active", lastSeen: hours(2), prevInstances: 890, figmaNodeKey: "1:4" },
  { id: "c4", name: "Input / Text", set: "Forms", description: "Standard text input field", totalInstances: 2812, filesUsed: 36, status: "Active", lastSeen: hours(3), prevInstances: 2794, figmaNodeKey: "2:1" },
  { id: "c5", name: "Input / Number", set: "Forms", description: "Numeric input with stepper", totalInstances: 612, filesUsed: 19, status: "Low Usage", lastSeen: hours(3), prevInstances: 618, figmaNodeKey: "2:2" },
  { id: "c6", name: "Select / Single", set: "Forms", description: "Single-choice dropdown", totalInstances: 1140, filesUsed: 24, status: "Active", lastSeen: hours(3), prevInstances: 1122, figmaNodeKey: "2:3" },
  { id: "c7", name: "Checkbox", set: "Forms", description: "Standard checkbox", totalInstances: 1560, filesUsed: 30, status: "Active", lastSeen: hours(3), prevInstances: 1560, figmaNodeKey: "2:4" },
  { id: "c8", name: "Modal / Confirm", set: "Overlay", description: "Confirmation dialog", totalInstances: 612, filesUsed: 22, status: "Low Usage", lastSeen: days(1), prevInstances: 618, figmaNodeKey: "3:1" },
  { id: "c9", name: "Modal / Form", set: "Overlay", description: "Form dialog with footer actions", totalInstances: 428, filesUsed: 16, status: "Low Usage", lastSeen: days(1), prevInstances: 410, figmaNodeKey: "3:2" },
  { id: "c10", name: "Toast / Success", set: "Feedback", description: "Success notification toast", totalInstances: 0, filesUsed: 0, status: "Unused", lastSeen: "—", prevInstances: 0, figmaNodeKey: "4:1" },
  { id: "c11", name: "Toast / Error", set: "Feedback", description: "Error notification toast", totalInstances: 142, filesUsed: 9, status: "Low Usage", lastSeen: days(2), prevInstances: 150, figmaNodeKey: "4:2" },
  { id: "c12", name: "Toast / Info", set: "Feedback", description: "Informational toast", totalInstances: 38, filesUsed: 4, status: "Low Usage", lastSeen: days(3), prevInstances: 44, figmaNodeKey: "4:3" },
  { id: "c13", name: "Avatar / Single", set: "Identity", description: "Single user avatar", totalInstances: 1740, filesUsed: 31, status: "Active", lastSeen: hours(2), prevInstances: 1700, figmaNodeKey: "5:1" },
  { id: "c14", name: "Avatar / Stack", set: "Identity", description: "Stacked avatars with overflow", totalInstances: 874, filesUsed: 19, status: "Active", lastSeen: hours(2), prevInstances: 865, figmaNodeKey: "5:2" },
  { id: "c15", name: "Badge / Count", set: "Identity", description: "Numeric count badge", totalInstances: 1320, filesUsed: 26, status: "Active", lastSeen: hours(3), prevInstances: 1300, figmaNodeKey: "5:3" },
  { id: "c16", name: "Badge / Status", set: "Identity", description: "Status indicator badge", totalInstances: 980, filesUsed: 23, status: "Active", lastSeen: hours(3), prevInstances: 980, figmaNodeKey: "5:4" },
  { id: "c17", name: "Tabs / Top", set: "Navigation", description: "Top-aligned tab bar", totalInstances: 712, filesUsed: 21, status: "Active", lastSeen: hours(4), prevInstances: 700, figmaNodeKey: "6:1" },
  { id: "c18", name: "Tabs / Side", set: "Navigation", description: "Vertical side tabs", totalInstances: 198, filesUsed: 8, status: "Low Usage", lastSeen: days(2), prevInstances: 204, figmaNodeKey: "6:2" },
  { id: "c19", name: "Breadcrumb", set: "Navigation", description: "Page hierarchy breadcrumb", totalInstances: 540, filesUsed: 18, status: "Active", lastSeen: hours(5), prevInstances: 540, figmaNodeKey: "6:3" },
  { id: "c20", name: "Pagination", set: "Navigation", description: "Table pagination control", totalInstances: 410, filesUsed: 14, status: "Low Usage", lastSeen: days(1), prevInstances: 410, figmaNodeKey: "6:4" },
  { id: "c21", name: "Card / Container", set: "Layout", description: "Generic content card", totalInstances: 2210, filesUsed: 34, status: "Active", lastSeen: hours(2), prevInstances: 2180, figmaNodeKey: "7:1" },
  { id: "c22", name: "Card / Stat", set: "Layout", description: "Metric/stat display card", totalInstances: 988, filesUsed: 25, status: "Active", lastSeen: hours(3), prevInstances: 960, figmaNodeKey: "7:2" },
  { id: "c23", name: "Divider", set: "Layout", description: "Horizontal/vertical divider", totalInstances: 1640, filesUsed: 33, status: "Active", lastSeen: hours(2), prevInstances: 1640, figmaNodeKey: "7:3" },
  { id: "c24", name: "Tooltip", set: "Overlay", description: "Hover tooltip", totalInstances: 1120, filesUsed: 27, status: "Active", lastSeen: hours(4), prevInstances: 1100, figmaNodeKey: "3:3" },
  { id: "c25", name: "Popover", set: "Overlay", description: "Floating popover panel", totalInstances: 462, filesUsed: 15, status: "Low Usage", lastSeen: days(1), prevInstances: 470, figmaNodeKey: "3:4" },
  { id: "c26", name: "Skeleton / Text", set: "Feedback", description: "Text loading skeleton", totalInstances: 0, filesUsed: 0, status: "Unused", lastSeen: "—", prevInstances: 0, figmaNodeKey: "4:4" },
  { id: "c27", name: "Empty State", set: "Feedback", description: "Generic empty state", totalInstances: 96, filesUsed: 7, status: "Low Usage", lastSeen: days(4), prevInstances: 102, figmaNodeKey: "4:5" },
  { id: "c28", name: "Progress / Bar", set: "Feedback", description: "Linear progress bar", totalInstances: 318, filesUsed: 12, status: "Low Usage", lastSeen: days(1), prevInstances: 318, figmaNodeKey: "4:6" },
];

// Components used per file (fileId -> componentId[] with counts)
export const fileComponentUsage: Record<
  string,
  { componentId: string; instances: number; page?: string }[]
> = {
  f1: [
    { componentId: "c1", instances: 412, page: "Checkout" },
    { componentId: "c2", instances: 286, page: "Checkout" },
    { componentId: "c4", instances: 380, page: "Checkout" },
    { componentId: "c7", instances: 210, page: "Checkout" },
    { componentId: "c13", instances: 142, page: "Account" },
    { componentId: "c21", instances: 264, page: "Checkout" },
    { componentId: "c22", instances: 88, page: "Dashboard" },
    { componentId: "c23", instances: 150, page: "Checkout" },
  ],
  f2: [
    { componentId: "c1", instances: 288, page: "Onboarding" },
    { componentId: "c4", instances: 240, page: "Onboarding" },
    { componentId: "c6", instances: 96, page: "Onboarding" },
    { componentId: "c14", instances: 120, page: "Team" },
    { componentId: "c17", instances: 64, page: "Onboarding" },
    { componentId: "c21", instances: 180, page: "Onboarding" },
  ],
  f3: [
    { componentId: "c2", instances: 176, page: "Settings" },
    { componentId: "c4", instances: 158, page: "Settings" },
    { componentId: "c5", instances: 42, page: "Settings" },
    { componentId: "c7", instances: 90, page: "Settings" },
    { componentId: "c19", instances: 36, page: "Settings" },
  ],
};

/* -------------------------------------------------------------------------- */
/* Files                                                                      */
/* -------------------------------------------------------------------------- */

export const files: RegisteredFile[] = [
  { id: "f1", name: "Checkout Web", url: "https://www.figma.com/file/checkout-web", team: "Commerce", totalInstances: 1932, uniqueComponents: 28, status: "Healthy", lastScanned: hours(2) },
  { id: "f2", name: "Onboarding Mobile", url: "https://www.figma.com/file/onboarding-mobile", team: "Growth", totalInstances: 988, uniqueComponents: 22, status: "Healthy", lastScanned: hours(2) },
  { id: "f3", name: "Settings v3", url: "https://www.figma.com/file/settings-v3", team: "Platform", totalInstances: 502, uniqueComponents: 18, status: "Healthy", lastScanned: hours(3) },
  { id: "f4", name: "Dashboard Analytics", url: "https://www.figma.com/file/dashboard-analytics", team: "Insights", totalInstances: 1410, uniqueComponents: 24, status: "Healthy", lastScanned: hours(3) },
  { id: "f5", name: "Profile & Account", url: "https://www.figma.com/file/profile-account", team: "Platform", totalInstances: 720, uniqueComponents: 20, status: "Healthy", lastScanned: hours(4) },
  { id: "f6", name: "Admin Console", url: "https://www.figma.com/file/admin-console", team: "Internal", totalInstances: 318, uniqueComponents: 14, status: "Low Adoption", lastScanned: hours(5) },
  { id: "f7", name: "Marketing Site", url: "https://www.figma.com/file/marketing-site", team: "Marketing", totalInstances: 1240, uniqueComponents: 19, status: "Healthy", lastScanned: hours(5) },
  { id: "f8", name: "Email Templates", url: "https://www.figma.com/file/email-templates", team: "Marketing", totalInstances: 286, uniqueComponents: 9, status: "Low Adoption", lastScanned: days(1) },
  { id: "f9", name: "Legacy Reports", url: "https://www.figma.com/file/legacy-reports", team: "Insights", totalInstances: 0, uniqueComponents: 0, status: "Zero Usage", lastScanned: days(1) },
  { id: "f10", name: "Mobile Wallet", url: "https://www.figma.com/file/mobile-wallet", team: "Commerce", totalInstances: 642, uniqueComponents: 17, status: "Healthy", lastScanned: days(2) },
  { id: "f11", name: "Auth Flow", url: "https://www.figma.com/file/auth-flow", team: "Platform", totalInstances: 0, uniqueComponents: 0, status: "Failed", lastScanned: days(2) },
  { id: "f12", name: "Notifications Center", url: "https://www.figma.com/file/notif-center", team: "Platform", totalInstances: 388, uniqueComponents: 12, status: "Stale", lastScanned: days(9) },
  { id: "f13", name: "Search Experience", url: "https://www.figma.com/file/search-exp", team: "Growth", totalInstances: 556, uniqueComponents: 16, status: "Stale", lastScanned: days(12) },
  { id: "f14", name: "Pricing & Plans", url: "https://www.figma.com/file/pricing", team: "Marketing", totalInstances: 0, uniqueComponents: 0, status: "Not Scanned", lastScanned: null },
  { id: "f15", name: "Help Center", url: "https://www.figma.com/file/help-center", team: "Support", totalInstances: 0, uniqueComponents: 0, status: "Disabled", lastScanned: days(30), disabled: true },
];

/* -------------------------------------------------------------------------- */
/* Scan jobs                                                                  */
/* -------------------------------------------------------------------------- */

export const scans: ScanJob[] = [
  { id: "s128", target: "All files", scope: "all", status: "Success", startedAt: hours(2), finishedAt: hours(1.7), durationMs: 1080000, filesOk: 37, filesFailed: 2 },
  { id: "s127", target: "All files", scope: "all", status: "Success", startedAt: days(1), finishedAt: days(0.96), durationMs: 1150000, filesOk: 39, filesFailed: 0 },
  { id: "s126", target: "Auth Flow", scope: "single", status: "Failed", startedAt: days(2), finishedAt: days(2), durationMs: 42000, filesOk: 0, filesFailed: 1, error: "403 Forbidden — token may have expired or file access was revoked." },
  { id: "s125", target: "All files", scope: "all", status: "Success", startedAt: days(3), finishedAt: days(2.96), durationMs: 1320000, filesOk: 40, filesFailed: 0 },
  { id: "s124", target: "Notifications Center", scope: "single", status: "Success", startedAt: days(9), finishedAt: days(9), durationMs: 64000, filesOk: 1, filesFailed: 0 },
  { id: "s123", target: "All files", scope: "all", status: "Paused", startedAt: days(5), finishedAt: null, durationMs: null, filesOk: 12, filesFailed: 0, error: "Rate limit reached. Scan will resume automatically." },
];

/* -------------------------------------------------------------------------- */
/* Recent changes (latest scan vs previous)                                  */
/* -------------------------------------------------------------------------- */

export const changes: ChangeEvent[] = [
  { id: "ch1", componentName: "Avatar / Stack", fileName: "Onboarding Mobile", previous: 0, current: 120, type: "Newly Used", scanId: "s128", at: hours(2) },
  { id: "ch2", componentName: "Button / Primary", fileName: "Checkout Web", previous: 370, current: 412, type: "Increased", scanId: "s128", at: hours(2) },
  { id: "ch3", componentName: "Card / Stat", fileName: "Dashboard Analytics", previous: 86, current: 102, type: "Increased", scanId: "s128", at: hours(2) },
  { id: "ch4", componentName: "Modal / Confirm", fileName: "Settings v3", previous: 48, current: 42, type: "Decreased", scanId: "s128", at: hours(2) },
  { id: "ch5", componentName: "Toast / Info", fileName: "Admin Console", previous: 12, current: 8, type: "Decreased", scanId: "s128", at: hours(2) },
  { id: "ch6", componentName: "Toast / Success", fileName: "Legacy Reports", previous: 6, current: 0, type: "Removed", scanId: "s128", at: hours(2) },
  { id: "ch7", componentName: "Input / Text", fileName: "Onboarding Mobile", previous: 220, current: 240, type: "Increased", scanId: "s128", at: hours(2) },
  { id: "ch8", componentName: "Tabs / Side", fileName: "Admin Console", previous: 24, current: 18, type: "Decreased", scanId: "s128", at: hours(2) },
];

/* -------------------------------------------------------------------------- */
/* Snapshots                                                                  */
/* -------------------------------------------------------------------------- */

export const snapshots: Snapshot[] = [
  { id: "s128", label: "Scan #128", at: hours(2), filesScanned: 37, totalInstances: 14820, componentsUsed: 210 },
  { id: "s127", label: "Scan #127", at: days(1), filesScanned: 39, totalInstances: 14508, componentsUsed: 206 },
  { id: "s125", label: "Scan #125", at: days(3), filesScanned: 40, totalInstances: 14310, componentsUsed: 204 },
  { id: "s122", label: "Scan #122", at: days(6), filesScanned: 38, totalInstances: 14020, componentsUsed: 198 },
  { id: "s119", label: "Scan #119", at: days(10), filesScanned: 36, totalInstances: 13760, componentsUsed: 192 },
  { id: "s115", label: "Scan #115", at: days(14), filesScanned: 34, totalInstances: 13410, componentsUsed: 188 },
];

/* -------------------------------------------------------------------------- */
/* Aggregated stats                                                           */
/* -------------------------------------------------------------------------- */

export const overviewStats = {
  totalComponents: 248,
  registeredFiles: 42,
  totalInstances: 14820,
  unusedComponents: 38,
  lowUsageComponents: 24,
  failedScans: 2,
  staleFiles: 6,
  lastScanAt: hours(2),
  lastScanLabel: "Scan #128",
  adoptionRate: 84.7, // % of registered files with healthy adoption
};

/* -------------------------------------------------------------------------- */
/* Trend data for charts (instances over snapshots)                          */
/* -------------------------------------------------------------------------- */

export const instanceTrend = [
  { scan: "#115", instances: 13410, components: 188 },
  { scan: "#119", instances: 13760, components: 192 },
  { scan: "#122", instances: 14020, components: 198 },
  { scan: "#125", instances: 14310, components: 204 },
  { scan: "#127", instances: 14508, components: 206 },
  { scan: "#128", instances: 14820, components: 210 },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export function getComponentById(id: string): DSComponent | undefined {
  return components.find((c) => c.id === id);
}

export function getFilesByComponent(componentId: string) {
  return Object.entries(fileComponentUsage)
    .map(([fileId, usages]) => {
      const u = usages.find((x) => x.componentId === componentId);
      if (!u) return null;
      const file = files.find((f) => f.id === fileId);
      return file ? { file, instances: u.instances, page: u.page } : null;
    })
    .filter(Boolean) as { file: RegisteredFile; instances: number; page?: string }[];
}

export function getComponentsByFile(fileId: string) {
  const usages = fileComponentUsage[fileId] ?? [];
  return usages
    .map((u) => {
      const c = getComponentById(u.componentId);
      return c ? { component: c, instances: u.instances, page: u.page } : null;
    })
    .filter(Boolean) as { component: DSComponent; instances: number; page?: string }[];
}

export function getChangeType(prev: number, curr: number): ChangeType {
  if (prev === 0 && curr > 0) return "Newly Used";
  if (curr === 0 && prev > 0) return "Removed";
  if (curr > prev) return "Increased";
  if (curr < prev) return "Decreased";
  return "No Change";
}
