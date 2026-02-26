package repo

import (
	"database/sql"
	"errors"

	"pesalocal/internal/model"
)

var ErrProductConflict = errors.New("product version conflict")

type ProductRepo struct {
	db *sql.DB
}

func NewProductRepo(db *sql.DB) *ProductRepo {
	return &ProductRepo{db: db}
}

// CreateOrUpdate ensures idempotent behavior for sync
func (r *ProductRepo) CreateOrUpdate(p *model.Product) error {
	existing, err := r.GetByID(p.ID)
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	if existing == nil {
		_, err := r.db.Exec(
			"INSERT INTO products (id, name, price, stock, version, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
			p.ID, p.Name, p.Price, p.Stock, p.Version, p.UpdatedAt,
		)
		return err
	}

	// Update only if version is newer
	if p.Version <= existing.Version {
		return nil
	}

	res, err := r.db.Exec(
		"UPDATE products SET name=?, price=?, stock=?, version=?, updated_at=? WHERE id=?",
		p.Name, p.Price, p.Stock, p.Version, p.UpdatedAt, p.ID,
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

// GetByID returns a product by its ID
func (r *ProductRepo) GetByID(id string) (*model.Product, error) {
	row := r.db.QueryRow("SELECT id, name, price, stock, version, updated_at FROM products WHERE id=?", id)
	p := &model.Product{}
	err := row.Scan(&p.ID, &p.Name, &p.Price, &p.Stock, &p.Version, &p.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // not found
		}
		return nil, err
	}
	return p, nil
}

// GetAll returns all products
func (r *ProductRepo) GetAll() ([]*model.Product, error) {
	rows, err := r.db.Query("SELECT id, name, price, stock, version, updated_at FROM products")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []*model.Product
	for rows.Next() {
		p := &model.Product{}
		err := rows.Scan(&p.ID, &p.Name, &p.Price, &p.Stock, &p.Version, &p.UpdatedAt)
		if err != nil {
			return nil, err
		}
		products = append(products, p)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}
