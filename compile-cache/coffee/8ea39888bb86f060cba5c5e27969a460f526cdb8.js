(function() {
  var VariableExpression;

  module.exports = VariableExpression = (function() {
    VariableExpression.DEFAULT_HANDLE = function(match, solver) {
      var _, end, name, start, value;
      _ = match[0], name = match[1], value = match[2];
      start = _.indexOf(name);
      end = _.indexOf(value) + value.length;
      solver.appendResult(name, value, start, end);
      return solver.endParsing(end);
    };

    function VariableExpression(arg) {
      this.name = arg.name, this.regexpString = arg.regexpString, this.scopes = arg.scopes, this.priority = arg.priority, this.handle = arg.handle;
      this.regexp = new RegExp("" + this.regexpString, 'm');
      if (this.handle == null) {
        this.handle = this.constructor.DEFAULT_HANDLE;
      }
    }

    VariableExpression.prototype.match = function(expression) {
      return this.regexp.test(expression);
    };

    VariableExpression.prototype.parse = function(expression) {
      var lastIndex, match, matchText, parsingAborted, results, solver, startIndex;
      parsingAborted = false;
      results = [];
      match = this.regexp.exec(expression);
      if (match != null) {
        matchText = match[0];
        lastIndex = this.regexp.lastIndex;
        startIndex = lastIndex - matchText.length;
        solver = {
          endParsing: function(end) {
            var start;
            start = expression.indexOf(matchText);
            results.lastIndex = end;
            results.range = [start, end];
            return results.match = matchText.slice(start, end);
          },
          abortParsing: function() {
            return parsingAborted = true;
          },
          appendResult: function(name, value, start, end, arg) {
            var isAlternate, isDefault, noNamePrefix, range, reName, ref;
            ref = arg != null ? arg : {}, isAlternate = ref.isAlternate, noNamePrefix = ref.noNamePrefix, isDefault = ref.isDefault;
            range = [start, end];
            reName = name.replace('$', '\\$');
            if (!RegExp(reName + "(?![-_])").test(value)) {
              return results.push({
                name: name,
                value: value,
                range: range,
                isAlternate: isAlternate,
                noNamePrefix: noNamePrefix,
                "default": isDefault
              });
            }
          }
        };
        this.handle(match, solver);
      }
      if (parsingAborted) {
        return void 0;
      } else {
        return results;
      }
    };

    return VariableExpression;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi92YXJpYWJsZS1leHByZXNzaW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNKLGtCQUFDLENBQUEsY0FBRCxHQUFpQixTQUFDLEtBQUQsRUFBUSxNQUFSO0FBQ2YsVUFBQTtNQUFDLFlBQUQsRUFBSSxlQUFKLEVBQVU7TUFDVixLQUFBLEdBQVEsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFWO01BQ1IsR0FBQSxHQUFNLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBVixDQUFBLEdBQW1CLEtBQUssQ0FBQztNQUMvQixNQUFNLENBQUMsWUFBUCxDQUFvQixJQUFwQixFQUEwQixLQUExQixFQUFpQyxLQUFqQyxFQUF3QyxHQUF4QzthQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEdBQWxCO0lBTGU7O0lBT0osNEJBQUMsR0FBRDtNQUFFLElBQUMsQ0FBQSxXQUFBLE1BQU0sSUFBQyxDQUFBLG1CQUFBLGNBQWMsSUFBQyxDQUFBLGFBQUEsUUFBUSxJQUFDLENBQUEsZUFBQSxVQUFVLElBQUMsQ0FBQSxhQUFBO01BQ3hELElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxNQUFBLENBQU8sRUFBQSxHQUFHLElBQUMsQ0FBQSxZQUFYLEVBQTJCLEdBQTNCOztRQUNkLElBQUMsQ0FBQSxTQUFVLElBQUMsQ0FBQSxXQUFXLENBQUM7O0lBRmI7O2lDQUliLEtBQUEsR0FBTyxTQUFDLFVBQUQ7YUFBZ0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsVUFBYjtJQUFoQjs7aUNBRVAsS0FBQSxHQUFPLFNBQUMsVUFBRDtBQUNMLFVBQUE7TUFBQSxjQUFBLEdBQWlCO01BQ2pCLE9BQUEsR0FBVTtNQUVWLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxVQUFiO01BQ1IsSUFBRyxhQUFIO1FBRUcsWUFBYTtRQUNiLFlBQWEsSUFBQyxDQUFBO1FBQ2YsVUFBQSxHQUFhLFNBQUEsR0FBWSxTQUFTLENBQUM7UUFFbkMsTUFBQSxHQUNFO1VBQUEsVUFBQSxFQUFZLFNBQUMsR0FBRDtBQUNWLGdCQUFBO1lBQUEsS0FBQSxHQUFRLFVBQVUsQ0FBQyxPQUFYLENBQW1CLFNBQW5CO1lBQ1IsT0FBTyxDQUFDLFNBQVIsR0FBb0I7WUFDcEIsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsQ0FBQyxLQUFELEVBQU8sR0FBUDttQkFDaEIsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsU0FBVTtVQUpoQixDQUFaO1VBS0EsWUFBQSxFQUFjLFNBQUE7bUJBQ1osY0FBQSxHQUFpQjtVQURMLENBTGQ7VUFPQSxZQUFBLEVBQWMsU0FBQyxJQUFELEVBQU8sS0FBUCxFQUFjLEtBQWQsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUI7QUFDWixnQkFBQTtnQ0FEc0MsTUFBdUMsSUFBdEMsK0JBQWEsaUNBQWM7WUFDbEUsS0FBQSxHQUFRLENBQUMsS0FBRCxFQUFRLEdBQVI7WUFDUixNQUFBLEdBQVMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxHQUFiLEVBQWtCLEtBQWxCO1lBQ1QsSUFBQSxDQUFPLE1BQUEsQ0FBSyxNQUFELEdBQVEsVUFBWixDQUF1QixDQUFDLElBQXhCLENBQTZCLEtBQTdCLENBQVA7cUJBQ0UsT0FBTyxDQUFDLElBQVIsQ0FBYTtnQkFDWCxNQUFBLElBRFc7Z0JBQ0wsT0FBQSxLQURLO2dCQUNFLE9BQUEsS0FERjtnQkFDUyxhQUFBLFdBRFQ7Z0JBQ3NCLGNBQUEsWUFEdEI7Z0JBRVgsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUZFO2VBQWIsRUFERjs7VUFIWSxDQVBkOztRQWdCRixJQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsRUFBZSxNQUFmLEVBdkJGOztNQXlCQSxJQUFHLGNBQUg7ZUFBdUIsT0FBdkI7T0FBQSxNQUFBO2VBQXNDLFFBQXRDOztJQTlCSzs7Ozs7QUFmVCIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFZhcmlhYmxlRXhwcmVzc2lvblxuICBAREVGQVVMVF9IQU5ETEU6IChtYXRjaCwgc29sdmVyKSAtPlxuICAgIFtfLCBuYW1lLCB2YWx1ZV0gPSBtYXRjaFxuICAgIHN0YXJ0ID0gXy5pbmRleE9mKG5hbWUpXG4gICAgZW5kID0gXy5pbmRleE9mKHZhbHVlKSArIHZhbHVlLmxlbmd0aFxuICAgIHNvbHZlci5hcHBlbmRSZXN1bHQobmFtZSwgdmFsdWUsIHN0YXJ0LCBlbmQpXG4gICAgc29sdmVyLmVuZFBhcnNpbmcoZW5kKVxuXG4gIGNvbnN0cnVjdG9yOiAoe0BuYW1lLCBAcmVnZXhwU3RyaW5nLCBAc2NvcGVzLCBAcHJpb3JpdHksIEBoYW5kbGV9KSAtPlxuICAgIEByZWdleHAgPSBuZXcgUmVnRXhwKFwiI3tAcmVnZXhwU3RyaW5nfVwiLCAnbScpXG4gICAgQGhhbmRsZSA/PSBAY29uc3RydWN0b3IuREVGQVVMVF9IQU5ETEVcblxuICBtYXRjaDogKGV4cHJlc3Npb24pIC0+IEByZWdleHAudGVzdCBleHByZXNzaW9uXG5cbiAgcGFyc2U6IChleHByZXNzaW9uKSAtPlxuICAgIHBhcnNpbmdBYm9ydGVkID0gZmFsc2VcbiAgICByZXN1bHRzID0gW11cblxuICAgIG1hdGNoID0gQHJlZ2V4cC5leGVjKGV4cHJlc3Npb24pXG4gICAgaWYgbWF0Y2g/XG5cbiAgICAgIFttYXRjaFRleHRdID0gbWF0Y2hcbiAgICAgIHtsYXN0SW5kZXh9ID0gQHJlZ2V4cFxuICAgICAgc3RhcnRJbmRleCA9IGxhc3RJbmRleCAtIG1hdGNoVGV4dC5sZW5ndGhcblxuICAgICAgc29sdmVyID1cbiAgICAgICAgZW5kUGFyc2luZzogKGVuZCkgLT5cbiAgICAgICAgICBzdGFydCA9IGV4cHJlc3Npb24uaW5kZXhPZihtYXRjaFRleHQpXG4gICAgICAgICAgcmVzdWx0cy5sYXN0SW5kZXggPSBlbmRcbiAgICAgICAgICByZXN1bHRzLnJhbmdlID0gW3N0YXJ0LGVuZF1cbiAgICAgICAgICByZXN1bHRzLm1hdGNoID0gbWF0Y2hUZXh0W3N0YXJ0Li4uZW5kXVxuICAgICAgICBhYm9ydFBhcnNpbmc6IC0+XG4gICAgICAgICAgcGFyc2luZ0Fib3J0ZWQgPSB0cnVlXG4gICAgICAgIGFwcGVuZFJlc3VsdDogKG5hbWUsIHZhbHVlLCBzdGFydCwgZW5kLCB7aXNBbHRlcm5hdGUsIG5vTmFtZVByZWZpeCwgaXNEZWZhdWx0fT17fSkgLT5cbiAgICAgICAgICByYW5nZSA9IFtzdGFydCwgZW5kXVxuICAgICAgICAgIHJlTmFtZSA9IG5hbWUucmVwbGFjZSgnJCcsICdcXFxcJCcpXG4gICAgICAgICAgdW5sZXNzIC8vLyN7cmVOYW1lfSg/IVstX10pLy8vLnRlc3QodmFsdWUpXG4gICAgICAgICAgICByZXN1bHRzLnB1c2gge1xuICAgICAgICAgICAgICBuYW1lLCB2YWx1ZSwgcmFuZ2UsIGlzQWx0ZXJuYXRlLCBub05hbWVQcmVmaXhcbiAgICAgICAgICAgICAgZGVmYXVsdDogaXNEZWZhdWx0XG4gICAgICAgICAgICB9XG5cbiAgICAgIEBoYW5kbGUobWF0Y2gsIHNvbHZlcilcblxuICAgIGlmIHBhcnNpbmdBYm9ydGVkIHRoZW4gdW5kZWZpbmVkIGVsc2UgcmVzdWx0c1xuIl19
