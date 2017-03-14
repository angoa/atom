(function() {
  var decimal, float, int, namePrefixes, percent, variables;

  int = '\\d+';

  decimal = "\\." + int;

  float = "(?:" + int + decimal + "|" + int + "|" + decimal + ")";

  percent = float + "%";

  variables = '(?:@[a-zA-Z0-9\\-_]+|\\$[a-zA-Z0-9\\-_]+|[a-zA-Z_][a-zA-Z0-9\\-_]*)';

  namePrefixes = '^| |\\t|:|=|,|\\n|\'|"|\\(|\\[|\\{|>';

  module.exports = {
    int: int,
    float: float,
    percent: percent,
    optionalPercent: float + "%?",
    intOrPercent: "(?:" + percent + "|" + int + ")",
    floatOrPercent: "(?:" + percent + "|" + float + ")",
    comma: '\\s*,\\s*',
    notQuote: "[^\"'\\n\\r]+",
    hexadecimal: '[\\da-fA-F]',
    ps: '\\(\\s*',
    pe: '\\s*\\)',
    variables: variables,
    namePrefixes: namePrefixes,
    createVariableRegExpString: function(variables) {
      var i, j, len, len1, res, v, variableNamesWithPrefix, variableNamesWithoutPrefix, withPrefixes, withoutPrefixes;
      variableNamesWithPrefix = [];
      variableNamesWithoutPrefix = [];
      withPrefixes = variables.filter(function(v) {
        return !v.noNamePrefix;
      });
      withoutPrefixes = variables.filter(function(v) {
        return v.noNamePrefix;
      });
      res = [];
      if (withPrefixes.length > 0) {
        for (i = 0, len = withPrefixes.length; i < len; i++) {
          v = withPrefixes[i];
          variableNamesWithPrefix.push(v.name.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
        }
        res.push("((?:" + namePrefixes + ")(" + (variableNamesWithPrefix.join('|')) + ")(\\s+!default)?(?!_|-|\\w|\\d|[ \\t]*[\\.:=]))");
      }
      if (withoutPrefixes.length > 0) {
        for (j = 0, len1 = withoutPrefixes.length; j < len1; j++) {
          v = withoutPrefixes[j];
          variableNamesWithoutPrefix.push(v.name.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
        }
        res.push("(" + (variableNamesWithoutPrefix.join('|')) + ")");
      }
      return res.join('|');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9yZWdleGVzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNOztFQUNOLE9BQUEsR0FBVSxLQUFBLEdBQU07O0VBQ2hCLEtBQUEsR0FBUSxLQUFBLEdBQU0sR0FBTixHQUFZLE9BQVosR0FBb0IsR0FBcEIsR0FBdUIsR0FBdkIsR0FBMkIsR0FBM0IsR0FBOEIsT0FBOUIsR0FBc0M7O0VBQzlDLE9BQUEsR0FBYSxLQUFELEdBQU87O0VBQ25CLFNBQUEsR0FBWTs7RUFDWixZQUFBLEdBQWU7O0VBRWYsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLEdBQUEsRUFBSyxHQUFMO0lBQ0EsS0FBQSxFQUFPLEtBRFA7SUFFQSxPQUFBLEVBQVMsT0FGVDtJQUdBLGVBQUEsRUFBb0IsS0FBRCxHQUFPLElBSDFCO0lBSUEsWUFBQSxFQUFjLEtBQUEsR0FBTSxPQUFOLEdBQWMsR0FBZCxHQUFpQixHQUFqQixHQUFxQixHQUpuQztJQUtBLGNBQUEsRUFBZ0IsS0FBQSxHQUFNLE9BQU4sR0FBYyxHQUFkLEdBQWlCLEtBQWpCLEdBQXVCLEdBTHZDO0lBTUEsS0FBQSxFQUFPLFdBTlA7SUFPQSxRQUFBLEVBQVUsZUFQVjtJQVFBLFdBQUEsRUFBYSxhQVJiO0lBU0EsRUFBQSxFQUFJLFNBVEo7SUFVQSxFQUFBLEVBQUksU0FWSjtJQVdBLFNBQUEsRUFBVyxTQVhYO0lBWUEsWUFBQSxFQUFjLFlBWmQ7SUFhQSwwQkFBQSxFQUE0QixTQUFDLFNBQUQ7QUFDMUIsVUFBQTtNQUFBLHVCQUFBLEdBQTBCO01BQzFCLDBCQUFBLEdBQTZCO01BQzdCLFlBQUEsR0FBZSxTQUFTLENBQUMsTUFBVixDQUFpQixTQUFDLENBQUQ7ZUFBTyxDQUFJLENBQUMsQ0FBQztNQUFiLENBQWpCO01BQ2YsZUFBQSxHQUFrQixTQUFTLENBQUMsTUFBVixDQUFpQixTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUM7TUFBVCxDQUFqQjtNQUVsQixHQUFBLEdBQU07TUFFTixJQUFHLFlBQVksQ0FBQyxNQUFiLEdBQXNCLENBQXpCO0FBQ0UsYUFBQSw4Q0FBQTs7VUFDRSx1QkFBdUIsQ0FBQyxJQUF4QixDQUE2QixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQVAsQ0FBZSxvQ0FBZixFQUFxRCxNQUFyRCxDQUE3QjtBQURGO1FBR0EsR0FBRyxDQUFDLElBQUosQ0FBUyxNQUFBLEdBQU8sWUFBUCxHQUFvQixJQUFwQixHQUF1QixDQUFDLHVCQUF1QixDQUFDLElBQXhCLENBQTZCLEdBQTdCLENBQUQsQ0FBdkIsR0FBMEQsaURBQW5FLEVBSkY7O01BTUEsSUFBRyxlQUFlLENBQUMsTUFBaEIsR0FBeUIsQ0FBNUI7QUFDRSxhQUFBLG1EQUFBOztVQUNFLDBCQUEwQixDQUFDLElBQTNCLENBQWdDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBUCxDQUFlLG9DQUFmLEVBQXFELE1BQXJELENBQWhDO0FBREY7UUFHQSxHQUFHLENBQUMsSUFBSixDQUFTLEdBQUEsR0FBRyxDQUFDLDBCQUEwQixDQUFDLElBQTNCLENBQWdDLEdBQWhDLENBQUQsQ0FBSCxHQUF5QyxHQUFsRCxFQUpGOzthQU1BLEdBQUcsQ0FBQyxJQUFKLENBQVMsR0FBVDtJQXBCMEIsQ0FiNUI7O0FBUkYiLCJzb3VyY2VzQ29udGVudCI6WyJpbnQgPSAnXFxcXGQrJ1xuZGVjaW1hbCA9IFwiXFxcXC4je2ludH1cIlxuZmxvYXQgPSBcIig/OiN7aW50fSN7ZGVjaW1hbH18I3tpbnR9fCN7ZGVjaW1hbH0pXCJcbnBlcmNlbnQgPSBcIiN7ZmxvYXR9JVwiXG52YXJpYWJsZXMgPSAnKD86QFthLXpBLVowLTlcXFxcLV9dK3xcXFxcJFthLXpBLVowLTlcXFxcLV9dK3xbYS16QS1aX11bYS16QS1aMC05XFxcXC1fXSopJ1xubmFtZVByZWZpeGVzID0gJ158IHxcXFxcdHw6fD18LHxcXFxcbnxcXCd8XCJ8XFxcXCh8XFxcXFt8XFxcXHt8PidcblxubW9kdWxlLmV4cG9ydHMgPVxuICBpbnQ6IGludFxuICBmbG9hdDogZmxvYXRcbiAgcGVyY2VudDogcGVyY2VudFxuICBvcHRpb25hbFBlcmNlbnQ6IFwiI3tmbG9hdH0lP1wiXG4gIGludE9yUGVyY2VudDogXCIoPzoje3BlcmNlbnR9fCN7aW50fSlcIlxuICBmbG9hdE9yUGVyY2VudDogXCIoPzoje3BlcmNlbnR9fCN7ZmxvYXR9KVwiXG4gIGNvbW1hOiAnXFxcXHMqLFxcXFxzKidcbiAgbm90UXVvdGU6IFwiW15cXFwiJ1xcXFxuXFxcXHJdK1wiXG4gIGhleGFkZWNpbWFsOiAnW1xcXFxkYS1mQS1GXSdcbiAgcHM6ICdcXFxcKFxcXFxzKidcbiAgcGU6ICdcXFxccypcXFxcKSdcbiAgdmFyaWFibGVzOiB2YXJpYWJsZXNcbiAgbmFtZVByZWZpeGVzOiBuYW1lUHJlZml4ZXNcbiAgY3JlYXRlVmFyaWFibGVSZWdFeHBTdHJpbmc6ICh2YXJpYWJsZXMpIC0+XG4gICAgdmFyaWFibGVOYW1lc1dpdGhQcmVmaXggPSBbXVxuICAgIHZhcmlhYmxlTmFtZXNXaXRob3V0UHJlZml4ID0gW11cbiAgICB3aXRoUHJlZml4ZXMgPSB2YXJpYWJsZXMuZmlsdGVyICh2KSAtPiBub3Qgdi5ub05hbWVQcmVmaXhcbiAgICB3aXRob3V0UHJlZml4ZXMgPSB2YXJpYWJsZXMuZmlsdGVyICh2KSAtPiB2Lm5vTmFtZVByZWZpeFxuXG4gICAgcmVzID0gW11cblxuICAgIGlmIHdpdGhQcmVmaXhlcy5sZW5ndGggPiAwXG4gICAgICBmb3IgdiBpbiB3aXRoUHJlZml4ZXNcbiAgICAgICAgdmFyaWFibGVOYW1lc1dpdGhQcmVmaXgucHVzaCB2Lm5hbWUucmVwbGFjZSgvWy1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKVxuXG4gICAgICByZXMucHVzaCBcIigoPzoje25hbWVQcmVmaXhlc30pKCN7dmFyaWFibGVOYW1lc1dpdGhQcmVmaXguam9pbignfCcpfSkoXFxcXHMrIWRlZmF1bHQpPyg/IV98LXxcXFxcd3xcXFxcZHxbIFxcXFx0XSpbXFxcXC46PV0pKVwiXG5cbiAgICBpZiB3aXRob3V0UHJlZml4ZXMubGVuZ3RoID4gMFxuICAgICAgZm9yIHYgaW4gd2l0aG91dFByZWZpeGVzXG4gICAgICAgIHZhcmlhYmxlTmFtZXNXaXRob3V0UHJlZml4LnB1c2ggdi5uYW1lLnJlcGxhY2UoL1stXFxbXFxdXFwvXFx7XFx9XFwoXFwpXFwqXFwrXFw/XFwuXFxcXFxcXlxcJFxcfF0vZywgXCJcXFxcJCZcIilcblxuICAgICAgcmVzLnB1c2ggXCIoI3t2YXJpYWJsZU5hbWVzV2l0aG91dFByZWZpeC5qb2luKCd8Jyl9KVwiXG5cbiAgICByZXMuam9pbignfCcpXG4iXX0=
