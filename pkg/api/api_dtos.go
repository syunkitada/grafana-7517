package api

type accountInfoDto struct {
	Login         string                 `json:"login"`
	Email         string                 `json:"email"`
	AccountName   string                 `json:"accountName"`
	Collaborators []*collaboratorInfoDto `json:"collaborators"`
}

type collaboratorInfoDto struct {
	AccountId int    `json:"accountId"`
	Email     string `json:"email"`
	Role      string `json:"role"`
}

type addCollaboratorDto struct {
	Email string `json:"email" binding:"required"`
}

type removeCollaboratorDto struct {
	AccountId int `json:"accountId" binding:"required"`
}

type otherAccountDto struct {
	Id      int    `json:"id"`
	Name    string `json:"name"`
	Role    string `json:"role"`
	IsUsing bool   `json:"isUsing"`
}
