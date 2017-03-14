(function() {
  var Color, ColorBuffer, ColorMarker, CompositeDisposable, Emitter, Range, Task, VariablesCollection, fs, ref,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = [], Color = ref[0], ColorMarker = ref[1], VariablesCollection = ref[2], Emitter = ref[3], CompositeDisposable = ref[4], Task = ref[5], Range = ref[6], fs = ref[7];

  module.exports = ColorBuffer = (function() {
    function ColorBuffer(params) {
      var colorMarkers, ref1, saveSubscription, tokenized;
      if (params == null) {
        params = {};
      }
      if (Emitter == null) {
        ref1 = require('atom'), Emitter = ref1.Emitter, CompositeDisposable = ref1.CompositeDisposable, Task = ref1.Task, Range = ref1.Range;
      }
      this.editor = params.editor, this.project = params.project, colorMarkers = params.colorMarkers;
      this.id = this.editor.id;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.ignoredScopes = [];
      this.colorMarkersByMarkerId = {};
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      tokenized = (function(_this) {
        return function() {
          var ref2;
          return (ref2 = _this.getColorMarkers()) != null ? ref2.forEach(function(marker) {
            return marker.checkMarkerScope(true);
          }) : void 0;
        };
      })(this);
      if (this.editor.onDidTokenize != null) {
        this.subscriptions.add(this.editor.onDidTokenize(tokenized));
      } else {
        this.subscriptions.add(this.editor.displayBuffer.onDidTokenize(tokenized));
      }
      this.subscriptions.add(this.editor.onDidChange((function(_this) {
        return function() {
          if (_this.initialized && _this.variableInitialized) {
            _this.terminateRunningTask();
          }
          if (_this.timeout != null) {
            return clearTimeout(_this.timeout);
          }
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          if (_this.delayBeforeScan === 0) {
            return _this.update();
          } else {
            if (_this.timeout != null) {
              clearTimeout(_this.timeout);
            }
            return _this.timeout = setTimeout(function() {
              _this.update();
              return _this.timeout = null;
            }, _this.delayBeforeScan);
          }
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangePath((function(_this) {
        return function(path) {
          if (_this.isVariablesSource()) {
            _this.project.appendPath(path);
          }
          return _this.update();
        };
      })(this)));
      if ((this.project.getPaths() != null) && this.isVariablesSource() && !this.project.hasPath(this.editor.getPath())) {
        if (fs == null) {
          fs = require('fs');
        }
        if (fs.existsSync(this.editor.getPath())) {
          this.project.appendPath(this.editor.getPath());
        } else {
          saveSubscription = this.editor.onDidSave((function(_this) {
            return function(arg) {
              var path;
              path = arg.path;
              _this.project.appendPath(path);
              _this.update();
              saveSubscription.dispose();
              return _this.subscriptions.remove(saveSubscription);
            };
          })(this));
          this.subscriptions.add(saveSubscription);
        }
      }
      this.subscriptions.add(this.project.onDidUpdateVariables((function(_this) {
        return function() {
          if (!_this.variableInitialized) {
            return;
          }
          return _this.scanBufferForColors().then(function(results) {
            return _this.updateColorMarkers(results);
          });
        };
      })(this)));
      this.subscriptions.add(this.project.onDidChangeIgnoredScopes((function(_this) {
        return function() {
          return _this.updateIgnoredScopes();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.delayBeforeScan', (function(_this) {
        return function(delayBeforeScan) {
          _this.delayBeforeScan = delayBeforeScan != null ? delayBeforeScan : 0;
        };
      })(this)));
      if (this.editor.addMarkerLayer != null) {
        this.markerLayer = this.editor.addMarkerLayer();
      } else {
        this.markerLayer = this.editor;
      }
      if (colorMarkers != null) {
        this.restoreMarkersState(colorMarkers);
        this.cleanUnusedTextEditorMarkers();
      }
      this.updateIgnoredScopes();
      this.initialize();
    }

    ColorBuffer.prototype.onDidUpdateColorMarkers = function(callback) {
      return this.emitter.on('did-update-color-markers', callback);
    };

    ColorBuffer.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    ColorBuffer.prototype.initialize = function() {
      if (this.colorMarkers != null) {
        return Promise.resolve();
      }
      if (this.initializePromise != null) {
        return this.initializePromise;
      }
      this.updateVariableRanges();
      this.initializePromise = this.scanBufferForColors().then((function(_this) {
        return function(results) {
          return _this.createColorMarkers(results);
        };
      })(this)).then((function(_this) {
        return function(results) {
          _this.colorMarkers = results;
          return _this.initialized = true;
        };
      })(this));
      this.initializePromise.then((function(_this) {
        return function() {
          return _this.variablesAvailable();
        };
      })(this));
      return this.initializePromise;
    };

    ColorBuffer.prototype.restoreMarkersState = function(colorMarkers) {
      if (Color == null) {
        Color = require('./color');
      }
      if (ColorMarker == null) {
        ColorMarker = require('./color-marker');
      }
      this.updateVariableRanges();
      return this.colorMarkers = colorMarkers.filter(function(state) {
        return state != null;
      }).map((function(_this) {
        return function(state) {
          var color, marker, ref1;
          marker = (ref1 = _this.editor.getMarker(state.markerId)) != null ? ref1 : _this.markerLayer.markBufferRange(state.bufferRange, {
            invalidate: 'touch'
          });
          color = new Color(state.color);
          color.variables = state.variables;
          color.invalid = state.invalid;
          return _this.colorMarkersByMarkerId[marker.id] = new ColorMarker({
            marker: marker,
            color: color,
            text: state.text,
            colorBuffer: _this
          });
        };
      })(this));
    };

    ColorBuffer.prototype.cleanUnusedTextEditorMarkers = function() {
      return this.markerLayer.findMarkers().forEach((function(_this) {
        return function(m) {
          if (_this.colorMarkersByMarkerId[m.id] == null) {
            return m.destroy();
          }
        };
      })(this));
    };

    ColorBuffer.prototype.variablesAvailable = function() {
      if (this.variablesPromise != null) {
        return this.variablesPromise;
      }
      return this.variablesPromise = this.project.initialize().then((function(_this) {
        return function(results) {
          if (_this.destroyed) {
            return;
          }
          if (results == null) {
            return;
          }
          if (_this.isIgnored() && _this.isVariablesSource()) {
            return _this.scanBufferForVariables();
          }
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.scanBufferForColors({
            variables: results
          });
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.updateColorMarkers(results);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.variableInitialized = true;
        };
      })(this))["catch"](function(reason) {
        return console.log(reason);
      });
    };

    ColorBuffer.prototype.update = function() {
      var promise;
      this.terminateRunningTask();
      promise = this.isIgnored() ? this.scanBufferForVariables() : !this.isVariablesSource() ? Promise.resolve([]) : this.project.reloadVariablesForPath(this.editor.getPath());
      return promise.then((function(_this) {
        return function(results) {
          return _this.scanBufferForColors({
            variables: results
          });
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.updateColorMarkers(results);
        };
      })(this))["catch"](function(reason) {
        return console.log(reason);
      });
    };

    ColorBuffer.prototype.terminateRunningTask = function() {
      var ref1;
      return (ref1 = this.task) != null ? ref1.terminate() : void 0;
    };

    ColorBuffer.prototype.destroy = function() {
      var ref1;
      if (this.destroyed) {
        return;
      }
      this.terminateRunningTask();
      this.subscriptions.dispose();
      if ((ref1 = this.colorMarkers) != null) {
        ref1.forEach(function(marker) {
          return marker.destroy();
        });
      }
      this.destroyed = true;
      this.emitter.emit('did-destroy');
      return this.emitter.dispose();
    };

    ColorBuffer.prototype.isVariablesSource = function() {
      return this.project.isVariablesSourcePath(this.editor.getPath());
    };

    ColorBuffer.prototype.isIgnored = function() {
      var p;
      p = this.editor.getPath();
      return this.project.isIgnoredPath(p) || !atom.project.contains(p);
    };

    ColorBuffer.prototype.isDestroyed = function() {
      return this.destroyed;
    };

    ColorBuffer.prototype.getPath = function() {
      return this.editor.getPath();
    };

    ColorBuffer.prototype.getScope = function() {
      return this.project.scopeFromFileName(this.getPath());
    };

    ColorBuffer.prototype.updateIgnoredScopes = function() {
      var ref1;
      this.ignoredScopes = this.project.getIgnoredScopes().map(function(scope) {
        try {
          return new RegExp(scope);
        } catch (error) {}
      }).filter(function(re) {
        return re != null;
      });
      if ((ref1 = this.getColorMarkers()) != null) {
        ref1.forEach(function(marker) {
          return marker.checkMarkerScope(true);
        });
      }
      return this.emitter.emit('did-update-color-markers', {
        created: [],
        destroyed: []
      });
    };

    ColorBuffer.prototype.updateVariableRanges = function() {
      var variablesForBuffer;
      variablesForBuffer = this.project.getVariablesForPath(this.editor.getPath());
      return variablesForBuffer.forEach((function(_this) {
        return function(variable) {
          return variable.bufferRange != null ? variable.bufferRange : variable.bufferRange = Range.fromObject([_this.editor.getBuffer().positionForCharacterIndex(variable.range[0]), _this.editor.getBuffer().positionForCharacterIndex(variable.range[1])]);
        };
      })(this));
    };

    ColorBuffer.prototype.scanBufferForVariables = function() {
      var buffer, config, editor, results, taskPath;
      if (this.destroyed) {
        return Promise.reject("This ColorBuffer is already destroyed");
      }
      if (!this.editor.getPath()) {
        return Promise.resolve([]);
      }
      results = [];
      taskPath = require.resolve('./tasks/scan-buffer-variables-handler');
      editor = this.editor;
      buffer = this.editor.getBuffer();
      config = {
        buffer: this.editor.getText(),
        registry: this.project.getVariableExpressionsRegistry().serialize(),
        scope: this.getScope()
      };
      return new Promise((function(_this) {
        return function(resolve, reject) {
          _this.task = Task.once(taskPath, config, function() {
            _this.task = null;
            return resolve(results);
          });
          return _this.task.on('scan-buffer:variables-found', function(variables) {
            return results = results.concat(variables.map(function(variable) {
              variable.path = editor.getPath();
              variable.bufferRange = Range.fromObject([buffer.positionForCharacterIndex(variable.range[0]), buffer.positionForCharacterIndex(variable.range[1])]);
              return variable;
            }));
          });
        };
      })(this));
    };

    ColorBuffer.prototype.getMarkerLayer = function() {
      return this.markerLayer;
    };

    ColorBuffer.prototype.getColorMarkers = function() {
      return this.colorMarkers;
    };

    ColorBuffer.prototype.getValidColorMarkers = function() {
      var ref1, ref2;
      return (ref1 = (ref2 = this.getColorMarkers()) != null ? ref2.filter(function(m) {
        var ref3;
        return ((ref3 = m.color) != null ? ref3.isValid() : void 0) && !m.isIgnored();
      }) : void 0) != null ? ref1 : [];
    };

    ColorBuffer.prototype.getColorMarkerAtBufferPosition = function(bufferPosition) {
      var i, len, marker, markers;
      markers = this.markerLayer.findMarkers({
        containsBufferPosition: bufferPosition
      });
      for (i = 0, len = markers.length; i < len; i++) {
        marker = markers[i];
        if (this.colorMarkersByMarkerId[marker.id] != null) {
          return this.colorMarkersByMarkerId[marker.id];
        }
      }
    };

    ColorBuffer.prototype.createColorMarkers = function(results) {
      if (this.destroyed) {
        return Promise.resolve([]);
      }
      if (ColorMarker == null) {
        ColorMarker = require('./color-marker');
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var newResults, processResults;
          newResults = [];
          processResults = function() {
            var marker, result, startDate;
            startDate = new Date;
            if (_this.editor.isDestroyed()) {
              return resolve([]);
            }
            while (results.length) {
              result = results.shift();
              marker = _this.markerLayer.markBufferRange(result.bufferRange, {
                invalidate: 'touch'
              });
              newResults.push(_this.colorMarkersByMarkerId[marker.id] = new ColorMarker({
                marker: marker,
                color: result.color,
                text: result.match,
                colorBuffer: _this
              }));
              if (new Date() - startDate > 10) {
                requestAnimationFrame(processResults);
                return;
              }
            }
            return resolve(newResults);
          };
          return processResults();
        };
      })(this));
    };

    ColorBuffer.prototype.findExistingMarkers = function(results) {
      var newMarkers, toCreate;
      newMarkers = [];
      toCreate = [];
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var processResults;
          processResults = function() {
            var marker, result, startDate;
            startDate = new Date;
            while (results.length) {
              result = results.shift();
              if (marker = _this.findColorMarker(result)) {
                newMarkers.push(marker);
              } else {
                toCreate.push(result);
              }
              if (new Date() - startDate > 10) {
                requestAnimationFrame(processResults);
                return;
              }
            }
            return resolve({
              newMarkers: newMarkers,
              toCreate: toCreate
            });
          };
          return processResults();
        };
      })(this));
    };

    ColorBuffer.prototype.updateColorMarkers = function(results) {
      var createdMarkers, newMarkers;
      newMarkers = null;
      createdMarkers = null;
      return this.findExistingMarkers(results).then((function(_this) {
        return function(arg) {
          var markers, toCreate;
          markers = arg.newMarkers, toCreate = arg.toCreate;
          newMarkers = markers;
          return _this.createColorMarkers(toCreate);
        };
      })(this)).then((function(_this) {
        return function(results) {
          var toDestroy;
          createdMarkers = results;
          newMarkers = newMarkers.concat(results);
          if (_this.colorMarkers != null) {
            toDestroy = _this.colorMarkers.filter(function(marker) {
              return indexOf.call(newMarkers, marker) < 0;
            });
            toDestroy.forEach(function(marker) {
              delete _this.colorMarkersByMarkerId[marker.id];
              return marker.destroy();
            });
          } else {
            toDestroy = [];
          }
          _this.colorMarkers = newMarkers;
          return _this.emitter.emit('did-update-color-markers', {
            created: createdMarkers,
            destroyed: toDestroy
          });
        };
      })(this));
    };

    ColorBuffer.prototype.findColorMarker = function(properties) {
      var i, len, marker, ref1;
      if (properties == null) {
        properties = {};
      }
      if (this.colorMarkers == null) {
        return;
      }
      ref1 = this.colorMarkers;
      for (i = 0, len = ref1.length; i < len; i++) {
        marker = ref1[i];
        if (marker != null ? marker.match(properties) : void 0) {
          return marker;
        }
      }
    };

    ColorBuffer.prototype.findColorMarkers = function(properties) {
      var markers;
      if (properties == null) {
        properties = {};
      }
      markers = this.markerLayer.findMarkers(properties);
      return markers.map((function(_this) {
        return function(marker) {
          return _this.colorMarkersByMarkerId[marker.id];
        };
      })(this)).filter(function(marker) {
        return marker != null;
      });
    };

    ColorBuffer.prototype.findValidColorMarkers = function(properties) {
      return this.findColorMarkers(properties).filter((function(_this) {
        return function(marker) {
          var ref1;
          return (marker != null) && ((ref1 = marker.color) != null ? ref1.isValid() : void 0) && !(marker != null ? marker.isIgnored() : void 0);
        };
      })(this));
    };

    ColorBuffer.prototype.selectColorMarkerAndOpenPicker = function(colorMarker) {
      var ref1;
      if (this.destroyed) {
        return;
      }
      this.editor.setSelectedBufferRange(colorMarker.marker.getBufferRange());
      if (!((ref1 = this.editor.getSelectedText()) != null ? ref1.match(/^#[0-9a-fA-F]{3,8}$/) : void 0)) {
        return;
      }
      if (this.project.colorPickerAPI != null) {
        return this.project.colorPickerAPI.open(this.editor, this.editor.getLastCursor());
      }
    };

    ColorBuffer.prototype.scanBufferForColors = function(options) {
      var buffer, collection, config, ref1, ref2, ref3, ref4, ref5, registry, results, taskPath, variables;
      if (options == null) {
        options = {};
      }
      if (this.destroyed) {
        return Promise.reject("This ColorBuffer is already destroyed");
      }
      if (Color == null) {
        Color = require('./color');
      }
      results = [];
      taskPath = require.resolve('./tasks/scan-buffer-colors-handler');
      buffer = this.editor.getBuffer();
      registry = this.project.getColorExpressionsRegistry().serialize();
      if (options.variables != null) {
        if (VariablesCollection == null) {
          VariablesCollection = require('./variables-collection');
        }
        collection = new VariablesCollection();
        collection.addMany(options.variables);
        options.variables = collection;
      }
      variables = this.isVariablesSource() ? ((ref2 = (ref3 = options.variables) != null ? ref3.getVariables() : void 0) != null ? ref2 : []).concat((ref1 = this.project.getVariables()) != null ? ref1 : []) : (ref4 = (ref5 = options.variables) != null ? ref5.getVariables() : void 0) != null ? ref4 : [];
      delete registry.expressions['pigments:variables'];
      delete registry.regexpString;
      config = {
        buffer: this.editor.getText(),
        bufferPath: this.getPath(),
        scope: this.getScope(),
        variables: variables,
        colorVariables: variables.filter(function(v) {
          return v.isColor;
        }),
        registry: registry
      };
      return new Promise((function(_this) {
        return function(resolve, reject) {
          _this.task = Task.once(taskPath, config, function() {
            _this.task = null;
            return resolve(results);
          });
          return _this.task.on('scan-buffer:colors-found', function(colors) {
            return results = results.concat(colors.map(function(res) {
              res.color = new Color(res.color);
              res.bufferRange = Range.fromObject([buffer.positionForCharacterIndex(res.range[0]), buffer.positionForCharacterIndex(res.range[1])]);
              return res;
            }));
          });
        };
      })(this));
    };

    ColorBuffer.prototype.serialize = function() {
      var ref1;
      return {
        id: this.id,
        path: this.editor.getPath(),
        colorMarkers: (ref1 = this.colorMarkers) != null ? ref1.map(function(marker) {
          return marker.serialize();
        }) : void 0
      };
    };

    return ColorBuffer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1idWZmZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3R0FBQTtJQUFBOztFQUFBLE1BSUksRUFKSixFQUNFLGNBREYsRUFDUyxvQkFEVCxFQUNzQiw0QkFEdEIsRUFFRSxnQkFGRixFQUVXLDRCQUZYLEVBRWdDLGFBRmhDLEVBRXNDLGNBRnRDLEVBR0U7O0VBR0YsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHFCQUFDLE1BQUQ7QUFDWCxVQUFBOztRQURZLFNBQU87O01BQ25CLElBQU8sZUFBUDtRQUNFLE9BQThDLE9BQUEsQ0FBUSxNQUFSLENBQTlDLEVBQUMsc0JBQUQsRUFBVSw4Q0FBVixFQUErQixnQkFBL0IsRUFBcUMsbUJBRHZDOztNQUdDLElBQUMsQ0FBQSxnQkFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLGlCQUFBLE9BQVgsRUFBb0I7TUFDbkIsSUFBQyxDQUFBLEtBQU0sSUFBQyxDQUFBLE9BQVA7TUFDRixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxhQUFELEdBQWU7TUFFZixJQUFDLENBQUEsc0JBQUQsR0FBMEI7TUFFMUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQixDQUFuQjtNQUVBLFNBQUEsR0FBWSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDVixjQUFBO2dFQUFrQixDQUFFLE9BQXBCLENBQTRCLFNBQUMsTUFBRDttQkFDMUIsTUFBTSxDQUFDLGdCQUFQLENBQXdCLElBQXhCO1VBRDBCLENBQTVCO1FBRFU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BSVosSUFBRyxpQ0FBSDtRQUNFLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBc0IsU0FBdEIsQ0FBbkIsRUFERjtPQUFBLE1BQUE7UUFHRSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsYUFBdEIsQ0FBb0MsU0FBcEMsQ0FBbkIsRUFIRjs7TUFLQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQW9CLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNyQyxJQUEyQixLQUFDLENBQUEsV0FBRCxJQUFpQixLQUFDLENBQUEsbUJBQTdDO1lBQUEsS0FBQyxDQUFBLG9CQUFELENBQUEsRUFBQTs7VUFDQSxJQUEwQixxQkFBMUI7bUJBQUEsWUFBQSxDQUFhLEtBQUMsQ0FBQSxPQUFkLEVBQUE7O1FBRnFDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQUFuQjtNQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLENBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUMzQyxJQUFHLEtBQUMsQ0FBQSxlQUFELEtBQW9CLENBQXZCO21CQUNFLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFERjtXQUFBLE1BQUE7WUFHRSxJQUEwQixxQkFBMUI7Y0FBQSxZQUFBLENBQWEsS0FBQyxDQUFBLE9BQWQsRUFBQTs7bUJBQ0EsS0FBQyxDQUFBLE9BQUQsR0FBVyxVQUFBLENBQVcsU0FBQTtjQUNwQixLQUFDLENBQUEsTUFBRCxDQUFBO3FCQUNBLEtBQUMsQ0FBQSxPQUFELEdBQVc7WUFGUyxDQUFYLEVBR1QsS0FBQyxDQUFBLGVBSFEsRUFKYjs7UUFEMkM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLENBQW5CO01BVUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsZUFBUixDQUF3QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtVQUN6QyxJQUE2QixLQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUE3QjtZQUFBLEtBQUMsQ0FBQSxPQUFPLENBQUMsVUFBVCxDQUFvQixJQUFwQixFQUFBOztpQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFBO1FBRnlDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QixDQUFuQjtNQUlBLElBQUcsaUNBQUEsSUFBeUIsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FBekIsSUFBa0QsQ0FBQyxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUEsQ0FBakIsQ0FBdEQ7O1VBQ0UsS0FBTSxPQUFBLENBQVEsSUFBUjs7UUFFTixJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUEsQ0FBZCxDQUFIO1VBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxVQUFULENBQW9CLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBLENBQXBCLEVBREY7U0FBQSxNQUFBO1VBR0UsZ0JBQUEsR0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQWtCLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsR0FBRDtBQUNuQyxrQkFBQTtjQURxQyxPQUFEO2NBQ3BDLEtBQUMsQ0FBQSxPQUFPLENBQUMsVUFBVCxDQUFvQixJQUFwQjtjQUNBLEtBQUMsQ0FBQSxNQUFELENBQUE7Y0FDQSxnQkFBZ0IsQ0FBQyxPQUFqQixDQUFBO3FCQUNBLEtBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFzQixnQkFBdEI7WUFKbUM7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCO1VBTW5CLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixnQkFBbkIsRUFURjtTQUhGOztNQWNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsT0FBTyxDQUFDLG9CQUFULENBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUMvQyxJQUFBLENBQWMsS0FBQyxDQUFBLG1CQUFmO0FBQUEsbUJBQUE7O2lCQUNBLEtBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsU0FBQyxPQUFEO21CQUFhLEtBQUMsQ0FBQSxrQkFBRCxDQUFvQixPQUFwQjtVQUFiLENBQTVCO1FBRitDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QixDQUFuQjtNQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsT0FBTyxDQUFDLHdCQUFULENBQWtDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDbkQsS0FBQyxDQUFBLG1CQUFELENBQUE7UUFEbUQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQW5CO01BR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQiwwQkFBcEIsRUFBZ0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLGVBQUQ7VUFBQyxLQUFDLENBQUEsNENBQUQsa0JBQWlCO1FBQWxCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoRCxDQUFuQjtNQUVBLElBQUcsa0NBQUg7UUFDRSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBLEVBRGpCO09BQUEsTUFBQTtRQUdFLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE9BSGxCOztNQUtBLElBQUcsb0JBQUg7UUFDRSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsWUFBckI7UUFDQSxJQUFDLENBQUEsNEJBQUQsQ0FBQSxFQUZGOztNQUlBLElBQUMsQ0FBQSxtQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQTFFVzs7MEJBNEViLHVCQUFBLEdBQXlCLFNBQUMsUUFBRDthQUN2QixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSwwQkFBWixFQUF3QyxRQUF4QztJQUR1Qjs7MEJBR3pCLFlBQUEsR0FBYyxTQUFDLFFBQUQ7YUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLFFBQTNCO0lBRFk7OzBCQUdkLFVBQUEsR0FBWSxTQUFBO01BQ1YsSUFBNEIseUJBQTVCO0FBQUEsZUFBTyxPQUFPLENBQUMsT0FBUixDQUFBLEVBQVA7O01BQ0EsSUFBNkIsOEJBQTdCO0FBQUEsZUFBTyxJQUFDLENBQUEsa0JBQVI7O01BRUEsSUFBQyxDQUFBLG9CQUFELENBQUE7TUFFQSxJQUFDLENBQUEsaUJBQUQsR0FBcUIsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRDtpQkFDL0MsS0FBQyxDQUFBLGtCQUFELENBQW9CLE9BQXBCO1FBRCtDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QixDQUVyQixDQUFDLElBRm9CLENBRWYsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQ7VUFDSixLQUFDLENBQUEsWUFBRCxHQUFnQjtpQkFDaEIsS0FBQyxDQUFBLFdBQUQsR0FBZTtRQUZYO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZlO01BTXJCLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLGtCQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7YUFFQSxJQUFDLENBQUE7SUFkUzs7MEJBZ0JaLG1CQUFBLEdBQXFCLFNBQUMsWUFBRDs7UUFDbkIsUUFBUyxPQUFBLENBQVEsU0FBUjs7O1FBQ1QsY0FBZSxPQUFBLENBQVEsZ0JBQVI7O01BRWYsSUFBQyxDQUFBLG9CQUFELENBQUE7YUFFQSxJQUFDLENBQUEsWUFBRCxHQUFnQixZQUNoQixDQUFDLE1BRGUsQ0FDUixTQUFDLEtBQUQ7ZUFBVztNQUFYLENBRFEsQ0FFaEIsQ0FBQyxHQUZlLENBRVgsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7QUFDSCxjQUFBO1VBQUEsTUFBQSxvRUFBNkMsS0FBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLEtBQUssQ0FBQyxXQUFuQyxFQUFnRDtZQUFFLFVBQUEsRUFBWSxPQUFkO1dBQWhEO1VBQzdDLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxLQUFLLENBQUMsS0FBWjtVQUNaLEtBQUssQ0FBQyxTQUFOLEdBQWtCLEtBQUssQ0FBQztVQUN4QixLQUFLLENBQUMsT0FBTixHQUFnQixLQUFLLENBQUM7aUJBQ3RCLEtBQUMsQ0FBQSxzQkFBdUIsQ0FBQSxNQUFNLENBQUMsRUFBUCxDQUF4QixHQUF5QyxJQUFBLFdBQUEsQ0FBWTtZQUNuRCxRQUFBLE1BRG1EO1lBRW5ELE9BQUEsS0FGbUQ7WUFHbkQsSUFBQSxFQUFNLEtBQUssQ0FBQyxJQUh1QztZQUluRCxXQUFBLEVBQWEsS0FKc0M7V0FBWjtRQUx0QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGVztJQU5HOzswQkFvQnJCLDRCQUFBLEdBQThCLFNBQUE7YUFDNUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQUEsQ0FBMEIsQ0FBQyxPQUEzQixDQUFtQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNqQyxJQUFtQiwwQ0FBbkI7bUJBQUEsQ0FBQyxDQUFDLE9BQUYsQ0FBQSxFQUFBOztRQURpQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkM7SUFENEI7OzBCQUk5QixrQkFBQSxHQUFvQixTQUFBO01BQ2xCLElBQTRCLDZCQUE1QjtBQUFBLGVBQU8sSUFBQyxDQUFBLGlCQUFSOzthQUVBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsT0FBTyxDQUFDLFVBQVQsQ0FBQSxDQUNwQixDQUFDLElBRG1CLENBQ2QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQ7VUFDSixJQUFVLEtBQUMsQ0FBQSxTQUFYO0FBQUEsbUJBQUE7O1VBQ0EsSUFBYyxlQUFkO0FBQUEsbUJBQUE7O1VBRUEsSUFBNkIsS0FBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLElBQWlCLEtBQUMsQ0FBQSxpQkFBRCxDQUFBLENBQTlDO21CQUFBLEtBQUMsQ0FBQSxzQkFBRCxDQUFBLEVBQUE7O1FBSkk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRGMsQ0FNcEIsQ0FBQyxJQU5tQixDQU1kLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFEO2lCQUNKLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQjtZQUFBLFNBQUEsRUFBVyxPQUFYO1dBQXJCO1FBREk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTmMsQ0FRcEIsQ0FBQyxJQVJtQixDQVFkLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFEO2lCQUNKLEtBQUMsQ0FBQSxrQkFBRCxDQUFvQixPQUFwQjtRQURJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVJjLENBVXBCLENBQUMsSUFWbUIsQ0FVZCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ0osS0FBQyxDQUFBLG1CQUFELEdBQXVCO1FBRG5CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVZjLENBWXBCLEVBQUMsS0FBRCxFQVpvQixDQVliLFNBQUMsTUFBRDtlQUNMLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWjtNQURLLENBWmE7SUFIRjs7MEJBa0JwQixNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxJQUFDLENBQUEsb0JBQUQsQ0FBQTtNQUVBLE9BQUEsR0FBYSxJQUFDLENBQUEsU0FBRCxDQUFBLENBQUgsR0FDUixJQUFDLENBQUEsc0JBQUQsQ0FBQSxDQURRLEdBRUwsQ0FBTyxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUFQLEdBQ0gsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBaEIsQ0FERyxHQUdILElBQUMsQ0FBQSxPQUFPLENBQUMsc0JBQVQsQ0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUEsQ0FBaEM7YUFFRixPQUFPLENBQUMsSUFBUixDQUFhLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFEO2lCQUNYLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQjtZQUFBLFNBQUEsRUFBVyxPQUFYO1dBQXJCO1FBRFc7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWIsQ0FFQSxDQUFDLElBRkQsQ0FFTSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRDtpQkFDSixLQUFDLENBQUEsa0JBQUQsQ0FBb0IsT0FBcEI7UUFESTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGTixDQUlBLEVBQUMsS0FBRCxFQUpBLENBSU8sU0FBQyxNQUFEO2VBQ0wsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaO01BREssQ0FKUDtJQVZNOzswQkFpQlIsb0JBQUEsR0FBc0IsU0FBQTtBQUFHLFVBQUE7OENBQUssQ0FBRSxTQUFQLENBQUE7SUFBSDs7MEJBRXRCLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQVUsSUFBQyxDQUFBLFNBQVg7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxvQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7O1lBQ2EsQ0FBRSxPQUFmLENBQXVCLFNBQUMsTUFBRDtpQkFBWSxNQUFNLENBQUMsT0FBUCxDQUFBO1FBQVosQ0FBdkI7O01BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUNiLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGFBQWQ7YUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBQTtJQVJPOzswQkFVVCxpQkFBQSxHQUFtQixTQUFBO2FBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxxQkFBVCxDQUErQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQSxDQUEvQjtJQUFIOzswQkFFbkIsU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBO2FBQ0osSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQXVCLENBQXZCLENBQUEsSUFBNkIsQ0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBc0IsQ0FBdEI7SUFGeEI7OzBCQUlYLFdBQUEsR0FBYSxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUo7OzBCQUViLE9BQUEsR0FBUyxTQUFBO2FBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUE7SUFBSDs7MEJBRVQsUUFBQSxHQUFVLFNBQUE7YUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLGlCQUFULENBQTJCLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBM0I7SUFBSDs7MEJBRVYsbUJBQUEsR0FBcUIsU0FBQTtBQUNuQixVQUFBO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxnQkFBVCxDQUFBLENBQTJCLENBQUMsR0FBNUIsQ0FBZ0MsU0FBQyxLQUFEO0FBQy9DO2lCQUFRLElBQUEsTUFBQSxDQUFPLEtBQVAsRUFBUjtTQUFBO01BRCtDLENBQWhDLENBRWpCLENBQUMsTUFGZ0IsQ0FFVCxTQUFDLEVBQUQ7ZUFBUTtNQUFSLENBRlM7O1lBSUMsQ0FBRSxPQUFwQixDQUE0QixTQUFDLE1BQUQ7aUJBQVksTUFBTSxDQUFDLGdCQUFQLENBQXdCLElBQXhCO1FBQVosQ0FBNUI7O2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsMEJBQWQsRUFBMEM7UUFBQyxPQUFBLEVBQVMsRUFBVjtRQUFjLFNBQUEsRUFBVyxFQUF6QjtPQUExQztJQU5tQjs7MEJBaUJyQixvQkFBQSxHQUFzQixTQUFBO0FBQ3BCLFVBQUE7TUFBQSxrQkFBQSxHQUFxQixJQUFDLENBQUEsT0FBTyxDQUFDLG1CQUFULENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBLENBQTdCO2FBQ3JCLGtCQUFrQixDQUFDLE9BQW5CLENBQTJCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxRQUFEO2dEQUN6QixRQUFRLENBQUMsY0FBVCxRQUFRLENBQUMsY0FBZSxLQUFLLENBQUMsVUFBTixDQUFpQixDQUN2QyxLQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxDQUFtQixDQUFDLHlCQUFwQixDQUE4QyxRQUFRLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBN0QsQ0FEdUMsRUFFdkMsS0FBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQUEsQ0FBbUIsQ0FBQyx5QkFBcEIsQ0FBOEMsUUFBUSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQTdELENBRnVDLENBQWpCO1FBREM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNCO0lBRm9COzswQkFRdEIsc0JBQUEsR0FBd0IsU0FBQTtBQUN0QixVQUFBO01BQUEsSUFBa0UsSUFBQyxDQUFBLFNBQW5FO0FBQUEsZUFBTyxPQUFPLENBQUMsTUFBUixDQUFlLHVDQUFmLEVBQVA7O01BQ0EsSUFBQSxDQUFrQyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQSxDQUFsQztBQUFBLGVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBaEIsRUFBUDs7TUFFQSxPQUFBLEdBQVU7TUFDVixRQUFBLEdBQVcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsdUNBQWhCO01BQ1gsTUFBQSxHQUFTLElBQUMsQ0FBQTtNQUNWLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQTtNQUNULE1BQUEsR0FDRTtRQUFBLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQSxDQUFSO1FBQ0EsUUFBQSxFQUFVLElBQUMsQ0FBQSxPQUFPLENBQUMsOEJBQVQsQ0FBQSxDQUF5QyxDQUFDLFNBQTFDLENBQUEsQ0FEVjtRQUVBLEtBQUEsRUFBTyxJQUFDLENBQUEsUUFBRCxDQUFBLENBRlA7O2FBSUUsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO1VBQ1YsS0FBQyxDQUFBLElBQUQsR0FBUSxJQUFJLENBQUMsSUFBTCxDQUNOLFFBRE0sRUFFTixNQUZNLEVBR04sU0FBQTtZQUNFLEtBQUMsQ0FBQSxJQUFELEdBQVE7bUJBQ1IsT0FBQSxDQUFRLE9BQVI7VUFGRixDQUhNO2lCQVFSLEtBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFTLDZCQUFULEVBQXdDLFNBQUMsU0FBRDttQkFDdEMsT0FBQSxHQUFVLE9BQU8sQ0FBQyxNQUFSLENBQWUsU0FBUyxDQUFDLEdBQVYsQ0FBYyxTQUFDLFFBQUQ7Y0FDckMsUUFBUSxDQUFDLElBQVQsR0FBZ0IsTUFBTSxDQUFDLE9BQVAsQ0FBQTtjQUNoQixRQUFRLENBQUMsV0FBVCxHQUF1QixLQUFLLENBQUMsVUFBTixDQUFpQixDQUN0QyxNQUFNLENBQUMseUJBQVAsQ0FBaUMsUUFBUSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWhELENBRHNDLEVBRXRDLE1BQU0sQ0FBQyx5QkFBUCxDQUFpQyxRQUFRLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBaEQsQ0FGc0MsQ0FBakI7cUJBSXZCO1lBTnFDLENBQWQsQ0FBZjtVQUQ0QixDQUF4QztRQVRVO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSO0lBYmtCOzswQkErQ3hCLGNBQUEsR0FBZ0IsU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKOzswQkFFaEIsZUFBQSxHQUFpQixTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUo7OzBCQUVqQixvQkFBQSxHQUFzQixTQUFBO0FBQ3BCLFVBQUE7Ozs7b0NBQThFO0lBRDFEOzswQkFHdEIsOEJBQUEsR0FBZ0MsU0FBQyxjQUFEO0FBQzlCLFVBQUE7TUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQXlCO1FBQ2pDLHNCQUFBLEVBQXdCLGNBRFM7T0FBekI7QUFJVixXQUFBLHlDQUFBOztRQUNFLElBQUcsOENBQUg7QUFDRSxpQkFBTyxJQUFDLENBQUEsc0JBQXVCLENBQUEsTUFBTSxDQUFDLEVBQVAsRUFEakM7O0FBREY7SUFMOEI7OzBCQVNoQyxrQkFBQSxHQUFvQixTQUFDLE9BQUQ7TUFDbEIsSUFBOEIsSUFBQyxDQUFBLFNBQS9CO0FBQUEsZUFBTyxPQUFPLENBQUMsT0FBUixDQUFnQixFQUFoQixFQUFQOzs7UUFFQSxjQUFlLE9BQUEsQ0FBUSxnQkFBUjs7YUFFWCxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDVixjQUFBO1VBQUEsVUFBQSxHQUFhO1VBRWIsY0FBQSxHQUFpQixTQUFBO0FBQ2YsZ0JBQUE7WUFBQSxTQUFBLEdBQVksSUFBSTtZQUVoQixJQUFzQixLQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBQSxDQUF0QjtBQUFBLHFCQUFPLE9BQUEsQ0FBUSxFQUFSLEVBQVA7O0FBRUEsbUJBQU0sT0FBTyxDQUFDLE1BQWQ7Y0FDRSxNQUFBLEdBQVMsT0FBTyxDQUFDLEtBQVIsQ0FBQTtjQUVULE1BQUEsR0FBUyxLQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsTUFBTSxDQUFDLFdBQXBDLEVBQWlEO2dCQUFDLFVBQUEsRUFBWSxPQUFiO2VBQWpEO2NBQ1QsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsS0FBQyxDQUFBLHNCQUF1QixDQUFBLE1BQU0sQ0FBQyxFQUFQLENBQXhCLEdBQXlDLElBQUEsV0FBQSxDQUFZO2dCQUNuRSxRQUFBLE1BRG1FO2dCQUVuRSxLQUFBLEVBQU8sTUFBTSxDQUFDLEtBRnFEO2dCQUduRSxJQUFBLEVBQU0sTUFBTSxDQUFDLEtBSHNEO2dCQUluRSxXQUFBLEVBQWEsS0FKc0Q7ZUFBWixDQUF6RDtjQU9BLElBQU8sSUFBQSxJQUFBLENBQUEsQ0FBSixHQUFhLFNBQWIsR0FBeUIsRUFBNUI7Z0JBQ0UscUJBQUEsQ0FBc0IsY0FBdEI7QUFDQSx1QkFGRjs7WUFYRjttQkFlQSxPQUFBLENBQVEsVUFBUjtVQXBCZTtpQkFzQmpCLGNBQUEsQ0FBQTtRQXpCVTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtJQUxjOzswQkFnQ3BCLG1CQUFBLEdBQXFCLFNBQUMsT0FBRDtBQUNuQixVQUFBO01BQUEsVUFBQSxHQUFhO01BQ2IsUUFBQSxHQUFXO2FBRVAsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ1YsY0FBQTtVQUFBLGNBQUEsR0FBaUIsU0FBQTtBQUNmLGdCQUFBO1lBQUEsU0FBQSxHQUFZLElBQUk7QUFFaEIsbUJBQU0sT0FBTyxDQUFDLE1BQWQ7Y0FDRSxNQUFBLEdBQVMsT0FBTyxDQUFDLEtBQVIsQ0FBQTtjQUVULElBQUcsTUFBQSxHQUFTLEtBQUMsQ0FBQSxlQUFELENBQWlCLE1BQWpCLENBQVo7Z0JBQ0UsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsTUFBaEIsRUFERjtlQUFBLE1BQUE7Z0JBR0UsUUFBUSxDQUFDLElBQVQsQ0FBYyxNQUFkLEVBSEY7O2NBS0EsSUFBTyxJQUFBLElBQUEsQ0FBQSxDQUFKLEdBQWEsU0FBYixHQUF5QixFQUE1QjtnQkFDRSxxQkFBQSxDQUFzQixjQUF0QjtBQUNBLHVCQUZGOztZQVJGO21CQVlBLE9BQUEsQ0FBUTtjQUFDLFlBQUEsVUFBRDtjQUFhLFVBQUEsUUFBYjthQUFSO1VBZmU7aUJBaUJqQixjQUFBLENBQUE7UUFsQlU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVI7SUFKZTs7MEJBd0JyQixrQkFBQSxHQUFvQixTQUFDLE9BQUQ7QUFDbEIsVUFBQTtNQUFBLFVBQUEsR0FBYTtNQUNiLGNBQUEsR0FBaUI7YUFFakIsSUFBQyxDQUFBLG1CQUFELENBQXFCLE9BQXJCLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDakMsY0FBQTtVQUQrQyxjQUFaLFlBQXFCO1VBQ3hELFVBQUEsR0FBYTtpQkFDYixLQUFDLENBQUEsa0JBQUQsQ0FBb0IsUUFBcEI7UUFGaUM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5DLENBR0EsQ0FBQyxJQUhELENBR00sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsY0FBQSxHQUFpQjtVQUNqQixVQUFBLEdBQWEsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsT0FBbEI7VUFFYixJQUFHLDBCQUFIO1lBQ0UsU0FBQSxHQUFZLEtBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxDQUFxQixTQUFDLE1BQUQ7cUJBQVksYUFBYyxVQUFkLEVBQUEsTUFBQTtZQUFaLENBQXJCO1lBQ1osU0FBUyxDQUFDLE9BQVYsQ0FBa0IsU0FBQyxNQUFEO2NBQ2hCLE9BQU8sS0FBQyxDQUFBLHNCQUF1QixDQUFBLE1BQU0sQ0FBQyxFQUFQO3FCQUMvQixNQUFNLENBQUMsT0FBUCxDQUFBO1lBRmdCLENBQWxCLEVBRkY7V0FBQSxNQUFBO1lBTUUsU0FBQSxHQUFZLEdBTmQ7O1VBUUEsS0FBQyxDQUFBLFlBQUQsR0FBZ0I7aUJBQ2hCLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLDBCQUFkLEVBQTBDO1lBQ3hDLE9BQUEsRUFBUyxjQUQrQjtZQUV4QyxTQUFBLEVBQVcsU0FGNkI7V0FBMUM7UUFiSTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FITjtJQUprQjs7MEJBeUJwQixlQUFBLEdBQWlCLFNBQUMsVUFBRDtBQUNmLFVBQUE7O1FBRGdCLGFBQVc7O01BQzNCLElBQWMseUJBQWQ7QUFBQSxlQUFBOztBQUNBO0FBQUEsV0FBQSxzQ0FBQTs7UUFDRSxxQkFBaUIsTUFBTSxDQUFFLEtBQVIsQ0FBYyxVQUFkLFVBQWpCO0FBQUEsaUJBQU8sT0FBUDs7QUFERjtJQUZlOzswQkFLakIsZ0JBQUEsR0FBa0IsU0FBQyxVQUFEO0FBQ2hCLFVBQUE7O1FBRGlCLGFBQVc7O01BQzVCLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUIsVUFBekI7YUFDVixPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO2lCQUNWLEtBQUMsQ0FBQSxzQkFBdUIsQ0FBQSxNQUFNLENBQUMsRUFBUDtRQURkO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLENBRUEsQ0FBQyxNQUZELENBRVEsU0FBQyxNQUFEO2VBQVk7TUFBWixDQUZSO0lBRmdCOzswQkFNbEIscUJBQUEsR0FBdUIsU0FBQyxVQUFEO2FBQ3JCLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixVQUFsQixDQUE2QixDQUFDLE1BQTlCLENBQXFDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO0FBQ25DLGNBQUE7aUJBQUEsZ0JBQUEseUNBQXdCLENBQUUsT0FBZCxDQUFBLFdBQVosSUFBd0MsbUJBQUksTUFBTSxDQUFFLFNBQVIsQ0FBQTtRQURUO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQztJQURxQjs7MEJBSXZCLDhCQUFBLEdBQWdDLFNBQUMsV0FBRDtBQUM5QixVQUFBO01BQUEsSUFBVSxJQUFDLENBQUEsU0FBWDtBQUFBLGVBQUE7O01BRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxzQkFBUixDQUErQixXQUFXLENBQUMsTUFBTSxDQUFDLGNBQW5CLENBQUEsQ0FBL0I7TUFJQSxJQUFBLHVEQUF1QyxDQUFFLEtBQTNCLENBQWlDLHFCQUFqQyxXQUFkO0FBQUEsZUFBQTs7TUFFQSxJQUFHLG1DQUFIO2VBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBeEIsQ0FBNkIsSUFBQyxDQUFBLE1BQTlCLEVBQXNDLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBLENBQXRDLEVBREY7O0lBVDhCOzswQkFZaEMsbUJBQUEsR0FBcUIsU0FBQyxPQUFEO0FBQ25CLFVBQUE7O1FBRG9CLFVBQVE7O01BQzVCLElBQWtFLElBQUMsQ0FBQSxTQUFuRTtBQUFBLGVBQU8sT0FBTyxDQUFDLE1BQVIsQ0FBZSx1Q0FBZixFQUFQOzs7UUFFQSxRQUFTLE9BQUEsQ0FBUSxTQUFSOztNQUVULE9BQUEsR0FBVTtNQUNWLFFBQUEsR0FBVyxPQUFPLENBQUMsT0FBUixDQUFnQixvQ0FBaEI7TUFDWCxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQUE7TUFDVCxRQUFBLEdBQVcsSUFBQyxDQUFBLE9BQU8sQ0FBQywyQkFBVCxDQUFBLENBQXNDLENBQUMsU0FBdkMsQ0FBQTtNQUVYLElBQUcseUJBQUg7O1VBQ0Usc0JBQXVCLE9BQUEsQ0FBUSx3QkFBUjs7UUFFdkIsVUFBQSxHQUFpQixJQUFBLG1CQUFBLENBQUE7UUFDakIsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsT0FBTyxDQUFDLFNBQTNCO1FBQ0EsT0FBTyxDQUFDLFNBQVIsR0FBb0IsV0FMdEI7O01BT0EsU0FBQSxHQUFlLElBQUMsQ0FBQSxpQkFBRCxDQUFBLENBQUgsR0FHViw2RkFBcUMsRUFBckMsQ0FBd0MsQ0FBQyxNQUF6Qyx1REFBMEUsRUFBMUUsQ0FIVSwrRkFRMEI7TUFFdEMsT0FBTyxRQUFRLENBQUMsV0FBWSxDQUFBLG9CQUFBO01BQzVCLE9BQU8sUUFBUSxDQUFDO01BRWhCLE1BQUEsR0FDRTtRQUFBLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQSxDQUFSO1FBQ0EsVUFBQSxFQUFZLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FEWjtRQUVBLEtBQUEsRUFBTyxJQUFDLENBQUEsUUFBRCxDQUFBLENBRlA7UUFHQSxTQUFBLEVBQVcsU0FIWDtRQUlBLGNBQUEsRUFBZ0IsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsU0FBQyxDQUFEO2lCQUFPLENBQUMsQ0FBQztRQUFULENBQWpCLENBSmhCO1FBS0EsUUFBQSxFQUFVLFFBTFY7O2FBT0UsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO1VBQ1YsS0FBQyxDQUFBLElBQUQsR0FBUSxJQUFJLENBQUMsSUFBTCxDQUNOLFFBRE0sRUFFTixNQUZNLEVBR04sU0FBQTtZQUNFLEtBQUMsQ0FBQSxJQUFELEdBQVE7bUJBQ1IsT0FBQSxDQUFRLE9BQVI7VUFGRixDQUhNO2lCQVFSLEtBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFTLDBCQUFULEVBQXFDLFNBQUMsTUFBRDttQkFDbkMsT0FBQSxHQUFVLE9BQU8sQ0FBQyxNQUFSLENBQWUsTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFDLEdBQUQ7Y0FDbEMsR0FBRyxDQUFDLEtBQUosR0FBZ0IsSUFBQSxLQUFBLENBQU0sR0FBRyxDQUFDLEtBQVY7Y0FDaEIsR0FBRyxDQUFDLFdBQUosR0FBa0IsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsQ0FDakMsTUFBTSxDQUFDLHlCQUFQLENBQWlDLEdBQUcsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUEzQyxDQURpQyxFQUVqQyxNQUFNLENBQUMseUJBQVAsQ0FBaUMsR0FBRyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQTNDLENBRmlDLENBQWpCO3FCQUlsQjtZQU5rQyxDQUFYLENBQWY7VUFEeUIsQ0FBckM7UUFUVTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtJQXRDZTs7MEJBd0RyQixTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7YUFBQTtRQUNHLElBQUQsSUFBQyxDQUFBLEVBREg7UUFFRSxJQUFBLEVBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUEsQ0FGUjtRQUdFLFlBQUEsMkNBQTJCLENBQUUsR0FBZixDQUFtQixTQUFDLE1BQUQ7aUJBQy9CLE1BQU0sQ0FBQyxTQUFQLENBQUE7UUFEK0IsQ0FBbkIsVUFIaEI7O0lBRFM7Ozs7O0FBemJiIiwic291cmNlc0NvbnRlbnQiOlsiW1xuICBDb2xvciwgQ29sb3JNYXJrZXIsIFZhcmlhYmxlc0NvbGxlY3Rpb24sXG4gIEVtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGUsIFRhc2ssIFJhbmdlLFxuICBmc1xuXSA9IFtdXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIENvbG9yQnVmZmVyXG4gIGNvbnN0cnVjdG9yOiAocGFyYW1zPXt9KSAtPlxuICAgIHVubGVzcyBFbWl0dGVyP1xuICAgICAge0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGUsIFRhc2ssIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbiAgICB7QGVkaXRvciwgQHByb2plY3QsIGNvbG9yTWFya2Vyc30gPSBwYXJhbXNcbiAgICB7QGlkfSA9IEBlZGl0b3JcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBpZ25vcmVkU2NvcGVzPVtdXG5cbiAgICBAY29sb3JNYXJrZXJzQnlNYXJrZXJJZCA9IHt9XG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZERlc3Ryb3kgPT4gQGRlc3Ryb3koKVxuXG4gICAgdG9rZW5pemVkID0gPT5cbiAgICAgIEBnZXRDb2xvck1hcmtlcnMoKT8uZm9yRWFjaCAobWFya2VyKSAtPlxuICAgICAgICBtYXJrZXIuY2hlY2tNYXJrZXJTY29wZSh0cnVlKVxuXG4gICAgaWYgQGVkaXRvci5vbkRpZFRva2VuaXplP1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRUb2tlbml6ZSh0b2tlbml6ZWQpXG4gICAgZWxzZVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3IuZGlzcGxheUJ1ZmZlci5vbkRpZFRva2VuaXplKHRva2VuaXplZClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlID0+XG4gICAgICBAdGVybWluYXRlUnVubmluZ1Rhc2soKSBpZiBAaW5pdGlhbGl6ZWQgYW5kIEB2YXJpYWJsZUluaXRpYWxpemVkXG4gICAgICBjbGVhclRpbWVvdXQoQHRpbWVvdXQpIGlmIEB0aW1lb3V0P1xuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcgPT5cbiAgICAgIGlmIEBkZWxheUJlZm9yZVNjYW4gaXMgMFxuICAgICAgICBAdXBkYXRlKClcbiAgICAgIGVsc2VcbiAgICAgICAgY2xlYXJUaW1lb3V0KEB0aW1lb3V0KSBpZiBAdGltZW91dD9cbiAgICAgICAgQHRpbWVvdXQgPSBzZXRUaW1lb3V0ID0+XG4gICAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgICAgQHRpbWVvdXQgPSBudWxsXG4gICAgICAgICwgQGRlbGF5QmVmb3JlU2NhblxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRDaGFuZ2VQYXRoIChwYXRoKSA9PlxuICAgICAgQHByb2plY3QuYXBwZW5kUGF0aChwYXRoKSBpZiBAaXNWYXJpYWJsZXNTb3VyY2UoKVxuICAgICAgQHVwZGF0ZSgpXG5cbiAgICBpZiBAcHJvamVjdC5nZXRQYXRocygpPyBhbmQgQGlzVmFyaWFibGVzU291cmNlKCkgYW5kICFAcHJvamVjdC5oYXNQYXRoKEBlZGl0b3IuZ2V0UGF0aCgpKVxuICAgICAgZnMgPz0gcmVxdWlyZSAnZnMnXG5cbiAgICAgIGlmIGZzLmV4aXN0c1N5bmMoQGVkaXRvci5nZXRQYXRoKCkpXG4gICAgICAgIEBwcm9qZWN0LmFwcGVuZFBhdGgoQGVkaXRvci5nZXRQYXRoKCkpXG4gICAgICBlbHNlXG4gICAgICAgIHNhdmVTdWJzY3JpcHRpb24gPSBAZWRpdG9yLm9uRGlkU2F2ZSAoe3BhdGh9KSA9PlxuICAgICAgICAgIEBwcm9qZWN0LmFwcGVuZFBhdGgocGF0aClcbiAgICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgICBzYXZlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZShzYXZlU3Vic2NyaXB0aW9uKVxuXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZChzYXZlU3Vic2NyaXB0aW9uKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBwcm9qZWN0Lm9uRGlkVXBkYXRlVmFyaWFibGVzID0+XG4gICAgICByZXR1cm4gdW5sZXNzIEB2YXJpYWJsZUluaXRpYWxpemVkXG4gICAgICBAc2NhbkJ1ZmZlckZvckNvbG9ycygpLnRoZW4gKHJlc3VsdHMpID0+IEB1cGRhdGVDb2xvck1hcmtlcnMocmVzdWx0cylcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAcHJvamVjdC5vbkRpZENoYW5nZUlnbm9yZWRTY29wZXMgPT5cbiAgICAgIEB1cGRhdGVJZ25vcmVkU2NvcGVzKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdwaWdtZW50cy5kZWxheUJlZm9yZVNjYW4nLCAoQGRlbGF5QmVmb3JlU2Nhbj0wKSA9PlxuXG4gICAgaWYgQGVkaXRvci5hZGRNYXJrZXJMYXllcj9cbiAgICAgIEBtYXJrZXJMYXllciA9IEBlZGl0b3IuYWRkTWFya2VyTGF5ZXIoKVxuICAgIGVsc2VcbiAgICAgIEBtYXJrZXJMYXllciA9IEBlZGl0b3JcblxuICAgIGlmIGNvbG9yTWFya2Vycz9cbiAgICAgIEByZXN0b3JlTWFya2Vyc1N0YXRlKGNvbG9yTWFya2VycylcbiAgICAgIEBjbGVhblVudXNlZFRleHRFZGl0b3JNYXJrZXJzKClcblxuICAgIEB1cGRhdGVJZ25vcmVkU2NvcGVzKClcbiAgICBAaW5pdGlhbGl6ZSgpXG5cbiAgb25EaWRVcGRhdGVDb2xvck1hcmtlcnM6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLXVwZGF0ZS1jb2xvci1tYXJrZXJzJywgY2FsbGJhY2tcblxuICBvbkRpZERlc3Ryb3k6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWRlc3Ryb3knLCBjYWxsYmFja1xuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpIGlmIEBjb2xvck1hcmtlcnM/XG4gICAgcmV0dXJuIEBpbml0aWFsaXplUHJvbWlzZSBpZiBAaW5pdGlhbGl6ZVByb21pc2U/XG5cbiAgICBAdXBkYXRlVmFyaWFibGVSYW5nZXMoKVxuXG4gICAgQGluaXRpYWxpemVQcm9taXNlID0gQHNjYW5CdWZmZXJGb3JDb2xvcnMoKS50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgQGNyZWF0ZUNvbG9yTWFya2VycyhyZXN1bHRzKVxuICAgIC50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgQGNvbG9yTWFya2VycyA9IHJlc3VsdHNcbiAgICAgIEBpbml0aWFsaXplZCA9IHRydWVcblxuICAgIEBpbml0aWFsaXplUHJvbWlzZS50aGVuID0+IEB2YXJpYWJsZXNBdmFpbGFibGUoKVxuXG4gICAgQGluaXRpYWxpemVQcm9taXNlXG5cbiAgcmVzdG9yZU1hcmtlcnNTdGF0ZTogKGNvbG9yTWFya2VycykgLT5cbiAgICBDb2xvciA/PSByZXF1aXJlICcuL2NvbG9yJ1xuICAgIENvbG9yTWFya2VyID89IHJlcXVpcmUgJy4vY29sb3ItbWFya2VyJ1xuXG4gICAgQHVwZGF0ZVZhcmlhYmxlUmFuZ2VzKClcblxuICAgIEBjb2xvck1hcmtlcnMgPSBjb2xvck1hcmtlcnNcbiAgICAuZmlsdGVyIChzdGF0ZSkgLT4gc3RhdGU/XG4gICAgLm1hcCAoc3RhdGUpID0+XG4gICAgICBtYXJrZXIgPSBAZWRpdG9yLmdldE1hcmtlcihzdGF0ZS5tYXJrZXJJZCkgPyBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKHN0YXRlLmJ1ZmZlclJhbmdlLCB7IGludmFsaWRhdGU6ICd0b3VjaCcgfSlcbiAgICAgIGNvbG9yID0gbmV3IENvbG9yKHN0YXRlLmNvbG9yKVxuICAgICAgY29sb3IudmFyaWFibGVzID0gc3RhdGUudmFyaWFibGVzXG4gICAgICBjb2xvci5pbnZhbGlkID0gc3RhdGUuaW52YWxpZFxuICAgICAgQGNvbG9yTWFya2Vyc0J5TWFya2VySWRbbWFya2VyLmlkXSA9IG5ldyBDb2xvck1hcmtlciB7XG4gICAgICAgIG1hcmtlclxuICAgICAgICBjb2xvclxuICAgICAgICB0ZXh0OiBzdGF0ZS50ZXh0XG4gICAgICAgIGNvbG9yQnVmZmVyOiB0aGlzXG4gICAgICB9XG5cbiAgY2xlYW5VbnVzZWRUZXh0RWRpdG9yTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoKS5mb3JFYWNoIChtKSA9PlxuICAgICAgbS5kZXN0cm95KCkgdW5sZXNzIEBjb2xvck1hcmtlcnNCeU1hcmtlcklkW20uaWRdP1xuXG4gIHZhcmlhYmxlc0F2YWlsYWJsZTogLT5cbiAgICByZXR1cm4gQHZhcmlhYmxlc1Byb21pc2UgaWYgQHZhcmlhYmxlc1Byb21pc2U/XG5cbiAgICBAdmFyaWFibGVzUHJvbWlzZSA9IEBwcm9qZWN0LmluaXRpYWxpemUoKVxuICAgIC50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgcmV0dXJuIGlmIEBkZXN0cm95ZWRcbiAgICAgIHJldHVybiB1bmxlc3MgcmVzdWx0cz9cblxuICAgICAgQHNjYW5CdWZmZXJGb3JWYXJpYWJsZXMoKSBpZiBAaXNJZ25vcmVkKCkgYW5kIEBpc1ZhcmlhYmxlc1NvdXJjZSgpXG4gICAgLnRoZW4gKHJlc3VsdHMpID0+XG4gICAgICBAc2NhbkJ1ZmZlckZvckNvbG9ycyB2YXJpYWJsZXM6IHJlc3VsdHNcbiAgICAudGhlbiAocmVzdWx0cykgPT5cbiAgICAgIEB1cGRhdGVDb2xvck1hcmtlcnMocmVzdWx0cylcbiAgICAudGhlbiA9PlxuICAgICAgQHZhcmlhYmxlSW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgLmNhdGNoIChyZWFzb24pIC0+XG4gICAgICBjb25zb2xlLmxvZyByZWFzb25cblxuICB1cGRhdGU6IC0+XG4gICAgQHRlcm1pbmF0ZVJ1bm5pbmdUYXNrKClcblxuICAgIHByb21pc2UgPSBpZiBAaXNJZ25vcmVkKClcbiAgICAgIEBzY2FuQnVmZmVyRm9yVmFyaWFibGVzKClcbiAgICBlbHNlIHVubGVzcyBAaXNWYXJpYWJsZXNTb3VyY2UoKVxuICAgICAgUHJvbWlzZS5yZXNvbHZlKFtdKVxuICAgIGVsc2VcbiAgICAgIEBwcm9qZWN0LnJlbG9hZFZhcmlhYmxlc0ZvclBhdGgoQGVkaXRvci5nZXRQYXRoKCkpXG5cbiAgICBwcm9taXNlLnRoZW4gKHJlc3VsdHMpID0+XG4gICAgICBAc2NhbkJ1ZmZlckZvckNvbG9ycyB2YXJpYWJsZXM6IHJlc3VsdHNcbiAgICAudGhlbiAocmVzdWx0cykgPT5cbiAgICAgIEB1cGRhdGVDb2xvck1hcmtlcnMocmVzdWx0cylcbiAgICAuY2F0Y2ggKHJlYXNvbikgLT5cbiAgICAgIGNvbnNvbGUubG9nIHJlYXNvblxuXG4gIHRlcm1pbmF0ZVJ1bm5pbmdUYXNrOiAtPiBAdGFzaz8udGVybWluYXRlKClcblxuICBkZXN0cm95OiAtPlxuICAgIHJldHVybiBpZiBAZGVzdHJveWVkXG5cbiAgICBAdGVybWluYXRlUnVubmluZ1Rhc2soKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBjb2xvck1hcmtlcnM/LmZvckVhY2ggKG1hcmtlcikgLT4gbWFya2VyLmRlc3Ryb3koKVxuICAgIEBkZXN0cm95ZWQgPSB0cnVlXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWRlc3Ryb3knXG4gICAgQGVtaXR0ZXIuZGlzcG9zZSgpXG5cbiAgaXNWYXJpYWJsZXNTb3VyY2U6IC0+IEBwcm9qZWN0LmlzVmFyaWFibGVzU291cmNlUGF0aChAZWRpdG9yLmdldFBhdGgoKSlcblxuICBpc0lnbm9yZWQ6IC0+XG4gICAgcCA9IEBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgQHByb2plY3QuaXNJZ25vcmVkUGF0aChwKSBvciBub3QgYXRvbS5wcm9qZWN0LmNvbnRhaW5zKHApXG5cbiAgaXNEZXN0cm95ZWQ6IC0+IEBkZXN0cm95ZWRcblxuICBnZXRQYXRoOiAtPiBAZWRpdG9yLmdldFBhdGgoKVxuXG4gIGdldFNjb3BlOiAtPiBAcHJvamVjdC5zY29wZUZyb21GaWxlTmFtZShAZ2V0UGF0aCgpKVxuXG4gIHVwZGF0ZUlnbm9yZWRTY29wZXM6IC0+XG4gICAgQGlnbm9yZWRTY29wZXMgPSBAcHJvamVjdC5nZXRJZ25vcmVkU2NvcGVzKCkubWFwIChzY29wZSkgLT5cbiAgICAgIHRyeSBuZXcgUmVnRXhwKHNjb3BlKVxuICAgIC5maWx0ZXIgKHJlKSAtPiByZT9cblxuICAgIEBnZXRDb2xvck1hcmtlcnMoKT8uZm9yRWFjaCAobWFya2VyKSAtPiBtYXJrZXIuY2hlY2tNYXJrZXJTY29wZSh0cnVlKVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycycsIHtjcmVhdGVkOiBbXSwgZGVzdHJveWVkOiBbXX1cblxuXG4gICMjICAgICMjICAgICAjIyAgICAjIyMgICAgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgIyMgICAgICMjICAgIyMgIyMgICAjIyAgICAgIyMgIyMgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICAjIyAgICMjICAjIyAgICAgIyMgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAjIyMjIyMjIyAgICMjIyMjI1xuICAjIyAgICAgIyMgICAjIyAgIyMjIyMjIyMjICMjICAgIyMgICAgICAgICAjI1xuICAjIyAgICAgICMjICMjICAgIyMgICAgICMjICMjICAgICMjICAjIyAgICAjI1xuICAjIyAgICAgICAjIyMgICAgIyMgICAgICMjICMjICAgICAjIyAgIyMjIyMjXG5cbiAgdXBkYXRlVmFyaWFibGVSYW5nZXM6IC0+XG4gICAgdmFyaWFibGVzRm9yQnVmZmVyID0gQHByb2plY3QuZ2V0VmFyaWFibGVzRm9yUGF0aChAZWRpdG9yLmdldFBhdGgoKSlcbiAgICB2YXJpYWJsZXNGb3JCdWZmZXIuZm9yRWFjaCAodmFyaWFibGUpID0+XG4gICAgICB2YXJpYWJsZS5idWZmZXJSYW5nZSA/PSBSYW5nZS5mcm9tT2JqZWN0IFtcbiAgICAgICAgQGVkaXRvci5nZXRCdWZmZXIoKS5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KHZhcmlhYmxlLnJhbmdlWzBdKVxuICAgICAgICBAZWRpdG9yLmdldEJ1ZmZlcigpLnBvc2l0aW9uRm9yQ2hhcmFjdGVySW5kZXgodmFyaWFibGUucmFuZ2VbMV0pXG4gICAgICBdXG5cbiAgc2NhbkJ1ZmZlckZvclZhcmlhYmxlczogLT5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoXCJUaGlzIENvbG9yQnVmZmVyIGlzIGFscmVhZHkgZGVzdHJveWVkXCIpIGlmIEBkZXN0cm95ZWRcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKSB1bmxlc3MgQGVkaXRvci5nZXRQYXRoKClcblxuICAgIHJlc3VsdHMgPSBbXVxuICAgIHRhc2tQYXRoID0gcmVxdWlyZS5yZXNvbHZlKCcuL3Rhc2tzL3NjYW4tYnVmZmVyLXZhcmlhYmxlcy1oYW5kbGVyJylcbiAgICBlZGl0b3IgPSBAZWRpdG9yXG4gICAgYnVmZmVyID0gQGVkaXRvci5nZXRCdWZmZXIoKVxuICAgIGNvbmZpZyA9XG4gICAgICBidWZmZXI6IEBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgICByZWdpc3RyeTogQHByb2plY3QuZ2V0VmFyaWFibGVFeHByZXNzaW9uc1JlZ2lzdHJ5KCkuc2VyaWFsaXplKClcbiAgICAgIHNjb3BlOiBAZ2V0U2NvcGUoKVxuXG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIEB0YXNrID0gVGFzay5vbmNlKFxuICAgICAgICB0YXNrUGF0aCxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICA9PlxuICAgICAgICAgIEB0YXNrID0gbnVsbFxuICAgICAgICAgIHJlc29sdmUocmVzdWx0cylcbiAgICAgIClcblxuICAgICAgQHRhc2sub24gJ3NjYW4tYnVmZmVyOnZhcmlhYmxlcy1mb3VuZCcsICh2YXJpYWJsZXMpIC0+XG4gICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdCB2YXJpYWJsZXMubWFwICh2YXJpYWJsZSkgLT5cbiAgICAgICAgICB2YXJpYWJsZS5wYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICAgIHZhcmlhYmxlLmJ1ZmZlclJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdCBbXG4gICAgICAgICAgICBidWZmZXIucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleCh2YXJpYWJsZS5yYW5nZVswXSlcbiAgICAgICAgICAgIGJ1ZmZlci5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KHZhcmlhYmxlLnJhbmdlWzFdKVxuICAgICAgICAgIF1cbiAgICAgICAgICB2YXJpYWJsZVxuXG4gICMjICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAgICAgIyMjIyMjIyAgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyMjIyMjI1xuICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgIyNcbiAgIyMgICAgIyMgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAjI1xuICAjIyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyMgICMjICAgICAjI1xuICAjI1xuICAjIyAgICAjIyAgICAgIyMgICAgIyMjICAgICMjIyMjIyMjICAjIyAgICAjIyAjIyMjIyMjIyAjIyMjIyMjIyAgICMjIyMjI1xuICAjIyAgICAjIyMgICAjIyMgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICMjICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgIyNcbiAgIyMgICAgIyMjIyAjIyMjICAjIyAgICMjICAjIyAgICAgIyMgIyMgICMjICAgIyMgICAgICAgIyMgICAgICMjICMjXG4gICMjICAgICMjICMjIyAjIyAjIyAgICAgIyMgIyMjIyMjIyMgICMjIyMjICAgICMjIyMjIyAgICMjIyMjIyMjICAgIyMjIyMjXG4gICMjICAgICMjICAgICAjIyAjIyMjIyMjIyMgIyMgICAjIyAgICMjICAjIyAgICMjICAgICAgICMjICAgIyMgICAgICAgICAjI1xuICAjIyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICMjICAjIyAgICMjICAjIyAgICAgICAjIyAgICAjIyAgIyMgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgIyMgIyMjIyMjIyMgIyMgICAgICMjICAjIyMjIyNcblxuICBnZXRNYXJrZXJMYXllcjogLT4gQG1hcmtlckxheWVyXG5cbiAgZ2V0Q29sb3JNYXJrZXJzOiAtPiBAY29sb3JNYXJrZXJzXG5cbiAgZ2V0VmFsaWRDb2xvck1hcmtlcnM6IC0+XG4gICAgQGdldENvbG9yTWFya2VycygpPy5maWx0ZXIoKG0pIC0+IG0uY29sb3I/LmlzVmFsaWQoKSBhbmQgbm90IG0uaXNJZ25vcmVkKCkpID8gW11cblxuICBnZXRDb2xvck1hcmtlckF0QnVmZmVyUG9zaXRpb246IChidWZmZXJQb3NpdGlvbikgLT5cbiAgICBtYXJrZXJzID0gQG1hcmtlckxheWVyLmZpbmRNYXJrZXJzKHtcbiAgICAgIGNvbnRhaW5zQnVmZmVyUG9zaXRpb246IGJ1ZmZlclBvc2l0aW9uXG4gICAgfSlcblxuICAgIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgICAgaWYgQGNvbG9yTWFya2Vyc0J5TWFya2VySWRbbWFya2VyLmlkXT9cbiAgICAgICAgcmV0dXJuIEBjb2xvck1hcmtlcnNCeU1hcmtlcklkW21hcmtlci5pZF1cblxuICBjcmVhdGVDb2xvck1hcmtlcnM6IChyZXN1bHRzKSAtPlxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pIGlmIEBkZXN0cm95ZWRcblxuICAgIENvbG9yTWFya2VyID89IHJlcXVpcmUgJy4vY29sb3ItbWFya2VyJ1xuXG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIG5ld1Jlc3VsdHMgPSBbXVxuXG4gICAgICBwcm9jZXNzUmVzdWx0cyA9ID0+XG4gICAgICAgIHN0YXJ0RGF0ZSA9IG5ldyBEYXRlXG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUoW10pIGlmIEBlZGl0b3IuaXNEZXN0cm95ZWQoKVxuXG4gICAgICAgIHdoaWxlIHJlc3VsdHMubGVuZ3RoXG4gICAgICAgICAgcmVzdWx0ID0gcmVzdWx0cy5zaGlmdCgpXG5cbiAgICAgICAgICBtYXJrZXIgPSBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKHJlc3VsdC5idWZmZXJSYW5nZSwge2ludmFsaWRhdGU6ICd0b3VjaCd9KVxuICAgICAgICAgIG5ld1Jlc3VsdHMucHVzaCBAY29sb3JNYXJrZXJzQnlNYXJrZXJJZFttYXJrZXIuaWRdID0gbmV3IENvbG9yTWFya2VyIHtcbiAgICAgICAgICAgIG1hcmtlclxuICAgICAgICAgICAgY29sb3I6IHJlc3VsdC5jb2xvclxuICAgICAgICAgICAgdGV4dDogcmVzdWx0Lm1hdGNoXG4gICAgICAgICAgICBjb2xvckJ1ZmZlcjogdGhpc1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIG5ldyBEYXRlKCkgLSBzdGFydERhdGUgPiAxMFxuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHByb2Nlc3NSZXN1bHRzKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgcmVzb2x2ZShuZXdSZXN1bHRzKVxuXG4gICAgICBwcm9jZXNzUmVzdWx0cygpXG5cbiAgZmluZEV4aXN0aW5nTWFya2VyczogKHJlc3VsdHMpIC0+XG4gICAgbmV3TWFya2VycyA9IFtdXG4gICAgdG9DcmVhdGUgPSBbXVxuXG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIHByb2Nlc3NSZXN1bHRzID0gPT5cbiAgICAgICAgc3RhcnREYXRlID0gbmV3IERhdGVcblxuICAgICAgICB3aGlsZSByZXN1bHRzLmxlbmd0aFxuICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdHMuc2hpZnQoKVxuXG4gICAgICAgICAgaWYgbWFya2VyID0gQGZpbmRDb2xvck1hcmtlcihyZXN1bHQpXG4gICAgICAgICAgICBuZXdNYXJrZXJzLnB1c2gobWFya2VyKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRvQ3JlYXRlLnB1c2gocmVzdWx0KVxuXG4gICAgICAgICAgaWYgbmV3IERhdGUoKSAtIHN0YXJ0RGF0ZSA+IDEwXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocHJvY2Vzc1Jlc3VsdHMpXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICByZXNvbHZlKHtuZXdNYXJrZXJzLCB0b0NyZWF0ZX0pXG5cbiAgICAgIHByb2Nlc3NSZXN1bHRzKClcblxuICB1cGRhdGVDb2xvck1hcmtlcnM6IChyZXN1bHRzKSAtPlxuICAgIG5ld01hcmtlcnMgPSBudWxsXG4gICAgY3JlYXRlZE1hcmtlcnMgPSBudWxsXG5cbiAgICBAZmluZEV4aXN0aW5nTWFya2VycyhyZXN1bHRzKS50aGVuICh7bmV3TWFya2VyczogbWFya2VycywgdG9DcmVhdGV9KSA9PlxuICAgICAgbmV3TWFya2VycyA9IG1hcmtlcnNcbiAgICAgIEBjcmVhdGVDb2xvck1hcmtlcnModG9DcmVhdGUpXG4gICAgLnRoZW4gKHJlc3VsdHMpID0+XG4gICAgICBjcmVhdGVkTWFya2VycyA9IHJlc3VsdHNcbiAgICAgIG5ld01hcmtlcnMgPSBuZXdNYXJrZXJzLmNvbmNhdChyZXN1bHRzKVxuXG4gICAgICBpZiBAY29sb3JNYXJrZXJzP1xuICAgICAgICB0b0Rlc3Ryb3kgPSBAY29sb3JNYXJrZXJzLmZpbHRlciAobWFya2VyKSAtPiBtYXJrZXIgbm90IGluIG5ld01hcmtlcnNcbiAgICAgICAgdG9EZXN0cm95LmZvckVhY2ggKG1hcmtlcikgPT5cbiAgICAgICAgICBkZWxldGUgQGNvbG9yTWFya2Vyc0J5TWFya2VySWRbbWFya2VyLmlkXVxuICAgICAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgICAgIGVsc2VcbiAgICAgICAgdG9EZXN0cm95ID0gW11cblxuICAgICAgQGNvbG9yTWFya2VycyA9IG5ld01hcmtlcnNcbiAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycycsIHtcbiAgICAgICAgY3JlYXRlZDogY3JlYXRlZE1hcmtlcnNcbiAgICAgICAgZGVzdHJveWVkOiB0b0Rlc3Ryb3lcbiAgICAgIH1cblxuICBmaW5kQ29sb3JNYXJrZXI6IChwcm9wZXJ0aWVzPXt9KSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGNvbG9yTWFya2Vycz9cbiAgICBmb3IgbWFya2VyIGluIEBjb2xvck1hcmtlcnNcbiAgICAgIHJldHVybiBtYXJrZXIgaWYgbWFya2VyPy5tYXRjaChwcm9wZXJ0aWVzKVxuXG4gIGZpbmRDb2xvck1hcmtlcnM6IChwcm9wZXJ0aWVzPXt9KSAtPlxuICAgIG1hcmtlcnMgPSBAbWFya2VyTGF5ZXIuZmluZE1hcmtlcnMocHJvcGVydGllcylcbiAgICBtYXJrZXJzLm1hcCAobWFya2VyKSA9PlxuICAgICAgQGNvbG9yTWFya2Vyc0J5TWFya2VySWRbbWFya2VyLmlkXVxuICAgIC5maWx0ZXIgKG1hcmtlcikgLT4gbWFya2VyP1xuXG4gIGZpbmRWYWxpZENvbG9yTWFya2VyczogKHByb3BlcnRpZXMpIC0+XG4gICAgQGZpbmRDb2xvck1hcmtlcnMocHJvcGVydGllcykuZmlsdGVyIChtYXJrZXIpID0+XG4gICAgICBtYXJrZXI/IGFuZCBtYXJrZXIuY29sb3I/LmlzVmFsaWQoKSBhbmQgbm90IG1hcmtlcj8uaXNJZ25vcmVkKClcblxuICBzZWxlY3RDb2xvck1hcmtlckFuZE9wZW5QaWNrZXI6IChjb2xvck1hcmtlcikgLT5cbiAgICByZXR1cm4gaWYgQGRlc3Ryb3llZFxuXG4gICAgQGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKGNvbG9yTWFya2VyLm1hcmtlci5nZXRCdWZmZXJSYW5nZSgpKVxuXG4gICAgIyBGb3IgdGhlIG1vbWVudCBpdCBzZWVtcyBvbmx5IGNvbG9ycyBpbiAjUlJHR0JCIGZvcm1hdCBhcmUgZGV0ZWN0ZWRcbiAgICAjIGJ5IHRoZSBjb2xvciBwaWNrZXIsIHNvIHdlJ2xsIGV4Y2x1ZGUgYW55dGhpbmcgZWxzZVxuICAgIHJldHVybiB1bmxlc3MgQGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKT8ubWF0Y2goL14jWzAtOWEtZkEtRl17Myw4fSQvKVxuXG4gICAgaWYgQHByb2plY3QuY29sb3JQaWNrZXJBUEk/XG4gICAgICBAcHJvamVjdC5jb2xvclBpY2tlckFQSS5vcGVuKEBlZGl0b3IsIEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpKVxuXG4gIHNjYW5CdWZmZXJGb3JDb2xvcnM6IChvcHRpb25zPXt9KSAtPlxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChcIlRoaXMgQ29sb3JCdWZmZXIgaXMgYWxyZWFkeSBkZXN0cm95ZWRcIikgaWYgQGRlc3Ryb3llZFxuXG4gICAgQ29sb3IgPz0gcmVxdWlyZSAnLi9jb2xvcidcblxuICAgIHJlc3VsdHMgPSBbXVxuICAgIHRhc2tQYXRoID0gcmVxdWlyZS5yZXNvbHZlKCcuL3Rhc2tzL3NjYW4tYnVmZmVyLWNvbG9ycy1oYW5kbGVyJylcbiAgICBidWZmZXIgPSBAZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgcmVnaXN0cnkgPSBAcHJvamVjdC5nZXRDb2xvckV4cHJlc3Npb25zUmVnaXN0cnkoKS5zZXJpYWxpemUoKVxuXG4gICAgaWYgb3B0aW9ucy52YXJpYWJsZXM/XG4gICAgICBWYXJpYWJsZXNDb2xsZWN0aW9uID89IHJlcXVpcmUgJy4vdmFyaWFibGVzLWNvbGxlY3Rpb24nXG5cbiAgICAgIGNvbGxlY3Rpb24gPSBuZXcgVmFyaWFibGVzQ29sbGVjdGlvbigpXG4gICAgICBjb2xsZWN0aW9uLmFkZE1hbnkob3B0aW9ucy52YXJpYWJsZXMpXG4gICAgICBvcHRpb25zLnZhcmlhYmxlcyA9IGNvbGxlY3Rpb25cblxuICAgIHZhcmlhYmxlcyA9IGlmIEBpc1ZhcmlhYmxlc1NvdXJjZSgpXG4gICAgICAjIEluIHRoZSBjYXNlIG9mIGZpbGVzIGNvbnNpZGVyZWQgYXMgc291cmNlLCB0aGUgdmFyaWFibGVzIGluIHRoZSBwcm9qZWN0XG4gICAgICAjIGFyZSBuZWVkZWQgd2hlbiBwYXJzaW5nIHRoZSBmaWxlcy5cbiAgICAgIChvcHRpb25zLnZhcmlhYmxlcz8uZ2V0VmFyaWFibGVzKCkgPyBbXSkuY29uY2F0KEBwcm9qZWN0LmdldFZhcmlhYmxlcygpID8gW10pXG4gICAgZWxzZVxuICAgICAgIyBGaWxlcyB0aGF0IGFyZSBub3QgcGFydCBvZiB0aGUgc291cmNlcyB3aWxsIG9ubHkgdXNlIHRoZSB2YXJpYWJsZXNcbiAgICAgICMgZGVmaW5lZCBpbiB0aGVtIGFuZCBzbyB0aGUgZ2xvYmFsIHZhcmlhYmxlcyBleHByZXNzaW9uIG11c3QgYmVcbiAgICAgICMgZGlzY2FyZGVkIGJlZm9yZSBzZW5kaW5nIHRoZSByZWdpc3RyeSB0byB0aGUgY2hpbGQgcHJvY2Vzcy5cbiAgICAgIG9wdGlvbnMudmFyaWFibGVzPy5nZXRWYXJpYWJsZXMoKSA/IFtdXG5cbiAgICBkZWxldGUgcmVnaXN0cnkuZXhwcmVzc2lvbnNbJ3BpZ21lbnRzOnZhcmlhYmxlcyddXG4gICAgZGVsZXRlIHJlZ2lzdHJ5LnJlZ2V4cFN0cmluZ1xuXG4gICAgY29uZmlnID1cbiAgICAgIGJ1ZmZlcjogQGVkaXRvci5nZXRUZXh0KClcbiAgICAgIGJ1ZmZlclBhdGg6IEBnZXRQYXRoKClcbiAgICAgIHNjb3BlOiBAZ2V0U2NvcGUoKVxuICAgICAgdmFyaWFibGVzOiB2YXJpYWJsZXNcbiAgICAgIGNvbG9yVmFyaWFibGVzOiB2YXJpYWJsZXMuZmlsdGVyICh2KSAtPiB2LmlzQ29sb3JcbiAgICAgIHJlZ2lzdHJ5OiByZWdpc3RyeVxuXG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIEB0YXNrID0gVGFzay5vbmNlKFxuICAgICAgICB0YXNrUGF0aCxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICA9PlxuICAgICAgICAgIEB0YXNrID0gbnVsbFxuICAgICAgICAgIHJlc29sdmUocmVzdWx0cylcbiAgICAgIClcblxuICAgICAgQHRhc2sub24gJ3NjYW4tYnVmZmVyOmNvbG9ycy1mb3VuZCcsIChjb2xvcnMpIC0+XG4gICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdCBjb2xvcnMubWFwIChyZXMpIC0+XG4gICAgICAgICAgcmVzLmNvbG9yID0gbmV3IENvbG9yKHJlcy5jb2xvcilcbiAgICAgICAgICByZXMuYnVmZmVyUmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0IFtcbiAgICAgICAgICAgIGJ1ZmZlci5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KHJlcy5yYW5nZVswXSlcbiAgICAgICAgICAgIGJ1ZmZlci5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KHJlcy5yYW5nZVsxXSlcbiAgICAgICAgICBdXG4gICAgICAgICAgcmVzXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIHtcbiAgICAgIEBpZFxuICAgICAgcGF0aDogQGVkaXRvci5nZXRQYXRoKClcbiAgICAgIGNvbG9yTWFya2VyczogQGNvbG9yTWFya2Vycz8ubWFwIChtYXJrZXIpIC0+XG4gICAgICAgIG1hcmtlci5zZXJpYWxpemUoKVxuICAgIH1cbiJdfQ==
