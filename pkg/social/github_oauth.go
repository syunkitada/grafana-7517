package social

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/grafana/grafana/pkg/models"

	"golang.org/x/oauth2"
)

type SocialGithub struct {
	*oauth2.Config
	allowedDomains       []string
	allowedOrganizations []string
	apiUrl               string
	allowSignup          bool
	teamIds              []int
}

var (
	ErrMissingTeamMembership         = &Error{"User not a member of one of the required teams"}
	ErrMissingOrganizationMembership = &Error{"User not a member of one of the required organizations"}
)

func (s *SocialGithub) Type() int {
	return int(models.GITHUB)
}

func (s *SocialGithub) IsEmailAllowed(email string) bool {
	return isEmailAllowed(email, s.allowedDomains)
}

func (s *SocialGithub) IsSignupAllowed() bool {
	return s.allowSignup
}

func (s *SocialGithub) IsTeamMember(client *http.Client) bool {
	if len(s.teamIds) == 0 {
		return true
	}

	teamMemberships, err := s.FetchTeamMemberships(client)
	if err != nil {
		return false
	}

	for _, teamId := range s.teamIds {
		for _, membershipId := range teamMemberships {
			if teamId == membershipId {
				return true
			}
		}
	}

	return false
}

func (s *SocialGithub) IsOrganizationMember(client *http.Client) bool {
	if len(s.allowedOrganizations) == 0 {
		return true
	}

	organizations, err := s.FetchOrganizations(client)
	if err != nil {
		return false
	}

	for _, allowedOrganization := range s.allowedOrganizations {
		for _, organization := range organizations {
			if organization == allowedOrganization {
				return true
			}
		}
	}

	return false
}

func (s *SocialGithub) FetchPrivateEmail(client *http.Client) (string, error) {
	type Record struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}

	body, err := HttpGet(client, fmt.Sprintf(s.apiUrl+"/emails"))
	if err != nil {
		return "", fmt.Errorf("Error getting email address: %s", err)
	}

	var records []Record

	err = json.Unmarshal(body, &records)
	if err != nil {
		return "", fmt.Errorf("Error getting email address: %s", err)
	}

	var email = ""
	for _, record := range records {
		if record.Primary {
			email = record.Email
		}
	}

	return email, nil
}

func (s *SocialGithub) FetchTeamMemberships(client *http.Client) ([]int, error) {
	type Record struct {
		Id int `json:"id"`
	}

	body, err := HttpGet(client, fmt.Sprintf(s.apiUrl+"/teams"))
	if err != nil {
		return nil, fmt.Errorf("Error getting team memberships: %s", err)
	}

	var records []Record

	err = json.Unmarshal(body, &records)
	if err != nil {
		return nil, fmt.Errorf("Error getting team memberships: %s", err)
	}

	var ids = make([]int, len(records))
	for i, record := range records {
		ids[i] = record.Id
	}

	return ids, nil
}

func (s *SocialGithub) FetchOrganizations(client *http.Client) ([]string, error) {
	type Record struct {
		Login string `json:"login"`
	}

	body, err := HttpGet(client, fmt.Sprintf(s.apiUrl+"/orgs"))
	if err != nil {
		return nil, fmt.Errorf("Error getting organizations: %s", err)
	}

	var records []Record

	err = json.Unmarshal(body, &records)
	if err != nil {
		return nil, fmt.Errorf("Error getting organizations: %s", err)
	}

	var logins = make([]string, len(records))
	for i, record := range records {
		logins[i] = record.Login
	}

	return logins, nil
}

func (s *SocialGithub) UserInfo(client *http.Client) (*BasicUserInfo, error) {
	var data struct {
		Id    int    `json:"id"`
		Login string `json:"login"`
		Email string `json:"email"`
	}

	body, err := HttpGet(client, s.apiUrl)
	if err != nil {
		return nil, fmt.Errorf("Error getting user info: %s", err)
	}

	err = json.Unmarshal(body, &data)
	if err != nil {
		return nil, fmt.Errorf("Error getting user info: %s", err)
	}

	userInfo := &BasicUserInfo{
		Name:  data.Login,
		Login: data.Login,
		Email: data.Email,
	}

	if !s.IsTeamMember(client) {
		return nil, ErrMissingTeamMembership
	}

	if !s.IsOrganizationMember(client) {
		return nil, ErrMissingOrganizationMembership
	}

	if userInfo.Email == "" {
		userInfo.Email, err = s.FetchPrivateEmail(client)
		if err != nil {
			return nil, err
		}
	}

	return userInfo, nil
}
