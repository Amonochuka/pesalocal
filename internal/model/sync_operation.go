package model

import "time"

type SyncOperation struct {
	ID         string    `json:"id"`
	EntityType string    `json:"entity_type"` // "product" or "sale"
	EntityID   string    `json:"entity_id"`
	Operation  string    `json:"operation"` // "create" or "update"
	Payload    []byte    `json:"payload"`   // JSON-encoded entity
	DeviceID   string    `json:"device_id"`
	CreatedAt  time.Time `json:"created_at"`
	RetryCount int       `json:"retry_count"`
}
