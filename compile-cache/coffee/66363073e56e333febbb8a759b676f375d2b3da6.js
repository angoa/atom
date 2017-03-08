(function() {
  var CompositeDisposable, PrettyJSON, formatter,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CompositeDisposable = require('atom').CompositeDisposable;

  formatter = {};

  formatter.space = function(scope) {
    var softTabs, tabLength;
    softTabs = [
      atom.config.get('editor.softTabs', {
        scope: scope
      })
    ];
    tabLength = Number([
      atom.config.get('editor.tabLength', {
        scope: scope
      })
    ]);
    if (softTabs != null) {
      return Array(tabLength + 1).join(' ');
    } else {
      return '\t';
    }
  };

  formatter.stringify = function(obj, options) {
    var BigNumber, JSONbig, scope, sorted, space, stringify;
    scope = (options != null ? options.scope : void 0) != null ? options.scope : null;
    sorted = (options != null ? options.sorted : void 0) != null ? options.sorted : false;
    JSONbig = require('json-bigint');
    stringify = require('json-stable-stringify');
    BigNumber = require('bignumber.js');
    space = formatter.space(scope);
    if (sorted) {
      return stringify(obj, {
        space: space,
        replacer: function(key, value) {
          try {
            if (value.constructor.name === 'BigNumber') {
              return JSONbig.stringify(value);
            }
          } catch (error1) {

          }
          return value;
        }
      });
    } else {
      return JSONbig.stringify(obj, null, space);
    }
  };

  formatter.parseAndValidate = function(text) {
    var JSONbig, error;
    JSONbig = require('json-bigint');
    try {
      return JSONbig.parse(text);
    } catch (error1) {
      error = error1;
      if (atom.config.get('pretty-json.notifyOnParseError')) {
        atom.notifications.addWarning("JSON Pretty: " + error.name + ": " + error.message + " at character " + error.at + " near \"" + error.text + "\"");
      }
      throw error;
    }
  };

  formatter.pretty = function(text, options) {
    var error, parsed;
    try {
      parsed = formatter.parseAndValidate(text);
    } catch (error1) {
      error = error1;
      return text;
    }
    return formatter.stringify(parsed, options);
  };

  formatter.minify = function(text) {
    var error, uglify;
    try {
      formatter.parseAndValidate(text);
    } catch (error1) {
      error = error1;
      return text;
    }
    uglify = require('jsonminify');
    return uglify(text);
  };

  formatter.jsonify = function(text, options) {
    var error, vm;
    vm = require('vm');
    try {
      vm.runInThisContext("newObject = " + text + ";");
    } catch (error1) {
      error = error1;
      if (atom.config.get('pretty-json.notifyOnParseError')) {
        atom.notifications.addWarning("JSON Pretty: eval issue: " + error);
      }
      return text;
    }
    return formatter.stringify(newObject, options);
  };

  PrettyJSON = {
    config: {
      notifyOnParseError: {
        type: 'boolean',
        "default": true
      },
      prettifyOnSaveJSON: {
        type: 'boolean',
        "default": false,
        title: 'Prettify On Save JSON'
      },
      grammars: {
        type: 'array',
        "default": ['source.json', 'text.plain.null-grammar']
      }
    },
    doEntireFile: function(editor) {
      var grammars, ref;
      grammars = atom.config.get('pretty-json.grammars' != null ? 'pretty-json.grammars' : []);
      if (ref = editor != null ? editor.getGrammar().scopeName : void 0, indexOf.call(grammars, ref) < 0) {
        return false;
      }
      return editor.getLastSelection().isEmpty();
    },
    replaceText: function(editor, fn) {
      return editor.mutateSelectedText(function(selection) {
        var range, text;
        selection.getBufferRange();
        text = selection.getText();
        selection.deleteSelectedText();
        range = selection.insertText(fn(text));
        return selection.setBufferRange(range);
      });
    },
    prettify: function(editor, options) {
      var entire, pos, selected, sorted;
      entire = (options != null ? options.entire : void 0) != null ? options.entire : this.doEntireFile(editor);
      sorted = (options != null ? options.sorted : void 0) != null ? options.sorted : false;
      selected = (options != null ? options.selected : void 0) != null ? options.selected : true;
      if (entire) {
        pos = editor.getCursorScreenPosition();
        editor.setText(formatter.pretty(editor.getText(), {
          scope: editor.getRootScopeDescriptor(),
          sorted: sorted
        }));
      } else {
        pos = editor.getLastSelection().getScreenRange().start;
        this.replaceText(editor, function(text) {
          return formatter.pretty(text, {
            scope: ['source.json'],
            sorted: sorted
          });
        });
      }
      if (!selected) {
        return editor.setCursorScreenPosition(pos);
      }
    },
    minify: function(editor, options) {
      var entire, pos, selected;
      entire = (options != null ? options.entire : void 0) != null ? options.entire : this.doEntireFile(editor);
      selected = (options != null ? options.selected : void 0) != null ? options.selected : true;
      if (entire) {
        pos = [0, 0];
        editor.setText(formatter.minify(editor.getText()));
      } else {
        pos = editor.getLastSelection().getScreenRange().start;
        this.replaceText(editor, function(text) {
          return formatter.minify(text);
        });
      }
      if (!selected) {
        return editor.setCursorScreenPosition(pos);
      }
    },
    jsonify: function(editor, options) {
      var entire, pos, selected, sorted;
      entire = (options != null ? options.entire : void 0) != null ? options.entire : this.doEntireFile(editor);
      sorted = (options != null ? options.sorted : void 0) != null ? options.sorted : false;
      selected = (options != null ? options.selected : void 0) != null ? options.selected : true;
      if (entire) {
        pos = editor.getCursorScreenPosition();
        editor.setText(formatter.jsonify(editor.getText(), {
          scope: editor.getRootScopeDescriptor(),
          sorted: sorted
        }));
      } else {
        pos = editor.getLastSelection().getScreenRange().start;
        this.replaceText(editor, function(text) {
          return formatter.jsonify(text, {
            scope: ['source.json'],
            sorted: sorted
          });
        });
      }
      if (!selected) {
        return editor.setCursorScreenPosition(pos);
      }
    },
    activate: function() {
      atom.commands.add('atom-workspace', {
        'pretty-json:prettify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.prettify(editor, {
              entire: _this.doEntireFile(editor),
              sorted: false,
              selected: true
            });
          };
        })(this),
        'pretty-json:minify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.minify(editor, {
              entire: _this.doEntireFile(editor),
              selected: true
            });
          };
        })(this),
        'pretty-json:sort-and-prettify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.prettify(editor, {
              entire: _this.doEntireFile(editor),
              sorted: true,
              selected: true
            });
          };
        })(this),
        'pretty-json:jsonify-literal-and-prettify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.jsonify(editor, {
              entire: _this.doEntireFile(editor),
              sorted: false,
              selected: true
            });
          };
        })(this),
        'pretty-json:jsonify-literal-and-sort-and-prettify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.jsonify(editor, {
              entire: _this.doEntireFile(editor),
              sorted: true,
              selected: true
            });
          };
        })(this)
      });
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.config.observe('pretty-json.prettifyOnSaveJSON', (function(_this) {
        return function(value) {
          var ref;
          if ((ref = _this.saveSubscriptions) != null) {
            ref.dispose();
          }
          _this.saveSubscriptions = new CompositeDisposable();
          if (value) {
            return _this.subscribeToSaveEvents();
          }
        };
      })(this)));
    },
    subscribeToSaveEvents: function() {
      return this.saveSubscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var bufferSubscriptions;
          if (!(editor != null ? editor.getBuffer() : void 0)) {
            return;
          }
          bufferSubscriptions = new CompositeDisposable();
          bufferSubscriptions.add(editor.getBuffer().onWillSave(function(filePath) {
            if (_this.doEntireFile(editor)) {
              return _this.prettify(editor, {
                entire: true,
                sorted: false,
                selected: false
              });
            }
          }));
          bufferSubscriptions.add(editor.getBuffer().onDidDestroy(function() {
            return bufferSubscriptions.dispose();
          }));
          return _this.saveSubscriptions.add(bufferSubscriptions);
        };
      })(this)));
    },
    deactivate: function() {
      var ref;
      if ((ref = this.subscriptions) != null) {
        ref.dispose();
      }
      return this.subscriptions = null;
    }
  };

  module.exports = PrettyJSON;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3ByZXR0eS1qc29uL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMENBQUE7SUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLFNBQUEsR0FBWTs7RUFFWixTQUFTLENBQUMsS0FBVixHQUFrQixTQUFDLEtBQUQ7QUFDaEIsUUFBQTtJQUFBLFFBQUEsR0FBVztNQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQkFBaEIsRUFBbUM7UUFBQSxLQUFBLEVBQU8sS0FBUDtPQUFuQyxDQUFEOztJQUNYLFNBQUEsR0FBWSxNQUFBLENBQU87TUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0JBQWhCLEVBQW9DO1FBQUEsS0FBQSxFQUFPLEtBQVA7T0FBcEMsQ0FBRDtLQUFQO0lBQ1osSUFBRyxnQkFBSDtBQUNFLGFBQU8sS0FBQSxDQUFNLFNBQUEsR0FBWSxDQUFsQixDQUFvQixDQUFDLElBQXJCLENBQTBCLEdBQTFCLEVBRFQ7S0FBQSxNQUFBO0FBR0UsYUFBTyxLQUhUOztFQUhnQjs7RUFRbEIsU0FBUyxDQUFDLFNBQVYsR0FBc0IsU0FBQyxHQUFELEVBQU0sT0FBTjtBQUNwQixRQUFBO0lBQUEsS0FBQSxHQUFXLGtEQUFILEdBQXdCLE9BQU8sQ0FBQyxLQUFoQyxHQUEyQztJQUNuRCxNQUFBLEdBQVksbURBQUgsR0FBeUIsT0FBTyxDQUFDLE1BQWpDLEdBQTZDO0lBR3RELE9BQUEsR0FBVSxPQUFBLENBQVEsYUFBUjtJQUNWLFNBQUEsR0FBWSxPQUFBLENBQVEsdUJBQVI7SUFDWixTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVI7SUFFWixLQUFBLEdBQVEsU0FBUyxDQUFDLEtBQVYsQ0FBZ0IsS0FBaEI7SUFDUixJQUFHLE1BQUg7QUFDRSxhQUFPLFNBQUEsQ0FBVSxH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QSxZQUFELENBQWMsTUFBZCxDQUFIO3FCQUNFLEtBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUNFO2dCQUFBLE1BQUEsRUFBUSxJQUFSO2dCQUNBLE1BQUEsRUFBUSxLQURSO2dCQUVBLFFBQUEsRUFBVSxLQUZWO2VBREYsRUFERjs7VUFEb0QsQ0FBOUIsQ0FBeEI7VUFNQSxtQkFBbUIsQ0FBQyxHQUFwQixDQUF3QixNQUFNLENBQUMsU0FBUCxDQUFBLENBQWtCLENBQUMsWUFBbkIsQ0FBZ0MsU0FBQTttQkFDdEQsbUJBQW1CLENBQUMsT0FBcEIsQ0FBQTtVQURzRCxDQUFoQyxDQUF4QjtpQkFFQSxLQUFDLENBQUEsaUJBQWlCLENBQUMsR0FBbkIsQ0FBdUIsbUJBQXZCO1FBWHVEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUF2QjtJQURxQixDQS9HdkI7SUE2SEEsVUFBQSxFQUFZLFNBQUE7QUFDVixVQUFBOztXQUFjLENBQUUsT0FBaEIsQ0FBQTs7YUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUZQLENBN0haOzs7RUFpSUYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF0TWpCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbmZvcm1hdHRlciA9IHt9XG5cbmZvcm1hdHRlci5zcGFjZSA9IChzY29wZSkgLT5cbiAgc29mdFRhYnMgPSBbYXRvbS5jb25maWcuZ2V0ICdlZGl0b3Iuc29mdFRhYnMnLCBzY29wZTogc2NvcGVdXG4gIHRhYkxlbmd0aCA9IE51bWJlciBbYXRvbS5jb25maWcuZ2V0ICdlZGl0b3IudGFiTGVuZ3RoJywgc2NvcGU6IHNjb3BlXVxuICBpZiBzb2Z0VGFicz9cbiAgICByZXR1cm4gQXJyYXkodGFiTGVuZ3RoICsgMSkuam9pbiAnICdcbiAgZWxzZVxuICAgIHJldHVybiAnXFx0J1xuXG5mb3JtYXR0ZXIuc3RyaW5naWZ5ID0gKG9iaiwgb3B0aW9ucykgLT5cbiAgc2NvcGUgPSBpZiBvcHRpb25zPy5zY29wZT8gdGhlbiBvcHRpb25zLnNjb3BlIGVsc2UgbnVsbFxuICBzb3J0ZWQgPSBpZiBvcHRpb25zPy5zb3J0ZWQ/IHRoZW4gb3B0aW9ucy5zb3J0ZWQgZWxzZSBmYWxzZVxuXG4gICMgbGF6eSBsb2FkIHJlcXVpcmVtZW50c1xuICBKU09OYmlnID0gcmVxdWlyZSAnanNvbi1iaWdpbnQnXG4gIHN0cmluZ2lmeSA9IHJlcXVpcmUgJ2pzb24tc3RhYmxlLXN0cmluZ2lmeSdcbiAgQmlnTnVtYmVyID0gcmVxdWlyZSAnYmlnbnVtYmVyLmpzJ1xuXG4gIHNwYWNlID0gZm9ybWF0dGVyLnNwYWNlIHNjb3BlXG4gIGlmIHNvcnRlZFxuICAgIHJldHVybiBzdHJpbmdpZnkgb2JqLFxuICAgICAgc3BhY2U6IHNwYWNlXG4gICAgICByZXBsYWNlcjogKGtleSwgdmFsdWUpIC0+XG4gICAgICAgIHRyeVxuICAgICAgICAgIGlmIHZhbHVlLmNvbnN0cnVjdG9yLm5hbWUgaXMgJ0JpZ051bWJlcidcbiAgICAgICAgICAgIHJldHVybiBKU09OYmlnLnN0cmluZ2lmeSB2YWx1ZVxuICAgICAgICBjYXRjaFxuICAgICAgICAgICMgaWdub3JlXG4gICAgICAgIHJldHVybiB2YWx1ZVxuICBlbHNlXG4gICAgcmV0dXJuIEpTT05iaWcuc3RyaW5naWZ5IG9iaiwgbnVsbCwgc3BhY2VcblxuZm9ybWF0dGVyLnBhcnNlQW5kVmFsaWRhdGUgPSAodGV4dCkgLT5cbiAgSlNPTmJpZyA9IHJlcXVpcmUgJ2pzb24tYmlnaW50JyAjIGxhenkgbG9hZCByZXF1aXJlbWVudHNcbiAgdHJ5XG4gICAgcmV0dXJuIEpTT05iaWcucGFyc2UgdGV4dFxuICBjYXRjaCBlcnJvclxuICAgIGlmIGF0b20uY29uZmlnLmdldCAncHJldHR5LWpzb24ubm90aWZ5T25QYXJzZUVycm9yJ1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJKU09OIFByZXR0eTogI3tlcnJvci5uYW1lfTogI3tlcnJvci5tZXNzYWdlfSBhdCBjaGFyYWN0ZXIgI3tlcnJvci5hdH0gbmVhciBcXFwiI3tlcnJvci50ZXh0fVxcXCJcIlxuICAgIHRocm93IGVycm9yXG5cbmZvcm1hdHRlci5wcmV0dHkgPSAodGV4dCwgb3B0aW9ucykgLT5cbiAgdHJ5XG4gICAgcGFyc2VkID0gZm9ybWF0dGVyLnBhcnNlQW5kVmFsaWRhdGUgdGV4dFxuICBjYXRjaCBlcnJvclxuICAgIHJldHVybiB0ZXh0XG4gIHJldHVybiBmb3JtYXR0ZXIuc3RyaW5naWZ5IHBhcnNlZCwgb3B0aW9uc1xuXG5mb3JtYXR0ZXIubWluaWZ5ID0gKHRleHQpIC0+XG4gIHRyeVxuICAgIGZvcm1hdHRlci5wYXJzZUFuZFZhbGlkYXRlIHRleHRcbiAgY2F0Y2ggZXJyb3JcbiAgICByZXR1cm4gdGV4dFxuICB1Z2xpZnkgPSByZXF1aXJlICdqc29ubWluaWZ5JyAjIGxhenkgbG9hZCByZXF1aXJlbWVudHNcbiAgcmV0dXJuIHVnbGlmeSB0ZXh0XG5cbmZvcm1hdHRlci5qc29uaWZ5ID0gKHRleHQsIG9wdGlvbnMpIC0+XG4gIHZtID0gcmVxdWlyZSAndm0nICMgbGF6eSBsb2FkIHJlcXVpcmVtZW50c1xuICB0cnlcbiAgICB2bS5ydW5JblRoaXNDb250ZXh0IFwibmV3T2JqZWN0ID0gI3t0ZXh0fTtcIlxuICBjYXRjaCBlcnJvclxuICAgIGlmIGF0b20uY29uZmlnLmdldCAncHJldHR5LWpzb24ubm90aWZ5T25QYXJzZUVycm9yJ1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJKU09OIFByZXR0eTogZXZhbCBpc3N1ZTogI3tlcnJvcn1cIlxuICAgIHJldHVybiB0ZXh0XG4gIHJldHVybiBmb3JtYXR0ZXIuc3RyaW5naWZ5IG5ld09iamVjdCwgb3B0aW9uc1xuXG5QcmV0dHlKU09OID1cbiAgY29uZmlnOlxuICAgIG5vdGlmeU9uUGFyc2VFcnJvcjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIHByZXR0aWZ5T25TYXZlSlNPTjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIHRpdGxlOiAnUHJldHRpZnkgT24gU2F2ZSBKU09OJ1xuICAgIGdyYW1tYXJzOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogWydzb3VyY2UuanNvbicsICd0ZXh0LnBsYWluLm51bGwtZ3JhbW1hciddXG5cbiAgZG9FbnRpcmVGaWxlOiAoZWRpdG9yKSAtPlxuICAgIGdyYW1tYXJzID0gYXRvbS5jb25maWcuZ2V0ICdwcmV0dHktanNvbi5ncmFtbWFycycgPyBbXVxuICAgIGlmIGVkaXRvcj8uZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSBub3QgaW4gZ3JhbW1hcnNcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzRW1wdHkoKVxuXG4gIHJlcGxhY2VUZXh0OiAoZWRpdG9yLCBmbikgLT5cbiAgICBlZGl0b3IubXV0YXRlU2VsZWN0ZWRUZXh0IChzZWxlY3Rpb24pIC0+XG4gICAgICBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgdGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgIHNlbGVjdGlvbi5kZWxldGVTZWxlY3RlZFRleHQoKVxuICAgICAgcmFuZ2UgPSBzZWxlY3Rpb24uaW5zZXJ0VGV4dCBmbiB0ZXh0XG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UgcmFuZ2VcblxuICBwcmV0dGlmeTogKGVkaXRvciwgb3B0aW9ucykgLT5cbiAgICBlbnRpcmUgPSBpZiBvcHRpb25zPy5lbnRpcmU/IHRoZW4gb3B0aW9ucy5lbnRpcmUgZWxzZSBAZG9FbnRpcmVGaWxlIGVkaXRvclxuICAgIHNvcnRlZCA9IGlmIG9wdGlvbnM/LnNvcnRlZD8gdGhlbiBvcHRpb25zLnNvcnRlZCBlbHNlIGZhbHNlXG4gICAgc2VsZWN0ZWQgPSBpZiBvcHRpb25zPy5zZWxlY3RlZD8gdGhlbiBvcHRpb25zLnNlbGVjdGVkIGVsc2UgdHJ1ZVxuICAgIGlmIGVudGlyZVxuICAgICAgcG9zID0gZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgICAgIGVkaXRvci5zZXRUZXh0IGZvcm1hdHRlci5wcmV0dHkgZWRpdG9yLmdldFRleHQoKSxcbiAgICAgICAgc2NvcGU6IGVkaXRvci5nZXRSb290U2NvcGVEZXNjcmlwdG9yKClcbiAgICAgICAgc29ydGVkOiBzb3J0ZWRcbiAgICBlbHNlXG4gICAgICBwb3MgPSBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmdldFNjcmVlblJhbmdlKCkuc3RhcnRcbiAgICAgIEByZXBsYWNlVGV4dCBlZGl0b3IsICh0ZXh0KSAtPiBmb3JtYXR0ZXIucHJldHR5IHRleHQsXG4gICAgICAgIHNjb3BlOiBbJ3NvdXJjZS5qc29uJ11cbiAgICAgICAgc29ydGVkOiBzb3J0ZWRcbiAgICB1bmxlc3Mgc2VsZWN0ZWRcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbiBwb3NcblxuICBtaW5pZnk6IChlZGl0b3IsIG9wdGlvbnMpIC0+XG4gICAgZW50aXJlID0gaWYgb3B0aW9ucz8uZW50aXJlPyB0aGVuIG9wdGlvbnMuZW50aXJlIGVsc2UgQGRvRW50aXJlRmlsZSBlZGl0b3JcbiAgICBzZWxlY3RlZCA9IGlmIG9wdGlvbnM/LnNlbGVjdGVkPyB0aGVuIG9wdGlvbnMuc2VsZWN0ZWQgZWxzZSB0cnVlXG4gICAgaWYgZW50aXJlXG4gICAgICBwb3MgPSBbMCwgMF1cbiAgICAgIGVkaXRvci5zZXRUZXh0IGZvcm1hdHRlci5taW5pZnkgZWRpdG9yLmdldFRleHQoKVxuICAgIGVsc2VcbiAgICAgIHBvcyA9IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuZ2V0U2NyZWVuUmFuZ2UoKS5zdGFydFxuICAgICAgQHJlcGxhY2VUZXh0IGVkaXRvciwgKHRleHQpIC0+IGZvcm1hdHRlci5taW5pZnkgdGV4dFxuICAgIHVubGVzcyBzZWxlY3RlZFxuICAgICAgZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uIHBvc1xuXG4gIGpzb25pZnk6IChlZGl0b3IsIG9wdGlvbnMpIC0+XG4gICAgZW50aXJlID0gaWYgb3B0aW9ucz8uZW50aXJlPyB0aGVuIG9wdGlvbnMuZW50aXJlIGVsc2UgQGRvRW50aXJlRmlsZSBlZGl0b3JcbiAgICBzb3J0ZWQgPSBpZiBvcHRpb25zPy5zb3J0ZWQ/IHRoZW4gb3B0aW9ucy5zb3J0ZWQgZWxzZSBmYWxzZVxuICAgIHNlbGVjdGVkID0gaWYgb3B0aW9ucz8uc2VsZWN0ZWQ/IHRoZW4gb3B0aW9ucy5zZWxlY3RlZCBlbHNlIHRydWVcbiAgICBpZiBlbnRpcmVcbiAgICAgIHBvcyA9IGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgICBlZGl0b3Iuc2V0VGV4dCBmb3JtYXR0ZXIuanNvbmlmeSBlZGl0b3IuZ2V0VGV4dCgpLFxuICAgICAgICBzY29wZTogZWRpdG9yLmdldFJvb3RTY29wZURlc2NyaXB0b3IoKVxuICAgICAgICBzb3J0ZWQ6IHNvcnRlZFxuICAgIGVsc2VcbiAgICAgIHBvcyA9IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuZ2V0U2NyZWVuUmFuZ2UoKS5zdGFydFxuICAgICAgQHJlcGxhY2VUZXh0IGVkaXRvciwgKHRleHQpIC0+IGZvcm1hdHRlci5qc29uaWZ5IHRleHQsXG4gICAgICAgIHNjb3BlOiBbJ3NvdXJjZS5qc29uJ11cbiAgICAgICAgc29ydGVkOiBzb3J0ZWRcbiAgICB1bmxlc3Mgc2VsZWN0ZWRcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbiBwb3NcblxuICBhY3RpdmF0ZTogLT5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ3ByZXR0eS1qc29uOnByZXR0aWZ5JzogPT5cbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIEBwcmV0dGlmeSBlZGl0b3IsXG4gICAgICAgICAgZW50aXJlOiBAZG9FbnRpcmVGaWxlIGVkaXRvclxuICAgICAgICAgIHNvcnRlZDogZmFsc2VcbiAgICAgICAgICBzZWxlY3RlZDogdHJ1ZVxuICAgICAgJ3ByZXR0eS1qc29uOm1pbmlmeSc6ID0+XG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBAbWluaWZ5IGVkaXRvcixcbiAgICAgICAgICBlbnRpcmU6IEBkb0VudGlyZUZpbGUgZWRpdG9yXG4gICAgICAgICAgc2VsZWN0ZWQ6IHRydWVcbiAgICAgICdwcmV0dHktanNvbjpzb3J0LWFuZC1wcmV0dGlmeSc6ID0+XG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBAcHJldHRpZnkgZWRpdG9yLFxuICAgICAgICAgIGVudGlyZTogQGRvRW50aXJlRmlsZSBlZGl0b3JcbiAgICAgICAgICBzb3J0ZWQ6IHRydWVcbiAgICAgICAgICBzZWxlY3RlZDogdHJ1ZVxuICAgICAgJ3ByZXR0eS1qc29uOmpzb25pZnktbGl0ZXJhbC1hbmQtcHJldHRpZnknOiA9PlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgQGpzb25pZnkgZWRpdG9yLFxuICAgICAgICAgIGVudGlyZTogQGRvRW50aXJlRmlsZSBlZGl0b3JcbiAgICAgICAgICBzb3J0ZWQ6IGZhbHNlXG4gICAgICAgICAgc2VsZWN0ZWQ6IHRydWVcbiAgICAgICdwcmV0dHktanNvbjpqc29uaWZ5LWxpdGVyYWwtYW5kLXNvcnQtYW5kLXByZXR0aWZ5JzogPT5cbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIEBqc29uaWZ5IGVkaXRvcixcbiAgICAgICAgICBlbnRpcmU6IEBkb0VudGlyZUZpbGUgZWRpdG9yXG4gICAgICAgICAgc29ydGVkOiB0cnVlXG4gICAgICAgICAgc2VsZWN0ZWQ6IHRydWVcblxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncHJldHR5LWpzb24ucHJldHRpZnlPblNhdmVKU09OJywgKHZhbHVlKSA9PlxuICAgICAgQHNhdmVTdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICAgIEBzYXZlU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAgIGlmIHZhbHVlXG4gICAgICAgIEBzdWJzY3JpYmVUb1NhdmVFdmVudHMoKVxuXG4gIHN1YnNjcmliZVRvU2F2ZUV2ZW50czogLT5cbiAgICBAc2F2ZVN1YnNjcmlwdGlvbnMuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgcmV0dXJuIGlmIG5vdCBlZGl0b3I/LmdldEJ1ZmZlcigpXG4gICAgICBidWZmZXJTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgICAgYnVmZmVyU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9yLmdldEJ1ZmZlcigpLm9uV2lsbFNhdmUgKGZpbGVQYXRoKSA9PlxuICAgICAgICBpZiBAZG9FbnRpcmVGaWxlIGVkaXRvclxuICAgICAgICAgIEBwcmV0dGlmeSBlZGl0b3IsXG4gICAgICAgICAgICBlbnRpcmU6IHRydWVcbiAgICAgICAgICAgIHNvcnRlZDogZmFsc2VcbiAgICAgICAgICAgIHNlbGVjdGVkOiBmYWxzZVxuICAgICAgYnVmZmVyU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkRGVzdHJveSAtPlxuICAgICAgICBidWZmZXJTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgICAgQHNhdmVTdWJzY3JpcHRpb25zLmFkZCBidWZmZXJTdWJzY3JpcHRpb25zXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gUHJldHR5SlNPTlxuIl19
