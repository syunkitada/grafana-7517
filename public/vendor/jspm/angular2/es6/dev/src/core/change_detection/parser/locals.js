import { isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { MapWrapper } from 'angular2/src/facade/collection';
export class Locals {
    constructor(parent, current) {
        this.parent = parent;
        this.current = current;
    }
    contains(name) {
        if (this.current.has(name)) {
            return true;
        }
        if (isPresent(this.parent)) {
            return this.parent.contains(name);
        }
        return false;
    }
    get(name) {
        if (this.current.has(name)) {
            return this.current.get(name);
        }
        if (isPresent(this.parent)) {
            return this.parent.get(name);
        }
        throw new BaseException(`Cannot find '${name}'`);
    }
    set(name, value) {
        // TODO(rado): consider removing this check if we can guarantee this is not
        // exposed to the public API.
        // TODO: vsavkin maybe it should check only the local map
        if (this.current.has(name)) {
            this.current.set(name, value);
        }
        else {
            throw new BaseException(`Setting of new keys post-construction is not supported. Key: ${name}.`);
        }
    }
    clearValues() { MapWrapper.clearValues(this.current); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wYXJzZXIvbG9jYWxzLnRzIl0sIm5hbWVzIjpbIkxvY2FscyIsIkxvY2Fscy5jb25zdHJ1Y3RvciIsIkxvY2Fscy5jb250YWlucyIsIkxvY2Fscy5nZXQiLCJMb2NhbHMuc2V0IiwiTG9jYWxzLmNsZWFyVmFsdWVzIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtPQUMzQyxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFjLFVBQVUsRUFBQyxNQUFNLGdDQUFnQztBQUV0RTtJQUNFQSxZQUFtQkEsTUFBY0EsRUFBU0EsT0FBc0JBO1FBQTdDQyxXQUFNQSxHQUFOQSxNQUFNQSxDQUFRQTtRQUFTQSxZQUFPQSxHQUFQQSxPQUFPQSxDQUFlQTtJQUFHQSxDQUFDQTtJQUVwRUQsUUFBUUEsQ0FBQ0EsSUFBWUE7UUFDbkJFLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMzQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDcENBLENBQUNBO1FBRURBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ2ZBLENBQUNBO0lBRURGLEdBQUdBLENBQUNBLElBQVlBO1FBQ2RHLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNoQ0EsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQy9CQSxDQUFDQTtRQUVEQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUFDQSxnQkFBZ0JBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBO0lBQ25EQSxDQUFDQTtJQUVESCxHQUFHQSxDQUFDQSxJQUFZQSxFQUFFQSxLQUFVQTtRQUMxQkksMkVBQTJFQTtRQUMzRUEsNkJBQTZCQTtRQUM3QkEseURBQXlEQTtRQUN6REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2hDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUNuQkEsZ0VBQWdFQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUMvRUEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREosV0FBV0EsS0FBV0ssVUFBVUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDL0RMLENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmV4cG9ydCBjbGFzcyBMb2NhbHMge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGFyZW50OiBMb2NhbHMsIHB1YmxpYyBjdXJyZW50OiBNYXA8YW55LCBhbnk+KSB7fVxuXG4gIGNvbnRhaW5zKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmN1cnJlbnQuaGFzKG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucGFyZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmNvbnRhaW5zKG5hbWUpO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIGlmICh0aGlzLmN1cnJlbnQuaGFzKG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jdXJyZW50LmdldChuYW1lKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucGFyZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmdldChuYW1lKTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2Fubm90IGZpbmQgJyR7bmFtZX0nYCk7XG4gIH1cblxuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gVE9ETyhyYWRvKTogY29uc2lkZXIgcmVtb3ZpbmcgdGhpcyBjaGVjayBpZiB3ZSBjYW4gZ3VhcmFudGVlIHRoaXMgaXMgbm90XG4gICAgLy8gZXhwb3NlZCB0byB0aGUgcHVibGljIEFQSS5cbiAgICAvLyBUT0RPOiB2c2F2a2luIG1heWJlIGl0IHNob3VsZCBjaGVjayBvbmx5IHRoZSBsb2NhbCBtYXBcbiAgICBpZiAodGhpcy5jdXJyZW50LmhhcyhuYW1lKSkge1xuICAgICAgdGhpcy5jdXJyZW50LnNldChuYW1lLCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBTZXR0aW5nIG9mIG5ldyBrZXlzIHBvc3QtY29uc3RydWN0aW9uIGlzIG5vdCBzdXBwb3J0ZWQuIEtleTogJHtuYW1lfS5gKTtcbiAgICB9XG4gIH1cblxuICBjbGVhclZhbHVlcygpOiB2b2lkIHsgTWFwV3JhcHBlci5jbGVhclZhbHVlcyh0aGlzLmN1cnJlbnQpOyB9XG59XG4iXX0=