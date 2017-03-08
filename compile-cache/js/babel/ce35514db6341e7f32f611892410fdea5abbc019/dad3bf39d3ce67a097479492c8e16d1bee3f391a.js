Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.create = create;

var _messageElement = require('./message-element');

'use babel';

function create(message) {
  var bubble = document.createElement('div');
  bubble.id = 'linter-inline';
  bubble.appendChild(_messageElement.Message.fromMessage(message, false));
  if (message.trace && message.trace.length) {
    message.trace.forEach(function (trace) {
      bubble.appendChild(_messageElement.Message.fromMessage(trace).updateVisibility('Project'));
    });
  }
  return bubble;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbmdvYS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL3VpL21lc3NhZ2UtYnViYmxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OzhCQUVzQixtQkFBbUI7O0FBRnpDLFdBQVcsQ0FBQTs7QUFJSixTQUFTLE1BQU0sQ0FBQyxPQUFPLEVBQUU7QUFDOUIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM1QyxRQUFNLENBQUMsRUFBRSxHQUFHLGVBQWUsQ0FBQTtBQUMzQixRQUFNLENBQUMsV0FBVyxDQUFDLHdCQUFRLFdBQVcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUN2RCxNQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDekMsV0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBUyxLQUFLLEVBQUU7QUFDcEMsWUFBTSxDQUFDLFdBQVcsQ0FBQyx3QkFBUSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtLQUMzRSxDQUFDLENBQUE7R0FDSDtBQUNELFNBQU8sTUFBTSxDQUFBO0NBQ2QiLCJmaWxlIjoiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvdWkvbWVzc2FnZS1idWJibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge01lc3NhZ2V9IGZyb20gJy4vbWVzc2FnZS1lbGVtZW50J1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKG1lc3NhZ2UpIHtcbiAgY29uc3QgYnViYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgYnViYmxlLmlkID0gJ2xpbnRlci1pbmxpbmUnXG4gIGJ1YmJsZS5hcHBlbmRDaGlsZChNZXNzYWdlLmZyb21NZXNzYWdlKG1lc3NhZ2UsIGZhbHNlKSlcbiAgaWYgKG1lc3NhZ2UudHJhY2UgJiYgbWVzc2FnZS50cmFjZS5sZW5ndGgpIHtcbiAgICBtZXNzYWdlLnRyYWNlLmZvckVhY2goZnVuY3Rpb24odHJhY2UpIHtcbiAgICAgIGJ1YmJsZS5hcHBlbmRDaGlsZChNZXNzYWdlLmZyb21NZXNzYWdlKHRyYWNlKS51cGRhdGVWaXNpYmlsaXR5KCdQcm9qZWN0JykpXG4gICAgfSlcbiAgfVxuICByZXR1cm4gYnViYmxlXG59XG4iXX0=