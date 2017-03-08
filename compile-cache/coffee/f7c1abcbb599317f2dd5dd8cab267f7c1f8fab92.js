(function() {
  module.exports = {
    view: null,
    activate: function() {
      var _TriggerKey, _command, _commands, _keymap, _linuxSelector, _macSelector, _triggerKey, _windowsSelector;
      this.view = (require('./ColorPicker-view'))();
      _command = 'color-picker:open';
      _triggerKey = (atom.config.get('color-picker.triggerKey')).toLowerCase();
      _TriggerKey = _triggerKey.toUpperCase();
      _macSelector = '.platform-darwin atom-workspace';
      _windowsSelector = '.platform-win32 atom-workspace';
      _linuxSelector = '.platform-linux atom-workspace';
      _keymap = {};
      _keymap["" + _macSelector] = {};
      _keymap["" + _macSelector]["cmd-" + _TriggerKey] = _command;
      _keymap["" + _windowsSelector] = {};
      _keymap["" + _windowsSelector]["ctrl-alt-" + _triggerKey] = _command;
      _keymap["" + _linuxSelector] = {};
      _keymap["" + _linuxSelector]["ctrl-alt-" + _triggerKey] = _command;
      atom.keymaps.add('color-picker:trigger', _keymap);
      atom.contextMenu.add({
        'atom-text-editor': [
          {
            label: 'Color Picker',
            command: _command
          }
        ]
      });
      _commands = {};
      _commands["" + _command] = (function(_this) {
        return function() {
          var ref;
          if (!((ref = _this.view) != null ? ref.canOpen : void 0)) {
            return;
          }
          return _this.view.open();
        };
      })(this);
      atom.commands.add('atom-text-editor', _commands);
      return this.view.activate();
    },
    deactivate: function() {
      var ref;
      return (ref = this.view) != null ? ref.destroy() : void 0;
    },
    provideColorPicker: function() {
      return {
        open: (function(_this) {
          return function(Editor, Cursor) {
            var ref;
            if (!((ref = _this.view) != null ? ref.canOpen : void 0)) {
              return;
            }
            return _this.view.open(Editor, Cursor);
          };
        })(this)
      };
    },
    config: {
      randomColor: {
        title: 'Serve a random color on open',
        description: 'If the Color Picker doesn\'t get an input color, it serves a completely random color.',
        type: 'boolean',
        "default": true
      },
      automaticReplace: {
        title: 'Automatically Replace Color',
        description: 'Replace selected color automatically on change. Works well with as-you-type CSS reloaders.',
        type: 'boolean',
        "default": false
      },
      abbreviateValues: {
        title: 'Abbreviate Color Values',
        description: 'If possible, abbreviate color values, like for example “0.3” to “.3”,  “#ffffff” to “#fff” and “rgb(0, 0, 0)” to “rgb(0,0,0)”.',
        type: 'boolean',
        "default": false
      },
      uppercaseColorValues: {
        title: 'Uppercase Color Values',
        description: 'If sensible, uppercase the color value. For example, “#aaa” becomes “#AAA”.',
        type: 'boolean',
        "default": false
      },
      preferredFormat: {
        title: 'Preferred Color Format',
        description: 'On open, the Color Picker will show a color in this format.',
        type: 'string',
        "enum": ['RGB', 'HEX', 'HSL', 'HSV', 'VEC'],
        "default": 'RGB'
      },
      triggerKey: {
        title: 'Trigger key',
        description: 'Decide what trigger key should open the Color Picker. `CMD-SHIFT-{TRIGGER_KEY}` and `CTRL-ALT-{TRIGGER_KEY}`. Requires a restart.',
        type: 'string',
        "enum": ['C', 'E', 'H', 'K'],
        "default": 'C'
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvQ29sb3JQaWNrZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlJO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLElBQUEsRUFBTSxJQUFOO0lBRUEsUUFBQSxFQUFVLFNBQUE7QUFDTixVQUFBO01BQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxDQUFDLE9BQUEsQ0FBUSxvQkFBUixDQUFELENBQUEsQ0FBQTtNQUNSLFFBQUEsR0FBVztNQUlYLFdBQUEsR0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEIsQ0FBRCxDQUEyQyxDQUFDLFdBQTVDLENBQUE7TUFDZCxXQUFBLEdBQWMsV0FBVyxDQUFDLFdBQVosQ0FBQTtNQUdkLFlBQUEsR0FBZTtNQUNmLGdCQUFBLEdBQW1CO01BQ25CLGNBQUEsR0FBaUI7TUFFakIsT0FBQSxHQUFVO01BR1YsT0FBUSxDQUFBLEVBQUEsR0FBSSxZQUFKLENBQVIsR0FBK0I7TUFDL0IsT0FBUSxDQUFBLEVBQUEsR0FBSSxZQUFKLENBQXFCLENBQUEsTUFBQSxHQUFRLFdBQVIsQ0FBN0IsR0FBdUQ7TUFFdkQsT0FBUSxDQUFBLEVBQUEsR0FBSSxnQkFBSixDQUFSLEdBQW1DO01BQ25DLE9BQVEsQ0FBQSxFQUFBLEdBQUksZ0JBQUosQ0FBeUIsQ0FBQSxXQUFBLEdBQWEsV0FBYixDQUFqQyxHQUFnRTtNQUVoRSxPQUFRLENBQUEsRUFBQSxHQUFJLGNBQUosQ0FBUixHQUFpQztNQUNqQyxPQUFRLENBQUEsRUFBQSxHQUFJLGNBQUosQ0FBdUIsQ0FBQSxXQUFBLEdBQWEsV0FBYixDQUEvQixHQUE4RDtNQUc5RCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQWIsQ0FBaUIsc0JBQWpCLEVBQXlDLE9BQXpDO01BSUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFqQixDQUFxQjtRQUFBLGtCQUFBLEVBQW9CO1VBQ3JDO1lBQUEsS0FBQSxFQUFPLGNBQVA7WUFDQSxPQUFBLEVBQVMsUUFEVDtXQURxQztTQUFwQjtPQUFyQjtNQU1BLFNBQUEsR0FBWTtNQUFJLFNBQVUsQ0FBQSxFQUFBLEdBQUksUUFBSixDQUFWLEdBQTZCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUN6QyxjQUFBO1VBQUEsSUFBQSxrQ0FBbUIsQ0FBRSxpQkFBckI7QUFBQSxtQkFBQTs7aUJBQ0EsS0FBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQUE7UUFGeUM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BRzdDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFBc0MsU0FBdEM7QUFFQSxhQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixDQUFBO0lBMUNELENBRlY7SUE4Q0EsVUFBQSxFQUFZLFNBQUE7QUFBRyxVQUFBOzRDQUFLLENBQUUsT0FBUCxDQUFBO0lBQUgsQ0E5Q1o7SUFnREEsa0JBQUEsRUFBb0IsU0FBQTtBQUNoQixhQUFPO1FBQ0gsSUFBQSxFQUFNLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsTUFBRCxFQUFTLE1BQVQ7QUFDRixnQkFBQTtZQUFBLElBQUEsa0NBQW1CLENBQUUsaUJBQXJCO0FBQUEscUJBQUE7O0FBQ0EsbUJBQU8sS0FBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsTUFBWCxFQUFtQixNQUFuQjtVQUZMO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURIOztJQURTLENBaERwQjtJQXVEQSxNQUFBLEVBRUk7TUFBQSxXQUFBLEVBQ0k7UUFBQSxLQUFBLEVBQU8sOEJBQVA7UUFDQSxXQUFBLEVBQWEsdUZBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtPQURKO01BTUEsZ0JBQUEsRUFDSTtRQUFBLEtBQUEsRUFBTyw2QkFBUDtRQUNBLFdBQUEsRUFBYSw0RkFEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO09BUEo7TUFhQSxnQkFBQSxFQUNJO1FBQUEsS0FBQSxFQUFPLHlCQUFQO1FBQ0EsV0FBQSxFQUFhLGdJQURiO1FBRUEsSUFBQSxFQUFNLFNBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7T0FkSjtNQW9CQSxvQkFBQSxFQUNJO1FBQUEsS0FBQSxFQUFPLHdCQUFQO1FBQ0EsV0FBQSxFQUFhLDZFQURiO1FBRUEsSUFBQSxFQUFNLFNBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7T0FyQko7TUEwQkEsZUFBQSxFQUNJO1FBQUEsS0FBQSxFQUFPLHdCQUFQO1FBQ0EsV0FBQSxFQUFhLDZEQURiO1FBRUEsSUFBQSxFQUFNLFFBRk47UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxLQUFmLEVBQXNCLEtBQXRCLEVBQTZCLEtBQTdCLENBSE47UUFJQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSlQ7T0EzQko7TUFrQ0EsVUFBQSxFQUNJO1FBQUEsS0FBQSxFQUFPLGFBQVA7UUFDQSxXQUFBLEVBQWEsbUlBRGI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsQ0FITjtRQUlBLENBQUEsT0FBQSxDQUFBLEVBQVMsR0FKVDtPQW5DSjtLQXpESjs7QUFESiIsInNvdXJjZXNDb250ZW50IjpbIiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyAgQ29sb3IgUGlja2VyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIG1vZHVsZS5leHBvcnRzID1cbiAgICAgICAgdmlldzogbnVsbFxuXG4gICAgICAgIGFjdGl2YXRlOiAtPlxuICAgICAgICAgICAgQHZpZXcgPSAocmVxdWlyZSAnLi9Db2xvclBpY2tlci12aWV3JykoKVxuICAgICAgICAgICAgX2NvbW1hbmQgPSAnY29sb3ItcGlja2VyOm9wZW4nXG5cbiAgICAgICAgIyAgU2V0IGtleSBiaW5kaW5nc1xuICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgX3RyaWdnZXJLZXkgPSAoYXRvbS5jb25maWcuZ2V0ICdjb2xvci1waWNrZXIudHJpZ2dlcktleScpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIF9UcmlnZ2VyS2V5ID0gX3RyaWdnZXJLZXkudG9VcHBlckNhc2UoKVxuXG4gICAgICAgICAgICAjIFRPRE8gdGhpcyBkb2Vzbid0IGxvb2sgdG9vIGdvb2RcbiAgICAgICAgICAgIF9tYWNTZWxlY3RvciA9ICcucGxhdGZvcm0tZGFyd2luIGF0b20td29ya3NwYWNlJ1xuICAgICAgICAgICAgX3dpbmRvd3NTZWxlY3RvciA9ICcucGxhdGZvcm0td2luMzIgYXRvbS13b3Jrc3BhY2UnXG4gICAgICAgICAgICBfbGludXhTZWxlY3RvciA9ICcucGxhdGZvcm0tbGludXggYXRvbS13b3Jrc3BhY2UnXG5cbiAgICAgICAgICAgIF9rZXltYXAgPSB7fVxuXG4gICAgICAgICAgICAjIE1hYyBPUyBYXG4gICAgICAgICAgICBfa2V5bWFwW1wiI3sgX21hY1NlbGVjdG9yIH1cIl0gPSB7fVxuICAgICAgICAgICAgX2tleW1hcFtcIiN7IF9tYWNTZWxlY3RvciB9XCJdW1wiY21kLSN7IF9UcmlnZ2VyS2V5IH1cIl0gPSBfY29tbWFuZFxuICAgICAgICAgICAgIyBXaW5kb3dzXG4gICAgICAgICAgICBfa2V5bWFwW1wiI3sgX3dpbmRvd3NTZWxlY3RvciB9XCJdID0ge31cbiAgICAgICAgICAgIF9rZXltYXBbXCIjeyBfd2luZG93c1NlbGVjdG9yIH1cIl1bXCJjdHJsLWFsdC0jeyBfdHJpZ2dlcktleSB9XCJdID0gX2NvbW1hbmRcbiAgICAgICAgICAgICMgTGludXhcbiAgICAgICAgICAgIF9rZXltYXBbXCIjeyBfbGludXhTZWxlY3RvciB9XCJdID0ge31cbiAgICAgICAgICAgIF9rZXltYXBbXCIjeyBfbGludXhTZWxlY3RvciB9XCJdW1wiY3RybC1hbHQtI3sgX3RyaWdnZXJLZXkgfVwiXSA9IF9jb21tYW5kXG5cbiAgICAgICAgICAgICMgQWRkIHRoZSBrZXltYXBcbiAgICAgICAgICAgIGF0b20ua2V5bWFwcy5hZGQgJ2NvbG9yLXBpY2tlcjp0cmlnZ2VyJywgX2tleW1hcFxuXG4gICAgICAgICMgIEFkZCBjb250ZXh0IG1lbnUgY29tbWFuZFxuICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgYXRvbS5jb250ZXh0TWVudS5hZGQgJ2F0b20tdGV4dC1lZGl0b3InOiBbXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdDb2xvciBQaWNrZXInXG4gICAgICAgICAgICAgICAgY29tbWFuZDogX2NvbW1hbmRdXG5cbiAgICAgICAgIyAgQWRkIGNvbG9yLXBpY2tlcjpvcGVuIGNvbW1hbmRcbiAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIF9jb21tYW5kcyA9IHt9OyBfY29tbWFuZHNbXCIjeyBfY29tbWFuZCB9XCJdID0gPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIEB2aWV3Py5jYW5PcGVuXG4gICAgICAgICAgICAgICAgQHZpZXcub3BlbigpXG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsIF9jb21tYW5kc1xuXG4gICAgICAgICAgICByZXR1cm4gQHZpZXcuYWN0aXZhdGUoKVxuXG4gICAgICAgIGRlYWN0aXZhdGU6IC0+IEB2aWV3Py5kZXN0cm95KClcblxuICAgICAgICBwcm92aWRlQ29sb3JQaWNrZXI6IC0+XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZW46IChFZGl0b3IsIEN1cnNvcikgPT5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBAdmlldz8uY2FuT3BlblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQHZpZXcub3BlbiBFZGl0b3IsIEN1cnNvclxuICAgICAgICAgICAgfVxuXG4gICAgICAgIGNvbmZpZzpcbiAgICAgICAgICAgICMgUmFuZG9tIGNvbG9yIGNvbmZpZ3VyYXRpb246IE9uIENvbG9yIFBpY2tlciBvcGVuLCBzaG93IGEgcmFuZG9tIGNvbG9yXG4gICAgICAgICAgICByYW5kb21Db2xvcjpcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1NlcnZlIGEgcmFuZG9tIGNvbG9yIG9uIG9wZW4nXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdJZiB0aGUgQ29sb3IgUGlja2VyIGRvZXNuXFwndCBnZXQgYW4gaW5wdXQgY29sb3IsIGl0IHNlcnZlcyBhIGNvbXBsZXRlbHkgcmFuZG9tIGNvbG9yLidcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICAjIEF1dG9tYXRpYyBSZXBsYWNlIGNvbmZpZ3VyYXRpb246IFJlcGxhY2UgY29sb3IgdmFsdWUgb24gY2hhbmdlXG4gICAgICAgICAgICBhdXRvbWF0aWNSZXBsYWNlOlxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQXV0b21hdGljYWxseSBSZXBsYWNlIENvbG9yJ1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUmVwbGFjZSBzZWxlY3RlZCBjb2xvciBhdXRvbWF0aWNhbGx5IG9uIGNoYW5nZS4gV29ya3Mgd2VsbCB3aXRoIGFzLXlvdS10eXBlIENTUyByZWxvYWRlcnMuJ1xuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICAjIEFiYnJldmlhdGUgdmFsdWVzIGNvbmZpZ3VyYXRpb246IElmIHBvc3NpYmxlLCBhYmJyZXZpYXRlIGNvbG9yIHZhbHVlcy4gRWcuIOKAnDAuM+KAnSB0byDigJwuM+KAnVxuICAgICAgICAgICAgIyBUT0RPOiBDYW4gd2UgYWJicmV2aWF0ZSBzb21ldGhpbmcgZWxzZT9cbiAgICAgICAgICAgIGFiYnJldmlhdGVWYWx1ZXM6XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdBYmJyZXZpYXRlIENvbG9yIFZhbHVlcydcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0lmIHBvc3NpYmxlLCBhYmJyZXZpYXRlIGNvbG9yIHZhbHVlcywgbGlrZSBmb3IgZXhhbXBsZSDigJwwLjPigJ0gdG8g4oCcLjPigJ0sICDigJwjZmZmZmZm4oCdIHRvIOKAnCNmZmbigJ0gYW5kIOKAnHJnYigwLCAwLCAwKeKAnSB0byDigJxyZ2IoMCwwLDAp4oCdLidcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgIyBVcHBlcmNhc2UgY29sb3IgdmFsdWUgY29uZmlndXJhdGlvbjogVXBwZXJjYXNlIGZvciBleGFtcGxlIEhFWCBjb2xvciB2YWx1ZXNcbiAgICAgICAgICAgICMgVE9ETzogRG9lcyBpdCBtYWtlIHNlbnNlIHRvIHVwcGVyY2FzZSBhbnl0aGluZyBvdGhlciB0aGFuIEhFWCBjb2xvcnM/XG4gICAgICAgICAgICB1cHBlcmNhc2VDb2xvclZhbHVlczpcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1VwcGVyY2FzZSBDb2xvciBWYWx1ZXMnXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdJZiBzZW5zaWJsZSwgdXBwZXJjYXNlIHRoZSBjb2xvciB2YWx1ZS4gRm9yIGV4YW1wbGUsIOKAnCNhYWHigJ0gYmVjb21lcyDigJwjQUFB4oCdLidcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgIyBQcmVmZXJyZWQgY29sb3IgZm9ybWF0IGNvbmZpZ3VyYXRpb246IFNldCB3aGF0IGNvbG9yIGZvcm1hdCB0aGUgY29sb3IgcGlja2VyIHNob3VsZCBkaXNwbGF5IGluaXRpYWxseVxuICAgICAgICAgICAgcHJlZmVycmVkRm9ybWF0OlxuICAgICAgICAgICAgICAgIHRpdGxlOiAnUHJlZmVycmVkIENvbG9yIEZvcm1hdCdcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ09uIG9wZW4sIHRoZSBDb2xvciBQaWNrZXIgd2lsbCBzaG93IGEgY29sb3IgaW4gdGhpcyBmb3JtYXQuJ1xuICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgZW51bTogWydSR0InLCAnSEVYJywgJ0hTTCcsICdIU1YnLCAnVkVDJ11cbiAgICAgICAgICAgICAgICBkZWZhdWx0OiAnUkdCJ1xuICAgICAgICAgICAgIyBUcmlnZ2VyIGtleTogU2V0IHdoYXQgdHJpZ2dlciBrZXkgb3BlbnMgdGhlIGNvbG9yIHBpY2tlclxuICAgICAgICAgICAgIyBUT0RPIG1vcmUgb3B0aW9ucz9cbiAgICAgICAgICAgIHRyaWdnZXJLZXk6XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdUcmlnZ2VyIGtleSdcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0RlY2lkZSB3aGF0IHRyaWdnZXIga2V5IHNob3VsZCBvcGVuIHRoZSBDb2xvciBQaWNrZXIuIGBDTUQtU0hJRlQte1RSSUdHRVJfS0VZfWAgYW5kIGBDVFJMLUFMVC17VFJJR0dFUl9LRVl9YC4gUmVxdWlyZXMgYSByZXN0YXJ0LidcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgIGVudW06IFsnQycsICdFJywgJ0gnLCAnSyddXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogJ0MnXG4iXX0=
