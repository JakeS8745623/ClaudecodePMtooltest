// ─── SEED DATA ───────────────────────────────────────────────────────────────
// Matches the screenshots exactly. Inserted on first run when Supabase is empty.
// IDs are omitted so Supabase SERIAL assigns them automatically.

window.SEED = {

  // ─── CONFIG ──────────────────────────────────────────────────────────────
  config: [
    { key: 'urgent_banner',  value: 'KT Identification Session · 8 Apr' },
    { key: 'program_title',  value: 'Unified IT Operating Model' },
    { key: 'program_org',    value: 'TSA IT · Program Command Centre' },
    { key: 'footer_label',   value: 'TSA IT · UNIFIED OPERATING MODEL PROGRAM · CONFIDENTIAL' }
  ],

  // ─── MILESTONES ──────────────────────────────────────────────────────────
  milestones: [
    { label: 'KT Identification Session',            date: '2026-04-08', sort_order: 0 },
    { label: 'People & Accountability Changes Complete', date: '2026-04-25', sort_order: 1 },
    { label: 'Capability Uplift Phase',              date: '2026-05-10', sort_order: 2 },
    { label: 'IT Service Centre Launch',             date: '2026-05-31', sort_order: 3 },
    { label: 'Full Operating Model Cutover',         date: '2026-08-01', sort_order: 4 }
  ],

  // ─── WORKSTREAMS ─────────────────────────────────────────────────────────
  // status_color maps to CSS class: converge | mid-late-apr | may | late-may-jun | active | pending | embed
  workstreams: [
    {
      name: 'Operating Model Transformation',
      subtitle: 'KT identification session — 8 Apr',
      status_label: 'Converge',
      status_color: 'converge',
      stream_id: null,
      sort_order: 0
    },
    {
      name: 'People & Accountability Changes',
      subtitle: 'Role changes, repoints, desk moves',
      status_label: 'Mid-Late Apr',
      status_color: 'mid-late-apr',
      stream_id: null,
      sort_order: 1
    },
    {
      name: 'Capability Uplift & KT Program',
      subtitle: 'Coaching, process alignment',
      status_label: 'May',
      status_color: 'may',
      stream_id: null,
      sort_order: 2
    },
    {
      name: 'IT Service Centre Launch',
      subtitle: 'Goldie + 1300 number active',
      status_label: 'Late May-Jun',
      status_color: 'late-may-jun',
      stream_id: null,
      sort_order: 3
    },
    {
      name: 'IT Governance (TRF)',
      subtitle: 'Established · EMLT brief pending',
      status_label: 'Active',
      status_color: 'active',
      stream_id: null,
      sort_order: 4
    },
    {
      name: 'ITAM Framework',
      subtitle: 'New asset mgr in place · framework TBD',
      status_label: 'Pending',
      status_color: 'pending',
      stream_id: null,
      sort_order: 5
    },
    {
      name: 'IT Business Partners',
      subtitle: '4 roles introduced · embedding in progress',
      status_label: 'Embed',
      status_color: 'embed',
      stream_id: null,
      sort_order: 6
    }
  ],

  // ─── ATTENTION ITEMS ─────────────────────────────────────────────────────
  attention_items: [
    {
      priority: 'NOW',
      text: 'KT identification session prep — kicks off 8 April. Domain experts confirmed? Session structure agreed with Steve?',
      sort_order: 0
    },
    {
      priority: 'NOW',
      text: 'Individual consultations — must complete before any group briefings. All impacted team members covered?',
      sort_order: 1
    },
    {
      priority: 'THIS WEEK',
      text: 'Marco (Chief of Staff) briefing — needs to happen before EMLT presentation of IT governance narrative.',
      sort_order: 2
    },
    {
      priority: 'THIS WEEK',
      text: '3 outstanding business plans — teams yet to submit. Workload picture incomplete without these.',
      sort_order: 3
    },
    {
      priority: 'WATCH',
      text: 'L1 FCR stability — dual-gate condition for Unified stage. Start tracking baseline now before cutover pressure builds.',
      sort_order: 4
    },
    {
      priority: 'WATCH',
      text: 'IVR/telephony config — Aged Care, Stores, ePlus move to 1300 + area options at Embed. Leigh to confirm Genesys readiness.',
      sort_order: 5
    },
    {
      priority: 'WATCH',
      text: 'ITAM framework build-out — EGM reviews pending: PC leasing vs purchase + mobile/BYOD. No framework yet in place.',
      sort_order: 6
    }
  ],

  // ─── PROGRESS ITEMS ──────────────────────────────────────────────────────
  progress_items: [
    { label: 'Overall Program',                percentage: 59, bar_color: 'auto', sort_order: 0 },
    { label: 'Structural Changes (People)',    percentage: 65, bar_color: 'auto', sort_order: 1 },
    { label: 'Capability & Knowledge Transfer', percentage: 10, bar_color: 'auto', sort_order: 2 },
    { label: 'Service Centre Readiness',       percentage: 30, bar_color: 'auto', sort_order: 3 },
    { label: 'Governance (TRF / ITBP)',        percentage: 70, bar_color: 'auto', sort_order: 4 },
    { label: 'ITAM Framework',                 percentage: 15, bar_color: 'auto', sort_order: 5 }
  ],

  // ─── CONTACTS ─────────────────────────────────────────────────────────────
  contacts: [
    { name: 'Milad Kruze',     title: 'EGM IT / CIO · Executive Sponsor',       sort_order: 0 },
    { name: 'Steve Tasios',    title: 'GM IT Service Delivery',                  sort_order: 1 },
    { name: 'Kelly Dauria',    title: 'IT Performance & Planning · TRF Secretariat', sort_order: 2 },
    { name: 'Leigh',           title: 'ServiceNow & Genesys · Transition Stability', sort_order: 3 },
    { name: 'Christie Lim',   title: 'GM IS&G · Chairs CAIG',                   sort_order: 4 },
    { name: 'Raj Padmawar',   title: 'Enterprise Architect · Chairs ARG',        sort_order: 5 },
    { name: 'Megan McDonald', title: 'GM Enabling Technologies',                  sort_order: 6 },
    { name: 'Pam',             title: 'Change Management',                        sort_order: 7 }
  ],

  // ─── ROADMAP STREAMS ─────────────────────────────────────────────────────
  streams: [
    {
      name: 'Culture & Ways of Working Uplift',
      description: 'Initiatives to strengthen IT culture, processes, and working practices to support the new operating model.',
      sort_order: 0
    },
    {
      name: 'Strategy, Policy & Operating Model',
      description: 'Defines IT and Data strategies, establishes policies, and sets the target operating model.',
      sort_order: 1
    },
    {
      name: 'Architecture & Governance',
      description: 'Establishes governance and architectural mechanisms to enable disciplined investment and interoperability.',
      sort_order: 2
    },
    {
      name: 'Applications and Platforms',
      description: 'Delivers structured application consolidation and transition to reduce risk and simplify IT environment.',
      sort_order: 3
    },
    {
      name: 'Service Delivery & Operations',
      description: 'Consolidates infrastructure to strengthen consistency, accountability, and responsiveness.',
      sort_order: 4
    },
    {
      name: 'Procurement & Commercial Integration',
      description: 'Strengthens procurement and vendor management to drive transparency and maximise supplier value.',
      sort_order: 5
    },
    {
      name: 'Adaptive Shifts',
      description: 'Targeted operational improvements that adjust how IT services are defined, supported, or governed.',
      sort_order: 6
    }
  ],

  // ─── ROADMAP TASKS ────────────────────────────────────────────────────────
  // stream_id matches position in streams array above (1-indexed after insert)
  // These will be reassigned after streams are inserted.
  // For seeding: use stream_id 1-7 matching the seed streams order.
  tasks: [
    // Stream 1 — Culture & Ways of Working Uplift
    { stream_id: 1, name: 'Phase 2 Org Consolidation & Workforce Alignment', start_date: '2026-01-01', end_date: '2026-03-31', percent_complete: 6,  status: 'in_progress', sort_order: 0 },
    { stream_id: 1, name: 'Narrative Reset & Leadership Alignment',          start_date: '2026-03-15', end_date: '2026-06-30', percent_complete: 0,  status: 'planned',     sort_order: 1 },
    { stream_id: 1, name: 'Performance Transparency & Accountability',       start_date: '2026-06-01', end_date: '2026-10-31', percent_complete: 0,  status: 'planned',     sort_order: 2 },
    { stream_id: 1, name: 'Embedding Behavioural Standards & Culture',       start_date: '2026-05-01', end_date: '2026-08-31', percent_complete: 0,  status: 'planned',     sort_order: 3 },

    // Stream 2 — Strategy, Policy & Operating Model
    { stream_id: 2, name: 'Phase 1 Org Consolidation & Workforce Alignment', start_date: '2025-09-01', end_date: '2026-01-15', percent_complete: 100, status: 'complete',    sort_order: 0 },
    { stream_id: 2, name: 'Refresh Strategies & Domain Roadmaps',            start_date: '2026-01-15', end_date: '2026-09-30', percent_complete: 0,   status: 'at_risk',     sort_order: 1 },
    { stream_id: 2, name: 'Establish Annual Planning & Budgeting',           start_date: '2025-11-01', end_date: '2026-03-31', percent_complete: 70,  status: 'in_progress', sort_order: 2 },
    { stream_id: 2, name: 'Review Existing IT Project Mgmt Framework',       start_date: '2026-03-15', end_date: '2026-06-30', percent_complete: 0,   status: 'planned',     sort_order: 3 },
    { stream_id: 2, name: 'Establish KPI & Health Metrics',                  start_date: '2025-12-01', end_date: '2026-02-28', percent_complete: 50,  status: 'in_progress', sort_order: 4 },
    { stream_id: 2, name: 'Establish Asset Mgmt Framework & Capability',     start_date: '2026-03-15', end_date: '2026-07-31', percent_complete: 0,   status: 'planned',     sort_order: 5 },
    { stream_id: 2, name: 'Operating Model Design',                          start_date: '2025-10-01', end_date: '2026-06-30', percent_complete: 50,  status: 'in_progress', sort_order: 6 },

    // Stream 3 — Architecture & Governance
    { stream_id: 3, name: 'Establish New IT Governance Forums',      start_date: '2025-11-01', end_date: '2026-03-31', percent_complete: 55, status: 'in_progress', sort_order: 0 },
    { stream_id: 3, name: 'Design/Implement Intake & Demand Mgmt',  start_date: '2026-01-15', end_date: '2026-03-31', percent_complete: 60, status: 'in_progress', sort_order: 1 },

    // Stream 4 — Applications and Platforms
    { stream_id: 4, name: 'Application Centralisation & Transition — Discovery', start_date: '2025-10-01', end_date: '2026-03-31', percent_complete: 80, status: 'in_progress', sort_order: 0 },
    { stream_id: 4, name: 'Define Ongoing Application Ownership Model',          start_date: '2026-03-15', end_date: '2026-07-31', percent_complete: 0,  status: 'planned',     sort_order: 1 },
    { stream_id: 4, name: 'Consolidating Identified Opportunity Applications',   start_date: '2026-07-01', end_date: '2026-10-31', percent_complete: 0,  status: 'planned',     sort_order: 2 },
    { stream_id: 4, name: 'Retirement Planning for Legacy Systems',              start_date: '2026-09-01', end_date: '2027-01-31', percent_complete: 0,  status: 'planned',     sort_order: 3 },

    // Stream 5 — Service Delivery & Operations
    { stream_id: 5, name: 'Goldie AI Pilot',                          start_date: '2025-11-01', end_date: '2026-03-15', percent_complete: 100, status: 'complete',    sort_order: 0 },
    { stream_id: 5, name: 'Establish Business Partner Model',         start_date: '2026-03-15', end_date: '2026-07-31', percent_complete: 0,   status: 'planned',     sort_order: 1 },
    { stream_id: 5, name: 'Service Optimisation',                     start_date: '2026-06-01', end_date: '2026-09-30', percent_complete: 0,   status: 'planned',     sort_order: 2 },
    { stream_id: 5, name: 'Service Centre Consolidation & Centralisation', start_date: '2025-10-01', end_date: '2026-03-31', percent_complete: 60, status: 'in_progress', sort_order: 3 },
    { stream_id: 5, name: 'Data Insights & Reporting',                start_date: '2026-06-01', end_date: '2026-09-30', percent_complete: 0,   status: 'planned',     sort_order: 4 },
    { stream_id: 5, name: 'Goldie AI Rollout Phase 1',                start_date: '2026-01-15', end_date: '2026-03-31', percent_complete: 80,  status: 'in_progress', sort_order: 5 },
    { stream_id: 5, name: 'Goldie AI Optimise',                       start_date: '2026-05-01', end_date: '2028-04-30', percent_complete: 0,   status: 'planned',     sort_order: 6 },

    // Stream 6 — Procurement & Commercial Integration
    { stream_id: 6, name: 'Review & Consolidate Vendor Contracts',      start_date: '2026-03-15', end_date: '2026-07-31', percent_complete: 0, status: 'planned',  sort_order: 0 },
    { stream_id: 6, name: 'Develop Vendor Mgmt Framework',              start_date: '2026-04-01', end_date: '2026-07-31', percent_complete: 0, status: 'planned',  sort_order: 1 },
    { stream_id: 6, name: 'Procurement Process & Policy Alignment',     start_date: '2026-04-01', end_date: '2026-08-31', percent_complete: 0, status: 'planned',  sort_order: 2 },
    { stream_id: 6, name: 'IT Cost Centralisation (incl. IT Expenditure Policy)', start_date: '2026-01-15', end_date: '2026-09-30', percent_complete: 0, status: 'at_risk', sort_order: 3 },

    // Stream 7 — Adaptive Shifts
    { stream_id: 7, name: 'Technology Simplification Review',  start_date: '2026-03-15', end_date: '2026-07-31', percent_complete: 0,  status: 'planned',  sort_order: 0 },
    { stream_id: 7, name: 'Out of Hours Support Uplift P1',    start_date: '2026-02-01', end_date: '2026-05-31', percent_complete: 11, status: 'at_risk',  sort_order: 1 },
    { stream_id: 7, name: 'Laptop Leasing v Purchasing',       start_date: '2026-02-01', end_date: '2026-04-30', percent_complete: 20, status: 'at_risk',  sort_order: 2 },
    { stream_id: 7, name: 'Mobile Phone Policy',               start_date: '2026-02-01', end_date: '2026-04-30', percent_complete: 0,  status: 'at_risk',  sort_order: 3 }
  ]
};
