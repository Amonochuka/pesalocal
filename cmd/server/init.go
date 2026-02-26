package main

import (
	"database/sql"
	"log"
)

func initDB(db *sql.DB) error {
	statements := []string{
		// Users
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			name TEXT,
			email TEXT,
			password TEXT,
			role TEXT,
			device_id TEXT,
			version INTEGER,
			created_at DATETIME,
			updated_at DATETIME
		);`,
		// Products
		`CREATE TABLE IF NOT EXISTS products (
			id TEXT PRIMARY KEY,
			name TEXT,
			price REAL,
			stock INTEGER,
			version INTEGER,
			updated_at DATETIME
		);`,
		// Sales
		`CREATE TABLE IF NOT EXISTS sales (
			id TEXT PRIMARY KEY,
			user_id TEXT,
			total REAL,
			device_id TEXT,
			version INTEGER,
			created_at DATETIME
		);`,
		`CREATE TABLE IF NOT EXISTS sale_items (
			id TEXT PRIMARY KEY,
			sale_id TEXT,
			product_id TEXT,
			quantity INTEGER,
			price REAL,
			total REAL
		);`,
		// Purchases
		`CREATE TABLE IF NOT EXISTS purchases (
			id TEXT PRIMARY KEY,
			user_id TEXT,
			total REAL,
			device_id TEXT,
			version INTEGER,
			created_at DATETIME
		);`,
		`CREATE TABLE IF NOT EXISTS purchase_items (
			id TEXT PRIMARY KEY,
			purchase_id TEXT,
			product_id TEXT,
			quantity INTEGER,
			price REAL,
			total REAL
		);`,
		// Sync operations
		`CREATE TABLE IF NOT EXISTS sync_operations (
			id TEXT PRIMARY KEY,
			entity_type TEXT,
			entity_id TEXT,
			operation TEXT,
			payload BLOB,
			device_id TEXT,
			created_at DATETIME,
			retry_count INTEGER
		);`,
		// Insert demo user
		`INSERT OR IGNORE INTO users (id, name, email, password, role, device_id, version, created_at, updated_at)
		 VALUES ('admin-uuid-1', 'Admin', 'admin@example.com', 'hashedpassword', 'admin', 'device-1', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
	}

	for _, stmt := range statements {
		if _, err := db.Exec(stmt); err != nil {
			return err
		}
	}
	log.Println("Database initialized successfully.")
	return nil
}
