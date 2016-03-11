package plugins

import (
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/components/dynmap"
	"github.com/grafana/grafana/pkg/log"
	m "github.com/grafana/grafana/pkg/models"
)

type ImportDashboardCommand struct {
	Path   string                 `json:"string"`
	Inputs []ImportDashboardInput `json:"inputs"`

	OrgId    int64  `json:"-"`
	UserId   int64  `json:"-"`
	PluginId string `json:"-"`
	Result   *PluginDashboardInfoDTO
}

type ImportDashboardInput struct {
	Type     string `json:"type"`
	PluginId string `json:"pluginId"`
	Name     string `json:"name"`
	Value    string `json:"value"`
}

func init() {
	bus.AddHandler("plugins", ImportDashboard)
}

func ImportDashboard(cmd *ImportDashboardCommand) error {
	plugin, exists := Plugins[cmd.PluginId]

	if !exists {
		return PluginNotFoundError{cmd.PluginId}
	}

	var dashboard *m.Dashboard
	var err error

	if dashboard, err = loadPluginDashboard(plugin, cmd.Path); err != nil {
		return err
	}

	saveCmd := m.SaveDashboardCommand{
		Dashboard: dashboard.Data,
		OrgId:     cmd.OrgId,
		UserId:    cmd.UserId,
	}

	if err := bus.Dispatch(&saveCmd); err != nil {
		return err
	}

	cmd.Result = &PluginDashboardInfoDTO{
		PluginId:          cmd.PluginId,
		Title:             dashboard.Title,
		Path:              cmd.Path,
		Revision:          dashboard.GetString("revision", "1.0"),
		InstalledUri:      "db/" + saveCmd.Result.Slug,
		InstalledRevision: dashboard.GetString("revision", "1.0"),
		Installed:         true,
	}

	return nil
}

type DashTemplateEvaluator struct {
	template  *dynmap.Object
	inputs    []ImportDashboardInput
	variables map[string]string
	result    *dynmap.Object
}

// func (this *DashTemplateEvaluator) getObject(path string) map[string]interface{} {
// 	if obj, exists := this.template[path]; exists {
// 		return obj.(map[string]interface{})
// 	}
// 	return nil
// }

func (this *DashTemplateEvaluator) findInput(varName string, varDef *dynmap.Object) *ImportDashboardInput {
	inputType, _ := varDef.GetString("type")

	for _, input := range this.inputs {
		if inputType == input.Type && (input.Name == varName || input.Name == "*") {
			return &input
		}
	}

	return nil
}

func (this *DashTemplateEvaluator) Eval() (*dynmap.Object, error) {
	this.result = dynmap.NewObject()
	this.variables = make(map[string]string)

	// check that we have all inputs we need
	if requiredInputs, err := this.template.GetObject("__inputs"); err == nil {
		for varName, value := range requiredInputs.Map() {
			varDef, _ := value.Object()
			input := this.findInput(varName, varDef)
			this.variables[varName] = input.Value
		}
	}

	this.EvalObject(this.template, this.result)
	return this.result, nil
}

func (this *DashTemplateEvaluator) EvalObject(source *dynmap.Object, writer *dynmap.Object) {

	for key, value := range source.Map() {
		if key == "__input" {
			continue
		}

		goValue := value.Interface()
		switch goValue.(type) {
		case string:
			writer.SetValue(key, goValue)
		case map[string]interface{}:
			childSource, _ := value.Object()
			childWriter, _ := writer.SetValue(key, map[string]interface{}{}).Object()
			this.EvalObject(childSource, childWriter)
		default:
			log.Error(3, "Unknown json type key: %v , type: %v", key, goValue)
		}
	}
}
