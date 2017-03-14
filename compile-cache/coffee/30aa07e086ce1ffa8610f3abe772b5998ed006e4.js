(function() {
  var Emitter, ExpressionsRegistry, ref, vm,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = [], Emitter = ref[0], vm = ref[1];

  module.exports = ExpressionsRegistry = (function() {
    ExpressionsRegistry.deserialize = function(serializedData, expressionsType) {
      var data, handle, name, ref1, registry;
      if (vm == null) {
        vm = require('vm');
      }
      registry = new ExpressionsRegistry(expressionsType);
      ref1 = serializedData.expressions;
      for (name in ref1) {
        data = ref1[name];
        handle = vm.runInNewContext(data.handle.replace('function', "handle = function"), {
          console: console,
          require: require
        });
        registry.createExpression(name, data.regexpString, data.priority, data.scopes, handle);
      }
      registry.regexpStrings['none'] = serializedData.regexpString;
      return registry;
    };

    function ExpressionsRegistry(expressionsType1) {
      this.expressionsType = expressionsType1;
      if (Emitter == null) {
        Emitter = require('event-kit').Emitter;
      }
      this.colorExpressions = {};
      this.emitter = new Emitter;
      this.regexpStrings = {};
    }

    ExpressionsRegistry.prototype.dispose = function() {
      return this.emitter.dispose();
    };

    ExpressionsRegistry.prototype.onDidAddExpression = function(callback) {
      return this.emitter.on('did-add-expression', callback);
    };

    ExpressionsRegistry.prototype.onDidRemoveExpression = function(callback) {
      return this.emitter.on('did-remove-expression', callback);
    };

    ExpressionsRegistry.prototype.onDidUpdateExpressions = function(callback) {
      return this.emitter.on('did-update-expressions', callback);
    };

    ExpressionsRegistry.prototype.getExpressions = function() {
      var e, k;
      return ((function() {
        var ref1, results;
        ref1 = this.colorExpressions;
        results = [];
        for (k in ref1) {
          e = ref1[k];
          results.push(e);
        }
        return results;
      }).call(this)).sort(function(a, b) {
        return b.priority - a.priority;
      });
    };

    ExpressionsRegistry.prototype.getExpressionsForScope = function(scope) {
      var expressions, matchScope;
      expressions = this.getExpressions();
      if (scope === '*') {
        return expressions;
      }
      matchScope = function(a) {
        return function(b) {
          var aa, ab, ba, bb, ref1, ref2;
          ref1 = a.split(':'), aa = ref1[0], ab = ref1[1];
          ref2 = b.split(':'), ba = ref2[0], bb = ref2[1];
          return aa === ba && ((ab == null) || (bb == null) || ab === bb);
        };
      };
      return expressions.filter(function(e) {
        return indexOf.call(e.scopes, '*') >= 0 || e.scopes.some(matchScope(scope));
      });
    };

    ExpressionsRegistry.prototype.getExpression = function(name) {
      return this.colorExpressions[name];
    };

    ExpressionsRegistry.prototype.getRegExp = function() {
      var base;
      return (base = this.regexpStrings)['none'] != null ? base['none'] : base['none'] = this.getExpressions().map(function(e) {
        return "(" + e.regexpString + ")";
      }).join('|');
    };

    ExpressionsRegistry.prototype.getRegExpForScope = function(scope) {
      var base;
      return (base = this.regexpStrings)[scope] != null ? base[scope] : base[scope] = this.getExpressionsForScope(scope).map(function(e) {
        return "(" + e.regexpString + ")";
      }).join('|');
    };

    ExpressionsRegistry.prototype.createExpression = function(name, regexpString, priority, scopes, handle) {
      var newExpression;
      if (priority == null) {
        priority = 0;
      }
      if (scopes == null) {
        scopes = ['*'];
      }
      if (typeof priority === 'function') {
        handle = priority;
        scopes = ['*'];
        priority = 0;
      } else if (typeof priority === 'object') {
        if (typeof scopes === 'function') {
          handle = scopes;
        }
        scopes = priority;
        priority = 0;
      }
      if (!(scopes.length === 1 && scopes[0] === '*')) {
        scopes.push('pigments');
      }
      newExpression = new this.expressionsType({
        name: name,
        regexpString: regexpString,
        scopes: scopes,
        priority: priority,
        handle: handle
      });
      return this.addExpression(newExpression);
    };

    ExpressionsRegistry.prototype.addExpression = function(expression, batch) {
      if (batch == null) {
        batch = false;
      }
      this.regexpStrings = {};
      this.colorExpressions[expression.name] = expression;
      if (!batch) {
        this.emitter.emit('did-add-expression', {
          name: expression.name,
          registry: this
        });
        this.emitter.emit('did-update-expressions', {
          name: expression.name,
          registry: this
        });
      }
      return expression;
    };

    ExpressionsRegistry.prototype.createExpressions = function(expressions) {
      return this.addExpressions(expressions.map((function(_this) {
        return function(e) {
          var expression, handle, name, priority, regexpString, scopes;
          name = e.name, regexpString = e.regexpString, handle = e.handle, priority = e.priority, scopes = e.scopes;
          if (priority == null) {
            priority = 0;
          }
          expression = new _this.expressionsType({
            name: name,
            regexpString: regexpString,
            scopes: scopes,
            handle: handle
          });
          expression.priority = priority;
          return expression;
        };
      })(this)));
    };

    ExpressionsRegistry.prototype.addExpressions = function(expressions) {
      var expression, i, len;
      for (i = 0, len = expressions.length; i < len; i++) {
        expression = expressions[i];
        this.addExpression(expression, true);
        this.emitter.emit('did-add-expression', {
          name: expression.name,
          registry: this
        });
      }
      return this.emitter.emit('did-update-expressions', {
        registry: this
      });
    };

    ExpressionsRegistry.prototype.removeExpression = function(name) {
      delete this.colorExpressions[name];
      this.regexpStrings = {};
      this.emitter.emit('did-remove-expression', {
        name: name,
        registry: this
      });
      return this.emitter.emit('did-update-expressions', {
        name: name,
        registry: this
      });
    };

    ExpressionsRegistry.prototype.serialize = function() {
      var expression, key, out, ref1, ref2;
      out = {
        regexpString: this.getRegExp(),
        expressions: {}
      };
      ref1 = this.colorExpressions;
      for (key in ref1) {
        expression = ref1[key];
        out.expressions[key] = {
          name: expression.name,
          regexpString: expression.regexpString,
          priority: expression.priority,
          scopes: expression.scopes,
          handle: (ref2 = expression.handle) != null ? ref2.toString() : void 0
        };
      }
      return out;
    };

    return ExpressionsRegistry;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9leHByZXNzaW9ucy1yZWdpc3RyeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFDQUFBO0lBQUE7O0VBQUEsTUFBZ0IsRUFBaEIsRUFBQyxnQkFBRCxFQUFVOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDSixtQkFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLGNBQUQsRUFBaUIsZUFBakI7QUFDWixVQUFBOztRQUFBLEtBQU0sT0FBQSxDQUFRLElBQVI7O01BRU4sUUFBQSxHQUFlLElBQUEsbUJBQUEsQ0FBb0IsZUFBcEI7QUFFZjtBQUFBLFdBQUEsWUFBQTs7UUFDRSxNQUFBLEdBQVMsRUFBRSxDQUFDLGVBQUgsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLFVBQXBCLEVBQWdDLG1CQUFoQyxDQUFuQixFQUF5RTtVQUFDLFNBQUEsT0FBRDtVQUFVLFNBQUEsT0FBVjtTQUF6RTtRQUNULFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixJQUExQixFQUFnQyxJQUFJLENBQUMsWUFBckMsRUFBbUQsSUFBSSxDQUFDLFFBQXhELEVBQWtFLElBQUksQ0FBQyxNQUF2RSxFQUErRSxNQUEvRTtBQUZGO01BSUEsUUFBUSxDQUFDLGFBQWMsQ0FBQSxNQUFBLENBQXZCLEdBQWlDLGNBQWMsQ0FBQzthQUVoRDtJQVhZOztJQWNELDZCQUFDLGdCQUFEO01BQUMsSUFBQyxDQUFBLGtCQUFEOztRQUNaLFVBQVcsT0FBQSxDQUFRLFdBQVIsQ0FBb0IsQ0FBQzs7TUFFaEMsSUFBQyxDQUFBLGdCQUFELEdBQW9CO01BQ3BCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBTE47O2tDQU9iLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLE9BQU8sQ0FB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QVUsQ0FBQyxJQUFqQjtVQUNBLFlBQUEsRUFBYyxVQUFVLENBQUMsWUFEekI7VUFFQSxRQUFBLEVBQVUsVUFBVSxDQUFDLFFBRnJCO1VBR0EsTUFBQSxFQUFRLFVBQVUsQ0FBQyxNQUhuQjtVQUlBLE1BQUEsMkNBQXlCLENBQUUsUUFBbkIsQ0FBQSxVQUpSOztBQUZKO2FBUUE7SUFiUzs7Ozs7QUE1R2IiLCJzb3VyY2VzQ29udGVudCI6WyJbRW1pdHRlciwgdm1dID0gW11cblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRXhwcmVzc2lvbnNSZWdpc3RyeVxuICBAZGVzZXJpYWxpemU6IChzZXJpYWxpemVkRGF0YSwgZXhwcmVzc2lvbnNUeXBlKSAtPlxuICAgIHZtID89IHJlcXVpcmUgJ3ZtJ1xuXG4gICAgcmVnaXN0cnkgPSBuZXcgRXhwcmVzc2lvbnNSZWdpc3RyeShleHByZXNzaW9uc1R5cGUpXG5cbiAgICBmb3IgbmFtZSwgZGF0YSBvZiBzZXJpYWxpemVkRGF0YS5leHByZXNzaW9uc1xuICAgICAgaGFuZGxlID0gdm0ucnVuSW5OZXdDb250ZXh0KGRhdGEuaGFuZGxlLnJlcGxhY2UoJ2Z1bmN0aW9uJywgXCJoYW5kbGUgPSBmdW5jdGlvblwiKSwge2NvbnNvbGUsIHJlcXVpcmV9KVxuICAgICAgcmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbihuYW1lLCBkYXRhLnJlZ2V4cFN0cmluZywgZGF0YS5wcmlvcml0eSwgZGF0YS5zY29wZXMsIGhhbmRsZSlcblxuICAgIHJlZ2lzdHJ5LnJlZ2V4cFN0cmluZ3NbJ25vbmUnXSA9IHNlcmlhbGl6ZWREYXRhLnJlZ2V4cFN0cmluZ1xuXG4gICAgcmVnaXN0cnlcblxuICAjIFRoZSB7T2JqZWN0fSB3aGVyZSBjb2xvciBleHByZXNzaW9uIGhhbmRsZXJzIGFyZSBzdG9yZWRcbiAgY29uc3RydWN0b3I6IChAZXhwcmVzc2lvbnNUeXBlKSAtPlxuICAgIEVtaXR0ZXIgPz0gcmVxdWlyZSgnZXZlbnQta2l0JykuRW1pdHRlclxuXG4gICAgQGNvbG9yRXhwcmVzc2lvbnMgPSB7fVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAcmVnZXhwU3RyaW5ncyA9IHt9XG5cbiAgZGlzcG9zZTogLT5cbiAgICBAZW1pdHRlci5kaXNwb3NlKClcblxuICBvbkRpZEFkZEV4cHJlc3Npb246IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWFkZC1leHByZXNzaW9uJywgY2FsbGJhY2tcblxuICBvbkRpZFJlbW92ZUV4cHJlc3Npb246IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLXJlbW92ZS1leHByZXNzaW9uJywgY2FsbGJhY2tcblxuICBvbkRpZFVwZGF0ZUV4cHJlc3Npb25zOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC11cGRhdGUtZXhwcmVzc2lvbnMnLCBjYWxsYmFja1xuXG4gIGdldEV4cHJlc3Npb25zOiAtPlxuICAgIChlIGZvciBrLGUgb2YgQGNvbG9yRXhwcmVzc2lvbnMpLnNvcnQoKGEsYikgLT4gYi5wcmlvcml0eSAtIGEucHJpb3JpdHkpXG5cbiAgZ2V0RXhwcmVzc2lvbnNGb3JTY29wZTogKHNjb3BlKSAtPlxuICAgIGV4cHJlc3Npb25zID0gQGdldEV4cHJlc3Npb25zKClcblxuICAgIHJldHVybiBleHByZXNzaW9ucyBpZiBzY29wZSBpcyAnKidcblxuICAgIG1hdGNoU2NvcGUgPSAoYSkgLT4gKGIpIC0+XG4gICAgICBbYWEsIGFiXSA9IGEuc3BsaXQoJzonKVxuICAgICAgW2JhLCBiYl0gPSBiLnNwbGl0KCc6JylcblxuICAgICAgYWEgaXMgYmEgYW5kIChub3QgYWI/IG9yIG5vdCBiYj8gb3IgYWIgaXMgYmIpXG5cbiAgICBleHByZXNzaW9ucy5maWx0ZXIgKGUpIC0+XG4gICAgICAnKicgaW4gZS5zY29wZXMgb3IgZS5zY29wZXMuc29tZShtYXRjaFNjb3BlKHNjb3BlKSlcblxuICBnZXRFeHByZXNzaW9uOiAobmFtZSkgLT4gQGNvbG9yRXhwcmVzc2lvbnNbbmFtZV1cblxuICBnZXRSZWdFeHA6IC0+XG4gICAgQHJlZ2V4cFN0cmluZ3NbJ25vbmUnXSA/PSBAZ2V0RXhwcmVzc2lvbnMoKS5tYXAoKGUpIC0+XG4gICAgICBcIigje2UucmVnZXhwU3RyaW5nfSlcIikuam9pbignfCcpXG5cbiAgZ2V0UmVnRXhwRm9yU2NvcGU6IChzY29wZSkgLT5cbiAgICBAcmVnZXhwU3RyaW5nc1tzY29wZV0gPz0gQGdldEV4cHJlc3Npb25zRm9yU2NvcGUoc2NvcGUpLm1hcCgoZSkgLT5cbiAgICAgIFwiKCN7ZS5yZWdleHBTdHJpbmd9KVwiKS5qb2luKCd8JylcblxuICBjcmVhdGVFeHByZXNzaW9uOiAobmFtZSwgcmVnZXhwU3RyaW5nLCBwcmlvcml0eT0wLCBzY29wZXM9WycqJ10sIGhhbmRsZSkgLT5cbiAgICBpZiB0eXBlb2YgcHJpb3JpdHkgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgaGFuZGxlID0gcHJpb3JpdHlcbiAgICAgIHNjb3BlcyA9IFsnKiddXG4gICAgICBwcmlvcml0eSA9IDBcbiAgICBlbHNlIGlmIHR5cGVvZiBwcmlvcml0eSBpcyAnb2JqZWN0J1xuICAgICAgaGFuZGxlID0gc2NvcGVzIGlmIHR5cGVvZiBzY29wZXMgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgc2NvcGVzID0gcHJpb3JpdHlcbiAgICAgIHByaW9yaXR5ID0gMFxuXG4gICAgc2NvcGVzLnB1c2goJ3BpZ21lbnRzJykgdW5sZXNzIHNjb3Blcy5sZW5ndGggaXMgMSBhbmQgc2NvcGVzWzBdIGlzICcqJ1xuXG4gICAgbmV3RXhwcmVzc2lvbiA9IG5ldyBAZXhwcmVzc2lvbnNUeXBlKHtuYW1lLCByZWdleHBTdHJpbmcsIHNjb3BlcywgcHJpb3JpdHksIGhhbmRsZX0pXG4gICAgQGFkZEV4cHJlc3Npb24gbmV3RXhwcmVzc2lvblxuXG4gIGFkZEV4cHJlc3Npb246IChleHByZXNzaW9uLCBiYXRjaD1mYWxzZSkgLT5cbiAgICBAcmVnZXhwU3RyaW5ncyA9IHt9XG4gICAgQGNvbG9yRXhwcmVzc2lvbnNbZXhwcmVzc2lvbi5uYW1lXSA9IGV4cHJlc3Npb25cblxuICAgIHVubGVzcyBiYXRjaFxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWFkZC1leHByZXNzaW9uJywge25hbWU6IGV4cHJlc3Npb24ubmFtZSwgcmVnaXN0cnk6IHRoaXN9XG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtdXBkYXRlLWV4cHJlc3Npb25zJywge25hbWU6IGV4cHJlc3Npb24ubmFtZSwgcmVnaXN0cnk6IHRoaXN9XG4gICAgZXhwcmVzc2lvblxuXG4gIGNyZWF0ZUV4cHJlc3Npb25zOiAoZXhwcmVzc2lvbnMpIC0+XG4gICAgQGFkZEV4cHJlc3Npb25zIGV4cHJlc3Npb25zLm1hcCAoZSkgPT5cbiAgICAgIHtuYW1lLCByZWdleHBTdHJpbmcsIGhhbmRsZSwgcHJpb3JpdHksIHNjb3Blc30gPSBlXG4gICAgICBwcmlvcml0eSA/PSAwXG4gICAgICBleHByZXNzaW9uID0gbmV3IEBleHByZXNzaW9uc1R5cGUoe25hbWUsIHJlZ2V4cFN0cmluZywgc2NvcGVzLCBoYW5kbGV9KVxuICAgICAgZXhwcmVzc2lvbi5wcmlvcml0eSA9IHByaW9yaXR5XG4gICAgICBleHByZXNzaW9uXG5cbiAgYWRkRXhwcmVzc2lvbnM6IChleHByZXNzaW9ucykgLT5cbiAgICBmb3IgZXhwcmVzc2lvbiBpbiBleHByZXNzaW9uc1xuICAgICAgQGFkZEV4cHJlc3Npb24oZXhwcmVzc2lvbiwgdHJ1ZSlcbiAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1hZGQtZXhwcmVzc2lvbicsIHtuYW1lOiBleHByZXNzaW9uLm5hbWUsIHJlZ2lzdHJ5OiB0aGlzfVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC11cGRhdGUtZXhwcmVzc2lvbnMnLCB7cmVnaXN0cnk6IHRoaXN9XG5cbiAgcmVtb3ZlRXhwcmVzc2lvbjogKG5hbWUpIC0+XG4gICAgZGVsZXRlIEBjb2xvckV4cHJlc3Npb25zW25hbWVdXG4gICAgQHJlZ2V4cFN0cmluZ3MgPSB7fVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1yZW1vdmUtZXhwcmVzc2lvbicsIHtuYW1lLCByZWdpc3RyeTogdGhpc31cbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtdXBkYXRlLWV4cHJlc3Npb25zJywge25hbWUsIHJlZ2lzdHJ5OiB0aGlzfVxuXG4gIHNlcmlhbGl6ZTogLT5cbiAgICBvdXQgPVxuICAgICAgcmVnZXhwU3RyaW5nOiBAZ2V0UmVnRXhwKClcbiAgICAgIGV4cHJlc3Npb25zOiB7fVxuXG4gICAgZm9yIGtleSwgZXhwcmVzc2lvbiBvZiBAY29sb3JFeHByZXNzaW9uc1xuICAgICAgb3V0LmV4cHJlc3Npb25zW2tleV0gPVxuICAgICAgICBuYW1lOiBleHByZXNzaW9uLm5hbWVcbiAgICAgICAgcmVnZXhwU3RyaW5nOiBleHByZXNzaW9uLnJlZ2V4cFN0cmluZ1xuICAgICAgICBwcmlvcml0eTogZXhwcmVzc2lvbi5wcmlvcml0eVxuICAgICAgICBzY29wZXM6IGV4cHJlc3Npb24uc2NvcGVzXG4gICAgICAgIGhhbmRsZTogZXhwcmVzc2lvbi5oYW5kbGU/LnRvU3RyaW5nKClcblxuICAgIG91dFxuIl19
