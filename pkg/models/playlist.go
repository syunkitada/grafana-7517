package models

import (
	"errors"
)

// Typed errors
var (
	ErrPlaylistNotFound           = errors.New("Playlist not found")
	ErrPlaylistWithSameNameExists = errors.New("A playlist with the same name already exists")
)

// Playlist model
type Playlist struct {
	Id       int64   `json:"id"`
	Title    string  `json:"title"`
	Type     string  `json:"type"`
	Timespan string  `json:"timespan"`
	Data     []int64 `json:"data"`
	OrgId    int64   `json:"-"`
}

type PlaylistDashboard struct {
	Id    int64  `json:"id"`
	Slug  string `json:"slug"`
	Title string `json:"title"`
}

func (this PlaylistDashboard) TableName() string {
	return "dashboard"
}

type Playlists []*Playlist
type PlaylistDashboards []*PlaylistDashboard

//
// DTOS
//

type PlaylistDashboardDto struct {
	Id    int64  `json:"id"`
	Slug  string `json:"slug"`
	Title string `json:"title"`
	Uri   string `json:"uri"`
}

//
// COMMANDS
//
type PlaylistQuery struct {
	Title string
	Limit int
	OrgId int64

	Result Playlists
}

type UpdatePlaylistQuery struct {
	Id       int64
	Title    string
	Type     string
	Timespan string
	Data     []int64

	Result *Playlist
}

type CreatePlaylistQuery struct {
	Title    string
	Type     string
	Timespan string
	Data     []int64
	OrgId    int64

	Result *Playlist
}

type GetPlaylistByIdQuery struct {
	Id     int64
	Result *Playlist
}

type GetPlaylistDashboardsQuery struct {
	Id     int64
	Result *PlaylistDashboards
}

type DeletePlaylistQuery struct {
	Id int64
}
