/**
 * JS version of browser APIs. This library can only run in the browser.
 */
var win = window;
export { win as window };
export var document = window.document;
export var location = window.location;
export var gc = window['gc'] ? () => window['gc']() : () => null;
export var performance = window['performance'] ? window['performance'] : null;
export const Event = window['Event'];
export const MouseEvent = window['MouseEvent'];
export const KeyboardEvent = window['KeyboardEvent'];
export const EventTarget = window['EventTarget'];
export const History = window['History'];
export const Location = window['Location'];
export const EventListener = window['EventListener'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9mYWNhZGUvYnJvd3Nlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUNILElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQztBQUVqQixTQUFRLEdBQUcsSUFBSSxNQUFNLEdBQUU7QUFDdkIsV0FBVyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUN0QyxXQUFXLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ3RDLFdBQVcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDO0FBQ2pFLFdBQVcsV0FBVyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzlFLGFBQWEsS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNyQyxhQUFhLFVBQVUsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDL0MsYUFBYSxhQUFhLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3JELGFBQWEsV0FBVyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNqRCxhQUFhLE9BQU8sR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDekMsYUFBYSxRQUFRLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzNDLGFBQWEsYUFBYSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogSlMgdmVyc2lvbiBvZiBicm93c2VyIEFQSXMuIFRoaXMgbGlicmFyeSBjYW4gb25seSBydW4gaW4gdGhlIGJyb3dzZXIuXG4gKi9cbnZhciB3aW4gPSB3aW5kb3c7XG5cbmV4cG9ydCB7d2luIGFzIHdpbmRvd307XG5leHBvcnQgdmFyIGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50O1xuZXhwb3J0IHZhciBsb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbjtcbmV4cG9ydCB2YXIgZ2MgPSB3aW5kb3dbJ2djJ10gPyAoKSA9PiB3aW5kb3dbJ2djJ10oKSA6ICgpID0+IG51bGw7XG5leHBvcnQgdmFyIHBlcmZvcm1hbmNlID0gd2luZG93WydwZXJmb3JtYW5jZSddID8gd2luZG93WydwZXJmb3JtYW5jZSddIDogbnVsbDtcbmV4cG9ydCBjb25zdCBFdmVudCA9IHdpbmRvd1snRXZlbnQnXTtcbmV4cG9ydCBjb25zdCBNb3VzZUV2ZW50ID0gd2luZG93WydNb3VzZUV2ZW50J107XG5leHBvcnQgY29uc3QgS2V5Ym9hcmRFdmVudCA9IHdpbmRvd1snS2V5Ym9hcmRFdmVudCddO1xuZXhwb3J0IGNvbnN0IEV2ZW50VGFyZ2V0ID0gd2luZG93WydFdmVudFRhcmdldCddO1xuZXhwb3J0IGNvbnN0IEhpc3RvcnkgPSB3aW5kb3dbJ0hpc3RvcnknXTtcbmV4cG9ydCBjb25zdCBMb2NhdGlvbiA9IHdpbmRvd1snTG9jYXRpb24nXTtcbmV4cG9ydCBjb25zdCBFdmVudExpc3RlbmVyID0gd2luZG93WydFdmVudExpc3RlbmVyJ107XG4iXX0=