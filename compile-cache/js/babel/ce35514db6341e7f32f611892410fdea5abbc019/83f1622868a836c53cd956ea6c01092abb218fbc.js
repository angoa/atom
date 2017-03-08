'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var isFunction = function isFunction(value) {
  return isType(value, 'function');
};

var isString = function isString(value) {
  return isType(value, 'string');
};

var isType = function isType(value, typeName) {
  var t = typeof value;
  if (t == null) {
    return false;
  }
  return t === typeName;
};

exports.isFunction = isFunction;
exports.isString = isString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbmdvYS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvdHlwZS1oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7QUFFWCxJQUFNLFVBQVUsR0FBRyxTQUFiLFVBQVUsQ0FBRyxLQUFLO1NBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUM7Q0FBQSxDQUFBOztBQUVyRCxJQUFNLFFBQVEsR0FBRyxTQUFYLFFBQVEsQ0FBRyxLQUFLO1NBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUM7Q0FBQSxDQUFBOztBQUVqRCxJQUFNLE1BQU0sR0FBRyxTQUFULE1BQU0sQ0FBSSxLQUFLLEVBQUUsUUFBUSxFQUFLO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sS0FBSyxDQUFBO0FBQ3RCLE1BQUksQ0FBQyxJQUFJLElBQUksRUFBRTtBQUFFLFdBQU8sS0FBSyxDQUFBO0dBQUU7QUFDL0IsU0FBTyxDQUFDLEtBQUssUUFBUSxDQUFBO0NBQ3RCLENBQUE7O1FBRVEsVUFBVSxHQUFWLFVBQVU7UUFBRSxRQUFRLEdBQVIsUUFBUSIsImZpbGUiOiIvVXNlcnMvYW5nb2EvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvbGliL3R5cGUtaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IGlzRnVuY3Rpb24gPSB2YWx1ZSA9PiBpc1R5cGUodmFsdWUsICdmdW5jdGlvbicpXG5cbmNvbnN0IGlzU3RyaW5nID0gdmFsdWUgPT4gaXNUeXBlKHZhbHVlLCAnc3RyaW5nJylcblxuY29uc3QgaXNUeXBlID0gKHZhbHVlLCB0eXBlTmFtZSkgPT4ge1xuICBjb25zdCB0ID0gdHlwZW9mIHZhbHVlXG4gIGlmICh0ID09IG51bGwpIHsgcmV0dXJuIGZhbHNlIH1cbiAgcmV0dXJuIHQgPT09IHR5cGVOYW1lXG59XG5cbmV4cG9ydCB7IGlzRnVuY3Rpb24sIGlzU3RyaW5nIH1cbiJdfQ==