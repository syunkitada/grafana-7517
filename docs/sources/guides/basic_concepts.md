----
page_title: Graphite query guide
page_description: Graphite query guide
page_keywords: grafana, graphite, metrics, query, documentation
---

# Basic Concepts

This document is a “bottom up” introduction to basic concepts in Grafana, and can be used as a starting point to get familiar with core features. 

### ** Data Source **
Grafana supports many different storage backends for your time series data (Data Source). Each Data Source has a specific Query Editor that is customized for the features and capabilities that the particular Data Source exposes. 

For more details please refer to [Data Sources](/datasources/graphite/)

### ** Organization **
Grafana supports multiple organizations in order to support a wide variety of deployment models, including using a single Grafana instance to provide service to multiple potentially untrusted Organizations.

In many cases, Grafana will be deployed with a single Organization.

Each Organization can have one or more Data Sources. 

All Dashboards are owned by a particular Organization.

 > Note: It is important to remember that most metric databases to not provide any sort of per-user series authentication. Therefore, in Grafana, Data Sources and Dashboards are available to all Users in a particular Organization.

For more details please refer to [Admin](/reference/admin/)

### ** User **
A User is a named account in Grafana. A user can belong to one or more Organizations, and can be assigned different levels of privileges through roles. 

Grafana supports a wide variety of internal and external ways for Users to authenticate themselves.  For more details please refer to [User Auth](/reference/http_api/#users)

### ** Row **
A Row is a logical divider within a Dashboard, and is used to group Panels together.

Rows are always 12 “units” wide. These units are automatically scaled dependent on the horizontal resolution of your browser. You can control the relative width of Panels within a row by setting their own width.

We utilize a unit abstraction so that Grafana looks great on all screens both small and huge. 

 > Note: With MaxDataPoint functionality, Grafana can show you the right amount of datapoints no matter your resolution or time-range.

Utilize the [Repeating Row functionality](/reference/templating/#utilizing-template-variables-with-repeating-panels-and-repeating-rows) to dynamically create or remove entire Rows (that can be filled with Panels), based on the Template variables selected.

### ** Panel **
The Panel is the basic visualization building block in Grafana. Each Panel provides a Query Editor (dependent on the Data Source selected in the panel) that allows you to extract the perfect signal to display on the Panel by utilizing the [Query Editor](/datasources/opentsdb/#query-editor)

There are a wide variety of styling and formatting options that each Panel exposes to allow you to create the perfect picture.

Panels can be dragged and dropped and rearranged on the Dashboard. They can also be resized.

There are currently three Panel types: [Graph](/reference/graph/), [Singlestat](/reference/singlestat/), [Dashlist](/reference/dashlist/), and [Text]().

Panels like the [Graph](/reference/graph/) panel allow you to graph as many metrics and series as you want. Other panels like [Singlestat](/reference/singlestat/) require a reduction of a single query into a single number. [Dashlist](/reference/dashlist/) and [Text]() are special panels that do not connect to any Data Source.

Panels can be made more dynamic by utilizing [Dashboard Templating](/reference/templating/) variable strings within the panel configuration (including queries to your Data Source configured via the Query Editor).

The time range on Panels is normally what is set in the [Dashboard time picker](/reference/timerange/) but this can be overridden by utilizes [Panel specific time overrides](/reference/timerange/#panel-time-override).

Utilize the [Repeating Panel](/reference/templating/#utilizing-template-variables-with-repeating-panels-and-repeating-rows) functionality to dynamically create or remove Panels based on the [Templating Variables](/reference/templating/#utilizing-template-variables-with-repeating-panels-and-repeating-rows) selected.

### ** Query Editor **
The Query Editor exposes capabilities of your Data Source and allows you to query the metrics that it contains. 

Use the Query Editor to build one or more queries (for one or more series) in your time series database. The panel will instantly update allowing you to effectively explore your data in real time and build a perfect query for that particular Panel.

You can utilize [Template variables]((/reference/templating/#utilizing-template-variables-with-repeating-panels-and-repeating-rows)) in the Query Editor within the queries themselves. This provides a powerful way to explore data dynamically based on the Templating variables selected on the Dashboard.
Grafana allows you to reference queries in the Query Editor by the row that they’re on. If you add a second query to graph, you can reference the first query simply by typing in #A. This provides an easy and convenient way to build compounded queries.

### ** Dashboard **
The Dashboard is where it all comes together. Dashboards can be thought of as of a set of one or more Panels organized and arranged into one or more Rows.

The time period for the Dashboard can be controlled by the [Dashboard time picker](/reference/timerange/) in the upper right of the Dashboard.

Dashboards can utilize [Templating](/reference/templating/) to make them more dynamic and interactive. 

Dashboards can utilize [Annotations](/reference/annotations/) to display event data across Panels. This can help correlate the time series data in the Panel with other events.

Dashboards can be tagged, and the Dashboard picker provides quick, searchable access to all Dashboards in a particular Organization.