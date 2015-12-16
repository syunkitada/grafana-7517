'use strict';var lang_1 = require('angular2/src/facade/lang');
var instruction_1 = require('./instruction');
var AsyncRouteHandler = (function () {
    function AsyncRouteHandler(_loader, data) {
        if (data === void 0) { data = null; }
        this._loader = _loader;
        /** @internal */
        this._resolvedComponent = null;
        this.data = lang_1.isPresent(data) ? new instruction_1.RouteData(data) : instruction_1.BLANK_ROUTE_DATA;
    }
    AsyncRouteHandler.prototype.resolveComponentType = function () {
        var _this = this;
        if (lang_1.isPresent(this._resolvedComponent)) {
            return this._resolvedComponent;
        }
        return this._resolvedComponent = this._loader().then(function (componentType) {
            _this.componentType = componentType;
            return componentType;
        });
    };
    return AsyncRouteHandler;
})();
exports.AsyncRouteHandler = AsyncRouteHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcm91dGVfaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvYXN5bmNfcm91dGVfaGFuZGxlci50cyJdLCJuYW1lcyI6WyJBc3luY1JvdXRlSGFuZGxlciIsIkFzeW5jUm91dGVIYW5kbGVyLmNvbnN0cnVjdG9yIiwiQXN5bmNSb3V0ZUhhbmRsZXIucmVzb2x2ZUNvbXBvbmVudFR5cGUiXSwibWFwcGluZ3MiOiJBQUNBLHFCQUE4QiwwQkFBMEIsQ0FBQyxDQUFBO0FBR3pELDRCQUEwQyxlQUFlLENBQUMsQ0FBQTtBQUcxRDtJQU1FQSwyQkFBb0JBLE9BQWlCQSxFQUFFQSxJQUFpQ0E7UUFBakNDLG9CQUFpQ0EsR0FBakNBLFdBQWlDQTtRQUFwREEsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBVUE7UUFMckNBLGdCQUFnQkE7UUFDaEJBLHVCQUFrQkEsR0FBaUJBLElBQUlBLENBQUNBO1FBS3RDQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsdUJBQVNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLDhCQUFnQkEsQ0FBQ0E7SUFDdkVBLENBQUNBO0lBRURELGdEQUFvQkEsR0FBcEJBO1FBQUFFLGlCQVNDQTtRQVJDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2Q0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQTtRQUNqQ0EsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFDQSxhQUFhQTtZQUNqRUEsS0FBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsYUFBYUEsQ0FBQ0E7WUFDbkNBLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBO1FBQ3ZCQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUNIRix3QkFBQ0E7QUFBREEsQ0FBQ0EsQUFwQkQsSUFvQkM7QUFwQlkseUJBQWlCLG9CQW9CN0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHJvbWlzZSwgUHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtpc1ByZXNlbnQsIFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7Um91dGVIYW5kbGVyfSBmcm9tICcuL3JvdXRlX2hhbmRsZXInO1xuaW1wb3J0IHtSb3V0ZURhdGEsIEJMQU5LX1JPVVRFX0RBVEF9IGZyb20gJy4vaW5zdHJ1Y3Rpb24nO1xuXG5cbmV4cG9ydCBjbGFzcyBBc3luY1JvdXRlSGFuZGxlciBpbXBsZW1lbnRzIFJvdXRlSGFuZGxlciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Jlc29sdmVkQ29tcG9uZW50OiBQcm9taXNlPGFueT4gPSBudWxsO1xuICBjb21wb25lbnRUeXBlOiBUeXBlO1xuICBwdWJsaWMgZGF0YTogUm91dGVEYXRhO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2xvYWRlcjogRnVuY3Rpb24sIGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0gbnVsbCkge1xuICAgIHRoaXMuZGF0YSA9IGlzUHJlc2VudChkYXRhKSA/IG5ldyBSb3V0ZURhdGEoZGF0YSkgOiBCTEFOS19ST1VURV9EQVRBO1xuICB9XG5cbiAgcmVzb2x2ZUNvbXBvbmVudFR5cGUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3Jlc29sdmVkQ29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3Jlc29sdmVkQ29tcG9uZW50O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9yZXNvbHZlZENvbXBvbmVudCA9IHRoaXMuX2xvYWRlcigpLnRoZW4oKGNvbXBvbmVudFR5cGUpID0+IHtcbiAgICAgIHRoaXMuY29tcG9uZW50VHlwZSA9IGNvbXBvbmVudFR5cGU7XG4gICAgICByZXR1cm4gY29tcG9uZW50VHlwZTtcbiAgICB9KTtcbiAgfVxufVxuIl19