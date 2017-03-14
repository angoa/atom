(function() {
  var ColorParser;

  module.exports = ColorParser = (function() {
    function ColorParser(registry, context) {
      this.registry = registry;
      this.context = context;
    }

    ColorParser.prototype.parse = function(expression, scope, collectVariables) {
      var e, i, len, ref, res;
      if (scope == null) {
        scope = '*';
      }
      if (collectVariables == null) {
        collectVariables = true;
      }
      if ((expression == null) || expression === '') {
        return void 0;
      }
      ref = this.registry.getExpressionsForScope(scope);
      for (i = 0, len = ref.length; i < len; i++) {
        e = ref[i];
        if (e.match(expression)) {
          res = e.parse(expression, this.context);
          if (collectVariables) {
            res.variables = this.context.readUsedVariables();
          }
          return res;
        }
      }
      return void 0;
    };

    return ColorParser;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1wYXJzZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQTs7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MscUJBQUMsUUFBRCxFQUFZLE9BQVo7TUFBQyxJQUFDLENBQUEsV0FBRDtNQUFXLElBQUMsQ0FBQSxVQUFEO0lBQVo7OzBCQUViLEtBQUEsR0FBTyxTQUFDLFVBQUQsRUFBYSxLQUFiLEVBQXdCLGdCQUF4QjtBQUNMLFVBQUE7O1FBRGtCLFFBQU07OztRQUFLLG1CQUFpQjs7TUFDOUMsSUFBd0Isb0JBQUosSUFBbUIsVUFBQSxLQUFjLEVBQXJEO0FBQUEsZUFBTyxPQUFQOztBQUVBO0FBQUEsV0FBQSxxQ0FBQTs7UUFDRSxJQUFHLENBQUMsQ0FBQyxLQUFGLENBQVEsVUFBUixDQUFIO1VBQ0UsR0FBQSxHQUFNLENBQUMsQ0FBQyxLQUFGLENBQVEsVUFBUixFQUFvQixJQUFDLENBQUEsT0FBckI7VUFDTixJQUFnRCxnQkFBaEQ7WUFBQSxHQUFHLENBQUMsU0FBSixHQUFnQixJQUFDLENBQUEsT0FBTyxDQUFDLGlCQUFULENBQUEsRUFBaEI7O0FBQ0EsaUJBQU8sSUFIVDs7QUFERjtBQU1BLGFBQU87SUFURjs7Ozs7QUFKVCIsInNvdXJjZXNDb250ZW50IjpbIlxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ29sb3JQYXJzZXJcbiAgY29uc3RydWN0b3I6IChAcmVnaXN0cnksIEBjb250ZXh0KSAtPlxuXG4gIHBhcnNlOiAoZXhwcmVzc2lvbiwgc2NvcGU9JyonLCBjb2xsZWN0VmFyaWFibGVzPXRydWUpIC0+XG4gICAgcmV0dXJuIHVuZGVmaW5lZCBpZiBub3QgZXhwcmVzc2lvbj8gb3IgZXhwcmVzc2lvbiBpcyAnJ1xuXG4gICAgZm9yIGUgaW4gQHJlZ2lzdHJ5LmdldEV4cHJlc3Npb25zRm9yU2NvcGUoc2NvcGUpXG4gICAgICBpZiBlLm1hdGNoKGV4cHJlc3Npb24pXG4gICAgICAgIHJlcyA9IGUucGFyc2UoZXhwcmVzc2lvbiwgQGNvbnRleHQpXG4gICAgICAgIHJlcy52YXJpYWJsZXMgPSBAY29udGV4dC5yZWFkVXNlZFZhcmlhYmxlcygpIGlmIGNvbGxlY3RWYXJpYWJsZXNcbiAgICAgICAgcmV0dXJuIHJlc1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuIl19
