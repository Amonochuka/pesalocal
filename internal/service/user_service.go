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

// CreateUser creates a new user and hashes the password
func (s *UserService) CreateUser(u *model.User, plainPassword string) error {
	// Hash the password
	hashed, err := bcrypt.GenerateFromPassword([]byte(plainPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashed)

	// Initialize version and timestamps
	u.Version = 1
	u.CreatedAt = time.Now()
	u.UpdatedAt = time.Now()

	return s.userRepo.Create(u)
}

// UpdateUser updates user details with conflict handling
func (s *UserService) UpdateUser(u *model.User) error {
	// Increment version and update timestamp
	u.Version += 1
	u.UpdatedAt = time.Now()

	err := s.userRepo.Update(u)
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
