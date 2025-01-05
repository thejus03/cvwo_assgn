package comments

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/thejus03/cvwo_assgn/backend/internal/database"
	"github.com/thejus03/cvwo_assgn/backend/internal/handlers/users"
	"github.com/thejus03/cvwo_assgn/backend/internal/models"
)

func Create(res http.ResponseWriter, req *http.Request) {
	db, err := database.GetDB()
	if err != nil {
		fmt.Println("Error getting database:", err)
		return
	}
	defer db.Close()

	// Check if valid user
	access_token := req.Header.Get("Authorization")
	_, err = users.ParseToken(&access_token)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: Access token may not be valid", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	// Get comment from body
	var comment struct {
		UserID      int            `json:"user_id"`
		Description string         `json:"description"`
		PostID      int            `json:"postid"`
		ReplyID     int            `json:"replyid"`
	}

	json_body, err := io.ReadAll(req.Body)
	if err != nil {
		json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Error reading request body", StatusCode: 500})
		return
	}

	err = json.Unmarshal(json_body, &comment)
	if err != nil {
		json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Error parsing request body", StatusCode: 500})
		return
	}

	// Send SQL commands to insert comment
	_, err = db.Exec("INSERT INTO comments (userid, description, postid, replyid) VALUES ($1, $2, $3, $4)", comment.UserID, comment.Description, comment.PostID, comment.ReplyID)
	if err != nil {
		json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Error inserting comment", StatusCode: 500})
		return
	}

	// Get all comments for the post
	comments, err := GetByPostID(db, &comment.PostID)
	if err != nil {
		json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Error getting comments", StatusCode: 500})
		return
	}

	json.NewEncoder(res).Encode(models.Response{Payload: comments, Message: "Comment created successfully", StatusCode: 200})

}

func Delete(res http.ResponseWriter, req *http.Request) {
	db, err := database.GetDB()
	if err != nil {
		fmt.Println("Error getting database:", err)
		return
	}
	defer db.Close()

	// Check if valid user
	access_token := req.Header.Get("Authorization")
	_, err = users.ParseToken(&access_token)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: Access token may not be valid", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	// Get comment from body
	var comment struct {
		ID int `json:"id"`
	}

	json_body, err := io.ReadAll(req.Body)
	if err != nil {
		json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Error reading request body", StatusCode: 500})
		return
	}

	err = json.Unmarshal(json_body, &comment)
	if err != nil {
		json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Error parsing request body", StatusCode: 500})
		return
	}

	// Send SQL commands to delete comment
	_, err = db.Exec("DELETE FROM comments WHERE id = $1", comment.ID)
	if err != nil {
		json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Error deleting comment", StatusCode: 500})
		return
	}

	json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Comment deleted successfully", StatusCode: 200})
}

func Update(res http.ResponseWriter, req *http.Request) {
	db, err := database.GetDB()
	if err != nil {
		fmt.Println("Error getting database:", err)
		return
	}
	defer db.Close()

	// Check if valid user
	access_token := req.Header.Get("Authorization")
	_, err = users.ParseToken(&access_token)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: Access token may not be valid", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	// Get comment from body
	var comment struct {
		ID          int    `json:"id"`
		Description string `json:"description"`
	}

	json_body, err := io.ReadAll(req.Body)
	if err != nil {
		json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Error reading request body", StatusCode: 500})
		return
	}

	err = json.Unmarshal(json_body, &comment)
	if err != nil {
		json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Error parsing request body", StatusCode: 500})
		return
	}

	// Send SQL commands to update comment
	_, err = db.Exec("UPDATE comments SET description = $1 WHERE id = $2", comment.Description, comment.ID)
	if err != nil {
		json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Error updating comment", StatusCode: 500})
		return
	}

	json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Comment updated successfully", StatusCode: 200})
}

// Helper functions

func GetByPostID(db *sql.DB, postID *int) ([]models.Comment, error) {
	rows, err := db.Query("SELECT * FROM comments WHERE postid = $1", *postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []models.Comment
	for rows.Next() {
		var comment models.Comment
		err := rows.Scan(&comment.ID, &comment.UserID, &comment.CreatedAt, &comment.Description, &comment.PostID, &comment.ReplyID)
		if err != nil {
			return nil, err
		}
		// Get the user info of who posted
		user, err := users.GetUserByID(db, &comment.UserID)
		if err != nil {
			fmt.Println("Error getting user info")
		}
		if err != nil {
			return nil, err
		}
		comment.Metadata = make(map[string]any)
		comment.Metadata["user"] = *user

		comments = append(comments, comment)
	}

	return comments, nil
}
