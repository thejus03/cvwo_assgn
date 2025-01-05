package tags

import (
	"database/sql"
	"github.com/thejus03/cvwo_assgn/backend/internal/models"
)

func GetTagFromID(db *sql.DB, id *int) (models.Tag, error) {
	stmt, err := db.Prepare("SELECT * FROM tags WHERE id = $1")
	if err != nil {
		return models.Tag{}, err
	}

	defer stmt.Close()
	var tag models.Tag
	err = stmt.QueryRow(*id).Scan(&tag.ID, &tag.Name)
	if err != nil {
		return models.Tag{}, err 
	}
	return tag, nil
}
