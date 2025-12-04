# **🏗️ COMPREHENSIVE DATABASE SCHEMA QUESTIONNAIRE**
## **OCP LLM-Powered Dashboard with ML Integration**

*Please answer each section thoroughly. Your responses will directly inform the database architecture, indexing strategy, and performance optimization decisions.*

---

## **SECTION A: USER MANAGEMENT & AUTHENTICATION** 👥

**A1. User Architecture:**
- [ ] Single-tenant (each user isolated)
- [ ] Multi-tenant with organizations/teams
- [x] Hybrid (personal + shared team spaces) ✅ 2025-12-03

**A2. User Profile Requirements:**
Beyond basic Supabase auth, what user data do you need to store?
- [x] Display name, avatar, timezone ✅ 2025-12-03
- [x] User preferences (theme, language, notification settings) ✅ 2025-12-03
- [ ] Subscription/billing information
- [ ] Energy usage patterns or profile data
- [x] Custom fields: workspace settings, preferred chart types ✅ 2025-12-03

**A3. User Roles & Permissions:**
- [ ] Simple owner/viewer roles
- [x] Admin/Editor/Viewer hierarchy ✅ 2025-12-03
- [ ] Custom role definitions with granular permissions
- [ ] Department/team-based access controls

**A4. User Limits:**
- Max dashboards per user: unlimited ✅ 2025-12-03
- Max charts per dashboard: 10 ✅ 2025-12-03
- Max chat sessions per user: unlimited ✅ 2025-12-03
- Storage limit per user: TBD (will define based on usage patterns) ✅ 2025-12-03

---

## **SECTION B: DASHBOARD & VISUALIZATION ARCHITECTURE** 📊

**B1. Dashboard Structure:**
- [ ] Fixed number of tabs per dashboard
- [x] Unlimited tabs with pagination ✅ 2025-12-03
- [ ] Nested folder structure for organization
- [ ] Tag-based organization system

**B2. Dashboard Sharing:**
- [x] Public links with view-only access ✅ 2025-12-03
- [ ] Specific user invitations with permissions
- [ ] Organization-wide sharing
- [ ] Embed codes for external websites
- [ ] Time-limited access links

**B3. Dashboard Versioning:**
- [ ] No versioning needed
- [ ] Simple save/restore points
- [x] Full version history with diffs ✅ 2025-12-03
- [ ] Branch/merge functionality for collaborative editing

**B4. Chart Types Support:** *(Check all that apply)*
- [x] Line charts (time series) ✅ 2025-12-03
- [x] Bar/column charts ✅ 2025-12-03
- [x] Pie/donut charts ✅ 2025-12-03
- [x] Heatmaps ✅ 2025-12-03
- [x] Scatter plots ✅ 2025-12-03
- [x] Energy consumption visualizations ✅ 2025-12-03
- [x] Custom chart types ✅ 2025-12-03
- [x] Interactive/drill-down charts ✅ 2025-12-03

**B5. Chart Configuration Storage:**
How complex are your chart configurations?
- [ ] Simple (chart type + basic styling)
- [ ] Medium (filters, time windows, color schemes)
- [x] Complex (custom calculations, multiple data sources, advanced styling) ✅ 2025-12-03
- [x] Describe specific requirements: Complex interactive charts with drill-down capabilities, multiple data sources, custom calculations, advanced styling, time windows, filters ✅ 2025-12-03

---

## **SECTION C: DATA STORAGE & MANAGEMENT** 💾

**C1. Chart Data Architecture:** ✅ 2025-12-04
- [x] Template-based dashboard architecture with flexible chart placement ✅ 2025-12-04
- [x] Chart metadata (data source reference, visualization type, layout, style) stored separately from actual chart data ✅ 2025-12-04
- [x] Charts can be reused across dashboards without duplicating data ✅ 2025-12-04
- [x] Full Plotly.js interactivity (zooming, time-frame selection, styling, custom calculations) ✅ 2025-12-04

**C2. Dashboard Architecture Components:** ✅ 2025-12-04
- [x] dashboard_template table → defines layout grid/frames ✅ 2025-12-04
- [x] dashboard_tab table → instances of dashboards using a template ✅ 2025-12-04  
- [x] dashboard_slot table → each frame/window in template where chart can be placed ✅ 2025-12-04
- [x] chart table → stores metadata (Plotly config, title, data references) ✅ 2025-12-04
- [x] chart_placement table → links a chart to a dashboard slot ✅ 2025-12-04

**C3. Chart Management Strategy:** ✅ 2025-12-04
- [x] Users select charts from workspace and modify as needed ✅ 2025-12-04
- [x] Flexible arrangement of multiple charts per dashboard tab ✅ 2025-12-04
- [x] Sharing of dashboard tabs or individual charts while preserving customizations ✅ 2025-12-04

**C4. Data Storage Approach:** ✅ 2025-12-04
- [x] Metadata-driven approach separating chart configuration from data ✅ 2025-12-04
- [x] Template-based layout system for scalable dashboard design ✅ 2025-12-04

---

## **SECTION D: LLM CHAT SYSTEM** 🤖

**D1. Chat Session Architecture:**
- [x] Independent chat sessions ✅ 2025-12-03
- [ ] Chat sessions tied to specific dashboards
- [x] Global chat with dashboard context switching ✅ 2025-12-03
- [x] Multiple chat threads per dashboard ✅ 2025-12-03

**D2. Message Storage Requirements:**
- [x] Text messages only ✅ 2025-12-03
- [x] Rich content (images, files, code blocks, charts) ✅ 2025-12-03
- [ ] Message reactions/annotations
- [ ] Message threading/replies
- [ ] Voice messages or transcripts

**D3. Chat History & Retention:**
- Chat history retention: unlimited (with search/export capabilities) ✅ 2025-12-03
- [ ] Automatic cleanup of old conversations
- [x] Export chat history functionality ✅ 2025-12-03
- [x] Search within chat history ✅ 2025-12-03
- [x] Conversation summarization ✅ 2025-12-03

**D4. Agent Management:**
- [ ] Pre-defined system agents only
- [x] User-customizable agent instructions ✅ 2025-12-03
- [x] Shareable agents between users ✅ 2025-12-03
- [ ] Agent marketplace/templates
- [ ] Agent performance analytics

**D5. Command System:**
- [ ] Simple text commands (/help, /clear)
- [x] Complex commands with parameters ✅ 2025-12-03
- [x] Custom user-defined commands ✅ 2025-12-03
- [x] Integration with external tools/APIs ✅ 2025-12-03
- [x] Command history and favorites ✅ 2025-12-03

**ADDITIONAL CHAT REQUIREMENTS:** ✅ 2025-12-03
- Users can select different LLM models per prompt
- Output routing: dashboard tab, workspace, or global context
- Agent selection per prompt
- Unlimited sessions with full search/export capabilities

---

## **SECTION E: PERMISSIONS & SECURITY** 🔐

**E1. Permission Granularity:** ✅ 2025-12-04
- [x] User-level permissions ✅ 2025-12-04
- [ ] Dashboard-level permissions
- [ ] Individual chart permissions
- [ ] Chat session permissions
- [x] Agent access permissions (users can choose which agents to use) ✅ 2025-12-04
- [ ] Data source permissions

**E2. Sharing Mechanisms:** ✅ 2025-12-04
- [x] Simple public/private toggle (nothing restricted by default) ✅ 2025-12-04
- [ ] Specific user invitations
- [ ] Role-based sharing (view/edit/admin)
- [ ] Time-limited access
- [ ] Password-protected shares
- [ ] Domain-restricted sharing

**E3. Audit & Compliance:** ✅ 2025-12-04
- [ ] Basic access logging (can be added later if needed) ✅ 2025-12-04
- [ ] Detailed audit trails (can be added later if needed) ✅ 2025-12-04
- [ ] Data access tracking (can be added later if needed) ✅ 2025-12-04
- [ ] GDPR compliance features (can be added later if needed) ✅ 2025-12-04
- [ ] Export/delete user data capabilities (can be added later if needed) ✅ 2025-12-04

**E4. Data Security Requirements:** ✅ 2025-12-04
- [x] Standard encryption at rest/transit (default PostgreSQL + Supabase) ✅ 2025-12-04
- [ ] Field-level encryption (can be added later if needed) ✅ 2025-12-04
- [ ] Data anonymization capabilities (can be added later if needed) ✅ 2025-12-04
- [ ] Geographic data residency requirements (can be added later if needed) ✅ 2025-12-04
- [ ] Industry compliance: None required initially ✅ 2025-12-04

---

## **SECTION F: ML MODEL & ENERGY OPTIMIZATION** 🔋

**F1. ML Model Integration:**
- [ ] Model runs on user request only
- [ ] Scheduled model execution (hourly/daily)
- [ ] Event-triggered (new data arrival)
- [ ] Continuous learning/updating models

**F2. ML Input/Output Data:**
- [ ] Simple energy consumption numbers
- [ ] Complex multi-dimensional energy data
- [ ] Weather and external factor integration
- [ ] User behavior pattern data
- [ ] Historical prediction accuracy tracking

**F3. Model Results Storage:**
- [ ] Store only final predictions
- [ ] Store intermediate calculations
- [ ] Version model outputs for comparison
- [ ] Confidence scores and uncertainty ranges
- [ ] Model explanation/reasoning data

**F4. Energy Data Characteristics:**
- Data update frequency: ________________
- Number of energy sources/meters: ________________
- Historical data span needed: ________________
- Real-time vs batch processing preference: ________________

---

## **SECTION G: NOTIFICATIONS & REAL-TIME FEATURES** 🔔

**G1. Notification Triggers:** *(Check all that apply)*
- [ ] ML model completion
- [ ] New data availability
- [ ] Dashboard sharing events
- [ ] Chat mentions/responses
- [ ] System alerts/errors
- [ ] Scheduled report generation

**G2. Notification Delivery:**
- [ ] In-app notifications only
- [ ] Email notifications
- [ ] Push notifications (if mobile app planned)
- [ ] Webhook/API callbacks
- [ ] SMS notifications (critical alerts)

**G3. Real-Time Update Requirements:**
- [ ] Live chart data updates
- [ ] Real-time chat messaging
- [ ] Collaborative dashboard editing
- [ ] Live user presence indicators
- [ ] System status updates

**G4. Notification Management:**
- [ ] User-configurable notification preferences
- [ ] Notification history/archive
- [ ] Read/unread status tracking
- [ ] Notification grouping/batching
- [ ] Do-not-disturb scheduling

---

## **SECTION H: PERFORMANCE & SCALABILITY** ⚡

**H1. Performance Requirements:**
- Dashboard load time target: ________________ seconds
- Chart rendering time target: ________________ seconds
- Chat message response time: ________________ seconds
- Concurrent user target: ________________ users
- Database query response time: ________________ ms

**H2. Scalability Planning:**
- Expected growth rate: ________________% per year
- Peak usage patterns: ________________
- Geographic distribution: ________________
- Mobile app planned: [ ] Yes [ ] No

**H3. Caching Strategy:**
- [ ] No caching needed
- [ ] Simple query result caching
- [ ] Redis for session/temporary data
- [ ] CDN for static chart images
- [ ] Application-level caching layers

**H4. Backup & Recovery:**
- Recovery time objective (RTO): ________________
- Recovery point objective (RPO): ________________
- [ ] Point-in-time recovery needed
- [ ] Cross-region backup requirements

---

## **SECTION I: TECHNICAL CONSTRAINTS & PREFERENCES** 🔧

**I1. Database Constraints:**
- [ ] Must use standard PostgreSQL (no extensions)
- [ ] Can use PostgreSQL extensions (TimescaleDB, PostGIS, etc.)
- [ ] Need multi-database support
- [ ] Specific version requirements: ________________

**I2. Development Preferences:**
- [ ] Prefer simple schema over performance optimization
- [ ] Optimize for read-heavy workloads
- [ ] Optimize for write-heavy workloads
- [ ] Balance read/write performance
- [ ] Prioritize data consistency over availability
- [ ] Prioritize availability over strict consistency

**I3. Migration & Evolution:**
- [ ] Schema must be stable (minimal future changes)
- [ ] Expect frequent schema evolution
- [ ] Need zero-downtime migration capability
- [ ] Backward compatibility requirements

---

## **SECTION J: INTEGRATION & ECOSYSTEM** 🔗

**J1. External System Integration:**
- [ ] CRM systems
- [ ] Business intelligence tools
- [ ] Energy management platforms
- [ ] IoT platforms
- [ ] API webhooks for third parties
- [ ] Other: ________________________________

**J2. Data Import/Export:**
- [ ] Bulk data import capabilities
- [ ] Real-time data streaming
- [ ] Scheduled data exports
- [ ] API access for external systems
- [ ] Standard format support (CSV, JSON, etc.)

**J3. Opencode SDK Integration:**
- [ ] Standard chat functionality only
- [ ] Custom agent development
- [ ] Tool/function calling capabilities
- [ ] Session management integration
- [ ] Custom permission integration

---

## **ADDITIONAL REQUIREMENTS & CONSTRAINTS** 📝

**Please describe any specific requirements not covered above:**

1. **Business Logic Constraints:**
   ________________________________

2. **Regulatory/Compliance Requirements:**
   ________________________________

3. **Performance Critical Features:**
   ________________________________

4. **Known Technical Limitations:**
   ________________________________

5. **Future Feature Considerations:**
   ________________________________

---

## **CURRENT PROGRESS SUMMARY** 📊

**Sections Completed:**
- ✅ Section A: User Management (Hybrid architecture, Admin/Editor/Viewer roles, unlimited resources)
- ✅ Section B: Dashboard Architecture (Unlimited tabs with pagination, complex charts, full versioning)
- ✅ Section D: Chat System (Unlimited sessions, rich content, agent/model selection per prompt)

**Key Requirements Identified:**
- Hybrid personal + shared team spaces
- Complex interactive charts with drill-down capabilities
- Full dashboard versioning with history
- Unlimited chat sessions with advanced search/export
- Per-prompt agent and LLM model selection
- Output routing to dashboard/workspace/global context
- Custom commands and external tool integration

**Remaining Sections to Complete:** C, E, F, G, H, I, J

---

**📊 QUESTIONNAIRE COMPLETION CHECKLIST:**
- [x] Section A: User Management (4 questions) ✅
- [x] Section B: Dashboard Architecture (5 questions) ✅
- [ ] Section C: Data Management (4 questions)
- [x] Section D: Chat System (5 questions) ✅
- [ ] Section E: Permissions & Security (4 questions)
- [ ] Section F: ML & Energy Optimization (4 questions)
- [ ] Section G: Notifications (4 questions)
- [ ] Section H: Performance (4 questions)
- [ ] Section I: Technical Constraints (3 questions)
- [ ] Section J: Integration (3 questions)
- [ ] Additional Requirements completed

---

**COMPLETION DATE:** ________________
**COMPLETED BY:** ________________
**REVIEW DATE:** ________________

---

*Once completed, this questionn
aire will be used to design a comprehensive PostgreSQL schema with proper indexing, relationships, constraints, and performance optimizations tailored specifically to your OCP project requirements.*
