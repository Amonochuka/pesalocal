package repo

import (
	"database/sql"
	"pesalocal/internal/model"
)

type SaleItemRepo struct {
	db *sql.DB
}

func NewSaleItemRepo(db *sql.DB) *SaleItemRepo {
	return &SaleItemRepo{db: db}
}

// Create inserts a sale item into the database
func (r *SaleItemRepo) Create(item *model.SaleItem) error {
	_, err := r.db.Exec(
		"INSERT INTO sale_items (id, sale_id, product_id, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)",
		item.ID, item.SaleID, item.ProductID, item.Quantity, item.Price, item.Total,
	)
	return err
}

// GetBySaleID fetches all sale items for a specific sale
func (r *SaleItemRepo) GetBySaleID(saleID string) ([]*model.SaleItem, error) {
	rows, err := r.db.Query(
		"SELECT id, sale_id, product_id, quantity, price, total FROM sale_items WHERE sale_id=?",
		saleID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*model.SaleItem
	for rows.Next() {
		i := &model.SaleItem{}
		if err := rows.Scan(&i.ID, &i.SaleID, &i.ProductID, &i.Quantity, &i.Price, &i.Total); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, nil
}

// DeleteBySaleID removes all sale items associated with a sale
func (r *SaleItemRepo) DeleteBySaleID(saleID string) error {
	_, err := r.db.Exec("DELETE FROM sale_items WHERE sale_id=?", saleID)
	return err
}
