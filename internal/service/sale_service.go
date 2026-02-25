package service

import (
	"errors"
	"time"

	"pesalocal/internal/model"
	"pesalocal/internal/repo"
)

var ErrSaleConflict = errors.New("sale version conflict")

type SaleService struct {
	saleRepo     *repo.SaleRepo
	saleItemRepo *repo.SaleItemRepo
	productSvc   *ProductService
}

func NewSaleService(sr *repo.SaleRepo, sir *repo.SaleItemRepo, ps *ProductService) *SaleService {
	return &SaleService{
		saleRepo:     sr,
		saleItemRepo: sir,
		productSvc:   ps,
	}
}

// CreateSale handles creating a sale with multiple items
func (s *SaleService) CreateSale(sale *model.Sale, items []*model.SaleItem) error {
	total := 0.0

	// 1. Calculate totals and adjust stock
	for _, item := range items {
		item.Total = float64(item.Quantity) * item.Price
		total += item.Total

		// Adjust product stock
		err := s.productSvc.AdjustStock(item.ProductID, -item.Quantity)
		if err != nil {
			return err
		}
	}

	// 2. Set sale fields
	sale.Total = total
	sale.Version = 1
	sale.CreatedAt = time.Now()

	// 3. Insert sale into DB
	err := s.saleRepo.Create(sale)
	if err != nil {
		return err
	}

	// 4. Insert sale items into DB
	for _, item := range items {
		item.SaleID = sale.ID
		err := s.saleItemRepo.Create(item)
		if err != nil {
			return err
		}
	}

	return nil
}

// GetSale returns a sale by ID along with its items
func (s *SaleService) GetSale(id string) (*model.Sale, []*model.SaleItem, error) {
	sale, err := s.saleRepo.GetByID(id)
	if err != nil {
		return nil, nil, err
	}

	items, err := s.saleItemRepo.GetBySaleID(id)
	if err != nil {
		return nil, nil, err
	}

	return sale, items, nil
}

// GetAllSales returns all sales
func (s *SaleService) GetAllSales() ([]*model.Sale, error) {
	return s.saleRepo.GetAll()
}
