// Code generated by protoc-gen-go. DO NOT EDIT.
// source: tsdb_plugin.proto

/*
Package proto is a generated protocol buffer package.

It is generated from these files:
	tsdb_plugin.proto

It has these top-level messages:
	TsdbQuery
	Query
	Timerange
	Response
	QueryResult
	DatasourceInfo
	TimeSeries
	Point
*/
package proto

import proto1 "github.com/golang/protobuf/proto"
import fmt "fmt"
import math "math"
import google_protobuf "github.com/golang/protobuf/ptypes/timestamp"

import (
	context "golang.org/x/net/context"
	grpc "google.golang.org/grpc"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto1.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto1.ProtoPackageIsVersion2 // please upgrade the proto package

type TsdbQuery struct {
	Timerange  *Timerange      `protobuf:"bytes,1,opt,name=timerange" json:"timerange,omitempty"`
	Datasource *DatasourceInfo `protobuf:"bytes,2,opt,name=datasource" json:"datasource,omitempty"`
	Queries    []*Query        `protobuf:"bytes,3,rep,name=queries" json:"queries,omitempty"`
}

func (m *TsdbQuery) Reset()                    { *m = TsdbQuery{} }
func (m *TsdbQuery) String() string            { return proto1.CompactTextString(m) }
func (*TsdbQuery) ProtoMessage()               {}
func (*TsdbQuery) Descriptor() ([]byte, []int) { return fileDescriptor0, []int{0} }

func (m *TsdbQuery) GetTimerange() *Timerange {
	if m != nil {
		return m.Timerange
	}
	return nil
}

func (m *TsdbQuery) GetDatasource() *DatasourceInfo {
	if m != nil {
		return m.Datasource
	}
	return nil
}

func (m *TsdbQuery) GetQueries() []*Query {
	if m != nil {
		return m.Queries
	}
	return nil
}

type Query struct {
	RefId         string `protobuf:"bytes,1,opt,name=refId" json:"refId,omitempty"`
	ModelJson     string `protobuf:"bytes,2,opt,name=modelJson" json:"modelJson,omitempty"`
	MaxDataPoints int64  `protobuf:"varint,3,opt,name=MaxDataPoints" json:"MaxDataPoints,omitempty"`
	IntervalMs    int64  `protobuf:"varint,4,opt,name=intervalMs" json:"intervalMs,omitempty"`
}

func (m *Query) Reset()                    { *m = Query{} }
func (m *Query) String() string            { return proto1.CompactTextString(m) }
func (*Query) ProtoMessage()               {}
func (*Query) Descriptor() ([]byte, []int) { return fileDescriptor0, []int{1} }

func (m *Query) GetRefId() string {
	if m != nil {
		return m.RefId
	}
	return ""
}

func (m *Query) GetModelJson() string {
	if m != nil {
		return m.ModelJson
	}
	return ""
}

func (m *Query) GetMaxDataPoints() int64 {
	if m != nil {
		return m.MaxDataPoints
	}
	return 0
}

func (m *Query) GetIntervalMs() int64 {
	if m != nil {
		return m.IntervalMs
	}
	return 0
}

type Timerange struct {
	From string                     `protobuf:"bytes,1,opt,name=from" json:"from,omitempty"`
	To   string                     `protobuf:"bytes,2,opt,name=to" json:"to,omitempty"`
	Now  *google_protobuf.Timestamp `protobuf:"bytes,3,opt,name=now" json:"now,omitempty"`
}

func (m *Timerange) Reset()                    { *m = Timerange{} }
func (m *Timerange) String() string            { return proto1.CompactTextString(m) }
func (*Timerange) ProtoMessage()               {}
func (*Timerange) Descriptor() ([]byte, []int) { return fileDescriptor0, []int{2} }

func (m *Timerange) GetFrom() string {
	if m != nil {
		return m.From
	}
	return ""
}

func (m *Timerange) GetTo() string {
	if m != nil {
		return m.To
	}
	return ""
}

func (m *Timerange) GetNow() *google_protobuf.Timestamp {
	if m != nil {
		return m.Now
	}
	return nil
}

type Response struct {
	Message string         `protobuf:"bytes,1,opt,name=message" json:"message,omitempty"`
	Results []*QueryResult `protobuf:"bytes,2,rep,name=results" json:"results,omitempty"`
}

func (m *Response) Reset()                    { *m = Response{} }
func (m *Response) String() string            { return proto1.CompactTextString(m) }
func (*Response) ProtoMessage()               {}
func (*Response) Descriptor() ([]byte, []int) { return fileDescriptor0, []int{3} }

func (m *Response) GetMessage() string {
	if m != nil {
		return m.Message
	}
	return ""
}

func (m *Response) GetResults() []*QueryResult {
	if m != nil {
		return m.Results
	}
	return nil
}

type QueryResult struct {
	Error       string        `protobuf:"bytes,1,opt,name=error" json:"error,omitempty"`
	ErrorString string        `protobuf:"bytes,2,opt,name=errorString" json:"errorString,omitempty"`
	RefId       string        `protobuf:"bytes,3,opt,name=refId" json:"refId,omitempty"`
	MetaJson    string        `protobuf:"bytes,4,opt,name=metaJson" json:"metaJson,omitempty"`
	Series      []*TimeSeries `protobuf:"bytes,5,rep,name=series" json:"series,omitempty"`
}

func (m *QueryResult) Reset()                    { *m = QueryResult{} }
func (m *QueryResult) String() string            { return proto1.CompactTextString(m) }
func (*QueryResult) ProtoMessage()               {}
func (*QueryResult) Descriptor() ([]byte, []int) { return fileDescriptor0, []int{4} }

func (m *QueryResult) GetError() string {
	if m != nil {
		return m.Error
	}
	return ""
}

func (m *QueryResult) GetErrorString() string {
	if m != nil {
		return m.ErrorString
	}
	return ""
}

func (m *QueryResult) GetRefId() string {
	if m != nil {
		return m.RefId
	}
	return ""
}

func (m *QueryResult) GetMetaJson() string {
	if m != nil {
		return m.MetaJson
	}
	return ""
}

func (m *QueryResult) GetSeries() []*TimeSeries {
	if m != nil {
		return m.Series
	}
	return nil
}

type DatasourceInfo struct {
	Id                int64  `protobuf:"varint,1,opt,name=id" json:"id,omitempty"`
	OrgId             int64  `protobuf:"varint,2,opt,name=orgId" json:"orgId,omitempty"`
	Name              string `protobuf:"bytes,3,opt,name=name" json:"name,omitempty"`
	Type              string `protobuf:"bytes,4,opt,name=type" json:"type,omitempty"`
	Access            string `protobuf:"bytes,5,opt,name=access" json:"access,omitempty"`
	Url               string `protobuf:"bytes,6,opt,name=url" json:"url,omitempty"`
	BasicAuth         bool   `protobuf:"varint,7,opt,name=basicAuth" json:"basicAuth,omitempty"`
	BasicAuthUser     string `protobuf:"bytes,8,opt,name=basicAuthUser" json:"basicAuthUser,omitempty"`
	BasicAuthPassword string `protobuf:"bytes,9,opt,name=basicAuthPassword" json:"basicAuthPassword,omitempty"`
	JsonData          string `protobuf:"bytes,10,opt,name=jsonData" json:"jsonData,omitempty"`
	SecureJsonData    string `protobuf:"bytes,11,opt,name=secureJsonData" json:"secureJsonData,omitempty"`
}

func (m *DatasourceInfo) Reset()                    { *m = DatasourceInfo{} }
func (m *DatasourceInfo) String() string            { return proto1.CompactTextString(m) }
func (*DatasourceInfo) ProtoMessage()               {}
func (*DatasourceInfo) Descriptor() ([]byte, []int) { return fileDescriptor0, []int{5} }

func (m *DatasourceInfo) GetId() int64 {
	if m != nil {
		return m.Id
	}
	return 0
}

func (m *DatasourceInfo) GetOrgId() int64 {
	if m != nil {
		return m.OrgId
	}
	return 0
}

func (m *DatasourceInfo) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func (m *DatasourceInfo) GetType() string {
	if m != nil {
		return m.Type
	}
	return ""
}

func (m *DatasourceInfo) GetAccess() string {
	if m != nil {
		return m.Access
	}
	return ""
}

func (m *DatasourceInfo) GetUrl() string {
	if m != nil {
		return m.Url
	}
	return ""
}

func (m *DatasourceInfo) GetBasicAuth() bool {
	if m != nil {
		return m.BasicAuth
	}
	return false
}

func (m *DatasourceInfo) GetBasicAuthUser() string {
	if m != nil {
		return m.BasicAuthUser
	}
	return ""
}

func (m *DatasourceInfo) GetBasicAuthPassword() string {
	if m != nil {
		return m.BasicAuthPassword
	}
	return ""
}

func (m *DatasourceInfo) GetJsonData() string {
	if m != nil {
		return m.JsonData
	}
	return ""
}

func (m *DatasourceInfo) GetSecureJsonData() string {
	if m != nil {
		return m.SecureJsonData
	}
	return ""
}

type TimeSeries struct {
	Name   string            `protobuf:"bytes,1,opt,name=name" json:"name,omitempty"`
	Tags   map[string]string `protobuf:"bytes,2,rep,name=tags" json:"tags,omitempty" protobuf_key:"bytes,1,opt,name=key" protobuf_val:"bytes,2,opt,name=value"`
	Points []*Point          `protobuf:"bytes,3,rep,name=points" json:"points,omitempty"`
}

func (m *TimeSeries) Reset()                    { *m = TimeSeries{} }
func (m *TimeSeries) String() string            { return proto1.CompactTextString(m) }
func (*TimeSeries) ProtoMessage()               {}
func (*TimeSeries) Descriptor() ([]byte, []int) { return fileDescriptor0, []int{6} }

func (m *TimeSeries) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func (m *TimeSeries) GetTags() map[string]string {
	if m != nil {
		return m.Tags
	}
	return nil
}

func (m *TimeSeries) GetPoints() []*Point {
	if m != nil {
		return m.Points
	}
	return nil
}

type Point struct {
	Timestamp int64   `protobuf:"varint,1,opt,name=timestamp" json:"timestamp,omitempty"`
	Value     float64 `protobuf:"fixed64,2,opt,name=value" json:"value,omitempty"`
}

func (m *Point) Reset()                    { *m = Point{} }
func (m *Point) String() string            { return proto1.CompactTextString(m) }
func (*Point) ProtoMessage()               {}
func (*Point) Descriptor() ([]byte, []int) { return fileDescriptor0, []int{7} }

func (m *Point) GetTimestamp() int64 {
	if m != nil {
		return m.Timestamp
	}
	return 0
}

func (m *Point) GetValue() float64 {
	if m != nil {
		return m.Value
	}
	return 0
}

func init() {
	proto1.RegisterType((*TsdbQuery)(nil), "plugins.TsdbQuery")
	proto1.RegisterType((*Query)(nil), "plugins.Query")
	proto1.RegisterType((*Timerange)(nil), "plugins.Timerange")
	proto1.RegisterType((*Response)(nil), "plugins.Response")
	proto1.RegisterType((*QueryResult)(nil), "plugins.QueryResult")
	proto1.RegisterType((*DatasourceInfo)(nil), "plugins.DatasourceInfo")
	proto1.RegisterType((*TimeSeries)(nil), "plugins.TimeSeries")
	proto1.RegisterType((*Point)(nil), "plugins.Point")
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConn

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion4

// Client API for TsdbPlugin service

type TsdbPluginClient interface {
	Query(ctx context.Context, in *TsdbQuery, opts ...grpc.CallOption) (*Response, error)
}

type tsdbPluginClient struct {
	cc *grpc.ClientConn
}

func NewTsdbPluginClient(cc *grpc.ClientConn) TsdbPluginClient {
	return &tsdbPluginClient{cc}
}

func (c *tsdbPluginClient) Query(ctx context.Context, in *TsdbQuery, opts ...grpc.CallOption) (*Response, error) {
	out := new(Response)
	err := grpc.Invoke(ctx, "/plugins.TsdbPlugin/Query", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// Server API for TsdbPlugin service

type TsdbPluginServer interface {
	Query(context.Context, *TsdbQuery) (*Response, error)
}

func RegisterTsdbPluginServer(s *grpc.Server, srv TsdbPluginServer) {
	s.RegisterService(&_TsdbPlugin_serviceDesc, srv)
}

func _TsdbPlugin_Query_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(TsdbQuery)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(TsdbPluginServer).Query(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/plugins.TsdbPlugin/Query",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(TsdbPluginServer).Query(ctx, req.(*TsdbQuery))
	}
	return interceptor(ctx, in, info, handler)
}

var _TsdbPlugin_serviceDesc = grpc.ServiceDesc{
	ServiceName: "plugins.TsdbPlugin",
	HandlerType: (*TsdbPluginServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "Query",
			Handler:    _TsdbPlugin_Query_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "tsdb_plugin.proto",
}

func init() { proto1.RegisterFile("tsdb_plugin.proto", fileDescriptor0) }

var fileDescriptor0 = []byte{
	// 663 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x6c, 0x54, 0x4d, 0x8f, 0xd3, 0x30,
	0x10, 0x55, 0x92, 0x7e, 0x65, 0x2a, 0x2a, 0xd6, 0xac, 0x20, 0xaa, 0xf8, 0xa8, 0x22, 0xb4, 0xaa,
	0xc4, 0x2a, 0x0b, 0xe5, 0xb0, 0x08, 0xb8, 0x80, 0xe0, 0xb0, 0x2b, 0xad, 0xb4, 0x78, 0xcb, 0x05,
	0x09, 0x21, 0xb7, 0x71, 0x43, 0x20, 0x89, 0x8b, 0xed, 0xec, 0xd2, 0x23, 0xff, 0x84, 0x03, 0x3f,
	0x81, 0x33, 0xbf, 0x0d, 0x79, 0xe2, 0xa4, 0xe9, 0xc2, 0x29, 0x33, 0x6f, 0x9e, 0xed, 0x97, 0x37,
	0x63, 0xc3, 0x9e, 0x56, 0xf1, 0xe2, 0xd3, 0x3a, 0x2b, 0x93, 0xb4, 0x88, 0xd6, 0x52, 0x68, 0x41,
	0xfa, 0x55, 0xa6, 0xc6, 0x0f, 0x12, 0x21, 0x92, 0x8c, 0x1f, 0x21, 0xbc, 0x28, 0x57, 0x47, 0x3a,
	0xcd, 0xb9, 0xd2, 0x2c, 0x5f, 0x57, 0xcc, 0xf0, 0xa7, 0x03, 0xfe, 0x5c, 0xc5, 0x8b, 0x77, 0x25,
	0x97, 0x1b, 0xf2, 0x18, 0x7c, 0x43, 0x90, 0xac, 0x48, 0x78, 0xe0, 0x4c, 0x9c, 0xe9, 0x70, 0x46,
	0x22, 0xbb, 0x57, 0x34, 0xaf, 0x2b, 0x74, 0x4b, 0x22, 0xc7, 0x00, 0x31, 0xd3, 0x4c, 0x89, 0x52,
	0x2e, 0x79, 0xe0, 0xe2, 0x92, 0x3b, 0xcd, 0x92, 0x37, 0x4d, 0xe9, 0xa4, 0x58, 0x09, 0xda, 0xa2,
	0x92, 0x29, 0xf4, 0xbf, 0x95, 0x5c, 0xa6, 0x5c, 0x05, 0xde, 0xc4, 0x9b, 0x0e, 0x67, 0xa3, 0x66,
	0x15, 0x6a, 0xa1, 0x75, 0x39, 0xfc, 0xe1, 0x40, 0xb7, 0x92, 0xb7, 0x0f, 0x5d, 0xc9, 0x57, 0x27,
	0x31, 0x4a, 0xf3, 0x69, 0x95, 0x90, 0xbb, 0xe0, 0xe7, 0x22, 0xe6, 0xd9, 0xa9, 0x12, 0x05, 0x2a,
	0xf0, 0xe9, 0x16, 0x20, 0x0f, 0xe1, 0xc6, 0x19, 0xfb, 0x6e, 0x84, 0x9c, 0x8b, 0xb4, 0xd0, 0xe6,
	0x34, 0x67, 0xea, 0xd1, 0x5d, 0x90, 0xdc, 0x07, 0x48, 0x0b, 0xcd, 0xe5, 0x25, 0xcb, 0xce, 0x54,
	0xd0, 0x41, 0x4a, 0x0b, 0x09, 0x3f, 0x82, 0xdf, 0xfc, 0x3e, 0x21, 0xd0, 0x59, 0x49, 0x91, 0x5b,
	0x15, 0x18, 0x93, 0x11, 0xb8, 0x5a, 0xd8, 0xd3, 0x5d, 0x2d, 0xc8, 0x21, 0x78, 0x85, 0xb8, 0xc2,
	0xc3, 0x86, 0xb3, 0x71, 0x54, 0xb5, 0x21, 0xaa, 0xdb, 0x80, 0x5e, 0x62, 0x1b, 0xa8, 0xa1, 0x85,
	0x73, 0x18, 0x50, 0xae, 0xd6, 0xa2, 0x50, 0x9c, 0x04, 0xd0, 0xcf, 0xb9, 0x52, 0xcc, 0x76, 0xc0,
	0xa7, 0x75, 0x4a, 0x22, 0xe8, 0x4b, 0xae, 0xca, 0x4c, 0xab, 0xc0, 0x45, 0xcb, 0xf6, 0xaf, 0x59,
	0x86, 0x45, 0x5a, 0x93, 0xc2, 0x5f, 0x0e, 0x0c, 0x5b, 0x05, 0x63, 0x1f, 0x97, 0x52, 0xc8, 0xda,
	0x3e, 0x4c, 0xc8, 0x04, 0x86, 0x18, 0x5c, 0x68, 0x99, 0x16, 0x89, 0xfd, 0x85, 0x36, 0xb4, 0xb5,
	0xdd, 0x6b, 0xdb, 0x3e, 0x86, 0x41, 0xce, 0x35, 0x43, 0xd7, 0x3b, 0x58, 0x68, 0x72, 0xf2, 0x08,
	0x7a, 0xaa, 0xea, 0x6d, 0x17, 0x85, 0xde, 0xda, 0x19, 0xa2, 0x0b, 0x2c, 0x51, 0x4b, 0x09, 0xff,
	0xb8, 0x30, 0xda, 0x1d, 0x14, 0xe3, 0x66, 0x5a, 0x75, 0xd9, 0xa3, 0x6e, 0x1a, 0x1b, 0x05, 0x42,
	0x26, 0x27, 0x31, 0xaa, 0xf3, 0x68, 0x95, 0x98, 0x3e, 0x14, 0x2c, 0xe7, 0x56, 0x16, 0xc6, 0x06,
	0xd3, 0x9b, 0x35, 0xb7, 0x8a, 0x30, 0x26, 0xb7, 0xa1, 0xc7, 0x96, 0x4b, 0xae, 0x8c, 0x1a, 0x83,
	0xda, 0x8c, 0xdc, 0x04, 0xaf, 0x94, 0x59, 0xd0, 0x43, 0xd0, 0x84, 0x66, 0x94, 0x16, 0x4c, 0xa5,
	0xcb, 0x57, 0xa5, 0xfe, 0x1c, 0xf4, 0x27, 0xce, 0x74, 0x40, 0xb7, 0x80, 0x19, 0xa5, 0x26, 0x79,
	0xaf, 0xb8, 0x0c, 0x06, 0xb8, 0x72, 0x17, 0x24, 0x87, 0xb0, 0xd7, 0x00, 0xe7, 0x4c, 0xa9, 0x2b,
	0x21, 0xe3, 0xc0, 0x47, 0xe6, 0xbf, 0x05, 0xe3, 0xe2, 0x17, 0x25, 0x0a, 0xf3, 0xff, 0x01, 0x54,
	0x2e, 0xd6, 0x39, 0x39, 0x80, 0x91, 0xe2, 0xcb, 0x52, 0xf2, 0xd3, 0x9a, 0x31, 0x44, 0xc6, 0x35,
	0x34, 0xfc, 0xed, 0x00, 0x6c, 0x7d, 0x6d, 0x6c, 0x71, 0x5a, 0xb6, 0x3c, 0x81, 0x8e, 0x66, 0x49,
	0x3d, 0x37, 0xf7, 0xfe, 0xd3, 0x8e, 0x68, 0xce, 0x12, 0xf5, 0xb6, 0xd0, 0x72, 0x43, 0x91, 0x4a,
	0x0e, 0xa0, 0xb7, 0xae, 0x6f, 0xcc, 0xee, 0xfd, 0xc4, 0x3b, 0x43, 0x6d, 0x75, 0x7c, 0x0c, 0x7e,
	0xb3, 0xd4, 0x58, 0xfa, 0x95, 0x6f, 0xec, 0xd1, 0x26, 0x34, 0xad, 0xbb, 0x64, 0x59, 0xc9, 0xed,
	0x60, 0x55, 0xc9, 0x73, 0xf7, 0x99, 0x13, 0xbe, 0x80, 0x2e, 0xee, 0x64, 0x5c, 0x6f, 0x9e, 0x25,
	0xdb, 0xf4, 0x2d, 0xb0, 0xbb, 0x81, 0x63, 0x37, 0x98, 0xbd, 0x04, 0x30, 0xcf, 0xd6, 0x39, 0x4a,
	0x22, 0x51, 0xfd, 0x42, 0xb4, 0x5e, 0xab, 0xfa, 0x51, 0x1b, 0xef, 0x35, 0x58, 0x7d, 0xc7, 0x5e,
	0xf7, 0x3f, 0x74, 0xab, 0xab, 0xd8, 0xc3, 0xcf, 0xd3, 0xbf, 0x01, 0x00, 0x00, 0xff, 0xff, 0x55,
	0xe4, 0xba, 0x1a, 0x44, 0x05, 0x00, 0x00,
}
