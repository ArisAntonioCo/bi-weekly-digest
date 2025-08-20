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
- [ ] Add breadcrumb navigation
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
  - [ ] Filter by type (default/custom)
- [ ] Implement sorting
  - [ ] Sort by name
  - [ ] Sort by display order
  - [ ] Sort by created date
- [ ] Add pagination or infinite scroll
- [ ] Include bulk action toolbar
  - [ ] Select all checkbox
  - [ ] Bulk activate/deactivate
  - [ ] Bulk delete (custom only)

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
  - [ ] Custom experts count
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
- [ ] Type filter (all/default/custom)
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
- [ ] Create useExperts hook for list fetching
  - [ ] Implement with SWR or React Query
  - [ ] Include search, filter, sort params
  - [ ] Handle pagination
  - [ ] Cache management
- [ ] Create useExpert hook for single expert
- [ ] Create useCreateExpert mutation
- [ ] Create useUpdateExpert mutation
- [ ] Create useDeleteExpert mutation
- [ ] Create useBulkUpdateExperts mutation
- [ ] Error handling and retry logic
- [ ] Optimistic updates

### 11. Form Hook (`use-expert-form.ts`)
- [ ] Form state management
- [ ] Validation logic
- [ ] Submit handler
- [ ] Reset handler
- [ ] Dirty state tracking
- [ ] Error handling

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
- [ ] Mobile layout (< 640px)
  - [ ] Stack cards vertically
  - [ ] Collapse filters to accordion
  - [ ] Bottom sheet for modals
- [ ] Tablet layout (640px - 1024px)
  - [ ] 2-column grid
  - [ ] Side panel for filters
- [ ] Desktop layout (> 1024px)
  - [ ] 3-4 column grid
  - [ ] Inline filters
  - [ ] Modal dialogs

### 14. Accessibility
- [ ] Keyboard navigation support
- [ ] ARIA labels for all interactive elements
- [ ] Focus management in modals
- [ ] Screen reader announcements
- [ ] Color contrast compliance
- [ ] Reduced motion support

### 15. Testing
- [ ] Unit tests for utility functions
- [ ] Component tests for each component
- [ ] Integration tests for form submission
- [ ] API mocking for tests
- [ ] Accessibility tests
- [ ] Visual regression tests

---

## Phase 2: User Expert Selection UI (Next Phase)

### 1. Expert Selection Trigger
- [ ] Add "Select Experts" button to analysis page
- [ ] Show currently selected experts count
- [ ] Default to saved preferences if available
- [ ] Required step before analysis can proceed

### 2. Expert Selection Modal (`expert-selection-modal.tsx`)
- [ ] Full-screen modal on mobile, centered on desktop
- [ ] Modal header with title and close button
- [ ] Selected count indicator (e.g., "3 of 5 selected")
- [ ] Tabs for different views:
  - [ ] All Experts
  - [ ] Categories (Tech, Value, Growth, etc.)
  - [ ] My Favorites
  - [ ] Recently Used
- [ ] Footer with action buttons:
  - [ ] Cancel
  - [ ] Clear Selection
  - [ ] Apply Selection
  - [ ] Save as Default (optional)

### 3. Expert Grid Component (`expert-grid.tsx`)
- [ ] Responsive grid layout
- [ ] Expert cards with:
  - [ ] Checkbox for selection
  - [ ] Expert photo/avatar
  - [ ] Name and title
  - [ ] Key focus area badges
  - [ ] Investing law preview
  - [ ] "Learn More" expand action
- [ ] Visual feedback for selected state
- [ ] Disabled state for unavailable experts
- [ ] Loading skeleton while fetching

### 4. Expert Preview Card (`expert-preview-card.tsx`)
- [ ] Expanded view with full details
- [ ] Complete investing law
- [ ] Framework description
- [ ] Historical performance (future)
- [ ] Example analyses using this expert
- [ ] Select/Deselect toggle

### 5. Quick Presets Component (`expert-quick-presets.tsx`)
- [ ] Preset combinations:
  - [ ] "Tech Innovators" (Doerr, Sacks, Hoffman, Khosla)
  - [ ] "Value Investors" (Gurley, Druckenmiller)
  - [ ] "Growth & AI" (Gerstner, Meeker, Kindig)
  - [ ] "Balanced View" (Mix of different perspectives)
  - [ ] "All Experts" (Select all available)
- [ ] One-click selection
- [ ] Preview of included experts
- [ ] Custom preset creation (future)

### 6. Selected Experts Bar (`selected-experts-bar.tsx`)
- [ ] Horizontal scrollable list of selected experts
- [ ] Expert chips with:
  - [ ] Name
  - [ ] Remove button (X)
- [ ] Clear all button
- [ ] Reorder capability (drag and drop)
- [ ] Collapse/expand for mobile

### 7. Integration with Analysis Flow
- [ ] Pass selected expert IDs to content generation
- [ ] Store selection with analysis results
- [ ] Display which experts were used in output
- [ ] Allow re-running with different experts

### 8. User Preferences
- [ ] Save selection as default preference
- [ ] Load saved preferences on next visit
- [ ] Reset to defaults option
- [ ] Preference sync across devices

### 9. Mobile Optimizations
- [ ] Bottom sheet for selection modal
- [ ] Swipe gestures for navigation
- [ ] Larger touch targets
- [ ] Simplified layout
- [ ] Progressive disclosure of details

### 10. Performance Optimizations
- [ ] Lazy load expert details
- [ ] Virtual scrolling for long lists
- [ ] Image optimization for avatars
- [ ] Debounced search
- [ ] Optimistic UI updates

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