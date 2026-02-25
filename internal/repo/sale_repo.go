package repo

import (
	"database/sql"
	"pesalocal/internal/model"
)

type SaleRepo struct {
	db *sql.DB
}

func NewSaleRepo(db *sql.DB) *SaleRepo {
	return &SaleRepo{db: db}
}

func (r *SaleRepo) Create(s *model.Sale) error {
	_, err := r.db.Exec(
		"INSERT INTO sales (id, user_id, total, device_id, version, created_at) VALUES (?, ?, ?, ?, ?, ?)",
		s.ID, s.UserID, s.Total, s.DeviceID, s.Version, s.CreatedAt,
	)
	return err
}

func (r *SaleRepo) GetByID(id string) (*model.Sale, error) {
	row := r.db.QueryRow("SELECT id, user_id, total, device_id, version, created_at FROM sales WHERE id=?", id)
	s := &model.Sale{}
	err := row.Scan(&s.ID, &s.UserID, &s.Total, &s.DeviceID, &s.Version, &s.CreatedAt)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (r *SaleRepo) GetAll() ([]*model.Sale, error) {
	rows, err := r.db.Query("SELECT id, user_id, total, device_id, version, created_at FROM sales")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sales []*model.Sale
	for rows.Next() {
		s := &model.Sale{}
		rows.Scan(&s.ID, &s.UserID, &s.Total, &s.DeviceID, &s.Version, &s.CreatedAt)
		sales = append(sales, s)
	}
	return sales, nil
}
