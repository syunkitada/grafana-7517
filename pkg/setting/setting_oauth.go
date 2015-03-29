package setting

type OAuthInfo struct {
	ClientId, ClientSecret string
	Scopes                 []string
	AuthUrl, TokenUrl      string
	Enabled                bool
}

type OAuther struct {
	GitHub, Google, Twitter bool
	OAuthInfos              map[string]*OAuthInfo
}

var OAuthService *OAuther
