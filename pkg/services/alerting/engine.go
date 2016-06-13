package alerting

import (
	"fmt"
	"time"

	"github.com/benbjohnson/clock"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/log"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/alerting/alertstates"
)

type Engine struct {
	execQueue   chan *AlertJob
	resultQueue chan *AlertResult
	clock       clock.Clock
	ticker      *Ticker
	scheduler   Scheduler
	executor    Executor
	ruleReader  RuleReader
	log         log.Logger
}

func NewEngine() *Engine {
	e := &Engine{
		ticker:      NewTicker(time.Now(), time.Second*0, clock.New()),
		execQueue:   make(chan *AlertJob, 1000),
		resultQueue: make(chan *AlertResult, 1000),
		scheduler:   NewScheduler(),
		executor:    NewExecutor(),
		ruleReader:  NewRuleReader(),
		log:         log.New("alerting.engine"),
	}

	return e
}

func (e *Engine) Start() {
	e.log.Info("Starting Alerting Engine")

	go e.alertingTicker()
	go e.execDispatch()
	go e.resultHandler()
}

func (e *Engine) Stop() {
	close(e.execQueue)
	close(e.resultQueue)
}

func (e *Engine) alertingTicker() {
	defer func() {
		if err := recover(); err != nil {
			e.log.Error("Scheduler Panic, stopping...", "error", err, "stack", log.Stack(1))
		}
	}()

	tickIndex := 0

	for {
		select {
		case tick := <-e.ticker.C:
			// TEMP SOLUTION update rules ever tenth tick
			if tickIndex%10 == 0 {
				e.scheduler.Update(e.ruleReader.Fetch())
			}

			e.scheduler.Tick(tick, e.execQueue)
			tickIndex++
		}
	}
}

func (e *Engine) execDispatch() {
	for job := range e.execQueue {
		log.Trace("Alerting: engine:execDispatch() starting job %s", job.Rule.Name)
		job.Running = true
		e.executeJob(job)
	}
}

func (e *Engine) executeJob(job *AlertJob) {
	now := time.Now()

	resultChan := make(chan *AlertResult, 1)
	go e.executor.Execute(job, resultChan)

	select {
	case <-time.After(time.Second * 5):
		e.resultQueue <- &AlertResult{
			State:    alertstates.Pending,
			Duration: float64(time.Since(now).Nanoseconds()) / float64(1000000),
			Error:    fmt.Errorf("Timeout"),
			AlertJob: job,
		}
		e.log.Debug("Job Execution timeout", "alertRuleId", job.Rule.Id)
	case result := <-resultChan:
		result.Duration = float64(time.Since(now).Nanoseconds()) / float64(1000000)
		e.log.Debug("Job Execution done", "timeTakenMs", result.Duration, "ruleId", job.Rule.Id)
		e.resultQueue <- result
	}
}

func (e *Engine) resultHandler() {
	for result := range e.resultQueue {
		e.log.Debug("Alert Rule Result", "ruleId", result.AlertJob.Rule.Id, "state", result.State, "value", result.ActualValue, "retry", result.AlertJob.RetryCount)

		result.AlertJob.Running = false

		if result.Error != nil {
			result.AlertJob.IncRetry()

			if result.AlertJob.Retryable() {
				e.log.Error("Alert Rule Result Error", "ruleId", result.AlertJob.Rule.Id, "error", result.Error, "retry", result.AlertJob.RetryCount)
				e.execQueue <- result.AlertJob
			} else {
				e.log.Error("Alert Rule Result Error After Max Retries", "ruleId", result.AlertJob.Rule.Id, "error", result.Error, "retry", result.AlertJob.RetryCount)

				result.State = alertstates.Critical
				result.Description = fmt.Sprintf("Failed to run check after %d retires, Error: %v", maxAlertExecutionRetries, result.Error)
				e.saveState(result)
			}
		} else {
			result.AlertJob.ResetRetry()
			e.saveState(result)
		}
	}
}

func (e *Engine) saveState(result *AlertResult) {
	cmd := &m.UpdateAlertStateCommand{
		AlertId:  result.AlertJob.Rule.Id,
		NewState: result.State,
		Info:     result.Description,
	}

	if err := bus.Dispatch(cmd); err != nil {
		e.log.Error("Failed to save state", "error", err)
	}
}
