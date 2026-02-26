package model

import "time"

type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`    // hashed
	Role      string    `json:"role"` // admin, cashier
	DeviceID  string    `json:"device_id"`
	Version   int       `json:"version"` // for sync conflicts
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
