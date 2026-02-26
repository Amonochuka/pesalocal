package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"pesalocal/internal/model"
	"pesalocal/internal/repo"
)

var ErrSyncConflict = errors.New("sync conflict detected")

type SyncService struct {
	syncRepo      *repo.SyncOperationRepo
	productSvc    *ProductService
	saleSvc       *SaleService
	purchaseSvc   *PurchaseService
	userSvc       *UserService
	maxRetryCount int
}

func NewSyncService(
	sr *repo.SyncOperationRepo,
	ps *ProductService,
	ss *SaleService,
	psvc *PurchaseService,
	us *UserService,
) *SyncService {
	return &SyncService{
		syncRepo:      sr,
		productSvc:    ps,
		saleSvc:       ss,
		purchaseSvc:   psvc,
		userSvc:       us,
		maxRetryCount: 5,
	}
}

// ProcessSyncOperation processes a single sync operation
func (s *SyncService) ProcessSyncOperation(op *model.SyncOperation) error {
	var err error

	switch op.EntityType {
	case "product":
		var p model.Product
		if err = json.Unmarshal(op.Payload, &p); err != nil {
			return err
		}
		err = s.productSvc.UpdateProduct(&p)
	case "sale":
		var sale model.Sale
		var items []*model.SaleItem
		if err = json.Unmarshal(op.Payload, &struct {
			Sale  *model.Sale       `json:"sale"`
			Items []*model.SaleItem `json:"items"`
		}{Sale: &sale, Items: items}); err != nil {
			return err
		}
		err = s.saleSvc.CreateSale(&sale, items)
	case "purchase":
		var purchase model.Purchase
		var items []*model.PurchaseItem
		if err = json.Unmarshal(op.Payload, &struct {
			Purchase *model.Purchase       `json:"purchase"`
			Items    []*model.PurchaseItem `json:"items"`
		}{Purchase: &purchase, Items: items}); err != nil {
			return err
		}
		err = s.purchaseSvc.CreatePurchase(&purchase, items)
	case "user":
		var u model.User
		if err = json.Unmarshal(op.Payload, &u); err != nil {
			return err
		}
		err = s.userSvc.UpdateUser(&u)
	default:
		return errors.New("unknown entity type")
	}

	if err != nil {
		// Retry logic
		op.RetryCount += 1
		if op.RetryCount >= s.maxRetryCount {
			return ErrSyncConflict
		}
		// update retry count in DB
		_ = s.syncRepo.Update(op)
		return err
	}

	// Success → delete operation from queue
	return s.syncRepo.Delete(op.ID)
}

// ProcessAllSyncOperations fetches pending operations and processes them
func (s *SyncService) ProcessAllSyncOperations() error {
	ops, err := s.syncRepo.GetAll()
	if err != nil {
		return err
	}

	// Track failures
	var failedOps []string

	for _, op := range ops {
		err := s.ProcessSyncOperation(op)
		if err != nil {
			// Log or track failed operation
			failedOps = append(failedOps, op.ID)
		}
	}

	if len(failedOps) > 0 {
		// Return summary of failed ops
		return fmt.Errorf("failed to process operations: %v", failedOps)
	}

	return nil
}

// AddSyncOperation queues a new operation for offline devices
func (s *SyncService) AddSyncOperation(op *model.SyncOperation) error {
	op.CreatedAt = time.Now()
	op.RetryCount = 0
	return s.syncRepo.Create(op)
}
