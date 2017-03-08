(function() {
  var CompositeDisposable, Directory, Emitter, File, PathWatcher, _, fs, path, realpathCache, ref, repoForPath,
    slice = [].slice;

  path = require('path');

  _ = require('underscore-plus');

  ref = require('event-kit'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  fs = require('fs-plus');

  PathWatcher = require('pathwatcher');

  File = require('./file');

  repoForPath = require('./helpers').repoForPath;

  realpathCache = {};

  module.exports = Directory = (function() {
    function Directory(arg) {
      var base, base1, fullPath, ref1;
      this.name = arg.name, fullPath = arg.fullPath, this.symlink = arg.symlink, this.expansionState = arg.expansionState, this.isRoot = arg.isRoot, this.ignoredPatterns = arg.ignoredPatterns, this.useSyncFS = arg.useSyncFS, this.stats = arg.stats;
      this.destroyed = false;
      this.emitter = new Emitter();
      this.subscriptions = new CompositeDisposable();
      if (atom.config.get('tree-view.squashDirectoryNames') && !this.isRoot) {
        fullPath = this.squashDirectoryNames(fullPath);
      }
      this.path = fullPath;
      this.realPath = this.path;
      if (fs.isCaseInsensitive()) {
        this.lowerCasePath = this.path.toLowerCase();
        this.lowerCaseRealPath = this.lowerCasePath;
      }
      if (this.isRoot == null) {
        this.isRoot = false;
      }
      if (this.expansionState == null) {
        this.expansionState = {};
      }
      if ((base = this.expansionState).isExpanded == null) {
        base.isExpanded = false;
      }
      if ((base1 = this.expansionState).entries == null) {
        base1.entries = {};
      }
      this.status = null;
      this.entries = {};
      this.submodule = (ref1 = repoForPath(this.path)) != null ? ref1.isSubmodule(this.path) : void 0;
      this.subscribeToRepo();
      this.updateStatus();
      this.loadRealPath();
    }

    Directory.prototype.destroy = function() {
      this.destroyed = true;
      this.unwatch();
      this.subscriptions.dispose();
      return this.emitter.emit('did-destroy');
    };

    Directory.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    Directory.prototype.onDidStatusChange = function(callback) {
      return this.emitter.on('did-status-change', callback);
    };

    Directory.prototype.onDidAddEntries = function(callback) {
      return this.emitter.on('did-add-entries', callback);
    };

    Directory.prototype.onDidRemoveEntries = function(callback) {
      return this.emitter.on('did-remove-entries', callback);
    };

    Directory.prototype.onDidCollapse = function(callback) {
      return this.emitter.on('did-collapse', callback);
    };

    Directory.prototype.onDidExpand = function(callback) {
      return this.emitter.on('did-expand', callback);
    };

    Directory.prototype.loadRealPath = function() {
      if (this.useSyncFS) {
        this.realPath = fs.realpathSync(this.path);
        if (fs.isCaseInsensitive()) {
          return this.lowerCaseRealPath = this.realPath.toLowerCase();
        }
      } else {
        return fs.realpath(this.path, realpathCache, (function(_this) {
          return function(error, realPath) {
            if (_this.destroyed) {
              return;
            }
            if (realPath && realPath !== _this.path) {
              _this.realPath = realPath;
              if (fs.isCaseInsensitive()) {
                _this.lowerCaseRealPath = _this.realPath.toLowerCase();
              }
              return _this.updateStatus();
            }
          };
        })(this));
      }
    };

    Directory.prototype.subscribeToRepo = function() {
      var repo;
      repo = repoForPath(this.path);
      if (repo == null) {
        return;
      }
      this.subscriptions.add(repo.onDidChangeStatus((function(_this) {
        return function(event) {
          if (_this.contains(event.path)) {
            return _this.updateStatus(repo);
          }
        };
      })(this)));
      return this.subscriptions.add(repo.onDidChangeStatuses((function(_this) {
        return function() {
          return _this.updateStatus(repo);
        };
      })(this)));
    };

    Directory.prototype.updateStatus = function() {
      var newStatus, repo, status;
      repo = repoForPath(this.path);
      if (repo == null) {
        return;
      }
      newStatus = null;
      if (repo.isPathIgnored(this.path)) {
        newStatus = 'ignored';
      } else {
        status = repo.getDirectoryStatus(this.path);
        if (repo.isStatusModified(status)) {
          newStatus = 'modified';
        } else if (repo.isStatusNew(status)) {
          newStatus = 'added';
        }
      }
      if (newStatus !== this.status) {
        this.status = newStatus;
        return this.emitter.emit('did-status-change', newStatus);
      }
    };

    Directory.prototype.isPathIgnored = function(filePath) {
      var i, ignoredPattern, len, ref1, repo;
      if (atom.config.get('tree-view.hideVcsIgnoredFiles')) {
        repo = repoForPath(this.path);
        if ((repo != null) && repo.isProjectAtRoot() && repo.isPathIgnored(filePath)) {
          return true;
        }
      }
      if (atom.config.get('tree-view.hideIgnoredNames')) {
        ref1 = this.ignoredPatterns;
        for (i = 0, len = ref1.length; i < len; i++) {
          ignoredPattern = ref1[i];
          if (ignoredPattern.match(filePath)) {
            return true;
          }
        }
      }
      return false;
    };

    Directory.prototype.isPathPrefixOf = function(prefix, fullPath) {
      return fullPath.indexOf(prefix) === 0 && fullPath[prefix.length] === path.sep;
    };

    Directory.prototype.isPathEqual = function(pathToCompare) {
      return this.path === pathToCompare || this.realPath === pathToCompare;
    };

    Directory.prototype.contains = function(pathToCheck) {
      var directoryPath;
      if (!pathToCheck) {
        return false;
      }
      if (process.platform === 'win32') {
        pathToCheck = pathToCheck.replace(/\//g, '\\');
      }
      if (fs.isCaseInsensitive()) {
        directoryPath = this.lowerCasePath;
        pathToCheck = pathToCheck.toLowerCase();
      } else {
        directoryPath = this.path;
      }
      if (this.isPathPrefixOf(directoryPath, pathToCheck)) {
        return true;
      }
      if (this.realPath !== this.path) {
        if (fs.isCaseInsensitive()) {
          directoryPath = this.lowerCaseRealPath;
        } else {
          directoryPath = this.realPath;
        }
        return this.isPathPrefixOf(directoryPath, pathToCheck);
      }
      return false;
    };

    Directory.prototype.unwatch = function() {
      var entry, key, ref1, results;
      if (this.watchSubscription != null) {
        this.watchSubscription.close();
        this.watchSubscription = null;
      }
      ref1 = this.entries;
      results = [];
      for (key in ref1) {
        entry = ref1[key];
        entry.destroy();
        results.push(delete this.entries[key]);
      }
      return results;
    };

    Directory.prototype.watch = function() {
      try {
        return this.watchSubscription != null ? this.watchSubscription : this.watchSubscription = PathWatcher.watch(this.path, (function(_this) {
          return function(eventType) {
            switch (eventType) {
              case 'change':
                return _this.reload();
              case 'delete':
                return _this.destroy();
            }
          };
        })(this));
      } catch (error1) {}
    };

    Directory.prototype.getEntries = function() {
      var directories, error, expansionState, files, fullPath, i, j, key, len, len1, name, names, ref1, ref2, stat, statFlat, symlink;
      try {
        names = fs.readdirSync(this.path);
      } catch (error1) {
        error = error1;
        names = [];
      }
      names.sort(new Intl.Collator(void 0, {
        numeric: true,
        sensitivity: "base"
      }).compare);
      files = [];
      directories = [];
      for (i = 0, len = names.length; i < len; i++) {
        name = names[i];
        fullPath = path.join(this.path, name);
        if (this.isPathIgnored(fullPath)) {
          continue;
        }
        stat = fs.lstatSyncNoException(fullPath);
        symlink = typeof stat.isSymbolicLink === "function" ? stat.isSymbolicLink() : void 0;
        if (symlink) {
          stat = fs.statSyncNoException(fullPath);
        }
        statFlat = _.pick.apply(_, [stat].concat(slice.call(_.keys(stat))));
        ref1 = ["atime", "birthtime", "ctime", "mtime"];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          key = ref1[j];
          statFlat[key] = (ref2 = statFlat[key]) != null ? ref2.getTime() : void 0;
        }
        if (typeof stat.isDirectory === "function" ? stat.isDirectory() : void 0) {
          if (this.entries.hasOwnProperty(name)) {
            directories.push(name);
          } else {
            expansionState = this.expansionState.entries[name];
            directories.push(new Directory({
              name: name,
              fullPath: fullPath,
              symlink: symlink,
              expansionState: expansionState,
              ignoredPatterns: this.ignoredPatterns,
              useSyncFS: this.useSyncFS,
              stats: statFlat
            }));
          }
        } else if (typeof stat.isFile === "function" ? stat.isFile() : void 0) {
          if (this.entries.hasOwnProperty(name)) {
            files.push(name);
          } else {
            files.push(new File({
              name: name,
              fullPath: fullPath,
              symlink: symlink,
              realpathCache: realpathCache,
              useSyncFS: this.useSyncFS,
              stats: statFlat
            }));
          }
        }
      }
      return this.sortEntries(directories.concat(files));
    };

    Directory.prototype.normalizeEntryName = function(value) {
      var normalizedValue;
      normalizedValue = value.name;
      if (normalizedValue == null) {
        normalizedValue = value;
      }
      if (normalizedValue != null) {
        normalizedValue = normalizedValue.toLowerCase();
      }
      return normalizedValue;
    };

    Directory.prototype.sortEntries = function(combinedEntries) {
      if (atom.config.get('tree-view.sortFoldersBeforeFiles')) {
        return combinedEntries;
      } else {
        return combinedEntries.sort((function(_this) {
          return function(first, second) {
            var firstName, secondName;
            firstName = _this.normalizeEntryName(first);
            secondName = _this.normalizeEntryName(second);
            return firstName.localeCompare(secondName);
          };
        })(this));
      }
    };

    Directory.prototype.reload = function() {
      var entriesRemoved, entry, i, index, j, len, len1, name, newEntries, ref1, removedEntries;
      newEntries = [];
      removedEntries = _.clone(this.entries);
      index = 0;
      ref1 = this.getEntries();
      for (i = 0, len = ref1.length; i < len; i++) {
        entry = ref1[i];
        if (this.entries.hasOwnProperty(entry)) {
          delete removedEntries[entry];
          index++;
          continue;
        }
        entry.indexInParentDirectory = index;
        index++;
        newEntries.push(entry);
      }
      entriesRemoved = false;
      for (name in removedEntries) {
        entry = removedEntries[name];
        entriesRemoved = true;
        entry.destroy();
        if (this.entries.hasOwnProperty(name)) {
          delete this.entries[name];
        }
        if (this.expansionState.entries.hasOwnProperty(name)) {
          delete this.expansionState.entries[name];
        }
      }
      if (entriesRemoved) {
        this.emitter.emit('did-remove-entries', removedEntries);
      }
      if (newEntries.length > 0) {
        for (j = 0, len1 = newEntries.length; j < len1; j++) {
          entry = newEntries[j];
          this.entries[entry.name] = entry;
        }
        return this.emitter.emit('did-add-entries', newEntries);
      }
    };

    Directory.prototype.collapse = function() {
      this.expansionState.isExpanded = false;
      this.expansionState = this.serializeExpansionState();
      this.unwatch();
      return this.emitter.emit('did-collapse');
    };

    Directory.prototype.expand = function() {
      this.expansionState.isExpanded = true;
      this.reload();
      this.watch();
      return this.emitter.emit('did-expand');
    };

    Directory.prototype.serializeExpansionState = function() {
      var entry, expansionState, name, ref1;
      expansionState = {};
      expansionState.isExpanded = this.expansionState.isExpanded;
      expansionState.entries = {};
      ref1 = this.entries;
      for (name in ref1) {
        entry = ref1[name];
        if (entry.expansionState != null) {
          expansionState.entries[name] = entry.serializeExpansionState();
        }
      }
      return expansionState;
    };

    Directory.prototype.squashDirectoryNames = function(fullPath) {
      var contents, error, relativeDir, squashedDirs;
      squashedDirs = [this.name];
      while (true) {
        try {
          contents = fs.listSync(fullPath);
        } catch (error1) {
          error = error1;
          break;
        }
        if (contents.length !== 1) {
          break;
        }
        if (!fs.isDirectorySync(contents[0])) {
          break;
        }
        relativeDir = path.relative(fullPath, contents[0]);
        squashedDirs.push(relativeDir);
        fullPath = path.join(fullPath, relativeDir);
      }
      if (squashedDirs.length > 1) {
        this.squashedNames = [squashedDirs.slice(0, +(squashedDirs.length - 2) + 1 || 9e9).join(path.sep) + path.sep, _.last(squashedDirs)];
      }
      return fullPath;
    };

    return Directory;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3RyZWUtdmlldy9saWIvZGlyZWN0b3J5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsd0dBQUE7SUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUFpQyxPQUFBLENBQVEsV0FBUixDQUFqQyxFQUFDLDZDQUFELEVBQXNCOztFQUN0QixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsV0FBQSxHQUFjLE9BQUEsQ0FBUSxhQUFSOztFQUNkLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDTixjQUFlLE9BQUEsQ0FBUSxXQUFSOztFQUNoQixhQUFBLEdBQWdCOztFQUVoQixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MsbUJBQUMsR0FBRDtBQUNYLFVBQUE7TUFEYSxJQUFDLENBQUEsV0FBQSxNQUFNLHlCQUFVLElBQUMsQ0FBQSxjQUFBLFNBQVMsSUFBQyxDQUFBLHFCQUFBLGdCQUFnQixJQUFDLENBQUEsYUFBQSxRQUFRLElBQUMsQ0FBQSxzQkFBQSxpQkFBaUIsSUFBQyxDQUFBLGdCQUFBLFdBQVcsSUFBQyxDQUFBLFlBQUE7TUFDakcsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUNiLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxPQUFBLENBQUE7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLG1CQUFBLENBQUE7TUFFckIsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLENBQUEsSUFBc0QsQ0FBSSxJQUFDLENBQUEsTUFBOUQ7UUFDRSxRQUFBLEdBQVcsSUFBQyxDQUFBLG9CQUFELENBQXNCLFFBQXRCLEVBRGI7O01BR0EsSUFBQyxDQUFBLElBQUQsR0FBUTtNQUNSLElBQUMsQ0FBQSxRQUFE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QSxnQkFBQTs7UUFDQSxJQUFTLENBQUksRUFBRSxDQUFDLGVBQUgsQ0FBbUIsUUFBUyxDQUFBLENBQUEsQ0FBNUIsQ0FBYjtBQUFBLGdCQUFBOztRQUNBLFdBQUEsR0FBYyxJQUFJLENBQUMsUUFBTCxDQUFjLFFBQWQsRUFBd0IsUUFBUyxDQUFBLENBQUEsQ0FBakM7UUFDZCxZQUFZLENBQUMsSUFBYixDQUFrQixXQUFsQjtRQUNBLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBb0IsV0FBcEI7TUFUYjtNQVdBLElBQUcsWUFBWSxDQUFDLE1BQWIsR0FBc0IsQ0FBekI7UUFDRSxJQUFDLENBQUEsYUFBRCxHQUFpQixDQUFDLFlBQWEsZ0RBQTJCLENBQUMsSUFBekMsQ0FBOEMsSUFBSSxDQUFDLEdBQW5ELENBQUEsR0FBMEQsSUFBSSxDQUFDLEdBQWhFLEVBQXFFLENBQUMsQ0FBQyxJQUFGLENBQU8sWUFBUCxDQUFyRSxFQURuQjs7QUFHQSxhQUFPO0lBaEJhOzs7OztBQXhSeEIiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gPSByZXF1aXJlICdldmVudC1raXQnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5QYXRoV2F0Y2hlciA9IHJlcXVpcmUgJ3BhdGh3YXRjaGVyJ1xuRmlsZSA9IHJlcXVpcmUgJy4vZmlsZSdcbntyZXBvRm9yUGF0aH0gPSByZXF1aXJlICcuL2hlbHBlcnMnXG5yZWFscGF0aENhY2hlID0ge31cblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRGlyZWN0b3J5XG4gIGNvbnN0cnVjdG9yOiAoe0BuYW1lLCBmdWxsUGF0aCwgQHN5bWxpbmssIEBleHBhbnNpb25TdGF0ZSwgQGlzUm9vdCwgQGlnbm9yZWRQYXR0ZXJucywgQHVzZVN5bmNGUywgQHN0YXRzfSkgLT5cbiAgICBAZGVzdHJveWVkID0gZmFsc2VcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIGlmIGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LnNxdWFzaERpcmVjdG9yeU5hbWVzJykgYW5kIG5vdCBAaXNSb290XG4gICAgICBmdWxsUGF0aCA9IEBzcXVhc2hEaXJlY3RvcnlOYW1lcyhmdWxsUGF0aClcblxuICAgIEBwYXRoID0gZnVsbFBhdGhcbiAgICBAcmVhbFBhdGggPSBAcGF0aFxuICAgIGlmIGZzLmlzQ2FzZUluc2Vuc2l0aXZlKClcbiAgICAgIEBsb3dlckNhc2VQYXRoID0gQHBhdGgudG9Mb3dlckNhc2UoKVxuICAgICAgQGxvd2VyQ2FzZVJlYWxQYXRoID0gQGxvd2VyQ2FzZVBhdGhcblxuICAgIEBpc1Jvb3QgPz0gZmFsc2VcbiAgICBAZXhwYW5zaW9uU3RhdGUgPz0ge31cbiAgICBAZXhwYW5zaW9uU3RhdGUuaXNFeHBhbmRlZCA/PSBmYWxzZVxuICAgIEBleHBhbnNpb25TdGF0ZS5lbnRyaWVzID89IHt9XG4gICAgQHN0YXR1cyA9IG51bGxcbiAgICBAZW50cmllcyA9IHt9XG5cbiAgICBAc3VibW9kdWxlID0gcmVwb0ZvclBhdGgoQHBhdGgpPy5pc1N1Ym1vZHVsZShAcGF0aClcblxuICAgIEBzdWJzY3JpYmVUb1JlcG8oKVxuICAgIEB1cGRhdGVTdGF0dXMoKVxuICAgIEBsb2FkUmVhbFBhdGgoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRlc3Ryb3llZCA9IHRydWVcbiAgICBAdW53YXRjaCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWRlc3Ryb3knKVxuXG4gIG9uRGlkRGVzdHJveTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdkaWQtZGVzdHJveScsIGNhbGxiYWNrKVxuXG4gIG9uRGlkU3RhdHVzQ2hhbmdlOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24oJ2RpZC1zdGF0dXMtY2hhbmdlJywgY2FsbGJhY2spXG5cbiAgb25EaWRBZGRFbnRyaWVzOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24oJ2RpZC1hZGQtZW50cmllcycsIGNhbGxiYWNrKVxuXG4gIG9uRGlkUmVtb3ZlRW50cmllczogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdkaWQtcmVtb3ZlLWVudHJpZXMnLCBjYWxsYmFjaylcblxuICBvbkRpZENvbGxhcHNlOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24oJ2RpZC1jb2xsYXBzZScsIGNhbGxiYWNrKVxuXG4gIG9uRGlkRXhwYW5kOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24oJ2RpZC1leHBhbmQnLCBjYWxsYmFjaylcblxuICBsb2FkUmVhbFBhdGg6IC0+XG4gICAgaWYgQHVzZVN5bmNGU1xuICAgICAgQHJlYWxQYXRoID0gZnMucmVhbHBhdGhTeW5jKEBwYXRoKVxuICAgICAgQGxvd2VyQ2FzZVJlYWxQYXRoID0gQHJlYWxQYXRoLnRvTG93ZXJDYXNlKCkgaWYgZnMuaXNDYXNlSW5zZW5zaXRpdmUoKVxuICAgIGVsc2VcbiAgICAgIGZzLnJlYWxwYXRoIEBwYXRoLCByZWFscGF0aENhY2hlLCAoZXJyb3IsIHJlYWxQYXRoKSA9PlxuICAgICAgICByZXR1cm4gaWYgQGRlc3Ryb3llZFxuICAgICAgICBpZiByZWFsUGF0aCBhbmQgcmVhbFBhdGggaXNudCBAcGF0aFxuICAgICAgICAgIEByZWFsUGF0aCA9IHJlYWxQYXRoXG4gICAgICAgICAgQGxvd2VyQ2FzZVJlYWxQYXRoID0gQHJlYWxQYXRoLnRvTG93ZXJDYXNlKCkgaWYgZnMuaXNDYXNlSW5zZW5zaXRpdmUoKVxuICAgICAgICAgIEB1cGRhdGVTdGF0dXMoKVxuXG4gICMgU3Vic2NyaWJlIHRvIHByb2plY3QncyByZXBvIGZvciBjaGFuZ2VzIHRvIHRoZSBHaXQgc3RhdHVzIG9mIHRoaXMgZGlyZWN0b3J5LlxuICBzdWJzY3JpYmVUb1JlcG86IC0+XG4gICAgcmVwbyA9IHJlcG9Gb3JQYXRoKEBwYXRoKVxuICAgIHJldHVybiB1bmxlc3MgcmVwbz9cblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCByZXBvLm9uRGlkQ2hhbmdlU3RhdHVzIChldmVudCkgPT5cbiAgICAgIEB1cGRhdGVTdGF0dXMocmVwbykgaWYgQGNvbnRhaW5zKGV2ZW50LnBhdGgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIHJlcG8ub25EaWRDaGFuZ2VTdGF0dXNlcyA9PlxuICAgICAgQHVwZGF0ZVN0YXR1cyhyZXBvKVxuXG4gICMgVXBkYXRlIHRoZSBzdGF0dXMgcHJvcGVydHkgb2YgdGhpcyBkaXJlY3RvcnkgdXNpbmcgdGhlIHJlcG8uXG4gIHVwZGF0ZVN0YXR1czogLT5cbiAgICByZXBvID0gcmVwb0ZvclBhdGgoQHBhdGgpXG4gICAgcmV0dXJuIHVubGVzcyByZXBvP1xuXG4gICAgbmV3U3RhdHVzID0gbnVsbFxuICAgIGlmIHJlcG8uaXNQYXRoSWdub3JlZChAcGF0aClcbiAgICAgIG5ld1N0YXR1cyA9ICdpZ25vcmVkJ1xuICAgIGVsc2VcbiAgICAgIHN0YXR1cyA9IHJlcG8uZ2V0RGlyZWN0b3J5U3RhdHVzKEBwYXRoKVxuICAgICAgaWYgcmVwby5pc1N0YXR1c01vZGlmaWVkKHN0YXR1cylcbiAgICAgICAgbmV3U3RhdHVzID0gJ21vZGlmaWVkJ1xuICAgICAgZWxzZSBpZiByZXBvLmlzU3RhdHVzTmV3KHN0YXR1cylcbiAgICAgICAgbmV3U3RhdHVzID0gJ2FkZGVkJ1xuXG4gICAgaWYgbmV3U3RhdHVzIGlzbnQgQHN0YXR1c1xuICAgICAgQHN0YXR1cyA9IG5ld1N0YXR1c1xuICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLXN0YXR1cy1jaGFuZ2UnLCBuZXdTdGF0dXMpXG5cbiAgIyBJcyB0aGUgZ2l2ZW4gcGF0aCBpZ25vcmVkP1xuICBpc1BhdGhJZ25vcmVkOiAoZmlsZVBhdGgpIC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCd0cmVlLXZpZXcuaGlkZVZjc0lnbm9yZWRGaWxlcycpXG4gICAgICByZXBvID0gcmVwb0ZvclBhdGgoQHBhdGgpXG4gICAgICByZXR1cm4gdHJ1ZSBpZiByZXBvPyBhbmQgcmVwby5pc1Byb2plY3RBdFJvb3QoKSBhbmQgcmVwby5pc1BhdGhJZ25vcmVkKGZpbGVQYXRoKVxuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCd0cmVlLXZpZXcuaGlkZUlnbm9yZWROYW1lcycpXG4gICAgICBmb3IgaWdub3JlZFBhdHRlcm4gaW4gQGlnbm9yZWRQYXR0ZXJuc1xuICAgICAgICByZXR1cm4gdHJ1ZSBpZiBpZ25vcmVkUGF0dGVybi5tYXRjaChmaWxlUGF0aClcblxuICAgIGZhbHNlXG5cbiAgIyBEb2VzIGdpdmVuIGZ1bGwgcGF0aCBzdGFydCB3aXRoIHRoZSBnaXZlbiBwcmVmaXg/XG4gIGlzUGF0aFByZWZpeE9mOiAocHJlZml4LCBmdWxsUGF0aCkgLT5cbiAgICBmdWxsUGF0aC5pbmRleE9mKHByZWZpeCkgaXMgMCBhbmQgZnVsbFBhdGhbcHJlZml4Lmxlbmd0aF0gaXMgcGF0aC5zZXBcblxuICBpc1BhdGhFcXVhbDogKHBhdGhUb0NvbXBhcmUpIC0+XG4gICAgQHBhdGggaXMgcGF0aFRvQ29tcGFyZSBvciBAcmVhbFBhdGggaXMgcGF0aFRvQ29tcGFyZVxuXG4gICMgUHVibGljOiBEb2VzIHRoaXMgZGlyZWN0b3J5IGNvbnRhaW4gdGhlIGdpdmVuIHBhdGg/XG4gICNcbiAgIyBTZWUgYXRvbS5EaXJlY3Rvcnk6OmNvbnRhaW5zIGZvciBtb3JlIGRldGFpbHMuXG4gIGNvbnRhaW5zOiAocGF0aFRvQ2hlY2spIC0+XG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBwYXRoVG9DaGVja1xuXG4gICAgIyBOb3JtYWxpemUgZm9yd2FyZCBzbGFzaGVzIHRvIGJhY2sgc2xhc2hlcyBvbiB3aW5kb3dzXG4gICAgcGF0aFRvQ2hlY2sgPSBwYXRoVG9DaGVjay5yZXBsYWNlKC9cXC8vZywgJ1xcXFwnKSBpZiBwcm9jZXNzLnBsYXRmb3JtIGlzICd3aW4zMidcblxuICAgIGlmIGZzLmlzQ2FzZUluc2Vuc2l0aXZlKClcbiAgICAgIGRpcmVjdG9yeVBhdGggPSBAbG93ZXJDYXNlUGF0aFxuICAgICAgcGF0aFRvQ2hlY2sgPSBwYXRoVG9DaGVjay50b0xvd2VyQ2FzZSgpXG4gICAgZWxzZVxuICAgICAgZGlyZWN0b3J5UGF0aCA9IEBwYXRoXG5cbiAgICByZXR1cm4gdHJ1ZSBpZiBAaXNQYXRoUHJlZml4T2YoZGlyZWN0b3J5UGF0aCwgcGF0aFRvQ2hlY2spXG5cbiAgICAjIENoZWNrIHJlYWwgcGF0aFxuICAgIGlmIEByZWFsUGF0aCBpc250IEBwYXRoXG4gICAgICBpZiBmcy5pc0Nhc2VJbnNlbnNpdGl2ZSgpXG4gICAgICAgIGRpcmVjdG9yeVBhdGggPSBAbG93ZXJDYXNlUmVhbFBhdGhcbiAgICAgIGVsc2VcbiAgICAgICAgZGlyZWN0b3J5UGF0aCA9IEByZWFsUGF0aFxuXG4gICAgICByZXR1cm4gQGlzUGF0aFByZWZpeE9mKGRpcmVjdG9yeVBhdGgsIHBhdGhUb0NoZWNrKVxuXG4gICAgZmFsc2VcblxuICAjIFB1YmxpYzogU3RvcCB3YXRjaGluZyB0aGlzIGRpcmVjdG9yeSBmb3IgY2hhbmdlcy5cbiAgdW53YXRjaDogLT5cbiAgICBpZiBAd2F0Y2hTdWJzY3JpcHRpb24/XG4gICAgICBAd2F0Y2hTdWJzY3JpcHRpb24uY2xvc2UoKVxuICAgICAgQHdhdGNoU3Vic2NyaXB0aW9uID0gbnVsbFxuXG4gICAgZm9yIGtleSwgZW50cnkgb2YgQGVudHJpZXNcbiAgICAgIGVudHJ5LmRlc3Ryb3koKVxuICAgICAgZGVsZXRlIEBlbnRyaWVzW2tleV1cblxuICAjIFB1YmxpYzogV2F0Y2ggdGhpcyBkaXJlY3RvcnkgZm9yIGNoYW5nZXMuXG4gIHdhdGNoOiAtPlxuICAgIHRyeVxuICAgICAgQHdhdGNoU3Vic2NyaXB0aW9uID89IFBhdGhXYXRjaGVyLndhdGNoIEBwYXRoLCAoZXZlbnRUeXBlKSA9PlxuICAgICAgICBzd2l0Y2ggZXZlbnRUeXBlXG4gICAgICAgICAgd2hlbiAnY2hhbmdlJyB0aGVuIEByZWxvYWQoKVxuICAgICAgICAgIHdoZW4gJ2RlbGV0ZScgdGhlbiBAZGVzdHJveSgpXG5cbiAgZ2V0RW50cmllczogLT5cbiAgICB0cnlcbiAgICAgIG5hbWVzID0gZnMucmVhZGRpclN5bmMoQHBhdGgpXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIG5hbWVzID0gW11cbiAgICBuYW1lcy5zb3J0KG5ldyBJbnRsLkNvbGxhdG9yKHVuZGVmaW5lZCwge251bWVyaWM6IHRydWUsIHNlbnNpdGl2aXR5OiBcImJhc2VcIn0pLmNvbXBhcmUpXG5cbiAgICBmaWxlcyA9IFtdXG4gICAgZGlyZWN0b3JpZXMgPSBbXVxuXG4gICAgZm9yIG5hbWUgaW4gbmFtZXNcbiAgICAgIGZ1bGxQYXRoID0gcGF0aC5qb2luKEBwYXRoLCBuYW1lKVxuICAgICAgY29udGludWUgaWYgQGlzUGF0aElnbm9yZWQoZnVsbFBhdGgpXG5cbiAgICAgIHN0YXQgPSBmcy5sc3RhdFN5bmNOb0V4Y2VwdGlvbihmdWxsUGF0aClcbiAgICAgIHN5bWxpbmsgPSBzdGF0LmlzU3ltYm9saWNMaW5rPygpXG4gICAgICBzdGF0ID0gZnMuc3RhdFN5bmNOb0V4Y2VwdGlvbihmdWxsUGF0aCkgaWYgc3ltbGlua1xuICAgICAgc3RhdEZsYXQgPSBfLnBpY2sgc3RhdCwgXy5rZXlzKHN0YXQpLi4uXG4gICAgICBmb3Iga2V5IGluIFtcImF0aW1lXCIsIFwiYmlydGh0aW1lXCIsIFwiY3RpbWVcIiwgXCJtdGltZVwiXVxuICAgICAgICBzdGF0RmxhdFtrZXldID0gc3RhdEZsYXRba2V5XT8uZ2V0VGltZSgpXG5cbiAgICAgIGlmIHN0YXQuaXNEaXJlY3Rvcnk/KClcbiAgICAgICAgaWYgQGVudHJpZXMuaGFzT3duUHJvcGVydHkobmFtZSlcbiAgICAgICAgICAjIHB1c2ggYSBwbGFjZWhvbGRlciBzaW5jZSB0aGlzIGVudHJ5IGFscmVhZHkgZXhpc3RzIGJ1dCB0aGlzIGhlbHBzXG4gICAgICAgICAgIyB0cmFjayB0aGUgaW5zZXJ0aW9uIGluZGV4IGZvciB0aGUgY3JlYXRlZCB2aWV3c1xuICAgICAgICAgIGRpcmVjdG9yaWVzLnB1c2gobmFtZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGV4cGFuc2lvblN0YXRlID0gQGV4cGFuc2lvblN0YXRlLmVudHJpZXNbbmFtZV1cbiAgICAgICAgICBkaXJlY3Rvcmllcy5wdXNoKG5ldyBEaXJlY3Rvcnkoe25hbWUsIGZ1bGxQYXRoLCBzeW1saW5rLCBleHBhbnNpb25TdGF0ZSwgQGlnbm9yZWRQYXR0ZXJucywgQHVzZVN5bmNGUywgc3RhdHM6IHN0YXRGbGF0fSkpXG4gICAgICBlbHNlIGlmIHN0YXQuaXNGaWxlPygpXG4gICAgICAgIGlmIEBlbnRyaWVzLmhhc093blByb3BlcnR5KG5hbWUpXG4gICAgICAgICAgIyBwdXNoIGEgcGxhY2Vob2xkZXIgc2luY2UgdGhpcyBlbnRyeSBhbHJlYWR5IGV4aXN0cyBidXQgdGhpcyBoZWxwc1xuICAgICAgICAgICMgdHJhY2sgdGhlIGluc2VydGlvbiBpbmRleCBmb3IgdGhlIGNyZWF0ZWQgdmlld3NcbiAgICAgICAgICBmaWxlcy5wdXNoKG5hbWUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmaWxlcy5wdXNoKG5ldyBGaWxlKHtuYW1lLCBmdWxsUGF0aCwgc3ltbGluaywgcmVhbHBhdGhDYWNoZSwgQHVzZVN5bmNGUywgc3RhdHM6IHN0YXRGbGF0fSkpXG5cbiAgICBAc29ydEVudHJpZXMoZGlyZWN0b3JpZXMuY29uY2F0KGZpbGVzKSlcblxuICBub3JtYWxpemVFbnRyeU5hbWU6ICh2YWx1ZSkgLT5cbiAgICBub3JtYWxpemVkVmFsdWUgPSB2YWx1ZS5uYW1lXG4gICAgdW5sZXNzIG5vcm1hbGl6ZWRWYWx1ZT9cbiAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9IHZhbHVlXG4gICAgaWYgbm9ybWFsaXplZFZhbHVlP1xuICAgICAgbm9ybWFsaXplZFZhbHVlID0gbm9ybWFsaXplZFZhbHVlLnRvTG93ZXJDYXNlKClcbiAgICBub3JtYWxpemVkVmFsdWVcblxuICBzb3J0RW50cmllczogKGNvbWJpbmVkRW50cmllcykgLT5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3RyZWUtdmlldy5zb3J0Rm9sZGVyc0JlZm9yZUZpbGVzJylcbiAgICAgIGNvbWJpbmVkRW50cmllc1xuICAgIGVsc2VcbiAgICAgIGNvbWJpbmVkRW50cmllcy5zb3J0IChmaXJzdCwgc2Vjb25kKSA9PlxuICAgICAgICBmaXJzdE5hbWUgPSBAbm9ybWFsaXplRW50cnlOYW1lKGZpcnN0KVxuICAgICAgICBzZWNvbmROYW1lID0gQG5vcm1hbGl6ZUVudHJ5TmFtZShzZWNvbmQpXG4gICAgICAgIGZpcnN0TmFtZS5sb2NhbGVDb21wYXJlKHNlY29uZE5hbWUpXG5cbiAgIyBQdWJsaWM6IFBlcmZvcm0gYSBzeW5jaHJvbm91cyByZWxvYWQgb2YgdGhlIGRpcmVjdG9yeS5cbiAgcmVsb2FkOiAtPlxuICAgIG5ld0VudHJpZXMgPSBbXVxuICAgIHJlbW92ZWRFbnRyaWVzID0gXy5jbG9uZShAZW50cmllcylcbiAgICBpbmRleCA9IDBcblxuICAgIGZvciBlbnRyeSBpbiBAZ2V0RW50cmllcygpXG4gICAgICBpZiBAZW50cmllcy5oYXNPd25Qcm9wZXJ0eShlbnRyeSlcbiAgICAgICAgZGVsZXRlIHJlbW92ZWRFbnRyaWVzW2VudHJ5XVxuICAgICAgICBpbmRleCsrXG4gICAgICAgIGNvbnRpbnVlXG5cbiAgICAgIGVudHJ5LmluZGV4SW5QYXJlbnREaXJlY3RvcnkgPSBpbmRleFxuICAgICAgaW5kZXgrK1xuICAgICAgbmV3RW50cmllcy5wdXNoKGVudHJ5KVxuXG4gICAgZW50cmllc1JlbW92ZWQgPSBmYWxzZVxuICAgIGZvciBuYW1lLCBlbnRyeSBvZiByZW1vdmVkRW50cmllc1xuICAgICAgZW50cmllc1JlbW92ZWQgPSB0cnVlXG4gICAgICBlbnRyeS5kZXN0cm95KClcblxuICAgICAgaWYgQGVudHJpZXMuaGFzT3duUHJvcGVydHkobmFtZSlcbiAgICAgICAgZGVsZXRlIEBlbnRyaWVzW25hbWVdXG5cbiAgICAgIGlmIEBleHBhbnNpb25TdGF0ZS5lbnRyaWVzLmhhc093blByb3BlcnR5KG5hbWUpXG4gICAgICAgIGRlbGV0ZSBAZXhwYW5zaW9uU3RhdGUuZW50cmllc1tuYW1lXVxuXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLXJlbW92ZS1lbnRyaWVzJywgcmVtb3ZlZEVudHJpZXMpIGlmIGVudHJpZXNSZW1vdmVkXG5cbiAgICBpZiBuZXdFbnRyaWVzLmxlbmd0aCA+IDBcbiAgICAgIEBlbnRyaWVzW2VudHJ5Lm5hbWVdID0gZW50cnkgZm9yIGVudHJ5IGluIG5ld0VudHJpZXNcbiAgICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hZGQtZW50cmllcycsIG5ld0VudHJpZXMpXG5cbiAgIyBQdWJsaWM6IENvbGxhcHNlIHRoaXMgZGlyZWN0b3J5IGFuZCBzdG9wIHdhdGNoaW5nIGl0LlxuICBjb2xsYXBzZTogLT5cbiAgICBAZXhwYW5zaW9uU3RhdGUuaXNFeHBhbmRlZCA9IGZhbHNlXG4gICAgQGV4cGFuc2lvblN0YXRlID0gQHNlcmlhbGl6ZUV4cGFuc2lvblN0YXRlKClcbiAgICBAdW53YXRjaCgpXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNvbGxhcHNlJylcblxuICAjIFB1YmxpYzogRXhwYW5kIHRoaXMgZGlyZWN0b3J5LCBsb2FkIGl0cyBjaGlsZHJlbiwgYW5kIHN0YXJ0IHdhdGNoaW5nIGl0IGZvclxuICAjIGNoYW5nZXMuXG4gIGV4cGFuZDogLT5cbiAgICBAZXhwYW5zaW9uU3RhdGUuaXNFeHBhbmRlZCA9IHRydWVcbiAgICBAcmVsb2FkKClcbiAgICBAd2F0Y2goKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1leHBhbmQnKVxuXG4gIHNlcmlhbGl6ZUV4cGFuc2lvblN0YXRlOiAtPlxuICAgIGV4cGFuc2lvblN0YXRlID0ge31cbiAgICBleHBhbnNpb25TdGF0ZS5pc0V4cGFuZGVkID0gQGV4cGFuc2lvblN0YXRlLmlzRXhwYW5kZWRcbiAgICBleHBhbnNpb25TdGF0ZS5lbnRyaWVzID0ge31cbiAgICBmb3IgbmFtZSwgZW50cnkgb2YgQGVudHJpZXMgd2hlbiBlbnRyeS5leHBhbnNpb25TdGF0ZT9cbiAgICAgIGV4cGFuc2lvblN0YXRlLmVudHJpZXNbbmFtZV0gPSBlbnRyeS5zZXJpYWxpemVFeHBhbnNpb25TdGF0ZSgpXG4gICAgZXhwYW5zaW9uU3RhdGVcblxuICBzcXVhc2hEaXJlY3RvcnlOYW1lczogKGZ1bGxQYXRoKSAtPlxuICAgIHNxdWFzaGVkRGlycyA9IFtAbmFtZV1cbiAgICBsb29wXG4gICAgICB0cnlcbiAgICAgICAgY29udGVudHMgPSBmcy5saXN0U3luYyBmdWxsUGF0aFxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgYnJlYWtcbiAgICAgIGJyZWFrIGlmIGNvbnRlbnRzLmxlbmd0aCBpc250IDFcbiAgICAgIGJyZWFrIGlmIG5vdCBmcy5pc0RpcmVjdG9yeVN5bmMoY29udGVudHNbMF0pXG4gICAgICByZWxhdGl2ZURpciA9IHBhdGgucmVsYXRpdmUoZnVsbFBhdGgsIGNvbnRlbnRzWzBdKVxuICAgICAgc3F1YXNoZWREaXJzLnB1c2ggcmVsYXRpdmVEaXJcbiAgICAgIGZ1bGxQYXRoID0gcGF0aC5qb2luKGZ1bGxQYXRoLCByZWxhdGl2ZURpcilcblxuICAgIGlmIHNxdWFzaGVkRGlycy5sZW5ndGggPiAxXG4gICAgICBAc3F1YXNoZWROYW1lcyA9IFtzcXVhc2hlZERpcnNbMC4uc3F1YXNoZWREaXJzLmxlbmd0aCAtIDJdLmpvaW4ocGF0aC5zZXApICsgcGF0aC5zZXAsIF8ubGFzdChzcXVhc2hlZERpcnMpXVxuXG4gICAgcmV0dXJuIGZ1bGxQYXRoXG4iXX0=
