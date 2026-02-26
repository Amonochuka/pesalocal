package model

import "time"

type Purchase struct {
	ID          string    `json:"id"`
	Supplier    string    `json:"supplier"`
	TotalAmount float64   `json:"total_amount"`
	DeviceID    string    `json:"device_id"`
	Version     int       `json:"version"`
	CreatedAt   time.Time `json:"created_at"`
}

type PurchaseItem struct {
	ID         string  `json:"id"`
	PurchaseID string  `json:"purchase_id"`
	ProductID  string  `json:"product_id"`
	Quantity   int     `json:"quantity"`
	Price      float64 `json:"price"`
	Total      float64 `json:"total"`
}
