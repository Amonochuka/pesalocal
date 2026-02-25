package model

type User struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"-"`    // hashed
	Role     string `json:"role"` // admin, cashier
	DeviceID string `json:"device_id"`
}
