-- ============================================================================
-- PARENT-TEACHER GRIEVANCE & CHAT SYSTEM
-- ============================================================================
-- Schema for parent-teacher communication and grievance management
-- Parents can raise concerns about their children to specific teachers
-- ============================================================================

-- ============================================================================
-- TABLE 1: Parent-Teacher Grievances (Main Thread)
-- ============================================================================

CREATE TABLE parent_teacher_grievances_1emaet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grievance_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Participants
    parent_id UUID NOT NULL REFERENCES parents_1emaet(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students_1emaet(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers_1emaet(id) ON DELETE CASCADE,
    
    -- Grievance Details
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'Academic', 
        'Behavioral', 
        'Attendance', 
        'Homework', 
        'Bullying',
        'Health',
        'General', 
        'Other'
    )),
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN (
        'Open',           -- New, waiting for teacher response
        'In Progress',    -- Teacher has responded, ongoing discussion
        'Resolved',       -- Issue resolved, pending parent confirmation
        'Closed',         -- Closed by either party
        'Escalated'       -- Escalated to admin/principal
    )),
    
    -- Resolution
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users_1emaet(id),
    resolved_at TIMESTAMP,
    
    -- Escalation
    escalated_to UUID REFERENCES users_1emaet(id),
    escalated_at TIMESTAMP,
    escalation_reason TEXT,
    
    -- Metadata
    last_message_at TIMESTAMP DEFAULT NOW(),
    unread_by_parent INTEGER DEFAULT 0,
    unread_by_teacher INTEGER DEFAULT 1,  -- New grievance = 1 unread for teacher
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ptg_parent ON parent_teacher_grievances_1emaet(parent_id);
CREATE INDEX idx_ptg_teacher ON parent_teacher_grievances_1emaet(teacher_id);
CREATE INDEX idx_ptg_student ON parent_teacher_grievances_1emaet(student_id);
CREATE INDEX idx_ptg_status ON parent_teacher_grievances_1emaet(status);
CREATE INDEX idx_ptg_created_at ON parent_teacher_grievances_1emaet(created_at DESC);

-- ============================================================================
-- TABLE 2: Grievance Messages (Chat Messages)
-- ============================================================================

CREATE TABLE grievance_messages_1emaet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grievance_id UUID NOT NULL REFERENCES parent_teacher_grievances_1emaet(id) ON DELETE CASCADE,
    
    -- Sender Info
    sender_id UUID NOT NULL REFERENCES users_1emaet(id),
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('Parent', 'Teacher', 'Admin')),
    
    -- Message Content
    message TEXT NOT NULL,
    
    -- Attachments (optional)
    attachment_url TEXT,
    attachment_type VARCHAR(50),  -- 'image', 'document', 'pdf', etc.
    attachment_name VARCHAR(255),
    
    -- Read Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_gm_grievance ON grievance_messages_1emaet(grievance_id);
CREATE INDEX idx_gm_sender ON grievance_messages_1emaet(sender_id);
CREATE INDEX idx_gm_created_at ON grievance_messages_1emaet(created_at);

-- ============================================================================
-- FUNCTION: Generate Grievance Number
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_grievance_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.grievance_number := 'GRV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
        LPAD(CAST((SELECT COUNT(*) + 1 FROM parent_teacher_grievances_1emaet 
        WHERE DATE(created_at) = CURRENT_DATE) AS VARCHAR), 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_grievance_number
    BEFORE INSERT ON parent_teacher_grievances_1emaet
    FOR EACH ROW
    WHEN (NEW.grievance_number IS NULL)
    EXECUTE FUNCTION generate_grievance_number();

-- ============================================================================
-- FUNCTION: Update last_message_at and unread counts
-- ============================================================================

CREATE OR REPLACE FUNCTION update_grievance_on_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last_message_at
    UPDATE parent_teacher_grievances_1emaet
    SET last_message_at = NOW(),
        updated_at = NOW(),
        -- Increment unread count for the other party
        unread_by_parent = CASE 
            WHEN NEW.sender_type = 'Teacher' OR NEW.sender_type = 'Admin' 
            THEN unread_by_parent + 1 
            ELSE unread_by_parent 
        END,
        unread_by_teacher = CASE 
            WHEN NEW.sender_type = 'Parent' 
            THEN unread_by_teacher + 1 
            ELSE unread_by_teacher 
        END
    WHERE id = NEW.grievance_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_grievance_on_message
    AFTER INSERT ON grievance_messages_1emaet
    FOR EACH ROW
    EXECUTE FUNCTION update_grievance_on_message();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE parent_teacher_grievances_1emaet ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_messages_1emaet ENABLE ROW LEVEL SECURITY;

-- Parents can only see their own grievances
CREATE POLICY "grievances_parent_access" ON parent_teacher_grievances_1emaet
    FOR ALL
    USING (
        parent_id IN (
            SELECT p.id FROM parents_1emaet p
            JOIN users_1emaet u ON u.id = p.user_id
            WHERE u.auth_user_id = auth.uid()
        )
    );

-- Teachers can only see grievances assigned to them
CREATE POLICY "grievances_teacher_access" ON parent_teacher_grievances_1emaet
    FOR ALL
    USING (
        teacher_id IN (
            SELECT t.id FROM teachers_1emaet t
            JOIN users_1emaet u ON u.id = t.user_id
            WHERE u.auth_user_id = auth.uid()
        )
    );

-- Admins can see all grievances
CREATE POLICY "grievances_admin_access" ON parent_teacher_grievances_1emaet
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users_1emaet u
            JOIN roles_1emaet r ON r.id = u.primary_role_id
            WHERE u.auth_user_id = auth.uid()
            AND r.role_code IN ('super_admin', 'admin', 'principal', 'vice_principal')
        )
    );

-- Messages follow grievance access
CREATE POLICY "messages_access" ON grievance_messages_1emaet
    FOR ALL
    USING (
        grievance_id IN (
            SELECT id FROM parent_teacher_grievances_1emaet
        )
    );

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample data after running the schema

/*
-- Create a sample grievance
INSERT INTO parent_teacher_grievances_1emaet (
    parent_id,
    student_id,
    teacher_id,
    subject,
    description,
    category,
    priority
)
SELECT 
    p.id,
    s.id,
    t.id,
    'Question about homework',
    'I would like to discuss the recent science homework assignment.',
    'Homework',
    'Normal'
FROM parents_1emaet p
JOIN student_parent_relations_1emaet spr ON spr.parent_id = p.id
JOIN students_1emaet s ON s.id = spr.student_id
JOIN teacher_subject_sections_1emaet tss ON tss.section_id = s.section_id
JOIN teachers_1emaet t ON t.id = tss.teacher_id
LIMIT 1;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('parent_teacher_grievances_1emaet', 'grievance_messages_1emaet');

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('parent_teacher_grievances_1emaet', 'grievance_messages_1emaet');
