package alerting

import (
	"time"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/grafana/grafana/pkg/log"
	"github.com/grafana/grafana/pkg/metrics"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/annotations"
)

type ResultHandler interface {
	Handle(ctx *EvalContext)
}

type DefaultResultHandler struct {
	notifier Notifier
	log      log.Logger
}

func NewResultHandler() *DefaultResultHandler {
	return &DefaultResultHandler{
		log:      log.New("alerting.resultHandler"),
		notifier: NewRootNotifier(),
	}
}

func (handler *DefaultResultHandler) Handle(ctx *EvalContext) {
	oldState := ctx.Rule.State

	exeuctionError := ""
	annotationData := simplejson.New()
	if ctx.Error != nil {
		handler.log.Error("Alert Rule Result Error", "ruleId", ctx.Rule.Id, "error", ctx.Error)
		ctx.Rule.State = m.AlertStateExeuctionError
		exeuctionError = ctx.Error.Error()
		annotationData.Set("errorMessage", exeuctionError)
	} else if ctx.Firing {
		ctx.Rule.State = m.AlertStateType(ctx.Rule.Severity)
		annotationData = simplejson.NewFromAny(ctx.EvalMatches)
	} else {
		// handle no data case
		if ctx.NoDataFound {
			ctx.Rule.State = ctx.Rule.NoDataState
		} else {
			ctx.Rule.State = m.AlertStateOK
		}
	}

	countStateResult(ctx.Rule.State)
	if ctx.Rule.State != oldState {
		handler.log.Info("New state change", "alertId", ctx.Rule.Id, "newState", ctx.Rule.State, "oldState", oldState)

		cmd := &m.SetAlertStateCommand{
			AlertId: ctx.Rule.Id,
			OrgId:   ctx.Rule.OrgId,
			State:   ctx.Rule.State,
			Error:   exeuctionError,
		}

		if err := bus.Dispatch(cmd); err != nil {
			handler.log.Error("Failed to save state", "error", err)
		}

		// save annotation
		item := annotations.Item{
			OrgId:     ctx.Rule.OrgId,
			Type:      annotations.AlertType,
			AlertId:   ctx.Rule.Id,
			Title:     ctx.Rule.Name,
			Text:      ctx.GetStateModel().Text,
			NewState:  string(ctx.Rule.State),
			PrevState: string(oldState),
			Timestamp: time.Now(),
			Data:      annotationData,
		}

		annotationRepo := annotations.GetRepository()
		if err := annotationRepo.Save(&item); err != nil {
			handler.log.Error("Failed to save annotation for new alert state", "error", err)
		}

		handler.notifier.Notify(ctx)
	}
}

func countStateResult(state m.AlertStateType) {
	switch state {
	case m.AlertStateCritical:
		metrics.M_Alerting_Result_State_Critical.Inc(1)
	case m.AlertStateWarning:
		metrics.M_Alerting_Result_State_Warning.Inc(1)
	case m.AlertStateOK:
		metrics.M_Alerting_Result_State_Ok.Inc(1)
	case m.AlertStatePaused:
		metrics.M_Alerting_Result_State_Paused.Inc(1)
	case m.AlertStateUnknown:
		metrics.M_Alerting_Result_State_Unknown.Inc(1)
	case m.AlertStateExeuctionError:
		metrics.M_Alerting_Result_State_ExecutionError.Inc(1)
	}
}
