package posts

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/lib/pq"
	"github.com/thejus03/cvwo_assgn/backend/internal/database"
	"github.com/thejus03/cvwo_assgn/backend/internal/handlers/comments"
	"github.com/thejus03/cvwo_assgn/backend/internal/handlers/tags"
	"github.com/thejus03/cvwo_assgn/backend/internal/handlers/users"
	"github.com/thejus03/cvwo_assgn/backend/internal/models"
)

type post struct {
	Userid      int    `json:"userid"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Tags        []string  `json:"tags"`
}

func Create(res http.ResponseWriter, req *http.Request) {
	fmt.Println("POST /createPost")
	db, err := database.GetDB()
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()

	res.Header().Set("Content-Type", "application/json")
	// Read the body
	body, err := io.ReadAll(req.Body)
	if err != nil {
		fmt.Println("Error reading body")
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to read body", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	// Decode body
	var data post
	err = json.Unmarshal(body, &data)

	if err != nil {
		fmt.Printf("Error decoding body: %v", err)
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to decode body", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	// Create post
	err = createPost(db, &data)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to create post", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	err = json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Success: post created", StatusCode: 200})
	if err != nil {
		fmt.Println("Unable to encode")
	}
}

func GetAll(res http.ResponseWriter, req *http.Request) {
	fmt.Println("GET /getAllPosts")
	db, err := database.GetDB()
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()
	res.Header().Set("Content-Type", "application/json")

	// // Check if valid user
	// access_token := req.Header.Get("Authorization")
	// _, err = users.ParseToken(&access_token)
	// if err != nil {
	// 	err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: Access token may not be valid", StatusCode: 500})
	// 	if err != nil {
	// 		fmt.Println("Unable to encode")
	// 	}
	// 	return
	// }

	// Query for all posts
	rows, err := db.Query("SELECT id, userid, title, description, createdat, tags, upvotes, downvotes FROM posts ORDER BY createdat DESC;")
	if err != nil {
		fmt.Println(err)
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to get posts", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	defer rows.Close()

	posts, err := parsePosts(rows, db)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to parse posts", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
	}

	// Encode and send all posts
	err = json.NewEncoder(res).Encode(models.Response{Payload: posts, Message: "Success: all posts", StatusCode: 200})
	if err != nil {
		fmt.Println("Unable to encode")
	}
}

func GetByID(res http.ResponseWriter, req *http.Request) {
	fmt.Println("GET /getAllPosts")
	db, err := database.GetDB()
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()
	res.Header().Set("Content-Type", "application/json")

	// // Check if valid user
	// access_token := req.Header.Get("Authorization")
	// _, err = users.ParseToken(&access_token)
	// if err != nil {
	// 	err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: Access token may not be valid", StatusCode: 500})
	// 	if err != nil {
	// 		fmt.Println("Unable to encode")
	// 	}
	// 	return
	// }

	// Get post id from body
	json_body, err := io.ReadAll(req.Body)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to read body", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	var postId struct {
		ID string `json:"id"`
	}
	err = json.Unmarshal(json_body, &postId)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to decode body", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}
	var post models.Post
	var upvotes []byte
	var downvotes []byte
	err = db.QueryRow("SELECT id, userid, title, description, createdat, tags, upvotes, downvotes FROM posts WHERE id = $1", postId.ID).Scan(&post.ID, &post.UserID, &post.Title, &post.Description, &post.CreatedAt, pq.Array(&post.Tags), &upvotes, &downvotes)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to query", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	// Convert upvotes to map
	var upvotesMap map[string]bool
	var downvotesMap map[string]bool
	err = json.Unmarshal(upvotes, &upvotesMap)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to decode", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	post.Upvotes = upvotesMap

	err = json.Unmarshal(downvotes, &downvotesMap)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to decode", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}
	post.Downvotes = downvotesMap

	// For each post, get the metadata ie tag info and comment info
	var tagInfo []models.Tag
	for _, tag_id := range post.Tags {
		tag_id := int(tag_id)
		tag, err := tags.GetTagFromID(db, &tag_id)
		if err != nil {
			fmt.Println("Error getting tag info")
		}
		tagInfo = append(tagInfo, tag)
	}

	post.Metadata = make(map[string]any)
	post.Metadata["tags"] = tagInfo

	// Get comments for the post
	comms, err := comments.GetByPostID(db, &post.ID)
	if err != nil {
		fmt.Println("Error getting comments", err)
	}

	post.Comments = comms

	// Get the user info of who posted
	user, err := users.GetUserByID(db, &post.UserID)
	if err != nil {
		fmt.Println("Error getting user info")
	}
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to get post", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	post.Metadata["user"] = *user

	err = json.NewEncoder(res).Encode(models.Response{Payload: post, Message: "Success: post found", StatusCode: 200})
	if err != nil {
		fmt.Println("Unable to encode")
	}

}

type payload struct {
	PostID   int    `jsdon:"postid"`
	UserID   int    `json:"userid"`
	VoteType string `json:"votetype"`
}

func HandleVoteByID(res http.ResponseWriter, req *http.Request) {
	db, err := database.GetDB()
	if err != nil {
		fmt.Println(err)
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

	res.Header().Set("Content-Type", "application/json")

	// Get Post id from body
	json_body, err := io.ReadAll(req.Body)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to read body", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	var data payload
	err = json.Unmarshal(json_body, &data)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to decode body", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	if data.VoteType == "upvote" {
		upvote(db, res, &data)
	} else if data.VoteType == "downvote" {
		downvote(db, res, &data)
	} else if data.VoteType == "removeupvote" {
		removeUpvote(db, res, &data)
	} else if data.VoteType == "removedownvote" {
		removeDownvote(db, res, &data)
	} else {
		fmt.Printf("Invalid vote '%v' \n", data.VoteType)
	}
}

func Search(res http.ResponseWriter, req *http.Request) {
	fmt.Println("POST /search")
	db, err := database.GetDB()
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()

	res.Header().Set("Content-Type", "application/json")

	// Read the body
	body, err := io.ReadAll(req.Body)
	if err != nil {
		fmt.Println("Error reading body")
	}

	var data struct {
		Query string `json:"query"`
	}

	err = json.Unmarshal(body, &data)
	if err != nil {
		fmt.Println("Error decoding body")
	}

	// Query for all posts
	rows, err := db.Query("SELECT id, userid, title, description, createdat, tags, upvotes, downvotes FROM posts WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY createdat DESC;", "%"+data.Query+"%")
	if err != nil {
		fmt.Println(err)
	}

	posts, err := parsePosts(rows, db)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to parse posts", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
	}

	// Encode and send all posts
	err = json.NewEncoder(res).Encode(models.Response{Payload: posts, Message: "Success: all posts", StatusCode: 200})
	if err != nil {
		fmt.Println("Unable to encode")
	}

}








// Helper function
func createPost(db *sql.DB, data *post) error {
	stmt, err := db.Prepare("INSERT INTO posts (userid, title, description, tags) VALUES ($1, $2, $3, $4)")
	if err != nil {
		return err
	}

	defer stmt.Close()
	var tagInt []int
	for _, tag := range data.Tags {
		stmt, err := db.Prepare("SELECT id FROM tags WHERE name = $1")
		if err != nil {
			return err
		}
		defer stmt.Close()
		var res int;
		err = stmt.QueryRow(tag).Scan(&res)
		if err != nil {
			return err
		}
		tagInt = append(tagInt, res)
	}


	_, err = stmt.Exec(data.Userid, data.Title, data.Description, pq.Array(tagInt))
	if err != nil {
		return err
	}

	return nil
}

func upvote(db *sql.DB, res http.ResponseWriter, data *payload) {
	stmt, err := db.Prepare("UPDATE posts SET upvotes = jsonb_set(upvotes, $1, $2::jsonb) WHERE id = $3")
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to prepare statement", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	defer stmt.Close()

	var key string = fmt.Sprintf("{%d}", data.UserID)
	var value string = "true"
	_, err = stmt.Exec(key, value, data.PostID)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to execute statement", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	err = json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Success: upvoted post", StatusCode: 200})
	if err != nil {
		fmt.Println("Unable to encode")
		return
	}
}

func downvote(db *sql.DB, res http.ResponseWriter, data *payload) {
	stmt, err := db.Prepare("UPDATE posts SET downvotes = jsonb_set(downvotes, $1, $2::jsonb) WHERE id = $3")
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to prepare statement", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	defer stmt.Close()

	var key string = fmt.Sprintf("{%d}", data.UserID)
	var value string = "true"
	_, err = stmt.Exec(key, value, data.PostID)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to execute statement", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	err = json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Success: downvoted post", StatusCode: 200})
	if err != nil {
		fmt.Println("Unable to encode")
		return
	}
}

func removeUpvote(db *sql.DB, res http.ResponseWriter, data *payload) {
	stmt, err := db.Prepare("UPDATE posts SET upvotes = upvotes #- $1 WHERE id = $2")
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to prepare statement", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	defer stmt.Close()

	var key string = fmt.Sprintf("{%d}", data.UserID)
	_, err = stmt.Exec(key, data.PostID)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to execute statement", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	err = json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Success: removed upvote", StatusCode: 200})
	if err != nil {
		fmt.Println("Unable to encode")
		return
	}
}

func removeDownvote(db *sql.DB, res http.ResponseWriter, data *payload) {
	stmt, err := db.Prepare("UPDATE posts SET downvotes = downvotes #- $1 WHERE id = $2")
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to prepare statement", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	defer stmt.Close()

	var key string = fmt.Sprintf("{%d}", data.UserID)
	_, err = stmt.Exec(key, data.PostID)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to execute statement", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}

	err = json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Success: removed downvote", StatusCode: 200})
	if err != nil {
		fmt.Println("Unable to encode")
		return
	}
}

func parsePosts(rows *sql.Rows, db *sql.DB) ([]models.Post, error) {
	var posts []models.Post
	for rows.Next() {
		var post models.Post
		var upvotes []byte
		var downvotes []byte
		err := rows.Scan(&post.ID, &post.UserID, &post.Title, &post.Description, &post.CreatedAt, pq.Array(&post.Tags), &upvotes, &downvotes)
		if err != nil {
			if err != nil {
				fmt.Println("Unable to encode")
			}
			return nil, err
		}

		// Convert upvotes to map
		var upvotesMap map[string]bool
		var downvotesMap map[string]bool
		err = json.Unmarshal(upvotes, &upvotesMap)
		if err != nil {
			if err != nil {
				fmt.Println("Unable to encode")
			}
			return nil, err
		}
		post.Upvotes = upvotesMap

		err = json.Unmarshal(downvotes, &downvotesMap)
		if err != nil {
			if err != nil {
				fmt.Println("Unable to encode")
			}
			return nil, err
		}
		post.Downvotes = downvotesMap

		// For each post, get the metadata ie tag info and comment info
		var tagInfo []models.Tag
		for _, tag_id := range post.Tags {
			tag_id := int(tag_id)
			tag, err := tags.GetTagFromID(db, &tag_id)
			if err != nil {
				fmt.Println("Error getting tag info")
			}
			tagInfo = append(tagInfo, tag)
		}

		// Get the user info of who posted
		user, err := users.GetUserByID(db, &post.UserID)
		if err != nil {
			fmt.Println("Error getting user info")
		}
		post.Metadata = make(map[string]any)
		post.Metadata["user"] = *user
		post.Metadata["tags"] = tagInfo

		// Get comments for the post
		comms, err := comments.GetByPostID(db, &post.ID)
		if err != nil {
			fmt.Println("Error getting comments", err)
		}

		post.Comments = comms

		// Finally, append the post to the slice of posts
		posts = append(posts, post)
	}
	return posts, nil
}