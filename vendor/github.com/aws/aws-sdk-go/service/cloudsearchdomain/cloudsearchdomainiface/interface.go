// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT.

// Package cloudsearchdomainiface provides an interface for the Amazon CloudSearch Domain.
package cloudsearchdomainiface

import (
	"github.com/aws/aws-sdk-go/aws/request"
	"github.com/aws/aws-sdk-go/service/cloudsearchdomain"
)

// CloudSearchDomainAPI is the interface type for cloudsearchdomain.CloudSearchDomain.
type CloudSearchDomainAPI interface {
	SearchRequest(*cloudsearchdomain.SearchInput) (*request.Request, *cloudsearchdomain.SearchOutput)

	Search(*cloudsearchdomain.SearchInput) (*cloudsearchdomain.SearchOutput, error)

	SuggestRequest(*cloudsearchdomain.SuggestInput) (*request.Request, *cloudsearchdomain.SuggestOutput)

	Suggest(*cloudsearchdomain.SuggestInput) (*cloudsearchdomain.SuggestOutput, error)

	UploadDocumentsRequest(*cloudsearchdomain.UploadDocumentsInput) (*request.Request, *cloudsearchdomain.UploadDocumentsOutput)

	UploadDocuments(*cloudsearchdomain.UploadDocumentsInput) (*cloudsearchdomain.UploadDocumentsOutput, error)
}

var _ CloudSearchDomainAPI = (*cloudsearchdomain.CloudSearchDomain)(nil)
