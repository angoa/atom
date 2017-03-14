(function() {
  var CompositeDisposable,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    subscriptions: null,
    currentEditor: null,
    action: null,
    extension: '',
    disabledFileExtensions: [],
    config: {
      disabledFileExtensions: {
        type: 'array',
        "default": ['js', 'jsx'],
        description: 'Disabled autoclose in above file types'
      }
    },
    activate: function() {
      this.subscriptions = new CompositeDisposable;
      atom.config.observe('autoclose.disabledFileExtensions', (function(_this) {
        return function(value) {
          return _this.disabledFileExtensions = value;
        };
      })(this));
      this.currentEditor = atom.workspace.getActiveTextEditor();
      if (this.currentEditor) {
        this.action = this.currentEditor.onDidInsertText((function(_this) {
          return function(event) {
            return _this._closeTag(event);
          };
        })(this));
      }
      this._getFileExtension();
      return atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(paneItem) {
          return _this._paneItemChanged(paneItem);
        };
      })(this));
    },
    deactivate: function() {
      if (this.action) {
        this.action.disposalAction();
      }
      return this.subscriptions.dispose();
    },
    _getFileExtension: function() {
      var filename, ref;
      filename = (ref = this.currentEditor) != null ? typeof ref.getFileName === "function" ? ref.getFileName() : void 0 : void 0;
      return this.extension = filename != null ? filename.substr((filename != null ? filename.lastIndexOf('.') : void 0) + 1) : void 0;
    },
    _paneItemChanged: function(paneItem) {
      if (!paneItem) {
        return;
      }
      if (this.action) {
        this.action.disposalAction();
      }
      this.currentEditor = paneItem;
      this._getFileExtension();
      if (this.currentEditor.onDidInsertText) {
        return this.action = this.currentEditor.onDidInsertText((function(_this) {
          return function(event) {
            return _this._closeTag(event);
          };
        })(this));
      }
    },
    _addIndent: function(range) {
      var buffer, content, end, lineAfter, lineBefore, regex, start;
      start = range.start, end = range.end;
      buffer = this.currentEditor.buffer;
      lineBefore = buffer.getLines()[start.row];
      lineAfter = buffer.getLines()[end.row];
      content = lineBefore.substr(lineBefore.lastIndexOf('<')) + '\n' + lineAfter;
      regex = /^.*\<([a-zA-Z-_]+)(\s.+)?\>\n\s*\<\/\1\>.*/;
      if (regex.test(content)) {
        this.currentEditor.insertNewlineAbove();
        return this.currentEditor.insertText('  ');
      }
    },
    _closeTag: function(event) {
      var line, previousTagIndex, range, ref, ref1, strAfter, strBefore, tagName, text;
      if (ref = this.extension, indexOf.call(this.disabledFileExtensions, ref) >= 0) {
        return;
      }
      text = event.text, range = event.range;
      if (text === '\n') {
        this._addIndent(event.range);
        return;
      }
      if (text !== '>' && text !== '/') {
        return;
      }
      line = this.currentEditor.buffer.getLines()[range.end.row];
      strBefore = line.substr(0, range.start.column);
      strAfter = line.substr(range.end.column);
      previousTagIndex = strBefore.lastIndexOf('<');
      if (previousTagIndex < 0) {
        return;
      }
      tagName = (ref1 = strBefore.match(/^.*\<([a-zA-Z-_.]+)[^>]*?/)) != null ? ref1[1] : void 0;
      if (!tagName) {
        return;
      }
      if (text === '>') {
        if (strBefore[strBefore.length - 1] === '/') {
          return;
        }
        this.currentEditor.insertText("</" + tagName + ">");
        return this.currentEditor.moveLeft(tagName.length + 3);
      } else if (text === '/') {
        if (strAfter[0] === '>') {
          return;
        }
        return this.currentEditor.insertText('>');
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL2F1dG9jbG9zZS9saWIvYXV0b2Nsb3NlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsbUJBQUE7SUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxhQUFBLEVBQWUsSUFBZjtJQUNBLGFBQUEsRUFBZSxJQURmO0lBRUEsTUFBQSxFQUFRLElBRlI7SUFHQSxTQUFBLEVBQVcsRUFIWDtJQUlBLHNCQUFBLEVBQXdCLEVBSnhCO0lBS0EsTUFBQSxFQUNFO01BQUEsc0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxPQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUFDLElBQUQsRUFBTyxLQUFQLENBRFQ7UUFFQSxXQUFBLEVBQWEsd0NBRmI7T0FERjtLQU5GO0lBV0EsUUFBQSxFQUFVLFNBQUE7TUFDUixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixrQ0FBcEIsRUFBd0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7aUJBQ3RELEtBQUMsQ0FBQSxzQkFBRCxHQUEwQjtRQUQ0QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEQ7TUFHQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7TUFDakIsSUFBRyxJQUFDLENBQUEsYUFBSjtRQUNFLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLGFBQWEsQ0FBQyxlQUFmLENBQStCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsS0FBRDttQkFDdkMsS0FBQyxDQUFBLFNBQUQsQ0FBVyxLQUFYO1VBRHVDO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQixFQURaOztNQUdBLElB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QjtNQUNYLGdCQUFBLEdBQW1CLFNBQVMsQ0FBQyxXQUFWLENBQXNCLEdBQXRCO01BRW5CLElBQUcsZ0JBQUEsR0FBbUIsQ0FBdEI7QUFDRSxlQURGOztNQUdBLE9BQUEsdUVBQXdELENBQUEsQ0FBQTtNQUN4RCxJQUFHLENBQUMsT0FBSjtBQUFpQixlQUFqQjs7TUFFQSxJQUFHLElBQUEsS0FBUSxHQUFYO1FBQ0UsSUFBRyxTQUFVLENBQUEsU0FBUyxDQUFDLE1BQVYsR0FBbUIsQ0FBbkIsQ0FBVixLQUFtQyxHQUF0QztBQUNFLGlCQURGOztRQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsVUFBZixDQUEwQixJQUFBLEdBQUssT0FBTCxHQUFhLEdBQXZDO2VBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxRQUFmLENBQXdCLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXpDLEVBTEY7T0FBQSxNQU1LLElBQUcsSUFBQSxLQUFRLEdBQVg7UUFDSCxJQUFHLFFBQVMsQ0FBQSxDQUFBLENBQVQsS0FBZSxHQUFsQjtBQUEyQixpQkFBM0I7O2VBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxVQUFmLENBQTBCLEdBQTFCLEVBRkc7O0lBM0JJLENBMURYOztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBzdWJzY3JpcHRpb25zOiBudWxsXG4gIGN1cnJlbnRFZGl0b3I6IG51bGxcbiAgYWN0aW9uOiBudWxsXG4gIGV4dGVuc2lvbjogJydcbiAgZGlzYWJsZWRGaWxlRXh0ZW5zaW9uczogW11cbiAgY29uZmlnOlxuICAgIGRpc2FibGVkRmlsZUV4dGVuc2lvbnM6XG4gICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgZGVmYXVsdDogWydqcycsICdqc3gnXSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRGlzYWJsZWQgYXV0b2Nsb3NlIGluIGFib3ZlIGZpbGUgdHlwZXMnXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIGF0b20uY29uZmlnLm9ic2VydmUgJ2F1dG9jbG9zZS5kaXNhYmxlZEZpbGVFeHRlbnNpb25zJywgKHZhbHVlKSA9PlxuICAgICAgQGRpc2FibGVkRmlsZUV4dGVuc2lvbnMgPSB2YWx1ZVxuXG4gICAgQGN1cnJlbnRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiBAY3VycmVudEVkaXRvclxuICAgICAgQGFjdGlvbiA9IEBjdXJyZW50RWRpdG9yLm9uRGlkSW5zZXJ0VGV4dCAoZXZlbnQpID0+XG4gICAgICAgIEBfY2xvc2VUYWcoZXZlbnQpXG4gICAgQF9nZXRGaWxlRXh0ZW5zaW9uKClcbiAgICBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIChwYW5lSXRlbSkgPT5cbiAgICAgIEBfcGFuZUl0ZW1DaGFuZ2VkKHBhbmVJdGVtKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgaWYgQGFjdGlvbiB0aGVuIEBhY3Rpb24uZGlzcG9zYWxBY3Rpb24oKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIF9nZXRGaWxlRXh0ZW5zaW9uOiAtPlxuICAgIGZpbGVuYW1lID0gQGN1cnJlbnRFZGl0b3I/LmdldEZpbGVOYW1lPygpXG4gICAgQGV4dGVuc2lvbiA9IGZpbGVuYW1lPy5zdWJzdHIgZmlsZW5hbWU/Lmxhc3RJbmRleE9mKCcuJykgKyAxXG5cbiAgX3BhbmVJdGVtQ2hhbmdlZDogKHBhbmVJdGVtKSAtPlxuICAgIGlmICFwYW5lSXRlbSB0aGVuIHJldHVyblxuXG4gICAgaWYgQGFjdGlvbiB0aGVuIEBhY3Rpb24uZGlzcG9zYWxBY3Rpb24oKVxuICAgIEBjdXJyZW50RWRpdG9yID0gcGFuZUl0ZW1cbiAgICBAX2dldEZpbGVFeHRlbnNpb24oKVxuICAgIGlmIEBjdXJyZW50RWRpdG9yLm9uRGlkSW5zZXJ0VGV4dFxuICAgICAgQGFjdGlvbiA9IEBjdXJyZW50RWRpdG9yLm9uRGlkSW5zZXJ0VGV4dCAoZXZlbnQpID0+XG4gICAgICAgIEBfY2xvc2VUYWcoZXZlbnQpXG5cbiAgX2FkZEluZGVudDogKHJhbmdlKSAtPlxuICAgIHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gICAgYnVmZmVyID0gQGN1cnJlbnRFZGl0b3IuYnVmZmVyXG4gICAgbGluZUJlZm9yZSA9IGJ1ZmZlci5nZXRMaW5lcygpW3N0YXJ0LnJvd11cbiAgICBsaW5lQWZ0ZXIgPSBidWZmZXIuZ2V0TGluZXMoKVtlbmQucm93XVxuICAgIGNvbnRlbnQgPSBsaW5lQmVmb3JlLnN1YnN0cihsaW5lQmVmb3JlLmxhc3RJbmRleE9mKCc8JykpICsgJ1xcbicgKyBsaW5lQWZ0ZXJcbiAgICByZWdleCA9IC8vL1xuICAgICAgICAgICAgICBeLipcXDwoW2EtekEtWi1fXSspKFxccy4rKT9cXD5cbiAgICAgICAgICAgICAgXFxuXG4gICAgICAgICAgICAgIFxccypcXDxcXC9cXDFcXD4uKlxuICAgICAgICAgICAgLy8vXG5cbiAgICBpZiByZWdleC50ZXN0IGNvbnRlbnRcbiAgICAgIEBjdXJyZW50RWRpdG9yLmluc2VydE5ld2xpbmVBYm92ZSgpXG4gICAgICBAY3VycmVudEVkaXRvci5pbnNlcnRUZXh0KCcgICcpXG5cbiAgX2Nsb3NlVGFnOiAoZXZlbnQpIC0+XG4gICAgcmV0dXJuIGlmIEBleHRlbnNpb24gaW4gQGRpc2FibGVkRmlsZUV4dGVuc2lvbnNcblxuICAgIHt0ZXh0LCByYW5nZX0gPSBldmVudFxuICAgIGlmIHRleHQgaXMgJ1xcbidcbiAgICAgIEBfYWRkSW5kZW50IGV2ZW50LnJhbmdlXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiBpZiB0ZXh0IGlzbnQgJz4nIGFuZCB0ZXh0IGlzbnQgJy8nXG5cbiAgICBsaW5lID0gQGN1cnJlbnRFZGl0b3IuYnVmZmVyLmdldExpbmVzKClbcmFuZ2UuZW5kLnJvd11cbiAgICBzdHJCZWZvcmUgPSBsaW5lLnN1YnN0ciAwLCByYW5nZS5zdGFydC5jb2x1bW5cbiAgICBzdHJBZnRlciA9IGxpbmUuc3Vic3RyIHJhbmdlLmVuZC5jb2x1bW5cbiAgICBwcmV2aW91c1RhZ0luZGV4ID0gc3RyQmVmb3JlLmxhc3RJbmRleE9mKCc8JylcblxuICAgIGlmIHByZXZpb3VzVGFnSW5kZXggPCAwXG4gICAgICByZXR1cm5cblxuICAgIHRhZ05hbWUgPSBzdHJCZWZvcmUubWF0Y2goL14uKlxcPChbYS16QS1aLV8uXSspW14+XSo/Lyk/WzFdXG4gICAgaWYgIXRhZ05hbWUgdGhlbiByZXR1cm5cblxuICAgIGlmIHRleHQgaXMgJz4nXG4gICAgICBpZiBzdHJCZWZvcmVbc3RyQmVmb3JlLmxlbmd0aCAtIDFdIGlzICcvJ1xuICAgICAgICByZXR1cm5cblxuICAgICAgQGN1cnJlbnRFZGl0b3IuaW5zZXJ0VGV4dCBcIjwvI3t0YWdOYW1lfT5cIlxuICAgICAgQGN1cnJlbnRFZGl0b3IubW92ZUxlZnQgdGFnTmFtZS5sZW5ndGggKyAzXG4gICAgZWxzZSBpZiB0ZXh0IGlzICcvJ1xuICAgICAgaWYgc3RyQWZ0ZXJbMF0gaXMgJz4nIHRoZW4gcmV0dXJuXG4gICAgICBAY3VycmVudEVkaXRvci5pbnNlcnRUZXh0ICc+J1xuIl19
