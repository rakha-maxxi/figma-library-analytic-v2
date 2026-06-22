export const DASHBOARD_PAGES = [
  "overview",
  "components",
  "files",
  "scans",
  "insights",
  "settings",
] as const;

export type DashboardPage = (typeof DASHBOARD_PAGES)[number];

export const DASHBOARD_PAGE_META: Record<DashboardPage, { title: string; subtitle: string }> = {
  overview: {
    title: "Overview",
    subtitle: "Design system usage at a glance",
  },
  components: {
    title: "Components",
    subtitle: "Browse and search source components",
  },
  files: {
    title: "Files",
    subtitle: "Registered files & adoption",
  },
  scans: {
    title: "Scans",
    subtitle: "Scan history & job monitoring",
  },
  insights: {
    title: "Insights",
    subtitle: "Governance opportunities",
  },
  settings: {
    title: "Settings",
    subtitle: "Figma access & configuration",
  },
};

export function isDashboardPage(page: string): page is DashboardPage {
  return DASHBOARD_PAGES.includes(page as DashboardPage);
}
