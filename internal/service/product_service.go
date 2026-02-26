package service

import (
	"errors"
	"time"

	"pesalocal/internal/model"
	"pesalocal/internal/repo"
)

var ErrProductConflict = errors.New("product version conflict")
var ErrInsufficientStock = errors.New("insufficient stock")

type ProductService struct {
	productRepo *repo.ProductRepo
}

func NewProductService(pr *repo.ProductRepo) *ProductService {
	return &ProductService{
		productRepo: pr,
	}
}

// CreateOrUpdateProduct ensures idempotent behavior for sync
func (s *ProductService) CreateOrUpdateProduct(p *model.Product) error {
	if p.Version == 0 {
		p.Version = 1
	}
	if p.UpdatedAt.IsZero() {
		p.UpdatedAt = time.Now()
	}
	return s.productRepo.CreateOrUpdate(p)
}

// CreateProduct inserts a new product (non-sync usage)
func (s *ProductService) CreateProduct(p *model.Product) error {
	p.Version = 1
	p.UpdatedAt = time.Now()
	return s.productRepo.CreateOrUpdate(p) // use CreateOrUpdate to prevent conflict
}

// UpdateProduct updates product details (non-sync usage)
func (s *ProductService) UpdateProduct(p *model.Product) error {
	// increment version for optimistic concurrency
	p.Version += 1
	p.UpdatedAt = time.Now()

	err := s.productRepo.CreateOrUpdate(p) // use CreateOrUpdate instead of old Update
	if err != nil {
		return ErrProductConflict
	}
	return nil
}

// AdjustStock adjusts stock quantity (positive or negative)
func (s *ProductService) AdjustStock(productID string, delta int) error {
	product, err := s.productRepo.GetByID(productID)
	if err != nil {
		return err
	}

	newStock := product.Stock + delta
	if newStock < 0 {
		return ErrInsufficientStock
	}

	product.Stock = newStock
	product.Version += 1
	product.UpdatedAt = time.Now()

	err = s.productRepo.CreateOrUpdate(product) // updated for sync safety
	if err != nil {
		return ErrProductConflict
	}

	return nil
}

// GetProduct returns a product by ID
func (s *ProductService) GetProduct(id string) (*model.Product, error) {
	return s.productRepo.GetByID(id)
}

// GetAllProducts returns all products
func (s *ProductService) GetAllProducts() ([]*model.Product, error) {
	return s.productRepo.GetAll()
}
