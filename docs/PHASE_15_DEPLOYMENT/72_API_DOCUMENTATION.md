# 72 - API Documentation

## Overview

Complete REST API documentation for EduMunch built with Supabase PostgreSQL and PostgREST AutoAPI.

**Base URL:** `https://[project].supabase.co/rest/v1`

**Authentication:** Bearer token (JWT) in Authorization header

---

## Table of Contents

1. Authentication
2. API Standards
3. Core Resources
4. Error Handling
5. Pagination & Filtering
6. Rate Limiting
7. Examples
8. Troubleshooting

---

## 1. Authentication

### Obtaining Tokens

**Supabase Anonymous Token:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**User Login:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Token is: data.session.access_token
```

**Server-Side (Service Role):**
```typescript
const adminClient = createClient(
  url,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

### Token Header

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://[project].supabase.co/rest/v1/organizations?limit=10
```

### Token Refresh

```typescript
const { data, error } = await supabase.auth.refreshSession()
// New token: data.session.access_token
```

---

## 2. API Standards

### Request/Response Format

**Content-Type:** `application/json`

**Request Example:**
```bash
curl -X POST https://[project].supabase.co/rest/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "email": "user@example.com",
    "full_name": "John Doe",
    "user_type": "student"
  }'
```

**Response Example (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "user_type": "student",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### HTTP Methods

| Method | Operation | Success Code |
|--------|-----------|--------------|
| GET    | Read      | 200          |
| POST   | Create    | 201          |
| PATCH  | Update    | 200          |
| DELETE | Delete    | 204          |

---

## 3. Core Resources

### Organizations

**GET Organizations**
```
GET /organizations
Authorization: Bearer TOKEN
```

**Query Parameters:**
```
?limit=10&offset=0&select=id,name,email
?order=name.asc
?status=eq.active
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "EduMunch Academy",
    "email": "admin@edumunch.com",
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

**GET Single Organization**
```
GET /organizations/550e8400-e29b-41d4-a716-446655440000
```

**CREATE Organization**
```
POST /organizations
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "name": "New Academy",
  "email": "academy@example.com",
  "phone": "9876543210",
  "city": "Delhi",
  "status": "active"
}
```

**UPDATE Organization**
```
PATCH /organizations/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "name": "Updated Name",
  "phone": "9876543210"
}
```

**DELETE Organization**
```
DELETE /organizations/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer TOKEN
```

### Users

**GET Users (with filters)**
```
GET /users?user_type=eq.student&organization_id=eq.550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "student@example.com",
    "full_name": "John Smith",
    "user_type": "student",
    "role": "student",
    "status": "active",
    "organization_id": "550e8400-e29b-41d4-a716-446655440000"
  }
]
```

**CREATE User**
```
POST /users
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "email": "newuser@example.com",
  "full_name": "Jane Doe",
  "user_type": "teacher",
  "role": "teacher",
  "organization_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**UPDATE User Profile**
```
PATCH /users/550e8400-e29b-41d4-a716-446655440001
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "full_name": "Updated Name",
  "phone": "+919876543210"
}
```

### Courses

**GET Courses**
```
GET /courses?organization_id=eq.550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "code": "CS101",
    "name": "Introduction to Computer Science",
    "level": "Foundation",
    "organization_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "active"
  }
]
```

**CREATE Course**
```
POST /courses
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "organization_id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "CS201",
  "name": "Data Structures",
  "level": "Intermediate",
  "department": "Computer Science"
}
```

**GET Batches for Course**
```
GET /batches?course_id=eq.550e8400-e29b-41d4-a716-446655440002
```

### Enrollments

**GET Student Enrollments**
```
GET /enrollments?student_id=eq.550e8400-e29b-41d4-a716-446655440001
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "student_id": "550e8400-e29b-41d4-a716-446655440001",
    "batch_id": "550e8400-e29b-41d4-a716-446655440004",
    "enrollment_date": "2024-01-15",
    "status": "active"
  }
]
```

**CREATE Enrollment**
```
POST /enrollments
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "student_id": "550e8400-e29b-41d4-a716-446655440001",
  "batch_id": "550e8400-e29b-41d4-a716-446655440004",
  "enrollment_date": "2024-01-15",
  "status": "active"
}
```

### Attendance

**GET Attendance Records**
```
GET /attendance?student_id=eq.550e8400-e29b-41d4-a716-446655440001&order=attendance_date.desc
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "student_id": "550e8400-e29b-41d4-a716-446655440001",
    "batch_id": "550e8400-e29b-41d4-a716-446655440004",
    "attendance_date": "2024-01-15",
    "status": "present",
    "remarks": null
  }
]
```

**CREATE Attendance**
```
POST /attendance
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "student_id": "550e8400-e29b-41d4-a716-446655440001",
  "batch_id": "550e8400-e29b-41d4-a716-446655440004",
  "attendance_date": "2024-01-15",
  "status": "present"
}
```

### Assignments

**GET Assignments**
```
GET /assignments?batch_id=eq.550e8400-e29b-41d4-a716-446655440004
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "batch_id": "550e8400-e29b-41d4-a716-446655440004",
    "subject_id": "550e8400-e29b-41d4-a716-446655440007",
    "title": "Assignment 1",
    "description": "Complete chapters 1-3",
    "due_date": "2024-01-22",
    "max_marks": 10
  }
]
```

**CREATE Assignment**
```
POST /assignments
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "batch_id": "550e8400-e29b-41d4-a716-446655440004",
  "subject_id": "550e8400-e29b-41d4-a716-446655440007",
  "title": "Assignment 1",
  "description": "Complete chapters 1-3",
  "due_date": "2024-01-22",
  "max_marks": 10
}
```

### Submissions

**GET Assignment Submissions**
```
GET /submissions?assignment_id=eq.550e8400-e29b-41d4-a716-446655440006
```

**CREATE Submission**
```
POST /submissions
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "assignment_id": "550e8400-e29b-41d4-a716-446655440006",
  "student_id": "550e8400-e29b-41d4-a716-446655440001",
  "content": "Solution text or file_url",
  "submitted_at": "2024-01-20T10:30:00Z"
}
```

### Grades

**GET Grades**
```
GET /grades?student_id=eq.550e8400-e29b-41d4-a716-446655440001
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "student_id": "550e8400-e29b-41d4-a716-446655440001",
    "subject_id": "550e8400-e29b-41d4-a716-446655440007",
    "batch_id": "550e8400-e29b-41d4-a716-446655440004",
    "marks_obtained": 85,
    "total_marks": 100,
    "grade": "A",
    "percentage": 85.0
  }
]
```

**CREATE Grade**
```
POST /grades
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "student_id": "550e8400-e29b-41d4-a716-446655440001",
  "subject_id": "550e8400-e29b-41d4-a716-446655440007",
  "batch_id": "550e8400-e29b-41d4-a716-446655440004",
  "marks_obtained": 85,
  "total_marks": 100
}
```

### Payments

**GET Payments**
```
GET /payments?student_id=eq.550e8400-e29b-41d4-a716-446655440001&order=payment_date.desc
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440009",
    "student_id": "550e8400-e29b-41d4-a716-446655440001",
    "amount": 50000,
    "payment_date": "2024-01-15",
    "method": "online",
    "status": "success",
    "transaction_id": "TXN123456"
  }
]
```

**CREATE Payment**
```
POST /payments
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "student_id": "550e8400-e29b-41d4-a716-446655440001",
  "amount": 50000,
  "payment_date": "2024-01-15",
  "method": "online",
  "status": "success"
}
```

---

## 4. Error Handling

### Error Responses

**400 Bad Request:**
```json
{
  "code": "PGRST201",
  "message": "Invalid request",
  "details": "Invalid input syntax for field 'email'"
}
```

**401 Unauthorized:**
```json
{
  "code": "PGRST000",
  "message": "JWT expired or invalid"
}
```

**403 Forbidden:**
```json
{
  "code": "PGRST000",
  "message": "RLS policy violation",
  "details": "You do not have permission to access this resource"
}
```

**404 Not Found:**
```json
{
  "code": "PGRST116",
  "message": "Resource not found"
}
```

**409 Conflict:**
```json
{
  "code": "PGRST209",
  "message": "Unique constraint violation",
  "details": "Email already exists"
}
```

**500 Server Error:**
```json
{
  "code": "PGRST000",
  "message": "Internal server error"
}
```

### Error Codes

| Code   | Status | Meaning              |
|--------|--------|----------------------|
| PGRST000 | 500    | Server error         |
| PGRST116 | 404    | Not found            |
| PGRST201 | 400    | Bad request          |
| PGRST209 | 409    | Conflict/Duplicate   |
| PGRST213 | 409    | Conflict             |

---

## 5. Pagination & Filtering

### Pagination

```
GET /users?limit=10&offset=20
```

**Parameters:**
- `limit`: Records per page (max 1000)
- `offset`: Skip records

**Response Headers:**
```
Content-Range: 20-29/100
```

### Ordering

```
GET /users?order=created_at.desc
GET /users?order=name.asc,created_at.desc
```

**Options:**
- `.asc` - Ascending (default)
- `.desc` - Descending

### Filtering

**Comparison Operators:**
```
?column=eq.value       # Equals
?column=neq.value      # Not equals
?column=gt.value       # Greater than
?column=gte.value      # Greater or equal
?column=lt.value       # Less than
?column=lte.value      # Less or equal
?column=in.(value1,value2)  # In list
?column=is.null        # Is null
?column=like.*pattern* # Pattern match
```

**Examples:**
```
GET /students?status=eq.active
GET /grades?marks_obtained=gte.80
GET /enrollments?enrollment_date=gte.2024-01-01
GET /payments?status=in.(success,pending)
GET /users?full_name=like.*John*
```

### Select Specific Fields

```
GET /users?select=id,email,full_name
GET /enrollments?select=*,batches(name,code)
```

---

## 6. Rate Limiting

### Limits

| Tier   | Requests/Min | Requests/Hour | Requests/Day |
|--------|-------------|---------------|--------------|
| Free   | 100         | 5,000         | 100,000      |
| Pro    | 1,000       | 60,000        | 1,000,000    |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

### Handling 429 (Too Many Requests)

```typescript
const response = await fetch(url, { headers })
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After')
  // Wait retryAfter seconds before retry
  await new Promise(r => setTimeout(r, retryAfter * 1000))
  // Retry request
}
```

---

## 7. Examples

### Complete User Registration Flow

```typescript
// 1. Sign up user
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

if (error) throw error

// 2. Create user profile
const { error: profileError } = await supabase
  .from('users')
  .insert({
    id: data.user.id,
    email: data.user.email,
    full_name: 'John Doe',
    user_type: 'student'
  })

if (profileError) throw profileError

// 3. Create student profile
const { error: studentError } = await supabase
  .from('student_profiles')
  .insert({
    user_id: data.user.id,
    organization_id: 'org-id',
    roll_number: 'CS001'
  })
```

### Get Student with Enrollments

```typescript
const { data, error } = await supabase
  .from('users')
  .select(`
    *,
    student_profiles(*),
    enrollments(
      *,
      batches(
        *,
        courses(*)
      )
    )
  `)
  .eq('id', userId)
  .single()
```

### Get Batch with Students and Grades

```typescript
const { data, error } = await supabase
  .from('batches')
  .select(`
    *,
    courses(*),
    enrollments(
      *,
      users(*),
      grades(*)
    )
  `)
  .eq('id', batchId)
  .single()
```

---

## 8. Troubleshooting

### Authentication Issues

**JWT Token Expired:**
- Refresh token using `refreshSession()`
- Implement automatic refresh before expiry

**CORS Errors:**
- Check Supabase CORS settings
- Verify domain is whitelisted
- Use proper Authorization headers

### Query Issues

**RLS Policy Violations:**
- Verify user has appropriate role
- Check policy conditions
- Use service role key for admin operations

**Performance Issues:**
- Add indexes on filter columns
- Use pagination for large datasets
- Limit selected columns with select parameter

### Common HTTP Errors

**400 Bad Request:**
- Check JSON syntax
- Verify data types match schema
- Check required fields are included

**401 Unauthorized:**
- Verify token is valid
- Check token is not expired
- Ensure token is in Authorization header

**409 Conflict:**
- Check for unique constraint violations
- Verify foreign key relationships
- Check composite unique constraints

---

**Last Updated:** [Date]  
**API Version:** v1  
**Status:** Production Ready

