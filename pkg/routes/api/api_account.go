package api

import (
	"github.com/torkelo/grafana-pro/pkg/middleware"
	"github.com/torkelo/grafana-pro/pkg/models"
	"github.com/torkelo/grafana-pro/pkg/routes/dtos"
	"github.com/torkelo/grafana-pro/pkg/utils"
)

func GetAccount(c *middleware.Context) {
	model := dtos.AccountInfo{
		Name:  c.UserAccount.Name,
		Email: c.UserAccount.Email,
	}

	collaborators, err := models.GetCollaboratorsForAccount(c.UserAccount.Id)
	if err != nil {
		c.JsonApiErr(500, "Failed to fetch collaboratos", err)
		return
	}

	for _, collaborator := range collaborators {
		model.Collaborators = append(model.Collaborators, &dtos.Collaborator{
			AccountId: collaborator.AccountId,
			Role:      collaborator.Role,
			Email:     collaborator.Email,
		})
	}

	c.JSON(200, model)
}

func AddCollaborator(c *middleware.Context) {
	var model dtos.AddCollaboratorCommand

	if !c.JsonBody(&model) {
		c.JSON(400, utils.DynMap{"message": "Invalid request"})
		return
	}

	accountToAdd, err := models.GetAccountByLogin(model.Email)
	if err != nil {
		c.JSON(404, utils.DynMap{"message": "Collaborator not found"})
		return
	}

	if accountToAdd.Id == c.UserAccount.Id {
		c.JSON(400, utils.DynMap{"message": "Cannot add yourself as collaborator"})
		return
	}

	var collaborator = models.NewCollaborator(accountToAdd.Id, c.UserAccount.Id)
	collaborator.Role = models.ROLE_READ_WRITE

	err = models.AddCollaborator(collaborator)
	if err != nil {
		c.JSON(400, utils.DynMap{"message": err.Error()})
		return
	}

	c.Status(204)
}
