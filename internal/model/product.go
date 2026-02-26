package model

import "time"

type Product struct {
	ID        string    `json:"id"` // UUID
	Name      string    `json:"name"`
	Price     float64   `json:"price"`
	Stock     int       `json:"stock"`
	Version   int       `json:"version"` // for conflict resolution
	UpdatedAt time.Time `json:"updated_at"`
}
