package repo

import (
	"database/sql"

	"pesalocal/internal/model"
)

type SyncOperationRepo struct {
	db *sql.DB
}

func NewSyncOperationRepo(db *sql.DB) *SyncOperationRepo {
	return &SyncOperationRepo{db: db}
}

// Create adds a new sync operation (from device)
func (r *SyncOperationRepo) Create(op *model.SyncOperation) error {
	_, err := r.db.Exec(
		"INSERT INTO sync_operations (id, entity_type, entity_id, operation, payload, device_id, created_at, retry_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		op.ID, op.EntityType, op.EntityID, op.Operation, op.Payload, op.DeviceID, op.CreatedAt, op.RetryCount,
	)
	return err
}

// GetAllPending returns all operations that have not been processed (retry_count < max)
func (r *SyncOperationRepo) GetAllPending(maxRetries int) ([]*model.SyncOperation, error) {
	rows, err := r.db.Query(
		"SELECT id, entity_type, entity_id, operation, payload, device_id, created_at, retry_count FROM sync_operations WHERE retry_count < ?",
		maxRetries,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ops []*model.SyncOperation
	for rows.Next() {
		op := &model.SyncOperation{}
		rows.Scan(&op.ID, &op.EntityType, &op.EntityID, &op.Operation, &op.Payload, &op.DeviceID, &op.CreatedAt, &op.RetryCount)
		ops = append(ops, op)
	}
	return ops, nil
}

// IncrementRetry increases retry_count for failed operation
func (r *SyncOperationRepo) IncrementRetry(id string) error {
	_, err := r.db.Exec(
		"UPDATE sync_operations SET retry_count = retry_count + 1 WHERE id=?",
		id,
	)
	return err
}

// Delete removes an operation after successful processing
func (r *SyncOperationRepo) Delete(id string) error {
	_, err := r.db.Exec("DELETE FROM sync_operations WHERE id=?", id)
	return err
}

func (r *SyncOperationRepo) GetAll() ([]*model.SyncOperation, error) {
	rows, err := r.db.Query(`
		SELECT
			id,
			entity_type,
			entity_id,
			operation,
			payload,
			device_id,
			created_at,
			retry_count
		FROM sync_operations
		ORDER BY created_at ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ops []*model.SyncOperation

	for rows.Next() {
		op := &model.SyncOperation{}

		err := rows.Scan(
			&op.ID,
			&op.EntityType,
			&op.EntityID,
			&op.Operation,
			&op.Payload,
			&op.DeviceID,
			&op.CreatedAt,
			&op.RetryCount,
		)
		if err != nil {
			return nil, err
		}

		ops = append(ops, op)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return ops, nil
}

func (r *SyncOperationRepo) Update(op *model.SyncOperation) error {
	_, err := r.db.Exec(`
		UPDATE sync_operations
		SET
			entity_type = ?,
			entity_id   = ?,
			operation   = ?,
			payload     = ?,
			device_id   = ?,
			created_at  = ?,
			retry_count = ?
		WHERE id = ?
	`,
		op.EntityType,
		op.EntityID,
		op.Operation,
		op.Payload,
		op.DeviceID,
		op.CreatedAt,
		op.RetryCount,
		op.ID,
	)

	return err
}
