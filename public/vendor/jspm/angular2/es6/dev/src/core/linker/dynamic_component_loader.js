var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { Compiler } from './compiler';
import { isPresent } from 'angular2/src/facade/lang';
import { AppViewManager } from 'angular2/src/core/linker/view_manager';
/**
 * Represents an instance of a Component created via {@link DynamicComponentLoader}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #dispose}
 * method.
 */
export class ComponentRef {
    /**
     * The {@link ViewRef} of the Host View of this Component instance.
     */
    get hostView() { return this.location.parentView; }
    /**
     * @internal
     *
     * The instance of the component.
     *
     * TODO(i): this api should be removed
     */
    get hostComponent() { return this.instance; }
}
export class ComponentRef_ extends ComponentRef {
    /**
     * TODO(i): refactor into public/private fields
     */
    constructor(location, instance, componentType, injector, _dispose) {
        super();
        this._dispose = _dispose;
        this.location = location;
        this.instance = instance;
        this.componentType = componentType;
        this.injector = injector;
    }
    /**
     * @internal
     *
     * Returns the type of this Component instance.
     *
     * TODO(i): this api should be removed
     */
    get hostComponentType() { return this.componentType; }
    dispose() { this._dispose(); }
}
/**
 * Service for instantiating a Component and attaching it to a View at a specified location.
 */
export class DynamicComponentLoader {
}
export let DynamicComponentLoader_ = class extends DynamicComponentLoader {
    constructor(_compiler, _viewManager) {
        super();
        this._compiler = _compiler;
        this._viewManager = _viewManager;
    }
    loadAsRoot(type, overrideSelector, injector, onDispose) {
        return this._compiler.compileInHost(type).then(hostProtoViewRef => {
            var hostViewRef = this._viewManager.createRootHostView(hostProtoViewRef, overrideSelector, injector);
            var newLocation = this._viewManager.getHostElement(hostViewRef);
            var component = this._viewManager.getComponent(newLocation);
            var dispose = () => {
                if (isPresent(onDispose)) {
                    onDispose();
                }
                this._viewManager.destroyRootHostView(hostViewRef);
            };
            return new ComponentRef_(newLocation, component, type, injector, dispose);
        });
    }
    loadIntoLocation(type, hostLocation, anchorName, providers = null) {
        return this.loadNextToLocation(type, this._viewManager.getNamedElementInComponentView(hostLocation, anchorName), providers);
    }
    loadNextToLocation(type, location, providers = null) {
        return this._compiler.compileInHost(type).then(hostProtoViewRef => {
            var viewContainer = this._viewManager.getViewContainer(location);
            var hostViewRef = viewContainer.createHostView(hostProtoViewRef, viewContainer.length, providers);
            var newLocation = this._viewManager.getHostElement(hostViewRef);
            var component = this._viewManager.getComponent(newLocation);
            var dispose = () => {
                var index = viewContainer.indexOf(hostViewRef);
                if (index !== -1) {
                    viewContainer.remove(index);
                }
            };
            return new ComponentRef_(newLocation, component, type, null, dispose);
        });
    }
};
DynamicComponentLoader_ = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Compiler, AppViewManager])
], DynamicComponentLoader_);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1pY19jb21wb25lbnRfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2R5bmFtaWNfY29tcG9uZW50X2xvYWRlci50cyJdLCJuYW1lcyI6WyJDb21wb25lbnRSZWYiLCJDb21wb25lbnRSZWYuaG9zdFZpZXciLCJDb21wb25lbnRSZWYuaG9zdENvbXBvbmVudCIsIkNvbXBvbmVudFJlZl8iLCJDb21wb25lbnRSZWZfLmNvbnN0cnVjdG9yIiwiQ29tcG9uZW50UmVmXy5ob3N0Q29tcG9uZW50VHlwZSIsIkNvbXBvbmVudFJlZl8uZGlzcG9zZSIsIkR5bmFtaWNDb21wb25lbnRMb2FkZXIiLCJEeW5hbWljQ29tcG9uZW50TG9hZGVyXyIsIkR5bmFtaWNDb21wb25lbnRMb2FkZXJfLmNvbnN0cnVjdG9yIiwiRHluYW1pY0NvbXBvbmVudExvYWRlcl8ubG9hZEFzUm9vdCIsIkR5bmFtaWNDb21wb25lbnRMb2FkZXJfLmxvYWRJbnRvTG9jYXRpb24iLCJEeW5hbWljQ29tcG9uZW50TG9hZGVyXy5sb2FkTmV4dFRvTG9jYXRpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQXFELFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUM1RixFQUFDLFFBQVEsRUFBQyxNQUFNLFlBQVk7T0FDNUIsRUFBMEIsU0FBUyxFQUFDLE1BQU0sMEJBQTBCO09BRXBFLEVBQUMsY0FBYyxFQUFDLE1BQU0sdUNBQXVDO0FBSXBFOzs7Ozs7R0FNRztBQUNIO0lBMEJFQTs7T0FFR0E7SUFDSEEsSUFBSUEsUUFBUUEsS0FBa0JDLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO0lBRWhFRDs7Ozs7O09BTUdBO0lBQ0hBLElBQUlBLGFBQWFBLEtBQVVFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO0FBUXBERixDQUFD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YUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQTtZQUM3REEsSUFBSUEsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtZQUNqRUEsSUFBSUEsV0FBV0EsR0FDWEEsYUFBYUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxhQUFhQSxDQUFDQSxNQUFNQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUNwRkEsSUFBSUEsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDaEVBLElBQUlBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLFlBQVlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBRTVEQSxJQUFJQSxPQUFPQSxHQUFHQTtnQkFDWkEsSUFBSUEsS0FBS0EsR0FBR0EsYUFBYUEsQ0FBQ0EsT0FBT0EsQ0FBVUEsV0FBV0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hEQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDakJBLGFBQWFBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUM5QkEsQ0FBQ0E7WUFDSEEsQ0FBQ0EsQ0FBQ0E7WUFDRkEsTUFBTUEsQ0FBQ0EsSUFBSUEsYUFBYUEsQ0FBQ0EsV0FBV0EsRUFBRUEsU0FBU0EsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDeEVBLENBQUNBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0FBQ0hKLENBQUNBO0FBL0NEO0lBQUMsVUFBVSxFQUFFOzs0QkErQ1o7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7S2V5LCBJbmplY3RvciwgUmVzb2x2ZWRQcm92aWRlciwgUHJvdmlkZXIsIHByb3ZpZGUsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7Q29tcGlsZXJ9IGZyb20gJy4vY29tcGlsZXInO1xuaW1wb3J0IHtpc1R5cGUsIFR5cGUsIHN0cmluZ2lmeSwgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcm9taXNlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7QXBwVmlld01hbmFnZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X21hbmFnZXInO1xuaW1wb3J0IHtFbGVtZW50UmVmfSBmcm9tICcuL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7Vmlld1JlZiwgSG9zdFZpZXdSZWZ9IGZyb20gJy4vdmlld19yZWYnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gaW5zdGFuY2Ugb2YgYSBDb21wb25lbnQgY3JlYXRlZCB2aWEge0BsaW5rIER5bmFtaWNDb21wb25lbnRMb2FkZXJ9LlxuICpcbiAqIGBDb21wb25lbnRSZWZgIHByb3ZpZGVzIGFjY2VzcyB0byB0aGUgQ29tcG9uZW50IEluc3RhbmNlIGFzIHdlbGwgb3RoZXIgb2JqZWN0cyByZWxhdGVkIHRvIHRoaXNcbiAqIENvbXBvbmVudCBJbnN0YW5jZSBhbmQgYWxsb3dzIHlvdSB0byBkZXN0cm95IHRoZSBDb21wb25lbnQgSW5zdGFuY2UgdmlhIHRoZSB7QGxpbmsgI2Rpc3Bvc2V9XG4gKiBtZXRob2QuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21wb25lbnRSZWYge1xuICAvKipcbiAgICogVGhlIGluamVjdG9yIHByb3ZpZGVkIHtAbGluayBEeW5hbWljQ29tcG9uZW50TG9hZGVyI2xvYWRBc1Jvb3R9LlxuICAgKlxuICAgKiBUT0RPKGkpOiB0aGlzIGFwaSBpcyB1c2VsZXNzIGFuZCBzaG91bGQgYmUgcmVwbGFjZWQgYnkgYW4gaW5qZWN0b3IgcmV0cmlldmVkIGZyb21cbiAgICogICAgIHRoZSBIb3N0RWxlbWVudFJlZiwgd2hpY2ggaXMgY3VycmVudGx5IG5vdCBwb3NzaWJsZS5cbiAgICovXG4gIGluamVjdG9yOiBJbmplY3RvcjtcblxuICAvKipcbiAgICogTG9jYXRpb24gb2YgdGhlIEhvc3QgRWxlbWVudCBvZiB0aGlzIENvbXBvbmVudCBJbnN0YW5jZS5cbiAgICovXG4gIGxvY2F0aW9uOiBFbGVtZW50UmVmO1xuXG4gIC8qKlxuICAgKiBUaGUgaW5zdGFuY2Ugb2YgdGhlIENvbXBvbmVudC5cbiAgICovXG4gIGluc3RhbmNlOiBhbnk7XG5cbiAgLyoqXG4gICAqIFRoZSB1c2VyIGRlZmluZWQgY29tcG9uZW50IHR5cGUsIHJlcHJlc2VudGVkIHZpYSB0aGUgY29uc3RydWN0b3IgZnVuY3Rpb24uXG4gICAqXG4gICAqIDwhLS0gVE9ETzogY3VzdG9taXplIHdvcmRpbmcgZm9yIERhcnQgZG9jcyAtLT5cbiAgICovXG4gIGNvbXBvbmVudFR5cGU6IFR5cGU7XG5cbiAgLyoqXG4gICAqIFRoZSB7QGxpbmsgVmlld1JlZn0gb2YgdGhlIEhvc3QgVmlldyBvZiB0aGlzIENvbXBvbmVudCBpbnN0YW5jZS5cbiAgICovXG4gIGdldCBob3N0VmlldygpOiBIb3N0Vmlld1JlZiB7IHJldHVybiB0aGlzLmxvY2F0aW9uLnBhcmVudFZpZXc7IH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqXG4gICAqIFRoZSBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50LlxuICAgKlxuICAgKiBUT0RPKGkpOiB0aGlzIGFwaSBzaG91bGQgYmUgcmVtb3ZlZFxuICAgKi9cbiAgZ2V0IGhvc3RDb21wb25lbnQoKTogYW55IHsgcmV0dXJuIHRoaXMuaW5zdGFuY2U7IH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhbmQgYWxsIG9mIHRoZSBkYXRhIHN0cnVjdHVyZXMgYXNzb2NpYXRlZCB3aXRoIGl0LlxuICAgKlxuICAgKiBUT0RPKGkpOiByZW5hbWUgdG8gZGVzdHJveSB0byBiZSBjb25zaXN0ZW50IHdpdGggQXBwVmlld01hbmFnZXIgYW5kIFZpZXdDb250YWluZXJSZWZcbiAgICovXG4gIGFic3RyYWN0IGRpc3Bvc2UoKTtcbn1cblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudFJlZl8gZXh0ZW5kcyBDb21wb25lbnRSZWYge1xuICAvKipcbiAgICogVE9ETyhpKTogcmVmYWN0b3IgaW50byBwdWJsaWMvcHJpdmF0ZSBmaWVsZHNcbiAgICovXG4gIGNvbnN0cnVjdG9yKGxvY2F0aW9uOiBFbGVtZW50UmVmLCBpbnN0YW5jZTogYW55LCBjb21wb25lbnRUeXBlOiBUeXBlLCBpbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2Rpc3Bvc2U6ICgpID0+IHZvaWQpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubG9jYXRpb24gPSBsb2NhdGlvbjtcbiAgICB0aGlzLmluc3RhbmNlID0gaW5zdGFuY2U7XG4gICAgdGhpcy5jb21wb25lbnRUeXBlID0gY29tcG9uZW50VHlwZTtcbiAgICB0aGlzLmluamVjdG9yID0gaW5qZWN0b3I7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqXG4gICAqIFJldHVybnMgdGhlIHR5cGUgb2YgdGhpcyBDb21wb25lbnQgaW5zdGFuY2UuXG4gICAqXG4gICAqIFRPRE8oaSk6IHRoaXMgYXBpIHNob3VsZCBiZSByZW1vdmVkXG4gICAqL1xuICBnZXQgaG9zdENvbXBvbmVudFR5cGUoKTogVHlwZSB7IHJldHVybiB0aGlzLmNvbXBvbmVudFR5cGU7IH1cblxuICBkaXNwb3NlKCkgeyB0aGlzLl9kaXNwb3NlKCk7IH1cbn1cblxuLyoqXG4gKiBTZXJ2aWNlIGZvciBpbnN0YW50aWF0aW5nIGEgQ29tcG9uZW50IGFuZCBhdHRhY2hpbmcgaXQgdG8gYSBWaWV3IGF0IGEgc3BlY2lmaWVkIGxvY2F0aW9uLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRHluYW1pY0NvbXBvbmVudExvYWRlciB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgQ29tcG9uZW50IGB0eXBlYCBhbmQgYXR0YWNoZXMgaXQgdG8gdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlXG4gICAqIHBsYXRmb3JtLXNwZWNpZmljIGdsb2JhbCB2aWV3IHRoYXQgbWF0Y2hlcyB0aGUgY29tcG9uZW50J3Mgc2VsZWN0b3IuXG4gICAqXG4gICAqIEluIGEgYnJvd3NlciB0aGUgcGxhdGZvcm0tc3BlY2lmaWMgZ2xvYmFsIHZpZXcgaXMgdGhlIG1haW4gRE9NIERvY3VtZW50LlxuICAgKlxuICAgKiBJZiBuZWVkZWQsIHRoZSBjb21wb25lbnQncyBzZWxlY3RvciBjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgYG92ZXJyaWRlU2VsZWN0b3JgLlxuICAgKlxuICAgKiBZb3UgY2FuIG9wdGlvbmFsbHkgcHJvdmlkZSBgaW5qZWN0b3JgIGFuZCB0aGlzIHtAbGluayBJbmplY3Rvcn0gd2lsbCBiZSB1c2VkIHRvIGluc3RhbnRpYXRlIHRoZVxuICAgKiBDb21wb25lbnQuXG4gICAqXG4gICAqIFRvIGJlIG5vdGlmaWVkIHdoZW4gdGhpcyBDb21wb25lbnQgaW5zdGFuY2UgaXMgZGVzdHJveWVkLCB5b3UgY2FuIGFsc28gb3B0aW9uYWxseSBwcm92aWRlXG4gICAqIGBvbkRpc3Bvc2VgIGNhbGxiYWNrLlxuICAgKlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHtAbGluayBDb21wb25lbnRSZWZ9IHJlcHJlc2VudGluZyB0aGUgbmV3bHkgY3JlYXRlZCBDb21wb25lbnQuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2NoaWxkLWNvbXBvbmVudCcsXG4gICAqICAgdGVtcGxhdGU6ICdDaGlsZCdcbiAgICogfSlcbiAgICogY2xhc3MgQ2hpbGRDb21wb25lbnQge1xuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnbXktYXBwJyxcbiAgICogICB0ZW1wbGF0ZTogJ1BhcmVudCAoPGNoaWxkIGlkPVwiY2hpbGRcIj48L2NoaWxkPiknXG4gICAqIH0pXG4gICAqIGNsYXNzIE15QXBwIHtcbiAgICogICBjb25zdHJ1Y3RvcihkY2w6IER5bmFtaWNDb21wb25lbnRMb2FkZXIsIGluamVjdG9yOiBJbmplY3Rvcikge1xuICAgKiAgICAgZGNsLmxvYWRBc1Jvb3QoQ2hpbGRDb21wb25lbnQsICcjY2hpbGQnLCBpbmplY3Rvcik7XG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIGJvb3RzdHJhcChNeUFwcCk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBSZXN1bHRpbmcgRE9NOlxuICAgKlxuICAgKiBgYGBcbiAgICogPG15LWFwcD5cbiAgICogICBQYXJlbnQgKFxuICAgKiAgICAgPGNoaWxkIGlkPVwiY2hpbGRcIj5DaGlsZDwvY2hpbGQ+XG4gICAqICAgKVxuICAgKiA8L215LWFwcD5cbiAgICogYGBgXG4gICAqL1xuICBhYnN0cmFjdCBsb2FkQXNSb290KHR5cGU6IFR5cGUsIG92ZXJyaWRlU2VsZWN0b3I6IHN0cmluZywgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgIG9uRGlzcG9zZT86ICgpID0+IHZvaWQpOiBQcm9taXNlPENvbXBvbmVudFJlZj47XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgYSBDb21wb25lbnQgYW5kIGF0dGFjaGVzIGl0IHRvIGEgVmlldyBDb250YWluZXIgbG9jYXRlZCBpbnNpZGUgb2YgdGhlXG4gICAqIENvbXBvbmVudCBWaWV3IG9mIGFub3RoZXIgQ29tcG9uZW50IGluc3RhbmNlLlxuICAgKlxuICAgKiBUaGUgdGFyZ2V0ZWQgQ29tcG9uZW50IEluc3RhbmNlIGlzIHNwZWNpZmllZCB2aWEgaXRzIGBob3N0TG9jYXRpb25gIHtAbGluayBFbGVtZW50UmVmfS4gVGhlXG4gICAqIGxvY2F0aW9uIHdpdGhpbiB0aGUgQ29tcG9uZW50IFZpZXcgb2YgdGhpcyBDb21wb25lbnQgSW5zdGFuY2UgaXMgc3BlY2lmaWVkIHZpYSBgYW5jaG9yTmFtZWBcbiAgICogVGVtcGxhdGUgVmFyaWFibGUgTmFtZS5cbiAgICpcbiAgICogWW91IGNhbiBvcHRpb25hbGx5IHByb3ZpZGUgYHByb3ZpZGVyc2AgdG8gY29uZmlndXJlIHRoZSB7QGxpbmsgSW5qZWN0b3J9IHByb3Zpc2lvbmVkIGZvciB0aGlzXG4gICAqIENvbXBvbmVudCBJbnN0YW5jZS5cbiAgICpcbiAgICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSB7QGxpbmsgQ29tcG9uZW50UmVmfSByZXByZXNlbnRpbmcgdGhlIG5ld2x5IGNyZWF0ZWQgQ29tcG9uZW50LlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdjaGlsZC1jb21wb25lbnQnLFxuICAgKiAgIHRlbXBsYXRlOiAnQ2hpbGQnXG4gICAqIH0pXG4gICAqIGNsYXNzIENoaWxkQ29tcG9uZW50IHtcbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gICAqICAgdGVtcGxhdGU6ICdQYXJlbnQgKDxkaXYgI2NoaWxkPjwvZGl2PiknXG4gICAqIH0pXG4gICAqIGNsYXNzIE15QXBwIHtcbiAgICogICBjb25zdHJ1Y3RvcihkY2w6IER5bmFtaWNDb21wb25lbnRMb2FkZXIsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICogICAgIGRjbC5sb2FkSW50b0xvY2F0aW9uKENoaWxkQ29tcG9uZW50LCBlbGVtZW50UmVmLCAnY2hpbGQnKTtcbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogYm9vdHN0cmFwKE15QXBwKTtcbiAgICogYGBgXG4gICAqXG4gICAqIFJlc3VsdGluZyBET006XG4gICAqXG4gICAqIGBgYFxuICAgKiA8bXktYXBwPlxuICAgKiAgICBQYXJlbnQgKFxuICAgKiAgICAgIDxkaXYgI2NoaWxkPVwiXCIgY2xhc3M9XCJuZy1iaW5kaW5nXCI+PC9kaXY+XG4gICAqICAgICAgPGNoaWxkLWNvbXBvbmVudCBjbGFzcz1cIm5nLWJpbmRpbmdcIj5DaGlsZDwvY2hpbGQtY29tcG9uZW50PlxuICAgKiAgICApXG4gICAqIDwvbXktYXBwPlxuICAgKiBgYGBcbiAgICovXG4gIGFic3RyYWN0IGxvYWRJbnRvTG9jYXRpb24odHlwZTogVHlwZSwgaG9zdExvY2F0aW9uOiBFbGVtZW50UmVmLCBhbmNob3JOYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzPzogUmVzb2x2ZWRQcm92aWRlcltdKTogUHJvbWlzZTxDb21wb25lbnRSZWY+O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgQ29tcG9uZW50IGFuZCBhdHRhY2hlcyBpdCB0byB0aGUgVmlldyBDb250YWluZXIgZm91bmQgYXQgdGhlXG4gICAqIGBsb2NhdGlvbmAgc3BlY2lmaWVkIGFzIHtAbGluayBFbGVtZW50UmVmfS5cbiAgICpcbiAgICogWW91IGNhbiBvcHRpb25hbGx5IHByb3ZpZGUgYHByb3ZpZGVyc2AgdG8gY29uZmlndXJlIHRoZSB7QGxpbmsgSW5qZWN0b3J9IHByb3Zpc2lvbmVkIGZvciB0aGlzXG4gICAqIENvbXBvbmVudCBJbnN0YW5jZS5cbiAgICpcbiAgICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSB7QGxpbmsgQ29tcG9uZW50UmVmfSByZXByZXNlbnRpbmcgdGhlIG5ld2x5IGNyZWF0ZWQgQ29tcG9uZW50LlxuICAgKlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdjaGlsZC1jb21wb25lbnQnLFxuICAgKiAgIHRlbXBsYXRlOiAnQ2hpbGQnXG4gICAqIH0pXG4gICAqIGNsYXNzIENoaWxkQ29tcG9uZW50IHtcbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gICAqICAgdGVtcGxhdGU6ICdQYXJlbnQnXG4gICAqIH0pXG4gICAqIGNsYXNzIE15QXBwIHtcbiAgICogICBjb25zdHJ1Y3RvcihkY2w6IER5bmFtaWNDb21wb25lbnRMb2FkZXIsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICogICAgIGRjbC5sb2FkTmV4dFRvTG9jYXRpb24oQ2hpbGRDb21wb25lbnQsIGVsZW1lbnRSZWYpO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBib290c3RyYXAoTXlBcHApO1xuICAgKiBgYGBcbiAgICpcbiAgICogUmVzdWx0aW5nIERPTTpcbiAgICpcbiAgICogYGBgXG4gICAqIDxteS1hcHA+UGFyZW50PC9teS1hcHA+XG4gICAqIDxjaGlsZC1jb21wb25lbnQ+Q2hpbGQ8L2NoaWxkLWNvbXBvbmVudD5cbiAgICogYGBgXG4gICAqL1xuICBhYnN0cmFjdCBsb2FkTmV4dFRvTG9jYXRpb24odHlwZTogVHlwZSwgbG9jYXRpb246IEVsZW1lbnRSZWYsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM/OiBSZXNvbHZlZFByb3ZpZGVyW10pOiBQcm9taXNlPENvbXBvbmVudFJlZj47XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEeW5hbWljQ29tcG9uZW50TG9hZGVyXyBleHRlbmRzIER5bmFtaWNDb21wb25lbnRMb2FkZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9jb21waWxlcjogQ29tcGlsZXIsIHByaXZhdGUgX3ZpZXdNYW5hZ2VyOiBBcHBWaWV3TWFuYWdlcikgeyBzdXBlcigpOyB9XG5cbiAgbG9hZEFzUm9vdCh0eXBlOiBUeXBlLCBvdmVycmlkZVNlbGVjdG9yOiBzdHJpbmcsIGluamVjdG9yOiBJbmplY3RvcixcbiAgICAgICAgICAgICBvbkRpc3Bvc2U/OiAoKSA9PiB2b2lkKTogUHJvbWlzZTxDb21wb25lbnRSZWY+IHtcbiAgICByZXR1cm4gdGhpcy5fY29tcGlsZXIuY29tcGlsZUluSG9zdCh0eXBlKS50aGVuKGhvc3RQcm90b1ZpZXdSZWYgPT4ge1xuICAgICAgdmFyIGhvc3RWaWV3UmVmID1cbiAgICAgICAgICB0aGlzLl92aWV3TWFuYWdlci5jcmVhdGVSb290SG9zdFZpZXcoaG9zdFByb3RvVmlld1JlZiwgb3ZlcnJpZGVTZWxlY3RvciwgaW5qZWN0b3IpO1xuICAgICAgdmFyIG5ld0xvY2F0aW9uID0gdGhpcy5fdmlld01hbmFnZXIuZ2V0SG9zdEVsZW1lbnQoaG9zdFZpZXdSZWYpO1xuICAgICAgdmFyIGNvbXBvbmVudCA9IHRoaXMuX3ZpZXdNYW5hZ2VyLmdldENvbXBvbmVudChuZXdMb2NhdGlvbik7XG5cbiAgICAgIHZhciBkaXNwb3NlID0gKCkgPT4ge1xuICAgICAgICBpZiAoaXNQcmVzZW50KG9uRGlzcG9zZSkpIHtcbiAgICAgICAgICBvbkRpc3Bvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl92aWV3TWFuYWdlci5kZXN0cm95Um9vdEhvc3RWaWV3KGhvc3RWaWV3UmVmKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gbmV3IENvbXBvbmVudFJlZl8obmV3TG9jYXRpb24sIGNvbXBvbmVudCwgdHlwZSwgaW5qZWN0b3IsIGRpc3Bvc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgbG9hZEludG9Mb2NhdGlvbih0eXBlOiBUeXBlLCBob3N0TG9jYXRpb246IEVsZW1lbnRSZWYsIGFuY2hvck5hbWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXSA9IG51bGwpOiBQcm9taXNlPENvbXBvbmVudFJlZj4ge1xuICAgIHJldHVybiB0aGlzLmxvYWROZXh0VG9Mb2NhdGlvbihcbiAgICAgICAgdHlwZSwgdGhpcy5fdmlld01hbmFnZXIuZ2V0TmFtZWRFbGVtZW50SW5Db21wb25lbnRWaWV3KGhvc3RMb2NhdGlvbiwgYW5jaG9yTmFtZSksXG4gICAgICAgIHByb3ZpZGVycyk7XG4gIH1cblxuICBsb2FkTmV4dFRvTG9jYXRpb24odHlwZTogVHlwZSwgbG9jYXRpb246IEVsZW1lbnRSZWYsXG4gICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXSA9IG51bGwpOiBQcm9taXNlPENvbXBvbmVudFJlZj4ge1xuICAgIHJldHVybiB0aGlzLl9jb21waWxlci5jb21waWxlSW5Ib3N0KHR5cGUpLnRoZW4oaG9zdFByb3RvVmlld1JlZiA9PiB7XG4gICAgICB2YXIgdmlld0NvbnRhaW5lciA9IHRoaXMuX3ZpZXdNYW5hZ2VyLmdldFZpZXdDb250YWluZXIobG9jYXRpb24pO1xuICAgICAgdmFyIGhvc3RWaWV3UmVmID1cbiAgICAgICAgICB2aWV3Q29udGFpbmVyLmNyZWF0ZUhvc3RWaWV3KGhvc3RQcm90b1ZpZXdSZWYsIHZpZXdDb250YWluZXIubGVuZ3RoLCBwcm92aWRlcnMpO1xuICAgICAgdmFyIG5ld0xvY2F0aW9uID0gdGhpcy5fdmlld01hbmFnZXIuZ2V0SG9zdEVsZW1lbnQoaG9zdFZpZXdSZWYpO1xuICAgICAgdmFyIGNvbXBvbmVudCA9IHRoaXMuX3ZpZXdNYW5hZ2VyLmdldENvbXBvbmVudChuZXdMb2NhdGlvbik7XG5cbiAgICAgIHZhciBkaXNwb3NlID0gKCkgPT4ge1xuICAgICAgICB2YXIgaW5kZXggPSB2aWV3Q29udGFpbmVyLmluZGV4T2YoPFZpZXdSZWY+aG9zdFZpZXdSZWYpO1xuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgdmlld0NvbnRhaW5lci5yZW1vdmUoaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmV0dXJuIG5ldyBDb21wb25lbnRSZWZfKG5ld0xvY2F0aW9uLCBjb21wb25lbnQsIHR5cGUsIG51bGwsIGRpc3Bvc2UpO1xuICAgIH0pO1xuICB9XG59XG4iXX0=