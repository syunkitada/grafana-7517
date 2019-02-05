package authtoken

import (
	"context"
	"time"
)

func (srv *UserAuthTokenServiceImpl) Run(ctx context.Context) error {
	if srv.Cfg.ExpiredTokensCleanupIntervalDays <= 0 {
		srv.log.Debug("cleanup of expired auth tokens are disabled")
		return nil
	}

	jobInterval := time.Duration(srv.Cfg.ExpiredTokensCleanupIntervalDays) * 24 * time.Hour
	srv.log.Debug("cleanup of expired auth tokens are enabled", "intervalDays", srv.Cfg.ExpiredTokensCleanupIntervalDays)

	ticker := time.NewTicker(jobInterval)
	maxInactiveLifetime := time.Duration(srv.Cfg.LoginMaxInactiveLifetimeDays) * 24 * time.Hour
	maxLifetime := time.Duration(srv.Cfg.LoginMaxLifetimeDays) * 24 * time.Hour

	for {
		select {
		case <-ticker.C:
			srv.ServerLockService.LockAndExecute(ctx, "cleanup expired auth tokens", time.Hour*12, func() {
				srv.deleteExpiredTokens(maxInactiveLifetime, maxLifetime)
			})

		case <-ctx.Done():
			return ctx.Err()
		}
	}
}

func (srv *UserAuthTokenServiceImpl) deleteExpiredTokens(maxInactiveLifetime, maxLifetime time.Duration) (int64, error) {
	createdBefore := getTime().Add(-maxLifetime)
	rotatedBefore := getTime().Add(-maxInactiveLifetime)

	srv.log.Debug("starting cleanup of expired auth tokens", "createdBefore", createdBefore, "rotatedBefore", rotatedBefore)

	sql := `DELETE from user_auth_token WHERE created_at <= ? OR rotated_at <= ?`
	res, err := srv.SQLStore.NewSession().Exec(sql, createdBefore.Unix(), rotatedBefore.Unix())
	if err != nil {
		return 0, err
	}

	affected, err := res.RowsAffected()
	if err != nil {
		srv.log.Error("failed to cleanup expired auth tokens", "error", err)
		return 0, nil
	}

	srv.log.Info("cleanup of expired auth tokens done", "count", affected)
	return affected, err
}
