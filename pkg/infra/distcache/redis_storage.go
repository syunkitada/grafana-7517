package distcache

import (
	"time"

	redis "gopkg.in/redis.v2"
)

type redisStorage struct {
	c *redis.Client
}

func newRedisStorage(c *redis.Client) *redisStorage {
	opt := &redis.Options{
		Network: "tcp",
		Addr:    "localhost:6379",
	}
	return &redisStorage{
		c: redis.NewClient(opt),
	}
}

// Set sets value to given key in session.
func (s *redisStorage) Put(key string, val interface{}, expires time.Duration) error {
	item := &Item{Created: getTime().Unix(), Val: val}
	value, err := EncodeGob(item)
	if err != nil {
		return err
	}

	var status *redis.StatusCmd
	if expires == 0 {
		status = s.c.Set(key, string(value))
	} else {
		status = s.c.SetEx(key, expires, string(value))
	}

	return status.Err()
}

// Get gets value by given key in session.
func (s *redisStorage) Get(key string) (interface{}, error) {
	v := s.c.Get(key)

	item := &Item{}
	err := DecodeGob([]byte(v.Val()), item)

	if err == nil {
		return item.Val, nil
	}

	if err.Error() == "EOF" {
		return nil, ErrCacheItemNotFound
	}

	if err != nil {
		return nil, err
	}

	return item.Val, nil
}

// Delete delete a key from session.
func (s *redisStorage) Delete(key string) error {
	cmd := s.c.Del(key)
	return cmd.Err()
}

// RedisProvider represents a redis session provider implementation.
type RedisProvider struct {
	c        *redis.Client
	duration time.Duration
	prefix   string
}

// Exist returns true if session with given ID exists.
func (p *RedisProvider) Exist(sid string) bool {
	has, err := p.c.Exists(p.prefix + sid).Result()
	return err == nil && has
}
