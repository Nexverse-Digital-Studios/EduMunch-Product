# Advanced Analytics

## Overview
The Advanced Analytics module provides sophisticated data analysis capabilities including predictive analytics, at-risk student identification, trend analysis, data visualization, and business intelligence dashboards.

## Module Objectives
- Provide advanced data analysis
- Identify at-risk students
- Create predictive models
- Generate trend analysis
- Build visualization dashboards
- Support data-driven decisions
- Track KPIs and metrics

## Key Features

### 1. Predictive Analytics
- **Prediction Models**
  - Student dropout prediction
  - Grade prediction
  - Attendance prediction
  - Assignment completion prediction
  - Career path recommendation

- **Model Management**
  - Model training
  - Model validation
  - Model versioning
  - Performance metrics
  - Retraining schedule

### 2. At-Risk Student Identification
- **Risk Factors**
  - Low attendance
  - Poor grades
  - Assignment non-completion
  - Engagement metrics
  - Payment issues

- **Risk Scoring**
  - Weighted scoring
  - Risk categorization (Low, Medium, High)
  - Early warning system
  - Intervention recommendations

### 3. Trend Analysis
- **Trend Types**
  - Student performance trends
  - Enrollment trends
  - Fee collection trends
  - Staff performance trends
  - Course popularity trends

- **Trend Features**
  - Time series analysis
  - Seasonal patterns
  - Growth/decline detection
  - Forecasting

### 4. Data Visualization
- **Chart Types**
  - Line charts
  - Bar charts
  - Pie charts
  - Heatmaps
  - Scatter plots
  - Sankey diagrams
  - Geographical maps

- **Dashboard Features**
  - Customizable dashboards
  - Drag-drop widgets
  - Real-time updates
  - Drill-down capabilities
  - Export charts

### 5. KPI Tracking
- **Academic KPIs**
  - Average student performance
  - Pass/fail ratio
  - Attendance rate
  - Course completion rate
  - Student satisfaction

- **Operational KPIs**
  - Admission rate
  - Retention rate
  - Fee collection rate
  - Staff efficiency
  - Resource utilization

### 6. Comparative Analytics
- **Comparisons**
  - Batch-wise comparison
  - Teacher-wise comparison
  - Course-wise comparison
  - Year-on-year comparison
  - Class-wise comparison

## Database Schema

### Tables

#### `predictive_models`
```sql
CREATE TABLE predictive_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Model
  model_name VARCHAR(255) NOT NULL,
  model_type VARCHAR(50) NOT NULL, -- DROPOUT, GRADE, ATTENDANCE, ASSIGNMENT, CAREER
  
  -- Configuration
  features JSONB, -- Array of features used
  training_data_size INT,
  
  -- Performance
  accuracy DECIMAL(5,4),
  precision DECIMAL(5,4),
  recall DECIMAL(5,4),
  f1_score DECIMAL(5,4),
  
  -- Status
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, RETRAINING
  
  last_trained_at TIMESTAMP,
  next_retraining_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `at_risk_students`
```sql
CREATE TABLE at_risk_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Student
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  -- Risk assessment
  risk_score INT, -- 0-100
  risk_level VARCHAR(50), -- LOW, MEDIUM, HIGH
  risk_category VARCHAR(50), -- ACADEMIC, ATTENDANCE, BEHAVIORAL, FINANCIAL
  
  -- Risk factors
  identified_risk_factors JSONB, -- Array of factors
  
  -- Intervention
  recommended_intervention TEXT,
  intervention_assigned_to UUID REFERENCES employees(id),
  
  -- Timeline
  identified_at TIMESTAMP DEFAULT NOW(),
  follow_up_date DATE,
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, RESOLVED, ESCALATED
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `trend_analysis`
```sql
CREATE TABLE trend_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Trend
  trend_name VARCHAR(255) NOT NULL,
  trend_type VARCHAR(50) NOT NULL, -- PERFORMANCE, ENROLLMENT, FEES, STAFF, COURSE
  
  -- Data points
  data_points JSONB, -- Array of {date, value}
  
  -- Analysis
  trend_direction VARCHAR(50), -- UP, DOWN, STABLE
  change_percentage DECIMAL(5,2),
  
  -- Forecast
  forecast_data JSONB, -- Future predictions
  
  -- Period
  analysis_period_start DATE,
  analysis_period_end DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `analytics_dashboards`
```sql
CREATE TABLE analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Dashboard
  dashboard_name VARCHAR(255) NOT NULL,
  dashboard_type VARCHAR(50), -- EXECUTIVE, OPERATIONAL, ACADEMIC, FINANCIAL
  
  -- Configuration
  widgets JSONB, -- Array of widget definitions
  layout JSONB, -- Dashboard layout configuration
  
  -- Access
  created_by UUID NOT NULL REFERENCES employees(id),
  is_public BOOLEAN DEFAULT FALSE,
  shared_with JSONB, -- Array of user IDs
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `kpi_definitions`
```sql
CREATE TABLE kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- KPI
  kpi_name VARCHAR(255) NOT NULL,
  kpi_category VARCHAR(100), -- ACADEMIC, OPERATIONAL, FINANCIAL
  
  -- Calculation
  calculation_method VARCHAR(50), -- FORMULA, AGGREGATE, CUSTOM
  calculation_formula TEXT, -- SQL or custom logic
  
  -- Targets
  target_value DECIMAL(10,2),
  warning_threshold DECIMAL(10,2),
  critical_threshold DECIMAL(10,2),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `kpi_values`
```sql
CREATE TABLE kpi_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,
  
  -- Value
  calculated_value DECIMAL(10,2),
  target_value DECIMAL(10,2),
  
  -- Status
  status VARCHAR(50), -- ON_TRACK, AT_RISK, CRITICAL
  
  -- Timeline
  measurement_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `student_risk_history`
```sql
CREATE TABLE student_risk_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  -- Assessment
  assessment_date TIMESTAMP,
  risk_score INT,
  risk_level VARCHAR(50),
  
  -- Factors
  risk_factors JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### Current At-Risk Students
```sql
SELECT 
  ars.id,
  CONCAT(s.first_name, ' ', s.last_name) as student_name,
  ars.risk_score,
  ars.risk_level,
  ars.risk_category,
  CONCAT(e.first_name, ' ', e.last_name) as intervention_owner,
  ars.follow_up_date
FROM at_risk_students ars
JOIN students s ON ars.student_id = s.id
LEFT JOIN employees e ON ars.intervention_assigned_to = e.id
WHERE ars.organization_id = $1
  AND ars.status = 'ACTIVE'
ORDER BY ars.risk_score DESC;
```

## Components

### AnalyticsDashboard
Location: `src/features/analytics/components/AnalyticsDashboard.tsx`

**Purpose:** Display analytics dashboard

**Props:**
```typescript
interface AnalyticsDashboardProps {
  organizationId: string;
  dashboardType?: 'executive' | 'operational' | 'academic';
}
```

**Features:**
- Widget display
- KPI cards
- Real-time updates
- Drill-down
- Export

### TrendChart
Location: `src/features/analytics/components/TrendChart.tsx`

**Purpose:** Display trend analysis

**Props:**
```typescript
interface TrendChartProps {
  trendId: string;
  timeRange?: DateRange;
}
```

**Features:**
- Multiple chart types
- Time series display
- Forecast visualization
- Comparative trends

### PredictiveModel
Location: `src/features/analytics/components/PredictiveModel.tsx`

**Purpose:** Display predictions

**Props:**
```typescript
interface PredictiveModelProps {
  modelType: string;
  filters?: Record<string, any>;
}
```

**Features:**
- Prediction display
- Confidence scores
- Model details
- Historical accuracy

### AtRiskStudentsList
Location: `src/features/analytics/components/AtRiskStudentsList.tsx`

**Purpose:** List and manage at-risk students

**Props:**
```typescript
interface AtRiskStudentsListProps {
  organizationId: string;
  filters?: RiskFilters;
}
```

**Features:**
- Student listing
- Risk scoring
- Intervention tracking
- Bulk actions

## Services

### `analytics.service.ts`
Location: `src/features/analytics/services/analytics.service.ts`

```typescript
// Predictive Models
async trainModel(modelType: string, data: ModelTrainingInput): Promise<PredictiveModel>
async getModelPerformance(modelId: string): Promise<ModelPerformance>
async getPrediction(modelId: string, studentId: string): Promise<Prediction>
async batchPredict(modelId: string, studentIds: string[]): Promise<Prediction[]>

// At-Risk Analysis
async identifyAtRiskStudents(organizationId: string): Promise<AtRiskStudent[]>
async getStudentRiskScore(studentId: string): Promise<RiskScore>
async assignIntervention(studentId: string, interventionId: string): Promise<void>
async getAtRiskHistory(studentId: string): Promise<RiskHistory[]>

// Trend Analysis
async analyzePerformanceTrend(organizationId: string, period: DateRange): Promise<TrendAnalysis>
async analyzeEnrollmentTrend(organizationId: string, period: DateRange): Promise<TrendAnalysis>
async analyzeFeeTrend(organizationId: string, period: DateRange): Promise<TrendAnalysis>
async forecastTrend(trendId: string, forecastMonths: number): Promise<Forecast>

// KPI Management
async calculateKPI(kpiId: string): Promise<KPIValue>
async getKPIStatus(kpiId: string): Promise<KPIStatus>
async listKPIs(organizationId: string): Promise<KPIDefinition[]>
async getKPIHistory(kpiId: string, period: DateRange): Promise<KPIHistory[]>

// Dashboards
async createDashboard(data: DashboardInput): Promise<Dashboard>
async getDashboard(dashboardId: string): Promise<Dashboard>
async updateDashboardLayout(dashboardId: string, layout: LayoutConfig): Promise<void>
async listDashboards(organizationId: string): Promise<Dashboard[]>

// Analytics Data
async getComparativeAnalytics(organizationId: string, compareBy: string): Promise<ComparisonData>
async getPerformanceAnalytics(organizationId: string, period: DateRange): Promise<PerformanceMetrics>
async getExportAnalytics(organizationId: string): Promise<ExportData>
```

### `analytics.queries.ts`
Location: `src/features/analytics/services/analytics.queries.ts`

```typescript
// React Query hooks
export const useAtRiskStudents = (organizationId: string)
export const useStudentRiskScore = (studentId: string)
export const useTrendAnalysis = (trendType: string, period: DateRange)
export const useKPIValue = (kpiId: string)
export const useDashboard = (dashboardId: string)
export const usePrediction = (modelId: string, studentId: string)

// Mutations
export const useTrainModel = ()
export const useIdentifyAtRisk = ()
export const useAssignIntervention = ()
export const useCreateDashboard = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/predictive_models?organization_id=eq.{id}
POST   /rest/v1/predictive_models
PATCH  /rest/v1/predictive_models/{id}

GET    /rest/v1/at_risk_students?organization_id=eq.{id}
POST   /rest/v1/at_risk_students
PATCH  /rest/v1/at_risk_students/{id}

GET    /rest/v1/trend_analysis?organization_id=eq.{id}
POST   /rest/v1/trend_analysis

GET    /rest/v1/analytics_dashboards?organization_id=eq.{id}
POST   /rest/v1/analytics_dashboards
PATCH  /rest/v1/analytics_dashboards/{id}

GET    /rest/v1/kpi_definitions?organization_id=eq.{id}
POST   /rest/v1/kpi_definitions
PATCH  /rest/v1/kpi_definitions/{id}

GET    /rest/v1/kpi_values?kpi_id=eq.{id}
POST   /rest/v1/kpi_values
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Users can view dashboards shared with them
CREATE POLICY analytics_dashboards_view ON analytics_dashboards
  FOR SELECT USING (
    is_public = TRUE
    OR created_by = (SELECT id FROM employees WHERE auth.uid() = user_id)
    OR (SELECT id FROM auth.users WHERE id = auth.uid()) = ANY(shared_with)
  );

-- Only authorized users can view at-risk data
CREATE POLICY at_risk_students_view ON at_risk_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employee_roles 
      WHERE employee_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
      AND role_id IN (SELECT id FROM roles WHERE name IN ('ADMIN', 'COUNSELOR', 'TEACHER'))
    )
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up data warehouse
3. Configure models

### Phase 2: At-Risk Identification
1. Implement risk scoring
2. Build AtRiskStudentsList
3. Add intervention tracking

### Phase 3: Trend Analysis
1. Implement trend calculations
2. Build TrendChart
3. Add forecasting

### Phase 4: Dashboards
1. Build AnalyticsDashboard
2. Implement KPI tracking
3. Add visualization

### Phase 5: Predictions
1. Train models
2. Implement predictions
3. Build PredictiveModel component

## Testing Strategy

### Unit Tests
- Risk scoring algorithm
- Trend calculations
- KPI calculations
- Model accuracy

### Component Tests
- Dashboard rendering
- Chart display
- KPI updates

### Integration Tests
- End-to-end analytics pipeline
- Model training
- Prediction accuracy

## Performance Optimization

- Index on `organization_id, status`
- Cache KPI values
- Background job for model training
- Data warehouse for analytics
- Archive old trend data

## Future Enhancements

- Machine learning models
- Sentiment analysis
- Natural language insights
- Real-time dashboards
- Advanced filtering
- Mobile analytics app
- Automated insights
- Custom metric creation
