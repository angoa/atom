(function() {
  var ATOM_VARIABLES, ColorBuffer, ColorMarkerElement, ColorProject, ColorSearch, CompositeDisposable, Emitter, Palette, PathsLoader, PathsScanner, Range, SERIALIZE_MARKERS_VERSION, SERIALIZE_VERSION, THEME_VARIABLES, VariablesCollection, compareArray, minimatch, ref, scopeFromFileName,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = [], ColorBuffer = ref[0], ColorSearch = ref[1], Palette = ref[2], ColorMarkerElement = ref[3], VariablesCollection = ref[4], PathsLoader = ref[5], PathsScanner = ref[6], Emitter = ref[7], CompositeDisposable = ref[8], Range = ref[9], SERIALIZE_VERSION = ref[10], SERIALIZE_MARKERS_VERSION = ref[11], THEME_VARIABLES = ref[12], ATOM_VARIABLES = ref[13], scopeFromFileName = ref[14], minimatch = ref[15];

  compareArray = function(a, b) {
    var i, j, len, v;
    if ((a == null) || (b == null)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (i = j = 0, len = a.length; j < len; i = ++j) {
      v = a[i];
      if (v !== b[i]) {
        return false;
      }
    }
    return true;
  };

  module.exports = ColorProject = (function() {
    ColorProject.deserialize = function(state) {
      var markersVersion, ref1;
      if (SERIALIZE_VERSION == null) {
        ref1 = require('./versions'), SERIALIZE_VERSION = ref1.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = ref1.SERIALIZE_MARKERS_VERSION;
      }
      markersVersion = SERIALIZE_MARKERS_VERSION;
      if (atom.inDevMode() && atom.project.getPaths().some(function(p) {
        return p.match(/\/pigments$/);
      })) {
        markersVersion += '-dev';
      }
      if ((state != null ? state.version : void 0) !== SERIALIZE_VERSION) {
        state = {};
      }
      if ((state != null ? state.markersVersion : void 0) !== markersVersion) {
        delete state.variables;
        delete state.buffers;
      }
      if (!compareArray(state.globalSourceNames, atom.config.get('pigments.sourceNames')) || !compareArray(state.globalIgnoredNames, atom.config.get('pigments.ignoredNames'))) {
        delete state.variables;
        delete state.buffers;
        delete state.paths;
      }
      return new ColorProject(state);
    };

    function ColorProject(state) {
      var buffers, ref1, svgColorExpression, timestamp, variables;
      if (state == null) {
        state = {};
      }
      if (Emitter == null) {
        ref1 = require('atom'), Emitter = ref1.Emitter, CompositeDisposable = ref1.CompositeDisposable, Range = ref1.Range;
      }
      if (VariablesCollection == null) {
        VariablesCollection = require('./variables-collection');
      }
      this.includeThemes = state.includeThemes, this.ignoredNames = state.ignoredNames, this.sourceNames = state.sourceNames, this.ignoredScopes = state.ignoredScopes, this.paths = state.paths, this.searchNames = state.searchNames, this.ignoreGlobalSourceNames = state.ignoreGlobalSourceNames, this.ignoreGlobalIgnoredNames = state.ignoreGlobalIgnoredNames, this.ignoreGlobalIgnoredScopes = state.ignoreGlobalIgnoredScopes, this.ignoreGlobalSearchNames = state.ignoreGlobalSearchNames, this.ignoreGlobalSupportedFiletypes = state.ignoreGlobalSupportedFiletypes, this.supportedFiletypes = state.supportedFiletypes, variables = state.variables, timestamp = state.timestamp, buffers = state.buffers;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.colorBuffersByEditorId = {};
      this.bufferStates = buffers != null ? buffers : {};
      this.variableExpressionsRegistry = require('./variable-expressions');
      this.colorExpressionsRegistry = require('./color-expressions');
      if (variables != null) {
        this.variables = atom.deserializers.deserialize(variables);
      } else {
        this.variables = new VariablesCollection;
      }
      this.subscriptions.add(this.variables.onDidChange((function(_this) {
        return function(results) {
          return _this.emitVariablesChangeEvent(results);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.sourceNames', (function(_this) {
        return function() {
          return _this.updatePaths();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredNames', (function(_this) {
        return function() {
          return _this.updatePaths();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredBufferNames', (function(_this) {
        return function(ignoredBufferNames) {
          _this.ignoredBufferNames = ignoredBufferNames;
          return _this.updateColorBuffers();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredScopes', (function(_this) {
        return function() {
          return _this.emitter.emit('did-change-ignored-scopes', _this.getIgnoredScopes());
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.supportedFiletypes', (function(_this) {
        return function() {
          _this.updateIgnoredFiletypes();
          return _this.emitter.emit('did-change-ignored-scopes', _this.getIgnoredScopes());
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', function(type) {
        if (type != null) {
          if (ColorMarkerElement == null) {
            ColorMarkerElement = require('./color-marker-element');
          }
          return ColorMarkerElement.setMarkerType(type);
        }
      }));
      this.subscriptions.add(atom.config.observe('pigments.ignoreVcsIgnoredPaths', (function(_this) {
        return function() {
          return _this.loadPathsAndVariables();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.sassShadeAndTintImplementation', (function(_this) {
        return function() {
          return _this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
            registry: _this.colorExpressionsRegistry
          });
        };
      })(this)));
      svgColorExpression = this.colorExpressionsRegistry.getExpression('pigments:named_colors');
      this.subscriptions.add(atom.config.observe('pigments.filetypesForColorWords', (function(_this) {
        return function(scopes) {
          svgColorExpression.scopes = scopes != null ? scopes : [];
          return _this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
            name: svgColorExpression.name,
            registry: _this.colorExpressionsRegistry
          });
        };
      })(this)));
      this.subscriptions.add(this.colorExpressionsRegistry.onDidUpdateExpressions((function(_this) {
        return function(arg) {
          var name;
          name = arg.name;
          if ((_this.paths == null) || name === 'pigments:variables') {
            return;
          }
          return _this.variables.evaluateVariables(_this.variables.getVariables(), function() {
            var colorBuffer, id, ref2, results1;
            ref2 = _this.colorBuffersByEditorId;
            results1 = [];
            for (id in ref2) {
              colorBuffer = ref2[id];
              results1.push(colorBuffer.update());
            }
            return results1;
          });
        };
      })(this)));
      this.subscriptions.add(this.variableExpressionsRegistry.onDidUpdateExpressions((function(_this) {
        return function() {
          if (_this.paths == null) {
            return;
          }
          return _this.reloadVariablesForPaths(_this.getPaths());
        };
      })(this)));
      if (timestamp != null) {
        this.timestamp = new Date(Date.parse(timestamp));
      }
      this.updateIgnoredFiletypes();
      if (this.paths != null) {
        this.initialize();
      }
      this.initializeBuffers();
    }

    ColorProject.prototype.onDidInitialize = function(callback) {
      return this.emitter.on('did-initialize', callback);
    };

    ColorProject.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    ColorProject.prototype.onDidUpdateVariables = function(callback) {
      return this.emitter.on('did-update-variables', callback);
    };

    ColorProject.prototype.onDidCreateColorBuffer = function(callback) {
      return this.emitter.on('did-create-color-buffer', callback);
    };

    ColorProject.prototype.onDidChangeIgnoredScopes = function(callback) {
      return this.emitter.on('did-change-ignored-scopes', callback);
    };

    ColorProject.prototype.onDidChangePaths = function(callback) {
      return this.emitter.on('did-change-paths', callback);
    };

    ColorProject.prototype.observeColorBuffers = function(callback) {
      var colorBuffer, id, ref1;
      ref1 = this.colorBuffersByEditorId;
      for (id in ref1) {
        colorBuffer = ref1[id];
        callback(colorBuffer);
      }
      return this.onDidCreateColorBuffer(callback);
    };

    ColorProject.prototype.isInitialized = function() {
      return this.initialized;
    };

    ColorProject.prototype.isDestroyed = function() {
      return this.destroyed;
    };

    ColorProject.prototype.initialize = function() {
      if (this.isInitialized()) {
        return Promise.resolve(this.variables.getVariables());
      }
      if (this.initializePromise != null) {
        return this.initializePromise;
      }
      return this.initializePromise = new Promise((function(_this) {
        return function(resolve) {
          return _this.variables.onceInitialized(resolve);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.loadPathsAndVariables();
        };
      })(this)).then((function(_this) {
        return function() {
          if (_this.includeThemes) {
            return _this.includeThemesVariables();
          }
        };
      })(this)).then((function(_this) {
        return function() {
          var variables;
          _this.initialized = true;
          variables = _this.variables.getVariables();
          _this.emitter.emit('did-initialize', variables);
          return variables;
        };
      })(this));
    };

    ColorProject.prototype.destroy = function() {
      var buffer, id, ref1;
      if (this.destroyed) {
        return;
      }
      if (PathsScanner == null) {
        PathsScanner = require('./paths-scanner');
      }
      this.destroyed = true;
      PathsScanner.terminateRunningTask();
      ref1 = this.colorBuffersByEditorId;
      for (id in ref1) {
        buffer = ref1[id];
        buffer.destroy();
      }
      this.colorBuffersByEditorId = null;
      this.subscriptions.dispose();
      this.subscriptions = null;
      this.emitter.emit('did-destroy', this);
      return this.emitter.dispose();
    };

    ColorProject.prototype.reload = function() {
      return this.initialize().then((function(_this) {
        return function() {
          _this.variables.reset();
          _this.paths = [];
          return _this.loadPathsAndVariables();
        };
      })(this)).then((function(_this) {
        return function() {
          if (atom.config.get('pigments.notifyReloads')) {
            return atom.notifications.addSuccess("Pigments successfully reloaded", {
              dismissable: atom.config.get('pigments.dismissableReloadNotifications'),
              description: "Found:\n- **" + _this.paths.length + "** path(s)\n- **" + (_this.getVariables().length) + "** variables(s) including **" + (_this.getColorVariables().length) + "** color(s)"
            });
          } else {
            return console.log("Found:\n- " + _this.paths.length + " path(s)\n- " + (_this.getVariables().length) + " variables(s) including " + (_this.getColorVariables().length) + " color(s)");
          }
        };
      })(this))["catch"](function(reason) {
        var detail, stack;
        detail = reason.message;
        stack = reason.stack;
        atom.notifications.addError("Pigments couldn't be reloaded", {
          detail: detail,
          stack: stack,
          dismissable: true
        });
        return console.error(reason);
      });
    };

    ColorProject.prototype.loadPathsAndVariables = function() {
      var destroyed;
      destroyed = null;
      return this.loadPaths().then((function(_this) {
        return function(arg) {
          var dirtied, j, len, path, removed;
          dirtied = arg.dirtied, removed = arg.removed;
          if (removed.length > 0) {
            _this.paths = _this.paths.filter(function(p) {
              return indexOf.call(removed, p) < 0;
            });
            _this.deleteVariablesForPaths(removed);
          }
          if ((_this.paths != null) && dirtied.length > 0) {
            for (j = 0, len = dirtied.length; j < len; j++) {
              path = dirtied[j];
              if (indexOf.call(_this.paths, path) < 0) {
                _this.paths.push(path);
              }
            }
            if (_this.variables.length) {
              return dirtied;
            } else {
              return _this.paths;
            }
          } else if (_this.paths == null) {
            return _this.paths = dirtied;
          } else if (!_this.variables.length) {
            return _this.paths;
          } else {
            return [];
          }
        };
      })(this)).then((function(_this) {
        return function(paths) {
          return _this.loadVariablesForPaths(paths);
        };
      })(this)).then((function(_this) {
        return function(results) {
          if (results != null) {
            return _this.variables.updateCollection(results);
          }
        };
      })(this));
    };

    ColorProject.prototype.findAllColors = function() {
      var patterns;
      if (ColorSearch == null) {
        ColorSearch = require('./color-search');
      }
      patterns = this.getSearchNames();
      return new ColorSearch({
        sourceNames: patterns,
        project: this,
        ignoredNames: this.getIgnoredNames(),
        context: this.getContext()
      });
    };

    ColorProject.prototype.setColorPickerAPI = function(colorPickerAPI) {
      this.colorPickerAPI = colorPickerAPI;
    };

    ColorProject.prototype.initializeBuffers = function() {
      return this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var buffer, bufferElement, editorPath;
          editorPath = editor.getPath();
          if ((editorPath == null) || _this.isBufferIgnored(editorPath)) {
            return;
          }
          buffer = _this.colorBufferForEditor(editor);
          if (buffer != null) {
            bufferElement = atom.views.getView(buffer);
            return bufferElement.attach();
          }
        };
      })(this)));
    };

    ColorProject.prototype.hasColorBufferForEditor = function(editor) {
      if (this.destroyed || (editor == null)) {
        return false;
      }
      return this.colorBuffersByEditorId[editor.id] != null;
    };

    ColorProject.prototype.colorBufferForEditor = function(editor) {
      var buffer, state, subscription;
      if (this.destroyed) {
        return;
      }
      if (editor == null) {
        return;
      }
      if (ColorBuffer == null) {
        ColorBuffer = require('./color-buffer');
      }
      if (this.colorBuffersByEditorId[editor.id] != null) {
        return this.colorBuffersByEditorId[editor.id];
      }
      if (this.bufferStates[editor.id] != null) {
        state = this.bufferStates[editor.id];
        state.editor = editor;
        state.project = this;
        delete this.bufferStates[editor.id];
      } else {
        state = {
          editor: editor,
          project: this
        };
      }
      this.colorBuffersByEditorId[editor.id] = buffer = new ColorBuffer(state);
      this.subscriptions.add(subscription = buffer.onDidDestroy((function(_this) {
        return function() {
          _this.subscriptions.remove(subscription);
          subscription.dispose();
          return delete _this.colorBuffersByEditorId[editor.id];
        };
      })(this)));
      this.emitter.emit('did-create-color-buffer', buffer);
      return buffer;
    };

    ColorProject.prototype.colorBufferForPath = function(path) {
      var colorBuffer, id, ref1;
      ref1 = this.colorBuffersByEditorId;
      for (id in ref1) {
        colorBuffer = ref1[id];
        if (colorBuffer.editor.getPath() === path) {
          return colorBuffer;
        }
      }
    };

    ColorProject.prototype.updateColorBuffers = function() {
      var buffer, bufferElement, e, editor, id, j, len, ref1, ref2, results1;
      ref1 = this.colorBuffersByEditorId;
      for (id in ref1) {
        buffer = ref1[id];
        if (this.isBufferIgnored(buffer.editor.getPath())) {
          buffer.destroy();
          delete this.colorBuffersByEditorId[id];
        }
      }
      try {
        if (this.colorBuffersByEditorId != null) {
          ref2 = atom.workspace.getTextEditors();
          results1 = [];
          for (j = 0, len = ref2.length; j < len; j++) {
            editor = ref2[j];
            if (this.hasColorBufferForEditor(editor) || this.isBufferIgnored(editor.getPath())) {
              continue;
            }
            buffer = this.colorBufferForEditor(editor);
            if (buffer != null) {
              bufferElement = atom.views.getView(buffer);
              results1.push(bufferElement.attach());
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        }
      } catch (error) {
        e = error;
        return console.log(e);
      }
    };

    ColorProject.prototype.isBufferIgnored = function(path) {
      var j, len, ref1, source, sources;
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      sources = (ref1 = this.ignoredBufferNames) != null ? ref1 : [];
      for (j = 0, len = sources.length; j < len; j++) {
        source = sources[j];
        if (minimatch(path, source, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
      return false;
    };

    ColorProject.prototype.getPaths = function() {
      var ref1;
      return (ref1 = this.paths) != null ? ref1.slice() : void 0;
    };

    ColorProject.prototype.appendPath = function(path) {
      if (path != null) {
        return this.paths.push(path);
      }
    };

    ColorProject.prototype.hasPath = function(path) {
      var ref1;
      return indexOf.call((ref1 = this.paths) != null ? ref1 : [], path) >= 0;
    };

    ColorProject.prototype.loadPaths = function(noKnownPaths) {
      if (noKnownPaths == null) {
        noKnownPaths = false;
      }
      if (PathsLoader == null) {
        PathsLoader = require('./paths-loader');
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var config, knownPaths, ref1, rootPaths;
          rootPaths = _this.getRootPaths();
          knownPaths = noKnownPaths ? [] : (ref1 = _this.paths) != null ? ref1 : [];
          config = {
            knownPaths: knownPaths,
            timestamp: _this.timestamp,
            ignoredNames: _this.getIgnoredNames(),
            paths: rootPaths,
            traverseIntoSymlinkDirectories: atom.config.get('pigments.traverseIntoSymlinkDirectories'),
            sourceNames: _this.getSourceNames(),
            ignoreVcsIgnores: atom.config.get('pigments.ignoreVcsIgnoredPaths')
          };
          return PathsLoader.startTask(config, function(results) {
            var isDescendentOfRootPaths, j, len, p;
            for (j = 0, len = knownPaths.length; j < len; j++) {
              p = knownPaths[j];
              isDescendentOfRootPaths = rootPaths.some(function(root) {
                return p.indexOf(root) === 0;
              });
              if (!isDescendentOfRootPaths) {
                if (results.removed == null) {
                  results.removed = [];
                }
                results.removed.push(p);
              }
            }
            return resolve(results);
          });
        };
      })(this));
    };

    ColorProject.prototype.updatePaths = function() {
      if (!this.initialized) {
        return Promise.resolve();
      }
      return this.loadPaths().then((function(_this) {
        return function(arg) {
          var dirtied, j, len, p, removed;
          dirtied = arg.dirtied, removed = arg.removed;
          _this.deleteVariablesForPaths(removed);
          _this.paths = _this.paths.filter(function(p) {
            return indexOf.call(removed, p) < 0;
          });
          for (j = 0, len = dirtied.length; j < len; j++) {
            p = dirtied[j];
            if (indexOf.call(_this.paths, p) < 0) {
              _this.paths.push(p);
            }
          }
          _this.emitter.emit('did-change-paths', _this.getPaths());
          return _this.reloadVariablesForPaths(dirtied);
        };
      })(this));
    };

    ColorProject.prototype.isVariablesSourcePath = function(path) {
      var j, len, source, sources;
      if (!path) {
        return false;
      }
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      sources = this.getSourceNames();
      for (j = 0, len = sources.length; j < len; j++) {
        source = sources[j];
        if (minimatch(path, source, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
    };

    ColorProject.prototype.isIgnoredPath = function(path) {
      var ignore, ignoredNames, j, len;
      if (!path) {
        return false;
      }
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      ignoredNames = this.getIgnoredNames();
      for (j = 0, len = ignoredNames.length; j < len; j++) {
        ignore = ignoredNames[j];
        if (minimatch(path, ignore, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
    };

    ColorProject.prototype.scopeFromFileName = function(path) {
      var scope;
      if (scopeFromFileName == null) {
        scopeFromFileName = require('./scope-from-file-name');
      }
      scope = scopeFromFileName(path);
      if (scope === 'sass' || scope === 'scss') {
        scope = [scope, this.getSassScopeSuffix()].join(':');
      }
      return scope;
    };

    ColorProject.prototype.getPalette = function() {
      if (Palette == null) {
        Palette = require('./palette');
      }
      if (!this.isInitialized()) {
        return new Palette;
      }
      return new Palette(this.getColorVariables());
    };

    ColorProject.prototype.getContext = function() {
      return this.variables.getContext();
    };

    ColorProject.prototype.getVariables = function() {
      return this.variables.getVariables();
    };

    ColorProject.prototype.getVariableExpressionsRegistry = function() {
      return this.variableExpressionsRegistry;
    };

    ColorProject.prototype.getVariableById = function(id) {
      return this.variables.getVariableById(id);
    };

    ColorProject.prototype.getVariableByName = function(name) {
      return this.variables.getVariableByName(name);
    };

    ColorProject.prototype.getColorVariables = function() {
      return this.variables.getColorVariables();
    };

    ColorProject.prototype.getColorExpressionsRegistry = function() {
      return this.colorExpressionsRegistry;
    };

    ColorProject.prototype.showVariableInFile = function(variable) {
      return atom.workspace.open(variable.path).then(function(editor) {
        var buffer, bufferRange, ref1;
        if (Range == null) {
          ref1 = require('atom'), Emitter = ref1.Emitter, CompositeDisposable = ref1.CompositeDisposable, Range = ref1.Range;
        }
        buffer = editor.getBuffer();
        bufferRange = Range.fromObject([buffer.positionForCharacterIndex(variable.range[0]), buffer.positionForCharacterIndex(variable.range[1])]);
        return editor.setSelectedBufferRange(bufferRange, {
          autoscroll: true
        });
      });
    };

    ColorProject.prototype.emitVariablesChangeEvent = function(results) {
      return this.emitter.emit('did-update-variables', results);
    };

    ColorProject.prototype.loadVariablesForPath = function(path) {
      return this.loadVariablesForPaths([path]);
    };

    ColorProject.prototype.loadVariablesForPaths = function(paths) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.scanPathsForVariables(paths, function(results) {
            return resolve(results);
          });
        };
      })(this));
    };

    ColorProject.prototype.getVariablesForPath = function(path) {
      return this.variables.getVariablesForPath(path);
    };

    ColorProject.prototype.getVariablesForPaths = function(paths) {
      return this.variables.getVariablesForPaths(paths);
    };

    ColorProject.prototype.deleteVariablesForPath = function(path) {
      return this.deleteVariablesForPaths([path]);
    };

    ColorProject.prototype.deleteVariablesForPaths = function(paths) {
      return this.variables.deleteVariablesForPaths(paths);
    };

    ColorProject.prototype.reloadVariablesForPath = function(path) {
      return this.reloadVariablesForPaths([path]);
    };

    ColorProject.prototype.reloadVariablesForPaths = function(paths) {
      var promise;
      promise = Promise.resolve();
      if (!this.isInitialized()) {
        promise = this.initialize();
      }
      return promise.then((function(_this) {
        return function() {
          if (paths.some(function(path) {
            return indexOf.call(_this.paths, path) < 0;
          })) {
            return Promise.resolve([]);
          }
          return _this.loadVariablesForPaths(paths);
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.variables.updateCollection(results, paths);
        };
      })(this));
    };

    ColorProject.prototype.scanPathsForVariables = function(paths, callback) {
      var colorBuffer;
      if (paths.length === 1 && (colorBuffer = this.colorBufferForPath(paths[0]))) {
        return colorBuffer.scanBufferForVariables().then(function(results) {
          return callback(results);
        });
      } else {
        if (PathsScanner == null) {
          PathsScanner = require('./paths-scanner');
        }
        return PathsScanner.startTask(paths.map((function(_this) {
          return function(p) {
            return [p, _this.scopeFromFileName(p)];
          };
        })(this)), this.variableExpressionsRegistry, function(results) {
          return callback(results);
        });
      }
    };

    ColorProject.prototype.loadThemesVariables = function() {
      var div, html, iterator, variables;
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      if (ATOM_VARIABLES == null) {
        ATOM_VARIABLES = require('./atom-variables');
      }
      iterator = 0;
      variables = [];
      html = '';
      ATOM_VARIABLES.forEach(function(v) {
        return html += "<div class='" + v + "'>" + v + "</div>";
      });
      div = document.createElement('div');
      div.className = 'pigments-sampler';
      div.innerHTML = html;
      document.body.appendChild(div);
      ATOM_VARIABLES.forEach(function(v, i) {
        var color, end, node, variable;
        node = div.children[i];
        color = getComputedStyle(node).color;
        end = iterator + v.length + color.length + 4;
        variable = {
          name: "@" + v,
          line: i,
          value: color,
          range: [iterator, end],
          path: THEME_VARIABLES
        };
        iterator = end;
        return variables.push(variable);
      });
      document.body.removeChild(div);
      return variables;
    };

    ColorProject.prototype.getRootPaths = function() {
      return atom.project.getPaths();
    };

    ColorProject.prototype.getSassScopeSuffix = function() {
      var ref1, ref2;
      return (ref1 = (ref2 = this.sassShadeAndTintImplementation) != null ? ref2 : atom.config.get('pigments.sassShadeAndTintImplementation')) != null ? ref1 : 'compass';
    };

    ColorProject.prototype.setSassShadeAndTintImplementation = function(sassShadeAndTintImplementation) {
      this.sassShadeAndTintImplementation = sassShadeAndTintImplementation;
      return this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
        registry: this.colorExpressionsRegistry
      });
    };

    ColorProject.prototype.getSourceNames = function() {
      var names, ref1, ref2;
      names = ['.pigments'];
      names = names.concat((ref1 = this.sourceNames) != null ? ref1 : []);
      if (!this.ignoreGlobalSourceNames) {
        names = names.concat((ref2 = atom.config.get('pigments.sourceNames')) != null ? ref2 : []);
      }
      return names;
    };

    ColorProject.prototype.setSourceNames = function(sourceNames) {
      this.sourceNames = sourceNames != null ? sourceNames : [];
      if ((this.initialized == null) && (this.initializePromise == null)) {
        return;
      }
      return this.initialize().then((function(_this) {
        return function() {
          return _this.loadPathsAndVariables(true);
        };
      })(this));
    };

    ColorProject.prototype.setIgnoreGlobalSourceNames = function(ignoreGlobalSourceNames) {
      this.ignoreGlobalSourceNames = ignoreGlobalSourceNames;
      return this.updatePaths();
    };

    ColorProject.prototype.getSearchNames = function() {
      var names, ref1, ref2, ref3, ref4;
      names = [];
      names = names.concat((ref1 = this.sourceNames) != null ? ref1 : []);
      names = names.concat((ref2 = this.searchNames) != null ? ref2 : []);
      if (!this.ignoreGlobalSearchNames) {
        names = names.concat((ref3 = atom.config.get('pigments.sourceNames')) != null ? ref3 : []);
        names = names.concat((ref4 = atom.config.get('pigments.extendedSearchNames')) != null ? ref4 : []);
      }
      return names;
    };

    ColorProject.prototype.setSearchNames = function(searchNames) {
      this.searchNames = searchNames != null ? searchNames : [];
    };

    ColorProject.prototype.setIgnoreGlobalSearchNames = function(ignoreGlobalSearchNames) {
      this.ignoreGlobalSearchNames = ignoreGlobalSearchNames;
    };

    ColorProject.prototype.getIgnoredNames = function() {
      var names, ref1, ref2, ref3;
      names = (ref1 = this.ignoredNames) != null ? ref1 : [];
      if (!this.ignoreGlobalIgnoredNames) {
        names = names.concat((ref2 = this.getGlobalIgnoredNames()) != null ? ref2 : []);
        names = names.concat((ref3 = atom.config.get('core.ignoredNames')) != null ? ref3 : []);
      }
      return names;
    };

    ColorProject.prototype.getGlobalIgnoredNames = function() {
      var ref1;
      return (ref1 = atom.config.get('pigments.ignoredNames')) != null ? ref1.map(function(p) {
        if (/\/\*$/.test(p)) {
          return p + '*';
        } else {
          return p;
        }
      }) : void 0;
    };

    ColorProject.prototype.setIgnoredNames = function(ignoredNames1) {
      this.ignoredNames = ignoredNames1 != null ? ignoredNames1 : [];
      if ((this.initialized == null) && (this.initializePromise == null)) {
        return Promise.reject('Project is not initialized yet');
      }
      return this.initialize().then((function(_this) {
        return function() {
          var dirtied;
          dirtied = _this.paths.filter(function(p) {
            return _this.isIgnoredPath(p);
          });
          _this.deleteVariablesForPaths(dirtied);
          _this.paths = _this.paths.filter(function(p) {
            return !_this.isIgnoredPath(p);
          });
          return _this.loadPathsAndVariables(true);
        };
      })(this));
    };

    ColorProject.prototype.setIgnoreGlobalIgnoredNames = function(ignoreGlobalIgnoredNames) {
      this.ignoreGlobalIgnoredNames = ignoreGlobalIgnoredNames;
      return this.updatePaths();
    };

    ColorProject.prototype.getIgnoredScopes = function() {
      var ref1, ref2, scopes;
      scopes = (ref1 = this.ignoredScopes) != null ? ref1 : [];
      if (!this.ignoreGlobalIgnoredScopes) {
        scopes = scopes.concat((ref2 = atom.config.get('pigments.ignoredScopes')) != null ? ref2 : []);
      }
      scopes = scopes.concat(this.ignoredFiletypes);
      return scopes;
    };

    ColorProject.prototype.setIgnoredScopes = function(ignoredScopes) {
      this.ignoredScopes = ignoredScopes != null ? ignoredScopes : [];
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.setIgnoreGlobalIgnoredScopes = function(ignoreGlobalIgnoredScopes) {
      this.ignoreGlobalIgnoredScopes = ignoreGlobalIgnoredScopes;
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.setSupportedFiletypes = function(supportedFiletypes) {
      this.supportedFiletypes = supportedFiletypes != null ? supportedFiletypes : [];
      this.updateIgnoredFiletypes();
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.updateIgnoredFiletypes = function() {
      return this.ignoredFiletypes = this.getIgnoredFiletypes();
    };

    ColorProject.prototype.getIgnoredFiletypes = function() {
      var filetypes, ref1, ref2, scopes;
      filetypes = (ref1 = this.supportedFiletypes) != null ? ref1 : [];
      if (!this.ignoreGlobalSupportedFiletypes) {
        filetypes = filetypes.concat((ref2 = atom.config.get('pigments.supportedFiletypes')) != null ? ref2 : []);
      }
      if (filetypes.length === 0) {
        filetypes = ['*'];
      }
      if (filetypes.some(function(type) {
        return type === '*';
      })) {
        return [];
      }
      scopes = filetypes.map(function(ext) {
        var ref3;
        return (ref3 = atom.grammars.selectGrammar("file." + ext)) != null ? ref3.scopeName.replace(/\./g, '\\.') : void 0;
      }).filter(function(scope) {
        return scope != null;
      });
      return ["^(?!\\.(" + (scopes.join('|')) + "))"];
    };

    ColorProject.prototype.setIgnoreGlobalSupportedFiletypes = function(ignoreGlobalSupportedFiletypes) {
      this.ignoreGlobalSupportedFiletypes = ignoreGlobalSupportedFiletypes;
      this.updateIgnoredFiletypes();
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.themesIncluded = function() {
      return this.includeThemes;
    };

    ColorProject.prototype.setIncludeThemes = function(includeThemes) {
      if (includeThemes === this.includeThemes) {
        return Promise.resolve();
      }
      this.includeThemes = includeThemes;
      if (this.includeThemes) {
        return this.includeThemesVariables();
      } else {
        return this.disposeThemesVariables();
      }
    };

    ColorProject.prototype.includeThemesVariables = function() {
      this.themesSubscription = atom.themes.onDidChangeActiveThemes((function(_this) {
        return function() {
          var variables;
          if (!_this.includeThemes) {
            return;
          }
          if (THEME_VARIABLES == null) {
            THEME_VARIABLES = require('./uris').THEME_VARIABLES;
          }
          variables = _this.loadThemesVariables();
          return _this.variables.updatePathCollection(THEME_VARIABLES, variables);
        };
      })(this));
      this.subscriptions.add(this.themesSubscription);
      return this.variables.addMany(this.loadThemesVariables());
    };

    ColorProject.prototype.disposeThemesVariables = function() {
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      this.subscriptions.remove(this.themesSubscription);
      this.variables.deleteVariablesForPaths([THEME_VARIABLES]);
      return this.themesSubscription.dispose();
    };

    ColorProject.prototype.getTimestamp = function() {
      return new Date();
    };

    ColorProject.prototype.serialize = function() {
      var data, ref1;
      if (SERIALIZE_VERSION == null) {
        ref1 = require('./versions'), SERIALIZE_VERSION = ref1.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = ref1.SERIALIZE_MARKERS_VERSION;
      }
      data = {
        deserializer: 'ColorProject',
        timestamp: this.getTimestamp(),
        version: SERIALIZE_VERSION,
        markersVersion: SERIALIZE_MARKERS_VERSION,
        globalSourceNames: atom.config.get('pigments.sourceNames'),
        globalIgnoredNames: atom.config.get('pigments.ignoredNames')
      };
      if (this.ignoreGlobalSourceNames != null) {
        data.ignoreGlobalSourceNames = this.ignoreGlobalSourceNames;
      }
      if (this.ignoreGlobalSearchNames != null) {
        data.ignoreGlobalSearchNames = this.ignoreGlobalSearchNames;
      }
      if (this.ignoreGlobalIgnoredNames != null) {
        data.ignoreGlobalIgnoredNames = this.ignoreGlobalIgnoredNames;
      }
      if (this.ignoreGlobalIgnoredScopes != null) {
        data.ignoreGlobalIgnoredScopes = this.ignoreGlobalIgnoredScopes;
      }
      if (this.includeThemes != null) {
        data.includeThemes = this.includeThemes;
      }
      if (this.ignoredScopes != null) {
        data.ignoredScopes = this.ignoredScopes;
      }
      if (this.ignoredNames != null) {
        data.ignoredNames = this.ignoredNames;
      }
      if (this.sourceNames != null) {
        data.sourceNames = this.sourceNames;
      }
      if (this.searchNames != null) {
        data.searchNames = this.searchNames;
      }
      data.buffers = this.serializeBuffers();
      if (this.isInitialized()) {
        data.paths = this.paths;
        data.variables = this.variables.serialize();
      }
      return data;
    };

    ColorProject.prototype.serializeBuffers = function() {
      var colorBuffer, id, out, ref1;
      out = {};
      ref1 = this.colorBuffersByEditorId;
      for (id in ref1) {
        colorBuffer = ref1[id];
        out[id] = colorBuffer.serialize();
      }
      return out;
    };

    return ColorProject;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1wcm9qZWN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsd1JBQUE7SUFBQTs7RUFBQSxNQVFJLEVBUkosRUFDRSxvQkFERixFQUNlLG9CQURmLEVBRUUsZ0JBRkYsRUFFVywyQkFGWCxFQUUrQiw0QkFGL0IsRUFHRSxvQkFIRixFQUdlLHFCQUhmLEVBSUUsZ0JBSkYsRUFJVyw0QkFKWCxFQUlnQyxjQUpoQyxFQUtFLDJCQUxGLEVBS3FCLG1DQUxyQixFQUtnRCx5QkFMaEQsRUFLaUUsd0JBTGpFLEVBTUUsMkJBTkYsRUFPRTs7RUFHRixZQUFBLEdBQWUsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNiLFFBQUE7SUFBQSxJQUFvQixXQUFKLElBQWMsV0FBOUI7QUFBQSxhQUFPLE1BQVA7O0lBQ0EsSUFBb0IsQ0FBQyxDQUFDLE1BQUYsS0FBWSxDQUFDLENBQUMsTUFBbEM7QUFBQSxhQUFPLE1BQVA7O0FBQ0EsU0FBQSwyQ0FBQTs7VUFBK0IsQ0FBQSxLQUFPLENBQUUsQ0FBQSxDQUFBO0FBQXhDLGVBQU87O0FBQVA7QUFDQSxXQUFPO0VBSk07O0VBTWYsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNKLFlBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxLQUFEO0FBQ1osVUFBQTtNQUFBLElBQU8seUJBQVA7UUFDRSxPQUFpRCxPQUFBLENBQVEsWUFBUixDQUFqRCxFQUFDLDBDQUFELEVBQW9CLDJEQUR0Qjs7TUFHQSxjQUFBLEdBQWlCO01BQ2pCLElBQTRCLElBQUksQ0FBQyxTQUFMLENBQUEsQ0FBQSxJQUFxQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUF1QixDQUFDLElBQXhCLENBQTZCLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxLQUFGLENBQVEsYUFBUjtNQUFQLENBQTdCLENB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bG9yTWFya2VyRWxlbWVudCwgVmFyaWFibGVzQ29sbGVjdGlvbixcbiAgUGF0aHNMb2FkZXIsIFBhdGhzU2Nhbm5lcixcbiAgRW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2UsXG4gIFNFUklBTElaRV9WRVJTSU9OLCBTRVJJQUxJWkVfTUFSS0VSU19WRVJTSU9OLCBUSEVNRV9WQVJJQUJMRVMsIEFUT01fVkFSSUFCTEVTLFxuICBzY29wZUZyb21GaWxlTmFtZSxcbiAgbWluaW1hdGNoXG5dID0gW11cblxuY29tcGFyZUFycmF5ID0gKGEsYikgLT5cbiAgcmV0dXJuIGZhbHNlIGlmIG5vdCBhPyBvciBub3QgYj9cbiAgcmV0dXJuIGZhbHNlIHVubGVzcyBhLmxlbmd0aCBpcyBiLmxlbmd0aFxuICByZXR1cm4gZmFsc2UgZm9yIHYsaSBpbiBhIHdoZW4gdiBpc250IGJbaV1cbiAgcmV0dXJuIHRydWVcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ29sb3JQcm9qZWN0XG4gIEBkZXNlcmlhbGl6ZTogKHN0YXRlKSAtPlxuICAgIHVubGVzcyBTRVJJQUxJWkVfVkVSU0lPTj9cbiAgICAgIHtTRVJJQUxJWkVfVkVSU0lPTiwgU0VSSUFMSVpFX01BUktFUlNfVkVSU0lPTn0gPSByZXF1aXJlICcuL3ZlcnNpb25zJ1xuXG4gICAgbWFya2Vyc1ZlcnNpb24gPSBTRVJJQUxJWkVfTUFSS0VSU19WRVJTSU9OXG4gICAgbWFya2Vyc1ZlcnNpb24gKz0gJy1kZXYnIGlmIGF0b20uaW5EZXZNb2RlKCkgYW5kIGF0b20ucHJvamVjdC5nZXRQYXRocygpLnNvbWUgKHApIC0+IHAubWF0Y2goL1xcL3BpZ21lbnRzJC8pXG5cbiAgICBpZiBzdGF0ZT8udmVyc2lvbiBpc250IFNFUklBTElaRV9WRVJTSU9OXG4gICAgICBzdGF0ZSA9IHt9XG5cbiAgICBpZiBzdGF0ZT8ubWFya2Vyc1ZlcnNpb24gaXNudCBtYXJrZXJzVmVyc2lvblxuICAgICAgZGVsZXRlIHN0YXRlLnZhcmlhYmxlc1xuICAgICAgZGVsZXRlIHN0YXRlLmJ1ZmZlcnNcblxuICAgIGlmIG5vdCBjb21wYXJlQXJyYXkoc3RhdGUuZ2xvYmFsU291cmNlTmFtZXMsIGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuc291cmNlTmFtZXMnKSkgb3Igbm90IGNvbXBhcmVBcnJheShzdGF0ZS5nbG9iYWxJZ25vcmVkTmFtZXMsIGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuaWdub3JlZE5hbWVzJykpXG4gICAgICBkZWxldGUgc3RhdGUudmFyaWFibGVzXG4gICAgICBkZWxldGUgc3RhdGUuYnVmZmVyc1xuICAgICAgZGVsZXRlIHN0YXRlLnBhdGhzXG5cbiAgICBuZXcgQ29sb3JQcm9qZWN0KHN0YXRlKVxuXG4gIGNvbnN0cnVjdG9yOiAoc3RhdGU9e30pIC0+XG4gICAge0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nIHVubGVzcyBFbWl0dGVyP1xuICAgIFZhcmlhYmxlc0NvbGxlY3Rpb24gPz0gcmVxdWlyZSAnLi92YXJpYWJsZXMtY29sbGVjdGlvbidcblxuICAgIHtcbiAgICAgIEBpbmNsdWRlVGhlbWVzLCBAaWdub3JlZE5hbWVzLCBAc291cmNlTmFtZXMsIEBpZ25vcmVkU2NvcGVzLCBAcGF0aHMsIEBzZWFyY2hOYW1lcywgQGlnbm9yZUdsb2JhbFNvdXJjZU5hbWVzLCBAaWdub3JlR2xvYmFsSWdub3JlZE5hbWVzLCBAaWdub3JlR2xvYmFsSWdub3JlZFNjb3BlcywgQGlnbm9yZUdsb2JhbFNlYXJjaE5hbWVzLCBAaWdub3JlR2xvYmFsU3VwcG9ydGVkRmlsZXR5cGVzLCBAc3VwcG9ydGVkRmlsZXR5cGVzLCB2YXJpYWJsZXMsIHRpbWVzdGFtcCwgYnVmZmVyc1xuICAgIH0gPSBzdGF0ZVxuXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAY29sb3JCdWZmZXJzQnlFZGl0b3JJZCA9IHt9XG4gICAgQGJ1ZmZlclN0YXRlcyA9IGJ1ZmZlcnMgPyB7fVxuXG4gICAgQHZhcmlhYmxlRXhwcmVzc2lvbnNSZWdpc3RyeSA9IHJlcXVpcmUgJy4vdmFyaWFibGUtZXhwcmVzc2lvbnMnXG4gICAgQGNvbG9yRXhwcmVzc2lvbnNSZWdpc3RyeSA9IHJlcXVpcmUgJy4vY29sb3ItZXhwcmVzc2lvbnMnXG5cbiAgICBpZiB2YXJpYWJsZXM/XG4gICAgICBAdmFyaWFibGVzID0gYXRvbS5kZXNlcmlhbGl6ZXJzLmRlc2VyaWFsaXplKHZhcmlhYmxlcylcbiAgICBlbHNlXG4gICAgICBAdmFyaWFibGVzID0gbmV3IFZhcmlhYmxlc0NvbGxlY3Rpb25cblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAdmFyaWFibGVzLm9uRGlkQ2hhbmdlIChyZXN1bHRzKSA9PlxuICAgICAgQGVtaXRWYXJpYWJsZXNDaGFuZ2VFdmVudChyZXN1bHRzKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3BpZ21lbnRzLnNvdXJjZU5hbWVzJywgPT5cbiAgICAgIEB1cGRhdGVQYXRocygpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncGlnbWVudHMuaWdub3JlZE5hbWVzJywgPT5cbiAgICAgIEB1cGRhdGVQYXRocygpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncGlnbWVudHMuaWdub3JlZEJ1ZmZlck5hbWVzJywgKEBpZ25vcmVkQnVmZmVyTmFtZXMpID0+XG4gICAgICBAdXBkYXRlQ29sb3JCdWZmZXJzKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdwaWdtZW50cy5pZ25vcmVkU2NvcGVzJywgPT5cbiAgICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtaWdub3JlZC1zY29wZXMnLCBAZ2V0SWdub3JlZFNjb3BlcygpKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3BpZ21lbnRzLnN1cHBvcnRlZEZpbGV0eXBlcycsID0+XG4gICAgICBAdXBkYXRlSWdub3JlZEZpbGV0eXBlcygpXG4gICAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWlnbm9yZWQtc2NvcGVzJywgQGdldElnbm9yZWRTY29wZXMoKSlcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdwaWdtZW50cy5tYXJrZXJUeXBlJywgKHR5cGUpIC0+XG4gICAgICBpZiB0eXBlP1xuICAgICAgICBDb2xvck1hcmtlckVsZW1lbnQgPz0gcmVxdWlyZSAnLi9jb2xvci1tYXJrZXItZWxlbWVudCdcbiAgICAgICAgQ29sb3JNYXJrZXJFbGVtZW50LnNldE1hcmtlclR5cGUodHlwZSlcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdwaWdtZW50cy5pZ25vcmVWY3NJZ25vcmVkUGF0aHMnLCA9PlxuICAgICAgQGxvYWRQYXRoc0FuZFZhcmlhYmxlcygpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncGlnbWVudHMuc2Fzc1NoYWRlQW5kVGludEltcGxlbWVudGF0aW9uJywgPT5cbiAgICAgIEBjb2xvckV4cHJlc3Npb25zUmVnaXN0cnkuZW1pdHRlci5lbWl0ICdkaWQtdXBkYXRlLWV4cHJlc3Npb25zJywge1xuICAgICAgICByZWdpc3RyeTogQGNvbG9yRXhwcmVzc2lvbnNSZWdpc3RyeVxuICAgICAgfVxuXG4gICAgc3ZnQ29sb3JFeHByZXNzaW9uID0gQGNvbG9yRXhwcmVzc2lvbnNSZWdpc3RyeS5nZXRFeHByZXNzaW9uKCdwaWdtZW50czpuYW1lZF9jb2xvcnMnKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdwaWdtZW50cy5maWxldHlwZXNGb3JDb2xvcldvcmRzJywgKHNjb3BlcykgPT5cbiAgICAgIHN2Z0NvbG9yRXhwcmVzc2lvbi5zY29wZXMgPSBzY29wZXMgPyBbXVxuICAgICAgQGNvbG9yRXhwcmVzc2lvbnNSZWdpc3RyeS5lbWl0dGVyLmVtaXQgJ2RpZC11cGRhdGUtZXhwcmVzc2lvbnMnLCB7XG4gICAgICAgIG5hbWU6IHN2Z0NvbG9yRXhwcmVzc2lvbi5uYW1lXG4gICAgICAgIHJlZ2lzdHJ5OiBAY29sb3JFeHByZXNzaW9uc1JlZ2lzdHJ5XG4gICAgICB9XG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGNvbG9yRXhwcmVzc2lvbnNSZWdpc3RyeS5vbkRpZFVwZGF0ZUV4cHJlc3Npb25zICh7bmFtZX0pID0+XG4gICAgICByZXR1cm4gaWYgbm90IEBwYXRocz8gb3IgbmFtZSBpcyAncGlnbWVudHM6dmFyaWFibGVzJ1xuICAgICAgQHZhcmlhYmxlcy5ldmFsdWF0ZVZhcmlhYmxlcyBAdmFyaWFibGVzLmdldFZhcmlhYmxlcygpLCA9PlxuICAgICAgICBjb2xvckJ1ZmZlci51cGRhdGUoKSBmb3IgaWQsIGNvbG9yQnVmZmVyIG9mIEBjb2xvckJ1ZmZlcnNCeUVkaXRvcklkXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHZhcmlhYmxlRXhwcmVzc2lvbnNSZWdpc3RyeS5vbkRpZFVwZGF0ZUV4cHJlc3Npb25zID0+XG4gICAgICByZXR1cm4gdW5sZXNzIEBwYXRocz9cbiAgICAgIEByZWxvYWRWYXJpYWJsZXNGb3JQYXRocyhAZ2V0UGF0aHMoKSlcblxuICAgIEB0aW1lc3RhbXAgPSBuZXcgRGF0ZShEYXRlLnBhcnNlKHRpbWVzdGFtcCkpIGlmIHRpbWVzdGFtcD9cblxuICAgIEB1cGRhdGVJZ25vcmVkRmlsZXR5cGVzKClcblxuICAgIEBpbml0aWFsaXplKCkgaWYgQHBhdGhzP1xuICAgIEBpbml0aWFsaXplQnVmZmVycygpXG5cbiAgb25EaWRJbml0aWFsaXplOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1pbml0aWFsaXplJywgY2FsbGJhY2tcblxuICBvbkRpZERlc3Ryb3k6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWRlc3Ryb3knLCBjYWxsYmFja1xuXG4gIG9uRGlkVXBkYXRlVmFyaWFibGVzOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC11cGRhdGUtdmFyaWFibGVzJywgY2FsbGJhY2tcblxuICBvbkRpZENyZWF0ZUNvbG9yQnVmZmVyOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1jcmVhdGUtY29sb3ItYnVmZmVyJywgY2FsbGJhY2tcblxuICBvbkRpZENoYW5nZUlnbm9yZWRTY29wZXM6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWNoYW5nZS1pZ25vcmVkLXNjb3BlcycsIGNhbGxiYWNrXG5cbiAgb25EaWRDaGFuZ2VQYXRoczogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlLXBhdGhzJywgY2FsbGJhY2tcblxuICBvYnNlcnZlQ29sb3JCdWZmZXJzOiAoY2FsbGJhY2spIC0+XG4gICAgY2FsbGJhY2soY29sb3JCdWZmZXIpIGZvciBpZCxjb2xvckJ1ZmZlciBvZiBAY29sb3JCdWZmZXJzQnlFZGl0b3JJZFxuICAgIEBvbkRpZENyZWF0ZUNvbG9yQnVmZmVyKGNhbGxiYWNrKVxuXG4gIGlzSW5pdGlhbGl6ZWQ6IC0+IEBpbml0aWFsaXplZFxuXG4gIGlzRGVzdHJveWVkOiAtPiBAZGVzdHJveWVkXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKEB2YXJpYWJsZXMuZ2V0VmFyaWFibGVzKCkpIGlmIEBpc0luaXRpYWxpemVkKClcbiAgICByZXR1cm4gQGluaXRpYWxpemVQcm9taXNlIGlmIEBpbml0aWFsaXplUHJvbWlzZT9cbiAgICBAaW5pdGlhbGl6ZVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT5cbiAgICAgIEB2YXJpYWJsZXMub25jZUluaXRpYWxpemVkKHJlc29sdmUpXG4gICAgKVxuICAgIC50aGVuID0+XG4gICAgICBAbG9hZFBhdGhzQW5kVmFyaWFibGVzKClcbiAgICAudGhlbiA9PlxuICAgICAgQGluY2x1ZGVUaGVtZXNWYXJpYWJsZXMoKSBpZiBAaW5jbHVkZVRoZW1lc1xuICAgIC50aGVuID0+XG4gICAgICBAaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgICAgIHZhcmlhYmxlcyA9IEB2YXJpYWJsZXMuZ2V0VmFyaWFibGVzKClcbiAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1pbml0aWFsaXplJywgdmFyaWFibGVzXG4gICAgICB2YXJpYWJsZXNcblxuICBkZXN0cm95OiAtPlxuICAgIHJldHVybiBpZiBAZGVzdHJveWVkXG5cbiAgICBQYXRoc1NjYW5uZXIgPz0gcmVxdWlyZSAnLi9wYXRocy1zY2FubmVyJ1xuXG4gICAgQGRlc3Ryb3llZCA9IHRydWVcblxuICAgIFBhdGhzU2Nhbm5lci50ZXJtaW5hdGVSdW5uaW5nVGFzaygpXG5cbiAgICBidWZmZXIuZGVzdHJveSgpIGZvciBpZCxidWZmZXIgb2YgQGNvbG9yQnVmZmVyc0J5RWRpdG9ySWRcbiAgICBAY29sb3JCdWZmZXJzQnlFZGl0b3JJZCA9IG51bGxcblxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbnVsbFxuXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWRlc3Ryb3knLCB0aGlzXG4gICAgQGVtaXR0ZXIuZGlzcG9zZSgpXG5cbiAgcmVsb2FkOiAtPlxuICAgIEBpbml0aWFsaXplKCkudGhlbiA9PlxuICAgICAgQHZhcmlhYmxlcy5yZXNldCgpXG4gICAgICBAcGF0aHMgPSBbXVxuICAgICAgQGxvYWRQYXRoc0FuZFZhcmlhYmxlcygpXG4gICAgLnRoZW4gPT5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgncGlnbWVudHMubm90aWZ5UmVsb2FkcycpXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKFwiUGlnbWVudHMgc3VjY2Vzc2Z1bGx5IHJlbG9hZGVkXCIsIGRpc21pc3NhYmxlOiBhdG9tLmNvbmZpZy5nZXQoJ3BpZ21lbnRzLmRpc21pc3NhYmxlUmVsb2FkTm90aWZpY2F0aW9ucycpLCBkZXNjcmlwdGlvbjogXCJcIlwiRm91bmQ6XG4gICAgICAgIC0gKioje0BwYXRocy5sZW5ndGh9KiogcGF0aChzKVxuICAgICAgICAtICoqI3tAZ2V0VmFyaWFibGVzKCkubGVuZ3RofSoqIHZhcmlhYmxlcyhzKSBpbmNsdWRpbmcgKioje0BnZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aH0qKiBjb2xvcihzKVxuICAgICAgICBcIlwiXCIpXG4gICAgICBlbHNlXG4gICAgICAgIGNvbnNvbGUubG9nKFwiXCJcIkZvdW5kOlxuICAgICAgICAtICN7QHBhdGhzLmxlbmd0aH0gcGF0aChzKVxuICAgICAgICAtICN7QGdldFZhcmlhYmxlcygpLmxlbmd0aH0gdmFyaWFibGVzKHMpIGluY2x1ZGluZyAje0BnZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aH0gY29sb3IocylcbiAgICAgICAgXCJcIlwiKVxuICAgIC5jYXRjaCAocmVhc29uKSAtPlxuICAgICAgZGV0YWlsID0gcmVhc29uLm1lc3NhZ2VcbiAgICAgIHN0YWNrID0gcmVhc29uLnN0YWNrXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJQaWdtZW50cyBjb3VsZG4ndCBiZSByZWxvYWRlZFwiLCB7ZGV0YWlsLCBzdGFjaywgZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgY29uc29sZS5lcnJvciByZWFzb25cblxuICBsb2FkUGF0aHNBbmRWYXJpYWJsZXM6IC0+XG4gICAgZGVzdHJveWVkID0gbnVsbFxuXG4gICAgQGxvYWRQYXRocygpLnRoZW4gKHtkaXJ0aWVkLCByZW1vdmVkfSkgPT5cbiAgICAgICMgV2UgY2FuIGZpbmQgcmVtb3ZlZCBmaWxlcyBvbmx5IHdoZW4gdGhlcmUncyBhbHJlYWR5IHBhdGhzIGZyb21cbiAgICAgICMgYSBzZXJpYWxpemVkIHN0YXRlXG4gICAgICBpZiByZW1vdmVkLmxlbmd0aCA+IDBcbiAgICAgICAgQHBhdGhzID0gQHBhdGhzLmZpbHRlciAocCkgLT4gcCBub3QgaW4gcmVtb3ZlZFxuICAgICAgICBAZGVsZXRlVmFyaWFibGVzRm9yUGF0aHMocmVtb3ZlZClcblxuICAgICAgIyBUaGVyZSB3YXMgc2VyaWFsaXplZCBwYXRocywgYW5kIHRoZSBpbml0aWFsaXphdGlvbiBkaXNjb3ZlcmVkXG4gICAgICAjIHNvbWUgbmV3IG9yIGRpcnR5IG9uZXMuXG4gICAgICBpZiBAcGF0aHM/IGFuZCBkaXJ0aWVkLmxlbmd0aCA+IDBcbiAgICAgICAgQHBhdGhzLnB1c2ggcGF0aCBmb3IgcGF0aCBpbiBkaXJ0aWVkIHdoZW4gcGF0aCBub3QgaW4gQHBhdGhzXG5cbiAgICAgICAgIyBUaGVyZSB3YXMgYWxzbyBzZXJpYWxpemVkIHZhcmlhYmxlcywgc28gd2UnbGwgcmVzY2FuIG9ubHkgdGhlXG4gICAgICAgICMgZGlydHkgcGF0aHNcbiAgICAgICAgaWYgQHZhcmlhYmxlcy5sZW5ndGhcbiAgICAgICAgICBkaXJ0aWVkXG4gICAgICAgICMgVGhlcmUgd2FzIG5vIHZhcmlhYmxlcywgc28gaXQncyBwcm9iYWJseSBiZWNhdXNlIHRoZSBtYXJrZXJzXG4gICAgICAgICMgdmVyc2lvbiBjaGFuZ2VkLCB3ZSdsbCByZXNjYW4gYWxsIHRoZSBmaWxlc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgQHBhdGhzXG4gICAgICAjIFRoZXJlIHdhcyBubyBzZXJpYWxpemVkIHBhdGhzLCBzbyB0aGVyZSdzIG5vIHZhcmlhYmxlcyBuZWl0aGVyXG4gICAgICBlbHNlIHVubGVzcyBAcGF0aHM/XG4gICAgICAgIEBwYXRocyA9IGRpcnRpZWRcbiAgICAgICMgT25seSB0aGUgbWFya2VycyB2ZXJzaW9uIGNoYW5nZWQsIGFsbCB0aGUgcGF0aHMgZnJvbSB0aGUgc2VyaWFsaXplZFxuICAgICAgIyBzdGF0ZSB3aWxsIGJlIHJlc2Nhbm5lZFxuICAgICAgZWxzZSB1bmxlc3MgQHZhcmlhYmxlcy5sZW5ndGhcbiAgICAgICAgQHBhdGhzXG4gICAgICAjIE5vdGhpbmcgY2hhbmdlZCwgdGhlcmUncyBubyBkaXJ0eSBwYXRocyB0byByZXNjYW5cbiAgICAgIGVsc2VcbiAgICAgICAgW11cbiAgICAudGhlbiAocGF0aHMpID0+XG4gICAgICBAbG9hZFZhcmlhYmxlc0ZvclBhdGhzKHBhdGhzKVxuICAgIC50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgQHZhcmlhYmxlcy51cGRhdGVDb2xsZWN0aW9uKHJlc3VsdHMpIGlmIHJlc3VsdHM/XG5cbiAgZmluZEFsbENvbG9yczogLT5cbiAgICBDb2xvclNlYXJjaCA/PSByZXF1aXJlICcuL2NvbG9yLXNlYXJjaCdcblxuICAgIHBhdHRlcm5zID0gQGdldFNlYXJjaE5hbWVzKClcbiAgICBuZXcgQ29sb3JTZWFyY2hcbiAgICAgIHNvdXJjZU5hbWVzOiBwYXR0ZXJuc1xuICAgICAgcHJvamVjdDogdGhpc1xuICAgICAgaWdub3JlZE5hbWVzOiBAZ2V0SWdub3JlZE5hbWVzKClcbiAgICAgIGNvbnRleHQ6IEBnZXRDb250ZXh0KClcblxuICBzZXRDb2xvclBpY2tlckFQSTogKEBjb2xvclBpY2tlckFQSSkgLT5cblxuICAjIyAgICAjIyMjIyMjIyAgIyMgICAgICMjICMjIyMjIyMjICMjIyMjIyMjICMjIyMjIyMjICMjIyMjIyMjICAgIyMjIyMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgICMjICMjXG4gICMjICAgICMjIyMjIyMjICAjIyAgICAgIyMgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICMjICAgICAgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAjIyAgIyMgICAgIyNcbiAgIyMgICAgIyMjIyMjIyMgICAjIyMjIyMjICAjIyAgICAgICAjIyAgICAgICAjIyMjIyMjIyAjIyAgICAgIyMgICMjIyMjI1xuXG4gIGluaXRpYWxpemVCdWZmZXJzOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIGVkaXRvclBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICByZXR1cm4gaWYgbm90IGVkaXRvclBhdGg/IG9yIEBpc0J1ZmZlcklnbm9yZWQoZWRpdG9yUGF0aClcblxuICAgICAgYnVmZmVyID0gQGNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgIGlmIGJ1ZmZlcj9cbiAgICAgICAgYnVmZmVyRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhidWZmZXIpXG4gICAgICAgIGJ1ZmZlckVsZW1lbnQuYXR0YWNoKClcblxuICBoYXNDb2xvckJ1ZmZlckZvckVkaXRvcjogKGVkaXRvcikgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgQGRlc3Ryb3llZCBvciBub3QgZWRpdG9yP1xuICAgIEBjb2xvckJ1ZmZlcnNCeUVkaXRvcklkW2VkaXRvci5pZF0/XG5cbiAgY29sb3JCdWZmZXJGb3JFZGl0b3I6IChlZGl0b3IpIC0+XG4gICAgcmV0dXJuIGlmIEBkZXN0cm95ZWRcbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvcj9cblxuICAgIENvbG9yQnVmZmVyID89IHJlcXVpcmUgJy4vY29sb3ItYnVmZmVyJ1xuXG4gICAgaWYgQGNvbG9yQnVmZmVyc0J5RWRpdG9ySWRbZWRpdG9yLmlkXT9cbiAgICAgIHJldHVybiBAY29sb3JCdWZmZXJzQnlFZGl0b3JJZFtlZGl0b3IuaWRdXG5cbiAgICBpZiBAYnVmZmVyU3RhdGVzW2VkaXRvci5pZF0/XG4gICAgICBzdGF0ZSA9IEBidWZmZXJTdGF0ZXNbZWRpdG9yLmlkXVxuICAgICAgc3RhdGUuZWRpdG9yID0gZWRpdG9yXG4gICAgICBzdGF0ZS5wcm9qZWN0ID0gdGhpc1xuICAgICAgZGVsZXRlIEBidWZmZXJTdGF0ZXNbZWRpdG9yLmlkXVxuICAgIGVsc2VcbiAgICAgIHN0YXRlID0ge2VkaXRvciwgcHJvamVjdDogdGhpc31cblxuICAgIEBjb2xvckJ1ZmZlcnNCeUVkaXRvcklkW2VkaXRvci5pZF0gPSBidWZmZXIgPSBuZXcgQ29sb3JCdWZmZXIoc3RhdGUpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgc3Vic2NyaXB0aW9uID0gYnVmZmVyLm9uRGlkRGVzdHJveSA9PlxuICAgICAgQHN1YnNjcmlwdGlvbnMucmVtb3ZlKHN1YnNjcmlwdGlvbilcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgIGRlbGV0ZSBAY29sb3JCdWZmZXJzQnlFZGl0b3JJZFtlZGl0b3IuaWRdXG5cbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtY3JlYXRlLWNvbG9yLWJ1ZmZlcicsIGJ1ZmZlclxuXG4gICAgYnVmZmVyXG5cbiAgY29sb3JCdWZmZXJGb3JQYXRoOiAocGF0aCkgLT5cbiAgICBmb3IgaWQsY29sb3JCdWZmZXIgb2YgQGNvbG9yQnVmZmVyc0J5RWRpdG9ySWRcbiAgICAgIHJldHVybiBjb2xvckJ1ZmZlciBpZiBjb2xvckJ1ZmZlci5lZGl0b3IuZ2V0UGF0aCgpIGlzIHBhdGhcblxuICB1cGRhdGVDb2xvckJ1ZmZlcnM6IC0+XG4gICAgZm9yIGlkLCBidWZmZXIgb2YgQGNvbG9yQnVmZmVyc0J5RWRpdG9ySWRcbiAgICAgIGlmIEBpc0J1ZmZlcklnbm9yZWQoYnVmZmVyLmVkaXRvci5nZXRQYXRoKCkpXG4gICAgICAgIGJ1ZmZlci5kZXN0cm95KClcbiAgICAgICAgZGVsZXRlIEBjb2xvckJ1ZmZlcnNCeUVkaXRvcklkW2lkXVxuXG4gICAgdHJ5XG4gICAgICBpZiBAY29sb3JCdWZmZXJzQnlFZGl0b3JJZD9cbiAgICAgICAgZm9yIGVkaXRvciBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpXG4gICAgICAgICAgY29udGludWUgaWYgQGhhc0NvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcikgb3IgQGlzQnVmZmVySWdub3JlZChlZGl0b3IuZ2V0UGF0aCgpKVxuXG4gICAgICAgICAgYnVmZmVyID0gQGNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgICAgICBpZiBidWZmZXI/XG4gICAgICAgICAgICBidWZmZXJFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGJ1ZmZlcilcbiAgICAgICAgICAgIGJ1ZmZlckVsZW1lbnQuYXR0YWNoKClcblxuICAgIGNhdGNoIGVcbiAgICAgIGNvbnNvbGUubG9nIGVcblxuICBpc0J1ZmZlcklnbm9yZWQ6IChwYXRoKSAtPlxuICAgIG1pbmltYXRjaCA/PSByZXF1aXJlICdtaW5pbWF0Y2gnXG5cbiAgICBwYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemUocGF0aClcbiAgICBzb3VyY2VzID0gQGlnbm9yZWRCdWZmZXJOYW1lcyA/IFtdXG4gICAgcmV0dXJuIHRydWUgZm9yIHNvdXJjZSBpbiBzb3VyY2VzIHdoZW4gbWluaW1hdGNoKHBhdGgsIHNvdXJjZSwgbWF0Y2hCYXNlOiB0cnVlLCBkb3Q6IHRydWUpXG4gICAgZmFsc2VcblxuICAjIyAgICAjIyMjIyMjIyAgICAgIyMjICAgICMjIyMjIyMjICMjICAgICAjIyAgIyMjIyMjXG4gICMjICAgICMjICAgICAjIyAgICMjICMjICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICMjXG4gICMjICAgICMjICAgICAjIyAgIyMgICAjIyAgICAgIyMgICAgIyMgICAgICMjICMjXG4gICMjICAgICMjIyMjIyMjICAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjIyMjICAjIyMjIyNcbiAgIyMgICAgIyMgICAgICAgICMjIyMjIyMjIyAgICAjIyAgICAjIyAgICAgIyMgICAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgICMjICAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgIyNcbiAgIyMgICAgIyMgICAgICAgICMjICAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgICMjIyMjI1xuXG4gIGdldFBhdGhzOiAtPiBAcGF0aHM/LnNsaWNlKClcblxuICBhcHBlbmRQYXRoOiAocGF0aCkgLT4gQHBhdGhzLnB1c2gocGF0aCkgaWYgcGF0aD9cblxuICBoYXNQYXRoOiAocGF0aCkgLT4gcGF0aCBpbiAoQHBhdGhzID8gW10pXG5cbiAgbG9hZFBhdGhzOiAobm9Lbm93blBhdGhzPWZhbHNlKSAtPlxuICAgIFBhdGhzTG9hZGVyID89IHJlcXVpcmUgJy4vcGF0aHMtbG9hZGVyJ1xuXG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIHJvb3RQYXRocyA9IEBnZXRSb290UGF0aHMoKVxuICAgICAga25vd25QYXRocyA9IGlmIG5vS25vd25QYXRocyB0aGVuIFtdIGVsc2UgQHBhdGhzID8gW11cbiAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAga25vd25QYXRoc1xuICAgICAgICBAdGltZXN0YW1wXG4gICAgICAgIGlnbm9yZWROYW1lczogQGdldElnbm9yZWROYW1lcygpXG4gICAgICAgIHBhdGhzOiByb290UGF0aHNcbiAgICAgICAgdHJhdmVyc2VJbnRvU3ltbGlua0RpcmVjdG9yaWVzOiBhdG9tLmNvbmZpZy5nZXQgJ3BpZ21lbnRzLnRyYXZlcnNlSW50b1N5bWxpbmtEaXJlY3RvcmllcydcbiAgICAgICAgc291cmNlTmFtZXM6IEBnZXRTb3VyY2VOYW1lcygpXG4gICAgICAgIGlnbm9yZVZjc0lnbm9yZXM6IGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuaWdub3JlVmNzSWdub3JlZFBhdGhzJylcbiAgICAgIH1cbiAgICAgIFBhdGhzTG9hZGVyLnN0YXJ0VGFzayBjb25maWcsIChyZXN1bHRzKSA9PlxuICAgICAgICBmb3IgcCBpbiBrbm93blBhdGhzXG4gICAgICAgICAgaXNEZXNjZW5kZW50T2ZSb290UGF0aHMgPSByb290UGF0aHMuc29tZSAocm9vdCkgLT5cbiAgICAgICAgICAgIHAuaW5kZXhPZihyb290KSBpcyAwXG5cbiAgICAgICAgICB1bmxlc3MgaXNEZXNjZW5kZW50T2ZSb290UGF0aHNcbiAgICAgICAgICAgIHJlc3VsdHMucmVtb3ZlZCA/PSBbXVxuICAgICAgICAgICAgcmVzdWx0cy5yZW1vdmVkLnB1c2gocClcblxuICAgICAgICByZXNvbHZlKHJlc3VsdHMpXG5cbiAgdXBkYXRlUGF0aHM6IC0+XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpIHVubGVzcyBAaW5pdGlhbGl6ZWRcblxuICAgIEBsb2FkUGF0aHMoKS50aGVuICh7ZGlydGllZCwgcmVtb3ZlZH0pID0+XG4gICAgICBAZGVsZXRlVmFyaWFibGVzRm9yUGF0aHMocmVtb3ZlZClcblxuICAgICAgQHBhdGhzID0gQHBhdGhzLmZpbHRlciAocCkgLT4gcCBub3QgaW4gcmVtb3ZlZFxuICAgICAgQHBhdGhzLnB1c2gocCkgZm9yIHAgaW4gZGlydGllZCB3aGVuIHAgbm90IGluIEBwYXRoc1xuXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtY2hhbmdlLXBhdGhzJywgQGdldFBhdGhzKClcbiAgICAgIEByZWxvYWRWYXJpYWJsZXNGb3JQYXRocyhkaXJ0aWVkKVxuXG4gIGlzVmFyaWFibGVzU291cmNlUGF0aDogKHBhdGgpIC0+XG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBwYXRoXG5cbiAgICBtaW5pbWF0Y2ggPz0gcmVxdWlyZSAnbWluaW1hdGNoJ1xuICAgIHBhdGggPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZShwYXRoKVxuICAgIHNvdXJjZXMgPSBAZ2V0U291cmNlTmFtZXMoKVxuXG4gICAgcmV0dXJuIHRydWUgZm9yIHNvdXJjZSBpbiBzb3VyY2VzIHdoZW4gbWluaW1hdGNoKHBhdGgsIHNvdXJjZSwgbWF0Y2hCYXNlOiB0cnVlLCBkb3Q6IHRydWUpXG5cbiAgaXNJZ25vcmVkUGF0aDogKHBhdGgpIC0+XG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBwYXRoXG5cbiAgICBtaW5pbWF0Y2ggPz0gcmVxdWlyZSAnbWluaW1hdGNoJ1xuICAgIHBhdGggPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZShwYXRoKVxuICAgIGlnbm9yZWROYW1lcyA9IEBnZXRJZ25vcmVkTmFtZXMoKVxuXG4gICAgcmV0dXJuIHRydWUgZm9yIGlnbm9yZSBpbiBpZ25vcmVkTmFtZXMgd2hlbiBtaW5pbWF0Y2gocGF0aCwgaWdub3JlLCBtYXRjaEJhc2U6IHRydWUsIGRvdDogdHJ1ZSlcblxuICBzY29wZUZyb21GaWxlTmFtZTogKHBhdGgpIC0+XG4gICAgc2NvcGVGcm9tRmlsZU5hbWUgPz0gcmVxdWlyZSAnLi9zY29wZS1mcm9tLWZpbGUtbmFtZSdcblxuICAgIHNjb3BlID0gc2NvcGVGcm9tRmlsZU5hbWUocGF0aClcblxuICAgIGlmIHNjb3BlIGlzICdzYXNzJyBvciBzY29wZSBpcyAnc2NzcydcbiAgICAgIHNjb3BlID0gW3Njb3BlLCBAZ2V0U2Fzc1Njb3BlU3VmZml4KCldLmpvaW4oJzonKVxuXG4gICAgc2NvcGVcblxuICAjIyAgICAjIyAgICAgIyMgICAgIyMjICAgICMjIyMjIyMjICAgIyMjIyMjXG4gICMjICAgICMjICAgICAjIyAgICMjICMjICAgIyMgICAgICMjICMjICAgICMjXG4gICMjICAgICMjICAgICAjIyAgIyMgICAjIyAgIyMgICAgICMjICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgICMjICAgIyMgICMjIyMjIyMjIyAjIyAgICMjICAgICAgICAgIyNcbiAgIyMgICAgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICAjIyAgIyMgICAgIyNcbiAgIyMgICAgICAgIyMjICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjIyMjI1xuXG4gIGdldFBhbGV0dGU6IC0+XG4gICAgUGFsZXR0ZSA/PSByZXF1aXJlICcuL3BhbGV0dGUnXG5cbiAgICByZXR1cm4gbmV3IFBhbGV0dGUgdW5sZXNzIEBpc0luaXRpYWxpemVkKClcbiAgICBuZXcgUGFsZXR0ZShAZ2V0Q29sb3JWYXJpYWJsZXMoKSlcblxuICBnZXRDb250ZXh0OiAtPiBAdmFyaWFibGVzLmdldENvbnRleHQoKVxuXG4gIGdldFZhcmlhYmxlczogLT4gQHZhcmlhYmxlcy5nZXRWYXJpYWJsZXMoKVxuXG4gIGdldFZhcmlhYmxlRXhwcmVzc2lvbnNSZWdpc3RyeTogLT4gQHZhcmlhYmxlRXhwcmVzc2lvbnNSZWdpc3RyeVxuXG4gIGdldFZhcmlhYmxlQnlJZDogKGlkKSAtPiBAdmFyaWFibGVzLmdldFZhcmlhYmxlQnlJZChpZClcblxuICBnZXRWYXJpYWJsZUJ5TmFtZTogKG5hbWUpIC0+IEB2YXJpYWJsZXMuZ2V0VmFyaWFibGVCeU5hbWUobmFtZSlcblxuICBnZXRDb2xvclZhcmlhYmxlczogLT4gQHZhcmlhYmxlcy5nZXRDb2xvclZhcmlhYmxlcygpXG5cbiAgZ2V0Q29sb3JFeHByZXNzaW9uc1JlZ2lzdHJ5OiAtPiBAY29sb3JFeHByZXNzaW9uc1JlZ2lzdHJ5XG5cbiAgc2hvd1ZhcmlhYmxlSW5GaWxlOiAodmFyaWFibGUpIC0+XG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbih2YXJpYWJsZS5wYXRoKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICB7RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbScgdW5sZXNzIFJhbmdlP1xuXG4gICAgICBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKClcblxuICAgICAgYnVmZmVyUmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0IFtcbiAgICAgICAgYnVmZmVyLnBvc2l0aW9uRm9yQ2hhcmFjdGVySW5kZXgodmFyaWFibGUucmFuZ2VbMF0pXG4gICAgICAgIGJ1ZmZlci5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KHZhcmlhYmxlLnJhbmdlWzFdKVxuICAgICAgXVxuXG4gICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShidWZmZXJSYW5nZSwgYXV0b3Njcm9sbDogdHJ1ZSlcblxuICBlbWl0VmFyaWFibGVzQ2hhbmdlRXZlbnQ6IChyZXN1bHRzKSAtPlxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC11cGRhdGUtdmFyaWFibGVzJywgcmVzdWx0c1xuXG4gIGxvYWRWYXJpYWJsZXNGb3JQYXRoOiAocGF0aCkgLT4gQGxvYWRWYXJpYWJsZXNGb3JQYXRocyBbcGF0aF1cblxuICBsb2FkVmFyaWFibGVzRm9yUGF0aHM6IChwYXRocykgLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgQHNjYW5QYXRoc0ZvclZhcmlhYmxlcyBwYXRocywgKHJlc3VsdHMpID0+IHJlc29sdmUocmVzdWx0cylcblxuICBnZXRWYXJpYWJsZXNGb3JQYXRoOiAocGF0aCkgLT4gQHZhcmlhYmxlcy5nZXRWYXJpYWJsZXNGb3JQYXRoKHBhdGgpXG5cbiAgZ2V0VmFyaWFibGVzRm9yUGF0aHM6IChwYXRocykgLT4gQHZhcmlhYmxlcy5nZXRWYXJpYWJsZXNGb3JQYXRocyhwYXRocylcblxuICBkZWxldGVWYXJpYWJsZXNGb3JQYXRoOiAocGF0aCkgLT4gQGRlbGV0ZVZhcmlhYmxlc0ZvclBhdGhzIFtwYXRoXVxuXG4gIGRlbGV0ZVZhcmlhYmxlc0ZvclBhdGhzOiAocGF0aHMpIC0+XG4gICAgQHZhcmlhYmxlcy5kZWxldGVWYXJpYWJsZXNGb3JQYXRocyhwYXRocylcblxuICByZWxvYWRWYXJpYWJsZXNGb3JQYXRoOiAocGF0aCkgLT4gQHJlbG9hZFZhcmlhYmxlc0ZvclBhdGhzIFtwYXRoXVxuXG4gIHJlbG9hZFZhcmlhYmxlc0ZvclBhdGhzOiAocGF0aHMpIC0+XG4gICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpXG4gICAgcHJvbWlzZSA9IEBpbml0aWFsaXplKCkgdW5sZXNzIEBpc0luaXRpYWxpemVkKClcblxuICAgIHByb21pc2VcbiAgICAudGhlbiA9PlxuICAgICAgaWYgcGF0aHMuc29tZSgocGF0aCkgPT4gcGF0aCBub3QgaW4gQHBhdGhzKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKVxuXG4gICAgICBAbG9hZFZhcmlhYmxlc0ZvclBhdGhzKHBhdGhzKVxuICAgIC50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgQHZhcmlhYmxlcy51cGRhdGVDb2xsZWN0aW9uKHJlc3VsdHMsIHBhdGhzKVxuXG4gIHNjYW5QYXRoc0ZvclZhcmlhYmxlczogKHBhdGhzLCBjYWxsYmFjaykgLT5cbiAgICBpZiBwYXRocy5sZW5ndGggaXMgMSBhbmQgY29sb3JCdWZmZXIgPSBAY29sb3JCdWZmZXJGb3JQYXRoKHBhdGhzWzBdKVxuICAgICAgY29sb3JCdWZmZXIuc2NhbkJ1ZmZlckZvclZhcmlhYmxlcygpLnRoZW4gKHJlc3VsdHMpIC0+IGNhbGxiYWNrKHJlc3VsdHMpXG4gICAgZWxzZVxuICAgICAgUGF0aHNTY2FubmVyID89IHJlcXVpcmUgJy4vcGF0aHMtc2Nhbm5lcidcblxuICAgICAgUGF0aHNTY2FubmVyLnN0YXJ0VGFzayBwYXRocy5tYXAoKHApID0+IFtwLCBAc2NvcGVGcm9tRmlsZU5hbWUocCldKSwgQHZhcmlhYmxlRXhwcmVzc2lvbnNSZWdpc3RyeSwgKHJlc3VsdHMpIC0+IGNhbGxiYWNrKHJlc3VsdHMpXG5cbiAgbG9hZFRoZW1lc1ZhcmlhYmxlczogLT5cbiAgICB7VEhFTUVfVkFSSUFCTEVTfSA9IHJlcXVpcmUgJy4vdXJpcycgdW5sZXNzIFRIRU1FX1ZBUklBQkxFUz9cbiAgICBBVE9NX1ZBUklBQkxFUyA/PSByZXF1aXJlICcuL2F0b20tdmFyaWFibGVzJ1xuXG4gICAgaXRlcmF0b3IgPSAwXG4gICAgdmFyaWFibGVzID0gW11cbiAgICBodG1sID0gJydcbiAgICBBVE9NX1ZBUklBQkxFUy5mb3JFYWNoICh2KSAtPiBodG1sICs9IFwiPGRpdiBjbGFzcz0nI3t2fSc+I3t2fTwvZGl2PlwiXG5cbiAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRpdi5jbGFzc05hbWUgPSAncGlnbWVudHMtc2FtcGxlcidcbiAgICBkaXYuaW5uZXJIVE1MID0gaHRtbFxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KVxuXG4gICAgQVRPTV9WQVJJQUJMRVMuZm9yRWFjaCAodixpKSAtPlxuICAgICAgbm9kZSA9IGRpdi5jaGlsZHJlbltpXVxuICAgICAgY29sb3IgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpLmNvbG9yXG4gICAgICBlbmQgPSBpdGVyYXRvciArIHYubGVuZ3RoICsgY29sb3IubGVuZ3RoICsgNFxuXG4gICAgICB2YXJpYWJsZSA9XG4gICAgICAgIG5hbWU6IFwiQCN7dn1cIlxuICAgICAgICBsaW5lOiBpXG4gICAgICAgIHZhbHVlOiBjb2xvclxuICAgICAgICByYW5nZTogW2l0ZXJhdG9yLGVuZF1cbiAgICAgICAgcGF0aDogVEhFTUVfVkFSSUFCTEVTXG5cbiAgICAgIGl0ZXJhdG9yID0gZW5kXG4gICAgICB2YXJpYWJsZXMucHVzaCh2YXJpYWJsZSlcblxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZGl2KVxuICAgIHJldHVybiB2YXJpYWJsZXNcblxuICAjIyAgICAgIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjIyAjIyMjIyMjIyAjIyMjICMjICAgICMjICAjIyMjIyMgICAgIyMjIyMjXG4gICMjICAgICMjICAgICMjICMjICAgICAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMjICAgIyMgIyMgICAgIyMgICMjICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMjIyAgIyMgIyMgICAgICAgICMjXG4gICMjICAgICAjIyMjIyMgICMjIyMjIyAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMgIyMgIyMgIyMgICAjIyMjICAjIyMjIyNcbiAgIyMgICAgICAgICAgIyMgIyMgICAgICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAgIyMjIyAjIyAgICAjIyAgICAgICAgIyNcbiAgIyMgICAgIyMgICAgIyMgIyMgICAgICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAgICMjIyAjIyAgICAjIyAgIyMgICAgIyNcbiAgIyMgICAgICMjIyMjIyAgIyMjIyMjIyMgICAgIyMgICAgICAgIyMgICAgIyMjIyAjIyAgICAjIyAgIyMjIyMjICAgICMjIyMjI1xuXG4gIGdldFJvb3RQYXRoczogLT4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcblxuICBnZXRTYXNzU2NvcGVTdWZmaXg6IC0+XG4gICAgQHNhc3NTaGFkZUFuZFRpbnRJbXBsZW1lbnRhdGlvbiA/IGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuc2Fzc1NoYWRlQW5kVGludEltcGxlbWVudGF0aW9uJykgPyAnY29tcGFzcydcblxuICBzZXRTYXNzU2hhZGVBbmRUaW50SW1wbGVtZW50YXRpb246IChAc2Fzc1NoYWRlQW5kVGludEltcGxlbWVudGF0aW9uKSAtPlxuICAgIEBjb2xvckV4cHJlc3Npb25zUmVnaXN0cnkuZW1pdHRlci5lbWl0ICdkaWQtdXBkYXRlLWV4cHJlc3Npb25zJywge1xuICAgICAgcmVnaXN0cnk6IEBjb2xvckV4cHJlc3Npb25zUmVnaXN0cnlcbiAgICB9XG5cbiAgZ2V0U291cmNlTmFtZXM6IC0+XG4gICAgbmFtZXMgPSBbJy5waWdtZW50cyddXG4gICAgbmFtZXMgPSBuYW1lcy5jb25jYXQoQHNvdXJjZU5hbWVzID8gW10pXG4gICAgdW5sZXNzIEBpZ25vcmVHbG9iYWxTb3VyY2VOYW1lc1xuICAgICAgbmFtZXMgPSBuYW1lcy5jb25jYXQoYXRvbS5jb25maWcuZ2V0KCdwaWdtZW50cy5zb3VyY2VOYW1lcycpID8gW10pXG4gICAgbmFtZXNcblxuICBzZXRTb3VyY2VOYW1lczogKEBzb3VyY2VOYW1lcz1bXSkgLT5cbiAgICByZXR1cm4gaWYgbm90IEBpbml0aWFsaXplZD8gYW5kIG5vdCBAaW5pdGlhbGl6ZVByb21pc2U/XG5cbiAgICBAaW5pdGlhbGl6ZSgpLnRoZW4gPT4gQGxvYWRQYXRoc0FuZFZhcmlhYmxlcyh0cnVlKVxuXG4gIHNldElnbm9yZUdsb2JhbFNvdXJjZU5hbWVzOiAoQGlnbm9yZUdsb2JhbFNvdXJjZU5hbWVzKSAtPlxuICAgIEB1cGRhdGVQYXRocygpXG5cbiAgZ2V0U2VhcmNoTmFtZXM6IC0+XG4gICAgbmFtZXMgPSBbXVxuICAgIG5hbWVzID0gbmFtZXMuY29uY2F0KEBzb3VyY2VOYW1lcyA/IFtdKVxuICAgIG5hbWVzID0gbmFtZXMuY29uY2F0KEBzZWFyY2hOYW1lcyA/IFtdKVxuICAgIHVubGVzcyBAaWdub3JlR2xvYmFsU2VhcmNoTmFtZXNcbiAgICAgIG5hbWVzID0gbmFtZXMuY29uY2F0KGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuc291cmNlTmFtZXMnKSA/IFtdKVxuICAgICAgbmFtZXMgPSBuYW1lcy5jb25jYXQoYXRvbS5jb25maWcuZ2V0KCdwaWdtZW50cy5leHRlbmRlZFNlYXJjaE5hbWVzJykgPyBbXSlcbiAgICBuYW1lc1xuXG4gIHNldFNlYXJjaE5hbWVzOiAoQHNlYXJjaE5hbWVzPVtdKSAtPlxuXG4gIHNldElnbm9yZUdsb2JhbFNlYXJjaE5hbWVzOiAoQGlnbm9yZUdsb2JhbFNlYXJjaE5hbWVzKSAtPlxuXG4gIGdldElnbm9yZWROYW1lczogLT5cbiAgICBuYW1lcyA9IEBpZ25vcmVkTmFtZXMgPyBbXVxuICAgIHVubGVzcyBAaWdub3JlR2xvYmFsSWdub3JlZE5hbWVzXG4gICAgICBuYW1lcyA9IG5hbWVzLmNvbmNhdChAZ2V0R2xvYmFsSWdub3JlZE5hbWVzKCkgPyBbXSlcbiAgICAgIG5hbWVzID0gbmFtZXMuY29uY2F0KGF0b20uY29uZmlnLmdldCgnY29yZS5pZ25vcmVkTmFtZXMnKSA/IFtdKVxuICAgIG5hbWVzXG5cbiAgZ2V0R2xvYmFsSWdub3JlZE5hbWVzOiAtPlxuICAgIGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuaWdub3JlZE5hbWVzJyk/Lm1hcCAocCkgLT5cbiAgICAgIGlmIC9cXC9cXCokLy50ZXN0KHApIHRoZW4gcCArICcqJyBlbHNlIHBcblxuICBzZXRJZ25vcmVkTmFtZXM6IChAaWdub3JlZE5hbWVzPVtdKSAtPlxuICAgIGlmIG5vdCBAaW5pdGlhbGl6ZWQ/IGFuZCBub3QgQGluaXRpYWxpemVQcm9taXNlP1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdQcm9qZWN0IGlzIG5vdCBpbml0aWFsaXplZCB5ZXQnKVxuXG4gICAgQGluaXRpYWxpemUoKS50aGVuID0+XG4gICAgICBkaXJ0aWVkID0gQHBhdGhzLmZpbHRlciAocCkgPT4gQGlzSWdub3JlZFBhdGgocClcbiAgICAgIEBkZWxldGVWYXJpYWJsZXNGb3JQYXRocyhkaXJ0aWVkKVxuXG4gICAgICBAcGF0aHMgPSBAcGF0aHMuZmlsdGVyIChwKSA9PiAhQGlzSWdub3JlZFBhdGgocClcbiAgICAgIEBsb2FkUGF0aHNBbmRWYXJpYWJsZXModHJ1ZSlcblxuICBzZXRJZ25vcmVHbG9iYWxJZ25vcmVkTmFtZXM6IChAaWdub3JlR2xvYmFsSWdub3JlZE5hbWVzKSAtPlxuICAgIEB1cGRhdGVQYXRocygpXG5cbiAgZ2V0SWdub3JlZFNjb3BlczogLT5cbiAgICBzY29wZXMgPSBAaWdub3JlZFNjb3BlcyA/IFtdXG4gICAgdW5sZXNzIEBpZ25vcmVHbG9iYWxJZ25vcmVkU2NvcGVzXG4gICAgICBzY29wZXMgPSBzY29wZXMuY29uY2F0KGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuaWdub3JlZFNjb3BlcycpID8gW10pXG5cbiAgICBzY29wZXMgPSBzY29wZXMuY29uY2F0KEBpZ25vcmVkRmlsZXR5cGVzKVxuICAgIHNjb3Blc1xuXG4gIHNldElnbm9yZWRTY29wZXM6IChAaWdub3JlZFNjb3Blcz1bXSkgLT5cbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWlnbm9yZWQtc2NvcGVzJywgQGdldElnbm9yZWRTY29wZXMoKSlcblxuICBzZXRJZ25vcmVHbG9iYWxJZ25vcmVkU2NvcGVzOiAoQGlnbm9yZUdsb2JhbElnbm9yZWRTY29wZXMpIC0+XG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1pZ25vcmVkLXNjb3BlcycsIEBnZXRJZ25vcmVkU2NvcGVzKCkpXG5cbiAgc2V0U3VwcG9ydGVkRmlsZXR5cGVzOiAoQHN1cHBvcnRlZEZpbGV0eXBlcz1bXSkgLT5cbiAgICBAdXBkYXRlSWdub3JlZEZpbGV0eXBlcygpXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1pZ25vcmVkLXNjb3BlcycsIEBnZXRJZ25vcmVkU2NvcGVzKCkpXG5cbiAgdXBkYXRlSWdub3JlZEZpbGV0eXBlczogLT5cbiAgICBAaWdub3JlZEZpbGV0eXBlcyA9IEBnZXRJZ25vcmVkRmlsZXR5cGVzKClcblxuICBnZXRJZ25vcmVkRmlsZXR5cGVzOiAtPlxuICAgIGZpbGV0eXBlcyA9IEBzdXBwb3J0ZWRGaWxldHlwZXMgPyBbXVxuXG4gICAgdW5sZXNzIEBpZ25vcmVHbG9iYWxTdXBwb3J0ZWRGaWxldHlwZXNcbiAgICAgIGZpbGV0eXBlcyA9IGZpbGV0eXBlcy5jb25jYXQoYXRvbS5jb25maWcuZ2V0KCdwaWdtZW50cy5zdXBwb3J0ZWRGaWxldHlwZXMnKSA/IFtdKVxuXG4gICAgZmlsZXR5cGVzID0gWycqJ10gaWYgZmlsZXR5cGVzLmxlbmd0aCBpcyAwXG5cbiAgICByZXR1cm4gW10gaWYgZmlsZXR5cGVzLnNvbWUgKHR5cGUpIC0+IHR5cGUgaXMgJyonXG5cbiAgICBzY29wZXMgPSBmaWxldHlwZXMubWFwIChleHQpIC0+XG4gICAgICBhdG9tLmdyYW1tYXJzLnNlbGVjdEdyYW1tYXIoXCJmaWxlLiN7ZXh0fVwiKT8uc2NvcGVOYW1lLnJlcGxhY2UoL1xcLi9nLCAnXFxcXC4nKVxuICAgIC5maWx0ZXIgKHNjb3BlKSAtPiBzY29wZT9cblxuICAgIFtcIl4oPyFcXFxcLigje3Njb3Blcy5qb2luKCd8Jyl9KSlcIl1cblxuICBzZXRJZ25vcmVHbG9iYWxTdXBwb3J0ZWRGaWxldHlwZXM6IChAaWdub3JlR2xvYmFsU3VwcG9ydGVkRmlsZXR5cGVzKSAtPlxuICAgIEB1cGRhdGVJZ25vcmVkRmlsZXR5cGVzKClcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWlnbm9yZWQtc2NvcGVzJywgQGdldElnbm9yZWRTY29wZXMoKSlcblxuICB0aGVtZXNJbmNsdWRlZDogLT4gQGluY2x1ZGVUaGVtZXNcblxuICBzZXRJbmNsdWRlVGhlbWVzOiAoaW5jbHVkZVRoZW1lcykgLT5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkgaWYgaW5jbHVkZVRoZW1lcyBpcyBAaW5jbHVkZVRoZW1lc1xuXG4gICAgQGluY2x1ZGVUaGVtZXMgPSBpbmNsdWRlVGhlbWVzXG4gICAgaWYgQGluY2x1ZGVUaGVtZXNcbiAgICAgIEBpbmNsdWRlVGhlbWVzVmFyaWFibGVzKClcbiAgICBlbHNlXG4gICAgICBAZGlzcG9zZVRoZW1lc1ZhcmlhYmxlcygpXG5cbiAgaW5jbHVkZVRoZW1lc1ZhcmlhYmxlczogLT5cbiAgICBAdGhlbWVzU3Vic2NyaXB0aW9uID0gYXRvbS50aGVtZXMub25EaWRDaGFuZ2VBY3RpdmVUaGVtZXMgPT5cbiAgICAgIHJldHVybiB1bmxlc3MgQGluY2x1ZGVUaGVtZXNcblxuICAgICAge1RIRU1FX1ZBUklBQkxFU30gPSByZXF1aXJlICcuL3VyaXMnIHVubGVzcyBUSEVNRV9WQVJJQUJMRVM/XG5cbiAgICAgIHZhcmlhYmxlcyA9IEBsb2FkVGhlbWVzVmFyaWFibGVzKClcbiAgICAgIEB2YXJpYWJsZXMudXBkYXRlUGF0aENvbGxlY3Rpb24oVEhFTUVfVkFSSUFCTEVTLCB2YXJpYWJsZXMpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHRoZW1lc1N1YnNjcmlwdGlvblxuICAgIEB2YXJpYWJsZXMuYWRkTWFueShAbG9hZFRoZW1lc1ZhcmlhYmxlcygpKVxuXG4gIGRpc3Bvc2VUaGVtZXNWYXJpYWJsZXM6IC0+XG4gICAge1RIRU1FX1ZBUklBQkxFU30gPSByZXF1aXJlICcuL3VyaXMnIHVubGVzcyBUSEVNRV9WQVJJQUJMRVM/XG5cbiAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUgQHRoZW1lc1N1YnNjcmlwdGlvblxuICAgIEB2YXJpYWJsZXMuZGVsZXRlVmFyaWFibGVzRm9yUGF0aHMoW1RIRU1FX1ZBUklBQkxFU10pXG4gICAgQHRoZW1lc1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcblxuICBnZXRUaW1lc3RhbXA6IC0+IG5ldyBEYXRlKClcblxuICBzZXJpYWxpemU6IC0+XG4gICAgdW5sZXNzIFNFUklBTElaRV9WRVJTSU9OP1xuICAgICAge1NFUklBTElaRV9WRVJTSU9OLCBTRVJJQUxJWkVfTUFSS0VSU19WRVJTSU9OfSA9IHJlcXVpcmUgJy4vdmVyc2lvbnMnXG5cbiAgICBkYXRhID1cbiAgICAgIGRlc2VyaWFsaXplcjogJ0NvbG9yUHJvamVjdCdcbiAgICAgIHRpbWVzdGFtcDogQGdldFRpbWVzdGFtcCgpXG4gICAgICB2ZXJzaW9uOiBTRVJJQUxJWkVfVkVSU0lPTlxuICAgICAgbWFya2Vyc1ZlcnNpb246IFNFUklBTElaRV9NQVJLRVJTX1ZFUlNJT05cbiAgICAgIGdsb2JhbFNvdXJjZU5hbWVzOiBhdG9tLmNvbmZpZy5nZXQoJ3BpZ21lbnRzLnNvdXJjZU5hbWVzJylcbiAgICAgIGdsb2JhbElnbm9yZWROYW1lczogYXRvbS5jb25maWcuZ2V0KCdwaWdtZW50cy5pZ25vcmVkTmFtZXMnKVxuXG4gICAgaWYgQGlnbm9yZUdsb2JhbFNvdXJjZU5hbWVzP1xuICAgICAgZGF0YS5pZ25vcmVHbG9iYWxTb3VyY2VOYW1lcyA9IEBpZ25vcmVHbG9iYWxTb3VyY2VOYW1lc1xuICAgIGlmIEBpZ25vcmVHbG9iYWxTZWFyY2hOYW1lcz9cbiAgICAgIGRhdGEuaWdub3JlR2xvYmFsU2VhcmNoTmFtZXMgPSBAaWdub3JlR2xvYmFsU2VhcmNoTmFtZXNcbiAgICBpZiBAaWdub3JlR2xvYmFsSWdub3JlZE5hbWVzP1xuICAgICAgZGF0YS5pZ25vcmVHbG9iYWxJZ25vcmVkTmFtZXMgPSBAaWdub3JlR2xvYmFsSWdub3JlZE5hbWVzXG4gICAgaWYgQGlnbm9yZUdsb2JhbElnbm9yZWRTY29wZXM/XG4gICAgICBkYXRhLmlnbm9yZUdsb2JhbElnbm9yZWRTY29wZXMgPSBAaWdub3JlR2xvYmFsSWdub3JlZFNjb3Blc1xuICAgIGlmIEBpbmNsdWRlVGhlbWVzP1xuICAgICAgZGF0YS5pbmNsdWRlVGhlbWVzID0gQGluY2x1ZGVUaGVtZXNcbiAgICBpZiBAaWdub3JlZFNjb3Blcz9cbiAgICAgIGRhdGEuaWdub3JlZFNjb3BlcyA9IEBpZ25vcmVkU2NvcGVzXG4gICAgaWYgQGlnbm9yZWROYW1lcz9cbiAgICAgIGRhdGEuaWdub3JlZE5hbWVzID0gQGlnbm9yZWROYW1lc1xuICAgIGlmIEBzb3VyY2VOYW1lcz9cbiAgICAgIGRhdGEuc291cmNlTmFtZXMgPSBAc291cmNlTmFtZXNcbiAgICBpZiBAc2VhcmNoTmFtZXM/XG4gICAgICBkYXRhLnNlYXJjaE5hbWVzID0gQHNlYXJjaE5hbWVzXG5cbiAgICBkYXRhLmJ1ZmZlcnMgPSBAc2VyaWFsaXplQnVmZmVycygpXG5cbiAgICBpZiBAaXNJbml0aWFsaXplZCgpXG4gICAgICBkYXRhLnBhdGhzID0gQHBhdGhzXG4gICAgICBkYXRhLnZhcmlhYmxlcyA9IEB2YXJpYWJsZXMuc2VyaWFsaXplKClcblxuICAgIGRhdGFcblxuICBzZXJpYWxpemVCdWZmZXJzOiAtPlxuICAgIG91dCA9IHt9XG4gICAgZm9yIGlkLGNvbG9yQnVmZmVyIG9mIEBjb2xvckJ1ZmZlcnNCeUVkaXRvcklkXG4gICAgICBvdXRbaWRdID0gY29sb3JCdWZmZXIuc2VyaWFsaXplKClcbiAgICBvdXRcbiJdfQ==
