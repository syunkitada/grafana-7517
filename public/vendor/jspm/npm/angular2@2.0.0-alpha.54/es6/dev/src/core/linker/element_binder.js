/* */ 
"format cjs";
import { isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
export class ElementBinder {
    constructor(index, parent, distanceToParent, protoElementInjector, componentDirective, nestedProtoView) {
        this.index = index;
        this.parent = parent;
        this.distanceToParent = distanceToParent;
        this.protoElementInjector = protoElementInjector;
        this.componentDirective = componentDirective;
        this.nestedProtoView = nestedProtoView;
        if (isBlank(index)) {
            throw new BaseException('null index not allowed.');
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9iaW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZWxlbWVudF9iaW5kZXIudHMiXSwibmFtZXMiOlsiRWxlbWVudEJpbmRlciIsIkVsZW1lbnRCaW5kZXIuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sMEJBQTBCO09BQ3pDLEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO0FBSzVEO0lBQ0VBLFlBQW1CQSxLQUFhQSxFQUFTQSxNQUFxQkEsRUFBU0EsZ0JBQXdCQSxFQUM1RUEsb0JBQW1EQSxFQUNuREEsa0JBQXFDQSxFQUNyQ0EsZUFBd0NBO1FBSHhDQyxVQUFLQSxHQUFMQSxLQUFLQSxDQUFRQTtRQUFTQSxXQUFNQSxHQUFOQSxNQUFNQSxDQUFlQTtRQUFTQSxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQVFBO1FBQzVFQSx5QkFBb0JBLEdBQXBCQSxvQkFBb0JBLENBQStCQTtRQUNuREEsdUJBQWtCQSxHQUFsQkEsa0JBQWtCQSxDQUFtQkE7UUFDckNBLG9CQUFlQSxHQUFmQSxlQUFlQSxDQUF5QkE7UUFDekRBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ25CQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUFDQSx5QkFBeUJBLENBQUNBLENBQUNBO1FBQ3JEQSxDQUFDQTtJQUNIQSxDQUFDQTtBQUNIRCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0ICogYXMgZWlNb2R1bGUgZnJvbSAnLi9lbGVtZW50X2luamVjdG9yJztcbmltcG9ydCB7RGlyZWN0aXZlUHJvdmlkZXJ9IGZyb20gJy4vZWxlbWVudF9pbmplY3Rvcic7XG5pbXBvcnQgKiBhcyB2aWV3TW9kdWxlIGZyb20gJy4vdmlldyc7XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50QmluZGVyIHtcbiAgY29uc3RydWN0b3IocHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyBwYXJlbnQ6IEVsZW1lbnRCaW5kZXIsIHB1YmxpYyBkaXN0YW5jZVRvUGFyZW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyBwcm90b0VsZW1lbnRJbmplY3RvcjogZWlNb2R1bGUuUHJvdG9FbGVtZW50SW5qZWN0b3IsXG4gICAgICAgICAgICAgIHB1YmxpYyBjb21wb25lbnREaXJlY3RpdmU6IERpcmVjdGl2ZVByb3ZpZGVyLFxuICAgICAgICAgICAgICBwdWJsaWMgbmVzdGVkUHJvdG9WaWV3OiB2aWV3TW9kdWxlLkFwcFByb3RvVmlldykge1xuICAgIGlmIChpc0JsYW5rKGluZGV4KSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ251bGwgaW5kZXggbm90IGFsbG93ZWQuJyk7XG4gICAgfVxuICB9XG59XG4iXX0=