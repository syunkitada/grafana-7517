![Grafana](docs/logo-horizontal.png)

This is a fork of Grafana 7.5.17 under the Apache 2.0 License.

This is my playground.

## How to play

Environment Information

```
$ go version
go version go1.22.5 linux/amd64

$ node version
Node.js v20.15.1
```

Start frontend.

```
$ export NODE_OPTIONS=--openssl-legacy-provider
$ yarn install
$ yarn start
```

Start backend.

```
$ make run
```

## Note

I deleted large files from git commit as follows.

```
$ git clone https://github.com/grafana/grafana -b v7.5.17 grafana-7517
$ target="pkg/cmd/grafana-server/__debug_bin e2e/build_results.zip vendor grafana grafana-pro pkg/tsdb/plugins/mock_tsdb_plugin/simple-plugin scripts/go/bin/revive pkg/build Godeps public/img/tgr288gear_line6.pdf .yarn pkg/services/folder/folderimpl/test.db"
$ git filter-branch -f --index-filter "git rm -rf --cached --ignore-unmatch $target" --prune-empty HEAD
```
