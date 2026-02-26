# Pesalocal POS Backend

This is the **backend** for a **local-first, offline-capable POS system** built in Go.  
It supports products, sales, purchases, and users, with offline-first syncing for low-bandwidth environments.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Backend Architecture](#backend-architecture)
3. [Implemented Components](#implemented-components)
4. [Pending/Optional Components](#pendingoptional-components)
5. [Sync Flow](#sync-flow)
6. [Offline Testing Instructions](#offline-testing-instructions)
7. [Future Improvements](#future-improvements)
8. [Directory Structure](#directory-structure)

---

## Project Overview

The backend is designed for **small businesses** to manage inventory, sales, and purchases while being **fully functional offline**.  
- All data is stored locally on the device.  
- Operations are queued when offline and **synced automatically** when online.  
- Conflict handling is version-based (last-write-wins).  

---

## Backend Architecture

**Layers:**

1. **Models** (`/internal/model`)  
   - Defines the entities: Product, Sale, SaleItem, Purchase, PurchaseItem, User, SyncOperation  
   - Includes fields for versioning and timestamps to support sync  

2. **Repositories** (`/internal/repo`)  
   - Encapsulate database operations for each entity  
   - CRUD operations + specific queries (e.g., `GetByID`, `GetAll`)  

3. **Services** (`/internal/service`)  
   - Contain business logic  
   - Handle both **direct operations** (create/update) and **sync operations**  
   - Each service has `ApplyFromSync` or equivalent to handle offline sync updates  

4. **Sync Service** (`SyncService`)  
   - Queues incoming operations in `SyncOperationRepo`  
   - Processes each operation through the appropriate service  
   - Handles retries (`RetryCount`) and conflict detection (`Version`)  
   - Supports partial failure handling  

5. **Handlers** (`/internal/handlers`)  
   - `SyncHandler` — main handler for `/sync/push` endpoint  
   - Processes batches of operations from frontend  

6. **JWT Authentication** (planned/implemented separately)  
   - Handles `/auth/register` and `/auth/login`  
   - Protects sensitive endpoints  

---


## Pending / Optional Components

- Full JWT middleware for protected endpoints  
- Exponential or linear backoff for retries (currently linear retry counter only)  
- Separate handlers for auth endpoints (`/auth/login`, `/auth/register`)  
- Logging of sync operations and conflicts  
- Optional: background processing for queued sync operations  
- Optional: partial data sync for large datasets  

---

## Sync Flow

1. Frontend collects **offline operations** (product update, sale, purchase, user)  
2. Frontend sends **batch POST** request to `/sync/push`  
3. `SyncHandler` converts them to `SyncOperation` models  
4. Each operation is **queued** via `AddSyncOperation`  
5. `ProcessAllSyncOperations` loops through queued operations  
   - Calls the appropriate service (`ApplyFromSync`)  
   - Handles retries (`RetryCount`) and version conflicts  
   - Deletes successful operations from queue  
   - Returns list of failed operations (if any) to frontend  

**Outcome:**  

- Offline operations are safely persisted and synced once online  
- Partial failures do not block other operations  
- Frontend can retry failed operations automatically  

---

## Offline Testing Instructions

1. **Start backend locally**:  
   ```bash
   go run cmd/server/main.go

2 . ***Simulate offline operations on frontend***:

Add/update products, sales, purchases while offline

Collect operations in JSON array

```
Send batch to /sync/push:

[
    {
        "id": "uuid-1",
        "entity_type": "product",
        "entity_id": "prod-1",
        "operation": "update",
        "payload": { "id": "prod-1", "name": "Sugar", "price": 100, "stock": 20, "version": 2 },
        "device_id": "device-1",
        "created_at": "2026-02-26T16:00:00Z",
        "retry_count": 0
    }
]

```

  - Check response:

    - "status": "ok" → all operations synced

    - "status": "partial_fail" → some operations failed; retry them

  - Verify DB updates:

    - Product, Sale, Purchase, User tables updated correctly

Versioning ensures no conflicts