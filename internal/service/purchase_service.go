package service

import (
	"errors"
	"time"

	"pesalocal/internal/model"
	"pesalocal/internal/repo"
)

var ErrPurchaseConflict = errors.New("purchase version conflict")

type PurchaseService struct {
	purchaseRepo     *repo.PurchaseRepo
	purchaseItemRepo *repo.PurchaseItemRepo
	productSvc       *ProductService
}

func NewPurchaseService(pr *repo.PurchaseRepo, pir *repo.PurchaseItemRepo, ps *ProductService) *PurchaseService {
	return &PurchaseService{
		purchaseRepo:     pr,
		purchaseItemRepo: pir,
		productSvc:       ps,
	}
}

// CreatePurchase handles creating a purchase with multiple items
func (s *PurchaseService) CreatePurchase(purchase *model.Purchase, items []*model.PurchaseItem) error {
	total := 0.0

	// 1. Calculate totals and update stock
	for _, item := range items {
		item.Total = float64(item.Quantity) * item.Price
		total += item.Total

		// Increase product stock
		err := s.productSvc.AdjustStock(item.ProductID, item.Quantity)
		if err != nil {
			return err
		}
	}

	// 2. Set purchase fields
	purchase.TotalAmount = total
	purchase.Version = 1
	purchase.CreatedAt = time.Now()

	// 3. Insert purchase into DB
	err := s.purchaseRepo.Create(purchase)
	if err != nil {
		return err
	}

	// 4. Insert purchase items into DB
	for _, item := range items {
		item.PurchaseID = purchase.ID
		err := s.purchaseItemRepo.Create(item)
		if err != nil {
			return err
		}
	}

	return nil
}

// GetPurchase returns a purchase and its items by ID
func (s *PurchaseService) GetPurchase(id string) (*model.Purchase, []*model.PurchaseItem, error) {
	purchase, err := s.purchaseRepo.GetByID(id)
	if err != nil {
		return nil, nil, err
	}

	items, err := s.purchaseItemRepo.GetByPurchaseID(id)
	if err != nil {
		return nil, nil, err
	}

	return purchase, items, nil
}

// GetAllPurchases returns all purchases
func (s *PurchaseService) GetAllPurchases() ([]*model.Purchase, error) {
	return s.purchaseRepo.GetAll()
}
