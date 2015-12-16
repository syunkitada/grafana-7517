import { StringMapWrapper } from 'angular2/src/facade/collection';
import { isPresent, isFunction } from 'angular2/src/facade/lang';
import { DomAdapter } from 'angular2/src/platform/dom/dom_adapter';
import { XHRImpl } from 'angular2/src/platform/browser/xhr_impl';
/**
 * Provides DOM operations in any browser environment.
 */
export class GenericBrowserDomAdapter extends DomAdapter {
    constructor() {
        super();
        this._animationPrefix = null;
        this._transitionEnd = null;
        try {
            var element = this.createElement('div', this.defaultDoc());
            if (isPresent(this.getStyle(element, 'animationName'))) {
                this._animationPrefix = '';
            }
            else {
                var domPrefixes = ['Webkit', 'Moz', 'O', 'ms'];
                for (var i = 0; i < domPrefixes.length; i++) {
                    if (isPresent(this.getStyle(element, domPrefixes[i] + 'AnimationName'))) {
                        this._animationPrefix = '-' + domPrefixes[i].toLowerCase() + '-';
                        break;
                    }
                }
            }
            var transEndEventNames = {
                WebkitTransition: 'webkitTransitionEnd',
                MozTransition: 'transitionend',
                OTransition: 'oTransitionEnd otransitionend',
                transition: 'transitionend'
            };
            StringMapWrapper.forEach(transEndEventNames, (value, key) => {
                if (isPresent(this.getStyle(element, key))) {
                    this._transitionEnd = value;
                }
            });
        }
        catch (e) {
            this._animationPrefix = null;
            this._transitionEnd = null;
        }
    }
    getXHR() { return XHRImpl; }
    getDistributedNodes(el) { return el.getDistributedNodes(); }
    resolveAndSetHref(el, baseUrl, href) {
        el.href = href == null ? baseUrl : baseUrl + '/../' + href;
    }
    supportsDOMEvents() { return true; }
    supportsNativeShadowDOM() {
        return isFunction(this.defaultDoc().body.createShadowRoot);
    }
    getAnimationPrefix() {
        return isPresent(this._animationPrefix) ? this._animationPrefix : "";
    }
    getTransitionEnd() { return isPresent(this._transitionEnd) ? this._transitionEnd : ""; }
    supportsAnimation() {
        return isPresent(this._animationPrefix) && isPresent(this._transitionEnd);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJpY19icm93c2VyX2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci9nZW5lcmljX2Jyb3dzZXJfYWRhcHRlci50cyJdLCJuYW1lcyI6WyJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIiLCJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIuY29uc3RydWN0b3IiLCJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIuZ2V0WEhSIiwiR2VuZXJpY0Jyb3dzZXJEb21BZGFwdGVyLmdldERpc3RyaWJ1dGVkTm9kZXMiLCJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIucmVzb2x2ZUFuZFNldEhyZWYiLCJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIuc3VwcG9ydHNET01FdmVudHMiLCJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIuc3VwcG9ydHNOYXRpdmVTaGFkb3dET00iLCJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIuZ2V0QW5pbWF0aW9uUHJlZml4IiwiR2VuZXJpY0Jyb3dzZXJEb21BZGFwdGVyLmdldFRyYW5zaXRpb25FbmQiLCJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIuc3VwcG9ydHNBbmltYXRpb24iXSwibWFwcGluZ3MiOiJPQUFPLEVBQWMsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckUsRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFPLE1BQU0sMEJBQTBCO09BQzdELEVBQUMsVUFBVSxFQUFDLE1BQU0sdUNBQXVDO09BQ3pELEVBQUMsT0FBTyxFQUFDLE1BQU0sd0NBQXdDO0FBRzlEOztHQUVHO0FBQ0gsOENBQXVELFVBQVU7SUFHL0RBO1FBQ0VDLE9BQU9BLENBQUNBO1FBSEZBLHFCQUFnQkEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDaENBLG1CQUFjQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUdwQ0EsSUFBSUEsQ0FBQ0E7WUFDSEEsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFB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QkFBZ0JBLENBQUNBLENBQUNBO0lBQ3BFQSxDQUFDQTtJQUNETixrQkFBa0JBO1FBQ2hCTyxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFDdkVBLENBQUNBO0lBQ0RQLGdCQUFnQkEsS0FBYVEsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDaEdSLGlCQUFpQkE7UUFDZlMsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxJQUFJQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtJQUM1RUEsQ0FBQ0E7QUFDSFQsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNGdW5jdGlvbiwgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7RG9tQWRhcHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge1hIUkltcGx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9icm93c2VyL3hocl9pbXBsJztcblxuXG4vKipcbiAqIFByb3ZpZGVzIERPTSBvcGVyYXRpb25zIGluIGFueSBicm93c2VyIGVudmlyb25tZW50LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgR2VuZXJpY0Jyb3dzZXJEb21BZGFwdGVyIGV4dGVuZHMgRG9tQWRhcHRlciB7XG4gIHByaXZhdGUgX2FuaW1hdGlvblByZWZpeDogc3RyaW5nID0gbnVsbDtcbiAgcHJpdmF0ZSBfdHJhbnNpdGlvbkVuZDogc3RyaW5nID0gbnVsbDtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0cnkge1xuICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHRoaXMuZGVmYXVsdERvYygpKTtcbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5nZXRTdHlsZShlbGVtZW50LCAnYW5pbWF0aW9uTmFtZScpKSkge1xuICAgICAgICB0aGlzLl9hbmltYXRpb25QcmVmaXggPSAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBkb21QcmVmaXhlcyA9IFsnV2Via2l0JywgJ01veicsICdPJywgJ21zJ107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZG9tUHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoaXNQcmVzZW50KHRoaXMuZ2V0U3R5bGUoZWxlbWVudCwgZG9tUHJlZml4ZXNbaV0gKyAnQW5pbWF0aW9uTmFtZScpKSkge1xuICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uUHJlZml4ID0gJy0nICsgZG9tUHJlZml4ZXNbaV0udG9Mb3dlckNhc2UoKSArICctJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHRyYW5zRW5kRXZlbnROYW1lczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAgIFdlYmtpdFRyYW5zaXRpb246ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgICAgTW96VHJhbnNpdGlvbjogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgICBPVHJhbnNpdGlvbjogJ29UcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgdHJhbnNpdGlvbjogJ3RyYW5zaXRpb25lbmQnXG4gICAgICB9O1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRyYW5zRW5kRXZlbnROYW1lcywgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLmdldFN0eWxlKGVsZW1lbnQsIGtleSkpKSB7XG4gICAgICAgICAgdGhpcy5fdHJhbnNpdGlvbkVuZCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9hbmltYXRpb25QcmVmaXggPSBudWxsO1xuICAgICAgdGhpcy5fdHJhbnNpdGlvbkVuZCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZ2V0WEhSKCk6IFR5cGUgeyByZXR1cm4gWEhSSW1wbDsgfVxuICBnZXREaXN0cmlidXRlZE5vZGVzKGVsOiBIVE1MRWxlbWVudCk6IE5vZGVbXSB7IHJldHVybiAoPGFueT5lbCkuZ2V0RGlzdHJpYnV0ZWROb2RlcygpOyB9XG4gIHJlc29sdmVBbmRTZXRIcmVmKGVsOiBIVE1MQW5jaG9yRWxlbWVudCwgYmFzZVVybDogc3RyaW5nLCBocmVmOiBzdHJpbmcpIHtcbiAgICBlbC5ocmVmID0gaHJlZiA9PSBudWxsID8gYmFzZVVybCA6IGJhc2VVcmwgKyAnLy4uLycgKyBocmVmO1xuICB9XG4gIHN1cHBvcnRzRE9NRXZlbnRzKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuICBzdXBwb3J0c05hdGl2ZVNoYWRvd0RPTSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNGdW5jdGlvbigoPGFueT50aGlzLmRlZmF1bHREb2MoKS5ib2R5KS5jcmVhdGVTaGFkb3dSb290KTtcbiAgfVxuICBnZXRBbmltYXRpb25QcmVmaXgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2FuaW1hdGlvblByZWZpeCkgPyB0aGlzLl9hbmltYXRpb25QcmVmaXggOiBcIlwiO1xuICB9XG4gIGdldFRyYW5zaXRpb25FbmQoKTogc3RyaW5nIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl90cmFuc2l0aW9uRW5kKSA/IHRoaXMuX3RyYW5zaXRpb25FbmQgOiBcIlwiOyB9XG4gIHN1cHBvcnRzQW5pbWF0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fYW5pbWF0aW9uUHJlZml4KSAmJiBpc1ByZXNlbnQodGhpcy5fdHJhbnNpdGlvbkVuZCk7XG4gIH1cbn1cbiJdfQ==