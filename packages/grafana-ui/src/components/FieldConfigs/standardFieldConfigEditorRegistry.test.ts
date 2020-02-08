import { FieldConfig } from '@grafana/data';
import { standardFieldConfigEditorRegistry } from './standardFieldConfigEditorRegistry';

describe('standardFieldConfigEditorRegistry', () => {
  const dummyConfig: FieldConfig = {
    title: 'Hello',
    min: 10,
    max: 10,
    decimals: 10,
    thresholds: {} as any,
    noValue: 'no value',
    unit: 'km/s',
  };

  it('make sure all fields have a valid name', () => {
    standardFieldConfigEditorRegistry.list().forEach(v => {
      if (!dummyConfig.hasOwnProperty(v.id)) {
        fail(`Registry uses unknown property: ${v.id}`);
      }
    });
  });
});
