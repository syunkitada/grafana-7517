+++
title = "Alerting HTTP API "
description = "Grafana Alerting HTTP API"
keywords = ["grafana", "http", "documentation", "api", "alerting"]
aliases = ["/http_api/alerting/"]
type = "docs"
[menu.docs]
name = "Alerting"
parent = "http_api"
+++


# Alerting API

You can use the Alerting API to get information about alerts and their states but this API cannot be used to modify the alert.
To create new alerts or modify them you need to update the dashboard json that contains the alerts.

This API can also be used to create, update and delete alert notifications.

## Get alerts

`GET /api/alerts/`

**Example Request**:

```http
GET /api/alerts HTTP/1.1
Accept: application/json
Content-Type: application/json
Authorization: Bearer eyJrIjoiT0tTcG1pUlY2RnVKZTFVaDFsNFZXdE9ZWmNrMkZYbk
```
  Querystring Parameters:

  These parameters are used as querystring parameters. For example:

  `/api/alerts?dashboardId=1`

  - **dashboardId** – Return alerts for a specified dashboard.
  - **panelId** – Return alerts for a specified panel on a dashboard.
  - **limit** - Limit response to x number of alerts.
  - **state** - Return alerts with one or more of the following alert states: `ALL`,`no_data`, `paused`, `alerting`, `ok`, `pending`. To specify multiple states use the following format: `?state=paused&state=alerting`

**Example Response**:

```http
HTTP/1.1 200
Content-Type: application/json
[
  {
    "id": 1,
    "dashboardId": 1,
    "panelId": 1,
    "panelUId": "ABcdEFghij"
    "dashboardSlug": "sensors",
    "name": "fire place sensor",
    "message": "Someone is trying to break in through the fire place",
    "state": "alerting",
    "newStateDate": "2018-05-14T05:55:20+02:00",
    "evalDate": "0001-01-01T00:00:00Z",
    "evalData": null,
    "executionError": "",
    "dashboardUri": "http://grafana.com/dashboard/db/sensors"
  }
]
```

## Get one alert

`GET /api/alerts/:id`

**Example Request**:

```http
GET /api/alerts/1 HTTP/1.1
Accept: application/json
Content-Type: application/json
Authorization: Bearer eyJrIjoiT0tTcG1pUlY2RnVKZTFVaDFsNFZXdE9ZWmNrMkZYbk
```

**Example Response**:

```http
HTTP/1.1 200
Content-Type: application/json
{
  "Id": 1,
  "Version": 0,
  "OrgId": 1,
  "DashboardId": 55,
  "PanelId": 2,
  "Name": "my mem alert",
  "Message": "",
  "Severity": "",
  "State": "alerting",
  "Handler": 1,
  "Silenced": false,
  "ExecutionError": " ",
  "Frequency": 60,
  "EvalData": {
    "evalMatches": [
      {
        "metric": "mem_usage",
        "tags": {
          "name": "server.grafana.com"
        },
        "value": 98.765
      }
    ]
  },
  "NewStateDate": "2018-05-14T17:12:45+02:00",
  "StateChanges": 3,
  "Created": "2018-05-14T17:01:25+02:00",
  "Updated": "2018-05-14T17:11:18+02:00",
  "Settings": {
    ...
  }
}
```

## Pause alert

`POST /api/alerts/:id/pause`

**Example Request**:

```http
POST /api/alerts/1/pause HTTP/1.1
Accept: application/json
Content-Type: application/json
Authorization: Bearer eyJrIjoiT0tTcG1pUlY2RnVKZTFVaDFsNFZXdE9ZWmNrMkZYbk

{
  "paused": true
}
```

The :id query parameter is the id of the alert to be paused or unpaused.

JSON Body Schema:

- **paused** – Can be `true` or `false`. True to pause an alert. False to unpause an alert.

**Example Response**:

```http
HTTP/1.1 200
Content-Type: application/json
{
  "alertId": 1,
  "state":   "Paused",
  "message": "alert paused"
}
```

## Pause all alerts

`POST /api/admin/pause-all-alerts`

```http
POST /api/admin/pause-all-alerts HTTP/1.1
Accept: application/json
Content-Type: application/json
Authorization: Bearer eyJrIjoiT0tTcG1pUlY2RnVKZTFVaDFsNFZXdE9ZWmNrMkZYbk

{
  "paused": true
}
```

JSON Body Schema:

- **paused** – Can be `true` or `false`. True to pause an alert. False to unpause an alert.

**Example Response**:

```http
HTTP/1.1 200
Content-Type: application/json
{
  "state":   "Paused",
  "message": "alert paused",
  "alertsAffected": 1
}
```

## Get alert notifications

`GET /api/alert-notifications`

**Example Request**:

```http
GET /api/alert-notifications HTTP/1.1
Accept: application/json
Content-Type: application/json
Authorization: Bearer eyJrIjoiT0tTcG1pUlY2RnVKZTFVaDFsNFZXdE9ZWmNrMkZYbk
```


**Example Response**:

```http
HTTP/1.1 200
Content-Type: application/json

{
  "id": 1,
  "name": "Team A",
  "type": "email",
  "isDefault": true,
  "created": "2017-01-01 12:45",
  "updated": "2017-01-01 12:45"
}
```

## Create alert notification

You can find the full list of [supported notifers](/alerting/notifications/#all-supported-notifier) at the alert notifiers page.

`POST /api/alert-notifications`

**Example Request**:

```http
POST /api/alert-notifications HTTP/1.1
Accept: application/json
Content-Type: application/json
Authorization: Bearer eyJrIjoiT0tTcG1pUlY2RnVKZTFVaDFsNFZXdE9ZWmNrMkZYbk

{
  "name": "new alert notification",  //Required
  "type":  "email", //Required
  "isDefault": false,
  "settings": {
    "addresses": "carl@grafana.com;dev@grafana.com"
  }
}
```

**Example Response**:

```http
HTTP/1.1 200
Content-Type: application/json
{
  "id": 1,
  "name": "new alert notification",
  "type": "email",
  "isDefault": false,
  "settings": { addresses: "carl@grafana.com;dev@grafana.com"} }
  "created": "2017-01-01 12:34",
  "updated": "2017-01-01 12:34"
}
```

## Update alert notification

`PUT /api/alert-notifications/1`

**Example Request**:

```http
PUT /api/alert-notifications/1 HTTP/1.1
Accept: application/json
Content-Type: application/json
Authorization: Bearer eyJrIjoiT0tTcG1pUlY2RnVKZTFVaDFsNFZXdE9ZWmNrMkZYbk

{
  "id": 1,
  "name": "new alert notification",  //Required
  "type":  "email", //Required
  "isDefault": false,
  "settings": {
    "addresses: "carl@grafana.com;dev@grafana.com"
  }
}
```

**Example Response**:

```http
HTTP/1.1 200
Content-Type: application/json
{
  "id": 1,
  "name": "new alert notification",
  "type": "email",
  "isDefault": false,
  "settings": { addresses: "carl@grafana.com;dev@grafana.com"} }
  "created": "2017-01-01 12:34",
  "updated": "2017-01-01 12:34"
}
```

## Delete alert notification

`DELETE /api/alert-notifications/:notificationId`

**Example Request**:

```http
DELETE /api/alert-notifications/1 HTTP/1.1
Accept: application/json
Content-Type: application/json
Authorization: Bearer eyJrIjoiT0tTcG1pUlY2RnVKZTFVaDFsNFZXdE9ZWmNrMkZYbk
```

**Example Response**:

```http
HTTP/1.1 200
Content-Type: application/json
{
  "message": "Notification deleted"
}
```
