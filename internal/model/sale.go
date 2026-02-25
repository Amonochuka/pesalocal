package model

import "time"

type Sale struct {
	ID        string    `json:"id"`
	ProductID string    `json:"product_id"`
	Quantity  int       `json:"quantity"`
	Total     float64   `json:"total"`
	DeviceID  string    `json:"device_id"` // track which device created it
	Version   int       `json:"version"`   // sync conflict handling
	CreatedAt time.Time `json:"created_at"`
}
