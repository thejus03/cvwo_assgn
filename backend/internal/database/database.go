package database

import (
	"database/sql"
    "fmt"

	// Import sqlite3 driver but ignore 
	_ "github.com/lib/pq"
)

func GetDB() (*sql.DB, error) {
	db, err := sql.Open("postgres", "postgres://thejus03@localhost:5432/cvwo_assgn?sslmode=disable")
	if err != nil {
		return nil, fmt.Errorf("error opening db: %w", err)
	}
	
	return db, err
}

