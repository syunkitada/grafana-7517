+++
title = "Variables"
keywords = ["grafana", "templating", "documentation", "guide", "template", "variable"]
type = "docs"
aliases = ["/docs/grafana/latest/reference/templating"]
[menu.docs]
name = "Templates and variables"
parent = "variables"
weight = 100
+++

# Templates and variables

A variable is a placeholder for a value. You can use variables in metric queries and in panel titles. So when you change
the value, using the drop-down list at the top of the dashboard, your panel's metric queries will change to reflect the new value.

Variables allow you to create more interactive and dynamic dashboards. Instead of hard-coding things like server, application,
and sensor names in your metric queries, you can use variables in their place. Variables are displayed as drop-down lists at the top of
the dashboard. These drop-downs make it easy to change the data being displayed in your dashboard.

{{< docs-imagebox img="/img/docs/v50/variables_dashboard.png" >}}

These can be especially useful for administrators who want to allow Grafana viewers to quickly adjust visualizations but do not want to give them full editing permissions. Grafana Viewers can use variables.

Variables and templates also allow you to single-source dashboards. If you have multiple identical data sources or servers, you can make one dashboard and use variables to change what you are viewing. This simplifies maintenance and upkeep enormously.

## Templates

A _template_ is any query that contains a variable.

For example, if you were administering a dashboard to monitor several servers, you _could_ make a dashboard for each server. Or you could create one dashboard and use panels with template queries like this one:

```
wmi_system_threads{instance=~"$server"}
```

Variable values are always synced to the URL using the syntax `var-<varname>=value`.

## Examples of templates and variables

To see variable and template examples, go to any of the dashboards listed below.

- [Elasticsearch Templated dashboard](https://play.grafana.org/dashboard/db/elasticsearch-templated)
- [Graphite Templated Nested dashboard](https://play.grafana.org/dashboard/db/graphite-templated-nested)
- [InfluxDB Templated dashboard](https://play.grafana.org/dashboard/db/influxdb-templated)

Variables are listed in dropdown lists across the top of the screen. Select different variables to see how the visualizations change. 

To see variable settings, navigate to **Dashboard Settings > Variables**. Click a variable in the list to see its settings.

Variables can be used in titles, descriptions, text panels, and queries. Queries with text that starts with `$` are templates. Not all panels will have template queries.

## Variable syntax

Panel titles and metric queries can refer to variables using two different syntaxes:

- `$varname`
  This syntax is easy to read, but it does not allow you to use a variable in the middle of a word.
  **Example:** apps.frontend.$server.requests.count
- `${var_name}` Use this syntax when you want to interpolate a variable in the middle of an expression. 
- `${var_name:<format>}` This format gives you more control over how Grafana interpolates values. Refer to [Advanced variable format options]({{< relref "advanced-variable-format-options.md" >}}) for more detail on all the formatting types.
- `[[varname]]` Do not use. Deprecated old syntax, will be removed in a future release. 

Before queries are sent to your data source the query is _interpolated_, meaning the variable is replaced with its current value. During
interpolation, the variable value might be _escaped_ in order to conform to the syntax of the query language and where it is used.
For example, a variable used in a regex expression in an InfluxDB or Prometheus query will be regex escaped. Read the data source specific
documentation topic for details on value escaping during interpolation.

For advanced syntax to override data source default formatting, refer to [Advanced variable format options]({{< relref "advanced-variable-format-options.md" >}}).

## Variable types

Grafana has global built-in variables that can be used in expressions in the query editor. Refer to [Global variables]({{< relref "global-variables" >}}) for more information.

You can also define the following types of variables in Grafana. 

### Query

Write a data source query that might return a list of metric names, tag values, keys, server names, sensor IDs, data centers, and so on.

For instructions, refer to [Add a query variable]({{< relref "add-query-variable.md" >}}).

Variable queries can contain other variables. For more information, refer to [Chained variables]({{< relref "chained-variables.md" >}}).

### Custom

Define the variable options manually using a comma-separated list. For instructions, refer to [Add a custom variable]({{< relref "add-custom-variable.md" >}}).

### Text box

Display a free text input field with an optional default value. For instructions, refer to [Add a text box variable]({{< relref "add-text-box-variable.md" >}}).

### Constant

Define a hidden constant. For instructions, refer to [Add a constant variable]({{< relref "add-constant-variable.md" >}}).

### Data source

Quickly change the data source for an entire dashboard. For instructions, refer to [Add a data source variable]({{< relref "add-data-source-variable.md" >}}).

### Interval

Interval variables represent time spans. Instead of hard-coding a group by time or date histogram interval, use an interval variable. For instructions, refer to [Add an interval variable]({{< relref "add-interval-variable.md" >}}).

### Ad hoc filters

Add key/value filters that are automatically added to all metric queries that use the specified data source. Ad hoc filter variables only work with  InfluxDB, Prometheus, and Elasticsearch data sources. For instructions, refer to [Add ad hoc filters]({{< relref "add-ad-hoc-filters.md" >}}).

## Variable best practices

- Variable drop-down lists are displayed in the order they are listed in the variable list in Dashboard settings.
- Put the variables that you will change often at the top, so they will be shown first (far left on the dashboard).
