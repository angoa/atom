(function() {
  var DB, OpenRecent, minimatch;

  minimatch = null;

  DB = (function() {
    function DB(key) {
      this.key = key;
    }

    DB.prototype.getData = function() {
      var data;
      data = localStorage[this.key];
      data = data != null ? JSON.parse(data) : {};
      return data;
    };

    DB.prototype.setData = function(data) {
      return localStorage[this.key] = JSON.stringify(data);
    };

    DB.prototype.removeData = function() {
      return localStorage.removeItem(this.key);
    };

    DB.prototype.get = function(name) {
      var data;
      data = this.getData();
      return data[name];
    };

    DB.prototype.set = function(name, value) {
      var data;
      data = this.getData();
      data[name] = value;
      return this.setData(data);
    };

    DB.prototype.remove = function(name) {
      var data;
      data = this.getData();
      delete data[name];
      return this.setData(data);
    };

    return DB;

  })();

  OpenRecent = (function() {
    function OpenRecent() {
      this.eventListenerDisposables = [];
      this.commandListenerDisposables = [];
      this.localStorageEventListener = this.onLocalStorageEvent.bind(this);
      this.db = new DB('openRecent');
    }

    OpenRecent.prototype.onUriOpened = function() {
      var editor, filePath, ref, ref1;
      editor = atom.workspace.getActiveTextEditor();
      filePath = editor != null ? (ref = editor.buffer) != null ? (ref1 = ref.file) != null ? ref1.path : void 0 : void 0 : void 0;
      if (!filePath) {
        return;
      }
      if (!filePath.indexOf('://' === -1)) {
        return;
      }
      if (filePath) {
        return this.insertFilePath(filePath);
      }
    };

    OpenRecent.prototype.onProjectPathChange = function(projectPaths) {
      return this.insertCurrentPaths();
    };

    OpenRecent.prototype.onLocalStorageEvent = function(e) {
      if (e.key === this.db.key) {
        return this.update();
      }
    };

    OpenRecent.prototype.encodeEventName = function(s) {
      s = s.replace('-', '\u2010');
      s = s.replace(':', '\u02D0');
      return s;
    };

    OpenRecent.prototype.commandEventName = function(prefix, path) {
      return "open-recent:" + prefix + "-" + (this.encodeEventName(path));
    };

    OpenRecent.prototype.addCommandListeners = function() {
      var disposable, fn, fn1, i, index, j, len, len1, path, ref, ref1;
      ref = this.db.get('files');
      fn = (function(_this) {
        return function(path) {
          var disposable;
          disposable = atom.commands.add("atom-workspace", _this.commandEventName("File" + index, path), function() {
            return _this.openFile(path);
          });
          return _this.commandListenerDisposables.push(disposable);
        };
      })(this);
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        path = ref[index];
        fn(path);
      }
      ref1 = this.db.get('paths');
      fn1 = (function(_this) {
        return function(path) {
          var disposable;
          disposable = atom.commands.add("atom-workspace", _this.commandEventName("Dir" + index, path), function() {
            return _this.openPath(path);
          });
          return _this.commandListenerDisposables.push(disposable);
        };
      })(this);
      for (index = j = 0, len1 = ref1.length; j < len1; index = ++j) {
        path = ref1[index];
        fn1(path);
      }
      disposable = atom.commands.add("atom-workspace", "open-recent:clear-all" + '-'.repeat(1024), (function(_this) {
        return function() {
          _this.db.set('files', []);
          _this.db.set('paths', []);
          return _this.update();
        };
      })(this));
      return this.commandListenerDisposables.push(disposable);
    };

    OpenRecent.prototype.getProjectPath = function(path) {
      var ref;
      return (ref = atom.project.getPaths()) != null ? ref[0] : void 0;
    };

    OpenRecent.prototype.openFile = function(path) {
      return atom.workspace.open(path);
    };

    OpenRecent.prototype.openPath = function(path) {
      var options, replaceCurrentProject, workspaceElement;
      replaceCurrentProject = false;
      options = {};
      if (!this.getProjectPath() && atom.config.get('open-recent.replaceNewWindowOnOpenDirectory')) {
        replaceCurrentProject = true;
      } else if (this.getProjectPath() && atom.config.get('open-recent.replaceProjectOnOpenDirectory')) {
        replaceCurrentProject = true;
      }
      if (replaceCurrentProject) {
        atom.project.setPaths([path]);
        if (workspaceElement = atom.views.getView(atom.workspace)) {
          return atom.commands.dispatch(workspaceElement, 'tree-view:toggle-focus');
        }
      } else {
        return atom.open({
          pathsToOpen: [path],
          newWindow: !atom.config.get('open-recent.replaceNewWindowOnOpenDirectory')
        });
      }
    };

    OpenRecent.prototype.addListeners = function() {
      var disposable;
      this.addCommandListeners();
      disposable = atom.workspace.onDidOpen(this.onUriOpened.bind(this));
      this.eventListenerDisposables.push(disposable);
      disposable = atom.project.onDidChangePaths(this.onProjectPathChange.bind(this));
      this.eventListenerDisposables.push(disposable);
      return window.addEventListener("storage", this.localStorageEventListener);
    };

    OpenRecent.prototype.removeCommandListeners = function() {
      var disposable, i, len, ref;
      ref = this.commandListenerDisposables;
      for (i = 0, len = ref.length; i < len; i++) {
        disposable = ref[i];
        disposable.dispose();
      }
      return this.commandListenerDisposables = [];
    };

    OpenRecent.prototype.removeListeners = function() {
      var disposable, i, len, ref;
      this.removeCommandListeners();
      ref = this.eventListenerDisposables;
      for (i = 0, len = ref.length; i < len; i++) {
        disposable = ref[i];
        disposable.dispose();
      }
      this.eventListenerDisposables = [];
      return window.removeEventListener('storage', this.localStorageEventListener);
    };

    OpenRecent.prototype.init = function() {
      if (atom.config.get('open-recent.recentDirectories') || atom.config.get('open-recent.recentFiles')) {
        this.db.set('paths', atom.config.get('open-recent.recentDirectories'));
        this.db.set('files', atom.config.get('open-recent.recentFiles'));
        atom.config.unset('open-recent.recentDirectories');
        atom.config.unset('open-recent.recentFiles');
      }
      if (!this.db.get('paths')) {
        this.db.set('paths', []);
      }
      if (!this.db.get('files')) {
        this.db.set('files', []);
      }
      this.addListeners();
      this.insertCurrentPaths();
      return this.update();
    };

    OpenRecent.prototype.filterPath = function(path) {
      var i, ignoredNames, len, match, name;
      ignoredNames = atom.config.get('core.ignoredNames');
      if (ignoredNames) {
        if (minimatch == null) {
          minimatch = require('minimatch');
        }
        for (i = 0, len = ignoredNames.length; i < len; i++) {
          name = ignoredNames[i];
          match = [name, "**/" + name + "/**"].some(function(comparison) {
            return minimatch(path, comparison, {
              matchBase: true,
              dot: true
            });
          });
          if (match) {
            return true;
          }
        }
      }
      return false;
    };

    OpenRecent.prototype.insertCurrentPaths = function() {
      var i, index, len, maxRecentDirectories, path, projectDirectory, recentPaths, ref;
      if (!(atom.project.getDirectories().length > 0)) {
        return;
      }
      recentPaths = this.db.get('paths');
      ref = atom.project.getDirectories();
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        projectDirectory = ref[index];
        if (index > 0 && !atom.config.get('open-recent.listDirectoriesAddedToProject')) {
          continue;
        }
        path = projectDirectory.path;
        if (this.filterPath(path)) {
          continue;
        }
        index = recentPaths.indexOf(path);
        if (index !== -1) {
          recentPaths.splice(index, 1);
        }
        recentPaths.splice(0, 0, path);
        maxRecentDirectories = atom.config.get('open-recent.maxRecentDirectories');
        if (recentPaths.length > maxRecentDirectories) {
          recentPaths.splice(maxRecentDirectories, recentPaths.length - maxRecentDirectories);
        }
      }
      this.db.set('paths', recentPaths);
      return this.update();
    };

    OpenRecent.prototype.insertFilePath = function(path) {
      var index, maxRecentFiles, recentFiles;
      if (this.filterPath(path)) {
        return;
      }
      recentFiles = this.db.get('files');
      index = recentFiles.indexOf(path);
      if (index !== -1) {
        recentFiles.splice(index, 1);
      }
      recentFiles.splice(0, 0, path);
      maxRecentFiles = atom.config.get('open-recent.maxRecentFiles');
      if (recentFiles.length > maxRecentFiles) {
        recentFiles.splice(maxRecentFiles, recentFiles.length - maxRecentFiles);
      }
      this.db.set('files', recentFiles);
      return this.update();
    };

    OpenRecent.prototype.createSubmenu = function() {
      var i, index, j, len, len1, menuItem, path, recentFiles, recentPaths, submenu;
      submenu = [];
      submenu.push({
        command: "pane:reopen-closed-item",
        label: "Reopen Closed File"
      });
      submenu.push({
        type: "separator"
      });
      recentFiles = this.db.get('files');
      if (recentFiles.length) {
        for (index = i = 0, len = recentFiles.length; i < len; index = ++i) {
          path = recentFiles[index];
          menuItem = {
            label: path,
            command: this.commandEventName("File" + index, path)
          };
          if (path.length > 100) {
            menuItem.label = path.substr(-60);
            menuItem.sublabel = path;
          }
          submenu.push(menuItem);
        }
        submenu.push({
          type: "separator"
        });
      }
      recentPaths = this.db.get('paths');
      if (recentPaths.length) {
        for (index = j = 0, len1 = recentPaths.length; j < len1; index = ++j) {
          path = recentPaths[index];
          menuItem = {
            label: path,
            command: this.commandEventName("Dir" + index, path)
          };
          if (path.length > 100) {
            menuItem.label = path.substr(-60);
            menuItem.sublabel = path;
          }
          submenu.push(menuItem);
        }
        submenu.push({
          type: "separator"
        });
      }
      submenu.push({
        command: "open-recent:clear-all" + '-'.repeat(1024),
        label: "Clear List"
      });
      return submenu;
    };

    OpenRecent.prototype.updateMenu = function() {
      var dropdown, i, item, j, len, len1, ref, ref1, results;
      ref = atom.menu.template;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        dropdown = ref[i];
        if (dropdown.label === "File" || dropdown.label === "&File") {
          ref1 = dropdown.submenu;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            item = ref1[j];
            if (item.command === "pane:reopen-closed-item" || item.label === "Open Recent") {
              delete item.accelerator;
              delete item.command;
              delete item.click;
              item.label = "Open Recent";
              item.enabled = true;
              if (item.metadata == null) {
                item.metadata = {};
              }
              item.metadata.windowSpecific = false;
              item.submenu = this.createSubmenu();
              atom.menu.update();
              break;
            }
          }
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    OpenRecent.prototype.update = function() {
      this.removeCommandListeners();
      this.updateMenu();
      return this.addCommandListeners();
    };

    OpenRecent.prototype.destroy = function() {
      return this.removeListeners();
    };

    return OpenRecent;

  })();

  module.exports = {
    config: {
      maxRecentFiles: {
        type: 'number',
        "default": 8
      },
      maxRecentDirectories: {
        type: 'number',
        "default": 8
      },
      replaceNewWindowOnOpenDirectory: {
        type: 'boolean',
        "default": true,
        description: 'When checked, opening a recent directory will "open" in the current window, but only if the window does not have a project path set. Eg: The window that appears when doing File > New Window.'
      },
      replaceProjectOnOpenDirectory: {
        type: 'boolean',
        "default": false,
        description: 'When checked, opening a recent directory will "open" in the current window, replacing the current project.'
      },
      listDirectoriesAddedToProject: {
        type: 'boolean',
        "default": false,
        description: 'When checked, the all root directories in a project will be added to the history and not just the 1st root directory.'
      },
      ignoredNames: {
        type: 'boolean',
        "default": true,
        description: 'When checked, skips files and directories specified in Atom\'s "Ignored Names" setting.'
      }
    },
    instance: null,
    activate: function() {
      this.instance = new OpenRecent();
      return this.instance.init();
    },
    deactivate: function() {
      this.instance.destroy();
      return this.instance = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL29wZW4tcmVjZW50L2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsU0FBQSxHQUFZOztFQUdOO0lBQ1MsWUFBQyxHQUFEO01BQUMsSUFBQyxDQUFBLE1BQUQ7SUFBRDs7aUJBRWIsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQSxHQUFPLFlBQWEsQ0FBQSxJQUFDLENBQUEsR0FBRDtNQUNwQixJQUFBLEdBQVUsWUFBSCxHQUFjLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxDQUFkLEdBQW9DO0FBQzNDLGFBQU87SUFIQTs7aUJBS1QsT0FBQSxHQUFTLFNBQUMsSUFBRDthQUNQLFlBQWEsQ0FBQSxJQUFDLENBQUEsR0FBRCxDQUFiLEdBQXFCLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBZjtJQURkOztpQkFHVCxVQUFBLEdBQVksU0FBQTthQUNWLFlBQVksQ0FBQyxVQUFiLENBQXdCLElBQUMsQ0FBQSxHQUF6QjtJQURVOztpQkFHWixHQUFBLEdBQUssU0FBQyxJQUFEO0FBQ0gsVUFBQTtNQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsT0FBRCxDQUFBO0FBQ1AsYUFBTyxJQUFLLENBQUEsSUFBQTtJQUZUOztpQkFJTCxHQUFBLEdBQUssU0FBQyxJQUFELEVBQU8sS0FBUDtBQUNILFVBQUE7TUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLE9BQUQsQ0FBQTtNQUNQLElBQUssQ0FBQSxJQUFBLENBQUwsR0FBYTthQUNiLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVDtJQUhHOztpQkFLTCxNQUFBLEdBQVEsU0FBQyxJQUFEO0FBQ04sVUFBQTtNQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsT0FBRCxDQUFBO01BQ1AsT0FBTyxJQUFLLENBQUEsSUFBQTthQUNaLElBQUMsQ0FBQSxPQUFELENBQVMsSUFB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RFQ7UUFFQSxXQUFBLEVBQWEsNEdBRmI7T0FYRjtNQWNBLDZCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSx1SEFGYjtPQWZGO01Ba0JBLFlBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLHlGQUZiO09BbkJGO0tBREY7SUF3QkEsUUFBQSxFQUFVLElBeEJWO0lBMEJBLFFBQUEsRUFBVSxTQUFBO01BQ1IsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxVQUFBLENBQUE7YUFDaEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQUE7SUFGUSxDQTFCVjtJQThCQSxVQUFBLEVBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUZGLENBOUJaOztBQW5TRiIsInNvdXJjZXNDb250ZW50IjpbIm1pbmltYXRjaCA9IG51bGxcblxuIy0tLSBsb2NhbFN0b3JhZ2UgREJcbmNsYXNzIERCXG4gIGNvbnN0cnVjdG9yOiAoQGtleSkgLT5cblxuICBnZXREYXRhOiAtPlxuICAgIGRhdGEgPSBsb2NhbFN0b3JhZ2VbQGtleV1cbiAgICBkYXRhID0gaWYgZGF0YT8gdGhlbiBKU09OLnBhcnNlKGRhdGEpIGVsc2Uge31cbiAgICByZXR1cm4gZGF0YVxuXG4gIHNldERhdGE6IChkYXRhKSAtPlxuICAgIGxvY2FsU3RvcmFnZVtAa2V5XSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpXG5cbiAgcmVtb3ZlRGF0YTogLT5cbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShAa2V5KVxuXG4gIGdldDogKG5hbWUpIC0+XG4gICAgZGF0YSA9IEBnZXREYXRhKClcbiAgICByZXR1cm4gZGF0YVtuYW1lXVxuXG4gIHNldDogKG5hbWUsIHZhbHVlKSAtPlxuICAgIGRhdGEgPSBAZ2V0RGF0YSgpXG4gICAgZGF0YVtuYW1lXSA9IHZhbHVlXG4gICAgQHNldERhdGEoZGF0YSlcblxuICByZW1vdmU6IChuYW1lKSAtPlxuICAgIGRhdGEgPSBAZ2V0RGF0YSgpXG4gICAgZGVsZXRlIGRhdGFbbmFtZV1cbiAgICBAc2V0RGF0YShkYXRhKVxuXG5cbiMtLS0gT3BlblJlY2VudFxuY2xhc3MgT3BlblJlY2VudFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAZXZlbnRMaXN0ZW5lckRpc3Bvc2FibGVzID0gW11cbiAgICBAY29tbWFuZExpc3RlbmVyRGlzcG9zYWJsZXMgPSBbXVxuICAgIEBsb2NhbFN0b3JhZ2VFdmVudExpc3RlbmVyID0gQG9uTG9jYWxTdG9yYWdlRXZlbnQuYmluZChAKVxuICAgIEBkYiA9IG5ldyBEQignb3BlblJlY2VudCcpXG5cbiAgIy0tLSBFdmVudCBIYW5kbGVyc1xuICBvblVyaU9wZW5lZDogLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBmaWxlUGF0aCA9IGVkaXRvcj8uYnVmZmVyPy5maWxlPy5wYXRoXG5cbiAgICAjIElnbm9yZSBhbnl0aGluZyB0aGF0cyBub3QgYSBmaWxlLlxuICAgIHJldHVybiB1bmxlc3MgZmlsZVBhdGhcbiAgICByZXR1cm4gdW5sZXNzIGZpbGVQYXRoLmluZGV4T2YgJzovLycgaXMgLTFcblxuICAgIEBpbnNlcnRGaWxlUGF0aChmaWxlUGF0aCkgaWYgZmlsZVBhdGhcblxuICBvblByb2plY3RQYXRoQ2hhbmdlOiAocHJvamVjdFBhdGhzKSAtPlxuICAgIEBpbnNlcnRDdXJyZW50UGF0aHMoKVxuXG4gIG9uTG9jYWxTdG9yYWdlRXZlbnQ6IChlKSAtPlxuICAgIGlmIGUua2V5IGlzIEBkYi5rZXlcbiAgICAgIEB1cGRhdGUoKVxuXG4gIGVuY29kZUV2ZW50TmFtZTogKHMpIC0+XG4gICAgcyA9IHMucmVwbGFjZSgnLScsICdcXHUyMDEwJykgIyBIWVBIRU5cbiAgICBzID0gcy5yZXBsYWNlKCc6JywgJ1xcdTAyRDAnKSAjIE1Pwq1EScKtRknCrUVSIExFVMKtVEVSIFRSSUFOR1VMQVIgQ09MT05cbiAgICByZXR1cm4gc1xuXG4gIGNvbW1hbmRFdmVudE5hbWU6IChwcmVmaXgsIHBhdGgpIC0+XG4gICAgcmV0dXJuIFwib3Blbi1yZWNlbnQ6I3twcmVmaXh9LSN7QGVuY29kZUV2ZW50TmFtZShwYXRoKX1cIlxuXG4gICMtLS0gTGlzdGVuZXJzXG4gIGFkZENvbW1hbmRMaXN0ZW5lcnM6IC0+XG4gICAgIy0tLSBDb21tYW5kc1xuICAgICMgb3Blbi1yZWNlbnQ6RmlsZSMtcGF0aFxuICAgIGZvciBwYXRoLCBpbmRleCBpbiBAZGIuZ2V0KCdmaWxlcycpXG4gICAgICBkbyAocGF0aCkgPT4gIyBFeHBsaWNpdCBjbG9zdXJlXG4gICAgICAgIGRpc3Bvc2FibGUgPSBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIEBjb21tYW5kRXZlbnROYW1lKFwiRmlsZSN7aW5kZXh9XCIsIHBhdGgpLCA9PlxuICAgICAgICAgIEBvcGVuRmlsZSBwYXRoXG4gICAgICAgIEBjb21tYW5kTGlzdGVuZXJEaXNwb3NhYmxlcy5wdXNoIGRpc3Bvc2FibGVcblxuICAgICMgb3Blbi1yZWNlbnQ6RGlyIy1wYXRoXG4gICAgZm9yIHBhdGgsIGluZGV4IGluIEBkYi5nZXQoJ3BhdGhzJylcbiAgICAgIGRvIChwYXRoKSA9PiAjIEV4cGxpY2l0IGNsb3N1cmVcbiAgICAgICAgZGlzcG9zYWJsZSA9IGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgQGNvbW1hbmRFdmVudE5hbWUoXCJEaXIje2luZGV4fVwiLCBwYXRoKSwgPT5cbiAgICAgICAgICBAb3BlblBhdGggcGF0aFxuICAgICAgICBAY29tbWFuZExpc3RlbmVyRGlzcG9zYWJsZXMucHVzaCBkaXNwb3NhYmxlXG5cbiAgICAjIG9wZW4tcmVjZW50OmNsZWFyLWFsbC0tLS0tLS4uLlxuICAgICMgQWRkIHRvbnMgb2YgLS0tIGF0IHRoZSBlbmQgdG8gc29ydCB0aGlzIGl0ZW0gYXQgdGhlIGJvdHRvbSBvZiB0aGUgY29tbWFuZCBwYWxldHRlLlxuICAgICMgTXVsdGlwbGUgc3BhY2VzIGFyZSBpZ25vcmVkIGluc2lkZSB0aGUgY29tbWFuZCBwYWxldHRlLlxuICAgIGRpc3Bvc2FibGUgPSBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIFwib3Blbi1yZWNlbnQ6Y2xlYXItYWxsXCIgKyAnLScucmVwZWF0KDEwMjQpLCA9PlxuICAgICAgQGRiLnNldCgnZmlsZXMnLCBbXSlcbiAgICAgIEBkYi5zZXQoJ3BhdGhzJywgW10pXG4gICAgICBAdXBkYXRlKClcbiAgICBAY29tbWFuZExpc3RlbmVyRGlzcG9zYWJsZXMucHVzaCBkaXNwb3NhYmxlXG5cbiAgZ2V0UHJvamVjdFBhdGg6IChwYXRoKSAtPlxuICAgIHJldHVybiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKT9bMF1cblxuICBvcGVuRmlsZTogKHBhdGgpIC0+XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbiBwYXRoXG5cbiAgb3BlblBhdGg6IChwYXRoKSAtPlxuICAgIHJlcGxhY2VDdXJyZW50UHJvamVjdCA9IGZhbHNlXG4gICAgb3B0aW9ucyA9IHt9XG5cbiAgICBpZiBub3QgQGdldFByb2plY3RQYXRoKCkgYW5kIGF0b20uY29uZmlnLmdldCgnb3Blbi1yZWNlbnQucmVwbGFjZU5ld1dpbmRvd09uT3BlbkRpcmVjdG9yeScpXG4gICAgICByZXBsYWNlQ3VycmVudFByb2plY3QgPSB0cnVlXG4gICAgZWxzZSBpZiBAZ2V0UHJvamVjdFBhdGgoKSBhbmQgYXRvbS5jb25maWcuZ2V0KCdvcGVuLXJlY2VudC5yZXBsYWNlUHJvamVjdE9uT3BlbkRpcmVjdG9yeScpXG4gICAgICByZXBsYWNlQ3VycmVudFByb2plY3QgPSB0cnVlXG5cbiAgICBpZiByZXBsYWNlQ3VycmVudFByb2plY3RcbiAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbcGF0aF0pXG4gICAgICBpZiB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICd0cmVlLXZpZXc6dG9nZ2xlLWZvY3VzJ1xuICAgIGVsc2VcbiAgICAgIGF0b20ub3BlbiB7XG4gICAgICAgIHBhdGhzVG9PcGVuOiBbcGF0aF1cbiAgICAgICAgbmV3V2luZG93OiAhYXRvbS5jb25maWcuZ2V0KCdvcGVuLXJlY2VudC5yZXBsYWNlTmV3V2luZG93T25PcGVuRGlyZWN0b3J5JylcbiAgICAgIH1cblxuICBhZGRMaXN0ZW5lcnM6IC0+XG4gICAgIy0tLSBDb21tYW5kc1xuICAgIEBhZGRDb21tYW5kTGlzdGVuZXJzKClcblxuICAgICMtLS0gRXZlbnRzXG4gICAgZGlzcG9zYWJsZSA9IGF0b20ud29ya3NwYWNlLm9uRGlkT3BlbiBAb25VcmlPcGVuZWQuYmluZChAKVxuICAgIEBldmVudExpc3RlbmVyRGlzcG9zYWJsZXMucHVzaChkaXNwb3NhYmxlKVxuXG4gICAgZGlzcG9zYWJsZSA9IGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzIEBvblByb2plY3RQYXRoQ2hhbmdlLmJpbmQoQClcbiAgICBAZXZlbnRMaXN0ZW5lckRpc3Bvc2FibGVzLnB1c2goZGlzcG9zYWJsZSlcblxuICAgICMgTm90aWZ5IG90aGVyIHdpbmRvd3MgZHVyaW5nIGEgc2V0dGluZyBkYXRhIGluIGxvY2FsU3RvcmFnZS5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciBcInN0b3JhZ2VcIiwgQGxvY2FsU3RvcmFnZUV2ZW50TGlzdGVuZXJcblxuICByZW1vdmVDb21tYW5kTGlzdGVuZXJzOiAtPlxuICAgICMtLS0gQ29tbWFuZHNcbiAgICBmb3IgZGlzcG9zYWJsZSBpbiBAY29tbWFuZExpc3RlbmVyRGlzcG9zYWJsZXNcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgQGNvbW1hbmRMaXN0ZW5lckRpc3Bvc2FibGVzID0gW11cblxuICByZW1vdmVMaXN0ZW5lcnM6IC0+XG4gICAgIy0tLSBDb21tYW5kc1xuICAgIEByZW1vdmVDb21tYW5kTGlzdGVuZXJzKClcblxuICAgICMtLS0gRXZlbnRzXG4gICAgZm9yIGRpc3Bvc2FibGUgaW4gQGV2ZW50TGlzdGVuZXJEaXNwb3NhYmxlc1xuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICBAZXZlbnRMaXN0ZW5lckRpc3Bvc2FibGVzID0gW11cblxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdzdG9yYWdlJywgQGxvY2FsU3RvcmFnZUV2ZW50TGlzdGVuZXJcblxuICAjLS0tIE1ldGhvZHNcbiAgaW5pdDogLT5cbiAgICAjIE1pZ3JhdGVcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ29wZW4tcmVjZW50LnJlY2VudERpcmVjdG9yaWVzJykgb3IgYXRvbS5jb25maWcuZ2V0KCdvcGVuLXJlY2VudC5yZWNlbnRGaWxlcycpXG4gICAgICBAZGIuc2V0KCdwYXRocycsIGF0b20uY29uZmlnLmdldCgnb3Blbi1yZWNlbnQucmVjZW50RGlyZWN0b3JpZXMnKSlcbiAgICAgIEBkYi5zZXQoJ2ZpbGVzJywgYXRvbS5jb25maWcuZ2V0KCdvcGVuLXJlY2VudC5yZWNlbnRGaWxlcycpKVxuICAgICAgYXRvbS5jb25maWcudW5zZXQoJ29wZW4tcmVjZW50LnJlY2VudERpcmVjdG9yaWVzJylcbiAgICAgIGF0b20uY29uZmlnLnVuc2V0KCdvcGVuLXJlY2VudC5yZWNlbnRGaWxlcycpXG5cbiAgICAjIERlZmF1bHRzXG4gICAgQGRiLnNldCgncGF0aHMnLCBbXSkgdW5sZXNzIEBkYi5nZXQoJ3BhdGhzJylcbiAgICBAZGIuc2V0KCdmaWxlcycsIFtdKSB1bmxlc3MgQGRiLmdldCgnZmlsZXMnKVxuXG4gICAgQGFkZExpc3RlbmVycygpXG4gICAgQGluc2VydEN1cnJlbnRQYXRocygpXG4gICAgQHVwZGF0ZSgpXG5cbiAgIyBSZXR1cm5zIHRydWUgaWYgdGhlIHBhdGggc2hvdWxkIGJlIGZpbHRlcmVkIG91dCwgYmFzZWQgb24gc2V0dGluZ3MuXG4gIGZpbHRlclBhdGg6IChwYXRoKSAtPlxuICAgIGlnbm9yZWROYW1lcyA9IGF0b20uY29uZmlnLmdldCgnY29yZS5pZ25vcmVkTmFtZXMnKVxuICAgIGlmIGlnbm9yZWROYW1lc1xuICAgICAgbWluaW1hdGNoID89IHJlcXVpcmUoJ21pbmltYXRjaCcpXG4gICAgICBmb3IgbmFtZSBpbiBpZ25vcmVkTmFtZXNcbiAgICAgICAgbWF0Y2ggPSBbbmFtZSwgXCIqKi8je25hbWV9LyoqXCJdLnNvbWUgKGNvbXBhcmlzb24pIC0+XG4gICAgICAgICAgcmV0dXJuIG1pbmltYXRjaChwYXRoLCBjb21wYXJpc29uLCB7IG1hdGNoQmFzZTogdHJ1ZSwgZG90OiB0cnVlIH0pXG4gICAgICAgIHJldHVybiB0cnVlIGlmIG1hdGNoXG5cbiAgICByZXR1cm4gZmFsc2VcblxuICBpbnNlcnRDdXJyZW50UGF0aHM6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5sZW5ndGggPiAwXG5cbiAgICByZWNlbnRQYXRocyA9IEBkYi5nZXQoJ3BhdGhzJylcbiAgICBmb3IgcHJvamVjdERpcmVjdG9yeSwgaW5kZXggaW4gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClcbiAgICAgICMgSWdub3JlIHRoZSBzZWNvbmQsIHRoaXJkLCAuLi4gZm9sZGVycyBpbiBhIHByb2plY3RcbiAgICAgIGNvbnRpbnVlIGlmIGluZGV4ID4gMCBhbmQgbm90IGF0b20uY29uZmlnLmdldCgnb3Blbi1yZWNlbnQubGlzdERpcmVjdG9yaWVzQWRkZWRUb1Byb2plY3QnKVxuXG4gICAgICBwYXRoID0gcHJvamVjdERpcmVjdG9yeS5wYXRoXG5cbiAgICAgIGNvbnRpbnVlIGlmIEBmaWx0ZXJQYXRoKHBhdGgpXG5cbiAgICAgICMgUmVtb3ZlIGlmIGFscmVhZHkgbGlzdGVkXG4gICAgICBpbmRleCA9IHJlY2VudFBhdGhzLmluZGV4T2YgcGF0aFxuICAgICAgaWYgaW5kZXggIT0gLTFcbiAgICAgICAgcmVjZW50UGF0aHMuc3BsaWNlIGluZGV4LCAxXG5cbiAgICAgIHJlY2VudFBhdGhzLnNwbGljZSAwLCAwLCBwYXRoXG5cbiAgICAgICMgTGltaXRcbiAgICAgIG1heFJlY2VudERpcmVjdG9yaWVzID0gYXRvbS5jb25maWcuZ2V0KCdvcGVuLXJlY2VudC5tYXhSZWNlbnREaXJlY3RvcmllcycpXG4gICAgICBpZiByZWNlbnRQYXRocy5sZW5ndGggPiBtYXhSZWNlbnREaXJlY3Rvcmllc1xuICAgICAgICByZWNlbnRQYXRocy5zcGxpY2UgbWF4UmVjZW50RGlyZWN0b3JpZXMsIHJlY2VudFBhdGhzLmxlbmd0aCAtIG1heFJlY2VudERpcmVjdG9yaWVzXG5cbiAgICBAZGIuc2V0KCdwYXRocycsIHJlY2VudFBhdGhzKVxuICAgIEB1cGRhdGUoKVxuXG4gIGluc2VydEZpbGVQYXRoOiAocGF0aCkgLT5cbiAgICByZXR1cm4gaWYgQGZpbHRlclBhdGgocGF0aClcblxuICAgIHJlY2VudEZpbGVzID0gQGRiLmdldCgnZmlsZXMnKVxuXG4gICAgIyBSZW1vdmUgaWYgYWxyZWFkeSBsaXN0ZWRcbiAgICBpbmRleCA9IHJlY2VudEZpbGVzLmluZGV4T2YgcGF0aFxuICAgIGlmIGluZGV4ICE9IC0xXG4gICAgICByZWNlbnRGaWxlcy5zcGxpY2UgaW5kZXgsIDFcblxuICAgIHJlY2VudEZpbGVzLnNwbGljZSAwLCAwLCBwYXRoXG5cbiAgICAjIExpbWl0XG4gICAgbWF4UmVjZW50RmlsZXMgPSBhdG9tLmNvbmZpZy5nZXQoJ29wZW4tcmVjZW50Lm1heFJlY2VudEZpbGVzJylcbiAgICBpZiByZWNlbnRGaWxlcy5sZW5ndGggPiBtYXhSZWNlbnRGaWxlc1xuICAgICAgcmVjZW50RmlsZXMuc3BsaWNlIG1heFJlY2VudEZpbGVzLCByZWNlbnRGaWxlcy5sZW5ndGggLSBtYXhSZWNlbnRGaWxlc1xuXG4gICAgQGRiLnNldCgnZmlsZXMnLCByZWNlbnRGaWxlcylcbiAgICBAdXBkYXRlKClcblxuICAjLS0tIE1lbnVcbiAgY3JlYXRlU3VibWVudTogLT5cbiAgICBzdWJtZW51ID0gW11cbiAgICBzdWJtZW51LnB1c2ggeyBjb21tYW5kOiBcInBhbmU6cmVvcGVuLWNsb3NlZC1pdGVtXCIsIGxhYmVsOiBcIlJlb3BlbiBDbG9zZWQgRmlsZVwiIH1cbiAgICBzdWJtZW51LnB1c2ggeyB0eXBlOiBcInNlcGFyYXRvclwiIH1cblxuICAgICMgRmlsZXNcbiAgICByZWNlbnRGaWxlcyA9IEBkYi5nZXQoJ2ZpbGVzJylcbiAgICBpZiByZWNlbnRGaWxlcy5sZW5ndGhcbiAgICAgIGZvciBwYXRoLCBpbmRleCBpbiByZWNlbnRGaWxlc1xuICAgICAgICBtZW51SXRlbSA9IHtcbiAgICAgICAgICBsYWJlbDogcGF0aFxuICAgICAgICAgIGNvbW1hbmQ6IEBjb21tYW5kRXZlbnROYW1lKFwiRmlsZSN7aW5kZXh9XCIsIHBhdGgpXG4gICAgICAgIH1cbiAgICAgICAgaWYgcGF0aC5sZW5ndGggPiAxMDBcbiAgICAgICAgICBtZW51SXRlbS5sYWJlbCA9IHBhdGguc3Vic3RyKC02MClcbiAgICAgICAgICBtZW51SXRlbS5zdWJsYWJlbCA9IHBhdGhcbiAgICAgICAgc3VibWVudS5wdXNoIG1lbnVJdGVtXG4gICAgICBzdWJtZW51LnB1c2ggeyB0eXBlOiBcInNlcGFyYXRvclwiIH1cblxuICAgICMgUm9vdCBQYXRoc1xuICAgIHJlY2VudFBhdGhzID0gQGRiLmdldCgncGF0aHMnKVxuICAgIGlmIHJlY2VudFBhdGhzLmxlbmd0aFxuICAgICAgZm9yIHBhdGgsIGluZGV4IGluIHJlY2VudFBhdGhzXG4gICAgICAgIG1lbnVJdGVtID0ge1xuICAgICAgICAgIGxhYmVsOiBwYXRoXG4gICAgICAgICAgY29tbWFuZDogQGNvbW1hbmRFdmVudE5hbWUoXCJEaXIje2luZGV4fVwiLCBwYXRoKVxuICAgICAgICB9XG4gICAgICAgIGlmIHBhdGgubGVuZ3RoID4gMTAwXG4gICAgICAgICAgbWVudUl0ZW0ubGFiZWwgPSBwYXRoLnN1YnN0cigtNjApXG4gICAgICAgICAgbWVudUl0ZW0uc3VibGFiZWwgPSBwYXRoXG4gICAgICAgIHN1Ym1lbnUucHVzaCBtZW51SXRlbVxuICAgICAgc3VibWVudS5wdXNoIHsgdHlwZTogXCJzZXBhcmF0b3JcIiB9XG5cbiAgICBzdWJtZW51LnB1c2ggeyBjb21tYW5kOiBcIm9wZW4tcmVjZW50OmNsZWFyLWFsbFwiICsgJy0nLnJlcGVhdCgxMDI0KSwgbGFiZWw6IFwiQ2xlYXIgTGlzdFwiIH1cbiAgICByZXR1cm4gc3VibWVudVxuXG4gIHVwZGF0ZU1lbnU6IC0+XG4gICAgIyBOZWVkIHRvIHBsYWNlIG91ciBtZW51IGluIHRvcCBzZWN0aW9uXG4gICAgZm9yIGRyb3Bkb3duIGluIGF0b20ubWVudS50ZW1wbGF0ZVxuICAgICAgaWYgZHJvcGRvd24ubGFiZWwgaXMgXCJGaWxlXCIgb3IgZHJvcGRvd24ubGFiZWwgaXMgXCImRmlsZVwiXG4gICAgICAgIGZvciBpdGVtIGluIGRyb3Bkb3duLnN1Ym1lbnVcbiAgICAgICAgICBpZiBpdGVtLmNvbW1hbmQgaXMgXCJwYW5lOnJlb3Blbi1jbG9zZWQtaXRlbVwiIG9yIGl0ZW0ubGFiZWwgaXMgXCJPcGVuIFJlY2VudFwiXG4gICAgICAgICAgICBkZWxldGUgaXRlbS5hY2NlbGVyYXRvclxuICAgICAgICAgICAgZGVsZXRlIGl0ZW0uY29tbWFuZFxuICAgICAgICAgICAgZGVsZXRlIGl0ZW0uY2xpY2tcbiAgICAgICAgICAgIGl0ZW0ubGFiZWwgPSBcIk9wZW4gUmVjZW50XCJcbiAgICAgICAgICAgIGl0ZW0uZW5hYmxlZCA9IHRydWVcbiAgICAgICAgICAgIGl0ZW0ubWV0YWRhdGEgPz0ge31cbiAgICAgICAgICAgIGl0ZW0ubWV0YWRhdGEud2luZG93U3BlY2lmaWMgPSBmYWxzZVxuICAgICAgICAgICAgaXRlbS5zdWJtZW51ID0gQGNyZWF0ZVN1Ym1lbnUoKVxuICAgICAgICAgICAgYXRvbS5tZW51LnVwZGF0ZSgpXG4gICAgICAgICAgICBicmVhayAjIGJyZWFrIGZvciBpdGVtXG4gICAgICAgIGJyZWFrICMgYnJlYWsgZm9yIGRyb3Bkb3duXG5cbiAgIy0tLVxuICB1cGRhdGU6IC0+XG4gICAgQHJlbW92ZUNvbW1hbmRMaXN0ZW5lcnMoKVxuICAgIEB1cGRhdGVNZW51KClcbiAgICBAYWRkQ29tbWFuZExpc3RlbmVycygpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAcmVtb3ZlTGlzdGVuZXJzKClcblxuXG4jLS0tIE1vZHVsZVxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6XG4gICAgbWF4UmVjZW50RmlsZXM6XG4gICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgZGVmYXVsdDogOFxuICAgIG1heFJlY2VudERpcmVjdG9yaWVzOlxuICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgIGRlZmF1bHQ6IDhcbiAgICByZXBsYWNlTmV3V2luZG93T25PcGVuRGlyZWN0b3J5OlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogJ1doZW4gY2hlY2tlZCwgb3BlbmluZyBhIHJlY2VudCBkaXJlY3Rvcnkgd2lsbCBcIm9wZW5cIiBpbiB0aGUgY3VycmVudCB3aW5kb3csIGJ1dCBvbmx5IGlmIHRoZSB3aW5kb3cgZG9lcyBub3QgaGF2ZSBhIHByb2plY3QgcGF0aCBzZXQuIEVnOiBUaGUgd2luZG93IHRoYXQgYXBwZWFycyB3aGVuIGRvaW5nIEZpbGUgPiBOZXcgV2luZG93LidcbiAgICByZXBsYWNlUHJvamVjdE9uT3BlbkRpcmVjdG9yeTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiAnV2hlbiBjaGVja2VkLCBvcGVuaW5nIGEgcmVjZW50IGRpcmVjdG9yeSB3aWxsIFwib3BlblwiIGluIHRoZSBjdXJyZW50IHdpbmRvdywgcmVwbGFjaW5nIHRoZSBjdXJyZW50IHByb2plY3QuJ1xuICAgIGxpc3REaXJlY3Rvcmllc0FkZGVkVG9Qcm9qZWN0OlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246ICdXaGVuIGNoZWNrZWQsIHRoZSBhbGwgcm9vdCBkaXJlY3RvcmllcyBpbiBhIHByb2plY3Qgd2lsbCBiZSBhZGRlZCB0byB0aGUgaGlzdG9yeSBhbmQgbm90IGp1c3QgdGhlIDFzdCByb290IGRpcmVjdG9yeS4nXG4gICAgaWdub3JlZE5hbWVzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogJ1doZW4gY2hlY2tlZCwgc2tpcHMgZmlsZXMgYW5kIGRpcmVjdG9yaWVzIHNwZWNpZmllZCBpbiBBdG9tXFwncyBcIklnbm9yZWQgTmFtZXNcIiBzZXR0aW5nLidcblxuICBpbnN0YW5jZTogbnVsbFxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIEBpbnN0YW5jZSA9IG5ldyBPcGVuUmVjZW50KClcbiAgICBAaW5zdGFuY2UuaW5pdCgpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAaW5zdGFuY2UuZGVzdHJveSgpXG4gICAgQGluc3RhbmNlID0gbnVsbFxuIl19
