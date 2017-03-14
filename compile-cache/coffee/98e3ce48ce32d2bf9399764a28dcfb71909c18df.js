(function() {
  var VariableParser;

  module.exports = VariableParser = (function() {
    function VariableParser(registry) {
      this.registry = registry;
    }

    VariableParser.prototype.parse = function(expression) {
      var e, i, len, ref;
      ref = this.registry.getExpressions();
      for (i = 0, len = ref.length; i < len; i++) {
        e = ref[i];
        if (e.match(expression)) {
          return e.parse(expression);
        }
      }
    };

    return VariableParser;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi92YXJpYWJsZS1wYXJzZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQTs7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1Msd0JBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxXQUFEO0lBQUQ7OzZCQUNiLEtBQUEsR0FBTyxTQUFDLFVBQUQ7QUFDTCxVQUFBO0FBQUE7QUFBQSxXQUFBLHFDQUFBOztRQUNFLElBQThCLENBQUMsQ0FBQyxLQUFGLENBQVEsVUFBUixDQUE5QjtBQUFBLGlCQUFPLENBQUMsQ0FBQyxLQUFGLENBQVEsVUFBUixFQUFQOztBQURGO0lBREs7Ozs7O0FBSFQiLCJzb3VyY2VzQ29udGVudCI6WyJcbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFZhcmlhYmxlUGFyc2VyXG4gIGNvbnN0cnVjdG9yOiAoQHJlZ2lzdHJ5KSAtPlxuICBwYXJzZTogKGV4cHJlc3Npb24pIC0+XG4gICAgZm9yIGUgaW4gQHJlZ2lzdHJ5LmdldEV4cHJlc3Npb25zKClcbiAgICAgIHJldHVybiBlLnBhcnNlKGV4cHJlc3Npb24pIGlmIGUubWF0Y2goZXhwcmVzc2lvbilcblxuICAgIHJldHVyblxuIl19
