# Expert Framework Selection Feature - Implementation Guide

## Overview
This feature enables dynamic selection of investment expert frameworks for stock analysis. Instead of using fixed experts, users can choose which expert perspectives they want to apply to their analysis.

## Current State
- 5 default experts hardcoded: Bill Gurley, Brad Gerstner, Stanley Druckenmiller, Mary Meeker, Beth Kindig
- Expert perspectives appear in "Expert POV Overlay" section of analysis output
- No user control over which experts are used

## Target State
- 10+ expert frameworks available (5 original + 5 tech-focused + custom)
- Admin can manage experts (add, edit, delete, enable/disable)
- Users can select which experts to use for analysis
- System tracks which experts were used for each analysis

## Implementation Phases

### Phase 1: Admin Expert Management (Current Priority)
- Complete CRUD operations for expert management
- Admin interface for managing expert frameworks
- Seed initial 10 experts into database
- API endpoints for expert operations

### Phase 2: User Selection Interface (Next Phase)
- Expert selection modal/page in analysis flow
- User preference saving
- Multi-select capability with preview
- Integration with content generation

### Phase 3: Advanced Features (Future)
- Expert categories and tags
- Performance tracking per expert
- Custom expert frameworks per user
- Expert recommendation based on stock type

## Database Schema

### experts table
```sql
CREATE TABLE experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  focus_areas TEXT,
  investing_law TEXT NOT NULL,
  framework_description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  category VARCHAR(100), -- 'value', 'growth', 'tech', 'macro', etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### user_expert_preferences table
```sql
CREATE TABLE user_expert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_ids UUID[] NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### analysis_experts table
```sql
CREATE TABLE analysis_experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL, -- Reference to analysis/blog
  expert_ids UUID[] NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Default Expert Data

### Original 5 Experts

1. **Bill Gurley**
   - Title: Legendary VC at Benchmark
   - Focus: Valuation discipline, marketplace dynamics, network effects
   - Investing Law: "All revenue is not created equal - focus on high-margin, recurring revenue with pricing power"

2. **Brad Gerstner**
   - Title: Founder of Altimeter Capital
   - Focus: AI transformation, growth at reasonable prices, tech platforms
   - Investing Law: "The best investments combine secular growth trends with reasonable valuations"

3. **Stanley Druckenmiller**
   - Title: Legendary Macro Investor
   - Focus: Macro trends, market cycles, risk management
   - Investing Law: "It's not whether you're right or wrong, but how much money you make when you're right and how much you lose when you're wrong"

4. **Mary Meeker**
   - Title: Partner at Bond Capital, "Queen of the Internet"
   - Focus: Internet trends, digital transformation, data-driven insights
   - Investing Law: "Data is the new oil - companies that harness it effectively will dominate their industries"

5. **Beth Kindig**
   - Title: Lead Tech Analyst at I/O Fund
   - Focus: Deep tech research, semiconductor cycles, AI infrastructure
   - Investing Law: "The biggest returns come from identifying technology inflection points before the crowd"

### Additional 5 Tech-Oriented Experts

6. **John Doerr**
   - Title: Chairman at Kleiner Perkins
   - Focus: Early-stage tech, climate tech, OKR-driven scaling
   - Investing Law: "Ideas are easy — execution is everything, and measurable goals drive execution"

7. **David Sacks**
   - Title: Co-founder of Craft Ventures, PayPal Mafia
   - Focus: B2B SaaS metrics, go-to-market strategy, product-led growth
   - Investing Law: "In SaaS, growth is vanity, retention is sanity, cash flow is reality"

8. **Reid Hoffman**
   - Title: Co-founder of LinkedIn, Partner at Greylock
   - Focus: Network effects, blitzscaling, AI platform building
   - Investing Law: "If you're not embarrassed by your first product, you've launched too late"

9. **Vinod Khosla**
   - Title: Founder of Khosla Ventures
   - Focus: Moonshot tech, AI/biotech/climate, asymmetric upside
   - Investing Law: "If everyone agrees with you, you're probably not innovating enough"

10. **Arthur Rock**
    - Title: Silicon Valley Pioneer, Early Intel & Apple Investor
    - Focus: Foundational venture capital, early-stage governance, founder quality
    - Investing Law: "The best investment you can make is in the right people at the right time"

## TypeScript Interfaces

```typescript
// src/types/expert.ts
export interface Expert {
  id: string
  name: string
  title?: string
  focus_areas?: string
  investing_law: string
  framework_description?: string
  is_default: boolean
  is_active: boolean
  display_order?: number
  category?: 'value' | 'growth' | 'tech' | 'macro' | 'custom'
  created_at: string
  updated_at: string
}

export interface UserExpertPreference {
  id: string
  user_id: string
  expert_ids: string[]
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface ExpertSelectionConfig {
  minExperts: number  // Minimum experts to select (default: 1)
  maxExperts: number  // Maximum experts to select (default: 5)
  defaultExperts: string[]  // IDs of experts selected by default
  categories: string[]  // Available categories for filtering
}
```

## API Endpoints

### Expert Management (Admin)

#### GET /api/experts
- Query params: `?active=true&category=tech&search=gurley`
- Returns: Array of Expert objects
- Auth: Public (filtered by is_active for non-admin)

#### GET /api/experts/[id]
- Returns: Single Expert object
- Auth: Public (only active experts for non-admin)

#### POST /api/experts
- Body: Expert object (without id, timestamps)
- Returns: Created Expert object
- Auth: Admin only

#### PUT /api/experts/[id]
- Body: Partial Expert object
- Returns: Updated Expert object
- Auth: Admin only

#### DELETE /api/experts/[id]
- Returns: Success message
- Auth: Admin only

#### POST /api/experts/bulk
- Body: `{ action: 'activate' | 'deactivate', expert_ids: string[] }`
- Returns: Updated experts
- Auth: Admin only

### User Preferences

#### GET /api/user/expert-preferences
- Returns: User's saved expert preferences
- Auth: Authenticated user

#### POST /api/user/expert-preferences
- Body: `{ expert_ids: string[], is_default: boolean }`
- Returns: Saved preferences
- Auth: Authenticated user

## UI Components Structure

### Admin Components (/src/app/admin/experts/)

```
experts/
├── page.tsx                 # Main experts management page
├── _page/
│   ├── experts-page.tsx    # Page container component
│   └── index.ts
├── _sections/
│   ├── expert-list.tsx     # List/grid of experts
│   ├── expert-card.tsx     # Individual expert card
│   ├── expert-form.tsx     # Add/edit expert form
│   ├── expert-header.tsx   # Page header with actions
│   ├── expert-filters.tsx  # Search and filter controls
│   └── index.ts
└── _hooks/
    ├── use-experts.ts       # Data fetching and state
    └── use-expert-form.ts   # Form handling logic
```

### User Components (/src/components/expert-selection/)

```
expert-selection/
├── expert-selection-modal.tsx    # Modal for selecting experts
├── expert-grid.tsx               # Grid display of available experts
├── expert-preview-card.tsx       # Detailed preview of expert
├── expert-quick-presets.tsx      # Quick selection presets
└── selected-experts-bar.tsx      # Shows currently selected experts
```

## Integration Points

### Content Generation Service
Modify `ContentGenerationService.generateContent()` to accept expert configurations:

```typescript
interface GenerationOptions {
  system_prompt: string
  experts?: Expert[]  // Selected experts for this generation
}

static async generateContent(options: GenerationOptions): Promise<string> {
  // Include expert frameworks in prompt construction
}
```

### Newsletter Service
Update newsletter generation to use selected experts:

```typescript
static async generateAndSend(
  recipients: string[],
  subject: string,
  options?: {
    experts?: string[]  // Expert IDs to use
    // ... other options
  }
)
```

## Configuration Storage

Store default expert configuration in database:

```sql
-- configurations table addition
ALTER TABLE configurations ADD COLUMN default_expert_ids UUID[];
ALTER TABLE configurations ADD COLUMN expert_selection_config JSONB;
```

## Migration Strategy

1. Create database tables
2. Seed initial 10 experts
3. Update configurations to reference expert IDs
4. Modify content generation to use dynamic experts
5. Deploy admin interface
6. Test with admin users
7. Deploy user selection interface
8. Gradual rollout to users

## Error Handling

- Validate minimum/maximum expert selection
- Handle deleted experts in saved preferences
- Fallback to default experts if selection fails
- Log expert usage for analytics
- Graceful degradation if expert service unavailable

## Performance Considerations

- Cache expert list (invalidate on changes)
- Lazy load expert details in selection modal
- Batch API requests for multiple expert fetches
- Index expert_ids arrays in database for fast queries
- Consider pagination for large custom expert lists

## Security Considerations

- Admin-only access for expert management
- Rate limiting on expert API endpoints
- Sanitize expert content (prevent XSS)
- Audit log for expert modifications
- Validate expert IDs in user preferences

## Testing Requirements

- Unit tests for expert CRUD operations
- Integration tests for expert selection flow
- E2E tests for complete analysis with selected experts
- Performance tests with many experts
- Accessibility tests for selection interface

## Success Metrics

- Number of custom experts created
- Expert selection rate by users
- Most/least selected experts
- Analysis completion rate with custom experts
- User satisfaction with expert variety

## Future Enhancements

- Expert recommendation engine
- Expert performance tracking
- Community-contributed experts
- Expert marketplace
- AI-generated expert frameworks
- Expert collaboration (combining frameworks)
- Seasonal expert rotations
- Expert versioning and history