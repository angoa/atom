function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies

var _atom = require('atom');

'use babel';

module.exports = {
  config: {
    executablePath: {
      type: 'string',
      'default': _path2['default'].join(__dirname, '..', 'node_modules', 'jshint', 'bin', 'jshint'),
      description: 'Path of the `jshint` node script'
    },
    lintInlineJavaScript: {
      type: 'boolean',
      'default': false,
      description: 'Lint JavaScript inside `<script>` blocks in HTML or PHP files.'
    },
    disableWhenNoJshintrcFileInPath: {
      type: 'boolean',
      'default': false,
      description: 'Disable linter when no `.jshintrc` is found in project.'
    },
    jshintFileName: {
      type: 'string',
      'default': '.jshintrc',
      description: 'jshint file name'
    }
  },

  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install('linter-jshint');

    this.scopes = ['source.js', 'source.js-semantic'];
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-jshint.executablePath', function (executablePath) {
      _this.executablePath = executablePath;
    }));
    this.subscriptions.add(atom.config.observe('linter-jshint.disableWhenNoJshintrcFileInPath', function (disableWhenNoJshintrcFileInPath) {
      _this.disableWhenNoJshintrcFileInPath = disableWhenNoJshintrcFileInPath;
    }));

    this.subscriptions.add(atom.config.observe('linter-jshint.jshintFileName', function (jshintFileName) {
      _this.jshintFileName = jshintFileName;
    }));

    var scopeEmbedded = 'source.js.embedded.html';
    this.subscriptions.add(atom.config.observe('linter-jshint.lintInlineJavaScript', function (lintInlineJavaScript) {
      _this.lintInlineJavaScript = lintInlineJavaScript;
      if (lintInlineJavaScript) {
        _this.scopes.push(scopeEmbedded);
      } else if (_this.scopes.indexOf(scopeEmbedded) !== -1) {
        _this.scopes.splice(_this.scopes.indexOf(scopeEmbedded), 1);
      }
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    var Helpers = require('atom-linter');
    var Reporter = require('jshint-json');

    return {
      name: 'JSHint',
      grammarScopes: this.scopes,
      scope: 'file',
      lintOnFly: true,
      lint: _asyncToGenerator(function* (textEditor) {
        var results = [];
        var filePath = textEditor.getPath();
        var fileContents = textEditor.getText();
        var parameters = ['--reporter', Reporter, '--filename', filePath];

        var configFile = yield Helpers.findCachedAsync(_path2['default'].dirname(filePath), _this2.jshintFileName);

        if (configFile) {
          parameters.push('--config', configFile);
        } else if (_this2.disableWhenNoJshintrcFileInPath) {
          return results;
        }

        if (_this2.lintInlineJavaScript && textEditor.getGrammar().scopeName.indexOf('text.html') !== -1) {
          parameters.push('--extract', 'always');
        }
        parameters.push('-');

        var execOpts = { stdin: fileContents, ignoreExitCode: true };
        var result = yield Helpers.execNode(_this2.executablePath, parameters, execOpts);

        if (textEditor.getText() !== fileContents) {
          // File has changed since the lint was triggered, tell Linter not to update
          return null;
        }

        var parsed = undefined;
        try {
          parsed = JSON.parse(result);
        } catch (_) {
          // eslint-disable-next-line no-console
          console.error('[Linter-JSHint]', _, result);
          atom.notifications.addWarning('[Linter-JSHint]', { detail: 'JSHint return an invalid response, check your console for more info' });
          return results;
        }

        Object.keys(parsed.result).forEach(function (entryID) {
          var entry = parsed.result[entryID];

          if (!entry.error.id) {
            return;
          }

          var error = entry.error;
          var errorType = error.code.substr(0, 1);
          var type = 'Info';
          if (errorType === 'E') {
            type = 'Error';
          } else if (errorType === 'W') {
            type = 'Warning';
          }
          var errorLine = error.line > 0 ? error.line - 1 : 0;
          var range = undefined;

          // TODO: Remove workaround of jshint/jshint#2846
          if (error.character === null) {
            range = Helpers.generateRange(textEditor, errorLine);
          } else {
            var character = error.character > 0 ? error.character - 1 : 0;
            var line = errorLine;
            var buffer = textEditor.getBuffer();
            var maxLine = buffer.getLineCount();
            // TODO: Remove workaround of jshint/jshint#2894
            if (errorLine >= maxLine) {
              line = maxLine;
            }
            var maxCharacter = buffer.lineLengthForRow(line);
            // TODO: Remove workaround of jquery/esprima#1457
            if (character > maxCharacter) {
              character = maxCharacter;
            }
            range = Helpers.generateRange(textEditor, line, character);
          }

          results.push({
            type: type,
            text: error.code + ' - ' + error.reason,
            filePath: filePath,
            range: range
          });
        });
        return results;
      })
    };
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbmdvYS8uYXRvbS9wYWNrYWdlcy9saW50ZXItanNoaW50L2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBSWlCLE1BQU07Ozs7OztvQkFFYSxNQUFNOztBQU4xQyxXQUFXLENBQUM7O0FBUVosTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFFBQU0sRUFBRTtBQUNOLGtCQUFjLEVBQUU7QUFDZCxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLGtCQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQztBQUM5RSxpQkFBVyxFQUFFLGtDQUFrQztLQUNoRDtBQUNELHdCQUFvQixFQUFFO0FBQ3BCLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztBQUNkLGlCQUFXLEVBQUUsZ0VBQWdFO0tBQzlFO0FBQ0QsbUNBQStCLEVBQUU7QUFDL0IsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxLQUFLO0FBQ2QsaUJBQVcsRUFBRSx5REFBeUQ7S0FDdkU7QUFDRCxrQkFBYyxFQUFFO0FBQ2QsVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyxXQUFXO0FBQ3BCLGlCQUFXLEVBQUUsa0JBQWtCO0tBQ2hDO0dBQ0Y7O0FBRUQsVUFBUSxFQUFBLG9CQUFHOzs7QUFDVCxXQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRXRELFFBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxXQUFXLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztBQUNsRCxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFDO0FBQy9DLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDhCQUE4QixFQUFFLFVBQUMsY0FBYyxFQUFLO0FBQzdGLFlBQUssY0FBYyxHQUFHLGNBQWMsQ0FB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aEIsQ0FBQTtLQUNGLENBQUM7R0FDSDtDQUNGLENBQUMiLCJmaWxlIjoiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1qc2hpbnQvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLyogQGZsb3cgKi9cblxuaW1wb3J0IFBhdGggZnJvbSAncGF0aCc7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L2V4dGVuc2lvbnMsIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llc1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29uZmlnOiB7XG4gICAgZXhlY3V0YWJsZVBhdGg6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogUGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ25vZGVfbW9kdWxlcycsICdqc2hpbnQnLCAnYmluJywgJ2pzaGludCcpLFxuICAgICAgZGVzY3JpcHRpb246ICdQYXRoIG9mIHRoZSBganNoaW50YCBub2RlIHNjcmlwdCcsXG4gICAgfSxcbiAgICBsaW50SW5saW5lSmF2YVNjcmlwdDoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogJ0xpbnQgSmF2YVNjcmlwdCBpbnNpZGUgYDxzY3JpcHQ+YCBibG9ja3MgaW4gSFRNTCBvciBQSFAgZmlsZXMuJyxcbiAgICB9LFxuICAgIGRpc2FibGVXaGVuTm9Kc2hpbnRyY0ZpbGVJblBhdGg6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246ICdEaXNhYmxlIGxpbnRlciB3aGVuIG5vIGAuanNoaW50cmNgIGlzIGZvdW5kIGluIHByb2plY3QuJyxcbiAgICB9LFxuICAgIGpzaGludEZpbGVOYW1lOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICcuanNoaW50cmMnLFxuICAgICAgZGVzY3JpcHRpb246ICdqc2hpbnQgZmlsZSBuYW1lJyxcbiAgICB9LFxuICB9LFxuXG4gIGFjdGl2YXRlKCkge1xuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbGludGVyLWpzaGludCcpO1xuXG4gICAgdGhpcy5zY29wZXMgPSBbJ3NvdXJjZS5qcycsICdzb3VyY2UuanMtc2VtYW50aWMnXTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWpzaGludC5leGVjdXRhYmxlUGF0aCcsIChleGVjdXRhYmxlUGF0aCkgPT4ge1xuICAgICAgdGhpcy5leGVjdXRhYmxlUGF0aCA9IGV4ZWN1dGFibGVQYXRoO1xuICAgIH0pKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWpzaGludC5kaXNhYmxlV2hlbk5vSnNoaW50cmNGaWxlSW5QYXRoJyxcbiAgICAgICAgKGRpc2FibGVXaGVuTm9Kc2hpbnRyY0ZpbGVJblBhdGgpID0+IHtcbiAgICAgICAgICB0aGlzLmRpc2FibGVXaGVuTm9Kc2hpbnRyY0ZpbGVJblBhdGggPSBkaXNhYmxlV2hlbk5vSnNoaW50cmNGaWxlSW5QYXRoO1xuICAgICAgICB9LFxuICAgICAgKSxcbiAgICApO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItanNoaW50LmpzaGludEZpbGVOYW1lJywgKGpzaGludEZpbGVOYW1lKSA9PiB7XG4gICAgICB0aGlzLmpzaGludEZpbGVOYW1lID0ganNoaW50RmlsZU5hbWU7XG4gICAgfSkpO1xuXG4gICAgY29uc3Qgc2NvcGVFbWJlZGRlZCA9ICdzb3VyY2UuanMuZW1iZWRkZWQuaHRtbCc7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItanNoaW50LmxpbnRJbmxpbmVKYXZhU2NyaXB0JyxcbiAgICAgIChsaW50SW5saW5lSmF2YVNjcmlwdCkgPT4ge1xuICAgICAgICB0aGlzLmxpbnRJbmxpbmVKYXZhU2NyaXB0ID0gbGludElubGluZUphdmFTY3JpcHQ7XG4gICAgICAgIGlmIChsaW50SW5saW5lSmF2YVNjcmlwdCkge1xuICAgICAgICAgIHRoaXMuc2NvcGVzLnB1c2goc2NvcGVFbWJlZGRlZCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zY29wZXMuaW5kZXhPZihzY29wZUVtYmVkZGVkKSAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnNjb3Blcy5zcGxpY2UodGhpcy5zY29wZXMuaW5kZXhPZihzY29wZUVtYmVkZGVkKSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKSk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9LFxuXG4gIHByb3ZpZGVMaW50ZXIoKSB7XG4gICAgY29uc3QgSGVscGVycyA9IHJlcXVpcmUoJ2F0b20tbGludGVyJyk7XG4gICAgY29uc3QgUmVwb3J0ZXIgPSByZXF1aXJlKCdqc2hpbnQtanNvbicpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdKU0hpbnQnLFxuICAgICAgZ3JhbW1hclNjb3BlczogdGhpcy5zY29wZXMsXG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgbGludE9uRmx5OiB0cnVlLFxuICAgICAgbGludDogYXN5bmMgKHRleHRFZGl0b3IpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgICBjb25zdCBmaWxlQ29udGVudHMgPSB0ZXh0RWRpdG9yLmdldFRleHQoKTtcbiAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9IFsnLS1yZXBvcnRlcicsIFJlcG9ydGVyLCAnLS1maWxlbmFtZScsIGZpbGVQYXRoXTtcblxuICAgICAgICBjb25zdCBjb25maWdGaWxlID0gYXdhaXQgSGVscGVycy5maW5kQ2FjaGVkQXN5bmMoXG4gICAgICAgICAgUGF0aC5kaXJuYW1lKGZpbGVQYXRoKSwgdGhpcy5qc2hpbnRGaWxlTmFtZSxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoY29uZmlnRmlsZSkge1xuICAgICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLS1jb25maWcnLCBjb25maWdGaWxlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRpc2FibGVXaGVuTm9Kc2hpbnRyY0ZpbGVJblBhdGgpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxpbnRJbmxpbmVKYXZhU2NyaXB0ICYmXG4gICAgICAgICAgdGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lLmluZGV4T2YoJ3RleHQuaHRtbCcpICE9PSAtMVxuICAgICAgICApIHtcbiAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tZXh0cmFjdCcsICdhbHdheXMnKTtcbiAgICAgICAgfVxuICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0nKTtcblxuICAgICAgICBjb25zdCBleGVjT3B0cyA9IHsgc3RkaW46IGZpbGVDb250ZW50cywgaWdub3JlRXhpdENvZGU6IHRydWUgfTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgSGVscGVycy5leGVjTm9kZShcbiAgICAgICAgICB0aGlzLmV4ZWN1dGFibGVQYXRoLCBwYXJhbWV0ZXJzLCBleGVjT3B0cyxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAodGV4dEVkaXRvci5nZXRUZXh0KCkgIT09IGZpbGVDb250ZW50cykge1xuICAgICAgICAgIC8vIEZpbGUgaGFzIGNoYW5nZWQgc2luY2UgdGhlIGxpbnQgd2FzIHRyaWdnZXJlZCwgdGVsbCBMaW50ZXIgbm90IHRvIHVwZGF0ZVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHBhcnNlZDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwYXJzZWQgPSBKU09OLnBhcnNlKHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tMaW50ZXItSlNIaW50XScsIF8sIHJlc3VsdCk7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1tMaW50ZXItSlNIaW50XScsXG4gICAgICAgICAgICB7IGRldGFpbDogJ0pTSGludCByZXR1cm4gYW4gaW52YWxpZCByZXNwb25zZSwgY2hlY2sgeW91ciBjb25zb2xlIGZvciBtb3JlIGluZm8nIH0sXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5rZXlzKHBhcnNlZC5yZXN1bHQpLmZvckVhY2goKGVudHJ5SUQpID0+IHtcbiAgICAgICAgICBjb25zdCBlbnRyeSA9IHBhcnNlZC5yZXN1bHRbZW50cnlJRF07XG5cbiAgICAgICAgICBpZiAoIWVudHJ5LmVycm9yLmlkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgZXJyb3IgPSBlbnRyeS5lcnJvcjtcbiAgICAgICAgICBjb25zdCBlcnJvclR5cGUgPSBlcnJvci5jb2RlLnN1YnN0cigwLCAxKTtcbiAgICAgICAgICBsZXQgdHlwZSA9ICdJbmZvJztcbiAgICAgICAgICBpZiAoZXJyb3JUeXBlID09PSAnRScpIHtcbiAgICAgICAgICAgIHR5cGUgPSAnRXJyb3InO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3JUeXBlID09PSAnVycpIHtcbiAgICAgICAgICAgIHR5cGUgPSAnV2FybmluZyc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGVycm9yTGluZSA9IGVycm9yLmxpbmUgPiAwID8gZXJyb3IubGluZSAtIDEgOiAwO1xuICAgICAgICAgIGxldCByYW5nZTtcblxuICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSB3b3JrYXJvdW5kIG9mIGpzaGludC9qc2hpbnQjMjg0NlxuICAgICAgICAgIGlmIChlcnJvci5jaGFyYWN0ZXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJhbmdlID0gSGVscGVycy5nZW5lcmF0ZVJhbmdlKHRleHRFZGl0b3IsIGVycm9yTGluZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBjaGFyYWN0ZXIgPSBlcnJvci5jaGFyYWN0ZXIgPiAwID8gZXJyb3IuY2hhcmFjdGVyIC0gMSA6IDA7XG4gICAgICAgICAgICBsZXQgbGluZSA9IGVycm9yTGluZTtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IHRleHRFZGl0b3IuZ2V0QnVmZmVyKCk7XG4gICAgICAgICAgICBjb25zdCBtYXhMaW5lID0gYnVmZmVyLmdldExpbmVDb3VudCgpO1xuICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIHdvcmthcm91bmQgb2YganNoaW50L2pzaGludCMyODk0XG4gICAgICAgICAgICBpZiAoZXJyb3JMaW5lID49IG1heExpbmUpIHtcbiAgICAgICAgICAgICAgbGluZSA9IG1heExpbmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtYXhDaGFyYWN0ZXIgPSBidWZmZXIubGluZUxlbmd0aEZvclJvdyhsaW5lKTtcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSB3b3JrYXJvdW5kIG9mIGpxdWVyeS9lc3ByaW1hIzE0NTdcbiAgICAgICAgICAgIGlmIChjaGFyYWN0ZXIgPiBtYXhDaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgICAgY2hhcmFjdGVyID0gbWF4Q2hhcmFjdGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmFuZ2UgPSBIZWxwZXJzLmdlbmVyYXRlUmFuZ2UodGV4dEVkaXRvciwgbGluZSwgY2hhcmFjdGVyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIHRleHQ6IGAke2Vycm9yLmNvZGV9IC0gJHtlcnJvci5yZWFzb259YCxcbiAgICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICAgICAgcmFuZ2UsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn07XG4iXX0=