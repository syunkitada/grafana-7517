----
page_title: Graphite query guide
page_description: Graphite query guide
page_keywords: grafana, graphite, metrics, query, documentation
---

# Graphite

Grafana has an advanced graphite query editor that lets you quickly navigate the metric space, add functions.
Change function paramaters and much more. The editor cannot handle all types of queries yet.
To switch to a regular text box click the pen icon to the right.

## Adding the data source to Grafana
Open the side menu by clicking the the Grafana icon in the top header. In the side menu under the `Dashboards` link you
should find a link named `Data Sources`. If this link is missing in the side menu it means that your current
user does not have the `Admin` role for the current organization.

![](/img/v2/add_datasource_graphite.png)

Now click the `Add new` link in the top header.

Name | Description
------------ | -------------
Name | The data source name, important that this is the same as in Grafana v1.x if you plan to import old dashboards.
Default | Default data source means that it will be pre-selected for new panels.
Url | The http protocol, ip and port of you graphite-web or graphite-api install.
Access | Proxy = access via Grafana backend, Direct = access directory from browser.

## Metric editor

### Navigate metric segments

Click the ``Select metric`` link to start navigating the metric space. One you start you can continue using the mouse
or keyboard arrow keys. You can select a wildcard and still continue.

![](/img/animated_gifs/graphite_query1.gif)

### Functions

Click the plus icon to the right to add a function. You can search for the function or select it from the menu. Once
a function is selected it will be added and your focus will be in the text box of the first parameter. To later change
a parameter just click on it and it will turn into a text box. To delete a function click the function name followed
by the x icon.

![](/img/animated_gifs/graphite_query2.gif)


### Optional parameters
Some functions like aliasByNode support an optional second argument. To add this parameter specify for example 3,-2 as the first parameter and the function editor will adapt and move the -2 to a second parameter. To remove the second optional parameter just click on it and leave it blank and the editor will remove it.

![](/img/animated_gifs/func_editor_optional_params.gif)

## Point consolidation

All graphite metrics are consolidated so that graphite doesn't return more data points than there are pixels in the graph. By default
this consolidation is done using `avg` function. You can how graphite consolidates metrics by adding the Graphite consolidateBy function.

> *Notice* This means that legend summary values (max, min, total) cannot be all correct at the same time. They are calculated
> client side by Grafana. And depending on your consolidation function only one or two can be correct at the same time.
