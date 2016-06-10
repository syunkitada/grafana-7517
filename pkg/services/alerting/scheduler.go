package alerting

import (
	"time"

	"github.com/grafana/grafana/pkg/log"
)

type SchedulerImpl struct {
	jobs map[int64]*AlertJob
	log  log.Logger
}

func NewScheduler() Scheduler {
	return &SchedulerImpl{
		jobs: make(map[int64]*AlertJob, 0),
		log:  log.New("alerting.scheduler"),
	}
}

func (s *SchedulerImpl) Update(rules []*AlertRule) {
	s.log.Debug("Scheduler: Update")

	jobs := make(map[int64]*AlertJob, 0)

	for i, rule := range rules {
		var job *AlertJob
		if s.jobs[rule.Id] != nil {
			job = s.jobs[rule.Id]
		} else {
			job = &AlertJob{
				Running:    false,
				RetryCount: 0,
			}
		}

		job.Rule = rule
		job.Offset = int64(i)

		jobs[rule.Id] = job
	}

	s.log.Debug("Scheduler: Selected new jobs", "job count", len(jobs))
	s.jobs = jobs
}

func (s *SchedulerImpl) Tick(tickTime time.Time, execQueue chan *AlertJob) {
	now := tickTime.Unix()

	for _, job := range s.jobs {
		if now%job.Rule.Frequency == 0 && job.Running == false {
			s.log.Debug("Scheduler: Putting job on to exec queue", "name", job.Rule.Name)
			execQueue <- job
		}
	}
}
