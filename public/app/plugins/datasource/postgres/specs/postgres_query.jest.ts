import PostgresQuery from '../postgres_query';

describe('PostgresQuery', function() {
  let templateSrv = {
    replace: jest.fn(text => text),
  };

  describe('When initializing', function() {
    it('should not be in SQL mode', function() {
      let query = new PostgresQuery({}, templateSrv);
      expect(query.target.rawQuery).toBe(false);
    });
    it('should be in SQL mode for pre query builder queries', function() {
      let query = new PostgresQuery({ rawSql: 'SELECT 1' }, templateSrv);
      expect(query.target.rawQuery).toBe(true);
    });
  });

  describe('When generating time column SQL', function() {
    let query = new PostgresQuery({}, templateSrv);

    query.target.timeColumn = 'time';
    expect(query.buildTimeColumn()).toBe('time AS "time"');
    query.target.timeColumn = '"time"';
    expect(query.buildTimeColumn()).toBe('"time" AS "time"');
  });

  describe('When generating time column SQL with group by time', function() {
    let query = new PostgresQuery(
      { timeColumn: 'time', group: [{ type: 'time', params: ['5m', 'none'] }] },
      templateSrv
    );
    expect(query.buildTimeColumn()).toBe('$__timeGroup(time,5m)');

    query = new PostgresQuery({ timeColumn: 'time', group: [{ type: 'time', params: ['5m', 'NULL'] }] }, templateSrv);
    expect(query.buildTimeColumn()).toBe('$__timeGroup(time,5m,NULL)');
  });

  describe('When generating metric column SQL', function() {
    let query = new PostgresQuery({}, templateSrv);

    query.target.metricColumn = 'host';
    expect(query.buildMetricColumn()).toBe('host AS metric');
    query.target.metricColumn = '"host"';
    expect(query.buildMetricColumn()).toBe('"host" AS metric');
  });

  describe('When generating value column SQL', function() {
    let query = new PostgresQuery({}, templateSrv);

    let column = [{ type: 'column', params: ['value'] }];
    expect(query.buildValueColumn(column)).toBe('value');
    column = [{ type: 'column', params: ['value'] }, { type: 'alias', params: ['alias'] }];
    expect(query.buildValueColumn(column)).toBe('value AS "alias"');
    column = [
      { type: 'column', params: ['v'] },
      { type: 'alias', params: ['a'] },
      { type: 'aggregate', params: ['max'] },
    ];
    expect(query.buildValueColumn(column)).toBe('max(v) AS "a"');
    column = [
      { type: 'column', params: ['v'] },
      { type: 'alias', params: ['a'] },
      { type: 'special', params: ['increase'] },
    ];
    expect(query.buildValueColumn(column)).toBe('v - lag(v) OVER (ORDER BY time) AS "a"');
  });

  describe('When generating value column SQL with metric column', function() {
    let query = new PostgresQuery({}, templateSrv);
    query.target.metricColumn = 'host';

    let column = [{ type: 'column', params: ['value'] }];
    expect(query.buildValueColumn(column)).toBe('value');
    column = [{ type: 'column', params: ['value'] }, { type: 'alias', params: ['alias'] }];
    expect(query.buildValueColumn(column)).toBe('value AS "alias"');
    column = [
      { type: 'column', params: ['v'] },
      { type: 'alias', params: ['a'] },
      { type: 'aggregate', params: ['max'] },
    ];
    expect(query.buildValueColumn(column)).toBe('max(v) AS "a"');
    column = [
      { type: 'column', params: ['v'] },
      { type: 'alias', params: ['a'] },
      { type: 'special', params: ['increase'] },
    ];
    expect(query.buildValueColumn(column)).toBe('v - lag(v) OVER (PARTITION BY host ORDER BY time) AS "a"');
    column = [
      { type: 'column', params: ['v'] },
      { type: 'alias', params: ['a'] },
      { type: 'aggregate', params: ['max'] },
      { type: 'special', params: ['increase'] },
    ];
    expect(query.buildValueColumn(column)).toBe(
      'max(v ORDER BY time) - lag(max(v ORDER BY time)) OVER (PARTITION BY host) AS "a"'
    );
  });

  describe('When generating WHERE clause', function() {
    let query = new PostgresQuery({ where: [] }, templateSrv);

    expect(query.buildWhereClause()).toBe('');

    query.target.timeColumn = 't';
    query.target.where = [{ type: 'macro', name: '$__timeFilter' }];
    expect(query.buildWhereClause()).toBe('\nWHERE\n  $__timeFilter(t)');

    query.target.where = [{ type: 'expression', params: ['v', '=', '1'] }];
    expect(query.buildWhereClause()).toBe('\nWHERE\n  v = 1');

    query.target.where = [{ type: 'macro', name: '$__timeFilter' }, { type: 'expression', params: ['v', '=', '1'] }];
    expect(query.buildWhereClause()).toBe('\nWHERE\n  $__timeFilter(t) AND\n  v = 1');
  });

  describe('When generating GROUP BY clause', function() {
    let query = new PostgresQuery({ group: [], metricColumn: 'none' }, templateSrv);

    expect(query.buildGroupClause()).toBe('');
    query.target.group = [{ type: 'time', params: ['5m'] }];
    expect(query.buildGroupClause()).toBe('\nGROUP BY 1');
    query.target.metricColumn = 'm';
    expect(query.buildGroupClause()).toBe('\nGROUP BY 1,2');
  });

  describe('When generating complete statement', function() {
    let target = {
      timeColumn: 't',
      table: 'table',
      select: [[{ type: 'column', params: ['value'] }]],
      where: [],
    };
    let result = 'SELECT\n  t AS "time",\n  value\nFROM table\nORDER BY 1';
    let query = new PostgresQuery(target, templateSrv);

    expect(query.buildQuery()).toBe(result);

    query.target.metricColumn = 'm';
    result = 'SELECT\n  t AS "time",\n  m AS metric,\n  value\nFROM table\nORDER BY 1';
    expect(query.buildQuery()).toBe(result);
  });
});
