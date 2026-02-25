package repo

import (
	"database/sql"
	"errors"
	"pesalocal/internal/model"
)

var ErrUserConflict = errors.New("user conflict")

type UserRepo struct {
	db *sql.DB
}

func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) Create(u *model.User) error {
	_, err := r.db.Exec(
		"INSERT INTO users (id, name, email, password, role, device_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		u.ID, u.Name, u.Email, u.Password, u.Role, u.DeviceID, u.CreatedAt, u.UpdatedAt,
	)
	return err
}

func (r *UserRepo) GetByID(id string) (*model.User, error) {
	row := r.db.QueryRow("SELECT id, name, email, password, role, device_id, created_at, updated_at FROM users WHERE id=?", id)
	u := &model.User{}
	err := row.Scan(&u.ID, &u.Name, &u.Email, &u.Password, &u.Role, &u.DeviceID, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *UserRepo) GetByEmail(email string) (*model.User, error) {
	row := r.db.QueryRow("SELECT id, name, email, password, role, device_id, created_at, updated_at FROM users WHERE email=?", email)
	u := &model.User{}
	err := row.Scan(&u.ID, &u.Name, &u.Email, &u.Password, &u.Role, &u.DeviceID, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *UserRepo) Update(u *model.User) error {
	_, err := r.db.Exec(
		"UPDATE users SET name=?, email=?, password=?, role=?, device_id=?, updated_at=? WHERE id=?",
		u.Name, u.Email, u.Password, u.Role, u.DeviceID, u.UpdatedAt, u.ID,
	)
	return err
}
