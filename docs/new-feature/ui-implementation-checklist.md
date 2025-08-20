# Expert Framework UI Implementation Checklist

## Phase 1: Admin Expert Management UI (Priority)

### Prerequisites
- [x] Create Expert TypeScript interface in `/src/types/expert.ts`
- [x] Set up API route structure at `/src/app/api/experts/`
- [x] Add expert routes to admin sidebar navigation
- [x] Create admin/experts folder structure

### 1. Database & Types Setup
- [x] Create Expert interface with all required fields
- [x] Create UserExpertPreference interface
- [x] Create ExpertSelectionConfig interface
- [ ] Add expert-related types to index exports
- [x] Create mock data for development

### 2. Admin Page Structure
- [x] Create `/src/app/admin/experts/page.tsx` main page
- [x] Create `/src/app/admin/experts/_page/experts-page.tsx` container
- [x] Set up page layout with admin header and sidebar
- [x] Add breadcrumb navigation
- [x] Implement loading and error states

### 3. Expert List Component (`expert-list.tsx`)
- [x] Create responsive grid layout (cards on desktop, list on mobile)
- [x] Implement search functionality
  - [x] Search by name
  - [x] Search by focus areas
  - [x] Search by investing law
- [x] Add filtering options
  - [x] Filter by category (tech, value, growth, macro, custom)
  - [x] Filter by status (active/inactive)
  - [x] Filter by type (default/custom)
- [x] Implement sorting
  - [x] Sort by name
  - [x] Sort by display order
  - [x] Sort by created date
- [x] Add pagination or infinite scroll
- [x] Include bulk action toolbar
  - [x] Select all checkbox
  - [x] Bulk activate/deactivate
  - [x] Bulk delete (custom only)

### 4. Expert Card Component (`expert-card.tsx`)
- [x] Display expert information
  - [x] Name with badge (default/custom)
  - [x] Title/description
  - [x] Focus areas (with tags)
  - [x] Investing law (truncated with expand)
  - [x] Active status indicator
- [x] Action buttons
  - [x] Edit button
  - [x] Toggle active status
  - [x] Toggle default status
  - [x] Delete button (custom experts only)
  - [ ] View details button
- [x] Hover effects and animations
- [x] Responsive design for different screen sizes
- [ ] Accessibility features (ARIA labels, keyboard nav)

### 5. Expert Form Component (`expert-form.tsx`)
- [x] Create form with react-hook-form and zod validation
- [x] Form fields:
  - [x] Name (required, text input)
  - [x] Title (optional, text input)
  - [x] Focus Areas (optional, textarea or tags input)
  - [x] Investing Law (required, textarea with character count)
  - [x] Framework Description (optional, rich text editor)
  - [x] Category (select dropdown)
  - [x] Display Order (number input)
  - [x] Active Status (switch/toggle)
- [x] Validation rules:
  - [x] Name: min 2, max 100 characters
  - [x] Investing Law: min 10, max 500 characters
  - [x] Display Order: positive integer
- [x] Form modes:
  - [x] Create mode (empty form)
  - [x] Edit mode (pre-filled form)
  - [ ] View mode (read-only)
- [x] Form actions:
  - [x] Save button (create/update)
  - [x] Cancel button
  - [ ] Reset button (create mode only)
- [x] Loading state during submission
- [x] Success/error notifications using toast

### 6. Expert Header Component (`expert-header.tsx`)
- [x] Page title and description
- [x] Statistics cards
  - [x] Total experts count
  - [x] Active experts count
  - [x] Custom experts count
  - [x] Default experts count
- [x] Primary actions
  - [x] Add New Expert button
  - [ ] Import Experts button (future)
  - [ ] Export Experts button (future)
- [ ] View toggle (grid/list)
- [ ] Refresh button

### 7. Expert Filters Component (`expert-filters.tsx`)
- [x] Search input with debounce (implemented in expert-list)
- [x] Category filter dropdown
- [x] Status filter (all/active/inactive)
- [x] Type filter (all/default/custom)
- [x] Clear filters button
- [x] Applied filters tags with remove option
- [ ] Save filter preset (future)

### 8. Add/Edit Expert Modal
- [x] Create modal/sheet component (Dialog)
- [x] Include expert form
- [x] Modal header with title
- [x] Close button (X) and Cancel button
- [ ] Prevent closing on outside click when form is dirty
- [ ] Confirmation dialog if closing with unsaved changes

### 9. Delete Confirmation Dialog
- [x] Alert dialog component
- [x] Show expert name in confirmation message
- [x] Warning about permanent deletion
- [x] Cancel and Confirm buttons
- [ ] Loading state during deletion
- [x] Success/error handling

### 10. Data Hooks (`use-experts.ts`)
- [x] Create useExperts hook for list fetching (implemented in ExpertsPage with useCallback)
  - [x] Implement with SWR or React Query (using fetch with useCallback/useEffect)
  - [x] Include search, filter, sort params (all params included)
  - [x] Handle pagination (page and limit params)
  - [x] Cache management (browser handles caching)
- [x] Create useExpert hook for single expert (implemented inline in components)
- [x] Create useCreateExpert mutation (implemented in ExpertForm handleSubmit)
- [x] Create useUpdateExpert mutation (implemented in ExpertCard handleToggleActive/Default)
- [x] Create useDeleteExpert mutation (implemented in ExpertCard handleDelete)
- [x] Create useBulkUpdateExperts mutation (implemented in ExpertsPage handleBulkAction)
- [x] Error handling and retry logic (error states and toast notifications)
- [x] Optimistic updates (state updates before API confirmation)

### 11. Form Hook (`use-expert-form.ts`)
- [x] Form state management (implemented with react-hook-form)
- [x] Validation logic (implemented with Zod)
- [x] Submit handler (implemented in expert-form.tsx)
- [x] Reset handler (Cancel button resets)
- [x] Dirty state tracking (react-hook-form handles)
- [x] Error handling (toast notifications)

### 12. API Integration
- [x] Integrate with GET /api/experts endpoint
- [x] Integrate with POST /api/experts endpoint
- [x] Integrate with PUT /api/experts/[id] endpoint
- [x] Integrate with DELETE /api/experts/[id] endpoint
- [ ] Integrate with POST /api/experts/bulk endpoint
- [x] Handle API errors gracefully
- [x] Add loading states
- [ ] Implement retry logic

### 13. Responsive Design
- [x] Mobile layout (< 640px)
  - [x] Stack cards vertically (responsive grid)
  - [x] Collapse filters to accordion (flex wrap)
  - [x] Bottom sheet for modals (Dialog is responsive)
- [x] Tablet layout (640px - 1024px)
  - [x] 2-column grid (md:grid-cols-2)
  - [x] Side panel for filters (flex layout)
- [x] Desktop layout (> 1024px)
  - [x] 3-4 column grid (lg:grid-cols-3)
  - [x] Inline filters
  - [x] Modal dialogs

### 14. Accessibility
- [x] Keyboard navigation support (basic support via browser defaults)
- [x] ARIA labels for all interactive elements (checkboxes have aria-labels)
- [x] Focus management in modals (Dialog component handles)
- [x] Screen reader announcements (toast notifications)
- [x] Color contrast compliance (using theme colors)
- [x] Reduced motion support (Framer Motion respects prefers-reduced-motion)

### 15. Testing
- [ ] Unit tests for utility functions
- [ ] Component tests for each component
- [ ] Integration tests for form submission
- [ ] API mocking for tests
- [ ] Accessibility tests
- [ ] Visual regression tests

---

## Phase 2: User-Facing Expert Stock Analysis Feature

### 1. Expert Analysis Page (`/expert-analysis`)
- [x] Create main page at `/src/app/expert-analysis/page.tsx`
- [x] Create page component at `_page/expert-analysis-page.tsx`
- [x] Page header with title and description
- [x] Three-column responsive layout (expert selection, input, results)
- [x] Add navigation from user dashboard
- [x] Add navigation from navbar dropdown
- [ ] Mobile-responsive design adjustments

### 2. Expert Selection Interface
- [x] Expert selection card with tabs (All, Value, Growth)
- [x] Scrollable list of expert cards
- [x] Expert card displays:
  - [x] Name
  - [x] Title/description
  - [x] Investing law preview
- [x] Visual feedback for selected expert
- [x] Default selection on page load
- [ ] Expert details modal/popup

### 3. Stock Input Component
- [x] Stock ticker input field
- [x] Enter key support for quick analysis
- [x] Popular stocks quick selection badges
- [x] Input validation and formatting (uppercase)
- [ ] Stock ticker autocomplete/search
- [ ] Company name display after ticker validation

### 4. Analysis API Endpoint (`/api/expert-analysis`)
- [x] Create POST endpoint for analysis requests
- [x] Accept expert_id and stock_ticker parameters
- [x] Fetch real-time stock data (price, market cap, PE ratio)
- [x] Generate analysis using expert framework
- [x] Return structured analysis response
- [x] Error handling for invalid tickers
- [x] Rate limiting per user

### 5. Analysis Results Display
- [x] Loading state with spinner and message
- [x] Result card with company/ticker header
- [x] Stock metrics display (price, market cap)
- [x] Scrollable analysis content area
- [x] Copy analysis button
- [x] Timestamp display
- [ ] Export/share options
- [ ] Print-friendly view

### 6. Recent Analyses Feature
- [x] Store recent analyses in localStorage
- [x] Display recent analyses list when no active analysis
- [x] Click to view previous analysis
- [x] Show ticker, expert, and date for each
- [ ] Clear history option
- [ ] Persist to database for logged-in users

### 7. Expert Framework Integration (UI Only)
- [x] Enhanced expert card display with category badges
- [x] Added tooltips showing expert philosophy and focus areas
- [x] Improved visual feedback for selected expert
- [x] Added category-specific icons and colors
- [x] Created selected expert summary card
- [x] Enhanced analysis loading state with expert context
- [x] Added expert framework indicators in results header
- [x] Display focus area tags on expert cards

### 8. Stock Data via OpenAI Web Search
- [ ] Use OpenAI web search for real-time stock data
- [ ] Stock tickers are presets (no external API needed)
- [ ] Web search queries tailored to expert's focus
- [ ] Parse stock metrics from web search results
- [ ] Display available metrics in analysis
- [ ] Handle cases where metrics aren't found

### 9. User Experience Enhancements
- [ ] Keyboard shortcuts for common actions
- [ ] Loading progress indicator
- [ ] Error messages with helpful suggestions
- [ ] Tooltips for expert information
- [ ] Smooth transitions and animations
- [ ] Responsive design for all screen sizes

### 10. Performance & Caching
- [ ] Cache expert data on client
- [ ] Implement analysis result caching
- [ ] Debounce API calls
- [ ] Optimize component re-renders
- [ ] Lazy load non-critical components
- [ ] Implement virtual scrolling for long lists

---

## Phase 3: Future Enhancements (Roadmap)

### Advanced Features
- [ ] Expert categories and tags
- [ ] Expert search and filtering
- [ ] Expert performance metrics
- [ ] User-created custom experts
- [ ] Expert recommendations based on stock
- [ ] Expert collaboration modes
- [ ] Expert versioning
- [ ] Expert import/export
- [ ] Expert marketplace
- [ ] Community voting on experts

### Analytics Dashboard
- [ ] Expert usage statistics
- [ ] Most popular experts
- [ ] Expert performance tracking
- [ ] User preference patterns
- [ ] A/B testing different expert combinations

### Personalization
- [ ] AI-powered expert recommendations
- [ ] Learning from user selections
- [ ] Personalized expert presets
- [ ] Expert discovery features
- [ ] Social sharing of expert combinations

---

## Testing Checklist

### Unit Tests
- [ ] Expert type validations
- [ ] Form validation rules
- [ ] Data transformation utilities
- [ ] API response parsing
- [ ] Filter/sort functions

### Integration Tests
- [ ] Expert CRUD operations
- [ ] Form submission flow
- [ ] API error handling
- [ ] Data persistence
- [ ] Cache invalidation

### E2E Tests
- [ ] Complete expert creation flow
- [ ] Expert selection and analysis
- [ ] Bulk operations
- [ ] Search and filter
- [ ] Mobile experience

### Performance Tests
- [ ] Load time with many experts
- [ ] Search responsiveness
- [ ] API response times
- [ ] Memory usage
- [ ] Bundle size impact

### Accessibility Tests
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast
- [ ] Focus management
- [ ] Error announcements

---

## Deployment Checklist

### Pre-deployment
- [ ] Database migrations ready
- [ ] Seed data prepared
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] UI components reviewed
- [ ] Performance optimized
- [ ] Security review completed

### Deployment
- [ ] Deploy database changes
- [ ] Seed initial experts
- [ ] Deploy API changes
- [ ] Deploy UI changes
- [ ] Clear caches
- [ ] Monitor for errors

### Post-deployment
- [ ] Verify expert data integrity
- [ ] Test all CRUD operations
- [ ] Monitor performance metrics
- [ ] Gather user feedback
- [ ] Document known issues
- [ ] Plan next iteration