package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"pesalocal/internal/model"
	"pesalocal/internal/service"
)

type IncomingSyncOperation struct {
	ID         string          `json:"id"`
	EntityType string          `json:"entity_type"`
	EntityID   string          `json:"entity_id"`
	Operation  string          `json:"operation"`
	Payload    json.RawMessage `json:"payload"`
	DeviceID   string          `json:"device_id"`
	CreatedAt  time.Time       `json:"created_at"`
	RetryCount int             `json:"retry_count"`
}

type SyncHandler struct {
	syncService *service.SyncService
}

func NewSyncHandler(syncService *service.SyncService) *SyncHandler {
	return &SyncHandler{
		syncService: syncService,
	}
}

// POST /sync/push
func (h *SyncHandler) Push(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var incoming []IncomingSyncOperation
	if err := json.NewDecoder(r.Body).Decode(&incoming); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}

	// Convert incoming to model.SyncOperation
	ops := make([]*model.SyncOperation, 0, len(incoming))
	for _, in := range incoming {
		op := &model.SyncOperation{
			ID:         in.ID,
			EntityType: in.EntityType,
			EntityID:   in.EntityID,
			Operation:  in.Operation,
			Payload:    in.Payload,
			DeviceID:   in.DeviceID,
			CreatedAt:  in.CreatedAt,
			RetryCount: in.RetryCount,
		}
		ops = append(ops, op)
	}

	// Queue all operations
	for _, op := range ops {
		if err := h.syncService.AddSyncOperation(op); err != nil {
			http.Error(w, "failed to queue operation: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Attempt processing
	err := h.syncService.ProcessAllSyncOperations()

	// Prepare response
	resp := make(map[string]interface{})
	if err != nil {
		// Return failed operation IDs
		resp["status"] = "partial_fail"
		resp["message"] = err.Error()
	} else {
		resp["status"] = "ok"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
