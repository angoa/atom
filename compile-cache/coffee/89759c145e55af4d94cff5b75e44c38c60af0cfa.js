(function() {
  var CompositeDisposable, PigmentsProvider, _, ref, variablesRegExp;

  ref = [], CompositeDisposable = ref[0], variablesRegExp = ref[1], _ = ref[2];

  module.exports = PigmentsProvider = (function() {
    function PigmentsProvider(pigments) {
      this.pigments = pigments;
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      this.subscriptions = new CompositeDisposable;
      this.selector = atom.config.get('pigments.autocompleteScopes').join(',');
      this.subscriptions.add(atom.config.observe('pigments.autocompleteScopes', (function(_this) {
        return function(scopes) {
          return _this.selector = scopes.join(',');
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.extendAutocompleteToVariables', (function(_this) {
        return function(extendAutocompleteToVariables) {
          _this.extendAutocompleteToVariables = extendAutocompleteToVariables;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.extendAutocompleteToColorValue', (function(_this) {
        return function(extendAutocompleteToColorValue) {
          _this.extendAutocompleteToColorValue = extendAutocompleteToColorValue;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.autocompleteSuggestionsFromValue', (function(_this) {
        return function(autocompleteSuggestionsFromValue) {
          _this.autocompleteSuggestionsFromValue = autocompleteSuggestionsFromValue;
        };
      })(this)));
    }

    PigmentsProvider.prototype.dispose = function() {
      this.disposed = true;
      this.subscriptions.dispose();
      return this.pigments = null;
    };

    PigmentsProvider.prototype.getProject = function() {
      if (this.disposed) {
        return;
      }
      return this.pigments.getProject();
    };

    PigmentsProvider.prototype.getSuggestions = function(arg) {
      var bufferPosition, editor, prefix, project, suggestions, variables;
      editor = arg.editor, bufferPosition = arg.bufferPosition;
      if (this.disposed) {
        return;
      }
      prefix = this.getPrefix(editor, bufferPosition);
      project = this.getProject();
      if (!(prefix != null ? prefix.length : void 0)) {
        return;
      }
      if (project == null) {
        return;
      }
      if (this.extendAutocompleteToVariables) {
        variables = project.getVariables();
      } else {
        variables = project.getColorVariables();
      }
      suggestions = this.findSuggestionsForPrefix(variables, prefix);
      return suggestions;
    };

    PigmentsProvider.prototype.getPrefix = function(editor, bufferPosition) {
      var line, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
      if (variablesRegExp == null) {
        variablesRegExp = require('./regexes').variables;
      }
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      if (this.autocompleteSuggestionsFromValue) {
        return (ref1 = (ref2 = (ref3 = (ref4 = (ref5 = line.match(/(?:#[a-fA-F0-9]*|rgb.+)$/)) != null ? ref5[0] : void 0) != null ? ref4 : (ref6 = line.match(new RegExp("(" + variablesRegExp + ")$"))) != null ? ref6[0] : void 0) != null ? ref3 : (ref7 = line.match(/:\s*([^\s].+)$/)) != null ? ref7[1] : void 0) != null ? ref2 : (ref8 = line.match(/^\s*([^\s].+)$/)) != null ? ref8[1] : void 0) != null ? ref1 : '';
      } else {
        return ((ref9 = line.match(new RegExp("(" + variablesRegExp + ")$"))) != null ? ref9[0] : void 0) || '';
      }
    };

    PigmentsProvider.prototype.findSuggestionsForPrefix = function(variables, prefix) {
      var matchedVariables, matchesColorValue, re, suggestions;
      if (variables == null) {
        return [];
      }
      if (_ == null) {
        _ = require('underscore-plus');
      }
      re = RegExp("^" + (_.escapeRegExp(prefix).replace(/,\s*/, '\\s*,\\s*')));
      suggestions = [];
      matchesColorValue = function(v) {
        var res;
        res = re.test(v.value);
        if (v.color != null) {
          res || (res = v.color.suggestionValues.some(function(s) {
            return re.test(s);
          }));
        }
        return res;
      };
      matchedVariables = variables.filter((function(_this) {
        return function(v) {
          return !v.isAlternate && re.test(v.name) || (_this.autocompleteSuggestionsFromValue && matchesColorValue(v));
        };
      })(this));
      matchedVariables.forEach((function(_this) {
        return function(v) {
          var color, rightLabelHTML;
          if (v.isColor) {
            color = v.color.alpha === 1 ? '#' + v.color.hex : v.color.toCSS();
            rightLabelHTML = "<span class='color-suggestion-preview' style='background: " + (v.color.toCSS()) + "'></span>";
            if (_this.extendAutocompleteToColorValue) {
              rightLabelHTML = color + " " + rightLabelHTML;
            }
            return suggestions.push({
              text: v.name,
              rightLabelHTML: rightLabelHTML,
              replacementPrefix: prefix,
              className: 'color-suggestion'
            });
          } else {
            return suggestions.push({
              text: v.name,
              rightLabel: v.value,
              replacementPrefix: prefix,
              className: 'pigments-suggestion'
            });
          }
        };
      })(this));
      return suggestions;
    };

    return PigmentsProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9waWdtZW50cy1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BRUksRUFGSixFQUNFLDRCQURGLEVBQ3VCLHdCQUR2QixFQUN3Qzs7RUFHeEMsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLDBCQUFDLFFBQUQ7TUFBQyxJQUFDLENBQUEsV0FBRDs7UUFDWixzQkFBdUIsT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDOztNQUV2QyxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQixDQUE4QyxDQUFDLElBQS9DLENBQW9ELEdBQXBEO01BRVosSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQiw2QkFBcEIsRUFBbUQsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7aUJBQ3BFLEtBQUMsQ0FBQSxRQUFELEdBQVksTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUFaO1FBRHdEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuRCxDQUFuQjtNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0Isd0NBQXBCLEVBQThELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyw2QkFBRDtVQUFDLEtBQUMsQ0FBQSxnQ0FBRDtRQUFEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5RCxDQUFuQjtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IseUNBQXBCLEVBQStELENBQUEsU0FBQSxL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QUMsS0FBQyxDQUFBLGdDQUFELElBQXNDLGlCQUFBLENBQWtCLENBQWxCLENBQXZDO1FBRmtDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQjtNQUluQixnQkFBZ0IsQ0FBQyxPQUFqQixDQUF5QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtBQUN2QixjQUFBO1VBQUEsSUFBRyxDQUFDLENBQUMsT0FBTDtZQUNFLEtBQUEsR0FBVyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQVIsS0FBaUIsQ0FBcEIsR0FBMkIsR0FBQSxHQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBekMsR0FBa0QsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFSLENBQUE7WUFDMUQsY0FBQSxHQUFpQiw0REFBQSxHQUE0RCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBUixDQUFBLENBQUQsQ0FBNUQsR0FBNkU7WUFDOUYsSUFBaUQsS0FBQyxDQUFBLDhCQUFsRDtjQUFBLGNBQUEsR0FBb0IsS0FBRCxHQUFPLEdBQVAsR0FBVSxlQUE3Qjs7bUJBRUEsV0FBVyxDQUFDLElBQVosQ0FBaUI7Y0FDZixJQUFBLEVBQU0sQ0FBQyxDQUFDLElBRE87Y0FFZixnQkFBQSxjQUZlO2NBR2YsaUJBQUEsRUFBbUIsTUFISjtjQUlmLFNBQUEsRUFBVyxrQkFKSTthQUFqQixFQUxGO1dBQUEsTUFBQTttQkFZRSxXQUFXLENBQUMsSUFBWixDQUFpQjtjQUNmLElBQUEsRUFBTSxDQUFDLENBQUMsSUFETztjQUVmLFVBQUEsRUFBWSxDQUFDLENBQUMsS0FGQztjQUdmLGlCQUFBLEVBQW1CLE1BSEo7Y0FJZixTQUFBLEVBQVcscUJBSkk7YUFBakIsRUFaRjs7UUFEdUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO2FBb0JBO0lBckN3Qjs7Ozs7QUF6RDVCIiwic291cmNlc0NvbnRlbnQiOlsiW1xuICBDb21wb3NpdGVEaXNwb3NhYmxlLCB2YXJpYWJsZXNSZWdFeHAsIF9cbl0gPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQaWdtZW50c1Byb3ZpZGVyXG4gIGNvbnN0cnVjdG9yOiAoQHBpZ21lbnRzKSAtPlxuICAgIENvbXBvc2l0ZURpc3Bvc2FibGUgPz0gcmVxdWlyZSgnYXRvbScpLkNvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc2VsZWN0b3IgPSBhdG9tLmNvbmZpZy5nZXQoJ3BpZ21lbnRzLmF1dG9jb21wbGV0ZVNjb3BlcycpLmpvaW4oJywnKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3BpZ21lbnRzLmF1dG9jb21wbGV0ZVNjb3BlcycsIChzY29wZXMpID0+XG4gICAgICBAc2VsZWN0b3IgPSBzY29wZXMuam9pbignLCcpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3BpZ21lbnRzLmV4dGVuZEF1dG9jb21wbGV0ZVRvVmFyaWFibGVzJywgKEBleHRlbmRBdXRvY29tcGxldGVUb1ZhcmlhYmxlcykgPT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncGlnbWVudHMuZXh0ZW5kQXV0b2NvbXBsZXRlVG9Db2xvclZhbHVlJywgKEBleHRlbmRBdXRvY29tcGxldGVUb0NvbG9yVmFsdWUpID0+XG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncGlnbWVudHMuYXV0b2NvbXBsZXRlU3VnZ2VzdGlvbnNGcm9tVmFsdWUnLCAoQGF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zRnJvbVZhbHVlKSA9PlxuXG4gIGRpc3Bvc2U6IC0+XG4gICAgQGRpc3Bvc2VkID0gdHJ1ZVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBwaWdtZW50cyA9IG51bGxcblxuICBnZXRQcm9qZWN0OiAtPlxuICAgIHJldHVybiBpZiBAZGlzcG9zZWRcbiAgICBAcGlnbWVudHMuZ2V0UHJvamVjdCgpXG5cbiAgZ2V0U3VnZ2VzdGlvbnM6ICh7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbn0pIC0+XG4gICAgcmV0dXJuIGlmIEBkaXNwb3NlZFxuICAgIHByZWZpeCA9IEBnZXRQcmVmaXgoZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICBwcm9qZWN0ID0gQGdldFByb2plY3QoKVxuXG4gICAgcmV0dXJuIHVubGVzcyBwcmVmaXg/Lmxlbmd0aFxuICAgIHJldHVybiB1bmxlc3MgcHJvamVjdD9cblxuICAgIGlmIEBleHRlbmRBdXRvY29tcGxldGVUb1ZhcmlhYmxlc1xuICAgICAgdmFyaWFibGVzID0gcHJvamVjdC5nZXRWYXJpYWJsZXMoKVxuICAgIGVsc2VcbiAgICAgIHZhcmlhYmxlcyA9IHByb2plY3QuZ2V0Q29sb3JWYXJpYWJsZXMoKVxuXG4gICAgc3VnZ2VzdGlvbnMgPSBAZmluZFN1Z2dlc3Rpb25zRm9yUHJlZml4KHZhcmlhYmxlcywgcHJlZml4KVxuICAgIHN1Z2dlc3Rpb25zXG5cbiAgZ2V0UHJlZml4OiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICB2YXJpYWJsZXNSZWdFeHAgPz0gcmVxdWlyZSgnLi9yZWdleGVzJykudmFyaWFibGVzXG4gICAgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcblxuICAgIGlmIEBhdXRvY29tcGxldGVTdWdnZXN0aW9uc0Zyb21WYWx1ZVxuICAgICAgbGluZS5tYXRjaCgvKD86I1thLWZBLUYwLTldKnxyZ2IuKykkLyk/WzBdID9cbiAgICAgIGxpbmUubWF0Y2gobmV3IFJlZ0V4cChcIigje3ZhcmlhYmxlc1JlZ0V4cH0pJFwiKSk/WzBdID9cbiAgICAgIGxpbmUubWF0Y2goLzpcXHMqKFteXFxzXS4rKSQvKT9bMV0gP1xuICAgICAgbGluZS5tYXRjaCgvXlxccyooW15cXHNdLispJC8pP1sxXSA/XG4gICAgICAnJ1xuICAgIGVsc2VcbiAgICAgIGxpbmUubWF0Y2gobmV3IFJlZ0V4cChcIigje3ZhcmlhYmxlc1JlZ0V4cH0pJFwiKSk/WzBdIG9yICcnXG5cbiAgZmluZFN1Z2dlc3Rpb25zRm9yUHJlZml4OiAodmFyaWFibGVzLCBwcmVmaXgpIC0+XG4gICAgcmV0dXJuIFtdIHVubGVzcyB2YXJpYWJsZXM/XG5cbiAgICBfID89IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuICAgIHJlID0gLy8vXiN7Xy5lc2NhcGVSZWdFeHAocHJlZml4KS5yZXBsYWNlKC8sXFxzKi8sICdcXFxccyosXFxcXHMqJyl9Ly8vXG5cbiAgICBzdWdnZXN0aW9ucyA9IFtdXG4gICAgbWF0Y2hlc0NvbG9yVmFsdWUgPSAodikgLT5cbiAgICAgIHJlcyA9IHJlLnRlc3Qodi52YWx1ZSlcbiAgICAgIHJlcyB8fD0gdi5jb2xvci5zdWdnZXN0aW9uVmFsdWVzLnNvbWUoKHMpIC0+IHJlLnRlc3QocykpIGlmIHYuY29sb3I/XG4gICAgICByZXNcblxuICAgIG1hdGNoZWRWYXJpYWJsZXMgPSB2YXJpYWJsZXMuZmlsdGVyICh2KSA9PlxuICAgICAgbm90IHYuaXNBbHRlcm5hdGUgYW5kIHJlLnRlc3Qodi5uYW1lKSBvclxuICAgICAgKEBhdXRvY29tcGxldGVTdWdnZXN0aW9uc0Zyb21WYWx1ZSBhbmQgbWF0Y2hlc0NvbG9yVmFsdWUodikpXG5cbiAgICBtYXRjaGVkVmFyaWFibGVzLmZvckVhY2ggKHYpID0+XG4gICAgICBpZiB2LmlzQ29sb3JcbiAgICAgICAgY29sb3IgPSBpZiB2LmNvbG9yLmFscGhhID09IDEgdGhlbiAnIycgKyB2LmNvbG9yLmhleCBlbHNlIHYuY29sb3IudG9DU1MoKTtcbiAgICAgICAgcmlnaHRMYWJlbEhUTUwgPSBcIjxzcGFuIGNsYXNzPSdjb2xvci1zdWdnZXN0aW9uLXByZXZpZXcnIHN0eWxlPSdiYWNrZ3JvdW5kOiAje3YuY29sb3IudG9DU1MoKX0nPjwvc3Bhbj5cIlxuICAgICAgICByaWdodExhYmVsSFRNTCA9IFwiI3tjb2xvcn0gI3tyaWdodExhYmVsSFRNTH1cIiBpZiBAZXh0ZW5kQXV0b2NvbXBsZXRlVG9Db2xvclZhbHVlXG5cbiAgICAgICAgc3VnZ2VzdGlvbnMucHVzaCB7XG4gICAgICAgICAgdGV4dDogdi5uYW1lXG4gICAgICAgICAgcmlnaHRMYWJlbEhUTUxcbiAgICAgICAgICByZXBsYWNlbWVudFByZWZpeDogcHJlZml4XG4gICAgICAgICAgY2xhc3NOYW1lOiAnY29sb3Itc3VnZ2VzdGlvbidcbiAgICAgICAgfVxuICAgICAgZWxzZVxuICAgICAgICBzdWdnZXN0aW9ucy5wdXNoIHtcbiAgICAgICAgICB0ZXh0OiB2Lm5hbWVcbiAgICAgICAgICByaWdodExhYmVsOiB2LnZhbHVlXG4gICAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeFxuICAgICAgICAgIGNsYXNzTmFtZTogJ3BpZ21lbnRzLXN1Z2dlc3Rpb24nXG4gICAgICAgIH1cblxuICAgIHN1Z2dlc3Rpb25zXG4iXX0=
