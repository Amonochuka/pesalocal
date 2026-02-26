package repo

import (
	"database/sql"
	"pesalocal/internal/model"
)

type PurchaseItemRepo struct {
	db *sql.DB
}

func NewPurchaseItemRepo(db *sql.DB) *PurchaseItemRepo {
	return &PurchaseItemRepo{db: db}
}

// Create inserts a purchase item
func (r *PurchaseItemRepo) Create(item *model.PurchaseItem) error {
	_, err := r.db.Exec(
		"INSERT INTO purchase_items (id, purchase_id, product_id, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)",
		item.ID, item.PurchaseID, item.ProductID, item.Quantity, item.Price, item.Total,
	)
	return err
}

// GetByPurchaseID fetches all items for a purchase
func (r *PurchaseItemRepo) GetByPurchaseID(purchaseID string) ([]*model.PurchaseItem, error) {
	rows, err := r.db.Query(
		"SELECT id, purchase_id, product_id, quantity, price, total FROM purchase_items WHERE purchase_id=?",
		purchaseID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*model.PurchaseItem
	for rows.Next() {
		i := &model.PurchaseItem{}
		rows.Scan(&i.ID, &i.PurchaseID, &i.ProductID, &i.Quantity, &i.Price, &i.Total)
		items = append(items, i)
	}
	return items, nil
}

// DeleteByPurchaseID removes all items for a purchase
func (r *PurchaseItemRepo) DeleteByPurchaseID(purchaseID string) error {
	_, err := r.db.Exec("DELETE FROM purchase_items WHERE purchase_id=?", purchaseID)
	return err
}
