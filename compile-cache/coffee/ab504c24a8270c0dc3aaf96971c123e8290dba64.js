(function() {
  var Color, ColorContext, ColorExpression, Emitter, VariablesCollection, nextId, ref, registry,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = [], Emitter = ref[0], ColorExpression = ref[1], ColorContext = ref[2], Color = ref[3], registry = ref[4];

  nextId = 0;

  module.exports = VariablesCollection = (function() {
    VariablesCollection.deserialize = function(state) {
      return new VariablesCollection(state);
    };

    Object.defineProperty(VariablesCollection.prototype, 'length', {
      get: function() {
        return this.variables.length;
      },
      enumerable: true
    });

    function VariablesCollection(state) {
      if (Emitter == null) {
        Emitter = require('atom').Emitter;
      }
      this.emitter = new Emitter;
      this.reset();
      this.initialize(state != null ? state.content : void 0);
    }

    VariablesCollection.prototype.onDidChange = function(callback) {
      return this.emitter.on('did-change', callback);
    };

    VariablesCollection.prototype.onceInitialized = function(callback) {
      var disposable;
      if (callback == null) {
        return;
      }
      if (this.initialized) {
        return callback();
      } else {
        return disposable = this.emitter.on('did-initialize', function() {
          disposable.dispose();
          return callback();
        });
      }
    };

    VariablesCollection.prototype.initialize = function(content) {
      var iteration;
      if (content == null) {
        content = [];
      }
      iteration = (function(_this) {
        return function(cb) {
          var end, start, v;
          start = new Date;
          end = new Date;
          while (content.length > 0 && end - start < 100) {
            v = content.shift();
            _this.restoreVariable(v);
          }
          if (content.length > 0) {
            return requestAnimationFrame(function() {
              return iteration(cb);
            });
          } else {
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this);
      return iteration((function(_this) {
        return function() {
          _this.initialized = true;
          return _this.emitter.emit('did-initialize');
        };
      })(this));
    };

    VariablesCollection.prototype.reset = function() {
      this.variables = [];
      this.variableNames = [];
      this.colorVariables = [];
      this.variablesByPath = {};
      return this.dependencyGraph = {};
    };

    VariablesCollection.prototype.getVariables = function() {
      return this.variables.slice();
    };

    VariablesCollection.prototype.getNonColorVariables = function() {
      return this.getVariables().filter(function(v) {
        return !v.isColor;
      });
    };

    VariablesCollection.prototype.getVariablesForPath = function(path) {
      var ref1;
      return (ref1 = this.variablesByPath[path]) != null ? ref1 : [];
    };

    VariablesCollection.prototype.getVariableByName = function(name) {
      return this.collectVariablesByName([name]).pop();
    };

    VariablesCollection.prototype.getVariableById = function(id) {
      var i, len, ref1, v;
      ref1 = this.variables;
      for (i = 0, len = ref1.length; i < len; i++) {
        v = ref1[i];
        if (v.id === id) {
          return v;
        }
      }
    };

    VariablesCollection.prototype.getVariablesForPaths = function(paths) {
      var i, len, p, res;
      res = [];
      for (i = 0, len = paths.length; i < len; i++) {
        p = paths[i];
        if (p in this.variablesByPath) {
          res = res.concat(this.variablesByPath[p]);
        }
      }
      return res;
    };

    VariablesCollection.prototype.getColorVariables = function() {
      return this.colorVariables.slice();
    };

    VariablesCollection.prototype.find = function(properties) {
      var ref1;
      return (ref1 = this.findAll(properties)) != null ? ref1[0] : void 0;
    };

    VariablesCollection.prototype.findAll = function(properties) {
      var keys;
      if (properties == null) {
        properties = {};
      }
      keys = Object.keys(properties);
      if (keys.length === 0) {
        return null;
      }
      return this.variables.filter(function(v) {
        return keys.every(function(k) {
          var a, b, ref1;
          if (((ref1 = v[k]) != null ? ref1.isEqual : void 0) != null) {
            return v[k].isEqual(properties[k]);
          } else if (Array.isArray(b = properties[k])) {
            a = v[k];
            return a.length === b.length && a.every(function(value) {
              return indexOf.call(b, value) >= 0;
            });
          } else {
            return v[k] === properties[k];
          }
        });
      });
    };

    VariablesCollection.prototype.updateCollection = function(collection, paths) {
      var created, destroyed, i, j, l, len, len1, len2, name1, path, pathsCollection, pathsToDestroy, ref1, ref2, ref3, ref4, ref5, ref6, ref7, remainingPaths, results, updated, v;
      pathsCollection = {};
      remainingPaths = [];
      for (i = 0, len = collection.length; i < len; i++) {
        v = collection[i];
        if (pathsCollection[name1 = v.path] == null) {
          pathsCollection[name1] = [];
        }
        pathsCollection[v.path].push(v);
        if (ref1 = v.path, indexOf.call(remainingPaths, ref1) < 0) {
          remainingPaths.push(v.path);
        }
      }
      results = {
        created: [],
        destroyed: [],
        updated: []
      };
      for (path in pathsCollection) {
        collection = pathsCollection[path];
        ref2 = this.updatePathCollection(path, collection, true) || {}, created = ref2.created, updated = ref2.updated, destroyed = ref2.destroyed;
        if (created != null) {
          results.created = results.created.concat(created);
        }
        if (updated != null) {
          results.updated = results.updated.concat(updated);
        }
        if (destroyed != null) {
          results.destroyed = results.destroyed.concat(destroyed);
        }
      }
      if (paths != null) {
        pathsToDestroy = collection.length === 0 ? paths : paths.filter(function(p) {
          return indexOf.call(remainingPaths, p) < 0;
        });
        for (j = 0, len1 = pathsToDestroy.length; j < len1; j++) {
          path = pathsToDestroy[j];
          ref3 = this.updatePathCollection(path, collection, true) || {}, created = ref3.created, updated = ref3.updated, destroyed = ref3.destroyed;
          if (created != null) {
            results.created = results.created.concat(created);
          }
          if (updated != null) {
            results.updated = results.updated.concat(updated);
          }
          if (destroyed != null) {
            results.destroyed = results.destroyed.concat(destroyed);
          }
        }
      }
      results = this.updateDependencies(results);
      if (((ref4 = results.created) != null ? ref4.length : void 0) === 0) {
        delete results.created;
      }
      if (((ref5 = results.updated) != null ? ref5.length : void 0) === 0) {
        delete results.updated;
      }
      if (((ref6 = results.destroyed) != null ? ref6.length : void 0) === 0) {
        delete results.destroyed;
      }
      if (results.destroyed != null) {
        ref7 = results.destroyed;
        for (l = 0, len2 = ref7.length; l < len2; l++) {
          v = ref7[l];
          this.deleteVariableReferences(v);
        }
      }
      return this.emitChangeEvent(results);
    };

    VariablesCollection.prototype.updatePathCollection = function(path, collection, batch) {
      var destroyed, i, j, len, len1, pathCollection, results, status, v;
      if (batch == null) {
        batch = false;
      }
      pathCollection = this.variablesByPath[path] || [];
      results = this.addMany(collection, true);
      destroyed = [];
      for (i = 0, len = pathCollection.length; i < len; i++) {
        v = pathCollection[i];
        status = this.getVariableStatusInCollection(v, collection)[0];
        if (status === 'created') {
          destroyed.push(this.remove(v, true));
        }
      }
      if (destroyed.length > 0) {
        results.destroyed = destroyed;
      }
      if (batch) {
        return results;
      } else {
        results = this.updateDependencies(results);
        for (j = 0, len1 = destroyed.length; j < len1; j++) {
          v = destroyed[j];
          this.deleteVariableReferences(v);
        }
        return this.emitChangeEvent(results);
      }
    };

    VariablesCollection.prototype.add = function(variable, batch) {
      var previousVariable, ref1, status;
      if (batch == null) {
        batch = false;
      }
      ref1 = this.getVariableStatus(variable), status = ref1[0], previousVariable = ref1[1];
      variable["default"] || (variable["default"] = variable.path.match(/\/.pigments$/));
      switch (status) {
        case 'moved':
          previousVariable.range = variable.range;
          previousVariable.bufferRange = variable.bufferRange;
          return void 0;
        case 'updated':
          return this.updateVariable(previousVariable, variable, batch);
        case 'created':
          return this.createVariable(variable, batch);
      }
    };

    VariablesCollection.prototype.addMany = function(variables, batch) {
      var i, len, res, results, status, v, variable;
      if (batch == null) {
        batch = false;
      }
      results = {};
      for (i = 0, len = variables.length; i < len; i++) {
        variable = variables[i];
        res = this.add(variable, true);
        if (res != null) {
          status = res[0], v = res[1];
          if (results[status] == null) {
            results[status] = [];
          }
          results[status].push(v);
        }
      }
      if (batch) {
        return results;
      } else {
        return this.emitChangeEvent(this.updateDependencies(results));
      }
    };

    VariablesCollection.prototype.remove = function(variable, batch) {
      var results;
      if (batch == null) {
        batch = false;
      }
      variable = this.find(variable);
      if (variable == null) {
        return;
      }
      this.variables = this.variables.filter(function(v) {
        return v !== variable;
      });
      if (variable.isColor) {
        this.colorVariables = this.colorVariables.filter(function(v) {
          return v !== variable;
        });
      }
      if (batch) {
        return variable;
      } else {
        results = this.updateDependencies({
          destroyed: [variable]
        });
        this.deleteVariableReferences(variable);
        return this.emitChangeEvent(results);
      }
    };

    VariablesCollection.prototype.removeMany = function(variables, batch) {
      var destroyed, i, j, len, len1, results, v, variable;
      if (batch == null) {
        batch = false;
      }
      destroyed = [];
      for (i = 0, len = variables.length; i < len; i++) {
        variable = variables[i];
        destroyed.push(this.remove(variable, true));
      }
      results = {
        destroyed: destroyed
      };
      if (batch) {
        return results;
      } else {
        results = this.updateDependencies(results);
        for (j = 0, len1 = destroyed.length; j < len1; j++) {
          v = destroyed[j];
          if (v != null) {
            this.deleteVariableReferences(v);
          }
        }
        return this.emitChangeEvent(results);
      }
    };

    VariablesCollection.prototype.deleteVariablesForPaths = function(paths) {
      return this.removeMany(this.getVariablesForPaths(paths));
    };

    VariablesCollection.prototype.deleteVariableReferences = function(variable) {
      var a, dependencies;
      dependencies = this.getVariableDependencies(variable);
      a = this.variablesByPath[variable.path];
      a.splice(a.indexOf(variable), 1);
      a = this.variableNames;
      a.splice(a.indexOf(variable.name), 1);
      this.removeDependencies(variable.name, dependencies);
      return delete this.dependencyGraph[variable.name];
    };

    VariablesCollection.prototype.getContext = function() {
      if (ColorContext == null) {
        ColorContext = require('./color-context');
      }
      if (registry == null) {
        registry = require('./color-expressions');
      }
      return new ColorContext({
        variables: this.variables,
        colorVariables: this.colorVariables,
        registry: registry
      });
    };

    VariablesCollection.prototype.evaluateVariables = function(variables, callback) {
      var iteration, remainingVariables, updated;
      updated = [];
      remainingVariables = variables.slice();
      iteration = (function(_this) {
        return function(cb) {
          var end, isColor, start, v, wasColor;
          start = new Date;
          end = new Date;
          while (remainingVariables.length > 0 && end - start < 100) {
            v = remainingVariables.shift();
            wasColor = v.isColor;
            _this.evaluateVariableColor(v, wasColor);
            isColor = v.isColor;
            if (isColor !== wasColor) {
              updated.push(v);
              if (isColor) {
                _this.buildDependencyGraph(v);
              }
              end = new Date;
            }
          }
          if (remainingVariables.length > 0) {
            return requestAnimationFrame(function() {
              return iteration(cb);
            });
          } else {
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this);
      return iteration((function(_this) {
        return function() {
          if (updated.length > 0) {
            _this.emitChangeEvent(_this.updateDependencies({
              updated: updated
            }));
          }
          return typeof callback === "function" ? callback(updated) : void 0;
        };
      })(this));
    };

    VariablesCollection.prototype.updateVariable = function(previousVariable, variable, batch) {
      var added, newDependencies, previousDependencies, ref1, removed;
      previousDependencies = this.getVariableDependencies(previousVariable);
      previousVariable.value = variable.value;
      previousVariable.range = variable.range;
      previousVariable.bufferRange = variable.bufferRange;
      this.evaluateVariableColor(previousVariable, previousVariable.isColor);
      newDependencies = this.getVariableDependencies(previousVariable);
      ref1 = this.diffArrays(previousDependencies, newDependencies), removed = ref1.removed, added = ref1.added;
      this.removeDependencies(variable.name, removed);
      this.addDependencies(variable.name, added);
      if (batch) {
        return ['updated', previousVariable];
      } else {
        return this.emitChangeEvent(this.updateDependencies({
          updated: [previousVariable]
        }));
      }
    };

    VariablesCollection.prototype.restoreVariable = function(variable) {
      var base, name1;
      if (Color == null) {
        Color = require('./color');
      }
      this.variableNames.push(variable.name);
      this.variables.push(variable);
      variable.id = nextId++;
      if (variable.isColor) {
        variable.color = new Color(variable.color);
        variable.color.variables = variable.variables;
        this.colorVariables.push(variable);
        delete variable.variables;
      }
      if ((base = this.variablesByPath)[name1 = variable.path] == null) {
        base[name1] = [];
      }
      this.variablesByPath[variable.path].push(variable);
      return this.buildDependencyGraph(variable);
    };

    VariablesCollection.prototype.createVariable = function(variable, batch) {
      var base, name1;
      this.variableNames.push(variable.name);
      this.variables.push(variable);
      variable.id = nextId++;
      if ((base = this.variablesByPath)[name1 = variable.path] == null) {
        base[name1] = [];
      }
      this.variablesByPath[variable.path].push(variable);
      this.evaluateVariableColor(variable);
      this.buildDependencyGraph(variable);
      if (batch) {
        return ['created', variable];
      } else {
        return this.emitChangeEvent(this.updateDependencies({
          created: [variable]
        }));
      }
    };

    VariablesCollection.prototype.evaluateVariableColor = function(variable, wasColor) {
      var color, context;
      if (wasColor == null) {
        wasColor = false;
      }
      context = this.getContext();
      color = context.readColor(variable.value, true);
      if (color != null) {
        if (wasColor && color.isEqual(variable.color)) {
          return false;
        }
        variable.color = color;
        variable.isColor = true;
        if (indexOf.call(this.colorVariables, variable) < 0) {
          this.colorVariables.push(variable);
        }
        return true;
      } else if (wasColor) {
        delete variable.color;
        variable.isColor = false;
        this.colorVariables = this.colorVariables.filter(function(v) {
          return v !== variable;
        });
        return true;
      }
    };

    VariablesCollection.prototype.getVariableStatus = function(variable) {
      if (this.variablesByPath[variable.path] == null) {
        return ['created', variable];
      }
      return this.getVariableStatusInCollection(variable, this.variablesByPath[variable.path]);
    };

    VariablesCollection.prototype.getVariableStatusInCollection = function(variable, collection) {
      var i, len, status, v;
      for (i = 0, len = collection.length; i < len; i++) {
        v = collection[i];
        status = this.compareVariables(v, variable);
        switch (status) {
          case 'identical':
            return ['unchanged', v];
          case 'move':
            return ['moved', v];
          case 'update':
            return ['updated', v];
        }
      }
      return ['created', variable];
    };

    VariablesCollection.prototype.compareVariables = function(v1, v2) {
      var sameLine, sameName, sameRange, sameValue;
      sameName = v1.name === v2.name;
      sameValue = v1.value === v2.value;
      sameLine = v1.line === v2.line;
      sameRange = v1.range[0] === v2.range[0] && v1.range[1] === v2.range[1];
      if ((v1.bufferRange != null) && (v2.bufferRange != null)) {
        sameRange && (sameRange = v1.bufferRange.isEqual(v2.bufferRange));
      }
      if (sameName && sameValue) {
        if (sameRange) {
          return 'identical';
        } else {
          return 'move';
        }
      } else if (sameName) {
        if (sameRange || sameLine) {
          return 'update';
        } else {
          return 'different';
        }
      }
    };

    VariablesCollection.prototype.buildDependencyGraph = function(variable) {
      var a, base, dependencies, dependency, i, len, ref1, results1;
      dependencies = this.getVariableDependencies(variable);
      results1 = [];
      for (i = 0, len = dependencies.length; i < len; i++) {
        dependency = dependencies[i];
        a = (base = this.dependencyGraph)[dependency] != null ? base[dependency] : base[dependency] = [];
        if (ref1 = variable.name, indexOf.call(a, ref1) < 0) {
          results1.push(a.push(variable.name));
        } else {
          results1.push(void 0);
        }
      }
      return results1;
    };

    VariablesCollection.prototype.getVariableDependencies = function(variable) {
      var dependencies, i, len, ref1, ref2, ref3, v, variables;
      dependencies = [];
      if (ref1 = variable.value, indexOf.call(this.variableNames, ref1) >= 0) {
        dependencies.push(variable.value);
      }
      if (((ref2 = variable.color) != null ? (ref3 = ref2.variables) != null ? ref3.length : void 0 : void 0) > 0) {
        variables = variable.color.variables;
        for (i = 0, len = variables.length; i < len; i++) {
          v = variables[i];
          if (indexOf.call(dependencies, v) < 0) {
            dependencies.push(v);
          }
        }
      }
      return dependencies;
    };

    VariablesCollection.prototype.collectVariablesByName = function(names) {
      var i, len, ref1, ref2, v, variables;
      variables = [];
      ref1 = this.variables;
      for (i = 0, len = ref1.length; i < len; i++) {
        v = ref1[i];
        if (ref2 = v.name, indexOf.call(names, ref2) >= 0) {
          variables.push(v);
        }
      }
      return variables;
    };

    VariablesCollection.prototype.removeDependencies = function(from, to) {
      var dependencies, i, len, results1, v;
      results1 = [];
      for (i = 0, len = to.length; i < len; i++) {
        v = to[i];
        if (dependencies = this.dependencyGraph[v]) {
          dependencies.splice(dependencies.indexOf(from), 1);
          if (dependencies.length === 0) {
            results1.push(delete this.dependencyGraph[v]);
          } else {
            results1.push(void 0);
          }
        } else {
          results1.push(void 0);
        }
      }
      return results1;
    };

    VariablesCollection.prototype.addDependencies = function(from, to) {
      var base, i, len, results1, v;
      results1 = [];
      for (i = 0, len = to.length; i < len; i++) {
        v = to[i];
        if ((base = this.dependencyGraph)[v] == null) {
          base[v] = [];
        }
        results1.push(this.dependencyGraph[v].push(from));
      }
      return results1;
    };

    VariablesCollection.prototype.updateDependencies = function(arg) {
      var created, createdVariableNames, dependencies, destroyed, dirtyVariableNames, dirtyVariables, i, j, l, len, len1, len2, name, updated, variable, variables;
      created = arg.created, updated = arg.updated, destroyed = arg.destroyed;
      this.updateColorVariablesExpression();
      variables = [];
      dirtyVariableNames = [];
      if (created != null) {
        variables = variables.concat(created);
        createdVariableNames = created.map(function(v) {
          return v.name;
        });
      } else {
        createdVariableNames = [];
      }
      if (updated != null) {
        variables = variables.concat(updated);
      }
      if (destroyed != null) {
        variables = variables.concat(destroyed);
      }
      variables = variables.filter(function(v) {
        return v != null;
      });
      for (i = 0, len = variables.length; i < len; i++) {
        variable = variables[i];
        if (dependencies = this.dependencyGraph[variable.name]) {
          for (j = 0, len1 = dependencies.length; j < len1; j++) {
            name = dependencies[j];
            if (indexOf.call(dirtyVariableNames, name) < 0 && indexOf.call(createdVariableNames, name) < 0) {
              dirtyVariableNames.push(name);
            }
          }
        }
      }
      dirtyVariables = this.collectVariablesByName(dirtyVariableNames);
      for (l = 0, len2 = dirtyVariables.length; l < len2; l++) {
        variable = dirtyVariables[l];
        if (this.evaluateVariableColor(variable, variable.isColor)) {
          if (updated == null) {
            updated = [];
          }
          updated.push(variable);
        }
      }
      return {
        created: created,
        destroyed: destroyed,
        updated: updated
      };
    };

    VariablesCollection.prototype.emitChangeEvent = function(arg) {
      var created, destroyed, updated;
      created = arg.created, destroyed = arg.destroyed, updated = arg.updated;
      if ((created != null ? created.length : void 0) || (destroyed != null ? destroyed.length : void 0) || (updated != null ? updated.length : void 0)) {
        this.updateColorVariablesExpression();
        return this.emitter.emit('did-change', {
          created: created,
          destroyed: destroyed,
          updated: updated
        });
      }
    };

    VariablesCollection.prototype.updateColorVariablesExpression = function() {
      var colorVariables;
      if (registry == null) {
        registry = require('./color-expressions');
      }
      colorVariables = this.getColorVariables();
      if (colorVariables.length > 0) {
        if (ColorExpression == null) {
          ColorExpression = require('./color-expression');
        }
        return registry.addExpression(ColorExpression.colorExpressionForColorVariables(colorVariables));
      } else {
        return registry.removeExpression('pigments:variables');
      }
    };

    VariablesCollection.prototype.diffArrays = function(a, b) {
      var added, i, j, len, len1, removed, v;
      removed = [];
      added = [];
      for (i = 0, len = a.length; i < len; i++) {
        v = a[i];
        if (indexOf.call(b, v) < 0) {
          removed.push(v);
        }
      }
      for (j = 0, len1 = b.length; j < len1; j++) {
        v = b[j];
        if (indexOf.call(a, v) < 0) {
          added.push(v);
        }
      }
      return {
        removed: removed,
        added: added
      };
    };

    VariablesCollection.prototype.serialize = function() {
      return {
        deserializer: 'VariablesCollection',
        content: this.variables.map(function(v) {
          var res;
          res = {
            name: v.name,
            value: v.value,
            path: v.path,
            range: v.range,
            line: v.line
          };
          if (v.isAlternate) {
            res.isAlternate = true;
          }
          if (v.noNamePrefix) {
            res.noNamePrefix = true;
          }
          if (v["default"]) {
            res["default"] = true;
          }
          if (v.isColor) {
            res.isColor = true;
            res.color = v.color.serialize();
            if (v.color.variables != null) {
              res.variables = v.color.variables;
            }
          }
          return res;
        })
      };
    };

    return VariablesCollection;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi92YXJpYWJsZXMtY29sbGVjdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHlGQUFBO0lBQUE7O0VBQUEsTUFBNEQsRUFBNUQsRUFBQyxnQkFBRCxFQUFVLHdCQUFWLEVBQTJCLHFCQUEzQixFQUF5QyxjQUF6QyxFQUFnRDs7RUFFaEQsTUFBQSxHQUFTOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDSixtQkFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLEtBQUQ7YUFDUixJQUFBLG1CQUFBLENBQW9CLEtBQXBCO0lBRFE7O0lBR2QsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsbUJBQUMsQ0FBQSxTQUF2QixFQUFrQyxRQUFsQyxFQUE0QztNQUMxQyxHQUFBLEVBQUssU0FBQTtlQUFHLElBQUMsQ0FBQSxTQUFTLENBQUM7TUFBZCxDQURxQztNQUUxQyxVQUFBLEVBQVksSUFGOEI7S0FBNUM7O0lBS2EsNkJBQUMsS0FBRDs7UUFDWCxVQUFXLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQzs7TUFFM0IsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsSUFBQyxDQUFBLEtBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxVQUFELGlCQUFZLEtBQUssQ0FBRSxnQkFBbkI7SUFOVzs7a0NBUWIsV0FBQSxHQUFhLFNBQUMsUUFBRDthQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsUUFBMUI7SUFEVzs7a0NBR2IsZUFBQSxHQUFpQixTQUFDLFFBQUQ7QUFDZixVQUFBO01BQUEsSUFBYyxnQkFBZDtBQUFBLGVBQUE7O01BQ0EsSUFBRyxJQUFDLENBQUEsV0FBSjtlQUNFLFFBQUEsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLFVBQUEsR0FBYSxJQUFDLENBQUEsT0FBTyxDQUFDLEVB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QUFEO0FBQ3RCLGNBQUE7VUFBQSxHQUFBLEdBQU07WUFDSixJQUFBLEVBQU0sQ0FBQyxDQUFDLElBREo7WUFFSixLQUFBLEVBQU8sQ0FBQyxDQUFDLEtBRkw7WUFHSixJQUFBLEVBQU0sQ0FBQyxDQUFDLElBSEo7WUFJSixLQUFBLEVBQU8sQ0FBQyxDQUFDLEtBSkw7WUFLSixJQUFBLEVBQU0sQ0FBQyxDQUFDLElBTEo7O1VBUU4sSUFBMEIsQ0FBQyxDQUFDLFdBQTVCO1lBQUEsR0FBRyxDQUFDLFdBQUosR0FBa0IsS0FBbEI7O1VBQ0EsSUFBMkIsQ0FBQyxDQUFDLFlBQTdCO1lBQUEsR0FBRyxDQUFDLFlBQUosR0FBbUIsS0FBbkI7O1VBQ0EsSUFBc0IsQ0FBQyxFQUFDLE9BQUQsRUFBdkI7WUFBQSxHQUFHLEVBQUMsT0FBRCxFQUFILEdBQWMsS0FBZDs7VUFFQSxJQUFHLENBQUMsQ0FBQyxPQUFMO1lBQ0UsR0FBRyxDQUFDLE9BQUosR0FBYztZQUNkLEdBQUcsQ0FBQyxLQUFKLEdBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFSLENBQUE7WUFDWixJQUFxQyx5QkFBckM7Y0FBQSxHQUFHLENBQUMsU0FBSixHQUFnQixDQUFDLENBQUMsS0FBSyxDQUFDLFVBQXhCO2FBSEY7O2lCQUtBO1FBbEJzQixDQUFmLENBRlg7O0lBRFM7Ozs7O0FBbmRiIiwic291cmNlc0NvbnRlbnQiOlsiW0VtaXR0ZXIsIENvbG9yRXhwcmVzc2lvbiwgQ29sb3JDb250ZXh0LCBDb2xvciwgcmVnaXN0cnldID0gW11cblxubmV4dElkID0gMFxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBWYXJpYWJsZXNDb2xsZWN0aW9uXG4gIEBkZXNlcmlhbGl6ZTogKHN0YXRlKSAtPlxuICAgIG5ldyBWYXJpYWJsZXNDb2xsZWN0aW9uKHN0YXRlKVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCAnbGVuZ3RoJywge1xuICAgIGdldDogLT4gQHZhcmlhYmxlcy5sZW5ndGhcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH1cblxuICBjb25zdHJ1Y3RvcjogKHN0YXRlKSAtPlxuICAgIEVtaXR0ZXIgPz0gcmVxdWlyZSgnYXRvbScpLkVtaXR0ZXJcblxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIEByZXNldCgpXG4gICAgQGluaXRpYWxpemUoc3RhdGU/LmNvbnRlbnQpXG5cbiAgb25EaWRDaGFuZ2U6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWNoYW5nZScsIGNhbGxiYWNrXG5cbiAgb25jZUluaXRpYWxpemVkOiAoY2FsbGJhY2spIC0+XG4gICAgcmV0dXJuIHVubGVzcyBjYWxsYmFjaz9cbiAgICBpZiBAaW5pdGlhbGl6ZWRcbiAgICAgIGNhbGxiYWNrKClcbiAgICBlbHNlXG4gICAgICBkaXNwb3NhYmxlID0gQGVtaXR0ZXIub24gJ2RpZC1pbml0aWFsaXplJywgLT5cbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgICAgY2FsbGJhY2soKVxuXG4gIGluaXRpYWxpemU6IChjb250ZW50PVtdKSAtPlxuICAgIGl0ZXJhdGlvbiA9IChjYikgPT5cbiAgICAgIHN0YXJ0ID0gbmV3IERhdGVcbiAgICAgIGVuZCA9IG5ldyBEYXRlXG5cbiAgICAgIHdoaWxlIGNvbnRlbnQubGVuZ3RoID4gMCBhbmQgZW5kIC0gc3RhcnQgPCAxMDBcbiAgICAgICAgdiA9IGNvbnRlbnQuc2hpZnQoKVxuICAgICAgICBAcmVzdG9yZVZhcmlhYmxlKHYpXG5cbiAgICAgIGlmIGNvbnRlbnQubGVuZ3RoID4gMFxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoLT4gaXRlcmF0aW9uKGNiKSlcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/KClcblxuICAgIGl0ZXJhdGlvbiA9PlxuICAgICAgQGluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWluaXRpYWxpemUnKVxuXG4gIHJlc2V0OiAtPlxuICAgIEB2YXJpYWJsZXMgPSBbXVxuICAgIEB2YXJpYWJsZU5hbWVzID0gW11cbiAgICBAY29sb3JWYXJpYWJsZXMgPSBbXVxuICAgIEB2YXJpYWJsZXNCeVBhdGggPSB7fVxuICAgIEBkZXBlbmRlbmN5R3JhcGggPSB7fVxuXG4gIGdldFZhcmlhYmxlczogLT4gQHZhcmlhYmxlcy5zbGljZSgpXG5cbiAgZ2V0Tm9uQ29sb3JWYXJpYWJsZXM6IC0+IEBnZXRWYXJpYWJsZXMoKS5maWx0ZXIgKHYpIC0+IG5vdCB2LmlzQ29sb3JcblxuICBnZXRWYXJpYWJsZXNGb3JQYXRoOiAocGF0aCkgLT4gQHZhcmlhYmxlc0J5UGF0aFtwYXRoXSA/IFtdXG5cbiAgZ2V0VmFyaWFibGVCeU5hbWU6IChuYW1lKSAtPiBAY29sbGVjdFZhcmlhYmxlc0J5TmFtZShbbmFtZV0pLnBvcCgpXG5cbiAgZ2V0VmFyaWFibGVCeUlkOiAoaWQpIC0+IHJldHVybiB2IGZvciB2IGluIEB2YXJpYWJsZXMgd2hlbiB2LmlkIGlzIGlkXG5cbiAgZ2V0VmFyaWFibGVzRm9yUGF0aHM6IChwYXRocykgLT5cbiAgICByZXMgPSBbXVxuXG4gICAgZm9yIHAgaW4gcGF0aHMgd2hlbiBwIG9mIEB2YXJpYWJsZXNCeVBhdGhcbiAgICAgIHJlcyA9IHJlcy5jb25jYXQoQHZhcmlhYmxlc0J5UGF0aFtwXSlcblxuICAgIHJlc1xuXG4gIGdldENvbG9yVmFyaWFibGVzOiAtPiBAY29sb3JWYXJpYWJsZXMuc2xpY2UoKVxuXG4gIGZpbmQ6IChwcm9wZXJ0aWVzKSAtPiBAZmluZEFsbChwcm9wZXJ0aWVzKT9bMF1cblxuICBmaW5kQWxsOiAocHJvcGVydGllcz17fSkgLT5cbiAgICBrZXlzID0gT2JqZWN0LmtleXMocHJvcGVydGllcylcbiAgICByZXR1cm4gbnVsbCBpZiBrZXlzLmxlbmd0aCBpcyAwXG5cbiAgICBAdmFyaWFibGVzLmZpbHRlciAodikgLT4ga2V5cy5ldmVyeSAoaykgLT5cbiAgICAgIGlmIHZba10/LmlzRXF1YWw/XG4gICAgICAgIHZba10uaXNFcXVhbChwcm9wZXJ0aWVzW2tdKVxuICAgICAgZWxzZSBpZiBBcnJheS5pc0FycmF5KGIgPSBwcm9wZXJ0aWVzW2tdKVxuICAgICAgICBhID0gdltrXVxuICAgICAgICBhLmxlbmd0aCBpcyBiLmxlbmd0aCBhbmQgYS5ldmVyeSAodmFsdWUpIC0+IHZhbHVlIGluIGJcbiAgICAgIGVsc2VcbiAgICAgICAgdltrXSBpcyBwcm9wZXJ0aWVzW2tdXG5cbiAgdXBkYXRlQ29sbGVjdGlvbjogKGNvbGxlY3Rpb24sIHBhdGhzKSAtPlxuICAgIHBhdGhzQ29sbGVjdGlvbiA9IHt9XG4gICAgcmVtYWluaW5nUGF0aHMgPSBbXVxuXG4gICAgZm9yIHYgaW4gY29sbGVjdGlvblxuICAgICAgcGF0aHNDb2xsZWN0aW9uW3YucGF0aF0gPz0gW11cbiAgICAgIHBhdGhzQ29sbGVjdGlvblt2LnBhdGhdLnB1c2godilcbiAgICAgIHJlbWFpbmluZ1BhdGhzLnB1c2godi5wYXRoKSB1bmxlc3Mgdi5wYXRoIGluIHJlbWFpbmluZ1BhdGhzXG5cbiAgICByZXN1bHRzID0ge1xuICAgICAgY3JlYXRlZDogW11cbiAgICAgIGRlc3Ryb3llZDogW11cbiAgICAgIHVwZGF0ZWQ6IFtdXG4gICAgfVxuXG4gICAgZm9yIHBhdGgsIGNvbGxlY3Rpb24gb2YgcGF0aHNDb2xsZWN0aW9uXG4gICAgICB7Y3JlYXRlZCwgdXBkYXRlZCwgZGVzdHJveWVkfSA9IEB1cGRhdGVQYXRoQ29sbGVjdGlvbihwYXRoLCBjb2xsZWN0aW9uLCB0cnVlKSBvciB7fVxuXG4gICAgICByZXN1bHRzLmNyZWF0ZWQgPSByZXN1bHRzLmNyZWF0ZWQuY29uY2F0KGNyZWF0ZWQpIGlmIGNyZWF0ZWQ/XG4gICAgICByZXN1bHRzLnVwZGF0ZWQgPSByZXN1bHRzLnVwZGF0ZWQuY29uY2F0KHVwZGF0ZWQpIGlmIHVwZGF0ZWQ/XG4gICAgICByZXN1bHRzLmRlc3Ryb3llZCA9IHJlc3VsdHMuZGVzdHJveWVkLmNvbmNhdChkZXN0cm95ZWQpIGlmIGRlc3Ryb3llZD9cblxuICAgIGlmIHBhdGhzP1xuICAgICAgcGF0aHNUb0Rlc3Ryb3kgPSBpZiBjb2xsZWN0aW9uLmxlbmd0aCBpcyAwXG4gICAgICAgIHBhdGhzXG4gICAgICBlbHNlXG4gICAgICAgIHBhdGhzLmZpbHRlciAocCkgLT4gcCBub3QgaW4gcmVtYWluaW5nUGF0aHNcblxuICAgICAgZm9yIHBhdGggaW4gcGF0aHNUb0Rlc3Ryb3lcbiAgICAgICAge2NyZWF0ZWQsIHVwZGF0ZWQsIGRlc3Ryb3llZH0gPSBAdXBkYXRlUGF0aENvbGxlY3Rpb24ocGF0aCwgY29sbGVjdGlvbiwgdHJ1ZSkgb3Ige31cblxuICAgICAgICByZXN1bHRzLmNyZWF0ZWQgPSByZXN1bHRzLmNyZWF0ZWQuY29uY2F0KGNyZWF0ZWQpIGlmIGNyZWF0ZWQ/XG4gICAgICAgIHJlc3VsdHMudXBkYXRlZCA9IHJlc3VsdHMudXBkYXRlZC5jb25jYXQodXBkYXRlZCkgaWYgdXBkYXRlZD9cbiAgICAgICAgcmVzdWx0cy5kZXN0cm95ZWQgPSByZXN1bHRzLmRlc3Ryb3llZC5jb25jYXQoZGVzdHJveWVkKSBpZiBkZXN0cm95ZWQ/XG5cbiAgICByZXN1bHRzID0gQHVwZGF0ZURlcGVuZGVuY2llcyhyZXN1bHRzKVxuXG4gICAgZGVsZXRlIHJlc3VsdHMuY3JlYXRlZCBpZiByZXN1bHRzLmNyZWF0ZWQ/Lmxlbmd0aCBpcyAwXG4gICAgZGVsZXRlIHJlc3VsdHMudXBkYXRlZCBpZiByZXN1bHRzLnVwZGF0ZWQ/Lmxlbmd0aCBpcyAwXG4gICAgZGVsZXRlIHJlc3VsdHMuZGVzdHJveWVkIGlmIHJlc3VsdHMuZGVzdHJveWVkPy5sZW5ndGggaXMgMFxuXG4gICAgaWYgcmVzdWx0cy5kZXN0cm95ZWQ/XG4gICAgICBAZGVsZXRlVmFyaWFibGVSZWZlcmVuY2VzKHYpIGZvciB2IGluIHJlc3VsdHMuZGVzdHJveWVkXG5cbiAgICBAZW1pdENoYW5nZUV2ZW50KHJlc3VsdHMpXG5cbiAgdXBkYXRlUGF0aENvbGxlY3Rpb246IChwYXRoLCBjb2xsZWN0aW9uLCBiYXRjaD1mYWxzZSkgLT5cbiAgICBwYXRoQ29sbGVjdGlvbiA9IEB2YXJpYWJsZXNCeVBhdGhbcGF0aF0gb3IgW11cblxuICAgIHJlc3VsdHMgPSBAYWRkTWFueShjb2xsZWN0aW9uLCB0cnVlKVxuXG4gICAgZGVzdHJveWVkID0gW11cbiAgICBmb3IgdiBpbiBwYXRoQ29sbGVjdGlvblxuICAgICAgW3N0YXR1c10gPSBAZ2V0VmFyaWFibGVTdGF0dXNJbkNvbGxlY3Rpb24odiwgY29sbGVjdGlvbilcbiAgICAgIGRlc3Ryb3llZC5wdXNoKEByZW1vdmUodiwgdHJ1ZSkpIGlmIHN0YXR1cyBpcyAnY3JlYXRlZCdcblxuICAgIHJlc3VsdHMuZGVzdHJveWVkID0gZGVzdHJveWVkIGlmIGRlc3Ryb3llZC5sZW5ndGggPiAwXG5cbiAgICBpZiBiYXRjaFxuICAgICAgcmVzdWx0c1xuICAgIGVsc2VcbiAgICAgIHJlc3VsdHMgPSBAdXBkYXRlRGVwZW5kZW5jaWVzKHJlc3VsdHMpXG4gICAgICBAZGVsZXRlVmFyaWFibGVSZWZlcmVuY2VzKHYpIGZvciB2IGluIGRlc3Ryb3llZFxuICAgICAgQGVtaXRDaGFuZ2VFdmVudChyZXN1bHRzKVxuXG4gIGFkZDogKHZhcmlhYmxlLCBiYXRjaD1mYWxzZSkgLT5cbiAgICBbc3RhdHVzLCBwcmV2aW91c1ZhcmlhYmxlXSA9IEBnZXRWYXJpYWJsZVN0YXR1cyh2YXJpYWJsZSlcblxuICAgIHZhcmlhYmxlLmRlZmF1bHQgfHw9IHZhcmlhYmxlLnBhdGgubWF0Y2ggL1xcLy5waWdtZW50cyQvXG5cbiAgICBzd2l0Y2ggc3RhdHVzXG4gICAgICB3aGVuICdtb3ZlZCdcbiAgICAgICAgcHJldmlvdXNWYXJpYWJsZS5yYW5nZSA9IHZhcmlhYmxlLnJhbmdlXG4gICAgICAgIHByZXZpb3VzVmFyaWFibGUuYnVmZmVyUmFuZ2UgPSB2YXJpYWJsZS5idWZmZXJSYW5nZVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgICB3aGVuICd1cGRhdGVkJ1xuICAgICAgICBAdXBkYXRlVmFyaWFibGUocHJldmlvdXNWYXJpYWJsZSwgdmFyaWFibGUsIGJhdGNoKVxuICAgICAgd2hlbiAnY3JlYXRlZCdcbiAgICAgICAgQGNyZWF0ZVZhcmlhYmxlKHZhcmlhYmxlLCBiYXRjaClcblxuICBhZGRNYW55OiAodmFyaWFibGVzLCBiYXRjaD1mYWxzZSkgLT5cbiAgICByZXN1bHRzID0ge31cblxuICAgIGZvciB2YXJpYWJsZSBpbiB2YXJpYWJsZXNcbiAgICAgIHJlcyA9IEBhZGQodmFyaWFibGUsIHRydWUpXG4gICAgICBpZiByZXM/XG4gICAgICAgIFtzdGF0dXMsIHZdID0gcmVzXG5cbiAgICAgICAgcmVzdWx0c1tzdGF0dXNdID89IFtdXG4gICAgICAgIHJlc3VsdHNbc3RhdHVzXS5wdXNoKHYpXG5cbiAgICBpZiBiYXRjaFxuICAgICAgcmVzdWx0c1xuICAgIGVsc2VcbiAgICAgIEBlbWl0Q2hhbmdlRXZlbnQoQHVwZGF0ZURlcGVuZGVuY2llcyhyZXN1bHRzKSlcblxuICByZW1vdmU6ICh2YXJpYWJsZSwgYmF0Y2g9ZmFsc2UpIC0+XG4gICAgdmFyaWFibGUgPSBAZmluZCh2YXJpYWJsZSlcblxuICAgIHJldHVybiB1bmxlc3MgdmFyaWFibGU/XG5cbiAgICBAdmFyaWFibGVzID0gQHZhcmlhYmxlcy5maWx0ZXIgKHYpIC0+IHYgaXNudCB2YXJpYWJsZVxuICAgIGlmIHZhcmlhYmxlLmlzQ29sb3JcbiAgICAgIEBjb2xvclZhcmlhYmxlcyA9IEBjb2xvclZhcmlhYmxlcy5maWx0ZXIgKHYpIC0+IHYgaXNudCB2YXJpYWJsZVxuXG4gICAgaWYgYmF0Y2hcbiAgICAgIHJldHVybiB2YXJpYWJsZVxuICAgIGVsc2VcbiAgICAgIHJlc3VsdHMgPSBAdXBkYXRlRGVwZW5kZW5jaWVzKGRlc3Ryb3llZDogW3ZhcmlhYmxlXSlcblxuICAgICAgQGRlbGV0ZVZhcmlhYmxlUmVmZXJlbmNlcyh2YXJpYWJsZSlcbiAgICAgIEBlbWl0Q2hhbmdlRXZlbnQocmVzdWx0cylcblxuICByZW1vdmVNYW55OiAodmFyaWFibGVzLCBiYXRjaD1mYWxzZSkgLT5cbiAgICBkZXN0cm95ZWQgPSBbXVxuICAgIGZvciB2YXJpYWJsZSBpbiB2YXJpYWJsZXNcbiAgICAgIGRlc3Ryb3llZC5wdXNoIEByZW1vdmUodmFyaWFibGUsIHRydWUpXG5cbiAgICByZXN1bHRzID0ge2Rlc3Ryb3llZH1cblxuICAgIGlmIGJhdGNoXG4gICAgICByZXN1bHRzXG4gICAgZWxzZVxuICAgICAgcmVzdWx0cyA9IEB1cGRhdGVEZXBlbmRlbmNpZXMocmVzdWx0cylcbiAgICAgIEBkZWxldGVWYXJpYWJsZVJlZmVyZW5jZXModikgZm9yIHYgaW4gZGVzdHJveWVkIHdoZW4gdj9cbiAgICAgIEBlbWl0Q2hhbmdlRXZlbnQocmVzdWx0cylcblxuICBkZWxldGVWYXJpYWJsZXNGb3JQYXRoczogKHBhdGhzKSAtPiBAcmVtb3ZlTWFueShAZ2V0VmFyaWFibGVzRm9yUGF0aHMocGF0aHMpKVxuXG4gIGRlbGV0ZVZhcmlhYmxlUmVmZXJlbmNlczogKHZhcmlhYmxlKSAtPlxuICAgIGRlcGVuZGVuY2llcyA9IEBnZXRWYXJpYWJsZURlcGVuZGVuY2llcyh2YXJpYWJsZSlcblxuICAgIGEgPSBAdmFyaWFibGVzQnlQYXRoW3ZhcmlhYmxlLnBhdGhdXG4gICAgYS5zcGxpY2UoYS5pbmRleE9mKHZhcmlhYmxlKSwgMSlcblxuICAgIGEgPSBAdmFyaWFibGVOYW1lc1xuICAgIGEuc3BsaWNlKGEuaW5kZXhPZih2YXJpYWJsZS5uYW1lKSwgMSlcbiAgICBAcmVtb3ZlRGVwZW5kZW5jaWVzKHZhcmlhYmxlLm5hbWUsIGRlcGVuZGVuY2llcylcblxuICAgIGRlbGV0ZSBAZGVwZW5kZW5jeUdyYXBoW3ZhcmlhYmxlLm5hbWVdXG5cbiAgZ2V0Q29udGV4dDogLT5cbiAgICBDb2xvckNvbnRleHQgPz0gcmVxdWlyZSAnLi9jb2xvci1jb250ZXh0J1xuICAgIHJlZ2lzdHJ5ID89IHJlcXVpcmUgJy4vY29sb3ItZXhwcmVzc2lvbnMnXG5cbiAgICBuZXcgQ29sb3JDb250ZXh0KHtAdmFyaWFibGVzLCBAY29sb3JWYXJpYWJsZXMsIHJlZ2lzdHJ5fSlcblxuICBldmFsdWF0ZVZhcmlhYmxlczogKHZhcmlhYmxlcywgY2FsbGJhY2spIC0+XG4gICAgdXBkYXRlZCA9IFtdXG4gICAgcmVtYWluaW5nVmFyaWFibGVzID0gdmFyaWFibGVzLnNsaWNlKClcblxuICAgIGl0ZXJhdGlvbiA9IChjYikgPT5cbiAgICAgIHN0YXJ0ID0gbmV3IERhdGVcbiAgICAgIGVuZCA9IG5ldyBEYXRlXG5cbiAgICAgIHdoaWxlIHJlbWFpbmluZ1ZhcmlhYmxlcy5sZW5ndGggPiAwIGFuZCBlbmQgLSBzdGFydCA8IDEwMFxuICAgICAgICB2ID0gcmVtYWluaW5nVmFyaWFibGVzLnNoaWZ0KClcbiAgICAgICAgd2FzQ29sb3IgPSB2LmlzQ29sb3JcbiAgICAgICAgQGV2YWx1YXRlVmFyaWFibGVDb2xvcih2LCB3YXNDb2xvcilcbiAgICAgICAgaXNDb2xvciA9IHYuaXNDb2xvclxuXG4gICAgICAgIGlmIGlzQ29sb3IgaXNudCB3YXNDb2xvclxuICAgICAgICAgIHVwZGF0ZWQucHVzaCh2KVxuICAgICAgICAgIEBidWlsZERlcGVuZGVuY3lHcmFwaCh2KSBpZiBpc0NvbG9yXG5cbiAgICAgICAgICBlbmQgPSBuZXcgRGF0ZVxuXG4gICAgICBpZiByZW1haW5pbmdWYXJpYWJsZXMubGVuZ3RoID4gMFxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoLT4gaXRlcmF0aW9uKGNiKSlcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/KClcblxuICAgIGl0ZXJhdGlvbiA9PlxuICAgICAgQGVtaXRDaGFuZ2VFdmVudChAdXBkYXRlRGVwZW5kZW5jaWVzKHt1cGRhdGVkfSkpIGlmIHVwZGF0ZWQubGVuZ3RoID4gMFxuICAgICAgY2FsbGJhY2s/KHVwZGF0ZWQpXG5cbiAgdXBkYXRlVmFyaWFibGU6IChwcmV2aW91c1ZhcmlhYmxlLCB2YXJpYWJsZSwgYmF0Y2gpIC0+XG4gICAgcHJldmlvdXNEZXBlbmRlbmNpZXMgPSBAZ2V0VmFyaWFibGVEZXBlbmRlbmNpZXMocHJldmlvdXNWYXJpYWJsZSlcbiAgICBwcmV2aW91c1ZhcmlhYmxlLnZhbHVlID0gdmFyaWFibGUudmFsdWVcbiAgICBwcmV2aW91c1ZhcmlhYmxlLnJhbmdlID0gdmFyaWFibGUucmFuZ2VcbiAgICBwcmV2aW91c1ZhcmlhYmxlLmJ1ZmZlclJhbmdlID0gdmFyaWFibGUuYnVmZmVyUmFuZ2VcblxuICAgIEBldmFsdWF0ZVZhcmlhYmxlQ29sb3IocHJldmlvdXNWYXJpYWJsZSwgcHJldmlvdXNWYXJpYWJsZS5pc0NvbG9yKVxuICAgIG5ld0RlcGVuZGVuY2llcyA9IEBnZXRWYXJpYWJsZURlcGVuZGVuY2llcyhwcmV2aW91c1ZhcmlhYmxlKVxuXG4gICAge3JlbW92ZWQsIGFkZGVkfSA9IEBkaWZmQXJyYXlzKHByZXZpb3VzRGVwZW5kZW5jaWVzLCBuZXdEZXBlbmRlbmNpZXMpXG4gICAgQHJlbW92ZURlcGVuZGVuY2llcyh2YXJpYWJsZS5uYW1lLCByZW1vdmVkKVxuICAgIEBhZGREZXBlbmRlbmNpZXModmFyaWFibGUubmFtZSwgYWRkZWQpXG5cbiAgICBpZiBiYXRjaFxuICAgICAgcmV0dXJuIFsndXBkYXRlZCcsIHByZXZpb3VzVmFyaWFibGVdXG4gICAgZWxzZVxuICAgICAgQGVtaXRDaGFuZ2VFdmVudChAdXBkYXRlRGVwZW5kZW5jaWVzKHVwZGF0ZWQ6IFtwcmV2aW91c1ZhcmlhYmxlXSkpXG5cbiAgcmVzdG9yZVZhcmlhYmxlOiAodmFyaWFibGUpIC0+XG4gICAgQ29sb3IgPz0gcmVxdWlyZSAnLi9jb2xvcidcblxuICAgIEB2YXJpYWJsZU5hbWVzLnB1c2godmFyaWFibGUubmFtZSlcbiAgICBAdmFyaWFibGVzLnB1c2ggdmFyaWFibGVcbiAgICB2YXJpYWJsZS5pZCA9IG5leHRJZCsrXG5cbiAgICBpZiB2YXJpYWJsZS5pc0NvbG9yXG4gICAgICB2YXJpYWJsZS5jb2xvciA9IG5ldyBDb2xvcih2YXJpYWJsZS5jb2xvcilcbiAgICAgIHZhcmlhYmxlLmNvbG9yLnZhcmlhYmxlcyA9IHZhcmlhYmxlLnZhcmlhYmxlc1xuICAgICAgQGNvbG9yVmFyaWFibGVzLnB1c2godmFyaWFibGUpXG4gICAgICBkZWxldGUgdmFyaWFibGUudmFyaWFibGVzXG5cbiAgICBAdmFyaWFibGVzQnlQYXRoW3ZhcmlhYmxlLnBhdGhdID89IFtdXG4gICAgQHZhcmlhYmxlc0J5UGF0aFt2YXJpYWJsZS5wYXRoXS5wdXNoKHZhcmlhYmxlKVxuXG4gICAgQGJ1aWxkRGVwZW5kZW5jeUdyYXBoKHZhcmlhYmxlKVxuXG4gIGNyZWF0ZVZhcmlhYmxlOiAodmFyaWFibGUsIGJhdGNoKSAtPlxuICAgIEB2YXJpYWJsZU5hbWVzLnB1c2godmFyaWFibGUubmFtZSlcbiAgICBAdmFyaWFibGVzLnB1c2ggdmFyaWFibGVcbiAgICB2YXJpYWJsZS5pZCA9IG5leHRJZCsrXG5cbiAgICBAdmFyaWFibGVzQnlQYXRoW3ZhcmlhYmxlLnBhdGhdID89IFtdXG4gICAgQHZhcmlhYmxlc0J5UGF0aFt2YXJpYWJsZS5wYXRoXS5wdXNoKHZhcmlhYmxlKVxuXG4gICAgQGV2YWx1YXRlVmFyaWFibGVDb2xvcih2YXJpYWJsZSlcbiAgICBAYnVpbGREZXBlbmRlbmN5R3JhcGgodmFyaWFibGUpXG5cbiAgICBpZiBiYXRjaFxuICAgICAgcmV0dXJuIFsnY3JlYXRlZCcsIHZhcmlhYmxlXVxuICAgIGVsc2VcbiAgICAgIEBlbWl0Q2hhbmdlRXZlbnQoQHVwZGF0ZURlcGVuZGVuY2llcyhjcmVhdGVkOiBbdmFyaWFibGVdKSlcblxuICBldmFsdWF0ZVZhcmlhYmxlQ29sb3I6ICh2YXJpYWJsZSwgd2FzQ29sb3I9ZmFsc2UpIC0+XG4gICAgY29udGV4dCA9IEBnZXRDb250ZXh0KClcbiAgICBjb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHZhcmlhYmxlLnZhbHVlLCB0cnVlKVxuXG4gICAgaWYgY29sb3I/XG4gICAgICByZXR1cm4gZmFsc2UgaWYgd2FzQ29sb3IgYW5kIGNvbG9yLmlzRXF1YWwodmFyaWFibGUuY29sb3IpXG5cbiAgICAgIHZhcmlhYmxlLmNvbG9yID0gY29sb3JcbiAgICAgIHZhcmlhYmxlLmlzQ29sb3IgPSB0cnVlXG5cbiAgICAgIEBjb2xvclZhcmlhYmxlcy5wdXNoKHZhcmlhYmxlKSB1bmxlc3MgdmFyaWFibGUgaW4gQGNvbG9yVmFyaWFibGVzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgZWxzZSBpZiB3YXNDb2xvclxuICAgICAgZGVsZXRlIHZhcmlhYmxlLmNvbG9yXG4gICAgICB2YXJpYWJsZS5pc0NvbG9yID0gZmFsc2VcbiAgICAgIEBjb2xvclZhcmlhYmxlcyA9IEBjb2xvclZhcmlhYmxlcy5maWx0ZXIgKHYpIC0+IHYgaXNudCB2YXJpYWJsZVxuICAgICAgcmV0dXJuIHRydWVcblxuICBnZXRWYXJpYWJsZVN0YXR1czogKHZhcmlhYmxlKSAtPlxuICAgIHJldHVybiBbJ2NyZWF0ZWQnLCB2YXJpYWJsZV0gdW5sZXNzIEB2YXJpYWJsZXNCeVBhdGhbdmFyaWFibGUucGF0aF0/XG4gICAgQGdldFZhcmlhYmxlU3RhdHVzSW5Db2xsZWN0aW9uKHZhcmlhYmxlLCBAdmFyaWFibGVzQnlQYXRoW3ZhcmlhYmxlLnBhdGhdKVxuXG4gIGdldFZhcmlhYmxlU3RhdHVzSW5Db2xsZWN0aW9uOiAodmFyaWFibGUsIGNvbGxlY3Rpb24pIC0+XG4gICAgZm9yIHYgaW4gY29sbGVjdGlvblxuICAgICAgc3RhdHVzID0gQGNvbXBhcmVWYXJpYWJsZXModiwgdmFyaWFibGUpXG5cbiAgICAgIHN3aXRjaCBzdGF0dXNcbiAgICAgICAgd2hlbiAnaWRlbnRpY2FsJyB0aGVuIHJldHVybiBbJ3VuY2hhbmdlZCcsIHZdXG4gICAgICAgIHdoZW4gJ21vdmUnIHRoZW4gcmV0dXJuIFsnbW92ZWQnLCB2XVxuICAgICAgICB3aGVuICd1cGRhdGUnIHRoZW4gcmV0dXJuIFsndXBkYXRlZCcsIHZdXG5cbiAgICByZXR1cm4gWydjcmVhdGVkJywgdmFyaWFibGVdXG5cbiAgY29tcGFyZVZhcmlhYmxlczogKHYxLCB2MikgLT5cbiAgICBzYW1lTmFtZSA9IHYxLm5hbWUgaXMgdjIubmFtZVxuICAgIHNhbWVWYWx1ZSA9IHYxLnZhbHVlIGlzIHYyLnZhbHVlXG4gICAgc2FtZUxpbmUgPSB2MS5saW5lIGlzIHYyLmxpbmVcbiAgICBzYW1lUmFuZ2UgPSB2MS5yYW5nZVswXSBpcyB2Mi5yYW5nZVswXSBhbmQgdjEucmFuZ2VbMV0gaXMgdjIucmFuZ2VbMV1cblxuICAgIGlmIHYxLmJ1ZmZlclJhbmdlPyBhbmQgdjIuYnVmZmVyUmFuZ2U/XG4gICAgICBzYW1lUmFuZ2UgJiY9IHYxLmJ1ZmZlclJhbmdlLmlzRXF1YWwodjIuYnVmZmVyUmFuZ2UpXG5cbiAgICBpZiBzYW1lTmFtZSBhbmQgc2FtZVZhbHVlXG4gICAgICBpZiBzYW1lUmFuZ2VcbiAgICAgICAgJ2lkZW50aWNhbCdcbiAgICAgIGVsc2VcbiAgICAgICAgJ21vdmUnXG4gICAgZWxzZSBpZiBzYW1lTmFtZVxuICAgICAgaWYgc2FtZVJhbmdlIG9yIHNhbWVMaW5lXG4gICAgICAgICd1cGRhdGUnXG4gICAgICBlbHNlXG4gICAgICAgICdkaWZmZXJlbnQnXG5cbiAgYnVpbGREZXBlbmRlbmN5R3JhcGg6ICh2YXJpYWJsZSkgLT5cbiAgICBkZXBlbmRlbmNpZXMgPSBAZ2V0VmFyaWFibGVEZXBlbmRlbmNpZXModmFyaWFibGUpXG4gICAgZm9yIGRlcGVuZGVuY3kgaW4gZGVwZW5kZW5jaWVzXG4gICAgICBhID0gQGRlcGVuZGVuY3lHcmFwaFtkZXBlbmRlbmN5XSA/PSBbXVxuICAgICAgYS5wdXNoKHZhcmlhYmxlLm5hbWUpIHVubGVzcyB2YXJpYWJsZS5uYW1lIGluIGFcblxuICBnZXRWYXJpYWJsZURlcGVuZGVuY2llczogKHZhcmlhYmxlKSAtPlxuICAgIGRlcGVuZGVuY2llcyA9IFtdXG4gICAgZGVwZW5kZW5jaWVzLnB1c2godmFyaWFibGUudmFsdWUpIGlmIHZhcmlhYmxlLnZhbHVlIGluIEB2YXJpYWJsZU5hbWVzXG5cbiAgICBpZiB2YXJpYWJsZS5jb2xvcj8udmFyaWFibGVzPy5sZW5ndGggPiAwXG4gICAgICB2YXJpYWJsZXMgPSB2YXJpYWJsZS5jb2xvci52YXJpYWJsZXNcblxuICAgICAgZm9yIHYgaW4gdmFyaWFibGVzXG4gICAgICAgIGRlcGVuZGVuY2llcy5wdXNoKHYpIHVubGVzcyB2IGluIGRlcGVuZGVuY2llc1xuXG4gICAgZGVwZW5kZW5jaWVzXG5cbiAgY29sbGVjdFZhcmlhYmxlc0J5TmFtZTogKG5hbWVzKSAtPlxuICAgIHZhcmlhYmxlcyA9IFtdXG4gICAgdmFyaWFibGVzLnB1c2ggdiBmb3IgdiBpbiBAdmFyaWFibGVzIHdoZW4gdi5uYW1lIGluIG5hbWVzXG4gICAgdmFyaWFibGVzXG5cbiAgcmVtb3ZlRGVwZW5kZW5jaWVzOiAoZnJvbSwgdG8pIC0+XG4gICAgZm9yIHYgaW4gdG9cbiAgICAgIGlmIGRlcGVuZGVuY2llcyA9IEBkZXBlbmRlbmN5R3JhcGhbdl1cbiAgICAgICAgZGVwZW5kZW5jaWVzLnNwbGljZShkZXBlbmRlbmNpZXMuaW5kZXhPZihmcm9tKSwgMSlcblxuICAgICAgICBkZWxldGUgQGRlcGVuZGVuY3lHcmFwaFt2XSBpZiBkZXBlbmRlbmNpZXMubGVuZ3RoIGlzIDBcblxuICBhZGREZXBlbmRlbmNpZXM6IChmcm9tLCB0bykgLT5cbiAgICBmb3IgdiBpbiB0b1xuICAgICAgQGRlcGVuZGVuY3lHcmFwaFt2XSA/PSBbXVxuICAgICAgQGRlcGVuZGVuY3lHcmFwaFt2XS5wdXNoKGZyb20pXG5cbiAgdXBkYXRlRGVwZW5kZW5jaWVzOiAoe2NyZWF0ZWQsIHVwZGF0ZWQsIGRlc3Ryb3llZH0pIC0+XG4gICAgQHVwZGF0ZUNvbG9yVmFyaWFibGVzRXhwcmVzc2lvbigpXG5cbiAgICB2YXJpYWJsZXMgPSBbXVxuICAgIGRpcnR5VmFyaWFibGVOYW1lcyA9IFtdXG5cbiAgICBpZiBjcmVhdGVkP1xuICAgICAgdmFyaWFibGVzID0gdmFyaWFibGVzLmNvbmNhdChjcmVhdGVkKVxuICAgICAgY3JlYXRlZFZhcmlhYmxlTmFtZXMgPSBjcmVhdGVkLm1hcCAodikgLT4gdi5uYW1lXG4gICAgZWxzZVxuICAgICAgY3JlYXRlZFZhcmlhYmxlTmFtZXMgPSBbXVxuXG4gICAgdmFyaWFibGVzID0gdmFyaWFibGVzLmNvbmNhdCh1cGRhdGVkKSBpZiB1cGRhdGVkP1xuICAgIHZhcmlhYmxlcyA9IHZhcmlhYmxlcy5jb25jYXQoZGVzdHJveWVkKSBpZiBkZXN0cm95ZWQ/XG4gICAgdmFyaWFibGVzID0gdmFyaWFibGVzLmZpbHRlciAodikgLT4gdj9cblxuICAgIGZvciB2YXJpYWJsZSBpbiB2YXJpYWJsZXNcbiAgICAgIGlmIGRlcGVuZGVuY2llcyA9IEBkZXBlbmRlbmN5R3JhcGhbdmFyaWFibGUubmFtZV1cbiAgICAgICAgZm9yIG5hbWUgaW4gZGVwZW5kZW5jaWVzXG4gICAgICAgICAgaWYgbmFtZSBub3QgaW4gZGlydHlWYXJpYWJsZU5hbWVzIGFuZCBuYW1lIG5vdCBpbiBjcmVhdGVkVmFyaWFibGVOYW1lc1xuICAgICAgICAgICAgZGlydHlWYXJpYWJsZU5hbWVzLnB1c2gobmFtZSlcblxuICAgIGRpcnR5VmFyaWFibGVzID0gQGNvbGxlY3RWYXJpYWJsZXNCeU5hbWUoZGlydHlWYXJpYWJsZU5hbWVzKVxuXG4gICAgZm9yIHZhcmlhYmxlIGluIGRpcnR5VmFyaWFibGVzXG4gICAgICBpZiBAZXZhbHVhdGVWYXJpYWJsZUNvbG9yKHZhcmlhYmxlLCB2YXJpYWJsZS5pc0NvbG9yKVxuICAgICAgICB1cGRhdGVkID89IFtdXG4gICAgICAgIHVwZGF0ZWQucHVzaCh2YXJpYWJsZSlcblxuICAgIHtjcmVhdGVkLCBkZXN0cm95ZWQsIHVwZGF0ZWR9XG5cbiAgZW1pdENoYW5nZUV2ZW50OiAoe2NyZWF0ZWQsIGRlc3Ryb3llZCwgdXBkYXRlZH0pIC0+XG4gICAgaWYgY3JlYXRlZD8ubGVuZ3RoIG9yIGRlc3Ryb3llZD8ubGVuZ3RoIG9yIHVwZGF0ZWQ/Lmxlbmd0aFxuICAgICAgQHVwZGF0ZUNvbG9yVmFyaWFibGVzRXhwcmVzc2lvbigpXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtY2hhbmdlJywge2NyZWF0ZWQsIGRlc3Ryb3llZCwgdXBkYXRlZH1cblxuICB1cGRhdGVDb2xvclZhcmlhYmxlc0V4cHJlc3Npb246IC0+XG4gICAgcmVnaXN0cnkgPz0gcmVxdWlyZSAnLi9jb2xvci1leHByZXNzaW9ucydcblxuICAgIGNvbG9yVmFyaWFibGVzID0gQGdldENvbG9yVmFyaWFibGVzKClcbiAgICBpZiBjb2xvclZhcmlhYmxlcy5sZW5ndGggPiAwXG4gICAgICBDb2xvckV4cHJlc3Npb24gPz0gcmVxdWlyZSAnLi9jb2xvci1leHByZXNzaW9uJ1xuXG4gICAgICByZWdpc3RyeS5hZGRFeHByZXNzaW9uKENvbG9yRXhwcmVzc2lvbi5jb2xvckV4cHJlc3Npb25Gb3JDb2xvclZhcmlhYmxlcyhjb2xvclZhcmlhYmxlcykpXG4gICAgZWxzZVxuICAgICAgcmVnaXN0cnkucmVtb3ZlRXhwcmVzc2lvbigncGlnbWVudHM6dmFyaWFibGVzJylcblxuICBkaWZmQXJyYXlzOiAoYSxiKSAtPlxuICAgIHJlbW92ZWQgPSBbXVxuICAgIGFkZGVkID0gW11cblxuICAgIHJlbW92ZWQucHVzaCh2KSBmb3IgdiBpbiBhIHdoZW4gdiBub3QgaW4gYlxuICAgIGFkZGVkLnB1c2godikgZm9yIHYgaW4gYiB3aGVuIHYgbm90IGluIGFcblxuICAgIHtyZW1vdmVkLCBhZGRlZH1cblxuICBzZXJpYWxpemU6IC0+XG4gICAge1xuICAgICAgZGVzZXJpYWxpemVyOiAnVmFyaWFibGVzQ29sbGVjdGlvbidcbiAgICAgIGNvbnRlbnQ6IEB2YXJpYWJsZXMubWFwICh2KSAtPlxuICAgICAgICByZXMgPSB7XG4gICAgICAgICAgbmFtZTogdi5uYW1lXG4gICAgICAgICAgdmFsdWU6IHYudmFsdWVcbiAgICAgICAgICBwYXRoOiB2LnBhdGhcbiAgICAgICAgICByYW5nZTogdi5yYW5nZVxuICAgICAgICAgIGxpbmU6IHYubGluZVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzLmlzQWx0ZXJuYXRlID0gdHJ1ZSBpZiB2LmlzQWx0ZXJuYXRlXG4gICAgICAgIHJlcy5ub05hbWVQcmVmaXggPSB0cnVlIGlmIHYubm9OYW1lUHJlZml4XG4gICAgICAgIHJlcy5kZWZhdWx0ID0gdHJ1ZSBpZiB2LmRlZmF1bHRcblxuICAgICAgICBpZiB2LmlzQ29sb3JcbiAgICAgICAgICByZXMuaXNDb2xvciA9IHRydWVcbiAgICAgICAgICByZXMuY29sb3IgPSB2LmNvbG9yLnNlcmlhbGl6ZSgpXG4gICAgICAgICAgcmVzLnZhcmlhYmxlcyA9IHYuY29sb3IudmFyaWFibGVzIGlmIHYuY29sb3IudmFyaWFibGVzP1xuXG4gICAgICAgIHJlc1xuICAgIH1cbiJdfQ==
