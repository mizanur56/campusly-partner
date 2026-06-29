# Partner Portal Re-design — Design Update Documentation

This document records the **design updates implemented** in the Partner Portal across the six core pages outlined in the re-design specification. Each section maps to one page/area, lists what was updated in the UI, and notes the primary files involved.

**Design system (shared across pages):**
- Tailwind CSS utility layout with rounded cards (`rounded-2xl`), soft borders (`border-neutral-200/80`), and light shadows
- Brand green palette (`primary-*`, `#5fa836` / `#95d66d`)
- Lucide icons for navigation and actions
- Pill-style status badges (colored dot + label)
- Summary stat card grids at the top of list and detail pages
- Responsive layouts with sticky sidebars on large screens where applicable

---

## 1. Home Dashboard

**Route:** `/` (signed partner view)  
**Main files:**
- `src/pages/Dashboard/Dashboard.tsx`
- `src/pages/Dashboard/SignedDashboardView.tsx`
- `src/pages/Dashboard/signed/dashboard/*`

### Design updates

1. **Welcome hero banner**
   - Time-based greeting with partner name
   - Date chip and short descriptive subtitle
   - Entry point for primary actions (Add Student, New Application)

2. **Key metrics widgets (`KpiGrid`)**
   - Real-time KPI cards: Active Students, Applications, Accepted, Rejected, Pending Tasks
   - Colored top borders, icons, and decorative sparkline accents per card
   - Data loaded from `useGetPartnerDashboardQuery`

3. **Quick action buttons (`QuickActions`)**
   - Six-tile action grid:
     - Add Student
     - New Application
     - Browse Programs
     - Manage Tasks
     - Announcements
     - Payments
   - Each tile navigates to the relevant module

4. **Recent activity areas**
   - **Recent Applications** — table-style feed with university logo, program, intake, status badge, and date; rows link to application details
   - **Announcements Center** — latest announcements with “View all”
   - **Notification Center** — unread count, type-colored icons, relative timestamps, “Mark all read”

5. **Performance analytics**
   - **PerformanceAnalytics** — area chart with 6M / 12M range toggle
   - **StatusDonut** — donut breakdown of Accepted / In Progress / Rejected applications

6. **Task overview snippet (`TaskWidget`)**
   - Mini status counts with overdue and due-today labels

7. **Support & discovery panels**
   - **SupportPanelCard** — advisor contact details with mail/phone actions
   - **DiscoverRow** — top universities, subjects, and destinations

8. **Onboarding vs signed dashboard**
   - Pre-contract partners see an onboarding dashboard with step cards
   - Unlocked partners and team members see the full signed dashboard above

---

## 2. Student List Page

**Route:** `/students`  
**Main files:**
- `src/pages/Students/Students.tsx`
- `src/pages/Students/StudentProfile/*` (profile editing)

### Design updates

1. **Page header**
   - Breadcrumb navigation via `PageHeader`
   - “Add student” CTA for partner accounts (opens `CreateStudentModal`)

2. **Summary stat cards**
   - Four summary widgets at the top:
     - Total students
     - Active / With tasks
     - Inactive / Total tasks
     - Never logged in / No active tasks
   - Labels adapt for `PARTNER_TEAM_MEMBER` role

3. **Advanced filtering**
   - Search across name, email, phone, passport, assignee, and status
   - Status dropdown filter
   - Assignee dropdown filter
   - Filter / Clear toggle pattern

4. **Redesigned data table**
   - Custom table with gradient avatars
   - Status pills (colored dot + label)
   - Assignee display with icon
   - Last-login subtext
   - Row hover states, skeleton loaders, and empty state

5. **Pagination**
   - Page numbers with ellipsis
   - Rows-per-page selector (10 / 20 / 50)
   - “Showing X–Y of Z” range label

6. **Row actions**
   - Kebab menu → View Profile

7. **Team member variant**
   - Slimmer table (Student + Active Tasks columns only)

8. **Student contact editing**
   - Inline field editing is available on the **Student Profile** page (`GeneralInformationTab`), not directly in the list row
   - Edit mode with blur-to-save and per-field loading states

---

## 3. Application List Page

**Route:** `/applications`  
**Main files:**
- `src/pages/Applications/Applications.tsx`
- `src/pages/Applications/Applications.css`

### Design updates

1. **Page header**
   - Title and descriptive subtitle
   - “Find More Programs” CTA in brand green

2. **Summary stat cards**
   - Four `StatCard` widgets:
     - Total applications
     - Processing (derived)
     - Approved (`SUCCESS`)
     - Rejected

3. **Filtering**
   - Server-side search and status filter
   - Client-side filters: intake, university, sort order
   - Filter / Clear button group

4. **Application table redesign**
   - University logo circle
   - Program name and mono Application ID chip
   - Intake chip
   - **Dynamic status badges** — color-coded pill per status (`STATUS_CONFIG`)
   - Zebra striping and full-row click → application details

5. **Per-row actions**
   - View application
   - Edit (opens requirements tab)
   - Delete with confirmation modal

6. **Pagination**
   - Server-side page and limit controls
   - Custom footer pagination UI

### Not yet in this page (spec gap)

- Tabbed views (All / Drafts / Submitted / In Review / Accepted / Rejected)
- Bulk selection and bulk document download / status update

---

## 4. Application Details Page

**Route:** `/applications/:id`  
**Main files:**
- `src/pages/Applications/ApplicationDetails.tsx`
- `src/pages/Applications/components/details/*`
- `src/pages/Applications/components/ApplicationRequirementsTab.tsx`
- `src/pages/Applications/ApplicationStep/*`
- `src/pages/Applications/components/NotesTab.tsx`
- `src/pages/Applications/components/StudentRecordsTab.tsx`

### Design updates

1. **Two-column layout**
   - Main content (2/3) + sticky sidebar (1/3) on `xl` screens
   - Max width container (`max-w-[1400px]`) with back navigation

2. **Application summary header (`ApplicationSummaryHeader`)**
   - University logo, program title, status badge
   - Meta grid: Application ID, mode of study, intake, study type, student name
   - Refresh control for live data sync

3. **Next-step banner (`ApplicationNextStepBanner`)**
   - Highlights the current incomplete stage
   - “Continue” CTA scrolls to the document checklist section

4. **Application progress timeline (`ApplicationProgressPanel`)**
   - Vertical stepper for 7 journey stages:
     1. Admission
     2. Apply
     3. Checklist Upload
     4. Final Letter
     5. Embassy Submission
     6. Visa Outcome
     7. Enroll
   - Completed / current / upcoming visual states
   - Overall progress percentage bar
   - Rejection alert when application is rejected

5. **Tabbed detail view (`ApplicationTabBar`)**
   - **Documents** — application requirements and checklist (`?tab=requirements`)
   - **Student Records** — activity timeline (`?tab=records`)
   - **Notes** — partner notes and replies (`?tab=notes`)
   - URL-driven tab state for shareable links

6. **Document management hub (`ApplicationRequirementsTab`)**
   - “Application Checklist” card with icon header
   - Seven embedded journey stages rendered as collapsible sections
   - Each stage unlocks after the previous stage is complete
   - Auto-expands the first incomplete stage
   - Per-document upload, download, file size display, and attached-document expand/collapse
   - Stages: Admission, Apply, Checklist Upload, Final Letter, Embassy Submission, Visa Outcome, Enroll

7. **Student records timeline (`StudentRecordsTab`)**
   - Chronological activity entries with dates
   - Attachment download actions per record

8. **Notes / communication (`NotesTab`)**
   - Threaded notes with rich text (ReactQuill)
   - Reply, edit, and delete
   - Author avatars and timestamps

9. **Sidebar cards**
   - `ImportantNotesCard` — static guidance for partners
   - `NeedHelpCard` — contact support (mailto)

### Partial vs spec

- Dedicated “Communication Logs” tab (separate from Notes) is not implemented; Notes + Student Records cover most of this need
- `StudentInformationCard` and `UniversityCourseCard` are consolidated into the summary header (commented out in layout)

---

## 5. Task Management

**Routes:** `/task-management`, `/my-tasks`  
**Main files:**
- `src/pages/TaskManagement/TaskManagement.tsx`
- `src/pages/MyTasks/MyTasks.tsx`
- `src/pages/TaskManagement/components/PartnerTaskBoard.tsx`
- `src/pages/TaskManagement/ui/*`

### Design updates

1. **Page shell**
   - `PageHeader` with breadcrumbs
   - “Create Task” button on partner task management (hidden on My Tasks view)

2. **Overview metrics (`TaskOverviewMetrics`)**
   - Six KPI cards: Total, Completed, In Progress, Overdue, Team Productivity %, Completion Rate %

3. **Multiple view modes (`TaskFiltersBar`)**
   - Kanban (default)
   - List
   - Calendar
   - Timeline

4. **Filtering**
   - Search, status, priority, department
   - `AdminFilterDrawer`: due date range, assigned to/by, completion state

5. **Task assignment (`TaskFormModal`)**
   - Assignee dropdown populated from `useGetAssigneesQuery`
   - Create and edit task with title, description, priority, due date, and assignee

6. **Due date alerts**
   - `TaskNotificationCenter` in board sidebar:
     - Overdue tasks (rose / red styling)
     - Upcoming tasks (due within 3 days)
     - Recent updates
   - `isTaskOverdue` and `formatDueLabel` utilities for consistent due-date display
   - Dashboard `TaskWidget` surfaces overdue and due-today counts

7. **Task actions**
   - View, Edit, Complete, Cancel, Delete (with modals)
   - CSV export
   - AI-style summary modal

8. **Activity sidebar**
   - `TaskQuickActions` — shortcuts
   - `TaskActivityTimeline` — recent task events

9. **Visual style**
   - Glass-morphism card pattern (`GlassCard`) on kanban columns and task cards

---

## 6. Payment

**Route:** `/payments`  
**Main files:**
- `src/pages/Payments/Payments.tsx`
- `src/pages/Payments/components/PaymentStatCard.tsx`
- `src/pages/Payments/components/EarningsChart.tsx`
- `src/pages/Payments/components/PaymentsEmptyState.tsx`

### Design updates

1. **Section switcher**
   - Segmented control: **Purchases** vs **Commission**

2. **Summary stat cards (`PaymentStatCard`)**
   - **Purchases:** outstanding count, paid count, selected total
   - **Commission:** unpaid, paid, earned, payout rate

3. **Earnings / spending chart (`EarningsChart`)**
   - Time-series chart from completed transactions
   - Context switches between spending (purchases) and earnings (commission)

4. **Purchases sub-tabs**
   - **Applications** — payable application fees table
   - **Transaction History** — past purchase transactions

5. **Commission sub-tabs**
   - **Unpaid Commission** — pending commission rows
   - **Transaction History** — past commission payouts

6. **Payment applications table**
   - Fee, waiver %, payable amount, status tags
   - **Multi-select rows** + “Pay Selected” bulk payment flow
   - Bank-transfer modal with bank details and receipt upload (`Dragger`)

7. **Payment history tables**
   - Columns: transaction ID, date, amount, status
   - Receipt download link per completed transaction

8. **Empty states (`PaymentsEmptyState`)**
   - Context-specific empty UI per tab when no data exists

### Partial vs spec

- “Download Invoice” control is present in the UI but currently disabled (PDF invoice generator not yet active)

---

## Summary — Spec Coverage by Page

| Page | Spec focus | Implementation status |
|------|------------|----------------------|
| 1. Home Dashboard | Metrics, activity feed, quick actions | **Done** — activity split across multiple panels |
| 2. Student List | Filtering, inline editing | **Mostly done** — filtering on list; editing on profile |
| 3. Application List | Tabs, bulk actions, status badges | **Partial** — badges and filters done; tabs and bulk actions pending |
| 4. Application Details | Timeline, documents, communication | **Mostly done** — timeline + document hub + notes/records |
| 5. Task Management | Assignment, due date alerts | **Done** — includes kanban/list/calendar/timeline views |
| 6. Payment | Invoices, payment history | **Mostly done** — history + bulk pay; invoice PDF pending |

---

## Related onboarding flow (reference)

Contract signing and portal unlock before the signed dashboard is available:

- `src/pages/Contract/ContractPage.tsx`
- Onboarding steps in `src/pages/Dashboard/Dashboard.tsx` (pre-unlock view)

---

*Last updated: June 2026 — Partner Portal (`campusly-partner`)*
