+++
title = "Overview"
description = "Overview for auth"
type = "docs"
[menu.docs]
name = "Overview"
identifier = "overview-auth"
parent = "authentication"
weight = 1
+++

# Authentication

Grafana provides many ways to authenticate users. By default it will use local users & passwords stored in the Grafana
database.

## Settings

Via the [server ini config file]({{< relref "installation/debian.md" >}}) you can setup many different authentication methods. Auth settings
are documented below.

### [auth]

#### disable_login_form

Set to true to disable (hide) the login form, useful if you use OAuth, defaults to false.

#### disable_signout_menu

Set to true to disable the signout link in the side menu. useful if you use auth.proxy, defaults to false.

<hr>

### [auth.basic]
#### enabled
When enabled is `true` (default) the http api will accept basic authentication.

<hr>
