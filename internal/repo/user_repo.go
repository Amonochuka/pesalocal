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

// CreateOrUpdate ensures idempotent sync behavior
func (r *UserRepo) CreateOrUpdate(u *model.User) error {
	existing, err := r.GetByID(u.ID)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return err
	}

	if existing == nil {
		_, err := r.db.Exec(
			`INSERT INTO users 
			(id, name, email, password, role, device_id, version, created_at, updated_at) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			u.ID, u.Name, u.Email, u.Password, u.Role, u.DeviceID, u.Version, u.CreatedAt, u.UpdatedAt,
		)
		return err
	}

	// Update only if version is newer
	if u.Version <= existing.Version {
		return nil
	}

	_, err = r.db.Exec(
		`UPDATE users SET 
		name=?, email=?, password=?, role=?, device_id=?, version=?, updated_at=? 
		WHERE id=?`,
		u.Name, u.Email, u.Password, u.Role, u.DeviceID, u.Version, u.UpdatedAt, u.ID,
	)
	return err
}

// GetByID fetches a user including version
func (r *UserRepo) GetByID(id string) (*model.User, error) {
	row := r.db.QueryRow(
		`SELECT id, name, email, password, role, device_id, version, created_at, updated_at 
		FROM users WHERE id=?`, id,
	)
	u := &model.User{}
	err := row.Scan(
		&u.ID, &u.Name, &u.Email, &u.Password, &u.Role, &u.DeviceID,
		&u.Version, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *UserRepo) GetByEmail(email string) (*model.User, error) {
	row := r.db.QueryRow(
		`SELECT id, name, email, password, role, device_id, version, created_at, updated_at 
		FROM users WHERE email=?`, email,
	)
	u := &model.User{}
	err := row.Scan(
		&u.ID, &u.Name, &u.Email, &u.Password, &u.Role, &u.DeviceID,
		&u.Version, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *UserRepo) GetAll() ([]*model.User, error) {
	rows, err := r.db.Query(
		`SELECT id, name, email, password, role, device_id, version, created_at, updated_at 
		FROM users`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*model.User
	for rows.Next() {
		u := &model.User{}
		if err := rows.Scan(
			&u.ID, &u.Name, &u.Email, &u.Password, &u.Role, &u.DeviceID,
			&u.Version, &u.CreatedAt, &u.UpdatedAt,
		); err != nil {
			return nil, err
		}
		users = append(users, u)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return users, nil
}
