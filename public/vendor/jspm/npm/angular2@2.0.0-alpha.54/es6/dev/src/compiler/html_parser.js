/* */ 
"format cjs";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
import { HtmlAttrAst, HtmlTextAst, HtmlElementAst } from './html_ast';
import { Injectable } from 'angular2/src/core/di';
import { HtmlTokenType, tokenizeHtml } from './html_lexer';
import { ParseError, ParseSourceSpan } from './parse_util';
import { getHtmlTagDefinition, getNsPrefix } from './html_tags';
export class HtmlTreeError extends ParseError {
    constructor(elementName, location, msg) {
        super(location, msg);
        this.elementName = elementName;
    }
    static create(elementName, location, msg) {
        return new HtmlTreeError(elementName, location, msg);
    }
}
export class HtmlParseTreeResult {
    constructor(rootNodes, errors) {
        this.rootNodes = rootNodes;
        this.errors = errors;
    }
}
export let HtmlParser = class {
    parse(sourceContent, sourceUrl) {
        var tokensAndErrors = tokenizeHtml(sourceContent, sourceUrl);
        var treeAndErrors = new TreeBuilder(tokensAndErrors.tokens).build();
        return new HtmlParseTreeResult(treeAndErrors.rootNodes, tokensAndErrors.errors
            .concat(treeAndErrors.errors));
    }
};
HtmlParser = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], HtmlParser);
class TreeBuilder {
    constructor(tokens) {
        this.tokens = tokens;
        this.index = -1;
        this.rootNodes = [];
        this.errors = [];
        this.elementStack = [];
        this._advance();
    }
    build() {
        while (this.peek.type !== HtmlTokenType.EOF) {
            if (this.peek.type === HtmlTokenType.TAG_OPEN_START) {
                this._consumeStartTag(this._advance());
            }
            else if (this.peek.type === HtmlTokenType.TAG_CLOSE) {
                this._consumeEndTag(this._advance());
            }
            else if (this.peek.type === HtmlTokenType.CDATA_START) {
                this._closeVoidElement();
                this._consumeCdata(this._advance());
            }
            else if (this.peek.type === HtmlTokenType.COMMENT_START) {
                this._closeVoidElement();
                this._consumeComment(this._advance());
            }
            else if (this.peek.type === HtmlTokenType.TEXT ||
                this.peek.type === HtmlTokenType.RAW_TEXT ||
                this.peek.type === HtmlTokenType.ESCAPABLE_RAW_TEXT) {
                this._closeVoidElement();
                this._consumeText(this._advance());
            }
            else {
                // Skip all other tokens...
                this._advance();
            }
        }
        return new HtmlParseTreeResult(this.rootNodes, this.errors);
    }
    _advance() {
        var prev = this.peek;
        if (this.index < this.tokens.length - 1) {
            // Note: there is always an EOF token at the end
            this.index++;
        }
        this.peek = this.tokens[this.index];
        return prev;
    }
    _advanceIf(type) {
        if (this.peek.type === type) {
            return this._advance();
        }
        return null;
    }
    _consumeCdata(startToken) {
        this._consumeText(this._advance());
        this._advanceIf(HtmlTokenType.CDATA_END);
    }
    _consumeComment(startToken) {
        this._advanceIf(HtmlTokenType.RAW_TEXT);
        this._advanceIf(HtmlTokenType.COMMENT_END);
    }
    _consumeText(token) {
        let text = token.parts[0];
        if (text.length > 0 && text[0] == '\n') {
            let parent = this._getParentElement();
            if (isPresent(parent) && parent.children.length == 0 &&
                getHtmlTagDefinition(parent.name).ignoreFirstLf) {
                text = text.substring(1);
            }
        }
        if (text.length > 0) {
            this._addToParent(new HtmlTextAst(text, token.sourceSpan));
        }
    }
    _closeVoidElement() {
        if (this.elementStack.length > 0) {
            let el = ListWrapper.last(this.elementStack);
            if (getHtmlTagDefinition(el.name).isVoid) {
                this.elementStack.pop();
            }
        }
    }
    _consumeStartTag(startTagToken) {
        var prefix = startTagToken.parts[0];
        var name = startTagToken.parts[1];
        var attrs = [];
        while (this.peek.type === HtmlTokenType.ATTR_NAME) {
            attrs.push(this._consumeAttr(this._advance()));
        }
        var fullName = getElementFullName(prefix, name, this._getParentElement());
        var selfClosing = false;
        // Note: There could have been a tokenizer error
        // so that we don't get a token for the end tag...
        if (this.peek.type === HtmlTokenType.TAG_OPEN_END_VOID) {
            this._advance();
            selfClosing = true;
            if (getNsPrefix(fullName) == null && !getHtmlTagDefinition(fullName).isVoid) {
                this.errors.push(HtmlTreeError.create(fullName, startTagToken.sourceSpan.start, `Only void and foreign elements can be self closed "${startTagToken.parts[1]}"`));
            }
        }
        else if (this.peek.type === HtmlTokenType.TAG_OPEN_END) {
            this._advance();
            selfClosing = false;
        }
        var end = this.peek.sourceSpan.start;
        var el = new HtmlElementAst(fullName, attrs, [], new ParseSourceSpan(startTagToken.sourceSpan.start, end));
        this._pushElement(el);
        if (selfClosing) {
            this._popElement(fullName);
        }
    }
    _pushElement(el) {
        if (this.elementStack.length > 0) {
            var parentEl = ListWrapper.last(this.elementStack);
            if (getHtmlTagDefinition(parentEl.name).isClosedByChild(el.name)) {
                this.elementStack.pop();
            }
        }
        var tagDef = getHtmlTagDefinition(el.name);
        var parentEl = this._getParentElement();
        if (tagDef.requireExtraParent(isPresent(parentEl) ? parentEl.name : null)) {
            var newParent = new HtmlElementAst(tagDef.parentToAdd, [], [el], el.sourceSpan);
            this._addToParent(newParent);
            this.elementStack.push(newParent);
            this.elementStack.push(el);
        }
        else {
            this._addToParent(el);
            this.elementStack.push(el);
        }
    }
    _consumeEndTag(endTagToken) {
        var fullName = getElementFullName(endTagToken.parts[0], endTagToken.parts[1], this._getParentElement());
        if (getHtmlTagDefinition(fullName).isVoid) {
            this.errors.push(HtmlTreeError.create(fullName, endTagToken.sourceSpan.start, `Void elements do not have end tags "${endTagToken.parts[1]}"`));
        }
        else if (!this._popElement(fullName)) {
            this.errors.push(HtmlTreeError.create(fullName, endTagToken.sourceSpan.start, `Unexpected closing tag "${endTagToken.parts[1]}"`));
        }
    }
    _popElement(fullName) {
        for (let stackIndex = this.elementStack.length - 1; stackIndex >= 0; stackIndex--) {
            let el = this.elementStack[stackIndex];
            if (el.name == fullName) {
                ListWrapper.splice(this.elementStack, stackIndex, this.elementStack.length - stackIndex);
                return true;
            }
            if (!getHtmlTagDefinition(el.name).closedByParent) {
                return false;
            }
        }
        return false;
    }
    _consumeAttr(attrName) {
        var fullName = mergeNsAndName(attrName.parts[0], attrName.parts[1]);
        var end = attrName.sourceSpan.end;
        var value = '';
        if (this.peek.type === HtmlTokenType.ATTR_VALUE) {
            var valueToken = this._advance();
            value = valueToken.parts[0];
            end = valueToken.sourceSpan.end;
        }
        return new HtmlAttrAst(fullName, value, new ParseSourceSpan(attrName.sourceSpan.start, end));
    }
    _getParentElement() {
        return this.elementStack.length > 0 ? ListWrapper.last(this.elementStack) : null;
    }
    _addToParent(node) {
        var parent = this._getParentElement();
        if (isPresent(parent)) {
            parent.children.push(node);
        }
        else {
            this.rootNodes.push(node);
        }
    }
}
function mergeNsAndName(prefix, localName) {
    return isPresent(prefix) ? `@${prefix}:${localName}` : localName;
}
function getElementFullName(prefix, localName, parentElement) {
    if (isBlank(prefix)) {
        prefix = getHtmlTagDefinition(localName).implicitNamespacePrefix;
        if (isBlank(prefix) && isPresent(parentElement)) {
            prefix = getNsPrefix(parentElement.name);
        }
    }
    return mergeNsAndName(prefix, localName);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF9wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tcGlsZXIvaHRtbF9wYXJzZXIudHMiXSwibmFtZXMiOlsiSHRtbFRyZWVFcnJvciIsIkh0bWxUcmVlRXJyb3IuY29uc3RydWN0b3IiLCJIdG1sVHJlZUVycm9yLmNyZWF0ZSIsIkh0bWxQYXJzZVRyZWVSZXN1bHQiLCJIdG1sUGFyc2VUcmVlUmVzdWx0LmNvbnN0cnVjdG9yIiwiSHRtbFBhcnNlciIsIkh0bWxQYXJzZXIucGFyc2UiLCJUcmVlQnVpbGRlciIsIlRyZWVCdWlsZGVyLmNvbnN0cnVjdG9yIiwiVHJlZUJ1aWxkZXIuYnVpbGQiLCJUcmVlQnVpbGRlci5fYWR2YW5jZSIsIlRyZWVCdWlsZGVyLl9hZHZhbmNlSWYiLCJUcmVlQnVpbGRlci5fY29uc3VtZUNkYXRhIiwiVHJlZUJ1aWxkZXIuX2NvbnN1bWVDb21tZW50IiwiVHJlZUJ1aWxkZXIuX2NvbnN1bWVUZXh0IiwiVHJlZUJ1aWxkZXIuX2Nsb3NlVm9pZEVsZW1lbnQiLCJUcmVlQnVpbGRlci5fY29uc3VtZVN0YXJ0VGFnIiwiVHJlZUJ1aWxkZXIuX3B1c2hFbGVtZW50IiwiVHJlZUJ1aWxkZXIuX2NvbnN1bWVFbmRUYWciLCJUcmVlQnVpbGRlci5fcG9wRWxlbWVudCIsIlRyZWVCdWlsZGVyLl9jb25zdW1lQXR0ciIsIlRyZWVCdWlsZGVyLl9nZXRQYXJlbnRFbGVtZW50IiwiVHJlZUJ1aWxkZXIuX2FkZFRvUGFyZW50IiwibWVyZ2VOc0FuZE5hbWUiLCJnZXRFbGVtZW50RnVsbE5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQ0wsU0FBUyxFQUNULE9BQU8sRUFPUixNQUFNLDBCQUEwQjtPQUUxQixFQUFDLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUVuRCxFQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFDLE1BQU0sWUFBWTtPQUVyRSxFQUFDLFVBQVUsRUFBQyxN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dENBLDJCQUEyQkEsV0FBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0ZBLENBQUNBO0lBQ0hBLENBQUNBO0lBRU9YLFdBQVdBLENBQUNBLFFBQWdCQTtRQUNsQ1ksR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsRUFBRUEsVUFBVUEsSUFBSUEsQ0FBQ0EsRUFBRUEsVUFBVUEsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDbEZBLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1lBQ3ZDQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxJQUFJQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDeEJBLFdBQVdBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLEVBQUVBLFVBQVVBLEVBQUVBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEdBQUdBLFVBQVVBLENBQUNBLENBQUNBO2dCQUN6RkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDZEEsQ0FBQ0E7WUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbERBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1lBQ2ZBLENBQUNBO1FBQ0hBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ2ZBLENBQUNBO0lBRU9aLFlBQVlBLENBQUNBLFFBQW1CQTtRQUN0Q2EsSUFBSUEsUUFBUUEsR0FBR0EsY0FBY0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDcEVBLElBQUlBLEdBQUdBLEdBQUdBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLEdBQUdBLENBQUNBO1FBQ2xDQSxJQUFJQSxLQUFLQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNmQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxhQUFhQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoREEsSUFBSUEsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDakNBLEtBQUtBLEdBQUdBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxHQUFHQSxHQUFHQSxVQUFVQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQTtRQUNsQ0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsV0FBV0EsQ0FBQ0EsUUFBUUEsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsZUFBZUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDL0ZBLENBQUNBO0lBRU9iLGlCQUFpQkE7UUFDdkJjLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO0lBQ25GQSxDQUFDQTtJQUVPZCxZQUFZQSxDQUFDQSxJQUFhQTtRQUNoQ2UsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQzdCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUM1QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7QUFDSGYsQ0FBQ0E7QUFFRCx3QkFBd0IsTUFBYyxFQUFFLFNBQWlCO0lBQ3ZEZ0IsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsSUFBSUEsTUFBTUEsSUFBSUEsU0FBU0EsRUFBRUEsR0FBR0EsU0FBU0EsQ0FBQ0E7QUFDbkVBLENBQUNBO0FBRUQsNEJBQTRCLE1BQWMsRUFBRSxTQUFpQixFQUNqQyxhQUE2QjtJQUN2REMsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDcEJBLE1BQU1BLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsdUJBQXVCQSxDQUFDQTtRQUNqRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsU0FBU0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaERBLE1BQU1BLEdBQUdBLFdBQVdBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQzNDQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxNQUFNQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtBQUMzQ0EsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFN0cmluZ1dyYXBwZXIsXG4gIHN0cmluZ2lmeSxcbiAgYXNzZXJ0aW9uc0VuYWJsZWQsXG4gIFN0cmluZ0pvaW5lcixcbiAgc2VyaWFsaXplRW51bSxcbiAgQ09OU1RfRVhQUlxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge0h0bWxBc3QsIEh0bWxBdHRyQXN0LCBIdG1sVGV4dEFzdCwgSHRtbEVsZW1lbnRBc3R9IGZyb20gJy4vaHRtbF9hc3QnO1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7SHRtbFRva2VuLCBIdG1sVG9rZW5UeXBlLCB0b2tlbml6ZUh0bWx9IGZyb20gJy4vaHRtbF9sZXhlcic7XG5pbXBvcnQge1BhcnNlRXJyb3IsIFBhcnNlTG9jYXRpb24sIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi9wYXJzZV91dGlsJztcbmltcG9ydCB7SHRtbFRhZ0RlZmluaXRpb24sIGdldEh0bWxUYWdEZWZpbml0aW9uLCBnZXROc1ByZWZpeH0gZnJvbSAnLi9odG1sX3RhZ3MnO1xuXG5leHBvcnQgY2xhc3MgSHRtbFRyZWVFcnJvciBleHRlbmRzIFBhcnNlRXJyb3Ige1xuICBzdGF0aWMgY3JlYXRlKGVsZW1lbnROYW1lOiBzdHJpbmcsIGxvY2F0aW9uOiBQYXJzZUxvY2F0aW9uLCBtc2c6IHN0cmluZyk6IEh0bWxUcmVlRXJyb3Ige1xuICAgIHJldHVybiBuZXcgSHRtbFRyZWVFcnJvcihlbGVtZW50TmFtZSwgbG9jYXRpb24sIG1zZyk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudE5hbWU6IHN0cmluZywgbG9jYXRpb246IFBhcnNlTG9jYXRpb24sIG1zZzogc3RyaW5nKSB7XG4gICAgc3VwZXIobG9jYXRpb24sIG1zZyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEh0bWxQYXJzZVRyZWVSZXN1bHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcm9vdE5vZGVzOiBIdG1sQXN0W10sIHB1YmxpYyBlcnJvcnM6IFBhcnNlRXJyb3JbXSkge31cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0bWxQYXJzZXIge1xuICBwYXJzZShzb3VyY2VDb250ZW50OiBzdHJpbmcsIHNvdXJjZVVybDogc3RyaW5nKTogSHRtbFBhcnNlVHJlZVJlc3VsdCB7XG4gICAgdmFyIHRva2Vuc0FuZEVycm9ycyA9IHRva2VuaXplSHRtbChzb3VyY2VDb250ZW50LCBzb3VyY2VVcmwpO1xuICAgIHZhciB0cmVlQW5kRXJyb3JzID0gbmV3IFRyZWVCdWlsZGVyKHRva2Vuc0FuZEVycm9ycy50b2tlbnMpLmJ1aWxkKCk7XG4gICAgcmV0dXJuIG5ldyBIdG1sUGFyc2VUcmVlUmVzdWx0KHRyZWVBbmRFcnJvcnMucm9vdE5vZGVzLCAoPFBhcnNlRXJyb3JbXT50b2tlbnNBbmRFcnJvcnMuZXJyb3JzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jb25jYXQodHJlZUFuZEVycm9ycy5lcnJvcnMpKTtcbiAgfVxufVxuXG5jbGFzcyBUcmVlQnVpbGRlciB7XG4gIHByaXZhdGUgaW5kZXg6IG51bWJlciA9IC0xO1xuICBwcml2YXRlIHBlZWs6IEh0bWxUb2tlbjtcblxuICBwcml2YXRlIHJvb3ROb2RlczogSHRtbEFzdFtdID0gW107XG4gIHByaXZhdGUgZXJyb3JzOiBIdG1sVHJlZUVycm9yW10gPSBbXTtcblxuICBwcml2YXRlIGVsZW1lbnRTdGFjazogSHRtbEVsZW1lbnRBc3RbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgdG9rZW5zOiBIdG1sVG9rZW5bXSkgeyB0aGlzLl9hZHZhbmNlKCk7IH1cblxuICBidWlsZCgpOiBIdG1sUGFyc2VUcmVlUmVzdWx0IHtcbiAgICB3aGlsZSAodGhpcy5wZWVrLnR5cGUgIT09IEh0bWxUb2tlblR5cGUuRU9GKSB7XG4gICAgICBpZiAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuVEFHX09QRU5fU1RBUlQpIHtcbiAgICAgICAgdGhpcy5fY29uc3VtZVN0YXJ0VGFnKHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLlRBR19DTE9TRSkge1xuICAgICAgICB0aGlzLl9jb25zdW1lRW5kVGFnKHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLkNEQVRBX1NUQVJUKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlVm9pZEVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fY29uc3VtZUNkYXRhKHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLkNPTU1FTlRfU1RBUlQpIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lQ29tbWVudCh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnBlZWsudHlwZSA9PT0gSHRtbFRva2VuVHlwZS5URVhUIHx8XG4gICAgICAgICAgICAgICAgIHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLlJBV19URVhUIHx8XG4gICAgICAgICAgICAgICAgIHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLkVTQ0FQQUJMRV9SQVdfVEVYVCkge1xuICAgICAgICB0aGlzLl9jbG9zZVZvaWRFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVUZXh0KHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTa2lwIGFsbCBvdGhlciB0b2tlbnMuLi5cbiAgICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IEh0bWxQYXJzZVRyZWVSZXN1bHQodGhpcy5yb290Tm9kZXMsIHRoaXMuZXJyb3JzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FkdmFuY2UoKTogSHRtbFRva2VuIHtcbiAgICB2YXIgcHJldiA9IHRoaXMucGVlaztcbiAgICBpZiAodGhpcy5pbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aCAtIDEpIHtcbiAgICAgIC8vIE5vdGU6IHRoZXJlIGlzIGFsd2F5cyBhbiBFT0YgdG9rZW4gYXQgdGhlIGVuZFxuICAgICAgdGhpcy5pbmRleCsrO1xuICAgIH1cbiAgICB0aGlzLnBlZWsgPSB0aGlzLnRva2Vuc1t0aGlzLmluZGV4XTtcbiAgICByZXR1cm4gcHJldjtcbiAgfVxuXG4gIHByaXZhdGUgX2FkdmFuY2VJZih0eXBlOiBIdG1sVG9rZW5UeXBlKTogSHRtbFRva2VuIHtcbiAgICBpZiAodGhpcy5wZWVrLnR5cGUgPT09IHR5cGUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hZHZhbmNlKCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUNkYXRhKHN0YXJ0VG9rZW46IEh0bWxUb2tlbikge1xuICAgIHRoaXMuX2NvbnN1bWVUZXh0KHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgdGhpcy5fYWR2YW5jZUlmKEh0bWxUb2tlblR5cGUuQ0RBVEFfRU5EKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVDb21tZW50KHN0YXJ0VG9rZW46IEh0bWxUb2tlbikge1xuICAgIHRoaXMuX2FkdmFuY2VJZihIdG1sVG9rZW5UeXBlLlJBV19URVhUKTtcbiAgICB0aGlzLl9hZHZhbmNlSWYoSHRtbFRva2VuVHlwZS5DT01NRU5UX0VORCk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lVGV4dCh0b2tlbjogSHRtbFRva2VuKSB7XG4gICAgbGV0IHRleHQgPSB0b2tlbi5wYXJ0c1swXTtcbiAgICBpZiAodGV4dC5sZW5ndGggPiAwICYmIHRleHRbMF0gPT0gJ1xcbicpIHtcbiAgICAgIGxldCBwYXJlbnQgPSB0aGlzLl9nZXRQYXJlbnRFbGVtZW50KCk7XG4gICAgICBpZiAoaXNQcmVzZW50KHBhcmVudCkgJiYgcGFyZW50LmNoaWxkcmVuLmxlbmd0aCA9PSAwICYmXG4gICAgICAgICAgZ2V0SHRtbFRhZ0RlZmluaXRpb24ocGFyZW50Lm5hbWUpLmlnbm9yZUZpcnN0TGYpIHtcbiAgICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX2FkZFRvUGFyZW50KG5ldyBIdG1sVGV4dEFzdCh0ZXh0LCB0b2tlbi5zb3VyY2VTcGFuKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY2xvc2VWb2lkRWxlbWVudCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5lbGVtZW50U3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgbGV0IGVsID0gTGlzdFdyYXBwZXIubGFzdCh0aGlzLmVsZW1lbnRTdGFjayk7XG5cbiAgICAgIGlmIChnZXRIdG1sVGFnRGVmaW5pdGlvbihlbC5uYW1lKS5pc1ZvaWQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50U3RhY2sucG9wKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVN0YXJ0VGFnKHN0YXJ0VGFnVG9rZW46IEh0bWxUb2tlbikge1xuICAgIHZhciBwcmVmaXggPSBzdGFydFRhZ1Rva2VuLnBhcnRzWzBdO1xuICAgIHZhciBuYW1lID0gc3RhcnRUYWdUb2tlbi5wYXJ0c1sxXTtcbiAgICB2YXIgYXR0cnMgPSBbXTtcbiAgICB3aGlsZSAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuQVRUUl9OQU1FKSB7XG4gICAgICBhdHRycy5wdXNoKHRoaXMuX2NvbnN1bWVBdHRyKHRoaXMuX2FkdmFuY2UoKSkpO1xuICAgIH1cbiAgICB2YXIgZnVsbE5hbWUgPSBnZXRFbGVtZW50RnVsbE5hbWUocHJlZml4LCBuYW1lLCB0aGlzLl9nZXRQYXJlbnRFbGVtZW50KCkpO1xuICAgIHZhciBzZWxmQ2xvc2luZyA9IGZhbHNlO1xuICAgIC8vIE5vdGU6IFRoZXJlIGNvdWxkIGhhdmUgYmVlbiBhIHRva2VuaXplciBlcnJvclxuICAgIC8vIHNvIHRoYXQgd2UgZG9uJ3QgZ2V0IGEgdG9rZW4gZm9yIHRoZSBlbmQgdGFnLi4uXG4gICAgaWYgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLlRBR19PUEVOX0VORF9WT0lEKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICBzZWxmQ2xvc2luZyA9IHRydWU7XG4gICAgICBpZiAoZ2V0TnNQcmVmaXgoZnVsbE5hbWUpID09IG51bGwgJiYgIWdldEh0bWxUYWdEZWZpbml0aW9uKGZ1bGxOYW1lKS5pc1ZvaWQpIHtcbiAgICAgICAgdGhpcy5lcnJvcnMucHVzaChIdG1sVHJlZUVycm9yLmNyZWF0ZShcbiAgICAgICAgICAgIGZ1bGxOYW1lLCBzdGFydFRhZ1Rva2VuLnNvdXJjZVNwYW4uc3RhcnQsXG4gICAgICAgICAgICBgT25seSB2b2lkIGFuZCBmb3JlaWduIGVsZW1lbnRzIGNhbiBiZSBzZWxmIGNsb3NlZCBcIiR7c3RhcnRUYWdUb2tlbi5wYXJ0c1sxXX1cImApKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLlRBR19PUEVOX0VORCkge1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgc2VsZkNsb3NpbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGVuZCA9IHRoaXMucGVlay5zb3VyY2VTcGFuLnN0YXJ0O1xuICAgIHZhciBlbCA9IG5ldyBIdG1sRWxlbWVudEFzdChmdWxsTmFtZSwgYXR0cnMsIFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGFyc2VTb3VyY2VTcGFuKHN0YXJ0VGFnVG9rZW4uc291cmNlU3Bhbi5zdGFydCwgZW5kKSk7XG4gICAgdGhpcy5fcHVzaEVsZW1lbnQoZWwpO1xuICAgIGlmIChzZWxmQ2xvc2luZykge1xuICAgICAgdGhpcy5fcG9wRWxlbWVudChmdWxsTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcHVzaEVsZW1lbnQoZWw6IEh0bWxFbGVtZW50QXN0KSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudFN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBwYXJlbnRFbCA9IExpc3RXcmFwcGVyLmxhc3QodGhpcy5lbGVtZW50U3RhY2spO1xuICAgICAgaWYgKGdldEh0bWxUYWdEZWZpbml0aW9uKHBhcmVudEVsLm5hbWUpLmlzQ2xvc2VkQnlDaGlsZChlbC5uYW1lKSkge1xuICAgICAgICB0aGlzLmVsZW1lbnRTdGFjay5wb3AoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdGFnRGVmID0gZ2V0SHRtbFRhZ0RlZmluaXRpb24oZWwubmFtZSk7XG4gICAgdmFyIHBhcmVudEVsID0gdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpO1xuICAgIGlmICh0YWdEZWYucmVxdWlyZUV4dHJhUGFyZW50KGlzUHJlc2VudChwYXJlbnRFbCkgPyBwYXJlbnRFbC5uYW1lIDogbnVsbCkpIHtcbiAgICAgIHZhciBuZXdQYXJlbnQgPSBuZXcgSHRtbEVsZW1lbnRBc3QodGFnRGVmLnBhcmVudFRvQWRkLCBbXSwgW2VsXSwgZWwuc291cmNlU3Bhbik7XG4gICAgICB0aGlzLl9hZGRUb1BhcmVudChuZXdQYXJlbnQpO1xuICAgICAgdGhpcy5lbGVtZW50U3RhY2sucHVzaChuZXdQYXJlbnQpO1xuICAgICAgdGhpcy5lbGVtZW50U3RhY2sucHVzaChlbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2FkZFRvUGFyZW50KGVsKTtcbiAgICAgIHRoaXMuZWxlbWVudFN0YWNrLnB1c2goZWwpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVFbmRUYWcoZW5kVGFnVG9rZW46IEh0bWxUb2tlbikge1xuICAgIHZhciBmdWxsTmFtZSA9XG4gICAgICAgIGdldEVsZW1lbnRGdWxsTmFtZShlbmRUYWdUb2tlbi5wYXJ0c1swXSwgZW5kVGFnVG9rZW4ucGFydHNbMV0sIHRoaXMuX2dldFBhcmVudEVsZW1lbnQoKSk7XG5cbiAgICBpZiAoZ2V0SHRtbFRhZ0RlZmluaXRpb24oZnVsbE5hbWUpLmlzVm9pZCkge1xuICAgICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgICAgICBIdG1sVHJlZUVycm9yLmNyZWF0ZShmdWxsTmFtZSwgZW5kVGFnVG9rZW4uc291cmNlU3Bhbi5zdGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgVm9pZCBlbGVtZW50cyBkbyBub3QgaGF2ZSBlbmQgdGFncyBcIiR7ZW5kVGFnVG9rZW4ucGFydHNbMV19XCJgKSk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5fcG9wRWxlbWVudChmdWxsTmFtZSkpIHtcbiAgICAgIHRoaXMuZXJyb3JzLnB1c2goSHRtbFRyZWVFcnJvci5jcmVhdGUoZnVsbE5hbWUsIGVuZFRhZ1Rva2VuLnNvdXJjZVNwYW4uc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBVbmV4cGVjdGVkIGNsb3NpbmcgdGFnIFwiJHtlbmRUYWdUb2tlbi5wYXJ0c1sxXX1cImApKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9wb3BFbGVtZW50KGZ1bGxOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBmb3IgKGxldCBzdGFja0luZGV4ID0gdGhpcy5lbGVtZW50U3RhY2subGVuZ3RoIC0gMTsgc3RhY2tJbmRleCA+PSAwOyBzdGFja0luZGV4LS0pIHtcbiAgICAgIGxldCBlbCA9IHRoaXMuZWxlbWVudFN0YWNrW3N0YWNrSW5kZXhdO1xuICAgICAgaWYgKGVsLm5hbWUgPT0gZnVsbE5hbWUpIHtcbiAgICAgICAgTGlzdFdyYXBwZXIuc3BsaWNlKHRoaXMuZWxlbWVudFN0YWNrLCBzdGFja0luZGV4LCB0aGlzLmVsZW1lbnRTdGFjay5sZW5ndGggLSBzdGFja0luZGV4KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICghZ2V0SHRtbFRhZ0RlZmluaXRpb24oZWwubmFtZSkuY2xvc2VkQnlQYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lQXR0cihhdHRyTmFtZTogSHRtbFRva2VuKTogSHRtbEF0dHJBc3Qge1xuICAgIHZhciBmdWxsTmFtZSA9IG1lcmdlTnNBbmROYW1lKGF0dHJOYW1lLnBhcnRzWzBdLCBhdHRyTmFtZS5wYXJ0c1sxXSk7XG4gICAgdmFyIGVuZCA9IGF0dHJOYW1lLnNvdXJjZVNwYW4uZW5kO1xuICAgIHZhciB2YWx1ZSA9ICcnO1xuICAgIGlmICh0aGlzLnBlZWsudHlwZSA9PT0gSHRtbFRva2VuVHlwZS5BVFRSX1ZBTFVFKSB7XG4gICAgICB2YXIgdmFsdWVUb2tlbiA9IHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIHZhbHVlID0gdmFsdWVUb2tlbi5wYXJ0c1swXTtcbiAgICAgIGVuZCA9IHZhbHVlVG9rZW4uc291cmNlU3Bhbi5lbmQ7XG4gICAgfVxuICAgIHJldHVybiBuZXcgSHRtbEF0dHJBc3QoZnVsbE5hbWUsIHZhbHVlLCBuZXcgUGFyc2VTb3VyY2VTcGFuKGF0dHJOYW1lLnNvdXJjZVNwYW4uc3RhcnQsIGVuZCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UGFyZW50RWxlbWVudCgpOiBIdG1sRWxlbWVudEFzdCB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudFN0YWNrLmxlbmd0aCA+IDAgPyBMaXN0V3JhcHBlci5sYXN0KHRoaXMuZWxlbWVudFN0YWNrKSA6IG51bGw7XG4gIH1cblxuICBwcml2YXRlIF9hZGRUb1BhcmVudChub2RlOiBIdG1sQXN0KSB7XG4gICAgdmFyIHBhcmVudCA9IHRoaXMuX2dldFBhcmVudEVsZW1lbnQoKTtcbiAgICBpZiAoaXNQcmVzZW50KHBhcmVudCkpIHtcbiAgICAgIHBhcmVudC5jaGlsZHJlbi5wdXNoKG5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJvb3ROb2Rlcy5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtZXJnZU5zQW5kTmFtZShwcmVmaXg6IHN0cmluZywgbG9jYWxOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaXNQcmVzZW50KHByZWZpeCkgPyBgQCR7cHJlZml4fToke2xvY2FsTmFtZX1gIDogbG9jYWxOYW1lO1xufVxuXG5mdW5jdGlvbiBnZXRFbGVtZW50RnVsbE5hbWUocHJlZml4OiBzdHJpbmcsIGxvY2FsTmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQ6IEh0bWxFbGVtZW50QXN0KTogc3RyaW5nIHtcbiAgaWYgKGlzQmxhbmsocHJlZml4KSkge1xuICAgIHByZWZpeCA9IGdldEh0bWxUYWdEZWZpbml0aW9uKGxvY2FsTmFtZSkuaW1wbGljaXROYW1lc3BhY2VQcmVmaXg7XG4gICAgaWYgKGlzQmxhbmsocHJlZml4KSAmJiBpc1ByZXNlbnQocGFyZW50RWxlbWVudCkpIHtcbiAgICAgIHByZWZpeCA9IGdldE5zUHJlZml4KHBhcmVudEVsZW1lbnQubmFtZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1lcmdlTnNBbmROYW1lKHByZWZpeCwgbG9jYWxOYW1lKTtcbn1cbiJdfQ==