package repo

import (
	"database/sql"
	"errors"
	"time"

	"pesalocal/internal/model"
)

var ErrProductConflict = errors.New("product version conflict")

type ProductRepo struct {
	db *sql.DB
}

func NewProductRepo(db *sql.DB) *ProductRepo {
	return &ProductRepo{db: db}
}

func (r *ProductRepo) Create(p *model.Product) error {
	_, err := r.db.Exec(
		"INSERT INTO products (id, name, price, stock, version, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
		p.ID, p.Name, p.Price, p.Stock, p.Version, p.UpdatedAt,
	)
	return err
}

func (r *ProductRepo) Update(p *model.Product) error {
	res, err := r.db.Exec(
		"UPDATE products SET name=?, price=?, stock=?, version=?, updated_at=? WHERE id=? AND version=?",
		p.Name, p.Price, p.Stock, p.Version+1, time.Now(), p.ID, p.Version,
	)
	if err != nil {
		return err
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		return ErrProductConflict
	}
	return nil
}

func (r *ProductRepo) GetByID(id string) (*model.Product, error) {
	row := r.db.QueryRow("SELECT id, name, price, stock, version, updated_at FROM products WHERE id=?", id)
	p := &model.Product{}
	err := row.Scan(&p.ID, &p.Name, &p.Price, &p.Stock, &p.Version, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func (r *ProductRepo) GetAll() ([]*model.Product, error) {
	rows, err := r.db.Query("SELECT id, name, price, stock, version, updated_at FROM products")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []*model.Product
	for rows.Next() {
		p := &model.Product{}
		rows.Scan(&p.ID, &p.Name, &p.Price, &p.Stock, &p.Version, &p.UpdatedAt)
		products = append(products, p)
	}
	return products, nil
}
