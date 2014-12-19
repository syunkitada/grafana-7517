package models

import (
	"time"
)

const (
	ROLE_READ_WRITE RoleType = "ReadWrite"
	ROLE_READ                = "Read"
)

type RoleType string

type Collaborator struct {
	Id           int64
	AccountId    int64    `xorm:"not null unique(uix_account_id_for_account_id)"` // The account that can use another account
	Role         RoleType `xorm:"not null"`                                       // Permission type
	ForAccountId int64    `xorm:"not null unique(uix_account_id_for_account_id)"` // The account being given access to

	Created time.Time
	Updated time.Time
}

type AddCollaboratorCommand struct {
	Email        string   `json:"email" binding:"required"`
	AccountId    int64    `json:"-"`
	ForAccountId int64    `json:"-"`
	Role         RoleType `json:"-"`
}

func NewCollaborator(accountId int64, forAccountId int64, role RoleType) *Collaborator {
	return &Collaborator{
		AccountId:    accountId,
		ForAccountId: forAccountId,
		Role:         role,
		Created:      time.Now(),
		Updated:      time.Now(),
	}
}
