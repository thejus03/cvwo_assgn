package main

import (
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/rs/cors"
	"github.com/thejus03/cvwo_assgn/backend/internal/routes"
	"log"
	"net/http"
)

func main() {

	// Enable CORS for frontend
	corsMiddleWare := cors.New(cors.Options{
		AllowedOrigins: []string{"*"}, // Frontend running on port 3000
		AllowedMethods: []string{"GET", "POST"},
		AllowedHeaders: []string{"*"}, // ALlow all headers
	})

	// Start and configure chi router
	r := chi.NewRouter()
	r.Use(corsMiddleWare.Handler)

	setuproutes(r)

	fmt.Println("Starting server on port 8080")

	log.Fatalln(http.ListenAndServe(":8080", r))
}

func setuproutes(r *chi.Mux) {
	// Groups all endpoints to your router
	r.Group(routes.Getroutes())
}
