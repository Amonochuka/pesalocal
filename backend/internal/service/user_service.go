package service

import (
	"errors"
	"time"

	"pesalocal/internal/model"
	"pesalocal/internal/repo"

	"golang.org/x/crypto/bcrypt"
)

var ErrUserConflict = errors.New("user version conflict")

type UserService struct {
	userRepo *repo.UserRepo
}

func NewUserService(ur *repo.UserRepo) *UserService {
	return &UserService{
		userRepo: ur,
	}
}

// CreateOrUpdateUser ensures idempotent sync behavior
func (s *UserService) CreateOrUpdateUser(u *model.User) error {
	if u.Version == 0 {
		u.Version = 1
	}
	if u.UpdatedAt.IsZero() {
		u.UpdatedAt = time.Now()
	}
	if u.CreatedAt.IsZero() {
		u.CreatedAt = time.Now()
	}
	return s.userRepo.CreateOrUpdate(u)
}

// CreateUser creates a new user and hashes the password
func (s *UserService) CreateUser(u *model.User, plainPassword string) error {
	hashed, err := bcrypt.GenerateFromPassword([]byte(plainPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashed)
	u.Version = 1
	u.CreatedAt = time.Now()
	u.UpdatedAt = time.Now()
	return s.userRepo.CreateOrUpdate(u) // idempotent
}

// UpdateUser updates user details
func (s *UserService) UpdateUser(u *model.User) error {
	u.Version += 1
	u.UpdatedAt = time.Now()
	if u.CreatedAt.IsZero() {
		u.CreatedAt = time.Now()
	}
	err := s.userRepo.CreateOrUpdate(u)
	if err != nil {
		return ErrUserConflict
	}
	return nil
}

// GetUser returns a user by ID
func (s *UserService) GetUser(id string) (*model.User, error) {
	return s.userRepo.GetByID(id)
}

// GetAllUsers returns all users
func (s *UserService) GetAllUsers() ([]*model.User, error) {
	return s.userRepo.GetAll()
}

// CheckPassword verifies a user's password
func (s *UserService) CheckPassword(u *model.User, plainPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(plainPassword))
	return err == nil
}
