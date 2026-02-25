package model

import "time"

type Purchase struct {
	ID          string
	Supplier    string
	TotalAmount float64
	DeviceID    string
	Version     int
	CreatedAt   time.Time
}

type PurchaseItem struct {
	ID         string
	PurchaseID string
	ProductID  string
	Quantity   int
	Price      float64
	Total      float64
}
