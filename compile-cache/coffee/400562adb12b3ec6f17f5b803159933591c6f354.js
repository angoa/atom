(function() {
  var CompositeDisposable, Disposable, FileIcons, path, ref;

  ref = require('event-kit'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  path = require('path');

  FileIcons = require('./file-icons');

  module.exports = {
    treeView: null,
    activate: function(state) {
      var base;
      this.state = state;
      this.disposables = new CompositeDisposable;
      if (this.shouldAttach()) {
        if ((base = this.state).attached == null) {
          base.attached = true;
        }
      }
      if (this.state.attached) {
        this.createView();
      }
      return this.disposables.add(atom.commands.add('atom-workspace', {
        'tree-view:show': (function(_this) {
          return function() {
            return _this.createView().show();
          };
        })(this),
        'tree-view:toggle': (function(_this) {
          return function() {
            return _this.createView().toggle();
          };
        })(this),
        'tree-view:toggle-focus': (function(_this) {
          return function() {
            return _this.createView().toggleFocus();
          };
        })(this),
        'tree-view:reveal-active-file': (function(_this) {
          return function() {
            return _this.createView().revealActiveFile();
          };
        })(this),
        'tree-view:toggle-side': (function(_this) {
          return function() {
            return _this.createView().toggleSide();
          };
        })(this),
        'tree-view:add-file': (function(_this) {
          return function() {
            return _this.createView().add(true);
          };
        })(this),
        'tree-view:add-folder': (function(_this) {
          return function() {
            return _this.createView().add(false);
          };
        })(this),
        'tree-view:duplicate': (function(_this) {
          return function() {
            return _this.createView().copySelectedEntry();
          };
        })(this),
        'tree-view:remove': (function(_this) {
          return function() {
            return _this.createView().removeSelectedEntries();
          };
        })(this),
        'tree-view:rename': (function(_this) {
          return function() {
            return _this.createView().moveSelectedEntry();
          };
        })(this),
        'tree-view:show-current-file-in-file-manager': (function(_this) {
          return function() {
            return _this.createView().showCurrentFileInFileManager();
          };
        })(this)
      }));
    },
    deactivate: function() {
      var ref1, ref2;
      this.disposables.dispose();
      if ((ref1 = this.fileIconsDisposable) != null) {
        ref1.dispose();
      }
      if ((ref2 = this.treeView) != null) {
        ref2.deactivate();
      }
      return this.treeView = null;
    },
    consumeFileIcons: function(service) {
      var ref1;
      FileIcons.setService(service);
      if ((ref1 = this.treeView) != null) {
        ref1.updateRoots();
      }
      return new Disposable((function(_this) {
        return function() {
          var ref2;
          FileIcons.resetService();
          return (ref2 = _this.treeView) != null ? ref2.updateRoots() : void 0;
        };
      })(this));
    },
    serialize: function() {
      if (this.treeView != null) {
        return this.treeView.serialize();
      } else {
        return this.state;
      }
    },
    createView: function() {
      var TreeView;
      if (this.treeView == null) {
        TreeView = require('./tree-view');
        this.treeView = new TreeView(this.state);
      }
      return this.treeView;
    },
    shouldAttach: function() {
      var projectPath, ref1;
      projectPath = (ref1 = atom.project.getPaths()[0]) != null ? ref1 : '';
      if (atom.workspace.getActivePaneItem()) {
        return false;
      } else if (path.basename(projectPath) === '.git') {
        return projectPath === atom.getLoadSettings().pathToOpen;
      } else {
        return true;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3RyZWUtdmlldy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQW9DLE9BQUEsQ0FBUSxXQUFSLENBQXBDLEVBQUMsMkJBQUQsRUFBYTs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSOztFQUVaLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsSUFBVjtJQUVBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7QUFDUixVQUFBO01BRFMsSUFBQyxDQUFBLFFBQUQ7TUFDVCxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBMkIsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUEzQjs7Y0FBTSxDQUFDLFdBQVk7U0FBbkI7O01BRUEsSUFBaUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUF4QjtRQUFBLElBQUMsQ0FBQSxVQUFELENBQUEsRUFBQTs7YUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUNuRCxnQkFBQSxFQUFrQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxVQUFELENBQUEsQ0FBYSxDQUFDLElBQWQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURpQztRQUVuRCxrQkFBQSxFQUFvQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxVQUFELENBQUEsQ0FBYSxDQUFDLE1BQWQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUYrQjtRQUduRCx3QkFBQSxFQUEwQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtB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QSxZQUFBLEVBQWMsU0FBQTtBQUNaLFVBQUE7TUFBQSxXQUFBLHdEQUEyQztNQUMzQyxJQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWYsQ0FBQSxDQUFIO2VBQ0UsTUFERjtPQUFBLE1BRUssSUFBRyxJQUFJLENBQUMsUUFBTCxDQUFjLFdBQWQsQ0FBQSxLQUE4QixNQUFqQztlQUlILFdBQUEsS0FBZSxJQUFJLENBQUMsZUFBTCxDQUFBLENBQXNCLENBQUMsV0FKbkM7T0FBQSxNQUFBO2VBTUgsS0FORzs7SUFKTyxDQS9DZDs7QUFORiIsInNvdXJjZXNDb250ZW50IjpbIntEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2V2ZW50LWtpdCdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5GaWxlSWNvbnMgPSByZXF1aXJlICcuL2ZpbGUtaWNvbnMnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgdHJlZVZpZXc6IG51bGxcblxuICBhY3RpdmF0ZTogKEBzdGF0ZSkgLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdGF0ZS5hdHRhY2hlZCA/PSB0cnVlIGlmIEBzaG91bGRBdHRhY2goKVxuXG4gICAgQGNyZWF0ZVZpZXcoKSBpZiBAc3RhdGUuYXR0YWNoZWRcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ3RyZWUtdmlldzpzaG93JzogPT4gQGNyZWF0ZVZpZXcoKS5zaG93KClcbiAgICAgICd0cmVlLXZpZXc6dG9nZ2xlJzogPT4gQGNyZWF0ZVZpZXcoKS50b2dnbGUoKVxuICAgICAgJ3RyZWUtdmlldzp0b2dnbGUtZm9jdXMnOiA9PiBAY3JlYXRlVmlldygpLnRvZ2dsZUZvY3VzKClcbiAgICAgICd0cmVlLXZpZXc6cmV2ZWFsLWFjdGl2ZS1maWxlJzogPT4gQGNyZWF0ZVZpZXcoKS5yZXZlYWxBY3RpdmVGaWxlKClcbiAgICAgICd0cmVlLXZpZXc6dG9nZ2xlLXNpZGUnOiA9PiBAY3JlYXRlVmlldygpLnRvZ2dsZVNpZGUoKVxuICAgICAgJ3RyZWUtdmlldzphZGQtZmlsZSc6ID0+IEBjcmVhdGVWaWV3KCkuYWRkKHRydWUpXG4gICAgICAndHJlZS12aWV3OmFkZC1mb2xkZXInOiA9PiBAY3JlYXRlVmlldygpLmFkZChmYWxzZSlcbiAgICAgICd0cmVlLXZpZXc6ZHVwbGljYXRlJzogPT4gQGNyZWF0ZVZpZXcoKS5jb3B5U2VsZWN0ZWRFbnRyeSgpXG4gICAgICAndHJlZS12aWV3OnJlbW92ZSc6ID0+IEBjcmVhdGVWaWV3KCkucmVtb3ZlU2VsZWN0ZWRFbnRyaWVzKClcbiAgICAgICd0cmVlLXZpZXc6cmVuYW1lJzogPT4gQGNyZWF0ZVZpZXcoKS5tb3ZlU2VsZWN0ZWRFbnRyeSgpXG4gICAgICAndHJlZS12aWV3OnNob3ctY3VycmVudC1maWxlLWluLWZpbGUtbWFuYWdlcic6ID0+IEBjcmVhdGVWaWV3KCkuc2hvd0N1cnJlbnRGaWxlSW5GaWxlTWFuYWdlcigpXG4gICAgfSlcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAZmlsZUljb25zRGlzcG9zYWJsZT8uZGlzcG9zZSgpXG4gICAgQHRyZWVWaWV3Py5kZWFjdGl2YXRlKClcbiAgICBAdHJlZVZpZXcgPSBudWxsXG5cbiAgY29uc3VtZUZpbGVJY29uczogKHNlcnZpY2UpIC0+XG4gICAgRmlsZUljb25zLnNldFNlcnZpY2Uoc2VydmljZSlcbiAgICBAdHJlZVZpZXc/LnVwZGF0ZVJvb3RzKClcbiAgICBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgRmlsZUljb25zLnJlc2V0U2VydmljZSgpXG4gICAgICBAdHJlZVZpZXc/LnVwZGF0ZVJvb3RzKClcblxuICBzZXJpYWxpemU6IC0+XG4gICAgaWYgQHRyZWVWaWV3P1xuICAgICAgQHRyZWVWaWV3LnNlcmlhbGl6ZSgpXG4gICAgZWxzZVxuICAgICAgQHN0YXRlXG5cbiAgY3JlYXRlVmlldzogLT5cbiAgICB1bmxlc3MgQHRyZWVWaWV3P1xuICAgICAgVHJlZVZpZXcgPSByZXF1aXJlICcuL3RyZWUtdmlldydcbiAgICAgIEB0cmVlVmlldyA9IG5ldyBUcmVlVmlldyhAc3RhdGUpXG4gICAgQHRyZWVWaWV3XG5cbiAgc2hvdWxkQXR0YWNoOiAtPlxuICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF0gPyAnJ1xuICAgIGlmIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKClcbiAgICAgIGZhbHNlXG4gICAgZWxzZSBpZiBwYXRoLmJhc2VuYW1lKHByb2plY3RQYXRoKSBpcyAnLmdpdCdcbiAgICAgICMgT25seSBhdHRhY2ggd2hlbiB0aGUgcHJvamVjdCBwYXRoIG1hdGNoZXMgdGhlIHBhdGggdG8gb3BlbiBzaWduaWZ5aW5nXG4gICAgICAjIHRoZSAuZ2l0IGZvbGRlciB3YXMgb3BlbmVkIGV4cGxpY2l0bHkgYW5kIG5vdCBieSB1c2luZyBBdG9tIGFzIHRoZSBHaXRcbiAgICAgICMgZWRpdG9yLlxuICAgICAgcHJvamVjdFBhdGggaXMgYXRvbS5nZXRMb2FkU2V0dGluZ3MoKS5wYXRoVG9PcGVuXG4gICAgZWxzZVxuICAgICAgdHJ1ZVxuIl19
