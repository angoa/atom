(function() {
  var $, Config, Files, Fs, SavePrompt;

  $ = require('atom-space-pen-views').$;

  Fs = require('fs');

  Config = require('./config');

  Files = require('./files');

  SavePrompt = require('./save-prompt');

  module.exports = {
    config: {
      restoreOpenFileContents: {
        type: 'boolean',
        "default": true,
        description: 'Restore the contents of files that were unsaved in the last session'
      },
      skipSavePrompt: {
        type: 'boolean',
        "default": true,
        description: 'Disable the save on exit prompt'
      },
      extraDelay: {
        type: 'integer',
        "default": 500,
        description: "Add an extra delay time in ms for auto saving files after typing."
      },
      dataSaveFolder: {
        type: 'string',
        description: 'The folder in which to save project states'
      }
    },
    activate: function(state) {
      if (Config.saveFolder() == null) {
        Config.saveFolderDefault();
      }
      SavePrompt.activate();
      return Files.activate();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3NhdmUtc2Vzc2lvbi9saWIvc2F2ZS1zZXNzaW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsSUFBSyxPQUFBLENBQVEsc0JBQVI7O0VBQ04sRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7RUFDVCxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0VBQ1IsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBRUU7SUFBQSxNQUFBLEVBQ0U7TUFBQSx1QkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEscUVBRmI7T0FERjtNQUlBLGNBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLGlDQUZiO09BTEY7TUFRQSxVQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsR0FEVDtRQUVBLFdBQUEsRUFBYSxtRUFGYjtPQVRGO01BWUEsY0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxXQUFBLEVBQWEsNENBRGI7T0FiRjtLQURGO0lBaUJBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFFUixJQUFPLDJCQUFQO1FBQ0UsTUFBTSxDQUFDLGlCQUFQLENBQUEsRUFERjs7TUFJQSxVQUFVLENBQUMsUUFBWCxDQUFBO2FBQ0EsS0FBSyxDQUFDLFFBQU4sQ0FBQTtJQVBRLENBakJWOztBQVJGIiwic291cmNlc0NvbnRlbnQiOlsieyR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5GcyA9IHJlcXVpcmUgJ2ZzJ1xuQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcnXG5GaWxlcyA9IHJlcXVpcmUgJy4vZmlsZXMnXG5TYXZlUHJvbXB0ID0gcmVxdWlyZSAnLi9zYXZlLXByb21wdCdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gIGNvbmZpZzpcbiAgICByZXN0b3JlT3BlbkZpbGVDb250ZW50czpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246ICdSZXN0b3JlIHRoZSBjb250ZW50cyBvZiBmaWxlcyB0aGF0IHdlcmUgdW5zYXZlZCBpbiB0aGUgbGFzdCBzZXNzaW9uJ1xuICAgIHNraXBTYXZlUHJvbXB0OlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogJ0Rpc2FibGUgdGhlIHNhdmUgb24gZXhpdCBwcm9tcHQnXG4gICAgZXh0cmFEZWxheTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogNTAwXG4gICAgICBkZXNjcmlwdGlvbjogXCJBZGQgYW4gZXh0cmEgZGVsYXkgdGltZSBpbiBtcyBmb3IgYXV0byBzYXZpbmcgZmlsZXMgYWZ0ZXIgdHlwaW5nLlwiXG4gICAgZGF0YVNhdmVGb2xkZXI6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgZm9sZGVyIGluIHdoaWNoIHRvIHNhdmUgcHJvamVjdCBzdGF0ZXMnXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICAjIERlZmF1bHQgc2V0dGluZ3MgdGhhdCBjb3VsZG4ndCBiZSBzZXQgdXAgdG9wLlxuICAgIGlmIG5vdCBDb25maWcuc2F2ZUZvbGRlcigpP1xuICAgICAgQ29uZmlnLnNhdmVGb2xkZXJEZWZhdWx0KClcblxuICAgICMgQWN0aXZhdGUgZXZlcnl0aGluZ1xuICAgIFNhdmVQcm9tcHQuYWN0aXZhdGUoKVxuICAgIEZpbGVzLmFjdGl2YXRlKClcbiJdfQ==
