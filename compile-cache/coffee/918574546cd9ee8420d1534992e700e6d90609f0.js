(function() {
  var ExpressionsRegistry, VariableExpression, registry, sass_handler;

  ExpressionsRegistry = require('./expressions-registry');

  VariableExpression = require('./variable-expression');

  module.exports = registry = new ExpressionsRegistry(VariableExpression);

  registry.createExpression('pigments:less', '^[ \\t]*(@[a-zA-Z0-9\\-_]+)\\s*:\\s*([^;\\n\\r]+);?', ['less']);

  registry.createExpression('pigments:scss_params', '^[ \\t]*@(mixin|include|function)\\s+[a-zA-Z0-9\\-_]+\\s*\\([^\\)]+\\)', ['scss', 'sass', 'haml'], function(match, solver) {
    match = match[0];
    return solver.endParsing(match.length - 1);
  });

  sass_handler = function(match, solver) {
    var all_hyphen, all_underscore;
    solver.appendResult(match[1], match[2], 0, match[0].length, {
      isDefault: match[3] != null
    });
    if (match[1].match(/[-_]/)) {
      all_underscore = match[1].replace(/-/g, '_');
      all_hyphen = match[1].replace(/_/g, '-');
      if (match[1] !== all_underscore) {
        solver.appendResult(all_underscore, match[2], 0, match[0].length, {
          isAlternate: true,
          isDefault: match[3] != null
        });
      }
      if (match[1] !== all_hyphen) {
        solver.appendResult(all_hyphen, match[2], 0, match[0].length, {
          isAlternate: true,
          isDefault: match[3] != null
        });
      }
    }
    return solver.endParsing(match[0].length);
  };

  registry.createExpression('pigments:scss', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*(.*?)(\\s*!default)?\\s*;', ['scss', 'haml'], sass_handler);

  registry.createExpression('pigments:sass', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*([^\\{]*?)(\\s*!default)?\\s*(?:$|\\/)', ['sass', 'haml'], sass_handler);

  registry.createExpression('pigments:css_vars', '(--[^\\s:]+):\\s*([^\\n;]+);', ['css'], function(match, solver) {
    solver.appendResult("var(" + match[1] + ")", match[2], 0, match[0].length);
    return solver.endParsing(match[0].length);
  });

  registry.createExpression('pigments:stylus_hash', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=\\s*\\{([^=]*)\\}', ['styl', 'stylus'], function(match, solver) {
    var buffer, char, commaSensitiveBegin, commaSensitiveEnd, content, current, i, inCommaSensitiveContext, key, len, name, ref, ref1, scope, scopeBegin, scopeEnd, value;
    buffer = '';
    ref = match, match = ref[0], name = ref[1], content = ref[2];
    current = match.indexOf(content);
    scope = [name];
    scopeBegin = /\{/;
    scopeEnd = /\}/;
    commaSensitiveBegin = /\(|\[/;
    commaSensitiveEnd = /\)|\]/;
    inCommaSensitiveContext = false;
    for (i = 0, len = content.length; i < len; i++) {
      char = content[i];
      if (scopeBegin.test(char)) {
        scope.push(buffer.replace(/[\s:]/g, ''));
        buffer = '';
      } else if (scopeEnd.test(char)) {
        scope.pop();
        if (scope.length === 0) {
          return solver.endParsing(current);
        }
      } else if (commaSensitiveBegin.test(char)) {
        buffer += char;
        inCommaSensitiveContext = true;
      } else if (inCommaSensitiveContext) {
        buffer += char;
        inCommaSensitiveContext = !commaSensitiveEnd.test(char);
      } else if (/[,\n]/.test(char)) {
        buffer = buffer.replace(/\s+/g, '');
        if (buffer.length) {
          ref1 = buffer.split(/\s*:\s*/), key = ref1[0], value = ref1[1];
          solver.appendResult(scope.concat(key).join('.'), value, current - buffer.length - 1, current);
        }
        buffer = '';
      } else {
        buffer += char;
      }
      current++;
    }
    scope.pop();
    if (scope.length === 0) {
      return solver.endParsing(current + 1);
    } else {
      return solver.abortParsing();
    }
  });

  registry.createExpression('pigments:stylus', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=(?!=)\\s*([^\\n\\r;]*);?$', ['styl', 'stylus']);

  registry.createExpression('pigments:latex', '\\\\definecolor(\\{[^\\}]+\\})\\{([^\\}]+)\\}\\{([^\\}]+)\\}', ['tex'], function(match, solver) {
    var _, mode, name, value, values;
    _ = match[0], name = match[1], mode = match[2], value = match[3];
    value = (function() {
      switch (mode) {
        case 'RGB':
          return "rgb(" + value + ")";
        case 'gray':
          return "gray(" + (Math.round(parseFloat(value) * 100)) + "%)";
        case 'rgb':
          values = value.split(',').map(function(n) {
            return Math.floor(n * 255);
          });
          return "rgb(" + (values.join(',')) + ")";
        case 'cmyk':
          return "cmyk(" + value + ")";
        case 'HTML':
          return "#" + value;
        default:
          return value;
      }
    })();
    solver.appendResult(name, value, 0, _.length, {
      noNamePrefix: true
    });
    return solver.endParsing(_.length);
  });

  registry.createExpression('pigments:latex_mix', '\\\\definecolor(\\{[^\\}]+\\})(\\{[^\\}\\n!]+[!][^\\}\\n]+\\})', ['tex'], function(match, solver) {
    var _, name, value;
    _ = match[0], name = match[1], value = match[2];
    solver.appendResult(name, value, 0, _.length, {
      noNamePrefix: true
    });
    return solver.endParsing(_.length);
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi92YXJpYWJsZS1leHByZXNzaW9ucy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx3QkFBUjs7RUFDdEIsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHVCQUFSOztFQUVyQixNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFBLEdBQWUsSUFBQSxtQkFBQSxDQUFvQixrQkFBcEI7O0VBRWhDLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixlQUExQixFQUEyQyxxREFBM0MsRUFBa0csQ0FBQyxNQUFELENBQWxHOztFQUdBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixzQkFBMUIsRUFBa0Qsd0VBQWxELEVBQTRILENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsQ0FBNUgsRUFBc0osU0FBQyxLQUFELEVBQVEsTUFBUjtJQUNuSixRQUFTO1dBQ1YsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFqQztFQUZvSixDQUF0Sjs7RUFJQSxZQUFBLEdBQWUsU0FBQyxLQUFELEVBQVEsTUFBUjtBQUNiLFFBQUE7SUFBQSxNQUFNLENBQUMsWUFBUCxDQUFvQixLQUFNLENBQUEsQ0FBQSxDQUExQixFQUE4QixLQUFNLENBQUEsQ0FBQSxDQUFwQyxFQUF3QyxDQUF4QyxFQUEyQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBcEQsRUFBNEQ7TUFBQSxTQUFBLEVBQVcsZ0JBQVg7S0FBNUQ7SUFFQSxJQUFHLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFULENBQWUsTUFBZixDQUFIO01BQ0UsY0FBQSxHQUFpQixLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBVCxDQUFpQixJQUFqQixFQUF1QixHQUF2QjtNQUNqQixVQUFBLEdBQWEsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVQsQ0FBaUIsSUFBakIsRUFBdUIsR0FBdkI7TUFFYixJQUFHLEtBQU0sQ0FBQSxDQUFBLENBQU4sS0FBYyxjQUFqQjtRQUNFLE1BQU0sQ0FBQyxZQUFQLENBQW9CLGNBQXBCLEVBQW9DLEtBQU0sQ0FBQSxDQUFBLENBQTFDLEVBQThDLENBQTlDLEVBQWlELEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUExRCxFQUFrRTtVQUFBLFdBQUEsRUFBYSxJQUFiO1VBQW1CLFNBQUEsRUFBVyxnQkFBOUI7U0FBbEUsRUFERjs7TUFFQSxJQUFHLEtBQU0sQ0FBQSxDQUFBLENBQU4sS0FBYyxVQUFqQjtRQUNFLE1BQU0sQ0FBQyxZQUFQLENBQW9CLFVBQXBCLEVBQWdDLEtBQU0sQ0FBQSxDQUFBLENBQXRDLEVBQTBDLENBQTFDLEVBQTZDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUF0RCxFQUE4RDtVQUFBLFdBQUEsRUFBYSxJQUFiO1VBQW1CLFNBQUEsRUFBVyxnQkFBOUI7U0FBOUQsRUFERjtPQU5GOztXQVNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUEzQjtFQVphOztFQWNmLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixlQUExQixFQUEyQyxpRUFBM0MsRUFBOEcsQ0FBQyxNQUFELEVBQVMsTUFBVCxDQUE5RyxFQUFnSSxZQUFoSTs7RUFFQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsZUFBMUIsRUFBMkMsOEVBQTNDLEVBQTJILENBQUMsTUFBRCxFQUFTLE1BQVQsQ0FBM0gsRUFBNkksWUFBN0k7O0VBRUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLG1CQUExQixFQUErQyw4QkFBL0MsRUFBK0UsQ0FBQyxLQUFELENBQS9FLEVBQXdGLFNBQUMsS0FBRCxFQUFRLE1BQVI7SUFDdEYsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsTUFBQSxHQUFPLEtBQU0sQ0FBQSxDQUFBLENBQWIsR0FBZ0IsR0FBcEMsRUFBd0MsS0FBTSxDQUFBLENBQUEsQ0FBOUMsRUFBa0QsQ0FBbEQsRUFBcUQsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQTlEO1dBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQTNCO0VBRnNGLENBQXhGOztFQUlBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixzQkFBMUIsRUFBa0QsNERBQWxELEVBQWdILENBQUMsTUFBRCxFQUFTLFFBQVQsQ0FBaEgsRUFBb0ksU0FBQyxLQUFELEVBQVEsTUFBUjtBQUNsSSxRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsTUFBeUIsS0FBekIsRUFBQyxjQUFELEVBQVEsYUFBUixFQUFjO0lBQ2QsT0FBQSxHQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsT0FBZDtJQUNWLEtBQUEsR0FBUSxDQUFDLElBQUQ7SUFDUixVQUFBLEdBQWE7SUFDYixRQUFBLEdBQVc7SUFDWCxtQkFBQSxHQUFzQjtJQUN0QixpQkFBQSxHQUFvQjtJQUNwQix1QkFBQSxHQUEwQjtBQUMxQixTQUFBLHlDQUFBOztNQUNFLElBQUcsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsSUFBaEIsQ0FBSDtRQUNFLEtBQUssQ0FBQyxJQUFOLENBQVcsTUFBTSxDQUFDLE9BQVAsQ0FBZSxRQUFmLEVBQXlCLEVBQXpCLENBQVg7UUFDQSxNQUFBLEdBQVMsR0FGWDtPQUFBLE1BR0ssSUFBRyxRQUFRLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBSDtRQUNILEtBQUssQ0FBQyxHQUFOLENBQUE7UUFDQSxJQUFxQyxLQUFLLENBQUMsTUFBTixLQUFnQixDQUFyRDtBQUFBLGlCQUFPLE1BQU0sQ0FBQyxVQUFQLENBQWtCLE9BQWxCLEVBQVA7U0FGRztPQUFBLE1BR0EsSUFBRyxtQkFBbUIsQ0FBQyxJQUFwQixDQUF5QixJQUF6QixDQUFIO1FBQ0gsTUFBQSxJQUFVO1FBQ1YsdUJBQUEsR0FBMEIsS0FGdkI7T0FBQSxNQUdBLElBQUcsdUJBQUg7UUFDSCxNQUFBLElBQVU7UUFDVix1QkFBQSxHQUEwQixDQUFDLGlCQUFpQixDQUFDLElBQWxCLENBQXVCLElBQXZCLEVBRnhCO09BQUEsTUFHQSxJQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBYixDQUFIO1FBQ0gsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUFQLENBQWUsTUFBZixFQUF1QixFQUF2QjtRQUNULElBQUcsTUFBTSxDQUFDLE1BQVY7VUFDRSxPQUFlLE1BQU0sQ0FBQyxLQUFQLENBQWEsU0FBYixDQUFmLEVBQUMsYUFBRCxFQUFNO1VBRU4sTUFBTSxDQUFDLFlBQVAsQ0FBb0IsS0FBSyxDQUFDLE1BQU4sQ0FBYSxHQUFiLENBQWlCLENBQUMsSUFBbEIsQ0FBdUIsR0FBdkIsQ0FBcEIsRUFBaUQsS0FBakQsRUFBd0QsT0FBQSxHQUFVLE1BQU0sQ0FBQyxNQUFqQixHQUEwQixDQUFsRixFQUFxRixPQUFyRixFQUhGOztRQUtBLE1BQUEsR0FBUyxHQVBOO09BQUEsTUFBQTtRQVNILE1BQUEsSUFBVSxLQVRQOztNQVdMLE9BQUE7QUF4QkY7SUEwQkEsS0FBSyxDQUFDLEdBQU4sQ0FBQTtJQUNBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7YUFDRSxNQUFNLENBQUMsVUFBUCxDQUFrQixPQUFBLEdBQVUsQ0FBNUIsRUFERjtLQUFBLE1BQUE7YUFHRSxNQUFNLENBQUMsWUFBUCxDQUFBLEVBSEY7O0VBckNrSSxDQUFwSTs7RUEwQ0EsUUFBUSxDQUFDLGdCQUFULENBQTBCLGlCQUExQixFQUE2QyxvRUFBN0MsRUFBbUgsQ0FBQyxNQUFELEVBQVMsUUFBVCxDQUFuSDs7RUFFQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsZ0JBQTFCLEVBQTRDLDhEQUE1QyxFQUE0RyxDQUFDLEtBQUQsQ0FBNUcsRUFBcUgsU0FBQyxLQUFELEVBQVEsTUFBUjtBQUNuSCxRQUFBO0lBQUMsWUFBRCxFQUFJLGVBQUosRUFBVSxlQUFWLEVBQWdCO0lBRWhCLEtBQUE7QUFBUSxjQUFPLElBQVA7QUFBQSxhQUNELEtBREM7aUJBQ1UsTUFBQSxHQUFPLEtBQVAsR0FBYTtBQUR2QixhQUVELE1BRkM7aUJBRVcsT0FBQSxHQUFPLENBQUMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxVQUFBLENBQVcsS0FBWCxDQUFBLEdBQW9CLEdBQS9CLENBQUQsQ0FBUCxHQUE0QztBQUZ2RCxhQUdELEtBSEM7VUFJSixNQUFBLEdBQVMsS0FBSyxDQUFDLEtBQU4sQ0FBWSxHQUFaLENBQWdCLENBQUMsR0FBakIsQ0FBcUIsU0FBQyxDQUFEO21CQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQSxHQUFJLEdBQWY7VUFBUCxDQUFyQjtpQkFDVCxNQUFBLEdBQU0sQ0FBQyxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVosQ0FBRCxDQUFOLEdBQXdCO0FBTHBCLGFBTUQsTUFOQztpQkFNVyxPQUFBLEdBQVEsS0FBUixHQUFjO0FBTnpCLGFBT0QsTUFQQztpQkFPVyxHQUFBLEdBQUk7QUFQZjtpQkFRRDtBQVJDOztJQVVSLE1BQU0sQ0FBQyxZQUFQLENBQW9CLElBQXBCLEVBQTBCLEtBQTFCLEVBQWlDLENBQWpDLEVBQW9DLENBQUMsQ0FBQyxNQUF0QyxFQUE4QztNQUFBLFlBQUEsRUFBYyxJQUFkO0tBQTlDO1dBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsQ0FBQyxDQUFDLE1BQXBCO0VBZG1ILENBQXJIOztFQWdCQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsb0JBQTFCLEVBQWdELGdFQUFoRCxFQUFrSCxDQUFDLEtBQUQsQ0FBbEgsRUFBMkgsU0FBQyxLQUFELEVBQVEsTUFBUjtBQUN6SCxRQUFBO0lBQUMsWUFBRCxFQUFJLGVBQUosRUFBVTtJQUVWLE1BQU0sQ0FBQyxZQUFQLENBQW9CLElBQXBCLEVBQTBCLEtBQTFCLEVBQWlDLENBQWpDLEVBQW9DLENBQUMsQ0FBQyxNQUF0QyxFQUE4QztNQUFBLFlBQUEsRUFBYyxJQUFkO0tBQTlDO1dBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsQ0FBQyxDQUFDLE1BQXBCO0VBSnlILENBQTNIO0FBOUZBIiwic291cmNlc0NvbnRlbnQiOlsiRXhwcmVzc2lvbnNSZWdpc3RyeSA9IHJlcXVpcmUgJy4vZXhwcmVzc2lvbnMtcmVnaXN0cnknXG5WYXJpYWJsZUV4cHJlc3Npb24gPSByZXF1aXJlICcuL3ZhcmlhYmxlLWV4cHJlc3Npb24nXG5cbm1vZHVsZS5leHBvcnRzID0gcmVnaXN0cnkgPSBuZXcgRXhwcmVzc2lvbnNSZWdpc3RyeShWYXJpYWJsZUV4cHJlc3Npb24pXG5cbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmxlc3MnLCAnXlsgXFxcXHRdKihAW2EtekEtWjAtOVxcXFwtX10rKVxcXFxzKjpcXFxccyooW147XFxcXG5cXFxccl0rKTs/JywgWydsZXNzJ11cblxuIyBJdCBjYXRjaGVzIHNlcXVlbmNlcyBsaWtlIGBAbWl4aW4gZm9vKCRmb286IDEwKWAgYW5kIGlnbm9yZXMgdGhlbS5cbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnNjc3NfcGFyYW1zJywgJ15bIFxcXFx0XSpAKG1peGlufGluY2x1ZGV8ZnVuY3Rpb24pXFxcXHMrW2EtekEtWjAtOVxcXFwtX10rXFxcXHMqXFxcXChbXlxcXFwpXStcXFxcKScsIFsnc2NzcycsICdzYXNzJywgJ2hhbWwnXSwgKG1hdGNoLCBzb2x2ZXIpIC0+XG4gIFttYXRjaF0gPSBtYXRjaFxuICBzb2x2ZXIuZW5kUGFyc2luZyhtYXRjaC5sZW5ndGggLSAxKVxuXG5zYXNzX2hhbmRsZXIgPSAobWF0Y2gsIHNvbHZlcikgLT5cbiAgc29sdmVyLmFwcGVuZFJlc3VsdChtYXRjaFsxXSwgbWF0Y2hbMl0sIDAsIG1hdGNoWzBdLmxlbmd0aCwgaXNEZWZhdWx0OiBtYXRjaFszXT8pXG5cbiAgaWYgbWF0Y2hbMV0ubWF0Y2goL1stX10vKVxuICAgIGFsbF91bmRlcnNjb3JlID0gbWF0Y2hbMV0ucmVwbGFjZSgvLS9nLCAnXycpXG4gICAgYWxsX2h5cGhlbiA9IG1hdGNoWzFdLnJlcGxhY2UoL18vZywgJy0nKVxuXG4gICAgaWYgbWF0Y2hbMV0gaXNudCBhbGxfdW5kZXJzY29yZVxuICAgICAgc29sdmVyLmFwcGVuZFJlc3VsdChhbGxfdW5kZXJzY29yZSwgbWF0Y2hbMl0sIDAsIG1hdGNoWzBdLmxlbmd0aCwgaXNBbHRlcm5hdGU6IHRydWUsIGlzRGVmYXVsdDogbWF0Y2hbM10/KVxuICAgIGlmIG1hdGNoWzFdIGlzbnQgYWxsX2h5cGhlblxuICAgICAgc29sdmVyLmFwcGVuZFJlc3VsdChhbGxfaHlwaGVuLCBtYXRjaFsyXSwgMCwgbWF0Y2hbMF0ubGVuZ3RoLCBpc0FsdGVybmF0ZTogdHJ1ZSwgaXNEZWZhdWx0OiBtYXRjaFszXT8pXG5cbiAgc29sdmVyLmVuZFBhcnNpbmcobWF0Y2hbMF0ubGVuZ3RoKVxuXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpzY3NzJywgJ15bIFxcXFx0XSooXFxcXCRbYS16QS1aMC05XFxcXC1fXSspXFxcXHMqOlxcXFxzKiguKj8pKFxcXFxzKiFkZWZhdWx0KT9cXFxccyo7JywgWydzY3NzJywgJ2hhbWwnXSwgc2Fzc19oYW5kbGVyXG5cbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnNhc3MnLCAnXlsgXFxcXHRdKihcXFxcJFthLXpBLVowLTlcXFxcLV9dKylcXFxccyo6XFxcXHMqKFteXFxcXHtdKj8pKFxcXFxzKiFkZWZhdWx0KT9cXFxccyooPzokfFxcXFwvKScsIFsnc2FzcycsICdoYW1sJ10sIHNhc3NfaGFuZGxlclxuXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpjc3NfdmFycycsICcoLS1bXlxcXFxzOl0rKTpcXFxccyooW15cXFxcbjtdKyk7JywgWydjc3MnXSwgKG1hdGNoLCBzb2x2ZXIpIC0+XG4gIHNvbHZlci5hcHBlbmRSZXN1bHQoXCJ2YXIoI3ttYXRjaFsxXX0pXCIsIG1hdGNoWzJdLCAwLCBtYXRjaFswXS5sZW5ndGgpXG4gIHNvbHZlci5lbmRQYXJzaW5nKG1hdGNoWzBdLmxlbmd0aClcblxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6c3R5bHVzX2hhc2gnLCAnXlsgXFxcXHRdKihbYS16QS1aXyRdW2EtekEtWjAtOVxcXFwtX10qKVxcXFxzKj1cXFxccypcXFxceyhbXj1dKilcXFxcfScsIFsnc3R5bCcsICdzdHlsdXMnXSwgKG1hdGNoLCBzb2x2ZXIpIC0+XG4gIGJ1ZmZlciA9ICcnXG4gIFttYXRjaCwgbmFtZSwgY29udGVudF0gPSBtYXRjaFxuICBjdXJyZW50ID0gbWF0Y2guaW5kZXhPZihjb250ZW50KVxuICBzY29wZSA9IFtuYW1lXVxuICBzY29wZUJlZ2luID0gL1xcey9cbiAgc2NvcGVFbmQgPSAvXFx9L1xuICBjb21tYVNlbnNpdGl2ZUJlZ2luID0gL1xcKHxcXFsvXG4gIGNvbW1hU2Vuc2l0aXZlRW5kID0gL1xcKXxcXF0vXG4gIGluQ29tbWFTZW5zaXRpdmVDb250ZXh0ID0gZmFsc2VcbiAgZm9yIGNoYXIgaW4gY29udGVudFxuICAgIGlmIHNjb3BlQmVnaW4udGVzdChjaGFyKVxuICAgICAgc2NvcGUucHVzaCBidWZmZXIucmVwbGFjZSgvW1xcczpdL2csICcnKVxuICAgICAgYnVmZmVyID0gJydcbiAgICBlbHNlIGlmIHNjb3BlRW5kLnRlc3QoY2hhcilcbiAgICAgIHNjb3BlLnBvcCgpXG4gICAgICByZXR1cm4gc29sdmVyLmVuZFBhcnNpbmcoY3VycmVudCkgaWYgc2NvcGUubGVuZ3RoIGlzIDBcbiAgICBlbHNlIGlmIGNvbW1hU2Vuc2l0aXZlQmVnaW4udGVzdChjaGFyKVxuICAgICAgYnVmZmVyICs9IGNoYXJcbiAgICAgIGluQ29tbWFTZW5zaXRpdmVDb250ZXh0ID0gdHJ1ZVxuICAgIGVsc2UgaWYgaW5Db21tYVNlbnNpdGl2ZUNvbnRleHRcbiAgICAgIGJ1ZmZlciArPSBjaGFyXG4gICAgICBpbkNvbW1hU2Vuc2l0aXZlQ29udGV4dCA9ICFjb21tYVNlbnNpdGl2ZUVuZC50ZXN0KGNoYXIpXG4gICAgZWxzZSBpZiAvWyxcXG5dLy50ZXN0KGNoYXIpXG4gICAgICBidWZmZXIgPSBidWZmZXIucmVwbGFjZSgvXFxzKy9nLCAnJylcbiAgICAgIGlmIGJ1ZmZlci5sZW5ndGhcbiAgICAgICAgW2tleSwgdmFsdWVdID0gYnVmZmVyLnNwbGl0KC9cXHMqOlxccyovKVxuXG4gICAgICAgIHNvbHZlci5hcHBlbmRSZXN1bHQoc2NvcGUuY29uY2F0KGtleSkuam9pbignLicpLCB2YWx1ZSwgY3VycmVudCAtIGJ1ZmZlci5sZW5ndGggLSAxLCBjdXJyZW50KVxuXG4gICAgICBidWZmZXIgPSAnJ1xuICAgIGVsc2VcbiAgICAgIGJ1ZmZlciArPSBjaGFyXG5cbiAgICBjdXJyZW50KytcblxuICBzY29wZS5wb3AoKVxuICBpZiBzY29wZS5sZW5ndGggaXMgMFxuICAgIHNvbHZlci5lbmRQYXJzaW5nKGN1cnJlbnQgKyAxKVxuICBlbHNlXG4gICAgc29sdmVyLmFib3J0UGFyc2luZygpXG5cbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnN0eWx1cycsICdeWyBcXFxcdF0qKFthLXpBLVpfJF1bYS16QS1aMC05XFxcXC1fXSopXFxcXHMqPSg/IT0pXFxcXHMqKFteXFxcXG5cXFxccjtdKik7PyQnLCBbJ3N0eWwnLCAnc3R5bHVzJ11cblxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6bGF0ZXgnLCAnXFxcXFxcXFxkZWZpbmVjb2xvcihcXFxce1teXFxcXH1dK1xcXFx9KVxcXFx7KFteXFxcXH1dKylcXFxcfVxcXFx7KFteXFxcXH1dKylcXFxcfScsIFsndGV4J10sIChtYXRjaCwgc29sdmVyKSAtPlxuICBbXywgbmFtZSwgbW9kZSwgdmFsdWVdID0gbWF0Y2hcblxuICB2YWx1ZSA9IHN3aXRjaCBtb2RlXG4gICAgd2hlbiAnUkdCJyB0aGVuIFwicmdiKCN7dmFsdWV9KVwiXG4gICAgd2hlbiAnZ3JheScgdGhlbiBcImdyYXkoI3tNYXRoLnJvdW5kKHBhcnNlRmxvYXQodmFsdWUpICogMTAwKX0lKVwiXG4gICAgd2hlbiAncmdiJ1xuICAgICAgdmFsdWVzID0gdmFsdWUuc3BsaXQoJywnKS5tYXAgKG4pIC0+IE1hdGguZmxvb3IobiAqIDI1NSlcbiAgICAgIFwicmdiKCN7dmFsdWVzLmpvaW4oJywnKX0pXCJcbiAgICB3aGVuICdjbXlrJyB0aGVuIFwiY215aygje3ZhbHVlfSlcIlxuICAgIHdoZW4gJ0hUTUwnIHRoZW4gXCIjI3t2YWx1ZX1cIlxuICAgIGVsc2UgdmFsdWVcblxuICBzb2x2ZXIuYXBwZW5kUmVzdWx0KG5hbWUsIHZhbHVlLCAwLCBfLmxlbmd0aCwgbm9OYW1lUHJlZml4OiB0cnVlKVxuICBzb2x2ZXIuZW5kUGFyc2luZyhfLmxlbmd0aClcblxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6bGF0ZXhfbWl4JywgJ1xcXFxcXFxcZGVmaW5lY29sb3IoXFxcXHtbXlxcXFx9XStcXFxcfSkoXFxcXHtbXlxcXFx9XFxcXG4hXStbIV1bXlxcXFx9XFxcXG5dK1xcXFx9KScsIFsndGV4J10sIChtYXRjaCwgc29sdmVyKSAtPlxuICBbXywgbmFtZSwgdmFsdWVdID0gbWF0Y2hcblxuICBzb2x2ZXIuYXBwZW5kUmVzdWx0KG5hbWUsIHZhbHVlLCAwLCBfLmxlbmd0aCwgbm9OYW1lUHJlZml4OiB0cnVlKVxuICBzb2x2ZXIuZW5kUGFyc2luZyhfLmxlbmd0aClcbiJdfQ==
