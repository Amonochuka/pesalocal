package model

import "time"

type Sale struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Total     float64   `json:"total"`
	DeviceID  string    `json:"device_id"`
	Version   int       `json:"version"`
	CreatedAt time.Time `json:"created_at"`
}

type SaleItem struct {
	ID        string  `json:"id"`
	SaleID    string  `json:"sale_id"`
	ProductID string  `json:"product_id"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
	Total     float64 `json:"total"`
}
