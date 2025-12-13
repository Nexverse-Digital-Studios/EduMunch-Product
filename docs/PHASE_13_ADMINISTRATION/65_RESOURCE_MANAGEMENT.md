# 65 - Resource Management

## Overview

The Resource Management system manages physical resources used by the institution including classrooms, labs, equipment, and facilities. This module handles resource allocation, booking, scheduling, utilization tracking, and maintenance scheduling to optimize resource usage across branches.

**Module Dependencies:**
- Branches Management (for resource allocation)
- Timetable Scheduling (for conflict detection)
- Inventory Management (for equipment tracking)
- User Management (for resource assignments)

**Technology Stack:**
- Frontend: React + TypeScript + React Query + FullCalendar
- Backend: Supabase PostgreSQL + AutoAPI
- Scheduling: Conflict detection algorithm
- Real-time: Postgres notifications for bookings

---

## Database Schema

### 1. resource_types
```sql
CREATE TABLE resource_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resource_type_name VARCHAR(255) NOT NULL,
  resource_code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(organization_id, resource_code),
  INDEX idx_org_types ON organization_id
);

ALTER TABLE resource_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View resource types"
  ON resource_types FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  ));
```

### 2. resources
```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  resource_type_id UUID NOT NULL REFERENCES resource_types(id) ON DELETE RESTRICT,
  resource_name VARCHAR(255) NOT NULL,
  resource_code VARCHAR(100) UNIQUE NOT NULL,
  location VARCHAR(255),
  capacity INTEGER, -- seating/equipment count
  resource_status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, UNDER_MAINTENANCE, RETIRED
  acquisition_date DATE,
  acquisition_cost DECIMAL(14, 2),
  depreciation_rate DECIMAL(5, 2), -- percentage per year
  replacement_date DATE,
  notes TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(branch_id, resource_code),
  INDEX idx_org_resources ON organization_id,
  INDEX idx_branch_resources ON branch_id,
  INDEX idx_type_resources ON resource_type_id,
  INDEX idx_resource_status ON resource_status
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View branch resources"
  ON resources FOR SELECT
  USING (branch_id IN (
    SELECT branch_id FROM branch_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Manage resources with permission"
  ON resources FOR ALL
  USING (
    branch_id IN (
      SELECT branch_id FROM branch_users WHERE user_id = auth.uid()
    ) AND organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'resource_manager')
    )
  );
```

### 3. resource_bookings
```sql
CREATE TABLE resource_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  booked_by UUID NOT NULL REFERENCES auth.users(id),
  booking_purpose VARCHAR(255),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(50), -- DAILY, WEEKLY, MONTHLY
  recurrence_end_date DATE,
  booking_status VARCHAR(50) DEFAULT 'CONFIRMED', -- PENDING, CONFIRMED, CANCELLED
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_resource_bookings ON resource_id,
  INDEX idx_booking_date ON booking_date,
  INDEX idx_booked_by ON booked_by,
  INDEX idx_booking_status ON booking_status,
  CHECK (end_time > start_time)
);

ALTER TABLE resource_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View bookings"
  ON resource_bookings FOR SELECT
  USING (
    resource_id IN (
      SELECT id FROM resources 
      WHERE branch_id IN (
        SELECT branch_id FROM branch_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Create and manage bookings"
  ON resource_bookings FOR ALL
  USING (
    booked_by = auth.uid() OR
    resource_id IN (
      SELECT id FROM resources 
      WHERE branch_id IN (
        SELECT branch_id FROM branch_users WHERE user_id = auth.uid()
      ) AND organization_id IN (
        SELECT organization_id FROM user_roles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'resource_manager')
      )
    )
  );
```

### 4. resource_allocations
```sql
CREATE TABLE resource_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id),
  department_id UUID,
  user_id UUID REFERENCES auth.users(id),
  allocation_type VARCHAR(50), -- PERMANENT, TEMPORARY, SEMESTER
  allocation_start_date DATE NOT NULL,
  allocation_end_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_resource_alloc ON resource_id,
  INDEX idx_batch_alloc ON batch_id,
  INDEX idx_user_alloc ON user_id
);

ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View allocations"
  ON resource_allocations FOR SELECT
  USING (
    resource_id IN (
      SELECT id FROM resources 
      WHERE branch_id IN (
        SELECT branch_id FROM branch_users WHERE user_id = auth.uid()
      )
    )
  );
```

### 5. resource_maintenance
```sql
CREATE TABLE resource_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(50), -- PREVENTIVE, CORRECTIVE, EMERGENCY
  maintenance_date DATE NOT NULL,
  scheduled_completion_date DATE,
  actual_completion_date DATE,
  maintenance_status VARCHAR(50) DEFAULT 'SCHEDULED', 
  -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  contractor_name VARCHAR(255),
  maintenance_cost DECIMAL(12, 2),
  parts_replaced TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_resource_maintenance ON resource_id,
  INDEX idx_maintenance_date ON maintenance_date,
  INDEX idx_maintenance_status ON maintenance_status
);

ALTER TABLE resource_maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View maintenance records"
  ON resource_maintenance FOR SELECT
  USING (
    resource_id IN (
      SELECT id FROM resources 
      WHERE branch_id IN (
        SELECT branch_id FROM branch_users WHERE user_id = auth.uid()
      ) OR organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );
```

### 6. resource_utilization
```sql
CREATE TABLE resource_utilization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  utilization_date DATE NOT NULL,
  total_available_slots INTEGER,
  booked_slots INTEGER,
  utilization_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
    (booked_slots::DECIMAL / NULLIF(total_available_slots, 0)) * 100
  ) STORED,
  peak_hours VARCHAR(255), -- most booked hours
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(resource_id, utilization_date),
  INDEX idx_resource_util ON resource_id,
  INDEX idx_util_date ON utilization_date
);

ALTER TABLE resource_utilization ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View utilization"
  ON resource_utilization FOR SELECT
  USING (
    resource_id IN (
      SELECT id FROM resources 
      WHERE branch_id IN (
        SELECT branch_id FROM branch_users WHERE user_id = auth.uid()
      ) OR organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );
```

### 7. lab_schedules
```sql
CREATE TABLE lab_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  schedule_day VARCHAR(20) NOT NULL, -- Monday, Tuesday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  week_number INTEGER, -- 1-52
  lab_strength INTEGER,
  equipment_required TEXT,
  experiment_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_lab_resource ON lab_resource_id,
  INDEX idx_batch_schedule ON batch_id,
  INDEX idx_day_schedule ON schedule_day
);

ALTER TABLE lab_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View lab schedules"
  ON lab_schedules FOR SELECT
  USING (
    lab_resource_id IN (
      SELECT id FROM resources 
      WHERE branch_id IN (
        SELECT branch_id FROM branch_users WHERE user_id = auth.uid()
      )
    )
  );
```

### 8. resource_requests
```sql
CREATE TABLE resource_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resource_type_id UUID REFERENCES resource_types(id),
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  requested_date DATE DEFAULT CURRENT_DATE,
  justification TEXT NOT NULL,
  estimated_cost DECIMAL(14, 2),
  request_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, IMPLEMENTED
  approval_date DATE,
  approved_by UUID REFERENCES auth.users(id),
  implementation_date DATE,
  created_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_org_requests ON organization_id,
  INDEX idx_request_status ON request_status
);

ALTER TABLE resource_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View organization requests"
  ON resource_requests FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  ));
```

---

## React Components

### ResourceDashboard.tsx
```typescript
interface ResourceDashboardProps {
  organizationId: string;
  branchId: string;
}

export const ResourceDashboard: React.FC<ResourceDashboardProps> = ({
  organizationId,
  branchId
}) => {
  const { data: resources } = useResources(branchId);
  const { data: bookings } = useResourceBookingsForDate(branchId, new Date());
  const { data: utilization } = useResourceUtilization(branchId);
  const { data: maintenance } = useScheduledMaintenance(branchId);

  const resourceMetrics = {
    totalResources: resources?.length ?? 0,
    available: resources?.filter(r => r.resource_status === 'AVAILABLE').length ?? 0,
    underMaintenance: resources?.filter(r => r.resource_status === 'UNDER_MAINTENANCE').length ?? 0,
    avgUtilization: utilization?.[0]?.utilization_percentage ?? 0
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Total Resources"
          value={resourceMetrics.totalResources}
          icon={<Package />}
        />
        <MetricCard
          label="Available"
          value={resourceMetrics.available}
          icon={<CheckCircle className="text-green-600" />}
        />
        <MetricCard
          label="Under Maintenance"
          value={resourceMetrics.underMaintenance}
          icon={<Wrench className="text-yellow-600" />}
        />
        <MetricCard
          label="Avg Utilization"
          value={`${resourceMetrics.avgUtilization.toFixed(0)}%`}
          icon={<Activity />}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingsList bookings={bookings || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <UtilizationChart resources={resources || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <MaintenanceList maintenance={maintenance || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
```

### ResourceBookingCalendar.tsx
```typescript
interface ResourceBookingCalendarProps {
  resourceId: string;
  branchId: string;
}

export const ResourceBookingCalendar: React.FC<ResourceBookingCalendarProps> = ({
  resourceId,
  branchId
}) => {
  const [date, setDate] = useState(new Date());
  const { data: resource } = useResource(resourceId);
  const { data: bookings } = useResourceBookings(resourceId, date);

  const calendarEvents = bookings?.map(booking => ({
    id: booking.id,
    title: `${booking.booking_purpose}`,
    start: `${booking.booking_date}T${booking.start_time}`,
    end: `${booking.booking_date}T${booking.end_time}`,
    backgroundColor: booking.booking_status === 'CONFIRMED' ? '#3b82f6' : '#fbbf24',
    extendedProps: {
      bookingId: booking.id,
      status: booking.booking_status
    }
  })) || [];

  const handleSelectSlot = (info: { start: Date; end: Date }) => {
    // Open booking form with selected time
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{resource?.resource_name}</h2>
        <Button className="bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={calendarEvents}
        select={handleSelectSlot}
        selectable={true}
        eventClick={(info) => handleEventClick(info.event)}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        height="auto"
      />
    </div>
  );
};
```

### ResourceBookingForm.tsx
```typescript
interface ResourceBookingFormProps {
  resourceId: string;
  initialDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
  onSuccess?: () => void;
}

export const ResourceBookingForm: React.FC<ResourceBookingFormProps> = ({
  resourceId,
  initialDate,
  initialStartTime,
  initialEndTime,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    booking_date: initialDate?.toISOString().split('T')[0] || '',
    start_time: initialStartTime || '09:00',
    end_time: initialEndTime || '10:00',
    booking_purpose: '',
    is_recurring: false,
    recurrence_pattern: 'WEEKLY',
    recurrence_end_date: '',
    notes: ''
  });

  const { data: resource } = useResource(resourceId);
  const { data: existingBookings } = useResourceBookings(resourceId);
  const mutation = useCreateResourceBooking();

  const isTimeSlotAvailable = (): boolean => {
    return !existingBookings?.some(booking =>
      booking.booking_date === formData.booking_date &&
      booking.booking_status === 'CONFIRMED' &&
      !(formData.end_time <= booking.start_time || formData.start_time >= booking.end_time)
    );
  };

  const handleSubmit = async () => {
    if (!isTimeSlotAvailable()) {
      alert('Time slot is not available. Please choose another time.');
      return;
    }

    await mutation.mutateAsync({
      resource_id: resourceId,
      ...formData
    });
    onSuccess?.();
  };

  return (
    <Form>
      <div className="p-4 bg-blue-50 rounded mb-6">
        <p className="font-semibold">{resource?.resource_name}</p>
        <p className="text-sm text-gray-600">{resource?.location}</p>
        {resource?.capacity && (
          <p className="text-sm text-gray-600">Capacity: {resource.capacity}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Booking Date"
          type="date"
          value={formData.booking_date}
          onChange={(value) => setFormData({ ...formData, booking_date: value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <FormField
          label="Start Time"
          type="time"
          value={formData.start_time}
          onChange={(value) => setFormData({ ...formData, start_time: value })}
          required
        />
        <FormField
          label="End Time"
          type="time"
          value={formData.end_time}
          onChange={(value) => setFormData({ ...formData, end_time: value })}
          required
        />
      </div>

      <FormField
        label="Purpose"
        value={formData.booking_purpose}
        onChange={(value) => setFormData({ ...formData, booking_purpose: value })}
        className="mt-4"
        required
      />

      <Checkbox
        label="Recurring Booking"
        checked={formData.is_recurring}
        onChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
        className="mt-4"
      />

      {formData.is_recurring && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Select
            label="Recurrence"
            options={[
              { label: 'Daily', value: 'DAILY' },
              { label: 'Weekly', value: 'WEEKLY' },
              { label: 'Monthly', value: 'MONTHLY' }
            ]}
            value={formData.recurrence_pattern}
            onChange={(value) => setFormData({ ...formData, recurrence_pattern: value })}
          />
          <FormField
            label="End Date"
            type="date"
            value={formData.recurrence_end_date}
            onChange={(value) => setFormData({ ...formData, recurrence_end_date: value })}
          />
        </div>
      )}

      <Textarea
        label="Notes"
        value={formData.notes}
        onChange={(value) => setFormData({ ...formData, notes: value })}
        className="mt-4"
        rows={3}
      />

      <Button
        onClick={handleSubmit}
        disabled={mutation.isPending || !isTimeSlotAvailable()}
        className="mt-6"
      >
        Book Resource
      </Button>
    </Form>
  );
};
```

### ResourceList.tsx
```typescript
interface ResourceListProps {
  branchId: string;
  resourceTypeId?: string;
  statusFilter?: string;
}

export const ResourceList: React.FC<ResourceListProps> = ({
  branchId,
  resourceTypeId,
  statusFilter
}) => {
  const { data: resources, isLoading } = useResources(branchId, {
    typeId: resourceTypeId,
    status: statusFilter
  });

  const columns = [
    {
      header: 'Resource Name',
      accessor: 'resource_name',
      render: (row: Resource) => (
        <Link to={`/resources/${row.id}`}>
          <span className="font-semibold hover:underline">{row.resource_name}</span>
        </Link>
      )
    },
    {
      header: 'Code',
      accessor: 'resource_code'
    },
    {
      header: 'Type',
      accessor: 'resource_type',
      render: (row: Resource) => row.resource_type?.resource_type_name
    },
    {
      header: 'Location',
      accessor: 'location'
    },
    {
      header: 'Capacity',
      accessor: 'capacity'
    },
    {
      header: 'Status',
      accessor: 'resource_status',
      render: (row: Resource) => (
        <Badge variant={getStatusColor(row.resource_status)}>
          {row.resource_status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row: Resource) => (
        <div className="flex gap-2">
          <Link to={`/resources/${row.id}/view`}>
            <Button size="sm" variant="outline">View</Button>
          </Link>
          <Link to={`/resources/${row.id}/bookings`}>
            <Button size="sm" variant="outline">Calendar</Button>
          </Link>
          <Link to={`/resources/${row.id}/edit`}>
            <Button size="sm" variant="outline">Edit</Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={resources || []}
      isLoading={isLoading}
    />
  );
};
```

### MaintenanceScheduleForm.tsx
```typescript
interface MaintenanceScheduleFormProps {
  resourceId: string;
  onSuccess?: () => void;
}

export const MaintenanceScheduleForm: React.FC<MaintenanceScheduleFormProps> = ({
  resourceId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    maintenance_type: 'PREVENTIVE',
    maintenance_date: '',
    scheduled_completion_date: '',
    contractor_name: '',
    maintenance_cost: '',
    parts_replaced: '',
    notes: ''
  });

  const { data: resource } = useResource(resourceId);
  const mutation = useScheduleMaintenance();

  const handleSubmit = async () => {
    await mutation.mutateAsync({
      resource_id: resourceId,
      ...formData
    });
    onSuccess?.();
  };

  return (
    <Form>
      <div className="p-4 bg-yellow-50 rounded mb-6">
        <p className="font-semibold">{resource?.resource_name}</p>
        <p className="text-sm text-gray-600">{resource?.location}</p>
      </div>

      <Select
        label="Maintenance Type"
        options={[
          { label: 'Preventive', value: 'PREVENTIVE' },
          { label: 'Corrective', value: 'CORRECTIVE' },
          { label: 'Emergency', value: 'EMERGENCY' }
        ]}
        value={formData.maintenance_type}
        onChange={(value) => setFormData({ ...formData, maintenance_type: value })}
        required
      />

      <div className="grid grid-cols-2 gap-4 mt-4">
        <FormField
          label="Maintenance Date"
          type="date"
          value={formData.maintenance_date}
          onChange={(value) => setFormData({ ...formData, maintenance_date: value })}
          required
        />
        <FormField
          label="Expected Completion"
          type="date"
          value={formData.scheduled_completion_date}
          onChange={(value) => setFormData({ ...formData, scheduled_completion_date: value })}
        />
      </div>

      <FormField
        label="Contractor Name"
        value={formData.contractor_name}
        onChange={(value) => setFormData({ ...formData, contractor_name: value })}
        className="mt-4"
      />

      <FormField
        label="Maintenance Cost (₹)"
        type="number"
        value={formData.maintenance_cost}
        onChange={(value) => setFormData({ ...formData, maintenance_cost: value })}
        className="mt-4"
      />

      <Textarea
        label="Parts Replaced"
        value={formData.parts_replaced}
        onChange={(value) => setFormData({ ...formData, parts_replaced: value })}
        className="mt-4"
        rows={2}
      />

      <Textarea
        label="Notes"
        value={formData.notes}
        onChange={(value) => setFormData({ ...formData, notes: value })}
        className="mt-4"
        rows={3}
      />

      <Button
        onClick={handleSubmit}
        disabled={mutation.isPending}
        className="mt-6"
      >
        Schedule Maintenance
      </Button>
    </Form>
  );
};
```

---

## Service Layer (resourceManagement.service.ts)

```typescript
import { supabase } from '@/config/supabase';

export class ResourceManagementService {
  async createResource(data: CreateResourceRequest) {
    const { data: resource, error } = await supabase
      .from('resources')
      .insert(data)
      .select('*, resource_type:resource_types(*)')
      .single();

    if (error) throw error;
    return resource;
  }

  async getResource(id: string) {
    const { data: resource, error } = await supabase
      .from('resources')
      .select(`
        *,
        resource_type:resource_types(*),
        maintenance:resource_maintenance(*),
        allocations:resource_allocations(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return resource;
  }

  async getResources(branchId: string, filters?: ResourceFilters) {
    let query = supabase
      .from('resources')
      .select('*, resource_type:resource_types(*)')
      .eq('branch_id', branchId);

    if (filters?.typeId) {
      query = query.eq('resource_type_id', filters.typeId);
    }
    if (filters?.status) {
      query = query.eq('resource_status', filters.status);
    }

    const { data: resources, error } = await query.order('resource_name');
    if (error) throw error;
    return resources;
  }

  async createResourceBooking(data: CreateResourceBookingRequest) {
    // Check for conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from('resource_bookings')
      .select('id')
      .eq('resource_id', data.resource_id)
      .eq('booking_date', data.booking_date)
      .eq('booking_status', 'CONFIRMED')
      .or(`(start_time.lt.${data.end_time},end_time.gt.${data.start_time})`);

    if (conflictError) throw conflictError;
    if (conflicts && conflicts.length > 0) {
      throw new Error('Time slot is already booked');
    }

    const { data: booking, error } = await supabase
      .from('resource_bookings')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return booking;
  }

  async getResourceBookings(resourceId: string, date?: Date) {
    let query = supabase
      .from('resource_bookings')
      .select('*')
      .eq('resource_id', resourceId);

    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      query = query.eq('booking_date', dateStr);
    }

    const { data: bookings, error } = await query.order('start_time');
    if (error) throw error;
    return bookings;
  }

  async cancelResourceBooking(bookingId: string) {
    const { data, error } = await supabase
      .from('resource_bookings')
      .update({ booking_status: 'CANCELLED', updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async allocateResource(data: CreateResourceAllocationRequest) {
    const { data: allocation, error } = await supabase
      .from('resource_allocations')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return allocation;
  }

  async scheduleMaintenance(data: CreateMaintenanceRequest) {
    const { data: maintenance, error } = await supabase
      .from('resource_maintenance')
      .insert({
        ...data,
        maintenance_status: 'SCHEDULED'
      })
      .select()
      .single();

    if (error) throw error;

    // Update resource status
    await supabase
      .from('resources')
      .update({ resource_status: 'UNDER_MAINTENANCE' })
      .eq('id', data.resource_id);

    return maintenance;
  }

  async completeMaintenance(maintenanceId: string, actualCost?: number) {
    const { data: maintenance, error: maintenanceError } = await supabase
      .from('resource_maintenance')
      .select('resource_id')
      .eq('id', maintenanceId)
      .single();

    if (maintenanceError) throw maintenanceError;

    const { data, error } = await supabase
      .from('resource_maintenance')
      .update({
        maintenance_status: 'COMPLETED',
        actual_completion_date: new Date().toISOString(),
        maintenance_cost: actualCost
      })
      .eq('id', maintenanceId)
      .select()
      .single();

    if (error) throw error;

    // Restore resource status
    await supabase
      .from('resources')
      .update({ resource_status: 'AVAILABLE' })
      .eq('id', maintenance.resource_id);

    return data;
  }

  async getResourceUtilization(resourceId: string, fromDate: Date, toDate: Date) {
    const { data: bookings, error } = await supabase
      .from('resource_bookings')
      .select('*')
      .eq('resource_id', resourceId)
      .eq('booking_status', 'CONFIRMED')
      .gte('booking_date', fromDate.toISOString().split('T')[0])
      .lte('booking_date', toDate.toISOString().split('T')[0]);

    if (error) throw error;

    // Calculate utilization percentage
    const totalDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    const bookedDays = new Set(bookings?.map(b => b.booking_date)).size;
    const utilizationPercentage = (bookedDays / totalDays) * 100;

    return {
      totalBookings: bookings?.length || 0,
      bookedDays,
      totalDays,
      utilizationPercentage: Math.round(utilizationPercentage)
    };
  }

  async getScheduledMaintenance(branchId: string, upcomingDays: number = 30) {
    const fromDate = new Date();
    const toDate = new Date(fromDate.getTime() + upcomingDays * 24 * 60 * 60 * 1000);

    const { data: maintenance, error } = await supabase
      .from('resource_maintenance')
      .select('*, resource:resources(*)')
      .eq('maintenance_status', 'SCHEDULED')
      .in('resource.branch_id', [branchId])
      .gte('maintenance_date', fromDate.toISOString().split('T')[0])
      .lte('maintenance_date', toDate.toISOString().split('T')[0])
      .order('maintenance_date');

    if (error) throw error;
    return maintenance;
  }

  async scheduleLabClass(data: CreateLabScheduleRequest) {
    const { data: labSchedule, error } = await supabase
      .from('lab_schedules')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return labSchedule;
  }

  async getLabSchedules(labResourceId: string) {
    const { data: schedules, error } = await supabase
      .from('lab_schedules')
      .select(`
        *,
        batch:batches(*),
        subject:subjects(*),
        teacher:auth.users(id, email)
      `)
      .eq('lab_resource_id', labResourceId)
      .order('week_number');

    if (error) throw error;
    return schedules;
  }
}

export const resourceManagementService = new ResourceManagementService();
```

---

## React Query Hooks

```typescript
export const useResource = (resourceId: string) => {
  return useQuery({
    queryKey: ['resource', resourceId],
    queryFn: () => resourceManagementService.getResource(resourceId),
    enabled: !!resourceId
  });
};

export const useResources = (branchId: string, filters?: ResourceFilters) => {
  return useQuery({
    queryKey: ['resources', branchId, filters],
    queryFn: () => resourceManagementService.getResources(branchId, filters)
  });
};

export const useResourceBookings = (resourceId: string, date?: Date) => {
  return useQuery({
    queryKey: ['resource_bookings', resourceId, date],
    queryFn: () => resourceManagementService.getResourceBookings(resourceId, date)
  });
};

export const useCreateResourceBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateResourceBookingRequest) =>
      resourceManagementService.createResourceBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource_bookings'] });
    }
  });
};

export const useScheduledMaintenance = (branchId: string) => {
  return useQuery({
    queryKey: ['scheduled_maintenance', branchId],
    queryFn: () => resourceManagementService.getScheduledMaintenance(branchId),
    refetchInterval: 60 * 60 * 1000 // Hourly
  });
};

export const useResourceUtilization = (branchId: string) => {
  return useQuery({
    queryKey: ['resource_utilization', branchId],
    queryFn: async () => {
      const resources = await resourceManagementService.getResources(branchId);
      const fromDate = new Date();
      const toDate = new Date(fromDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      return Promise.all(
        resources.map(r => resourceManagementService.getResourceUtilization(r.id, fromDate, toDate))
      );
    }
  });
};
```

---

## REST API Endpoints

```
GET    /rest/v1/resources?branch_id=eq.{branchId}
POST   /rest/v1/resources
PATCH  /rest/v1/resources?id=eq.{id}

GET    /rest/v1/resource_bookings?resource_id=eq.{resourceId}
POST   /rest/v1/resource_bookings
PATCH  /rest/v1/resource_bookings?id=eq.{id}

GET    /rest/v1/resource_allocations?resource_id=eq.{resourceId}
POST   /rest/v1/resource_allocations

GET    /rest/v1/resource_maintenance?resource_id=eq.{resourceId}
POST   /rest/v1/resource_maintenance

GET    /rest/v1/lab_schedules?lab_resource_id=eq.{resourceId}
POST   /rest/v1/lab_schedules
```

---

## Implementation Workflow

### Phase 1: Resource Setup (Week 1)
- Create resource types and resources
- Build ResourceList component
- Implement resource creation workflow
- Set up resource status management

### Phase 2: Booking System (Week 2)
- Build ResourceBookingForm
- Implement conflict detection
- Create ResourceBookingCalendar
- Build available slots calculation

### Phase 3: Allocation & Lab Scheduling (Week 3)
- Implement ResourceAllocationForm
- Build lab schedule configuration
- Create lab schedule display
- Implement equipment tracking

### Phase 4: Maintenance Management (Week 4)
- Build MaintenanceScheduleForm
- Create maintenance tracking
- Implement maintenance workflow
- Build maintenance history

### Phase 5: Analytics & Reporting (Week 5)
- Create utilization reports
- Build resource efficiency dashboard
- Implement maintenance cost tracking
- Add capacity planning reports

---

## Testing Strategy

### Unit Tests
- Booking conflict detection algorithm
- Utilization percentage calculation
- Maintenance status workflow

### Integration Tests
- Complete booking lifecycle
- Resource allocation and deallocation
- Maintenance workflow with status changes

### E2E Tests
- User books available resource slot
- Conflict prevention works correctly
- Lab schedule created and displayed
- Maintenance scheduled and completed

---

## Security

- RLS policies enforce branch boundaries
- Only managers can allocate resources
- Booking user can only cancel own bookings
- Maintenance records audit-trailed
- Resource status reflects availability

---

## Performance Recommendations

- Index on resource_id, booking_date for calendar queries
- Cache resource utilization metrics
- Pagination for resource lists
- Limit calendar queries to 3-month window
- Archive old bookings after 1 year

---

## Future Enhancements

1. **Smart Allocation**: AI-based optimal resource allocation
2. **Predictive Maintenance**: ML-based maintenance scheduling
3. **IoT Integration**: Real-time sensor data from resources
4. **Mobile Booking**: Mobile app for resource reservation
5. **Cost Allocation**: Allocation of maintenance costs to batches
6. **Availability API**: Public availability for students
7. **Equipment Checkout**: Temporary equipment loan tracking
8. **Resource Analytics**: Depreciation tracking and ROI analysis

