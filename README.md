 # **PesaLocal**
### Offline-First Financial Toolkit for Kenyan Small Businesses

Built for the hackathon theme: ***Local First – Build Our Reality***

## Overview

PesaLocal is a privacy-first, offline-capable Progressive Web App (PWA) designed for Kenyan small business owners ( Mama Mboga, food vendors, boda boda operators ) and individuals who rely heavily on M-PESA.

Unlike traditional fintech or POS systems that require constant internet and cloud storage, PesaLocal works 100% offline and keeps all sensitive data on the user's device.

It combines:

- M-PESA transaction analysis

- Offline POS system

- Inventory & credit management

- Quotes, receipts, IOUs

- Intelligent sync backend (when online)

### Why This Matters (Kenyan Context)

In Kenya:

1. The Internet is expensive and unstable

2. Power outages happen

3. Devices are shared

4. Most informal businesses don’t use cloud software

5. Privacy concerns around financial data are real

PesaLocal is built for this reality, not just assumptions.

## System Architecture

PesaLocal is built with a true Local-First architecture.
````
Frontend (React PWA)
    ↓
IndexedDB (Dexie.js)
    ↓
Offline Sync Queue
    ↓ (When Online)
Go Backend Sync API
    ↓
Database (Version-based conflict resolution)
````

##  Frontend (PWA)
### Tech Stack
```

| Layer |	Technology |	Purpose |
|-------|--------------|------------|
|Framework|	React + TypeScript|	UI with type safety|
|Build Tool|	Vite|	Fast builds|
Styling	TailwindCSS	Responsive UI
State	Zustand	Lightweight state management
Database	Dexie.js (IndexedDB)	Local-first storage
PWA	Vite PWA Plugin + Workbox	Offline caching
PDF Parsing	PDF.js	M-PESA statement processing

```
## Progressive Web App Features
### 1️⃣ Web App Manifest

- Installable on mobile & desktop

- Standalone mode

- Custom icons (192x192, 512x512)

- Screenshots for install prompt

### 2️⃣ Service Worker

- Caches static assets

- Enables offline usage

- Controls updates

- Graceful fallback when offline

### 3️⃣ Offline Guarantee

- App loads in airplane mode

- Sales & inventory still function

- No cloud dependency for core features


## Privacy by Design

PesaLocal enforces privacy technically, not just by policy.

### Security Measures

- Content Security Policy (CSP) blocks outbound requests

- Local PIN authentication (no email required)

- Zero third-party tracking

- IndexedDB isolation per user

- One-click Data Incinerator

- “0 KB Sent” privacy indicator

*No financial data is uploaded unless user explicitly enables sync.*

## User Modes

### 1️⃣ Personal Mode

For individuals tracking M-PESA:

- Import M-PESA PDF statements

+ Detect hidden transaction fees

- Categorize spending

- Monthly comparisons

- Fee insights

### 2️⃣ Business Mode (Mama Mboga Toolkit)
#### - Quick Sale Grid

- Tap-to-add cart system

- Fast checkout

- Payment method selection

#### - Inventory Management

- Categorized products

- Stock tracking

- Low stock alerts

- Supplier tracking

#### - Credit Book

- Track customer debts

- Overdue alerts (color-coded)

- Record repayments

- SMS reminder support

#### - M-PESA Integration

- Paybill

- Till

- Pochi la Biashara

- Transaction code reconciliation

#### - Document Generation

- VAT (16%) quote builder

- Professional receipts

- WhatsApp sharing

- IOU forms


### 3️⃣ Combined Mode

- Unified dashboard

- Split personal & business insights

- Quick switching between modes


## 🔄 Backend (Go – Offline Sync Engine)

The backend powers optional synchronization when connectivity exists.
```
Architecture Layers

internal/
 ├── model/      → Entities with versioning
 ├── repo/       → Database abstraction (CRUD)
 ├── service/    → Business logic
 ├── handlers/   → HTTP endpoints
 ```
### Core Entities

- Product

- Sale

- SaleItem

- Purchase

- PurchaseItem

- User

- SyncOperation

Each entity includes:

- Version field

- Timestamps

- Conflict detection support

- Sync System

### Flow

#### Frontend

- Records offline operations

- Operations stored in syncQueue

- When online → batch POST to /sync/push

#### Backend:

- Queues operations

- Applies via the appropriate service

- Handles version conflicts (Last-Write-Wins)

- Retries failed operations

Returns:
````
status: ok
````
or 
````
status: partial_fail
````
#### Conflict Handling

- Version-based detection

- Retry counter tracking

- Partial failure safe handling

- Successful operations removed from the queue

#### Example Sync Payload
````
[
  {
    "id": "uuid-1",
    "entity_type": "product",
    "entity_id": "prod-1",
    "operation": "update",
    "payload": { 
      "id": "prod-1",
      "name": "Sugar",
      "price": 100,
      "stock": 20,
      "version": 2
    },
    "device_id": "device-1",
    "retry_count": 0
  }
]
````

## Offline Testing
Start Backend
````
go run cmd/server/main.go
````
Test Offline Mode
````

Open app

Turn on Airplane Mode

Add sale or product

Refresh page

App still loads

Turn internet back on

Sync runs automatically
````



## Project Structure
````
pesalocal/
├── backend/
│   ├── cmd/server/
│   └── internal/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── modules/
│   │   ├── services/
│   │   ├── store/
│   │   └── workers/
├── docs/
└── README.md
````

# Demo Credentials
````
Phone: 0712345678

PIN: 1234
````

## Sample Data:
````

10+ inventory products

3 credit customers

Recent transactions

Preconfigured low stock alerts
````

## Performance & Lighthouse

PWA installable

Works offline

HTTPS ready

Performance score target: 90+

No PWA audit errors


# Why PesaLocal Wins

✅ Solves real informal sector problem

✅ Works without internet

✅ Keeps financial data private

✅ Provides full business toolkit

✅ Built specifically for Kenya

✅ Production-ready architecture


## Final Statement

PesaLocal proves that modern financial tools do not require constant internet or data harvesting.

It demonstrates a powerful principle:

***Local-First is not a feature.
It is an architecture philosophy.***

And for Kenya’s informal economy,
it is the difference between inclusion and exclusion.
