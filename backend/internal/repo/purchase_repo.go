package repo

import (
	"database/sql"
	"errors"
	"pesalocal/internal/model"
)

var ErrPurchaseConflict = errors.New("purchase version conflict")

type PurchaseRepo struct {
	db *sql.DB
}

func NewPurchaseRepo(db *sql.DB) *PurchaseRepo {
	return &PurchaseRepo{db: db}
}

// Create inserts a new purchase record
func (r *PurchaseRepo) Create(p *model.Purchase) error {
	_, err := r.db.Exec(
		"INSERT INTO purchases (id, supplier, total_amount, device_id, version, created_at) VALUES (?, ?, ?, ?, ?, ?)",
		p.ID, p.Supplier, p.TotalAmount, p.DeviceID, p.Version, p.CreatedAt,
	)
	return err
}

// GetByID fetches a purchase by its ID
func (r *PurchaseRepo) GetByID(id string) (*model.Purchase, error) {
	row := r.db.QueryRow(
		"SELECT id, supplier, total_amount, device_id, version, created_at FROM purchases WHERE id=?",
		id,
	)
	p := &model.Purchase{}
	err := row.Scan(&p.ID, &p.Supplier, &p.TotalAmount, &p.DeviceID, &p.Version, &p.CreatedAt)
	if err != nil {
		return nil, err
	}
	return p, nil
}

// GetAll fetches all purchases
func (r *PurchaseRepo) GetAll() ([]*model.Purchase, error) {
	rows, err := r.db.Query("SELECT id, supplier, total_amount, device_id, version, created_at FROM purchases")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var purchases []*model.Purchase
	for rows.Next() {
		p := &model.Purchase{}
		rows.Scan(&p.ID, &p.Supplier, &p.TotalAmount, &p.DeviceID, &p.Version, &p.CreatedAt)
		purchases = append(purchases, p)
	}
	return purchases, nil
}

// Update updates a purchase record with optimistic concurrency
func (r *PurchaseRepo) Update(p *model.Purchase) error {
	res, err := r.db.Exec(
		"UPDATE purchases SET supplier=?, total_amount=?, device_id=?, version=?, created_at=? WHERE id=? AND version=?",
		p.Supplier, p.TotalAmount, p.DeviceID, p.Version+1, p.CreatedAt, p.ID, p.Version,
	)
	if err != nil {
		return err
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		return ErrPurchaseConflict
	}
	return nil
}

// Delete removes a purchase record
func (r *PurchaseRepo) Delete(id string) error {
	_, err := r.db.Exec("DELETE FROM purchases WHERE id=?", id)
	return err
}
