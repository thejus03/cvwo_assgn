package models

import (
	"time"
)

type User struct {
	ID       int    `json:"id,omitempty"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type Post struct {
	ID          int             `json:"id,omitempty"`
	UserID      int             `json:"user_id"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	CreatedAt   time.Time       `json:"created_at"`
	Tags        []int32         `json:"tags"` // needs to be int32/int64 because of pq.Array only accepting these types
	Comments 	[]Comment		`json:"comments"`
	Upvotes     map[string]bool `json:"upvotes"`
	Downvotes   map[string]bool `json:"downvotes"`
	Metadata    map[string]any  `json:"metadata"`
}

type Tag struct {
	ID   int    `json:"id,omitempty"`
	Name string `json:"name"`
}

type Comment struct {
	ID          int       `json:"id,omitempty"`
	UserID      int       `json:"user_id"`
	CreatedAt   time.Time `json:"created_at"`
	Description string    `json:"description"`
	PostID      int       `json:"post_id"`
	ReplyID 	int 	  `json:"reply_id"`
	Metadata    map[string]any  `json:"metadata"`
}

type Response struct {
	Payload    any    `json:"payload"`
	Message    string `json:"message"`
	StatusCode int    `json:"statusCode"`
}
