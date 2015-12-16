export { EventEmitter, Observable } from 'angular2/src/facade/async';
/**
 * Message Bus is a low level API used to communicate between the UI and the background.
 * Communication is based on a channel abstraction. Messages published in a
 * given channel to one MessageBusSink are received on the same channel
 * by the corresponding MessageBusSource.
 */
export class MessageBus {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZV9idXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzLnRzIl0sIm5hbWVzIjpbIk1lc3NhZ2VCdXMiXSwibWFwcGluZ3MiOiJBQUVBLFNBQVEsWUFBWSxFQUFFLFVBQVUsUUFBTywyQkFBMkIsQ0FBQztBQUVuRTs7Ozs7R0FLRztBQUNIO0FBOEJBQSxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5leHBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbi8qKlxuICogTWVzc2FnZSBCdXMgaXMgYSBsb3cgbGV2ZWwgQVBJIHVzZWQgdG8gY29tbXVuaWNhdGUgYmV0d2VlbiB0aGUgVUkgYW5kIHRoZSBiYWNrZ3JvdW5kLlxuICogQ29tbXVuaWNhdGlvbiBpcyBiYXNlZCBvbiBhIGNoYW5uZWwgYWJzdHJhY3Rpb24uIE1lc3NhZ2VzIHB1Ymxpc2hlZCBpbiBhXG4gKiBnaXZlbiBjaGFubmVsIHRvIG9uZSBNZXNzYWdlQnVzU2luayBhcmUgcmVjZWl2ZWQgb24gdGhlIHNhbWUgY2hhbm5lbFxuICogYnkgdGhlIGNvcnJlc3BvbmRpbmcgTWVzc2FnZUJ1c1NvdXJjZS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1lc3NhZ2VCdXMgaW1wbGVtZW50cyBNZXNzYWdlQnVzU291cmNlLCBNZXNzYWdlQnVzU2luayB7XG4gIC8qKlxuICAgKiBTZXRzIHVwIGEgbmV3IGNoYW5uZWwgb24gdGhlIE1lc3NhZ2VCdXMuXG4gICAqIE1VU1QgYmUgY2FsbGVkIGJlZm9yZSBjYWxsaW5nIGZyb20gb3IgdG8gb24gdGhlIGNoYW5uZWwuXG4gICAqIElmIHJ1bkluWm9uZSBpcyB0cnVlIHRoZW4gdGhlIHNvdXJjZSB3aWxsIGVtaXQgZXZlbnRzIGluc2lkZSB0aGUgYW5ndWxhciB6b25lXG4gICAqIGFuZCB0aGUgc2luayB3aWxsIGJ1ZmZlciBtZXNzYWdlcyBhbmQgc2VuZCBvbmx5IG9uY2UgdGhlIHpvbmUgZXhpdHMuXG4gICAqIGlmIHJ1bkluWm9uZSBpcyBmYWxzZSB0aGVuIHRoZSBzb3VyY2Ugd2lsbCBlbWl0IGV2ZW50cyBpbnNpZGUgdGhlIGdsb2JhbCB6b25lXG4gICAqIGFuZCB0aGUgc2luayB3aWxsIHNlbmQgbWVzc2FnZXMgaW1tZWRpYXRlbHkuXG4gICAqL1xuICBhYnN0cmFjdCBpbml0Q2hhbm5lbChjaGFubmVsOiBzdHJpbmcsIHJ1bkluWm9uZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBBc3NpZ25zIHRoaXMgYnVzIHRvIHRoZSBnaXZlbiB6b25lLlxuICAgKiBBbnkgY2FsbGJhY2tzIGF0dGFjaGVkIHRvIGNoYW5uZWxzIHdoZXJlIHJ1bkluWm9uZSB3YXMgc2V0IHRvIHRydWUgb24gaW5pdGlhbGl6YXRpb25cbiAgICogd2lsbCBiZSBleGVjdXRlZCBpbiB0aGUgZ2l2ZW4gem9uZS5cbiAgICovXG4gIGFic3RyYWN0IGF0dGFjaFRvWm9uZSh6b25lOiBOZ1pvbmUpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIHtAbGluayBFdmVudEVtaXR0ZXJ9IHRoYXQgZW1pdHMgZXZlcnkgdGltZSBhIG1lc3NhZ2VcbiAgICogaXMgcmVjZWl2ZWQgb24gdGhlIGdpdmVuIGNoYW5uZWwuXG4gICAqL1xuICBhYnN0cmFjdCBmcm9tKGNoYW5uZWw6IHN0cmluZyk6IEV2ZW50RW1pdHRlcjxhbnk+O1xuXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4ge0BsaW5rIEV2ZW50RW1pdHRlcn0gZm9yIHRoZSBnaXZlbiBjaGFubmVsXG4gICAqIFRvIHB1Ymxpc2ggbWV0aG9kcyB0byB0aGF0IGNoYW5uZWwganVzdCBjYWxsIG5leHQgKG9yIGFkZCBpbiBkYXJ0KSBvbiB0aGUgcmV0dXJuZWQgZW1pdHRlclxuICAgKi9cbiAgYWJzdHJhY3QgdG8oY2hhbm5lbDogc3RyaW5nKTogRXZlbnRFbWl0dGVyPGFueT47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVzc2FnZUJ1c1NvdXJjZSB7XG4gIC8qKlxuICAgKiBTZXRzIHVwIGEgbmV3IGNoYW5uZWwgb24gdGhlIE1lc3NhZ2VCdXNTb3VyY2UuXG4gICAqIE1VU1QgYmUgY2FsbGVkIGJlZm9yZSBjYWxsaW5nIGZyb20gb24gdGhlIGNoYW5uZWwuXG4gICAqIElmIHJ1bkluWm9uZSBpcyB0cnVlIHRoZW4gdGhlIHNvdXJjZSB3aWxsIGVtaXQgZXZlbnRzIGluc2lkZSB0aGUgYW5ndWxhciB6b25lLlxuICAgKiBpZiBydW5JblpvbmUgaXMgZmFsc2UgdGhlbiB0aGUgc291cmNlIHdpbGwgZW1pdCBldmVudHMgaW5zaWRlIHRoZSBnbG9iYWwgem9uZS5cbiAgICovXG4gIGluaXRDaGFubmVsKGNoYW5uZWw6IHN0cmluZywgcnVuSW5ab25lOiBib29sZWFuKTogdm9pZDtcblxuICAvKipcbiAgICogQXNzaWducyB0aGlzIHNvdXJjZSB0byB0aGUgZ2l2ZW4gem9uZS5cbiAgICogQW55IGNoYW5uZWxzIHdoaWNoIGFyZSBpbml0aWFsaXplZCB3aXRoIHJ1bkluWm9uZSBzZXQgdG8gdHJ1ZSB3aWxsIGVtaXQgZXZlbnRzIHRoYXQgd2lsbCBiZVxuICAgKiBleGVjdXRlZCB3aXRoaW4gdGhlIGdpdmVuIHpvbmUuXG4gICAqL1xuICBhdHRhY2hUb1pvbmUoem9uZTogTmdab25lKTogdm9pZDtcblxuICAvKipcbiAgICogUmV0dXJucyBhbiB7QGxpbmsgRXZlbnRFbWl0dGVyfSB0aGF0IGVtaXRzIGV2ZXJ5IHRpbWUgYSBtZXNzYWdlXG4gICAqIGlzIHJlY2VpdmVkIG9uIHRoZSBnaXZlbiBjaGFubmVsLlxuICAgKi9cbiAgZnJvbShjaGFubmVsOiBzdHJpbmcpOiBFdmVudEVtaXR0ZXI8YW55Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZXNzYWdlQnVzU2luayB7XG4gIC8qKlxuICAgKiBTZXRzIHVwIGEgbmV3IGNoYW5uZWwgb24gdGhlIE1lc3NhZ2VCdXNTaW5rLlxuICAgKiBNVVNUIGJlIGNhbGxlZCBiZWZvcmUgY2FsbGluZyB0byBvbiB0aGUgY2hhbm5lbC5cbiAgICogSWYgcnVuSW5ab25lIGlzIHRydWUgdGhlIHNpbmsgd2lsbCBidWZmZXIgbWVzc2FnZXMgYW5kIHNlbmQgb25seSBvbmNlIHRoZSB6b25lIGV4aXRzLlxuICAgKiBpZiBydW5JblpvbmUgaXMgZmFsc2UgdGhlIHNpbmsgd2lsbCBzZW5kIG1lc3NhZ2VzIGltbWVkaWF0bHkuXG4gICAqL1xuICBpbml0Q2hhbm5lbChjaGFubmVsOiBzdHJpbmcsIHJ1bkluWm9uZTogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEFzc2lnbnMgdGhpcyBzaW5rIHRvIHRoZSBnaXZlbiB6b25lLlxuICAgKiBBbnkgY2hhbm5lbHMgd2hpY2ggYXJlIGluaXRpYWxpemVkIHdpdGggcnVuSW5ab25lIHNldCB0byB0cnVlIHdpbGwgd2FpdCBmb3IgdGhlIGdpdmVuIHpvbmVcbiAgICogdG8gZXhpdCBiZWZvcmUgc2VuZGluZyBtZXNzYWdlcy5cbiAgICovXG4gIGF0dGFjaFRvWm9uZSh6b25lOiBOZ1pvbmUpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIHtAbGluayBFdmVudEVtaXR0ZXJ9IGZvciB0aGUgZ2l2ZW4gY2hhbm5lbFxuICAgKiBUbyBwdWJsaXNoIG1ldGhvZHMgdG8gdGhhdCBjaGFubmVsIGp1c3QgY2FsbCBuZXh0IChvciBhZGQgaW4gZGFydCkgb24gdGhlIHJldHVybmVkIGVtaXR0ZXJcbiAgICovXG4gIHRvKGNoYW5uZWw6IHN0cmluZyk6IEV2ZW50RW1pdHRlcjxhbnk+O1xufVxuIl19