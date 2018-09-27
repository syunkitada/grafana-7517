package alerting

import (
	"context"
	"errors"
	"fmt"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/components/imguploader"
	"github.com/grafana/grafana/pkg/log"
	"github.com/grafana/grafana/pkg/services/rendering"
	"github.com/grafana/grafana/pkg/setting"

	m "github.com/grafana/grafana/pkg/models"
)

type NotifierPlugin struct {
	Type            string          `json:"type"`
	Name            string          `json:"name"`
	Description     string          `json:"description"`
	OptionsTemplate string          `json:"optionsTemplate"`
	Factory         NotifierFactory `json:"-"`
}

type NotificationService interface {
	SendIfNeeded(context *EvalContext) error
}

func NewNotificationService(renderService rendering.Service) NotificationService {
	return &notificationService{
		log:           log.New("alerting.notifier"),
		renderService: renderService,
	}
}

type notificationService struct {
	log           log.Logger
	renderService rendering.Service
}

func (n *notificationService) SendIfNeeded(context *EvalContext) error {
	notifiers, err := n.getNeededNotifiers(context.Rule.OrgId, context.Rule.Notifications, context)
	if err != nil {
		return err
	}

	if len(notifiers) == 0 {
		return nil
	}

	if notifiers.ShouldUploadImage() {
		if err = n.uploadImage(context); err != nil {
			n.log.Error("Failed to upload alert panel image.", "error", err)
		}
	}

	return n.sendNotifications(context, notifiers)
}

func (n *notificationService) sendNotifications(evalContext *EvalContext, notifiers []Notifier) error {
	for _, notifier := range notifiers {
		not := notifier

		err := bus.InTransaction(evalContext.Ctx, func(ctx context.Context) error {
			n.log.Debug("trying to send notification", "id", not.GetNotifierId())

			// Verify that we can send the notification again
			// but this time within the same transaction.
			// if !evalContext.IsTestRun && !not.ShouldNotify(ctx, evalContext) {
			// 	return nil
			// }

			// n.log.Debug("Sending notification", "type", not.GetType(), "id", not.GetNotifierId(), "isDefault", not.GetIsDefault())
			// metrics.M_Alerting_Notification_Sent.WithLabelValues(not.GetType()).Inc()

			// //send notification
			// // success := not.Notify(evalContext) == nil

			// if evalContext.IsTestRun {
			// 	return nil
			// }

			//write result to db.
			// cmd := &m.RecordNotificationJournalCommand{
			// 	OrgId:      evalContext.Rule.OrgId,
			// 	AlertId:    evalContext.Rule.Id,
			// 	NotifierId: not.GetNotifierId(),
			// 	SentAt:     time.Now().Unix(),
			// 	Success:    success,
			// }

			// return bus.DispatchCtx(ctx, cmd)
			return nil
		})

		if err != nil {
			n.log.Error("failed to send notification", "id", not.GetNotifierId())
		}
	}

	return nil
}

func (n *notificationService) uploadImage(context *EvalContext) (err error) {
	uploader, err := imguploader.NewImageUploader()
	if err != nil {
		return err
	}

	renderOpts := rendering.Opts{
		Width:           1000,
		Height:          500,
		Timeout:         alertTimeout / 2,
		OrgId:           context.Rule.OrgId,
		OrgRole:         m.ROLE_ADMIN,
		ConcurrentLimit: setting.AlertingRenderLimit,
	}

	ref, err := context.GetDashboardUID()
	if err != nil {
		return err
	}

	renderOpts.Path = fmt.Sprintf("d-solo/%s/%s?panelId=%d", ref.Uid, ref.Slug, context.Rule.PanelId)

	result, err := n.renderService.Render(context.Ctx, renderOpts)
	if err != nil {
		return err
	}

	context.ImageOnDiskPath = result.FilePath
	context.ImagePublicUrl, err = uploader.Upload(context.Ctx, context.ImageOnDiskPath)
	if err != nil {
		return err
	}

	if context.ImagePublicUrl != "" {
		n.log.Info("uploaded screenshot of alert to external image store", "url", context.ImagePublicUrl)
	}

	return nil
}

func (n *notificationService) getNeededNotifiers(orgId int64, notificationIds []int64, evalContext *EvalContext) (NotifierSlice, error) {
	query := &m.GetAlertNotificationsToSendQuery{OrgId: orgId, Ids: notificationIds}

	if err := bus.Dispatch(query); err != nil {
		return nil, err
	}

	var result []Notifier
	for _, notification := range query.Result {
		not, err := n.createNotifierFor(notification)
		if err != nil {
			return nil, err
		}

		if not.ShouldNotify(evalContext.Ctx, evalContext) {
			result = append(result, not)
		}
	}

	return result, nil
}

func (n *notificationService) createNotifierFor(model *m.AlertNotification) (Notifier, error) {
	notifierPlugin, found := notifierFactories[model.Type]
	if !found {
		return nil, errors.New("Unsupported notification type")
	}

	return notifierPlugin.Factory(model)
}

type NotifierFactory func(notification *m.AlertNotification) (Notifier, error)

var notifierFactories = make(map[string]*NotifierPlugin)

func RegisterNotifier(plugin *NotifierPlugin) {
	notifierFactories[plugin.Type] = plugin
}

func GetNotifiers() []*NotifierPlugin {
	list := make([]*NotifierPlugin, 0)

	for _, value := range notifierFactories {
		list = append(list, value)
	}

	return list
}
