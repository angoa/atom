(function() {
  var CompositeDisposable, IndentationManager;

  CompositeDisposable = require('atom').CompositeDisposable;

  IndentationManager = require('./indentation-manager');

  module.exports = {
    activate: function(state) {
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this._handleLoad(editor);
        };
      })(this)));
      this.disposables.add(atom.commands.add('atom-text-editor', 'auto-detect-indentation:show-indentation-selector', this.createIndentationListView));
      this.indentationListView = null;
      return this.indentationStatusView = null;
    },
    _handleLoad: function(editor) {
      var onSaveDisposable, onTokenizeDisposable, ref;
      this._attach(editor);
      onSaveDisposable = editor.buffer.onDidSave((function(_this) {
        return function() {
          var indentation;
          if (IndentationManager.isManuallyIndented(editor)) {
            return onSaveDisposable != null ? onSaveDisposable.dispose() : void 0;
          } else {
            indentation = IndentationManager.autoDetectIndentation(editor);
            return IndentationManager.setIndentation(editor, indentation, true);
          }
        };
      })(this));
      if ((ref = editor.buffer) != null ? ref.onDidTokenize : void 0) {
        onTokenizeDisposable = editor.buffer.onDidTokenize((function(_this) {
          return function() {
            _this._attach(editor);
            if (onTokenizeDisposable != null) {
              onTokenizeDisposable.dispose();
            }
            return onTokenizeDisposable = null;
          };
        })(this));
      } else {
        onTokenizeDisposable = null;
      }
      return editor.onDidDestroy(function() {
        if (onSaveDisposable != null) {
          onSaveDisposable.dispose();
        }
        return onTokenizeDisposable != null ? onTokenizeDisposable.dispose() : void 0;
      });
    },
    deactivate: function() {
      return this.disposables.dispose();
    },
    createIndentationListView: (function(_this) {
      return function() {
        var IndentationListView, indentationListView;
        if (_this.indentationListView == null) {
          IndentationListView = require('./indentation-list-view');
          indentationListView = new IndentationListView();
        }
        return indentationListView.toggle();
      };
    })(this),
    consumeStatusBar: function(statusBar) {
      var IndentationStatusView, indentationStatusView;
      if (this.IndentationStatusView == null) {
        IndentationStatusView = require('./indentation-status-view');
        indentationStatusView = new IndentationStatusView().initialize(statusBar);
      }
      return indentationStatusView.attach();
    },
    _attach: function(editor) {
      var indentation, originalSetSoftTabs, originalSetTabLength;
      originalSetSoftTabs = editor.setSoftTabs;
      originalSetTabLength = editor.setTabLength;
      editor.shouldUseSoftTabs = function() {
        return this.softTabs;
      };
      editor.setSoftTabs = function(softTabs) {
        var value;
        this.softTabs = softTabs;
        value = originalSetSoftTabs.call(editor, this.softTabs);
        this.emitter.emit('did-change-indentation');
        return value;
      };
      editor.setTabLength = function(tabLength) {
        var value;
        value = originalSetTabLength.call(editor, tabLength);
        this.emitter.emit('did-change-indentation');
        return value;
      };
      indentation = IndentationManager.autoDetectIndentation(editor);
      return IndentationManager.setIndentation(editor, indentation, true);
    },
    config: {
      showSpacingInStatusBar: {
        type: 'boolean',
        "default": true,
        title: 'Show spacing in status bar',
        description: 'Show current editor\'s spacing settings in status bar'
      },
      indentationTypes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            softTabs: {
              type: 'boolean'
            },
            tabLength: {
              type: 'integer'
            }
          }
        },
        "default": [
          {
            name: "2 Spaces",
            softTabs: true,
            tabLength: 2
          }, {
            name: "4 Spaces",
            softTabs: true,
            tabLength: 4
          }, {
            name: "8 Spaces",
            softTabs: true,
            tabLength: 8
          }, {
            name: "Tabs (default width)",
            softTabs: false
          }, {
            name: "Tabs (2 wide)",
            softTabs: false,
            tabLength: 2
          }, {
            name: "Tabs (4 wide)",
            softTabs: false,
            tabLength: 4
          }, {
            name: "Tabs (8 wide)",
            softTabs: false,
            tabLength: 8
          }
        ]
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL2F1dG8tZGV0ZWN0LWluZGVudGF0aW9uL2xpYi9hdXRvLWRldGVjdC1pbmRlbnRhdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHVCQUFSOztFQUVyQixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtpQkFDakQsS0FBQyxDQUFBLFdBQUQsQ0FBYSxNQUFiO1FBRGlEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUFqQjtNQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQXNDLG1EQUF0QyxFQUEyRixJQUFDLENBQUEseUJBQTVGLENBQWpCO01BRUEsSUFBQyxDQUFBLG1CQUFELEdBQXVCO2FBQ3ZCLElBQUMsQ0FBQSxxQkFBRCxHQUF5QjtJQVBqQixDQUFWO0lBU0EsV0FBQSxFQUFhLFNBQUMsTUFBRDtBQUNYLFVBQUE7TUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLE1BQVQ7TUFFQSxnQkFBQSxHQUFtQixNQUFNLENBQUMsTUFBTSxDQUFDLFNBQWQsQ0FBd0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ3pDLGNBQUE7VUFBQSxJQUFHLGtCQUFrQixDQUFDLGtCQUFuQixDQUFzQyxNQUF0QyxDQUFIOzhDQUNFLGdCQUFnQixDQUFFLE9BQWxCLENB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RTtVQUFBLElBQUEsRUFBTSxRQUFOO1VBQ0EsVUFBQSxFQUNFO1lBQUEsSUFBQSxFQUNFO2NBQUEsSUFBQSxFQUFNLFFBQU47YUFERjtZQUVBLFFBQUEsRUFDRTtjQUFBLElBQUEsRUFBTSxTQUFOO2FBSEY7WUFJQSxTQUFBLEVBQ0U7Y0FBQSxJQUFBLEVBQU0sU0FBTjthQUxGO1dBRkY7U0FGRjtRQVVBLENBQUEsT0FBQSxDQUFBLEVBQ0U7VUFDRTtZQUNFLElBQUEsRUFBTSxVQURSO1lBRUUsUUFBQSxFQUFVLElBRlo7WUFHRSxTQUFBLEVBQVcsQ0FIYjtXQURGLEVBTUU7WUFDRSxJQUFBLEVBQU0sVUFEUjtZQUVFLFFBQUEsRUFBVSxJQUZaO1lBR0UsU0FBQSxFQUFXLENBSGI7V0FORixFQVdFO1lBQ0UsSUFBQSxFQUFNLFVBRFI7WUFFRSxRQUFBLEVBQVUsSUFGWjtZQUdFLFNBQUEsRUFBVyxDQUhiO1dBWEYsRUFnQkU7WUFDRSxJQUFBLEVBQU0sc0JBRFI7WUFFRSxRQUFBLEVBQVUsS0FGWjtXQWhCRixFQW9CRTtZQUNFLElBQUEsRUFBTSxlQURSO1lBRUUsUUFBQSxFQUFVLEtBRlo7WUFHRSxTQUFBLEVBQVcsQ0FIYjtXQXBCRixFQXlCRTtZQUNFLElBQUEsRUFBTSxlQURSO1lBRUUsUUFBQSxFQUFVLEtBRlo7WUFHRSxTQUFBLEVBQVcsQ0FIYjtXQXpCRixFQThCRTtZQUNFLElBQUEsRUFBTSxlQURSO1lBRUUsUUFBQSxFQUFVLEtBRlo7WUFHRSxTQUFBLEVBQVcsQ0FIYjtXQTlCRjtTQVhGO09BTkY7S0F6RUY7O0FBSkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuSW5kZW50YXRpb25NYW5hZ2VyID0gcmVxdWlyZSAnLi9pbmRlbnRhdGlvbi1tYW5hZ2VyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgQF9oYW5kbGVMb2FkIGVkaXRvclxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnYXV0by1kZXRlY3QtaW5kZW50YXRpb246c2hvdy1pbmRlbnRhdGlvbi1zZWxlY3RvcicsIEBjcmVhdGVJbmRlbnRhdGlvbkxpc3RWaWV3KVxuXG4gICAgQGluZGVudGF0aW9uTGlzdFZpZXcgPSBudWxsXG4gICAgQGluZGVudGF0aW9uU3RhdHVzVmlldyA9IG51bGxcblxuICBfaGFuZGxlTG9hZDogKGVkaXRvcikgLT5cbiAgICBAX2F0dGFjaCBlZGl0b3JcblxuICAgIG9uU2F2ZURpc3Bvc2FibGUgPSBlZGl0b3IuYnVmZmVyLm9uRGlkU2F2ZSA9PlxuICAgICAgaWYgSW5kZW50YXRpb25NYW5hZ2VyLmlzTWFudWFsbHlJbmRlbnRlZCBlZGl0b3JcbiAgICAgICAgb25TYXZlRGlzcG9zYWJsZT8uZGlzcG9zZSgpXG4gICAgICBlbHNlXG4gICAgICAgIGluZGVudGF0aW9uID0gSW5kZW50YXRpb25NYW5hZ2VyLmF1dG9EZXRlY3RJbmRlbnRhdGlvbiBlZGl0b3JcbiAgICAgICAgSW5kZW50YXRpb25NYW5hZ2VyLnNldEluZGVudGF0aW9uIGVkaXRvciwgaW5kZW50YXRpb24sIHRydWVcblxuICAgIGlmIGVkaXRvci5idWZmZXI/Lm9uRGlkVG9rZW5pemVcbiAgICAgIG9uVG9rZW5pemVEaXNwb3NhYmxlID0gZWRpdG9yLmJ1ZmZlci5vbkRpZFRva2VuaXplID0+XG4gICAgICAgICMgVGhpcyBldmVudCBmaXJlcyB3aGVuIHRoZSBncmFtbWFyIGlzIGZpcnN0IGxvYWRlZC5cbiAgICAgICAgIyBXZSByZS1hbmFseXplIHRoZSBmaWxlJ3MgaW5kZW50YXRpb24sIGluIG9yZGVyIHRvIGlnbm9yZSBpbmRlbnRhdGlvbiBpbnNpZGUgY29tbWVudHNcbiAgICAgICAgQF9hdHRhY2ggZWRpdG9yXG4gICAgICAgIG9uVG9rZW5pemVEaXNwb3NhYmxlPy5kaXNwb3NlKClcbiAgICAgICAgb25Ub2tlbml6ZURpc3Bvc2FibGUgPSBudWxsXG4gICAgZWxzZVxuICAgICAgb25Ub2tlbml6ZURpc3Bvc2FibGUgPSBudWxsXG5cbiAgICBlZGl0b3Iub25EaWREZXN0cm95IC0+XG4gICAgICBvblNhdmVEaXNwb3NhYmxlPy5kaXNwb3NlKClcbiAgICAgIG9uVG9rZW5pemVEaXNwb3NhYmxlPy5kaXNwb3NlKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICBjcmVhdGVJbmRlbnRhdGlvbkxpc3RWaWV3OiA9PlxuICAgIHVubGVzcyBAaW5kZW50YXRpb25MaXN0Vmlldz9cbiAgICAgIEluZGVudGF0aW9uTGlzdFZpZXcgPSByZXF1aXJlICcuL2luZGVudGF0aW9uLWxpc3QtdmlldydcbiAgICAgIGluZGVudGF0aW9uTGlzdFZpZXcgPSBuZXcgSW5kZW50YXRpb25MaXN0VmlldygpXG4gICAgaW5kZW50YXRpb25MaXN0Vmlldy50b2dnbGUoKVxuXG4gIGNvbnN1bWVTdGF0dXNCYXI6IChzdGF0dXNCYXIpIC0+XG4gICAgdW5sZXNzIEBJbmRlbnRhdGlvblN0YXR1c1ZpZXc/XG4gICAgICBJbmRlbnRhdGlvblN0YXR1c1ZpZXcgPSByZXF1aXJlICcuL2luZGVudGF0aW9uLXN0YXR1cy12aWV3J1xuICAgICAgaW5kZW50YXRpb25TdGF0dXNWaWV3ID0gbmV3IEluZGVudGF0aW9uU3RhdHVzVmlldygpLmluaXRpYWxpemUoc3RhdHVzQmFyKVxuICAgIGluZGVudGF0aW9uU3RhdHVzVmlldy5hdHRhY2goKVxuXG4gIF9hdHRhY2g6IChlZGl0b3IpIC0+XG4gICAgb3JpZ2luYWxTZXRTb2Z0VGFicyA9IGVkaXRvci5zZXRTb2Z0VGFic1xuICAgIG9yaWdpbmFsU2V0VGFiTGVuZ3RoID0gZWRpdG9yLnNldFRhYkxlbmd0aFxuXG4gICAgIyBEaXNhYmxlIGF0b20ncyBuYXRpdmUgZGV0ZWN0aW9uIG9mIHNwYWNlcy90YWJzXG4gICAgZWRpdG9yLnNob3VsZFVzZVNvZnRUYWJzID0gLT5cbiAgICAgIEBzb2Z0VGFic1xuXG4gICAgIyBUcmlnZ2VyIFwiZGlkLWNoYW5nZS1pbmRlbnRhdGlvblwiIGV2ZW50IHdoZW4gaW5kZW50YXRpb24gaXMgY2hhbmdlZFxuICAgIGVkaXRvci5zZXRTb2Z0VGFicyA9IChAc29mdFRhYnMpIC0+XG4gICAgICAjIGFub3RoZXIgbGluZVxuICAgICAgdmFsdWUgPSBvcmlnaW5hbFNldFNvZnRUYWJzLmNhbGwoZWRpdG9yLCBAc29mdFRhYnMpXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtY2hhbmdlLWluZGVudGF0aW9uJ1xuICAgICAgdmFsdWVcblxuICAgICMgVHJpZ2dlciBcImRpZC1jaGFuZ2UtaW5kZW50YXRpb25cIiBldmVudCB3aGVuIGluZGVudGF0aW9uIGlzIGNoYW5nZWRcbiAgICBlZGl0b3Iuc2V0VGFiTGVuZ3RoID0gKHRhYkxlbmd0aCkgLT5cbiAgICAgIHZhbHVlID0gb3JpZ2luYWxTZXRUYWJMZW5ndGguY2FsbChlZGl0b3IsIHRhYkxlbmd0aClcbiAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1jaGFuZ2UtaW5kZW50YXRpb24nXG4gICAgICB2YWx1ZVxuXG4gICAgaW5kZW50YXRpb24gPSBJbmRlbnRhdGlvbk1hbmFnZXIuYXV0b0RldGVjdEluZGVudGF0aW9uIGVkaXRvclxuICAgIEluZGVudGF0aW9uTWFuYWdlci5zZXRJbmRlbnRhdGlvbiBlZGl0b3IsIGluZGVudGF0aW9uLCB0cnVlXG5cbiAgY29uZmlnOlxuICAgIHNob3dTcGFjaW5nSW5TdGF0dXNCYXI6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIHRpdGxlOiAnU2hvdyBzcGFjaW5nIGluIHN0YXR1cyBiYXInXG4gICAgICBkZXNjcmlwdGlvbjogJ1Nob3cgY3VycmVudCBlZGl0b3JcXCdzIHNwYWNpbmcgc2V0dGluZ3MgaW4gc3RhdHVzIGJhcidcbiAgICBpbmRlbnRhdGlvblR5cGVzOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgICAgbmFtZTpcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgc29mdFRhYnM6XG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICB0YWJMZW5ndGg6XG4gICAgICAgICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiBcIjIgU3BhY2VzXCJcbiAgICAgICAgICAgIHNvZnRUYWJzOiB0cnVlXG4gICAgICAgICAgICB0YWJMZW5ndGg6IDJcbiAgICAgICAgICB9XG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCI0IFNwYWNlc1wiXG4gICAgICAgICAgICBzb2Z0VGFiczogdHJ1ZVxuICAgICAgICAgICAgdGFiTGVuZ3RoOiA0XG4gICAgICAgICAgfVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6IFwiOCBTcGFjZXNcIlxuICAgICAgICAgICAgc29mdFRhYnM6IHRydWVcbiAgICAgICAgICAgIHRhYkxlbmd0aDogOFxuICAgICAgICAgIH1cbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiBcIlRhYnMgKGRlZmF1bHQgd2lkdGgpXCJcbiAgICAgICAgICAgIHNvZnRUYWJzOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiBcIlRhYnMgKDIgd2lkZSlcIlxuICAgICAgICAgICAgc29mdFRhYnM6IGZhbHNlXG4gICAgICAgICAgICB0YWJMZW5ndGg6IDJcbiAgICAgICAgICB9XG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCJUYWJzICg0IHdpZGUpXCJcbiAgICAgICAgICAgIHNvZnRUYWJzOiBmYWxzZVxuICAgICAgICAgICAgdGFiTGVuZ3RoOiA0XG4gICAgICAgICAgfVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6IFwiVGFicyAoOCB3aWRlKVwiXG4gICAgICAgICAgICBzb2Z0VGFiczogZmFsc2VcbiAgICAgICAgICAgIHRhYkxlbmd0aDogOFxuICAgICAgICAgIH1cbiAgICAgICAgXVxuIl19
