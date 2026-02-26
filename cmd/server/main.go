package main

import (
	"database/sql"
	"log"
	"net/http"
	"time"

	handlers "pesalocal/internal/handler"
	"pesalocal/internal/repo"
	"pesalocal/internal/service"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	// Initialize DB
	// For demo/hackathon, SQLite in-memory or file-based DB
	dbPath := "/home/aochuka/Projects/pesalocal/pesalocal.db"
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("failed to open DB: %v", err)
	}
	defer db.Close()

	if err := initDB(db); err != nil {
		log.Fatalf("failed to initialize DB: %v", err)
	}

	// Optional: set connection pool if needed
	db.SetMaxOpenConns(10)
	db.SetConnMaxLifetime(time.Hour)

	// Initialize Repositories with DB
	productRepo := repo.NewProductRepo(db)
	saleRepo := repo.NewSaleRepo(db)
	saleItemRepo := repo.NewSaleItemRepo(db)
	purchaseRepo := repo.NewPurchaseRepo(db)
	purchaseItemRepo := repo.NewPurchaseItemRepo(db)
	userRepo := repo.NewUserRepo(db)
	syncRepo := repo.NewSyncOperationRepo(db)

	// Initialize Services
	productSvc := service.NewProductService(productRepo)
	saleSvc := service.NewSaleService(saleRepo, saleItemRepo, productSvc)
	purchaseSvc := service.NewPurchaseService(purchaseRepo, purchaseItemRepo, productSvc)
	userSvc := service.NewUserService(userRepo)
	syncSvc := service.NewSyncService(syncRepo, productSvc, saleSvc, purchaseSvc, userSvc)

	// Initialize Handlers
	syncHandler := handlers.NewSyncHandler(syncSvc)

	// Setup Router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(15 * time.Second))

	//  Public / Demo Endpoint
	r.Post("/sync/push", syncHandler.Push)

	// Start Server
	addr := ":8080"
	log.Printf("Starting demo backend at %s...", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
