# EduMunch: Multi-Tenant Database Architecture Guide

> This document serves as the official technical reference for the EduMunch database infrastructure, sharding strategy, and cross-hub synchronization logic.

---

## 1. High-Level Infrastructure Overview

To optimize operational costs (targeting **₹6,800/school/year**), EduMunch utilizes a hybrid storage and sharding model:

### **Dev Master DB**
A restricted central database managed by **Nexverse Digital Studios**. It acts as the "Registry," mapping schools to their physical database location (DB Hub) and their logical access key (Index Token).

### **DB Hubs (Supabase Pro)**
Each Hub is a standalone Supabase Pro project with the following specifications:

- **Capacity:** 5 organizations per Hub
- **Disk Limit:** 8GB (Strictly for textual data)
- **Performance:** Shared resources (RAM/CPU/Connections) across all 5 schools

### **Media Storage (Cloudflare R2)**
All documents, PDFs, and images are stored externally. The DB Hubs only store the metadata/URLs to prevent disk bloat.

---

## 2. Table-Level Sharding (Prefix + Suffix)

Instead of a single shared table with `tenant_id`, we use **Table Prefixing** to ensure high logical isolation and performance within a shared database.

### **The Naming Convention**

Every table in a Hub follows this syntax:

```
[table_prefix]_[index_suffix]
```

- **Prefix:** The functional name of the entity (e.g., `students`, `attendance`, `exams`)
- **Suffix (Index Token):** A secure, randomized 6-character string assigned to a specific school (e.g., `1EMAET`, `2DDMK`)

### **Example: A Hub with 3 Schools**

| Table Prefix | School A (Token: 1EMAET) | School B (Token: 2DDMK) | School C (Token: 3AAA) |
| :--- | :--- | :--- | :--- |
| Students | `students_1EMAET` | `students_2DDMK` | `students_3AAA` |
| Attendance | `attendance_1EMAET` | `attendance_2DDMK` | `attendance_3AAA` |
| Finance | `finance_1EMAET` | `finance_2DDMK` | `finance_3AAA` |

---

## 3. Request Routing & Security

The routing logic is handled at the **Application Layer** (React WebApp / Flutter App) using environment variables.

### **White-Label Configuration**
Every school's deployment includes a `.env` file containing its specific `INDEX_TOKEN`.

### **Dynamic Querying**
Database queries do not use static table names. They are constructed dynamically:

```javascript
const tableName = `students_${process.env.INDEX_TOKEN}`;
const { data } = await supabase.from(tableName).select('*');
```

### **Security through Obfuscation**
Using randomized strings instead of simple numbers (1-5) prevents "neighbor guessing," though **Row Level Security (RLS)** remains the primary defense for user-level isolation.

---

## 4. Synchronization Strategy

To maintain system integrity across the entire network of Hubs, an automatic sync engine is managed via the **Dev Panel**.

### **Standard Table Sync (Prefix Match)**

If a table shares a common prefix (e.g., all `students_` tables), the Dev Panel ensures that the schema is identical across:

- All 5 indices within the specific Hub
- All other DB Hubs in the EduMunch ecosystem

### **XTRA Table Logic (The Customization Exclusion)**

If a specific school requires custom features or unique data fields not shared by the SaaS template:

- **Identifier:** The table must start with the `XTRA_` prefix (e.g., `XTRA_special_events_1EMAET`)
- **Behavior:** The automatic sync engine ignores these tables. Changes to `XTRA_` tables are handled manually and are not replicated to other schools or Hubs.

---

## 5. Architectural Constraints & Safeguards

### **Connection Pooling**
To prevent "8:00 AM Attendance Peaks" from crashing a Hub, all apps must connect via the **Supavisor Transaction Pooler**.

### **Atomic Migrations**
All schema updates pushed from the Dev Panel are wrapped in **Postgres Transactions**. If the update fails for even 1 out of the 5 schools in a Hub, the entire operation is rolled back to prevent schema mismatch.

### **Audit Logs**
The Dev Master DB maintains a version history for every Hub to track which "Patch ID" has been successfully applied.

---

## Status

✅ **Approved for implementation by Nexverse Digital Studios**
