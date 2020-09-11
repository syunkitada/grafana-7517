import { toDataFrame, FieldType } from '@grafana/data';
import { getAnnotationsFromFrame } from './standardAnnotationSupport';

describe('DataFrame to annotations', () => {
  test('simple conversion', () => {
    const frame = toDataFrame({
      fields: [
        { type: FieldType.time, values: [1, 2, 3] },
        { name: 'first string field', values: ['t1', 't2', 't3'] },
        { name: 'tags', values: ['aaa,bbb', 'bbb,ccc', 'zyz'] },
      ],
    });

    const events = getAnnotationsFromFrame(frame);
    expect(events).toMatchInlineSnapshot(`
      Array [
        Object {
          "tags": Array [
            "aaa",
            "bbb",
          ],
          "text": "t1",
          "time": 1,
        },
        Object {
          "tags": Array [
            "bbb",
            "ccc",
          ],
          "text": "t2",
          "time": 2,
        },
        Object {
          "tags": Array [
            "zyz",
          ],
          "text": "t3",
          "time": 3,
        },
      ]
    `);
  });

  test('explicit mappins', () => {
    const frame = toDataFrame({
      fields: [
        { name: 'time1', values: [111, 222, 333] },
        { name: 'time2', values: [100, 200, 300] },
        { name: 'aaaaa', values: ['a1', 'a2', 'a3'] },
        { name: 'bbbbb', values: ['b1', 'b2', 'b3'] },
      ],
    });

    const events = getAnnotationsFromFrame(frame, {
      text: { value: 'bbbbb' },
      time: { value: 'time2' },
      timeEnd: { value: 'time1' },
      title: { value: 'aaaaa' },
    });
    expect(events).toMatchInlineSnapshot(`
      Array [
        Object {
          "text": "b1",
          "time": 100,
          "timeEnd": 111,
          "title": "a1",
        },
        Object {
          "text": "b2",
          "time": 200,
          "timeEnd": 222,
          "title": "a2",
        },
        Object {
          "text": "b3",
          "time": 300,
          "timeEnd": 333,
          "title": "a3",
        },
      ]
    `);
  });
});
