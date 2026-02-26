package model

import "time"

type Sale struct {
	ID        string
	UserID    string
	Total     float64
	DeviceID  string
	Version   int
	CreatedAt time.Time
}

type SaleItem struct {
	ID        string
	SaleID    string
	ProductID string
	Quantity  int
	Price     float64
	Total     float64
}
