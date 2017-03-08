(function() {
  var CompositeDisposable, Directory, DirectoryElement, DirectoryView, FileView, repoForPath,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  Directory = require('./directory');

  FileView = require('./file-view');

  repoForPath = require('./helpers').repoForPath;

  DirectoryView = (function(superClass) {
    extend(DirectoryView, superClass);

    function DirectoryView() {
      return DirectoryView.__super__.constructor.apply(this, arguments);
    }

    DirectoryView.prototype.initialize = function(directory) {
      var iconClass, ref, squashedDirectoryNameNode;
      this.directory = directory;
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(this.directory.onDidDestroy((function(_this) {
        return function() {
          return _this.subscriptions.dispose();
        };
      })(this)));
      this.subscribeToDirectory();
      this.classList.add('directory', 'entry', 'list-nested-item', 'collapsed');
      this.header = document.createElement('div');
      this.header.classList.add('header', 'list-item');
      this.directoryName = document.createElement('span');
      this.directoryName.classList.add('name', 'icon');
      this.entries = document.createElement('ol');
      this.entries.classList.add('entries', 'list-tree');
      if (this.directory.symlink) {
        iconClass = 'icon-file-symlink-directory';
      } else {
        iconClass = 'icon-file-directory';
        if (this.directory.isRoot) {
          if ((ref = repoForPath(this.directory.path)) != null ? ref.isProjectAtRoot() : void 0) {
            iconClass = 'icon-repo';
          }
        } else {
          if (this.directory.submodule) {
            iconClass = 'icon-file-submodule';
          }
        }
      }
      this.directoryName.classList.add(iconClass);
      this.directoryName.dataset.path = this.directory.path;
      if (this.directory.squashedNames != null) {
        this.directoryName.dataset.name = this.directory.squashedNames.join('');
        this.directoryName.title = this.directory.squashedNames.join('');
        squashedDirectoryNameNode = document.createElement('span');
        squashedDirectoryNameNode.classList.add('squashed-dir');
        squashedDirectoryNameNode.textContent = this.directory.squashedNames[0];
        this.directoryName.appendChild(squashedDirectoryNameNode);
        this.directoryName.appendChild(document.createTextNode(this.directory.squashedNames[1]));
      } else {
        this.directoryName.dataset.name = this.directory.name;
        this.directoryName.title = this.directory.name;
        this.directoryName.textContent = this.directory.name;
      }
      this.appendChild(this.header);
      this.header.appendChild(this.directoryName);
      this.appendChild(this.entries);
      if (this.directory.isRoot) {
        this.classList.add('project-root');
        this.header.classList.add('project-root-header');
      } else {
        this.draggable = true;
        this.subscriptions.add(this.directory.onDidStatusChange((function(_this) {
          return function() {
            return _this.updateStatus();
          };
        })(this)));
        this.updateStatus();
      }
      if (this.directory.expansionState.isExpanded) {
        return this.expand();
      }
    };

    DirectoryView.prototype.updateStatus = function() {
      this.classList.remove('status-ignored', 'status-modified', 'status-added');
      if (this.directory.status != null) {
        return this.classList.add("status-" + this.directory.status);
      }
    };

    DirectoryView.prototype.subscribeToDirectory = function() {
      return this.subscriptions.add(this.directory.onDidAddEntries((function(_this) {
        return function(addedEntries) {
          var entry, i, insertionIndex, len, numberOfEntries, results, view;
          if (!_this.isExpanded) {
            return;
          }
          numberOfEntries = _this.entries.children.length;
          results = [];
          for (i = 0, len = addedEntries.length; i < len; i++) {
            entry = addedEntries[i];
            view = _this.createViewForEntry(entry);
            insertionIndex = entry.indexInParentDirectory;
            if (insertionIndex < numberOfEntries) {
              _this.entries.insertBefore(view, _this.entries.children[insertionIndex]);
            } else {
              _this.entries.appendChild(view);
            }
            results.push(numberOfEntries++);
          }
          return results;
        };
      })(this)));
    };

    DirectoryView.prototype.getPath = function() {
      return this.directory.path;
    };

    DirectoryView.prototype.isPathEqual = function(pathToCompare) {
      return this.directory.isPathEqual(pathToCompare);
    };

    DirectoryView.prototype.createViewForEntry = function(entry) {
      var subscription, view;
      if (entry instanceof Directory) {
        view = new DirectoryElement();
      } else {
        view = new FileView();
      }
      view.initialize(entry);
      subscription = this.directory.onDidRemoveEntries(function(removedEntries) {
        var removedEntry, removedName, results;
        results = [];
        for (removedName in removedEntries) {
          removedEntry = removedEntries[removedName];
          if (!(entry === removedEntry)) {
            continue;
          }
          view.remove();
          subscription.dispose();
          break;
        }
        return results;
      });
      this.subscriptions.add(subscription);
      return view;
    };

    DirectoryView.prototype.reload = function() {
      if (this.isExpanded) {
        return this.directory.reload();
      }
    };

    DirectoryView.prototype.toggleExpansion = function(isRecursive) {
      if (isRecursive == null) {
        isRecursive = false;
      }
      if (this.isExpanded) {
        return this.collapse(isRecursive);
      } else {
        return this.expand(isRecursive);
      }
    };

    DirectoryView.prototype.expand = function(isRecursive) {
      var entry, i, len, ref;
      if (isRecursive == null) {
        isRecursive = false;
      }
      if (!this.isExpanded) {
        this.isExpanded = true;
        this.classList.add('expanded');
        this.classList.remove('collapsed');
        this.directory.expand();
      }
      if (isRecursive) {
        ref = this.entries.children;
        for (i = 0, len = ref.length; i < len; i++) {
          entry = ref[i];
          if (entry instanceof DirectoryView) {
            entry.expand(true);
          }
        }
      }
      return false;
    };

    DirectoryView.prototype.collapse = function(isRecursive) {
      var entry, i, len, ref;
      if (isRecursive == null) {
        isRecursive = false;
      }
      this.isExpanded = false;
      if (isRecursive) {
        ref = this.entries.children;
        for (i = 0, len = ref.length; i < len; i++) {
          entry = ref[i];
          if (entry.isExpanded) {
            entry.collapse(true);
          }
        }
      }
      this.classList.remove('expanded');
      this.classList.add('collapsed');
      this.directory.collapse();
      return this.entries.innerHTML = '';
    };

    return DirectoryView;

  })(HTMLElement);

  DirectoryElement = document.registerElement('tree-view-directory', {
    prototype: DirectoryView.prototype,
    "extends": 'li'
  });

  module.exports = DirectoryElement;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3RyZWUtdmlldy9saWIvZGlyZWN0b3J5LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxzRkFBQTtJQUFBOzs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLFdBQVI7O0VBQ3hCLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7RUFDWixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1YsY0FBZSxPQUFBLENBQVEsV0FBUjs7RUFFVjs7Ozs7Ozs0QkFDSixVQUFBLEdBQVksU0FBQyxTQUFEO0FBQ1YsVUFBQTtNQURXLElBQUMsQ0FBQSxZQUFEO01BQ1gsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxtQkFBQSxDQUFBO01BQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBd0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCLENBQW5CO01BQ0EsSUFBQyxDQUFBLG9CQUFELENBQUE7TUFFQSxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxXQUFmLEVBQTRCLE9BQTVCLEVBQXNDLGtCQUF0QyxFQUEyRCxXQUEzRDtNQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDVixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFsQixDQUFzQixRQUF0QixFQUFnQyxXQUFoQztNQUVBLElBQUMsQ0FBQSxhQUFELEdBQWlCLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCO01BQ2pCLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQXpCLENBQTZCLE1BQTdCLEVBQXFDLE1B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RCxLQUFLLENBQUMsTUFBTixDQUFhLElBQWI7O0FBREYsU0FERjs7YUFJQTtJQVhNOzs0QkFhUixRQUFBLEdBQVUsU0FBQyxXQUFEO0FBQ1IsVUFBQTs7UUFEUyxjQUFZOztNQUNyQixJQUFDLENBQUEsVUFBRCxHQUFjO01BRWQsSUFBRyxXQUFIO0FBQ0U7QUFBQSxhQUFBLHFDQUFBOztjQUFvQyxLQUFLLENBQUM7WUFDeEMsS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFmOztBQURGLFNBREY7O01BSUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLFVBQWxCO01BQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsV0FBZjtNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsUUFBWCxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCO0lBVmI7Ozs7S0FySGdCOztFQWlJNUIsZ0JBQUEsR0FBbUIsUUFBUSxDQUFDLGVBQVQsQ0FBeUIscUJBQXpCLEVBQWdEO0lBQUEsU0FBQSxFQUFXLGFBQWEsQ0FBQyxTQUF6QjtJQUFvQyxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBQTdDO0dBQWhEOztFQUNuQixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXZJakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdldmVudC1raXQnXG5EaXJlY3RvcnkgPSByZXF1aXJlICcuL2RpcmVjdG9yeSdcbkZpbGVWaWV3ID0gcmVxdWlyZSAnLi9maWxlLXZpZXcnXG57cmVwb0ZvclBhdGh9ID0gcmVxdWlyZSAnLi9oZWxwZXJzJ1xuXG5jbGFzcyBEaXJlY3RvcnlWaWV3IGV4dGVuZHMgSFRNTEVsZW1lbnRcbiAgaW5pdGlhbGl6ZTogKEBkaXJlY3RvcnkpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBkaXJlY3Rvcnkub25EaWREZXN0cm95ID0+IEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpYmVUb0RpcmVjdG9yeSgpXG5cbiAgICBAY2xhc3NMaXN0LmFkZCgnZGlyZWN0b3J5JywgJ2VudHJ5JywgICdsaXN0LW5lc3RlZC1pdGVtJywgICdjb2xsYXBzZWQnKVxuXG4gICAgQGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgQGhlYWRlci5jbGFzc0xpc3QuYWRkKCdoZWFkZXInLCAnbGlzdC1pdGVtJylcblxuICAgIEBkaXJlY3RvcnlOYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgQGRpcmVjdG9yeU5hbWUuY2xhc3NMaXN0LmFkZCgnbmFtZScsICdpY29uJylcblxuICAgIEBlbnRyaWVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2wnKVxuICAgIEBlbnRyaWVzLmNsYXNzTGlzdC5hZGQoJ2VudHJpZXMnLCAnbGlzdC10cmVlJylcblxuICAgIGlmIEBkaXJlY3Rvcnkuc3ltbGlua1xuICAgICAgaWNvbkNsYXNzID0gJ2ljb24tZmlsZS1zeW1saW5rLWRpcmVjdG9yeSdcbiAgICBlbHNlXG4gICAgICBpY29uQ2xhc3MgPSAnaWNvbi1maWxlLWRpcmVjdG9yeSdcbiAgICAgIGlmIEBkaXJlY3RvcnkuaXNSb290XG4gICAgICAgIGljb25DbGFzcyA9ICdpY29uLXJlcG8nIGlmIHJlcG9Gb3JQYXRoKEBkaXJlY3RvcnkucGF0aCk/LmlzUHJvamVjdEF0Um9vdCgpXG4gICAgICBlbHNlXG4gICAgICAgIGljb25DbGFzcyA9ICdpY29uLWZpbGUtc3VibW9kdWxlJyBpZiBAZGlyZWN0b3J5LnN1Ym1vZHVsZVxuICAgIEBkaXJlY3RvcnlOYW1lLmNsYXNzTGlzdC5hZGQoaWNvbkNsYXNzKVxuICAgIEBkaXJlY3RvcnlOYW1lLmRhdGFzZXQucGF0aCA9IEBkaXJlY3RvcnkucGF0aFxuXG4gICAgaWYgQGRpcmVjdG9yeS5zcXVhc2hlZE5hbWVzP1xuICAgICAgQGRpcmVjdG9yeU5hbWUuZGF0YXNldC5uYW1lID0gQGRpcmVjdG9yeS5zcXVhc2hlZE5hbWVzLmpvaW4oJycpXG4gICAgICBAZGlyZWN0b3J5TmFtZS50aXRsZSA9IEBkaXJlY3Rvcnkuc3F1YXNoZWROYW1lcy5qb2luKCcnKVxuICAgICAgc3F1YXNoZWREaXJlY3RvcnlOYW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgc3F1YXNoZWREaXJlY3RvcnlOYW1lTm9kZS5jbGFzc0xpc3QuYWRkKCdzcXVhc2hlZC1kaXInKVxuICAgICAgc3F1YXNoZWREaXJlY3RvcnlOYW1lTm9kZS50ZXh0Q29udGVudCA9IEBkaXJlY3Rvcnkuc3F1YXNoZWROYW1lc1swXVxuICAgICAgQGRpcmVjdG9yeU5hbWUuYXBwZW5kQ2hpbGQoc3F1YXNoZWREaXJlY3RvcnlOYW1lTm9kZSlcbiAgICAgIEBkaXJlY3RvcnlOYW1lLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKEBkaXJlY3Rvcnkuc3F1YXNoZWROYW1lc1sxXSkpXG4gICAgZWxzZVxuICAgICAgQGRpcmVjdG9yeU5hbWUuZGF0YXNldC5uYW1lID0gQGRpcmVjdG9yeS5uYW1lXG4gICAgICBAZGlyZWN0b3J5TmFtZS50aXRsZSA9IEBkaXJlY3RvcnkubmFtZVxuICAgICAgQGRpcmVjdG9yeU5hbWUudGV4dENvbnRlbnQgPSBAZGlyZWN0b3J5Lm5hbWVcblxuICAgIEBhcHBlbmRDaGlsZChAaGVhZGVyKVxuICAgIEBoZWFkZXIuYXBwZW5kQ2hpbGQoQGRpcmVjdG9yeU5hbWUpXG4gICAgQGFwcGVuZENoaWxkKEBlbnRyaWVzKVxuXG4gICAgaWYgQGRpcmVjdG9yeS5pc1Jvb3RcbiAgICAgIEBjbGFzc0xpc3QuYWRkKCdwcm9qZWN0LXJvb3QnKVxuICAgICAgQGhlYWRlci5jbGFzc0xpc3QuYWRkKCdwcm9qZWN0LXJvb3QtaGVhZGVyJylcbiAgICBlbHNlXG4gICAgICBAZHJhZ2dhYmxlID0gdHJ1ZVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBkaXJlY3Rvcnkub25EaWRTdGF0dXNDaGFuZ2UgPT4gQHVwZGF0ZVN0YXR1cygpXG4gICAgICBAdXBkYXRlU3RhdHVzKClcblxuICAgIEBleHBhbmQoKSBpZiBAZGlyZWN0b3J5LmV4cGFuc2lvblN0YXRlLmlzRXhwYW5kZWRcblxuICB1cGRhdGVTdGF0dXM6IC0+XG4gICAgQGNsYXNzTGlzdC5yZW1vdmUoJ3N0YXR1cy1pZ25vcmVkJywgJ3N0YXR1cy1tb2RpZmllZCcsICdzdGF0dXMtYWRkZWQnKVxuICAgIEBjbGFzc0xpc3QuYWRkKFwic3RhdHVzLSN7QGRpcmVjdG9yeS5zdGF0dXN9XCIpIGlmIEBkaXJlY3Rvcnkuc3RhdHVzP1xuXG4gIHN1YnNjcmliZVRvRGlyZWN0b3J5OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZGlyZWN0b3J5Lm9uRGlkQWRkRW50cmllcyAoYWRkZWRFbnRyaWVzKSA9PlxuICAgICAgcmV0dXJuIHVubGVzcyBAaXNFeHBhbmRlZFxuXG4gICAgICBudW1iZXJPZkVudHJpZXMgPSBAZW50cmllcy5jaGlsZHJlbi5sZW5ndGhcblxuICAgICAgZm9yIGVudHJ5IGluIGFkZGVkRW50cmllc1xuICAgICAgICB2aWV3ID0gQGNyZWF0ZVZpZXdGb3JFbnRyeShlbnRyeSlcblxuICAgICAgICBpbnNlcnRpb25JbmRleCA9IGVudHJ5LmluZGV4SW5QYXJlbnREaXJlY3RvcnlcbiAgICAgICAgaWYgaW5zZXJ0aW9uSW5kZXggPCBudW1iZXJPZkVudHJpZXNcbiAgICAgICAgICBAZW50cmllcy5pbnNlcnRCZWZvcmUodmlldywgQGVudHJpZXMuY2hpbGRyZW5baW5zZXJ0aW9uSW5kZXhdKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGVudHJpZXMuYXBwZW5kQ2hpbGQodmlldylcblxuICAgICAgICBudW1iZXJPZkVudHJpZXMrK1xuXG4gIGdldFBhdGg6IC0+XG4gICAgQGRpcmVjdG9yeS5wYXRoXG5cbiAgaXNQYXRoRXF1YWw6IChwYXRoVG9Db21wYXJlKSAtPlxuICAgIEBkaXJlY3RvcnkuaXNQYXRoRXF1YWwocGF0aFRvQ29tcGFyZSlcblxuICBjcmVhdGVWaWV3Rm9yRW50cnk6IChlbnRyeSkgLT5cbiAgICBpZiBlbnRyeSBpbnN0YW5jZW9mIERpcmVjdG9yeVxuICAgICAgdmlldyA9IG5ldyBEaXJlY3RvcnlFbGVtZW50KClcbiAgICBlbHNlXG4gICAgICB2aWV3ID0gbmV3IEZpbGVWaWV3KClcbiAgICB2aWV3LmluaXRpYWxpemUoZW50cnkpXG5cbiAgICBzdWJzY3JpcHRpb24gPSBAZGlyZWN0b3J5Lm9uRGlkUmVtb3ZlRW50cmllcyAocmVtb3ZlZEVudHJpZXMpIC0+XG4gICAgICBmb3IgcmVtb3ZlZE5hbWUsIHJlbW92ZWRFbnRyeSBvZiByZW1vdmVkRW50cmllcyB3aGVuIGVudHJ5IGlzIHJlbW92ZWRFbnRyeVxuICAgICAgICB2aWV3LnJlbW92ZSgpXG4gICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgICAgYnJlYWtcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoc3Vic2NyaXB0aW9uKVxuXG4gICAgdmlld1xuXG4gIHJlbG9hZDogLT5cbiAgICBAZGlyZWN0b3J5LnJlbG9hZCgpIGlmIEBpc0V4cGFuZGVkXG5cbiAgdG9nZ2xlRXhwYW5zaW9uOiAoaXNSZWN1cnNpdmU9ZmFsc2UpIC0+XG4gICAgaWYgQGlzRXhwYW5kZWQgdGhlbiBAY29sbGFwc2UoaXNSZWN1cnNpdmUpIGVsc2UgQGV4cGFuZChpc1JlY3Vyc2l2ZSlcblxuICBleHBhbmQ6IChpc1JlY3Vyc2l2ZT1mYWxzZSkgLT5cbiAgICB1bmxlc3MgQGlzRXhwYW5kZWRcbiAgICAgIEBpc0V4cGFuZGVkID0gdHJ1ZVxuICAgICAgQGNsYXNzTGlzdC5hZGQoJ2V4cGFuZGVkJylcbiAgICAgIEBjbGFzc0xpc3QucmVtb3ZlKCdjb2xsYXBzZWQnKVxuICAgICAgQGRpcmVjdG9yeS5leHBhbmQoKVxuXG4gICAgaWYgaXNSZWN1cnNpdmVcbiAgICAgIGZvciBlbnRyeSBpbiBAZW50cmllcy5jaGlsZHJlbiB3aGVuIGVudHJ5IGluc3RhbmNlb2YgRGlyZWN0b3J5Vmlld1xuICAgICAgICBlbnRyeS5leHBhbmQodHJ1ZSlcblxuICAgIGZhbHNlXG5cbiAgY29sbGFwc2U6IChpc1JlY3Vyc2l2ZT1mYWxzZSkgLT5cbiAgICBAaXNFeHBhbmRlZCA9IGZhbHNlXG5cbiAgICBpZiBpc1JlY3Vyc2l2ZVxuICAgICAgZm9yIGVudHJ5IGluIEBlbnRyaWVzLmNoaWxkcmVuIHdoZW4gZW50cnkuaXNFeHBhbmRlZFxuICAgICAgICBlbnRyeS5jb2xsYXBzZSh0cnVlKVxuXG4gICAgQGNsYXNzTGlzdC5yZW1vdmUoJ2V4cGFuZGVkJylcbiAgICBAY2xhc3NMaXN0LmFkZCgnY29sbGFwc2VkJylcbiAgICBAZGlyZWN0b3J5LmNvbGxhcHNlKClcbiAgICBAZW50cmllcy5pbm5lckhUTUwgPSAnJ1xuXG5EaXJlY3RvcnlFbGVtZW50ID0gZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50KCd0cmVlLXZpZXctZGlyZWN0b3J5JywgcHJvdG90eXBlOiBEaXJlY3RvcnlWaWV3LnByb3RvdHlwZSwgZXh0ZW5kczogJ2xpJylcbm1vZHVsZS5leHBvcnRzID0gRGlyZWN0b3J5RWxlbWVudFxuIl19
