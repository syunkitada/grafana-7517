// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT.

// Package simpledbiface provides an interface for the Amazon SimpleDB.
package simpledbiface

import (
	"github.com/aws/aws-sdk-go/aws/request"
	"github.com/aws/aws-sdk-go/service/simpledb"
)

// SimpleDBAPI is the interface type for simpledb.SimpleDB.
type SimpleDBAPI interface {
	BatchDeleteAttributesRequest(*simpledb.BatchDeleteAttributesInput) (*request.Request, *simpledb.BatchDeleteAttributesOutput)

	BatchDeleteAttributes(*simpledb.BatchDeleteAttributesInput) (*simpledb.BatchDeleteAttributesOutput, error)

	BatchPutAttributesRequest(*simpledb.BatchPutAttributesInput) (*request.Request, *simpledb.BatchPutAttributesOutput)

	BatchPutAttributes(*simpledb.BatchPutAttributesInput) (*simpledb.BatchPutAttributesOutput, error)

	CreateDomainRequest(*simpledb.CreateDomainInput) (*request.Request, *simpledb.CreateDomainOutput)

	CreateDomain(*simpledb.CreateDomainInput) (*simpledb.CreateDomainOutput, error)

	DeleteAttributesRequest(*simpledb.DeleteAttributesInput) (*request.Request, *simpledb.DeleteAttributesOutput)

	DeleteAttributes(*simpledb.DeleteAttributesInput) (*simpledb.DeleteAttributesOutput, error)

	DeleteDomainRequest(*simpledb.DeleteDomainInput) (*request.Request, *simpledb.DeleteDomainOutput)

	DeleteDomain(*simpledb.DeleteDomainInput) (*simpledb.DeleteDomainOutput, error)

	DomainMetadataRequest(*simpledb.DomainMetadataInput) (*request.Request, *simpledb.DomainMetadataOutput)

	DomainMetadata(*simpledb.DomainMetadataInput) (*simpledb.DomainMetadataOutput, error)

	GetAttributesRequest(*simpledb.GetAttributesInput) (*request.Request, *simpledb.GetAttributesOutput)

	GetAttributes(*simpledb.GetAttributesInput) (*simpledb.GetAttributesOutput, error)

	ListDomainsRequest(*simpledb.ListDomainsInput) (*request.Request, *simpledb.ListDomainsOutput)

	ListDomains(*simpledb.ListDomainsInput) (*simpledb.ListDomainsOutput, error)

	ListDomainsPages(*simpledb.ListDomainsInput, func(*simpledb.ListDomainsOutput, bool) bool) error

	PutAttributesRequest(*simpledb.PutAttributesInput) (*request.Request, *simpledb.PutAttributesOutput)

	PutAttributes(*simpledb.PutAttributesInput) (*simpledb.PutAttributesOutput, error)

	SelectRequest(*simpledb.SelectInput) (*request.Request, *simpledb.SelectOutput)

	Select(*simpledb.SelectInput) (*simpledb.SelectOutput, error)

	SelectPages(*simpledb.SelectInput, func(*simpledb.SelectOutput, bool) bool) error
}

var _ SimpleDBAPI = (*simpledb.SimpleDB)(nil)
