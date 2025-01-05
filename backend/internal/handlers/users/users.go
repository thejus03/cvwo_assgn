package users

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/thejus03/cvwo_assgn/backend/internal/database"
	"github.com/thejus03/cvwo_assgn/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

func Create(res http.ResponseWriter, req *http.Request) {
	fmt.Println("POST /createUser")
	db, err := database.GetDB()
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()
	err = req.ParseForm()
	if err != nil {
		fmt.Println("Error parsing form")
	}

	username := req.FormValue("username")
	password := req.FormValue("password")
	defer req.Body.Close()
	err = CreateUser(db, &username, &password)

	res.Header().Set("Content-Type", "application/json")
	if err != nil {
		fmt.Printf("Error creating user: %v", err)
		error := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: creating user", StatusCode: 500})
		if error != nil {
			fmt.Println("Error encoding json")
		}
		return
	}
	err = json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Success: user created", StatusCode: 200})
	if err != nil {
		fmt.Println("Error encoding json")
	}
}

func Validate(res http.ResponseWriter, req *http.Request) {
	fmt.Println("POST /validateUser")
	db, err := database.GetDB()
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()

	err = req.ParseForm()
	if err != nil {
		fmt.Println("Error parsing form")
	}

	username := req.FormValue("username")
	password := req.FormValue("password")

	defer req.Body.Close()

	valid, token, err := ValidateUser(db, &username, &password)

	res.Header().Set("Content-Type", "application/json")
	if err != nil {
		fmt.Printf("Error validating user: %v\n", err)
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: invalid user", StatusCode: 500})
		if err != nil {
			fmt.Printf("Error encoding data: %v", err)
			return
		}
		return
	}

	if valid {
		data := models.Response{Payload: token, Message: "Success: validated user", StatusCode: 200}
		err := json.NewEncoder(res).Encode(data)
		if err != nil {
			fmt.Printf("Error encoding data: %v", err)
			return
		}
	} else {
		data := models.Response{Payload: "password incorrect", Message: "Error: invalid user", StatusCode: 500}
		err := json.NewEncoder(res).Encode(data)
		if err != nil {
			fmt.Printf("Error encoding data: %v\n", err)
			return
		}
	}
}

func Delete(res http.ResponseWriter, req *http.Request) {

	fmt.Println("DELETE /deleteUser")
	db, err := database.GetDB()
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()

	err = req.ParseForm()
	if err != nil {
		fmt.Println("Error parsing form")
		return
	}

	// Get access token from body
	access_token := req.Header.Get("Authorization")

	res.Header().Set("Content-Type", "application/json")
	err = DeleteUser(db, &access_token)
	if err != nil {
		fmt.Println("Error Deleting user")
		err = json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: unable to delete user", StatusCode: 500})
		if err != nil {
			fmt.Println("Error encoding data")
		}
		return
	}

	err = json.NewEncoder(res).Encode(models.Response{Payload: nil, Message: "Success: user deleted", StatusCode: 200})
	if err != nil {
		fmt.Println("Error encoding data")
	}
}

// Helper functions

func GetUserByID(db *sql.DB, userid *int) (*models.User, error) {
	var user models.User
	err := db.QueryRow("SELECT * FROM users WHERE id = $1", *userid).Scan(&user.ID, &user.Name, &user.Password)
	if err != nil {
		return &models.User{}, err
	}

	return &user, nil
}

func CreateUser(db *sql.DB, username *string, password *string) error {
	var exists bool
	err := db.QueryRow(`
		SELECT EXISTS(
			SELECT 1
			FROM users
			WHERE LOWER(name) = LOWER($1)
		);
	`, *username).Scan(&exists)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("user name exists")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(*password), 10)
	if err != nil {
		return err
	}

	stmt, _ := db.Prepare("INSERT INTO users (name, password) VALUES ($1, $2)")

	defer stmt.Close()

	_, err = stmt.Exec(*username, hash)
	if err != nil {
		return err
	}
	return nil
}

func GetInfo(res http.ResponseWriter, req *http.Request) {
	fmt.Println("POST /getUserInfo")
	db, err := database.GetDB()
	if err != nil {
		fmt.Println("Error getting database:", err)
	}
	defer db.Close()
	
	res.Header().Set("Content-Type", "application/json")
	access_token := req.Header.Get("Authorization")
	user_info, err := ParseToken(&access_token)
	if err != nil {
		err := json.NewEncoder(res).Encode(models.Response{Payload: err.Error(), Message: "Error: Access token may not be valid", StatusCode: 500})
		if err != nil {
			fmt.Println("Unable to encode")
		}
		return
	}
	json.NewEncoder(res).Encode(models.Response{Payload: user_info, Message: "Success: user info retrieved", StatusCode: 200})
}

func ValidateUser(db *sql.DB, username *string, password *string) (bool, *string, error) {

	var hashed_password string
	var id int

	// Check if username even exists in db
	err := db.QueryRow(`
		SELECT id, password
		FROM users
		WHERE name = $1	

	`, *username).Scan(&id, &hashed_password)
	if err != nil {
		return false, nil, fmt.Errorf("username does not exist")
	}

	// Compare password to hash
	err = bcrypt.CompareHashAndPassword([]byte(hashed_password), []byte(*password))
	if err != nil {
		return false, nil, nil
	}

	// Create jwt token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  id,
		"username": username,
		"iat":      time.Now(),                                // issued at
		"exp":      time.Now().Add(time.Hour * 24 * 7).Unix(), // Expires every 7 days
	})

	// Note: Encoding the token with SECRET KEY = "CVWO_IS_COOL" for ONLY demonstration purposes
	tokenString, err := token.SignedString([]byte("CVWO_IS_COOL"))
	if err != nil {
		return false, nil, err
	}

	bearer := "Bearer " + tokenString

	return true, &bearer, nil
}

func DeleteUser(db *sql.DB, access_token *string) error {
	user_info, err := ParseToken(access_token)
	if err != nil {
		return err
	}
	username := user_info["username"]

	stmt, _ := db.Prepare("DELETE FROM users WHERE name = $1")

	defer stmt.Close()

	_, err = stmt.Exec(username)
	if err != nil {
		return err
	}

	return nil
}

func ParseToken(tokenString *string) (map[string]any, error) {

	if strings.HasPrefix(*tokenString, "Bearer ") {
		*tokenString = strings.TrimPrefix(*tokenString, "Bearer ")
	} else {
		return nil, fmt.Errorf("token does not have valid format")
	}

	token, err := jwt.Parse(*tokenString, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// Note: Secret key is hard coded for ONLY demo purposes
		return []byte("CVWO_IS_COOL"), nil
	})

	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		return claims, nil
	} else {
		return nil, err
	}
}
