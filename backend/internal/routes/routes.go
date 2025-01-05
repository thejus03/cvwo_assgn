package routes

import (
	"net/http"
	"github.com/go-chi/chi/v5"
	"github.com/thejus03/cvwo_assgn/backend/internal/handlers/users"
	"github.com/thejus03/cvwo_assgn/backend/internal/handlers/posts"
	"github.com/thejus03/cvwo_assgn/backend/internal/handlers/comments"
)

func Getroutes() func(r chi.Router) {
	return func(r chi.Router) {

		// USERS

		// Create new user
		r.Post("/createUser", func(res http.ResponseWriter, req *http.Request) {users.Create(res, req)})
		// Authenticate user
		r.Post("/validateUser", func(res http.ResponseWriter, req *http.Request) {users.Validate(res, req)})
		// Delete user
		r.Post("/deleteUser", func(res http.ResponseWriter, req *http.Request) {users.Delete(res, req)})
		// Get user info using token
		r.Get("/getUserInfo", func(res http.ResponseWriter, req *http.Request) {users.GetInfo(res, req)})
		
		// POSTS

		// Create new post
		r.Post("/createPost", func(res http.ResponseWriter, req *http.Request) {posts.Create(res, req)})	
		// Get all posts
		r.Get("/getAllPosts", func(res http.ResponseWriter, req *http.Request) {posts.GetAll(res, req)})
		// Upvote post
		r.Post("/HandleVotePost", func(res http.ResponseWriter, req *http.Request) {posts.HandleVoteByID(res, req)})
		// Get post by ID
		r.Post("/getPostByID", func(res http.ResponseWriter, req *http.Request) {posts.GetByID(res, req)})	


		// Comments

		// Create new comment
		r.Post("/createComment", func(res http.ResponseWriter, req *http.Request) {comments.Create(res, req)})
		// Delete comment
		r.Post("/deleteComment", func(res http.ResponseWriter, req *http.Request) {comments.Delete(res, req)})
		// Update comment
		r.Post("/updateComment", func(res http.ResponseWriter, req *http.Request) {comments.Update(res, req)})
	}
} 