(function() {
  var $, AddDialog, BufferedProcess, CompositeDisposable, CopyDialog, Directory, DirectoryView, FileView, LocalStorage, Minimatch, MoveDialog, RootDragAndDrop, TreeView, View, _, fs, getFullExtension, getStyleObject, path, ref, ref1, ref2, repoForPath, shell, toggleConfig,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require('path');

  shell = require('electron').shell;

  _ = require('underscore-plus');

  ref = require('atom'), BufferedProcess = ref.BufferedProcess, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require("./helpers"), repoForPath = ref1.repoForPath, getStyleObject = ref1.getStyleObject, getFullExtension = ref1.getFullExtension;

  ref2 = require('atom-space-pen-views'), $ = ref2.$, View = ref2.View;

  fs = require('fs-plus');

  AddDialog = null;

  MoveDialog = null;

  CopyDialog = null;

  Minimatch = null;

  Directory = require('./directory');

  DirectoryView = require('./directory-view');

  FileView = require('./file-view');

  RootDragAndDrop = require('./root-drag-and-drop');

  LocalStorage = window.localStorage;

  toggleConfig = function(keyPath) {
    return atom.config.set(keyPath, !atom.config.get(keyPath));
  };

  module.exports = TreeView = (function(superClass) {
    extend(TreeView, superClass);

    function TreeView() {
      this.onDragLeave = bind(this.onDragLeave, this);
      this.onDragEnter = bind(this.onDragEnter, this);
      this.onStylesheetsChanged = bind(this.onStylesheetsChanged, this);
      this.resizeTreeView = bind(this.resizeTreeView, this);
      this.resizeStopped = bind(this.resizeStopped, this);
      this.resizeStarted = bind(this.resizeStarted, this);
      return TreeView.__super__.constructor.apply(this, arguments);
    }

    TreeView.prototype.panel = null;

    TreeView.content = function() {
      return this.div({
        "class": 'tree-view-resizer tool-panel',
        'data-show-on-right-side': atom.config.get('tree-view.showOnRightSide')
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'tree-view-scroller order--center',
            outlet: 'scroller'
          }, function() {
            return _this.ol({
              "class": 'tree-view full-menu list-tree has-collapsable-children focusable-panel',
              tabindex: -1,
              outlet: 'list'
            });
          });
          return _this.div({
            "class": 'tree-view-resize-handle',
            outlet: 'resizeHandle'
          });
        };
      })(this));
    };

    TreeView.prototype.initialize = function(state) {
      this.disposables = new CompositeDisposable;
      this.focusAfterAttach = false;
      this.roots = [];
      this.scrollLeftAfterAttach = -1;
      this.scrollTopAfterAttach = -1;
      this.selectedPath = null;
      this.ignoredPatterns = [];
      this.useSyncFS = false;
      this.currentlyOpening = new Map;
      this.dragEventCounts = new WeakMap;
      this.rootDragAndDrop = new RootDragAndDrop(this);
      this.handleEvents();
      process.nextTick((function(_this) {
        return function() {
          var onStylesheetsChanged;
          _this.onStylesheetsChanged();
          onStylesheetsChanged = _.debounce(_this.onStylesheetsChanged, 100);
          _this.disposables.add(atom.styles.onDidAddStyleElement(onStylesheetsChanged));
          _this.disposables.add(atom.styles.onDidRemoveStyleElement(onStylesheetsChanged));
          return _this.disposables.add(atom.styles.onDidUpdateStyleElement(onStylesheetsChanged));
        };
      })(this));
      this.updateRoots(state.directoryExpansionStates);
      this.selectEntry(this.roots[0]);
      if (state.selectedPath) {
        this.selectEntryForPath(state.selectedPath);
      }
      this.focusAfterAttach = state.hasFocus;
      if (state.scrollTop) {
        this.scrollTopAfterAttach = state.scrollTop;
      }
      if (state.scrollLeft) {
        this.scrollLeftAfterAttach = state.scrollLeft;
      }
      this.attachAfterProjectPathSet = state.attached && _.isEmpty(atom.project.getPaths());
      if (state.width > 0) {
        this.width(state.width);
      }
      if (state.attached) {
        return this.attach();
      }
    };

    TreeView.prototype.attached = function() {
      if (this.focusAfterAttach) {
        this.focus();
      }
      if (this.scrollLeftAfterAttach > 0) {
        this.scroller.scrollLeft(this.scrollLeftAfterAttach);
      }
      if (this.scrollTopAfterAttach > 0) {
        return this.scrollTop(this.scrollTopAfterAttach);
      }
    };

    TreeView.prototype.detached = function() {
      return this.resizeStopped();
    };

    TreeView.prototype.serialize = function() {
      var ref3;
      return {
        directoryExpansionStates: new (function(roots) {
          var j, len, root;
          for (j = 0, len = roots.length; j < len; j++) {
            root = roots[j];
            this[root.directory.path] = root.directory.serializeExpansionState();
          }
          return this;
        })(this.roots),
        selectedPath: (ref3 = this.selectedEntry()) != null ? ref3.getPath() : void 0,
        hasFocus: this.hasFocus(),
        attached: this.panel != null,
        scrollLeft: this.scroller.scrollLeft(),
        scrollTop: this.scrollTop(),
        width: this.width()
      };
    };

    TreeView.prototype.deactivate = function() {
      var j, len, ref3, root;
      ref3 = this.roots;
      for (j = 0, len = ref3.length; j < len; j++) {
        root = ref3[j];
        root.directory.destroy();
      }
      this.disposables.dispose();
      this.rootDragAndDrop.dispose();
      if (this.panel != null) {
        return this.detach();
      }
    };

    TreeView.prototype.handleEvents = function() {
      this.on('dblclick', '.tree-view-resize-handle', (function(_this) {
        return function() {
          return _this.resizeToFitContent();
        };
      })(this));
      this.on('click', '.entry', (function(_this) {
        return function(e) {
          if (e.target.classList.contains('entries')) {
            return;
          }
          if (!(e.shiftKey || e.metaKey || e.ctrlKey)) {
            return _this.entryClicked(e);
          }
        };
      })(this));
      this.on('mousedown', '.entry', (function(_this) {
        return function(e) {
          return _this.onMouseDown(e);
        };
      })(this));
      this.on('mousedown', '.tree-view-resize-handle', (function(_this) {
        return function(e) {
          return _this.resizeStarted(e);
        };
      })(this));
      this.on('dragstart', '.entry', (function(_this) {
        return function(e) {
          return _this.onDragStart(e);
        };
      })(this));
      this.on('dragenter', '.entry.directory > .header', (function(_this) {
        return function(e) {
          return _this.onDragEnter(e);
        };
      })(this));
      this.on('dragleave', '.entry.directory > .header', (function(_this) {
        return function(e) {
          return _this.onDragLeave(e);
        };
      })(this));
      this.on('dragover', '.entry', (function(_this) {
        return function(e) {
          return _this.onDragOver(e);
        };
      })(this));
      this.on('drop', '.entry', (function(_this) {
        return function(e) {
          return _this.onDrop(e);
        };
      })(this));
      atom.commands.add(this.element, {
        'core:move-up': this.moveUp.bind(this),
        'core:move-down': this.moveDown.bind(this),
        'core:page-up': (function(_this) {
          return function() {
            return _this.pageUp();
          };
        })(this),
        'core:page-down': (function(_this) {
          return function() {
            return _this.pageDown();
          };
        })(this),
        'core:move-to-top': (function(_this) {
          return function() {
            return _this.scrollToTop();
          };
        })(this),
        'core:move-to-bottom': (function(_this) {
          return function() {
            return _this.scrollToBottom();
          };
        })(this),
        'tree-view:expand-item': (function(_this) {
          return function() {
            return _this.openSelectedEntry({
              pending: true
            }, true);
          };
        })(this),
        'tree-view:recursive-expand-directory': (function(_this) {
          return function() {
            return _this.expandDirectory(true);
          };
        })(this),
        'tree-view:collapse-directory': (function(_this) {
          return function() {
            return _this.collapseDirectory();
          };
        })(this),
        'tree-view:recursive-collapse-directory': (function(_this) {
          return function() {
            return _this.collapseDirectory(true);
          };
        })(this),
        'tree-view:open-selected-entry': (function(_this) {
          return function() {
            return _this.openSelectedEntry();
          };
        })(this),
        'tree-view:open-selected-entry-right': (function(_this) {
          return function() {
            return _this.openSelectedEntryRight();
          };
        })(this),
        'tree-view:open-selected-entry-left': (function(_this) {
          return function() {
            return _this.openSelectedEntryLeft();
          };
        })(this),
        'tree-view:open-selected-entry-up': (function(_this) {
          return function() {
            return _this.openSelectedEntryUp();
          };
        })(this),
        'tree-view:open-selected-entry-down': (function(_this) {
          return function() {
            return _this.openSelectedEntryDown();
          };
        })(this),
        'tree-view:move': (function(_this) {
          return function() {
            return _this.moveSelectedEntry();
          };
        })(this),
        'tree-view:copy': (function(_this) {
          return function() {
            return _this.copySelectedEntries();
          };
        })(this),
        'tree-view:cut': (function(_this) {
          return function() {
            return _this.cutSelectedEntries();
          };
        })(this),
        'tree-view:paste': (function(_this) {
          return function() {
            return _this.pasteEntries();
          };
        })(this),
        'tree-view:copy-full-path': (function(_this) {
          return function() {
            return _this.copySelectedEntryPath(false);
          };
        })(this),
        'tree-view:show-in-file-manager': (function(_this) {
          return function() {
            return _this.showSelectedEntryInFileManager();
          };
        })(this),
        'tree-view:open-in-new-window': (function(_this) {
          return function() {
            return _this.openSelectedEntryInNewWindow();
          };
        })(this),
        'tree-view:copy-project-path': (function(_this) {
          return function() {
            return _this.copySelectedEntryPath(true);
          };
        })(this),
        'tool-panel:unfocus': (function(_this) {
          return function() {
            return _this.unfocus();
          };
        })(this),
        'tree-view:toggle-vcs-ignored-files': function() {
          return toggleConfig('tree-view.hideVcsIgnoredFiles');
        },
        'tree-view:toggle-ignored-names': function() {
          return toggleConfig('tree-view.hideIgnoredNames');
        },
        'tree-view:remove-project-folder': (function(_this) {
          return function(e) {
            return _this.removeProjectFolder(e);
          };
        })(this)
      });
      [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((function(_this) {
        return function(index) {
          return atom.commands.add(_this.element, "tree-view:open-selected-entry-in-pane-" + (index + 1), function() {
            return _this.openSelectedEntryInPane(index);
          });
        };
      })(this));
      this.disposables.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          _this.selectActiveFile();
          if (atom.config.get('tree-view.autoReveal')) {
            return _this.revealActiveFile();
          }
        };
      })(this)));
      this.disposables.add(atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.updateRoots();
        };
      })(this)));
      this.disposables.add(atom.config.onDidChange('tree-view.hideVcsIgnoredFiles', (function(_this) {
        return function() {
          return _this.updateRoots();
        };
      })(this)));
      this.disposables.add(atom.config.onDidChange('tree-view.hideIgnoredNames', (function(_this) {
        return function() {
          return _this.updateRoots();
        };
      })(this)));
      this.disposables.add(atom.config.onDidChange('core.ignoredNames', (function(_this) {
        return function() {
          if (atom.config.get('tree-view.hideIgnoredNames')) {
            return _this.updateRoots();
          }
        };
      })(this)));
      this.disposables.add(atom.config.onDidChange('tree-view.showOnRightSide', (function(_this) {
        return function(arg) {
          var newValue;
          newValue = arg.newValue;
          return _this.onSideToggled(newValue);
        };
      })(this)));
      this.disposables.add(atom.config.onDidChange('tree-view.sortFoldersBeforeFiles', (function(_this) {
        return function() {
          return _this.updateRoots();
        };
      })(this)));
      return this.disposables.add(atom.config.onDidChange('tree-view.squashDirectoryNames', (function(_this) {
        return function() {
          return _this.updateRoots();
        };
      })(this)));
    };

    TreeView.prototype.toggle = function() {
      if (this.isVisible()) {
        return this.detach();
      } else {
        return this.show();
      }
    };

    TreeView.prototype.show = function() {
      this.attach();
      return this.focus();
    };

    TreeView.prototype.attach = function() {
      if (_.isEmpty(atom.project.getPaths())) {
        return;
      }
      return this.panel != null ? this.panel : this.panel = atom.config.get('tree-view.showOnRightSide') ? atom.workspace.addRightPanel({
        item: this
      }) : atom.workspace.addLeftPanel({
        item: this
      });
    };

    TreeView.prototype.detach = function() {
      this.scrollLeftAfterAttach = this.scroller.scrollLeft();
      this.scrollTopAfterAttach = this.scrollTop();
      LocalStorage['tree-view:cutPath'] = null;
      LocalStorage['tree-view:copyPath'] = null;
      this.panel.destroy();
      this.panel = null;
      return this.unfocus();
    };

    TreeView.prototype.focus = function() {
      return this.list.focus();
    };

    TreeView.prototype.unfocus = function() {
      return atom.workspace.getActivePane().activate();
    };

    TreeView.prototype.hasFocus = function() {
      return this.list.is(':focus') || document.activeElement === this.list[0];
    };

    TreeView.prototype.toggleFocus = function() {
      if (this.hasFocus()) {
        return this.unfocus();
      } else {
        return this.show();
      }
    };

    TreeView.prototype.entryClicked = function(e) {
      var entry, isRecursive;
      entry = e.currentTarget;
      isRecursive = e.altKey || false;
      this.selectEntry(entry);
      if (entry instanceof DirectoryView) {
        entry.toggleExpansion(isRecursive);
      } else if (entry instanceof FileView) {
        this.fileViewEntryClicked(e);
      }
      return false;
    };

    TreeView.prototype.fileViewEntryClicked = function(e) {
      var alwaysOpenExisting, detail, filePath, openPromise, ref3, ref4;
      filePath = e.currentTarget.getPath();
      detail = (ref3 = (ref4 = e.originalEvent) != null ? ref4.detail : void 0) != null ? ref3 : 1;
      alwaysOpenExisting = atom.config.get('tree-view.alwaysOpenExisting');
      if (detail === 1) {
        if (atom.config.get('core.allowPendingPaneItems')) {
          openPromise = atom.workspace.open(filePath, {
            pending: true,
            activatePane: false,
            searchAllPanes: alwaysOpenExisting
          });
          this.currentlyOpening.set(filePath, openPromise);
          return openPromise.then((function(_this) {
            return function() {
              return _this.currentlyOpening["delete"](filePath);
            };
          })(this));
        }
      } else if (detail === 2) {
        return this.openAfterPromise(filePath, {
          searchAllPanes: alwaysOpenExisting
        });
      }
    };

    TreeView.prototype.openAfterPromise = function(uri, options) {
      var promise;
      if (promise = this.currentlyOpening.get(uri)) {
        return promise.then(function() {
          return atom.workspace.open(uri, options);
        });
      } else {
        return atom.workspace.open(uri, options);
      }
    };

    TreeView.prototype.resizeStarted = function() {
      $(document).on('mousemove', this.resizeTreeView);
      return $(document).on('mouseup', this.resizeStopped);
    };

    TreeView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizeTreeView);
      return $(document).off('mouseup', this.resizeStopped);
    };

    TreeView.prototype.resizeTreeView = function(arg) {
      var pageX, which, width;
      pageX = arg.pageX, which = arg.which;
      if (which !== 1) {
        return this.resizeStopped();
      }
      if (atom.config.get('tree-view.showOnRightSide')) {
        width = this.outerWidth() + this.offset().left - pageX;
      } else {
        width = pageX - this.offset().left;
      }
      return this.width(width);
    };

    TreeView.prototype.resizeToFitContent = function() {
      this.width(1);
      return this.width(this.list.outerWidth());
    };

    TreeView.prototype.loadIgnoredPatterns = function() {
      var error, ignoredName, ignoredNames, j, len, ref3, results;
      this.ignoredPatterns.length = 0;
      if (!atom.config.get('tree-view.hideIgnoredNames')) {
        return;
      }
      if (Minimatch == null) {
        Minimatch = require('minimatch').Minimatch;
      }
      ignoredNames = (ref3 = atom.config.get('core.ignoredNames')) != null ? ref3 : [];
      if (typeof ignoredNames === 'string') {
        ignoredNames = [ignoredNames];
      }
      results = [];
      for (j = 0, len = ignoredNames.length; j < len; j++) {
        ignoredName = ignoredNames[j];
        if (ignoredName) {
          try {
            results.push(this.ignoredPatterns.push(new Minimatch(ignoredName, {
              matchBase: true,
              dot: true
            })));
          } catch (error1) {
            error = error1;
            results.push(atom.notifications.addWarning("Error parsing ignore pattern (" + ignoredName + ")", {
              detail: error.message
            }));
          }
        }
      }
      return results;
    };

    TreeView.prototype.updateRoots = function(expansionStates) {
      var directory, j, key, len, oldExpansionStates, projectPath, ref3, root, stats;
      if (expansionStates == null) {
        expansionStates = {};
      }
      oldExpansionStates = {};
      ref3 = this.roots;
      for (j = 0, len = ref3.length; j < len; j++) {
        root = ref3[j];
        oldExpansionStates[root.directory.path] = root.directory.serializeExpansionState();
        root.directory.destroy();
        root.remove();
      }
      this.loadIgnoredPatterns();
      this.roots = (function() {
        var k, l, len1, len2, ref4, ref5, ref6, ref7, results;
        ref4 = atom.project.getPaths();
        results = [];
        for (k = 0, len1 = ref4.length; k < len1; k++) {
          projectPath = ref4[k];
          if (!(stats = fs.lstatSyncNoException(projectPath))) {
            continue;
          }
          stats = _.pick.apply(_, [stats].concat(slice.call(_.keys(stats))));
          ref5 = ["atime", "birthtime", "ctime", "mtime"];
          for (l = 0, len2 = ref5.length; l < len2; l++) {
            key = ref5[l];
            stats[key] = stats[key].getTime();
          }
          directory = new Directory({
            name: path.basename(projectPath),
            fullPath: projectPath,
            symlink: false,
            isRoot: true,
            expansionState: (ref6 = (ref7 = expansionStates[projectPath]) != null ? ref7 : oldExpansionStates[projectPath]) != null ? ref6 : {
              isExpanded: true
            },
            ignoredPatterns: this.ignoredPatterns,
            useSyncFS: this.useSyncFS,
            stats: stats
          });
          root = new DirectoryView();
          root.initialize(directory);
          this.list[0].appendChild(root);
          results.push(root);
        }
        return results;
      }).call(this);
      if (this.attachAfterProjectPathSet) {
        this.attach();
        return this.attachAfterProjectPathSet = false;
      }
    };

    TreeView.prototype.getActivePath = function() {
      var ref3;
      return (ref3 = atom.workspace.getActivePaneItem()) != null ? typeof ref3.getPath === "function" ? ref3.getPath() : void 0 : void 0;
    };

    TreeView.prototype.selectActiveFile = function() {
      var activeFilePath;
      if (activeFilePath = this.getActivePath()) {
        return this.selectEntryForPath(activeFilePath);
      } else {
        return this.deselect();
      }
    };

    TreeView.prototype.revealActiveFile = function() {
      var activeFilePath, activePathComponents, currentPath, entry, j, len, pathComponent, ref3, relativePath, results, rootPath;
      if (_.isEmpty(atom.project.getPaths())) {
        return;
      }
      this.attach();
      if (atom.config.get('tree-view.focusOnReveal')) {
        this.focus();
      }
      if (!(activeFilePath = this.getActivePath())) {
        return;
      }
      ref3 = atom.project.relativizePath(activeFilePath), rootPath = ref3[0], relativePath = ref3[1];
      if (rootPath == null) {
        return;
      }
      activePathComponents = relativePath.split(path.sep);
      currentPath = rootPath;
      results = [];
      for (j = 0, len = activePathComponents.length; j < len; j++) {
        pathComponent = activePathComponents[j];
        currentPath += path.sep + pathComponent;
        entry = this.entryForPath(currentPath);
        if (entry instanceof DirectoryView) {
          results.push(entry.expand());
        } else {
          this.selectEntry(entry);
          results.push(this.scrollToEntry(entry));
        }
      }
      return results;
    };

    TreeView.prototype.copySelectedEntryPath = function(relativePath) {
      var pathToCopy;
      if (relativePath == null) {
        relativePath = false;
      }
      if (pathToCopy = this.selectedPath) {
        if (relativePath) {
          pathToCopy = atom.project.relativize(pathToCopy);
        }
        return atom.clipboard.write(pathToCopy);
      }
    };

    TreeView.prototype.entryForPath = function(entryPath) {
      var bestMatchEntry, bestMatchLength, entry, entryLength, j, len, ref3, ref4;
      bestMatchEntry = null;
      bestMatchLength = 0;
      ref3 = this.list[0].querySelectorAll('.entry');
      for (j = 0, len = ref3.length; j < len; j++) {
        entry = ref3[j];
        if (entry.isPathEqual(entryPath)) {
          return entry;
        }
        entryLength = entry.getPath().length;
        if (((ref4 = entry.directory) != null ? ref4.contains(entryPath) : void 0) && entryLength > bestMatchLength) {
          bestMatchEntry = entry;
          bestMatchLength = entryLength;
        }
      }
      return bestMatchEntry;
    };

    TreeView.prototype.selectEntryForPath = function(entryPath) {
      return this.selectEntry(this.entryForPath(entryPath));
    };

    TreeView.prototype.moveDown = function(event) {
      var selectedEntry;
      if (event != null) {
        event.stopImmediatePropagation();
      }
      selectedEntry = this.selectedEntry();
      if (selectedEntry != null) {
        if (selectedEntry instanceof DirectoryView) {
          if (this.selectEntry(selectedEntry.entries.children[0])) {
            this.scrollToEntry(this.selectedEntry());
            return;
          }
        }
        selectedEntry = $(selectedEntry);
        while (!this.selectEntry(selectedEntry.next('.entry')[0])) {
          selectedEntry = selectedEntry.parents('.entry:first');
          if (!selectedEntry.length) {
            break;
          }
        }
      } else {
        this.selectEntry(this.roots[0]);
      }
      return this.scrollToEntry(this.selectedEntry());
    };

    TreeView.prototype.moveUp = function(event) {
      var previousEntry, ref3, ref4, selectedEntry;
      event.stopImmediatePropagation();
      selectedEntry = this.selectedEntry();
      if (selectedEntry != null) {
        selectedEntry = $(selectedEntry);
        if (previousEntry = this.selectEntry(selectedEntry.prev('.entry')[0])) {
          if (previousEntry instanceof DirectoryView) {
            this.selectEntry(_.last(previousEntry.entries.children));
          }
        } else {
          this.selectEntry((ref3 = selectedEntry.parents('.directory').first()) != null ? ref3[0] : void 0);
        }
      } else {
        this.selectEntry((ref4 = this.list.find('.entry').last()) != null ? ref4[0] : void 0);
      }
      return this.scrollToEntry(this.selectedEntry());
    };

    TreeView.prototype.expandDirectory = function(isRecursive) {
      var selectedEntry;
      if (isRecursive == null) {
        isRecursive = false;
      }
      selectedEntry = this.selectedEntry();
      if (isRecursive === false && selectedEntry.isExpanded) {
        if (selectedEntry.directory.getEntries().length > 0) {
          return this.moveDown();
        }
      } else {
        return selectedEntry.expand(isRecursive);
      }
    };

    TreeView.prototype.collapseDirectory = function(isRecursive) {
      var directory, selectedEntry;
      if (isRecursive == null) {
        isRecursive = false;
      }
      selectedEntry = this.selectedEntry();
      if (selectedEntry == null) {
        return;
      }
      if (directory = $(selectedEntry).closest('.expanded.directory')[0]) {
        directory.collapse(isRecursive);
        return this.selectEntry(directory);
      }
    };

    TreeView.prototype.openSelectedEntry = function(options, expandDirectory) {
      var selectedEntry;
      if (options == null) {
        options = {};
      }
      if (expandDirectory == null) {
        expandDirectory = false;
      }
      selectedEntry = this.selectedEntry();
      if (selectedEntry instanceof DirectoryView) {
        if (expandDirectory) {
          return this.expandDirectory(false);
        } else {
          return selectedEntry.toggleExpansion();
        }
      } else if (selectedEntry instanceof FileView) {
        if (atom.config.get('tree-view.alwaysOpenExisting')) {
          options = Object.assign({
            searchAllPanes: true
          }, options);
        }
        return this.openAfterPromise(selectedEntry.getPath(), options);
      }
    };

    TreeView.prototype.openSelectedEntrySplit = function(orientation, side) {
      var pane, selectedEntry, split;
      selectedEntry = this.selectedEntry();
      pane = atom.workspace.getActivePane();
      if (pane && selectedEntry instanceof FileView) {
        if (atom.workspace.getActivePaneItem()) {
          split = pane.split(orientation, side);
          return atom.workspace.openURIInPane(selectedEntry.getPath(), split);
        } else {
          return this.openSelectedEntry(true);
        }
      }
    };

    TreeView.prototype.openSelectedEntryRight = function() {
      return this.openSelectedEntrySplit('horizontal', 'after');
    };

    TreeView.prototype.openSelectedEntryLeft = function() {
      return this.openSelectedEntrySplit('horizontal', 'before');
    };

    TreeView.prototype.openSelectedEntryUp = function() {
      return this.openSelectedEntrySplit('vertical', 'before');
    };

    TreeView.prototype.openSelectedEntryDown = function() {
      return this.openSelectedEntrySplit('vertical', 'after');
    };

    TreeView.prototype.openSelectedEntryInPane = function(index) {
      var pane, selectedEntry;
      selectedEntry = this.selectedEntry();
      pane = atom.workspace.getPanes()[index];
      if (pane && selectedEntry instanceof FileView) {
        return atom.workspace.openURIInPane(selectedEntry.getPath(), pane);
      }
    };

    TreeView.prototype.moveSelectedEntry = function() {
      var dialog, entry, oldPath;
      if (this.hasFocus()) {
        entry = this.selectedEntry();
        if ((entry == null) || indexOf.call(this.roots, entry) >= 0) {
          return;
        }
        oldPath = entry.getPath();
      } else {
        oldPath = this.getActivePath();
      }
      if (oldPath) {
        if (MoveDialog == null) {
          MoveDialog = require('./move-dialog');
        }
        dialog = new MoveDialog(oldPath);
        return dialog.attach();
      }
    };

    TreeView.prototype.fileManagerCommandForPath = function(pathToOpen, isFile) {
      var args, command;
      switch (process.platform) {
        case 'darwin':
          return {
            command: 'open',
            label: 'Finder',
            args: ['-R', pathToOpen]
          };
        case 'win32':
          args = ["/select,\"" + pathToOpen + "\""];
          if (process.env.SystemRoot) {
            command = path.join(process.env.SystemRoot, 'explorer.exe');
          } else {
            command = 'explorer.exe';
          }
          return {
            command: command,
            label: 'Explorer',
            args: args
          };
        default:
          if (isFile) {
            pathToOpen = path.dirname(pathToOpen);
          }
          return {
            command: 'xdg-open',
            label: 'File Manager',
            args: [pathToOpen]
          };
      }
    };

    TreeView.prototype.openInFileManager = function(command, args, label, isFile) {
      var errorLines, exit, handleError, showProcess, stderr;
      handleError = function(errorMessage) {
        return atom.notifications.addError("Opening " + (isFile ? 'file' : 'folder') + " in " + label + " failed", {
          detail: errorMessage,
          dismissable: true
        });
      };
      errorLines = [];
      stderr = function(lines) {
        return errorLines.push(lines);
      };
      exit = function(code) {
        var errorMessage, failed;
        failed = code !== 0;
        errorMessage = errorLines.join('\n');
        if (process.platform === 'win32' && code === 1 && !errorMessage) {
          failed = false;
        }
        if (failed) {
          return handleError(errorMessage);
        }
      };
      showProcess = new BufferedProcess({
        command: command,
        args: args,
        stderr: stderr,
        exit: exit
      });
      showProcess.onWillThrowError(function(arg) {
        var error, handle;
        error = arg.error, handle = arg.handle;
        handle();
        return handleError(error != null ? error.message : void 0);
      });
      return showProcess;
    };

    TreeView.prototype.showSelectedEntryInFileManager = function() {
      var args, command, entry, isFile, label, ref3;
      if (!(entry = this.selectedEntry())) {
        return;
      }
      isFile = entry instanceof FileView;
      ref3 = this.fileManagerCommandForPath(entry.getPath(), isFile), command = ref3.command, args = ref3.args, label = ref3.label;
      return this.openInFileManager(command, args, label, isFile);
    };

    TreeView.prototype.showCurrentFileInFileManager = function() {
      var args, command, editor, label, ref3;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (!editor.getPath()) {
        return;
      }
      ref3 = this.fileManagerCommandForPath(editor.getPath(), true), command = ref3.command, args = ref3.args, label = ref3.label;
      return this.openInFileManager(command, args, label, true);
    };

    TreeView.prototype.openSelectedEntryInNewWindow = function() {
      var pathToOpen, ref3;
      if (pathToOpen = (ref3 = this.selectedEntry()) != null ? ref3.getPath() : void 0) {
        return atom.open({
          pathsToOpen: [pathToOpen],
          newWindow: true
        });
      }
    };

    TreeView.prototype.copySelectedEntry = function() {
      var dialog, entry, oldPath;
      if (this.hasFocus()) {
        entry = this.selectedEntry();
        if (indexOf.call(this.roots, entry) >= 0) {
          return;
        }
        oldPath = entry != null ? entry.getPath() : void 0;
      } else {
        oldPath = this.getActivePath();
      }
      if (!oldPath) {
        return;
      }
      if (CopyDialog == null) {
        CopyDialog = require('./copy-dialog');
      }
      dialog = new CopyDialog(oldPath);
      return dialog.attach();
    };

    TreeView.prototype.removeSelectedEntries = function() {
      var activePath, j, len, ref3, ref4, root, selectedPaths;
      if (this.hasFocus()) {
        selectedPaths = this.selectedPaths();
      } else if (activePath = this.getActivePath()) {
        selectedPaths = [activePath];
      }
      if (!(selectedPaths && selectedPaths.length > 0)) {
        return;
      }
      ref3 = this.roots;
      for (j = 0, len = ref3.length; j < len; j++) {
        root = ref3[j];
        if (ref4 = root.getPath(), indexOf.call(selectedPaths, ref4) >= 0) {
          atom.confirm({
            message: "The root directory '" + root.directory.name + "' can't be removed.",
            buttons: ['OK']
          });
          return;
        }
      }
      return atom.confirm({
        message: "Are you sure you want to delete the selected " + (selectedPaths.length > 1 ? 'items' : 'item') + "?",
        detailedMessage: "You are deleting:\n" + (selectedPaths.join('\n')),
        buttons: {
          "Move to Trash": (function(_this) {
            return function() {
              var editor, failedDeletions, k, l, len1, len2, ref5, repo, selectedPath;
              failedDeletions = [];
              for (k = 0, len1 = selectedPaths.length; k < len1; k++) {
                selectedPath = selectedPaths[k];
                if (shell.moveItemToTrash(selectedPath)) {
                  ref5 = atom.workspace.getTextEditors();
                  for (l = 0, len2 = ref5.length; l < len2; l++) {
                    editor = ref5[l];
                    if ((editor != null ? editor.getPath() : void 0) === selectedPath) {
                      editor.destroy();
                    }
                  }
                } else {
                  failedDeletions.push("" + selectedPath);
                }
                if (repo = repoForPath(selectedPath)) {
                  repo.getPathStatus(selectedPath);
                }
              }
              if (failedDeletions.length > 0) {
                atom.notifications.addError(_this.formatTrashFailureMessage(failedDeletions), {
                  description: _this.formatTrashEnabledMessage(),
                  detail: "" + (failedDeletions.join('\n')),
                  dismissable: true
                });
              }
              if (atom.config.get('tree-view.squashDirectoryNames')) {
                return _this.updateRoots();
              }
            };
          })(this),
          "Cancel": null
        }
      });
    };

    TreeView.prototype.formatTrashFailureMessage = function(failedDeletions) {
      var fileText;
      fileText = failedDeletions.length > 1 ? 'files' : 'file';
      return "The following " + fileText + " couldn't be moved to the trash.";
    };

    TreeView.prototype.formatTrashEnabledMessage = function() {
      switch (process.platform) {
        case 'linux':
          return 'Is `gvfs-trash` installed?';
        case 'darwin':
          return 'Is Trash enabled on the volume where the files are stored?';
        case 'win32':
          return 'Is there a Recycle Bin on the drive where the files are stored?';
      }
    };

    TreeView.prototype.copySelectedEntries = function() {
      var selectedPaths;
      selectedPaths = this.selectedPaths();
      if (!(selectedPaths && selectedPaths.length > 0)) {
        return;
      }
      LocalStorage.removeItem('tree-view:cutPath');
      return LocalStorage['tree-view:copyPath'] = JSON.stringify(selectedPaths);
    };

    TreeView.prototype.cutSelectedEntries = function() {
      var selectedPaths;
      selectedPaths = this.selectedPaths();
      if (!(selectedPaths && selectedPaths.length > 0)) {
        return;
      }
      LocalStorage.removeItem('tree-view:copyPath');
      return LocalStorage['tree-view:cutPath'] = JSON.stringify(selectedPaths);
    };

    TreeView.prototype.pasteEntries = function() {
      var basePath, catchAndShowFileErrors, copiedPaths, cutPaths, extension, fileCounter, filePath, initialPath, initialPathIsDirectory, initialPaths, j, len, newPath, originalNewPath, ref3, results, selectedEntry;
      selectedEntry = this.selectedEntry();
      cutPaths = LocalStorage['tree-view:cutPath'] ? JSON.parse(LocalStorage['tree-view:cutPath']) : null;
      copiedPaths = LocalStorage['tree-view:copyPath'] ? JSON.parse(LocalStorage['tree-view:copyPath']) : null;
      initialPaths = copiedPaths || cutPaths;
      catchAndShowFileErrors = function(operation) {
        var error;
        try {
          return operation();
        } catch (error1) {
          error = error1;
          return atom.notifications.addWarning("Unable to paste paths: " + initialPaths, {
            detail: error.message
          });
        }
      };
      ref3 = initialPaths != null ? initialPaths : [];
      results = [];
      for (j = 0, len = ref3.length; j < len; j++) {
        initialPath = ref3[j];
        initialPathIsDirectory = fs.isDirectorySync(initialPath);
        if (selectedEntry && initialPath && fs.existsSync(initialPath)) {
          basePath = selectedEntry.getPath();
          if (selectedEntry instanceof FileView) {
            basePath = path.dirname(basePath);
          }
          newPath = path.join(basePath, path.basename(initialPath));
          if (copiedPaths) {
            fileCounter = 0;
            originalNewPath = newPath;
            while (fs.existsSync(newPath)) {
              if (initialPathIsDirectory) {
                newPath = "" + originalNewPath + fileCounter;
              } else {
                extension = getFullExtension(originalNewPath);
                filePath = path.join(path.dirname(originalNewPath), path.basename(originalNewPath, extension));
                newPath = "" + filePath + fileCounter + extension;
              }
              fileCounter += 1;
            }
            if (fs.isDirectorySync(initialPath)) {
              results.push(catchAndShowFileErrors(function() {
                return fs.copySync(initialPath, newPath);
              }));
            } else {
              results.push(catchAndShowFileErrors(function() {
                return fs.writeFileSync(newPath, fs.readFileSync(initialPath));
              }));
            }
          } else if (cutPaths) {
            if (!(fs.existsSync(newPath) || newPath.startsWith(initialPath))) {
              results.push(catchAndShowFileErrors(function() {
                return fs.moveSync(initialPath, newPath);
              }));
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    TreeView.prototype.add = function(isCreatingFile) {
      var dialog, ref3, ref4, selectedEntry, selectedPath;
      selectedEntry = (ref3 = this.selectedEntry()) != null ? ref3 : this.roots[0];
      selectedPath = (ref4 = selectedEntry != null ? selectedEntry.getPath() : void 0) != null ? ref4 : '';
      if (AddDialog == null) {
        AddDialog = require('./add-dialog');
      }
      dialog = new AddDialog(selectedPath, isCreatingFile);
      dialog.on('directory-created', (function(_this) {
        return function(event, createdPath) {
          var ref5;
          if ((ref5 = _this.entryForPath(createdPath)) != null) {
            ref5.reload();
          }
          _this.selectEntryForPath(createdPath);
          if (atom.config.get('tree-view.squashDirectoryNames')) {
            _this.updateRoots();
          }
          return false;
        };
      })(this));
      dialog.on('file-created', (function(_this) {
        return function(event, createdPath) {
          atom.workspace.open(createdPath);
          if (atom.config.get('tree-view.squashDirectoryNames')) {
            _this.updateRoots();
          }
          return false;
        };
      })(this));
      return dialog.attach();
    };

    TreeView.prototype.removeProjectFolder = function(e) {
      var pathToRemove;
      pathToRemove = $(e.target).closest(".project-root > .header").find(".name").data("path");
      if (atom.project.removePath != null) {
        if (pathToRemove != null) {
          return atom.project.removePath(pathToRemove);
        }
      }
    };

    TreeView.prototype.selectedEntry = function() {
      return this.list[0].querySelector('.selected');
    };

    TreeView.prototype.selectEntry = function(entry) {
      var selectedEntries;
      if (entry == null) {
        return;
      }
      this.selectedPath = entry.getPath();
      selectedEntries = this.getSelectedEntries();
      if (selectedEntries.length > 1 || selectedEntries[0] !== entry) {
        this.deselect(selectedEntries);
        entry.classList.add('selected');
      }
      return entry;
    };

    TreeView.prototype.getSelectedEntries = function() {
      return this.list[0].querySelectorAll('.selected');
    };

    TreeView.prototype.deselect = function(elementsToDeselect) {
      var j, len, selected;
      if (elementsToDeselect == null) {
        elementsToDeselect = this.getSelectedEntries();
      }
      for (j = 0, len = elementsToDeselect.length; j < len; j++) {
        selected = elementsToDeselect[j];
        selected.classList.remove('selected');
      }
      return void 0;
    };

    TreeView.prototype.scrollTop = function(top) {
      if (top != null) {
        return this.scroller.scrollTop(top);
      } else {
        return this.scroller.scrollTop();
      }
    };

    TreeView.prototype.scrollBottom = function(bottom) {
      if (bottom != null) {
        return this.scroller.scrollBottom(bottom);
      } else {
        return this.scroller.scrollBottom();
      }
    };

    TreeView.prototype.scrollToEntry = function(entry) {
      var element;
      element = entry instanceof DirectoryView ? entry.header : entry;
      return element != null ? element.scrollIntoViewIfNeeded(true) : void 0;
    };

    TreeView.prototype.scrollToBottom = function() {
      var lastEntry;
      if (lastEntry = _.last(this.list[0].querySelectorAll('.entry'))) {
        this.selectEntry(lastEntry);
        return this.scrollToEntry(lastEntry);
      }
    };

    TreeView.prototype.scrollToTop = function() {
      if (this.roots[0] != null) {
        this.selectEntry(this.roots[0]);
      }
      return this.scrollTop(0);
    };

    TreeView.prototype.toggleSide = function() {
      return toggleConfig('tree-view.showOnRightSide');
    };

    TreeView.prototype.moveEntry = function(initialPath, newDirectoryPath) {
      var entryName, error, newPath, repo;
      if (initialPath === newDirectoryPath) {
        return;
      }
      entryName = path.basename(initialPath);
      newPath = (newDirectoryPath + "/" + entryName).replace(/\s+$/, '');
      try {
        if (!fs.existsSync(newDirectoryPath)) {
          fs.makeTreeSync(newDirectoryPath);
        }
        fs.moveSync(initialPath, newPath);
        if (repo = repoForPath(newPath)) {
          repo.getPathStatus(initialPath);
          return repo.getPathStatus(newPath);
        }
      } catch (error1) {
        error = error1;
        return atom.notifications.addWarning("Failed to move entry " + initialPath + " to " + newDirectoryPath, {
          detail: error.message
        });
      }
    };

    TreeView.prototype.onStylesheetsChanged = function() {
      if (!this.isVisible()) {
        return;
      }
      this.element.style.display = 'none';
      this.element.offsetWidth;
      return this.element.style.display = '';
    };

    TreeView.prototype.onMouseDown = function(e) {
      var entryToSelect;
      e.stopPropagation();
      if (this.multiSelectEnabled() && e.currentTarget.classList.contains('selected') && (e.button === 2 || e.ctrlKey && process.platform === 'darwin')) {
        return;
      }
      entryToSelect = e.currentTarget;
      if (e.shiftKey) {
        this.selectContinuousEntries(entryToSelect);
        return this.showMultiSelectMenu();
      } else if (e.metaKey || (e.ctrlKey && process.platform !== 'darwin')) {
        this.selectMultipleEntries(entryToSelect);
        if (this.selectedPaths().length > 1) {
          return this.showMultiSelectMenu();
        }
      } else {
        this.selectEntry(entryToSelect);
        return this.showFullMenu();
      }
    };

    TreeView.prototype.onSideToggled = function(newValue) {
      this.element.dataset.showOnRightSide = newValue;
      if (this.isVisible()) {
        this.detach();
        return this.attach();
      }
    };

    TreeView.prototype.selectedPaths = function() {
      var entry, j, len, ref3, results;
      ref3 = this.getSelectedEntries();
      results = [];
      for (j = 0, len = ref3.length; j < len; j++) {
        entry = ref3[j];
        results.push(entry.getPath());
      }
      return results;
    };

    TreeView.prototype.selectContinuousEntries = function(entry) {
      var currentSelectedEntry, element, elements, entries, entryIndex, i, j, len, parentContainer, selectedIndex;
      currentSelectedEntry = this.selectedEntry();
      parentContainer = $(entry).parent();
      if ($.contains(parentContainer[0], currentSelectedEntry)) {
        entries = parentContainer.find('.entry').toArray();
        entryIndex = entries.indexOf(entry);
        selectedIndex = entries.indexOf(currentSelectedEntry);
        elements = (function() {
          var j, ref3, ref4, results;
          results = [];
          for (i = j = ref3 = entryIndex, ref4 = selectedIndex; ref3 <= ref4 ? j <= ref4 : j >= ref4; i = ref3 <= ref4 ? ++j : --j) {
            results.push(entries[i]);
          }
          return results;
        })();
        this.deselect();
        for (j = 0, len = elements.length; j < len; j++) {
          element = elements[j];
          element.classList.add('selected');
        }
      }
      return elements;
    };

    TreeView.prototype.selectMultipleEntries = function(entry) {
      if (entry != null) {
        entry.classList.toggle('selected');
      }
      return entry;
    };

    TreeView.prototype.showFullMenu = function() {
      this.list[0].classList.remove('multi-select');
      return this.list[0].classList.add('full-menu');
    };

    TreeView.prototype.showMultiSelectMenu = function() {
      this.list[0].classList.remove('full-menu');
      return this.list[0].classList.add('multi-select');
    };

    TreeView.prototype.multiSelectEnabled = function() {
      return this.list[0].classList.contains('multi-select');
    };

    TreeView.prototype.onDragEnter = function(e) {
      var entry;
      if (this.rootDragAndDrop.isDragging(e)) {
        return;
      }
      e.stopPropagation();
      entry = e.currentTarget.parentNode;
      if (!this.dragEventCounts.get(entry)) {
        this.dragEventCounts.set(entry, 0);
      }
      if (this.dragEventCounts.get(entry) === 0) {
        entry.classList.add('selected');
      }
      return this.dragEventCounts.set(entry, this.dragEventCounts.get(entry) + 1);
    };

    TreeView.prototype.onDragLeave = function(e) {
      var entry;
      if (this.rootDragAndDrop.isDragging(e)) {
        return;
      }
      e.stopPropagation();
      entry = e.currentTarget.parentNode;
      this.dragEventCounts.set(entry, this.dragEventCounts.get(entry) - 1);
      if (this.dragEventCounts.get(entry) === 0) {
        return entry.classList.remove('selected');
      }
    };

    TreeView.prototype.onDragStart = function(e) {
      var fileNameElement, initialPath, style, target;
      e.stopPropagation();
      if (this.rootDragAndDrop.canDragStart(e)) {
        return this.rootDragAndDrop.onDragStart(e);
      }
      target = $(e.currentTarget).find(".name");
      initialPath = target.data("path");
      style = getStyleObject(target[0]);
      fileNameElement = target.clone().css(style).css({
        position: 'absolute',
        top: 0,
        left: 0
      });
      fileNameElement.appendTo(document.body);
      e.originalEvent.dataTransfer.effectAllowed = "move";
      e.originalEvent.dataTransfer.setDragImage(fileNameElement[0], 0, 0);
      e.originalEvent.dataTransfer.setData("initialPath", initialPath);
      return window.requestAnimationFrame(function() {
        return fileNameElement.remove();
      });
    };

    TreeView.prototype.onDragOver = function(e) {
      var entry;
      if (this.rootDragAndDrop.isDragging(e)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      entry = e.currentTarget;
      if (this.dragEventCounts.get(entry) > 0 && !entry.classList.contains('selected')) {
        return entry.classList.add('selected');
      }
    };

    TreeView.prototype.onDrop = function(e) {
      var entry, file, initialPath, j, len, newDirectoryPath, ref3, results;
      if (this.rootDragAndDrop.isDragging(e)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      entry = e.currentTarget;
      entry.classList.remove('selected');
      if (!(entry instanceof DirectoryView)) {
        return;
      }
      newDirectoryPath = $(entry).find(".name").data("path");
      if (!newDirectoryPath) {
        return false;
      }
      initialPath = e.originalEvent.dataTransfer.getData("initialPath");
      if (initialPath) {
        return this.moveEntry(initialPath, newDirectoryPath);
      } else {
        ref3 = e.originalEvent.dataTransfer.files;
        results = [];
        for (j = 0, len = ref3.length; j < len; j++) {
          file = ref3[j];
          results.push(this.moveEntry(file.path, newDirectoryPath));
        }
        return results;
      }
    };

    return TreeView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3RyZWUtdmlldy9saWIvdHJlZS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMFFBQUE7SUFBQTs7Ozs7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNOLFFBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVYsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUF5QyxPQUFBLENBQVEsTUFBUixDQUF6QyxFQUFDLHFDQUFELEVBQWtCOztFQUNsQixPQUFrRCxPQUFBLENBQVEsV0FBUixDQUFsRCxFQUFDLDhCQUFELEVBQWMsb0NBQWQsRUFBOEI7O0VBQzlCLE9BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxVQUFELEVBQUk7O0VBQ0osRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUVMLFNBQUEsR0FBWTs7RUFDWixVQUFBLEdBQWE7O0VBQ2IsVUFBQSxHQUFhOztFQUNiLFNBQUEsR0FBWTs7RUFFWixTQUFBLEdBQVksT0FBQSxDQUFRLGFBQVI7O0VBQ1osYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVI7O0VBQ2hCLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxzQkFBUjs7RUFDbEIsWUFBQSxHQUFlLE1BQU0sQ0FBQzs7RUFFdEIsWUFBQSxHQUFlLFNBQUMsT0FBRDtXQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixPQUFoQixFQUF5QixDQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixPQUFoQixDQUE3QjtFQURhOztFQUdmLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7Ozs7Ozs7dUJBQ0osS0FBQSxHQUFPOztJQUVQLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENB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QUFtQixDQUFBLENBQUUsS0FBRixDQUFRLENBQUMsSUFBVCxDQUFjLE9BQWQsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixNQUE1QjtNQUNuQixJQUFBLENBQW9CLGdCQUFwQjtBQUFBLGVBQU8sTUFBUDs7TUFFQSxXQUFBLEdBQWMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBN0IsQ0FBcUMsYUFBckM7TUFFZCxJQUFHLFdBQUg7ZUFFRSxJQUFDLENBQUEsU0FBRCxDQUFXLFdBQVgsRUFBd0IsZ0JBQXhCLEVBRkY7T0FBQSxNQUFBO0FBS0U7QUFBQTthQUFBLHNDQUFBOzt1QkFDRSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUksQ0FBQyxJQUFoQixFQUFzQixnQkFBdEI7QUFERjt1QkFMRjs7SUFoQk07Ozs7S0EzM0JhO0FBeEJ2QiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xue3NoZWxsfSA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0J1ZmZlcmVkUHJvY2VzcywgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue3JlcG9Gb3JQYXRoLCBnZXRTdHlsZU9iamVjdCwgZ2V0RnVsbEV4dGVuc2lvbn0gPSByZXF1aXJlIFwiLi9oZWxwZXJzXCJcbnskLCBWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuXG5BZGREaWFsb2cgPSBudWxsICAjIERlZmVyIHJlcXVpcmluZyB1bnRpbCBhY3R1YWxseSBuZWVkZWRcbk1vdmVEaWFsb2cgPSBudWxsICMgRGVmZXIgcmVxdWlyaW5nIHVudGlsIGFjdHVhbGx5IG5lZWRlZFxuQ29weURpYWxvZyA9IG51bGwgIyBEZWZlciByZXF1aXJpbmcgdW50aWwgYWN0dWFsbHkgbmVlZGVkXG5NaW5pbWF0Y2ggPSBudWxsICAjIERlZmVyIHJlcXVpcmluZyB1bnRpbCBhY3R1YWxseSBuZWVkZWRcblxuRGlyZWN0b3J5ID0gcmVxdWlyZSAnLi9kaXJlY3RvcnknXG5EaXJlY3RvcnlWaWV3ID0gcmVxdWlyZSAnLi9kaXJlY3RvcnktdmlldydcbkZpbGVWaWV3ID0gcmVxdWlyZSAnLi9maWxlLXZpZXcnXG5Sb290RHJhZ0FuZERyb3AgPSByZXF1aXJlICcuL3Jvb3QtZHJhZy1hbmQtZHJvcCdcbkxvY2FsU3RvcmFnZSA9IHdpbmRvdy5sb2NhbFN0b3JhZ2VcblxudG9nZ2xlQ29uZmlnID0gKGtleVBhdGgpIC0+XG4gIGF0b20uY29uZmlnLnNldChrZXlQYXRoLCBub3QgYXRvbS5jb25maWcuZ2V0KGtleVBhdGgpKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBUcmVlVmlldyBleHRlbmRzIFZpZXdcbiAgcGFuZWw6IG51bGxcblxuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAndHJlZS12aWV3LXJlc2l6ZXIgdG9vbC1wYW5lbCcsICdkYXRhLXNob3ctb24tcmlnaHQtc2lkZSc6IGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LnNob3dPblJpZ2h0U2lkZScpLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ3RyZWUtdmlldy1zY3JvbGxlciBvcmRlci0tY2VudGVyJywgb3V0bGV0OiAnc2Nyb2xsZXInLCA9PlxuICAgICAgICBAb2wgY2xhc3M6ICd0cmVlLXZpZXcgZnVsbC1tZW51IGxpc3QtdHJlZSBoYXMtY29sbGFwc2FibGUtY2hpbGRyZW4gZm9jdXNhYmxlLXBhbmVsJywgdGFiaW5kZXg6IC0xLCBvdXRsZXQ6ICdsaXN0J1xuICAgICAgQGRpdiBjbGFzczogJ3RyZWUtdmlldy1yZXNpemUtaGFuZGxlJywgb3V0bGV0OiAncmVzaXplSGFuZGxlJ1xuXG4gIGluaXRpYWxpemU6IChzdGF0ZSkgLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBmb2N1c0FmdGVyQXR0YWNoID0gZmFsc2VcbiAgICBAcm9vdHMgPSBbXVxuICAgIEBzY3JvbGxMZWZ0QWZ0ZXJBdHRhY2ggPSAtMVxuICAgIEBzY3JvbGxUb3BBZnRlckF0dGFjaCA9IC0xXG4gICAgQHNlbGVjdGVkUGF0aCA9IG51bGxcbiAgICBAaWdub3JlZFBhdHRlcm5zID0gW11cbiAgICBAdXNlU3luY0ZTID0gZmFsc2VcbiAgICBAY3VycmVudGx5T3BlbmluZyA9IG5ldyBNYXBcblxuICAgIEBkcmFnRXZlbnRDb3VudHMgPSBuZXcgV2Vha01hcFxuICAgIEByb290RHJhZ0FuZERyb3AgPSBuZXcgUm9vdERyYWdBbmREcm9wKHRoaXMpXG5cbiAgICBAaGFuZGxlRXZlbnRzKClcblxuICAgIHByb2Nlc3MubmV4dFRpY2sgPT5cbiAgICAgIEBvblN0eWxlc2hlZXRzQ2hhbmdlZCgpXG4gICAgICBvblN0eWxlc2hlZXRzQ2hhbmdlZCA9IF8uZGVib3VuY2UoQG9uU3R5bGVzaGVldHNDaGFuZ2VkLCAxMDApXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uc3R5bGVzLm9uRGlkQWRkU3R5bGVFbGVtZW50KG9uU3R5bGVzaGVldHNDaGFuZ2VkKVxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLnN0eWxlcy5vbkRpZFJlbW92ZVN0eWxlRWxlbWVudChvblN0eWxlc2hlZXRzQ2hhbmdlZClcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5zdHlsZXMub25EaWRVcGRhdGVTdHlsZUVsZW1lbnQob25TdHlsZXNoZWV0c0NoYW5nZWQpXG5cbiAgICBAdXBkYXRlUm9vdHMoc3RhdGUuZGlyZWN0b3J5RXhwYW5zaW9uU3RhdGVzKVxuICAgIEBzZWxlY3RFbnRyeShAcm9vdHNbMF0pXG5cbiAgICBAc2VsZWN0RW50cnlGb3JQYXRoKHN0YXRlLnNlbGVjdGVkUGF0aCkgaWYgc3RhdGUuc2VsZWN0ZWRQYXRoXG4gICAgQGZvY3VzQWZ0ZXJBdHRhY2ggPSBzdGF0ZS5oYXNGb2N1c1xuICAgIEBzY3JvbGxUb3BBZnRlckF0dGFjaCA9IHN0YXRlLnNjcm9sbFRvcCBpZiBzdGF0ZS5zY3JvbGxUb3BcbiAgICBAc2Nyb2xsTGVmdEFmdGVyQXR0YWNoID0gc3RhdGUuc2Nyb2xsTGVmdCBpZiBzdGF0ZS5zY3JvbGxMZWZ0XG4gICAgQGF0dGFjaEFmdGVyUHJvamVjdFBhdGhTZXQgPSBzdGF0ZS5hdHRhY2hlZCBhbmQgXy5pc0VtcHR5KGF0b20ucHJvamVjdC5nZXRQYXRocygpKVxuICAgIEB3aWR0aChzdGF0ZS53aWR0aCkgaWYgc3RhdGUud2lkdGggPiAwXG4gICAgQGF0dGFjaCgpIGlmIHN0YXRlLmF0dGFjaGVkXG5cbiAgYXR0YWNoZWQ6IC0+XG4gICAgQGZvY3VzKCkgaWYgQGZvY3VzQWZ0ZXJBdHRhY2hcbiAgICBAc2Nyb2xsZXIuc2Nyb2xsTGVmdChAc2Nyb2xsTGVmdEFmdGVyQXR0YWNoKSBpZiBAc2Nyb2xsTGVmdEFmdGVyQXR0YWNoID4gMFxuICAgIEBzY3JvbGxUb3AoQHNjcm9sbFRvcEFmdGVyQXR0YWNoKSBpZiBAc2Nyb2xsVG9wQWZ0ZXJBdHRhY2ggPiAwXG5cbiAgZGV0YWNoZWQ6IC0+XG4gICAgQHJlc2l6ZVN0b3BwZWQoKVxuXG4gIHNlcmlhbGl6ZTogLT5cbiAgICBkaXJlY3RvcnlFeHBhbnNpb25TdGF0ZXM6IG5ldyAoKHJvb3RzKSAtPlxuICAgICAgQFtyb290LmRpcmVjdG9yeS5wYXRoXSA9IHJvb3QuZGlyZWN0b3J5LnNlcmlhbGl6ZUV4cGFuc2lvblN0YXRlKCkgZm9yIHJvb3QgaW4gcm9vdHNcbiAgICAgIHRoaXMpKEByb290cylcbiAgICBzZWxlY3RlZFBhdGg6IEBzZWxlY3RlZEVudHJ5KCk/LmdldFBhdGgoKVxuICAgIGhhc0ZvY3VzOiBAaGFzRm9jdXMoKVxuICAgIGF0dGFjaGVkOiBAcGFuZWw/XG4gICAgc2Nyb2xsTGVmdDogQHNjcm9sbGVyLnNjcm9sbExlZnQoKVxuICAgIHNjcm9sbFRvcDogQHNjcm9sbFRvcCgpXG4gICAgd2lkdGg6IEB3aWR0aCgpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICByb290LmRpcmVjdG9yeS5kZXN0cm95KCkgZm9yIHJvb3QgaW4gQHJvb3RzXG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEByb290RHJhZ0FuZERyb3AuZGlzcG9zZSgpXG4gICAgQGRldGFjaCgpIGlmIEBwYW5lbD9cblxuICBoYW5kbGVFdmVudHM6IC0+XG4gICAgQG9uICdkYmxjbGljaycsICcudHJlZS12aWV3LXJlc2l6ZS1oYW5kbGUnLCA9PlxuICAgICAgQHJlc2l6ZVRvRml0Q29udGVudCgpXG4gICAgQG9uICdjbGljaycsICcuZW50cnknLCAoZSkgPT5cbiAgICAgICMgVGhpcyBwcmV2ZW50cyBhY2NpZGVudGFsIGNvbGxhcHNpbmcgd2hlbiBhIC5lbnRyaWVzIGVsZW1lbnQgaXMgdGhlIGV2ZW50IHRhcmdldFxuICAgICAgcmV0dXJuIGlmIGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnZW50cmllcycpXG5cbiAgICAgIEBlbnRyeUNsaWNrZWQoZSkgdW5sZXNzIGUuc2hpZnRLZXkgb3IgZS5tZXRhS2V5IG9yIGUuY3RybEtleVxuICAgIEBvbiAnbW91c2Vkb3duJywgJy5lbnRyeScsIChlKSA9PlxuICAgICAgQG9uTW91c2VEb3duKGUpXG4gICAgQG9uICdtb3VzZWRvd24nLCAnLnRyZWUtdmlldy1yZXNpemUtaGFuZGxlJywgKGUpID0+IEByZXNpemVTdGFydGVkKGUpXG4gICAgQG9uICdkcmFnc3RhcnQnLCAnLmVudHJ5JywgKGUpID0+IEBvbkRyYWdTdGFydChlKVxuICAgIEBvbiAnZHJhZ2VudGVyJywgJy5lbnRyeS5kaXJlY3RvcnkgPiAuaGVhZGVyJywgKGUpID0+IEBvbkRyYWdFbnRlcihlKVxuICAgIEBvbiAnZHJhZ2xlYXZlJywgJy5lbnRyeS5kaXJlY3RvcnkgPiAuaGVhZGVyJywgKGUpID0+IEBvbkRyYWdMZWF2ZShlKVxuICAgIEBvbiAnZHJhZ292ZXInLCAnLmVudHJ5JywgKGUpID0+IEBvbkRyYWdPdmVyKGUpXG4gICAgQG9uICdkcm9wJywgJy5lbnRyeScsIChlKSA9PiBAb25Ecm9wKGUpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZWxlbWVudCxcbiAgICAgJ2NvcmU6bW92ZS11cCc6IEBtb3ZlVXAuYmluZCh0aGlzKVxuICAgICAnY29yZTptb3ZlLWRvd24nOiBAbW92ZURvd24uYmluZCh0aGlzKVxuICAgICAnY29yZTpwYWdlLXVwJzogPT4gQHBhZ2VVcCgpXG4gICAgICdjb3JlOnBhZ2UtZG93bic6ID0+IEBwYWdlRG93bigpXG4gICAgICdjb3JlOm1vdmUtdG8tdG9wJzogPT4gQHNjcm9sbFRvVG9wKClcbiAgICAgJ2NvcmU6bW92ZS10by1ib3R0b20nOiA9PiBAc2Nyb2xsVG9Cb3R0b20oKVxuICAgICAndHJlZS12aWV3OmV4cGFuZC1pdGVtJzogPT4gQG9wZW5TZWxlY3RlZEVudHJ5KHBlbmRpbmc6IHRydWUsIHRydWUpXG4gICAgICd0cmVlLXZpZXc6cmVjdXJzaXZlLWV4cGFuZC1kaXJlY3RvcnknOiA9PiBAZXhwYW5kRGlyZWN0b3J5KHRydWUpXG4gICAgICd0cmVlLXZpZXc6Y29sbGFwc2UtZGlyZWN0b3J5JzogPT4gQGNvbGxhcHNlRGlyZWN0b3J5KClcbiAgICAgJ3RyZWUtdmlldzpyZWN1cnNpdmUtY29sbGFwc2UtZGlyZWN0b3J5JzogPT4gQGNvbGxhcHNlRGlyZWN0b3J5KHRydWUpXG4gICAgICd0cmVlLXZpZXc6b3Blbi1zZWxlY3RlZC1lbnRyeSc6ID0+IEBvcGVuU2VsZWN0ZWRFbnRyeSgpXG4gICAgICd0cmVlLXZpZXc6b3Blbi1zZWxlY3RlZC1lbnRyeS1yaWdodCc6ID0+IEBvcGVuU2VsZWN0ZWRFbnRyeVJpZ2h0KClcbiAgICAgJ3RyZWUtdmlldzpvcGVuLXNlbGVjdGVkLWVudHJ5LWxlZnQnOiA9PiBAb3BlblNlbGVjdGVkRW50cnlMZWZ0KClcbiAgICAgJ3RyZWUtdmlldzpvcGVuLXNlbGVjdGVkLWVudHJ5LXVwJzogPT4gQG9wZW5TZWxlY3RlZEVudHJ5VXAoKVxuICAgICAndHJlZS12aWV3Om9wZW4tc2VsZWN0ZWQtZW50cnktZG93bic6ID0+IEBvcGVuU2VsZWN0ZWRFbnRyeURvd24oKVxuICAgICAndHJlZS12aWV3Om1vdmUnOiA9PiBAbW92ZVNlbGVjdGVkRW50cnkoKVxuICAgICAndHJlZS12aWV3OmNvcHknOiA9PiBAY29weVNlbGVjdGVkRW50cmllcygpXG4gICAgICd0cmVlLXZpZXc6Y3V0JzogPT4gQGN1dFNlbGVjdGVkRW50cmllcygpXG4gICAgICd0cmVlLXZpZXc6cGFzdGUnOiA9PiBAcGFzdGVFbnRyaWVzKClcbiAgICAgJ3RyZWUtdmlldzpjb3B5LWZ1bGwtcGF0aCc6ID0+IEBjb3B5U2VsZWN0ZWRFbnRyeVBhdGgoZmFsc2UpXG4gICAgICd0cmVlLXZpZXc6c2hvdy1pbi1maWxlLW1hbmFnZXInOiA9PiBAc2hvd1NlbGVjdGVkRW50cnlJbkZpbGVNYW5hZ2VyKClcbiAgICAgJ3RyZWUtdmlldzpvcGVuLWluLW5ldy13aW5kb3cnOiA9PiBAb3BlblNlbGVjdGVkRW50cnlJbk5ld1dpbmRvdygpXG4gICAgICd0cmVlLXZpZXc6Y29weS1wcm9qZWN0LXBhdGgnOiA9PiBAY29weVNlbGVjdGVkRW50cnlQYXRoKHRydWUpXG4gICAgICd0b29sLXBhbmVsOnVuZm9jdXMnOiA9PiBAdW5mb2N1cygpXG4gICAgICd0cmVlLXZpZXc6dG9nZ2xlLXZjcy1pZ25vcmVkLWZpbGVzJzogLT4gdG9nZ2xlQ29uZmlnICd0cmVlLXZpZXcuaGlkZVZjc0lnbm9yZWRGaWxlcydcbiAgICAgJ3RyZWUtdmlldzp0b2dnbGUtaWdub3JlZC1uYW1lcyc6IC0+IHRvZ2dsZUNvbmZpZyAndHJlZS12aWV3LmhpZGVJZ25vcmVkTmFtZXMnXG4gICAgICd0cmVlLXZpZXc6cmVtb3ZlLXByb2plY3QtZm9sZGVyJzogKGUpID0+IEByZW1vdmVQcm9qZWN0Rm9sZGVyKGUpXG5cbiAgICBbMC4uOF0uZm9yRWFjaCAoaW5kZXgpID0+XG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZWxlbWVudCwgXCJ0cmVlLXZpZXc6b3Blbi1zZWxlY3RlZC1lbnRyeS1pbi1wYW5lLSN7aW5kZXggKyAxfVwiLCA9PlxuICAgICAgICBAb3BlblNlbGVjdGVkRW50cnlJblBhbmUgaW5kZXhcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSA9PlxuICAgICAgQHNlbGVjdEFjdGl2ZUZpbGUoKVxuICAgICAgQHJldmVhbEFjdGl2ZUZpbGUoKSBpZiBhdG9tLmNvbmZpZy5nZXQoJ3RyZWUtdmlldy5hdXRvUmV2ZWFsJylcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzID0+XG4gICAgICBAdXBkYXRlUm9vdHMoKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3RyZWUtdmlldy5oaWRlVmNzSWdub3JlZEZpbGVzJywgPT5cbiAgICAgIEB1cGRhdGVSb290cygpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAndHJlZS12aWV3LmhpZGVJZ25vcmVkTmFtZXMnLCA9PlxuICAgICAgQHVwZGF0ZVJvb3RzKClcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdjb3JlLmlnbm9yZWROYW1lcycsID0+XG4gICAgICBAdXBkYXRlUm9vdHMoKSBpZiBhdG9tLmNvbmZpZy5nZXQoJ3RyZWUtdmlldy5oaWRlSWdub3JlZE5hbWVzJylcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICd0cmVlLXZpZXcuc2hvd09uUmlnaHRTaWRlJywgKHtuZXdWYWx1ZX0pID0+XG4gICAgICBAb25TaWRlVG9nZ2xlZChuZXdWYWx1ZSlcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICd0cmVlLXZpZXcuc29ydEZvbGRlcnNCZWZvcmVGaWxlcycsID0+XG4gICAgICBAdXBkYXRlUm9vdHMoKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3RyZWUtdmlldy5zcXVhc2hEaXJlY3RvcnlOYW1lcycsID0+XG4gICAgICBAdXBkYXRlUm9vdHMoKVxuXG4gIHRvZ2dsZTogLT5cbiAgICBpZiBAaXNWaXNpYmxlKClcbiAgICAgIEBkZXRhY2goKVxuICAgIGVsc2VcbiAgICAgIEBzaG93KClcblxuICBzaG93OiAtPlxuICAgIEBhdHRhY2goKVxuICAgIEBmb2N1cygpXG5cbiAgYXR0YWNoOiAtPlxuICAgIHJldHVybiBpZiBfLmlzRW1wdHkoYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkpXG5cbiAgICBAcGFuZWwgPz1cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LnNob3dPblJpZ2h0U2lkZScpXG4gICAgICAgIGF0b20ud29ya3NwYWNlLmFkZFJpZ2h0UGFuZWwoaXRlbTogdGhpcylcbiAgICAgIGVsc2VcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuYWRkTGVmdFBhbmVsKGl0ZW06IHRoaXMpXG5cbiAgZGV0YWNoOiAtPlxuICAgIEBzY3JvbGxMZWZ0QWZ0ZXJBdHRhY2ggPSBAc2Nyb2xsZXIuc2Nyb2xsTGVmdCgpXG4gICAgQHNjcm9sbFRvcEFmdGVyQXR0YWNoID0gQHNjcm9sbFRvcCgpXG5cbiAgICAjIENsZWFuIHVwIGNvcHkgYW5kIGN1dCBsb2NhbFN0b3JhZ2UgVmFyaWFibGVzXG4gICAgTG9jYWxTdG9yYWdlWyd0cmVlLXZpZXc6Y3V0UGF0aCddID0gbnVsbFxuICAgIExvY2FsU3RvcmFnZVsndHJlZS12aWV3OmNvcHlQYXRoJ10gPSBudWxsXG5cbiAgICBAcGFuZWwuZGVzdHJveSgpXG4gICAgQHBhbmVsID0gbnVsbFxuICAgIEB1bmZvY3VzKClcblxuICBmb2N1czogLT5cbiAgICBAbGlzdC5mb2N1cygpXG5cbiAgdW5mb2N1czogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKVxuXG4gIGhhc0ZvY3VzOiAtPlxuICAgIEBsaXN0LmlzKCc6Zm9jdXMnKSBvciBkb2N1bWVudC5hY3RpdmVFbGVtZW50IGlzIEBsaXN0WzBdXG5cbiAgdG9nZ2xlRm9jdXM6IC0+XG4gICAgaWYgQGhhc0ZvY3VzKClcbiAgICAgIEB1bmZvY3VzKClcbiAgICBlbHNlXG4gICAgICBAc2hvdygpXG5cbiAgZW50cnlDbGlja2VkOiAoZSkgLT5cbiAgICBlbnRyeSA9IGUuY3VycmVudFRhcmdldFxuICAgIGlzUmVjdXJzaXZlID0gZS5hbHRLZXkgb3IgZmFsc2VcbiAgICBAc2VsZWN0RW50cnkoZW50cnkpXG4gICAgaWYgZW50cnkgaW5zdGFuY2VvZiBEaXJlY3RvcnlWaWV3XG4gICAgICBlbnRyeS50b2dnbGVFeHBhbnNpb24oaXNSZWN1cnNpdmUpXG4gICAgZWxzZSBpZiBlbnRyeSBpbnN0YW5jZW9mIEZpbGVWaWV3XG4gICAgICBAZmlsZVZpZXdFbnRyeUNsaWNrZWQoZSlcblxuICAgIGZhbHNlXG5cbiAgZmlsZVZpZXdFbnRyeUNsaWNrZWQ6IChlKSAtPlxuICAgIGZpbGVQYXRoID0gZS5jdXJyZW50VGFyZ2V0LmdldFBhdGgoKVxuICAgIGRldGFpbCA9IGUub3JpZ2luYWxFdmVudD8uZGV0YWlsID8gMVxuICAgIGFsd2F5c09wZW5FeGlzdGluZyA9IGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LmFsd2F5c09wZW5FeGlzdGluZycpXG4gICAgaWYgZGV0YWlsIGlzIDFcbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnY29yZS5hbGxvd1BlbmRpbmdQYW5lSXRlbXMnKVxuICAgICAgICBvcGVuUHJvbWlzZSA9IGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgsIHBlbmRpbmc6IHRydWUsIGFjdGl2YXRlUGFuZTogZmFsc2UsIHNlYXJjaEFsbFBhbmVzOiBhbHdheXNPcGVuRXhpc3RpbmcpXG4gICAgICAgIEBjdXJyZW50bHlPcGVuaW5nLnNldChmaWxlUGF0aCwgb3BlblByb21pc2UpXG4gICAgICAgIG9wZW5Qcm9taXNlLnRoZW4gPT4gQGN1cnJlbnRseU9wZW5pbmcuZGVsZXRlKGZpbGVQYXRoKVxuICAgIGVsc2UgaWYgZGV0YWlsIGlzIDJcbiAgICAgIEBvcGVuQWZ0ZXJQcm9taXNlKGZpbGVQYXRoLCBzZWFyY2hBbGxQYW5lczogYWx3YXlzT3BlbkV4aXN0aW5nKVxuXG4gIG9wZW5BZnRlclByb21pc2U6ICh1cmksIG9wdGlvbnMpIC0+XG4gICAgaWYgcHJvbWlzZSA9IEBjdXJyZW50bHlPcGVuaW5nLmdldCh1cmkpXG4gICAgICBwcm9taXNlLnRoZW4gLT4gYXRvbS53b3Jrc3BhY2Uub3Blbih1cmksIG9wdGlvbnMpXG4gICAgZWxzZVxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbih1cmksIG9wdGlvbnMpXG5cbiAgcmVzaXplU3RhcnRlZDogPT5cbiAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgQHJlc2l6ZVRyZWVWaWV3KVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgQHJlc2l6ZVN0b3BwZWQpXG5cbiAgcmVzaXplU3RvcHBlZDogPT5cbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlbW92ZScsIEByZXNpemVUcmVlVmlldylcbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNldXAnLCBAcmVzaXplU3RvcHBlZClcblxuICByZXNpemVUcmVlVmlldzogKHtwYWdlWCwgd2hpY2h9KSA9PlxuICAgIHJldHVybiBAcmVzaXplU3RvcHBlZCgpIHVubGVzcyB3aGljaCBpcyAxXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3RyZWUtdmlldy5zaG93T25SaWdodFNpZGUnKVxuICAgICAgd2lkdGggPSBAb3V0ZXJXaWR0aCgpICsgQG9mZnNldCgpLmxlZnQgLSBwYWdlWFxuICAgIGVsc2VcbiAgICAgIHdpZHRoID0gcGFnZVggLSBAb2Zmc2V0KCkubGVmdFxuICAgIEB3aWR0aCh3aWR0aClcblxuICByZXNpemVUb0ZpdENvbnRlbnQ6IC0+XG4gICAgQHdpZHRoKDEpICMgU2hyaW5rIHRvIG1lYXN1cmUgdGhlIG1pbmltdW0gd2lkdGggb2YgbGlzdFxuICAgIEB3aWR0aChAbGlzdC5vdXRlcldpZHRoKCkpXG5cbiAgbG9hZElnbm9yZWRQYXR0ZXJuczogLT5cbiAgICBAaWdub3JlZFBhdHRlcm5zLmxlbmd0aCA9IDBcbiAgICByZXR1cm4gdW5sZXNzIGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LmhpZGVJZ25vcmVkTmFtZXMnKVxuXG4gICAgTWluaW1hdGNoID89IHJlcXVpcmUoJ21pbmltYXRjaCcpLk1pbmltYXRjaFxuXG4gICAgaWdub3JlZE5hbWVzID0gYXRvbS5jb25maWcuZ2V0KCdjb3JlLmlnbm9yZWROYW1lcycpID8gW11cbiAgICBpZ25vcmVkTmFtZXMgPSBbaWdub3JlZE5hbWVzXSBpZiB0eXBlb2YgaWdub3JlZE5hbWVzIGlzICdzdHJpbmcnXG4gICAgZm9yIGlnbm9yZWROYW1lIGluIGlnbm9yZWROYW1lcyB3aGVuIGlnbm9yZWROYW1lXG4gICAgICB0cnlcbiAgICAgICAgQGlnbm9yZWRQYXR0ZXJucy5wdXNoKG5ldyBNaW5pbWF0Y2goaWdub3JlZE5hbWUsIG1hdGNoQmFzZTogdHJ1ZSwgZG90OiB0cnVlKSlcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiRXJyb3IgcGFyc2luZyBpZ25vcmUgcGF0dGVybiAoI3tpZ25vcmVkTmFtZX0pXCIsIGRldGFpbDogZXJyb3IubWVzc2FnZSlcblxuICB1cGRhdGVSb290czogKGV4cGFuc2lvblN0YXRlcz17fSkgLT5cbiAgICBvbGRFeHBhbnNpb25TdGF0ZXMgPSB7fVxuICAgIGZvciByb290IGluIEByb290c1xuICAgICAgb2xkRXhwYW5zaW9uU3RhdGVzW3Jvb3QuZGlyZWN0b3J5LnBhdGhdID0gcm9vdC5kaXJlY3Rvcnkuc2VyaWFsaXplRXhwYW5zaW9uU3RhdGUoKVxuICAgICAgcm9vdC5kaXJlY3RvcnkuZGVzdHJveSgpXG4gICAgICByb290LnJlbW92ZSgpXG5cbiAgICBAbG9hZElnbm9yZWRQYXR0ZXJucygpXG5cbiAgICBAcm9vdHMgPSBmb3IgcHJvamVjdFBhdGggaW4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICAgIGNvbnRpbnVlIHVubGVzcyBzdGF0cyA9IGZzLmxzdGF0U3luY05vRXhjZXB0aW9uKHByb2plY3RQYXRoKVxuICAgICAgc3RhdHMgPSBfLnBpY2sgc3RhdHMsIF8ua2V5cyhzdGF0cykuLi5cbiAgICAgIGZvciBrZXkgaW4gW1wiYXRpbWVcIiwgXCJiaXJ0aHRpbWVcIiwgXCJjdGltZVwiLCBcIm10aW1lXCJdXG4gICAgICAgIHN0YXRzW2tleV0gPSBzdGF0c1trZXldLmdldFRpbWUoKVxuXG4gICAgICBkaXJlY3RvcnkgPSBuZXcgRGlyZWN0b3J5KHtcbiAgICAgICAgbmFtZTogcGF0aC5iYXNlbmFtZShwcm9qZWN0UGF0aClcbiAgICAgICAgZnVsbFBhdGg6IHByb2plY3RQYXRoXG4gICAgICAgIHN5bWxpbms6IGZhbHNlXG4gICAgICAgIGlzUm9vdDogdHJ1ZVxuICAgICAgICBleHBhbnNpb25TdGF0ZTogZXhwYW5zaW9uU3RhdGVzW3Byb2plY3RQYXRoXSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBvbGRFeHBhbnNpb25TdGF0ZXNbcHJvamVjdFBhdGhdID9cbiAgICAgICAgICAgICAgICAgICAgICAgIHtpc0V4cGFuZGVkOiB0cnVlfVxuICAgICAgICBAaWdub3JlZFBhdHRlcm5zXG4gICAgICAgIEB1c2VTeW5jRlNcbiAgICAgICAgc3RhdHNcbiAgICAgIH0pXG4gICAgICByb290ID0gbmV3IERpcmVjdG9yeVZpZXcoKVxuICAgICAgcm9vdC5pbml0aWFsaXplKGRpcmVjdG9yeSlcbiAgICAgIEBsaXN0WzBdLmFwcGVuZENoaWxkKHJvb3QpXG4gICAgICByb290XG5cbiAgICBpZiBAYXR0YWNoQWZ0ZXJQcm9qZWN0UGF0aFNldFxuICAgICAgQGF0dGFjaCgpXG4gICAgICBAYXR0YWNoQWZ0ZXJQcm9qZWN0UGF0aFNldCA9IGZhbHNlXG5cbiAgZ2V0QWN0aXZlUGF0aDogLT4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKT8uZ2V0UGF0aD8oKVxuXG4gIHNlbGVjdEFjdGl2ZUZpbGU6IC0+XG4gICAgaWYgYWN0aXZlRmlsZVBhdGggPSBAZ2V0QWN0aXZlUGF0aCgpXG4gICAgICBAc2VsZWN0RW50cnlGb3JQYXRoKGFjdGl2ZUZpbGVQYXRoKVxuICAgIGVsc2VcbiAgICAgIEBkZXNlbGVjdCgpXG5cbiAgcmV2ZWFsQWN0aXZlRmlsZTogLT5cbiAgICByZXR1cm4gaWYgXy5pc0VtcHR5KGF0b20ucHJvamVjdC5nZXRQYXRocygpKVxuXG4gICAgQGF0dGFjaCgpXG4gICAgQGZvY3VzKCkgaWYgYXRvbS5jb25maWcuZ2V0KCd0cmVlLXZpZXcuZm9jdXNPblJldmVhbCcpXG5cbiAgICByZXR1cm4gdW5sZXNzIGFjdGl2ZUZpbGVQYXRoID0gQGdldEFjdGl2ZVBhdGgoKVxuXG4gICAgW3Jvb3RQYXRoLCByZWxhdGl2ZVBhdGhdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGFjdGl2ZUZpbGVQYXRoKVxuICAgIHJldHVybiB1bmxlc3Mgcm9vdFBhdGg/XG5cbiAgICBhY3RpdmVQYXRoQ29tcG9uZW50cyA9IHJlbGF0aXZlUGF0aC5zcGxpdChwYXRoLnNlcClcbiAgICBjdXJyZW50UGF0aCA9IHJvb3RQYXRoXG4gICAgZm9yIHBhdGhDb21wb25lbnQgaW4gYWN0aXZlUGF0aENvbXBvbmVudHNcbiAgICAgIGN1cnJlbnRQYXRoICs9IHBhdGguc2VwICsgcGF0aENvbXBvbmVudFxuICAgICAgZW50cnkgPSBAZW50cnlGb3JQYXRoKGN1cnJlbnRQYXRoKVxuICAgICAgaWYgZW50cnkgaW5zdGFuY2VvZiBEaXJlY3RvcnlWaWV3XG4gICAgICAgIGVudHJ5LmV4cGFuZCgpXG4gICAgICBlbHNlXG4gICAgICAgIEBzZWxlY3RFbnRyeShlbnRyeSlcbiAgICAgICAgQHNjcm9sbFRvRW50cnkoZW50cnkpXG5cbiAgY29weVNlbGVjdGVkRW50cnlQYXRoOiAocmVsYXRpdmVQYXRoID0gZmFsc2UpIC0+XG4gICAgaWYgcGF0aFRvQ29weSA9IEBzZWxlY3RlZFBhdGhcbiAgICAgIHBhdGhUb0NvcHkgPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZShwYXRoVG9Db3B5KSBpZiByZWxhdGl2ZVBhdGhcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHBhdGhUb0NvcHkpXG5cbiAgZW50cnlGb3JQYXRoOiAoZW50cnlQYXRoKSAtPlxuICAgIGJlc3RNYXRjaEVudHJ5ID0gbnVsbFxuICAgIGJlc3RNYXRjaExlbmd0aCA9IDBcblxuICAgIGZvciBlbnRyeSBpbiBAbGlzdFswXS5xdWVyeVNlbGVjdG9yQWxsKCcuZW50cnknKVxuICAgICAgaWYgZW50cnkuaXNQYXRoRXF1YWwoZW50cnlQYXRoKVxuICAgICAgICByZXR1cm4gZW50cnlcblxuICAgICAgZW50cnlMZW5ndGggPSBlbnRyeS5nZXRQYXRoKCkubGVuZ3RoXG4gICAgICBpZiBlbnRyeS5kaXJlY3Rvcnk/LmNvbnRhaW5zKGVudHJ5UGF0aCkgYW5kIGVudHJ5TGVuZ3RoID4gYmVzdE1hdGNoTGVuZ3RoXG4gICAgICAgIGJlc3RNYXRjaEVudHJ5ID0gZW50cnlcbiAgICAgICAgYmVzdE1hdGNoTGVuZ3RoID0gZW50cnlMZW5ndGhcblxuICAgIGJlc3RNYXRjaEVudHJ5XG5cbiAgc2VsZWN0RW50cnlGb3JQYXRoOiAoZW50cnlQYXRoKSAtPlxuICAgIEBzZWxlY3RFbnRyeShAZW50cnlGb3JQYXRoKGVudHJ5UGF0aCkpXG5cbiAgbW92ZURvd246IChldmVudCkgLT5cbiAgICBldmVudD8uc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICBzZWxlY3RlZEVudHJ5ID0gQHNlbGVjdGVkRW50cnkoKVxuICAgIGlmIHNlbGVjdGVkRW50cnk/XG4gICAgICBpZiBzZWxlY3RlZEVudHJ5IGluc3RhbmNlb2YgRGlyZWN0b3J5Vmlld1xuICAgICAgICBpZiBAc2VsZWN0RW50cnkoc2VsZWN0ZWRFbnRyeS5lbnRyaWVzLmNoaWxkcmVuWzBdKVxuICAgICAgICAgIEBzY3JvbGxUb0VudHJ5KEBzZWxlY3RlZEVudHJ5KCkpXG4gICAgICAgICAgcmV0dXJuXG5cbiAgICAgIHNlbGVjdGVkRW50cnkgPSAkKHNlbGVjdGVkRW50cnkpXG4gICAgICB1bnRpbCBAc2VsZWN0RW50cnkoc2VsZWN0ZWRFbnRyeS5uZXh0KCcuZW50cnknKVswXSlcbiAgICAgICAgc2VsZWN0ZWRFbnRyeSA9IHNlbGVjdGVkRW50cnkucGFyZW50cygnLmVudHJ5OmZpcnN0JylcbiAgICAgICAgYnJlYWsgdW5sZXNzIHNlbGVjdGVkRW50cnkubGVuZ3RoXG4gICAgZWxzZVxuICAgICAgQHNlbGVjdEVudHJ5KEByb290c1swXSlcblxuICAgIEBzY3JvbGxUb0VudHJ5KEBzZWxlY3RlZEVudHJ5KCkpXG5cbiAgbW92ZVVwOiAoZXZlbnQpIC0+XG4gICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICBzZWxlY3RlZEVudHJ5ID0gQHNlbGVjdGVkRW50cnkoKVxuICAgIGlmIHNlbGVjdGVkRW50cnk/XG4gICAgICBzZWxlY3RlZEVudHJ5ID0gJChzZWxlY3RlZEVudHJ5KVxuICAgICAgaWYgcHJldmlvdXNFbnRyeSA9IEBzZWxlY3RFbnRyeShzZWxlY3RlZEVudHJ5LnByZXYoJy5lbnRyeScpWzBdKVxuICAgICAgICBpZiBwcmV2aW91c0VudHJ5IGluc3RhbmNlb2YgRGlyZWN0b3J5Vmlld1xuICAgICAgICAgIEBzZWxlY3RFbnRyeShfLmxhc3QocHJldmlvdXNFbnRyeS5lbnRyaWVzLmNoaWxkcmVuKSlcbiAgICAgIGVsc2VcbiAgICAgICAgQHNlbGVjdEVudHJ5KHNlbGVjdGVkRW50cnkucGFyZW50cygnLmRpcmVjdG9yeScpLmZpcnN0KCk/WzBdKVxuICAgIGVsc2VcbiAgICAgIEBzZWxlY3RFbnRyeShAbGlzdC5maW5kKCcuZW50cnknKS5sYXN0KCk/WzBdKVxuXG4gICAgQHNjcm9sbFRvRW50cnkoQHNlbGVjdGVkRW50cnkoKSlcblxuICBleHBhbmREaXJlY3Rvcnk6IChpc1JlY3Vyc2l2ZT1mYWxzZSkgLT5cbiAgICBzZWxlY3RlZEVudHJ5ID0gQHNlbGVjdGVkRW50cnkoKVxuICAgIGlmIGlzUmVjdXJzaXZlIGlzIGZhbHNlIGFuZCBzZWxlY3RlZEVudHJ5LmlzRXhwYW5kZWRcbiAgICAgIEBtb3ZlRG93bigpIGlmIHNlbGVjdGVkRW50cnkuZGlyZWN0b3J5LmdldEVudHJpZXMoKS5sZW5ndGggPiAwXG4gICAgZWxzZVxuICAgICAgc2VsZWN0ZWRFbnRyeS5leHBhbmQoaXNSZWN1cnNpdmUpXG5cbiAgY29sbGFwc2VEaXJlY3Rvcnk6IChpc1JlY3Vyc2l2ZT1mYWxzZSkgLT5cbiAgICBzZWxlY3RlZEVudHJ5ID0gQHNlbGVjdGVkRW50cnkoKVxuICAgIHJldHVybiB1bmxlc3Mgc2VsZWN0ZWRFbnRyeT9cblxuICAgIGlmIGRpcmVjdG9yeSA9ICQoc2VsZWN0ZWRFbnRyeSkuY2xvc2VzdCgnLmV4cGFuZGVkLmRpcmVjdG9yeScpWzBdXG4gICAgICBkaXJlY3RvcnkuY29sbGFwc2UoaXNSZWN1cnNpdmUpXG4gICAgICBAc2VsZWN0RW50cnkoZGlyZWN0b3J5KVxuXG4gIG9wZW5TZWxlY3RlZEVudHJ5OiAob3B0aW9ucz17fSwgZXhwYW5kRGlyZWN0b3J5PWZhbHNlKSAtPlxuICAgIHNlbGVjdGVkRW50cnkgPSBAc2VsZWN0ZWRFbnRyeSgpXG4gICAgaWYgc2VsZWN0ZWRFbnRyeSBpbnN0YW5jZW9mIERpcmVjdG9yeVZpZXdcbiAgICAgIGlmIGV4cGFuZERpcmVjdG9yeVxuICAgICAgICBAZXhwYW5kRGlyZWN0b3J5KGZhbHNlKVxuICAgICAgZWxzZVxuICAgICAgICBzZWxlY3RlZEVudHJ5LnRvZ2dsZUV4cGFuc2lvbigpXG4gICAgZWxzZSBpZiBzZWxlY3RlZEVudHJ5IGluc3RhbmNlb2YgRmlsZVZpZXdcbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LmFsd2F5c09wZW5FeGlzdGluZycpXG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduIHNlYXJjaEFsbFBhbmVzOiB0cnVlLCBvcHRpb25zXG4gICAgICBAb3BlbkFmdGVyUHJvbWlzZShzZWxlY3RlZEVudHJ5LmdldFBhdGgoKSwgb3B0aW9ucylcblxuICBvcGVuU2VsZWN0ZWRFbnRyeVNwbGl0OiAob3JpZW50YXRpb24sIHNpZGUpIC0+XG4gICAgc2VsZWN0ZWRFbnRyeSA9IEBzZWxlY3RlZEVudHJ5KClcbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgaWYgcGFuZSBhbmQgc2VsZWN0ZWRFbnRyeSBpbnN0YW5jZW9mIEZpbGVWaWV3XG4gICAgICBpZiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpXG4gICAgICAgIHNwbGl0ID0gcGFuZS5zcGxpdCBvcmllbnRhdGlvbiwgc2lkZVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lIHNlbGVjdGVkRW50cnkuZ2V0UGF0aCgpLCBzcGxpdFxuICAgICAgZWxzZVxuICAgICAgICBAb3BlblNlbGVjdGVkRW50cnkgeWVzXG5cbiAgb3BlblNlbGVjdGVkRW50cnlSaWdodDogLT5cbiAgICBAb3BlblNlbGVjdGVkRW50cnlTcGxpdCAnaG9yaXpvbnRhbCcsICdhZnRlcidcblxuICBvcGVuU2VsZWN0ZWRFbnRyeUxlZnQ6IC0+XG4gICAgQG9wZW5TZWxlY3RlZEVudHJ5U3BsaXQgJ2hvcml6b250YWwnLCAnYmVmb3JlJ1xuXG4gIG9wZW5TZWxlY3RlZEVudHJ5VXA6IC0+XG4gICAgQG9wZW5TZWxlY3RlZEVudHJ5U3BsaXQgJ3ZlcnRpY2FsJywgJ2JlZm9yZSdcblxuICBvcGVuU2VsZWN0ZWRFbnRyeURvd246IC0+XG4gICAgQG9wZW5TZWxlY3RlZEVudHJ5U3BsaXQgJ3ZlcnRpY2FsJywgJ2FmdGVyJ1xuXG4gIG9wZW5TZWxlY3RlZEVudHJ5SW5QYW5lOiAoaW5kZXgpIC0+XG4gICAgc2VsZWN0ZWRFbnRyeSA9IEBzZWxlY3RlZEVudHJ5KClcbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVtpbmRleF1cbiAgICBpZiBwYW5lIGFuZCBzZWxlY3RlZEVudHJ5IGluc3RhbmNlb2YgRmlsZVZpZXdcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUgc2VsZWN0ZWRFbnRyeS5nZXRQYXRoKCksIHBhbmVcblxuICBtb3ZlU2VsZWN0ZWRFbnRyeTogLT5cbiAgICBpZiBAaGFzRm9jdXMoKVxuICAgICAgZW50cnkgPSBAc2VsZWN0ZWRFbnRyeSgpXG4gICAgICByZXR1cm4gaWYgbm90IGVudHJ5PyBvciBlbnRyeSBpbiBAcm9vdHNcbiAgICAgIG9sZFBhdGggPSBlbnRyeS5nZXRQYXRoKClcbiAgICBlbHNlXG4gICAgICBvbGRQYXRoID0gQGdldEFjdGl2ZVBhdGgoKVxuXG4gICAgaWYgb2xkUGF0aFxuICAgICAgTW92ZURpYWxvZyA/PSByZXF1aXJlICcuL21vdmUtZGlhbG9nJ1xuICAgICAgZGlhbG9nID0gbmV3IE1vdmVEaWFsb2cob2xkUGF0aClcbiAgICAgIGRpYWxvZy5hdHRhY2goKVxuXG4gICMgR2V0IHRoZSBvdXRsaW5lIG9mIGEgc3lzdGVtIGNhbGwgdG8gdGhlIGN1cnJlbnQgcGxhdGZvcm0ncyBmaWxlIG1hbmFnZXIuXG4gICNcbiAgIyBwYXRoVG9PcGVuICAtIFBhdGggdG8gYSBmaWxlIG9yIGRpcmVjdG9yeS5cbiAgIyBpc0ZpbGUgICAgICAtIFRydWUgaWYgdGhlIHBhdGggaXMgYSBmaWxlLCBmYWxzZSBvdGhlcndpc2UuXG4gICNcbiAgIyBSZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIGEgY29tbWFuZCwgYSBodW1hbi1yZWFkYWJsZSBsYWJlbCwgYW5kIHRoZVxuICAjIGFyZ3VtZW50cy5cbiAgZmlsZU1hbmFnZXJDb21tYW5kRm9yUGF0aDogKHBhdGhUb09wZW4sIGlzRmlsZSkgLT5cbiAgICBzd2l0Y2ggcHJvY2Vzcy5wbGF0Zm9ybVxuICAgICAgd2hlbiAnZGFyd2luJ1xuICAgICAgICBjb21tYW5kOiAnb3BlbidcbiAgICAgICAgbGFiZWw6ICdGaW5kZXInXG4gICAgICAgIGFyZ3M6IFsnLVInLCBwYXRoVG9PcGVuXVxuICAgICAgd2hlbiAnd2luMzInXG4gICAgICAgIGFyZ3MgPSBbXCIvc2VsZWN0LFxcXCIje3BhdGhUb09wZW59XFxcIlwiXVxuXG4gICAgICAgIGlmIHByb2Nlc3MuZW52LlN5c3RlbVJvb3RcbiAgICAgICAgICBjb21tYW5kID0gcGF0aC5qb2luKHByb2Nlc3MuZW52LlN5c3RlbVJvb3QsICdleHBsb3Jlci5leGUnKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgY29tbWFuZCA9ICdleHBsb3Jlci5leGUnXG5cbiAgICAgICAgY29tbWFuZDogY29tbWFuZFxuICAgICAgICBsYWJlbDogJ0V4cGxvcmVyJ1xuICAgICAgICBhcmdzOiBhcmdzXG4gICAgICBlbHNlXG4gICAgICAgICMgU3RyaXAgdGhlIGZpbGVuYW1lIGZyb20gdGhlIHBhdGggdG8gbWFrZSBzdXJlIHdlIHBhc3MgYSBkaXJlY3RvcnlcbiAgICAgICAgIyBwYXRoLiBJZiB3ZSBwYXNzIHhkZy1vcGVuIGEgZmlsZSBwYXRoLCBpdCB3aWxsIG9wZW4gdGhhdCBmaWxlIGluIHRoZVxuICAgICAgICAjIG1vc3Qgc3VpdGFibGUgYXBwbGljYXRpb24gaW5zdGVhZCwgd2hpY2ggaXMgbm90IHdoYXQgd2Ugd2FudC5cbiAgICAgICAgcGF0aFRvT3BlbiA9ICBwYXRoLmRpcm5hbWUocGF0aFRvT3BlbikgaWYgaXNGaWxlXG5cbiAgICAgICAgY29tbWFuZDogJ3hkZy1vcGVuJ1xuICAgICAgICBsYWJlbDogJ0ZpbGUgTWFuYWdlcidcbiAgICAgICAgYXJnczogW3BhdGhUb09wZW5dXG5cbiAgb3BlbkluRmlsZU1hbmFnZXI6IChjb21tYW5kLCBhcmdzLCBsYWJlbCwgaXNGaWxlKSAtPlxuICAgIGhhbmRsZUVycm9yID0gKGVycm9yTWVzc2FnZSkgLT5cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcIk9wZW5pbmcgI3tpZiBpc0ZpbGUgdGhlbiAnZmlsZScgZWxzZSAnZm9sZGVyJ30gaW4gI3tsYWJlbH0gZmFpbGVkXCIsXG4gICAgICAgIGRldGFpbDogZXJyb3JNZXNzYWdlXG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG5cbiAgICBlcnJvckxpbmVzID0gW11cbiAgICBzdGRlcnIgPSAobGluZXMpIC0+IGVycm9yTGluZXMucHVzaChsaW5lcylcbiAgICBleGl0ID0gKGNvZGUpIC0+XG4gICAgICBmYWlsZWQgPSBjb2RlIGlzbnQgMFxuICAgICAgZXJyb3JNZXNzYWdlID0gZXJyb3JMaW5lcy5qb2luKCdcXG4nKVxuXG4gICAgICAjIFdpbmRvd3MgOCBzZWVtcyB0byByZXR1cm4gYSAxIHdpdGggbm8gZXJyb3Igb3V0cHV0IGV2ZW4gb24gc3VjY2Vzc1xuICAgICAgaWYgcHJvY2Vzcy5wbGF0Zm9ybSBpcyAnd2luMzInIGFuZCBjb2RlIGlzIDEgYW5kIG5vdCBlcnJvck1lc3NhZ2VcbiAgICAgICAgZmFpbGVkID0gZmFsc2VcblxuICAgICAgaGFuZGxlRXJyb3IoZXJyb3JNZXNzYWdlKSBpZiBmYWlsZWRcblxuICAgIHNob3dQcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2Vzcyh7Y29tbWFuZCwgYXJncywgc3RkZXJyLCBleGl0fSlcbiAgICBzaG93UHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yICh7ZXJyb3IsIGhhbmRsZX0pIC0+XG4gICAgICBoYW5kbGUoKVxuICAgICAgaGFuZGxlRXJyb3IoZXJyb3I/Lm1lc3NhZ2UpXG4gICAgc2hvd1Byb2Nlc3NcblxuICBzaG93U2VsZWN0ZWRFbnRyeUluRmlsZU1hbmFnZXI6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBlbnRyeSA9IEBzZWxlY3RlZEVudHJ5KClcblxuICAgIGlzRmlsZSA9IGVudHJ5IGluc3RhbmNlb2YgRmlsZVZpZXdcbiAgICB7Y29tbWFuZCwgYXJncywgbGFiZWx9ID0gQGZpbGVNYW5hZ2VyQ29tbWFuZEZvclBhdGgoZW50cnkuZ2V0UGF0aCgpLCBpc0ZpbGUpXG4gICAgQG9wZW5JbkZpbGVNYW5hZ2VyKGNvbW1hbmQsIGFyZ3MsIGxhYmVsLCBpc0ZpbGUpXG5cbiAgc2hvd0N1cnJlbnRGaWxlSW5GaWxlTWFuYWdlcjogLT5cbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yLmdldFBhdGgoKVxuICAgIHtjb21tYW5kLCBhcmdzLCBsYWJlbH0gPSBAZmlsZU1hbmFnZXJDb21tYW5kRm9yUGF0aChlZGl0b3IuZ2V0UGF0aCgpLCB0cnVlKVxuICAgIEBvcGVuSW5GaWxlTWFuYWdlcihjb21tYW5kLCBhcmdzLCBsYWJlbCwgdHJ1ZSlcblxuICBvcGVuU2VsZWN0ZWRFbnRyeUluTmV3V2luZG93OiAtPlxuICAgIGlmIHBhdGhUb09wZW4gPSBAc2VsZWN0ZWRFbnRyeSgpPy5nZXRQYXRoKClcbiAgICAgIGF0b20ub3Blbih7cGF0aHNUb09wZW46IFtwYXRoVG9PcGVuXSwgbmV3V2luZG93OiB0cnVlfSlcblxuICBjb3B5U2VsZWN0ZWRFbnRyeTogLT5cbiAgICBpZiBAaGFzRm9jdXMoKVxuICAgICAgZW50cnkgPSBAc2VsZWN0ZWRFbnRyeSgpXG4gICAgICByZXR1cm4gaWYgZW50cnkgaW4gQHJvb3RzXG4gICAgICBvbGRQYXRoID0gZW50cnk/LmdldFBhdGgoKVxuICAgIGVsc2VcbiAgICAgIG9sZFBhdGggPSBAZ2V0QWN0aXZlUGF0aCgpXG4gICAgcmV0dXJuIHVubGVzcyBvbGRQYXRoXG5cbiAgICBDb3B5RGlhbG9nID89IHJlcXVpcmUgJy4vY29weS1kaWFsb2cnXG4gICAgZGlhbG9nID0gbmV3IENvcHlEaWFsb2cob2xkUGF0aClcbiAgICBkaWFsb2cuYXR0YWNoKClcblxuICByZW1vdmVTZWxlY3RlZEVudHJpZXM6IC0+XG4gICAgaWYgQGhhc0ZvY3VzKClcbiAgICAgIHNlbGVjdGVkUGF0aHMgPSBAc2VsZWN0ZWRQYXRocygpXG4gICAgZWxzZSBpZiBhY3RpdmVQYXRoID0gQGdldEFjdGl2ZVBhdGgoKVxuICAgICAgc2VsZWN0ZWRQYXRocyA9IFthY3RpdmVQYXRoXVxuXG4gICAgcmV0dXJuIHVubGVzcyBzZWxlY3RlZFBhdGhzIGFuZCBzZWxlY3RlZFBhdGhzLmxlbmd0aCA+IDBcblxuICAgIGZvciByb290IGluIEByb290c1xuICAgICAgaWYgcm9vdC5nZXRQYXRoKCkgaW4gc2VsZWN0ZWRQYXRoc1xuICAgICAgICBhdG9tLmNvbmZpcm1cbiAgICAgICAgICBtZXNzYWdlOiBcIlRoZSByb290IGRpcmVjdG9yeSAnI3tyb290LmRpcmVjdG9yeS5uYW1lfScgY2FuJ3QgYmUgcmVtb3ZlZC5cIlxuICAgICAgICAgIGJ1dHRvbnM6IFsnT0snXVxuICAgICAgICByZXR1cm5cblxuICAgIGF0b20uY29uZmlybVxuICAgICAgbWVzc2FnZTogXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoZSBzZWxlY3RlZCAje2lmIHNlbGVjdGVkUGF0aHMubGVuZ3RoID4gMSB0aGVuICdpdGVtcycgZWxzZSAnaXRlbSd9P1wiXG4gICAgICBkZXRhaWxlZE1lc3NhZ2U6IFwiWW91IGFyZSBkZWxldGluZzpcXG4je3NlbGVjdGVkUGF0aHMuam9pbignXFxuJyl9XCJcbiAgICAgIGJ1dHRvbnM6XG4gICAgICAgIFwiTW92ZSB0byBUcmFzaFwiOiA9PlxuICAgICAgICAgIGZhaWxlZERlbGV0aW9ucyA9IFtdXG4gICAgICAgICAgZm9yIHNlbGVjdGVkUGF0aCBpbiBzZWxlY3RlZFBhdGhzXG4gICAgICAgICAgICBpZiBzaGVsbC5tb3ZlSXRlbVRvVHJhc2goc2VsZWN0ZWRQYXRoKVxuICAgICAgICAgICAgICBmb3IgZWRpdG9yIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgICAgICAgICAgICBpZiBlZGl0b3I/LmdldFBhdGgoKSBpcyBzZWxlY3RlZFBhdGhcbiAgICAgICAgICAgICAgICAgIGVkaXRvci5kZXN0cm95KClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgZmFpbGVkRGVsZXRpb25zLnB1c2ggXCIje3NlbGVjdGVkUGF0aH1cIlxuICAgICAgICAgICAgaWYgcmVwbyA9IHJlcG9Gb3JQYXRoKHNlbGVjdGVkUGF0aClcbiAgICAgICAgICAgICAgcmVwby5nZXRQYXRoU3RhdHVzKHNlbGVjdGVkUGF0aClcbiAgICAgICAgICBpZiBmYWlsZWREZWxldGlvbnMubGVuZ3RoID4gMFxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIEBmb3JtYXRUcmFzaEZhaWx1cmVNZXNzYWdlKGZhaWxlZERlbGV0aW9ucyksXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBAZm9ybWF0VHJhc2hFbmFibGVkTWVzc2FnZSgpXG4gICAgICAgICAgICAgIGRldGFpbDogXCIje2ZhaWxlZERlbGV0aW9ucy5qb2luKCdcXG4nKX1cIlxuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgIEB1cGRhdGVSb290cygpIGlmIGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LnNxdWFzaERpcmVjdG9yeU5hbWVzJylcbiAgICAgICAgXCJDYW5jZWxcIjogbnVsbFxuXG4gIGZvcm1hdFRyYXNoRmFpbHVyZU1lc3NhZ2U6IChmYWlsZWREZWxldGlvbnMpIC0+XG4gICAgZmlsZVRleHQgPSBpZiBmYWlsZWREZWxldGlvbnMubGVuZ3RoID4gMSB0aGVuICdmaWxlcycgZWxzZSAnZmlsZSdcblxuICAgIFwiVGhlIGZvbGxvd2luZyAje2ZpbGVUZXh0fSBjb3VsZG4ndCBiZSBtb3ZlZCB0byB0aGUgdHJhc2guXCJcblxuICBmb3JtYXRUcmFzaEVuYWJsZWRNZXNzYWdlOiAtPlxuICAgIHN3aXRjaCBwcm9jZXNzLnBsYXRmb3JtXG4gICAgICB3aGVuICdsaW51eCcgdGhlbiAnSXMgYGd2ZnMtdHJhc2hgIGluc3RhbGxlZD8nXG4gICAgICB3aGVuICdkYXJ3aW4nIHRoZW4gJ0lzIFRyYXNoIGVuYWJsZWQgb24gdGhlIHZvbHVtZSB3aGVyZSB0aGUgZmlsZXMgYXJlIHN0b3JlZD8nXG4gICAgICB3aGVuICd3aW4zMicgdGhlbiAnSXMgdGhlcmUgYSBSZWN5Y2xlIEJpbiBvbiB0aGUgZHJpdmUgd2hlcmUgdGhlIGZpbGVzIGFyZSBzdG9yZWQ/J1xuXG4gICMgUHVibGljOiBDb3B5IHRoZSBwYXRoIG9mIHRoZSBzZWxlY3RlZCBlbnRyeSBlbGVtZW50LlxuICAjICAgICAgICAgU2F2ZSB0aGUgcGF0aCBpbiBsb2NhbFN0b3JhZ2UsIHNvIHRoYXQgY29weWluZyBmcm9tIDIgZGlmZmVyZW50XG4gICMgICAgICAgICBpbnN0YW5jZXMgb2YgYXRvbSB3b3JrcyBhcyBpbnRlbmRlZFxuICAjXG4gICNcbiAgIyBSZXR1cm5zIGBjb3B5UGF0aGAuXG4gIGNvcHlTZWxlY3RlZEVudHJpZXM6IC0+XG4gICAgc2VsZWN0ZWRQYXRocyA9IEBzZWxlY3RlZFBhdGhzKClcbiAgICByZXR1cm4gdW5sZXNzIHNlbGVjdGVkUGF0aHMgYW5kIHNlbGVjdGVkUGF0aHMubGVuZ3RoID4gMFxuICAgICMgc2F2ZSB0byBsb2NhbFN0b3JhZ2Ugc28gd2UgY2FuIHBhc3RlIGFjcm9zcyBtdWx0aXBsZSBvcGVuIGFwcHNcbiAgICBMb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndHJlZS12aWV3OmN1dFBhdGgnKVxuICAgIExvY2FsU3RvcmFnZVsndHJlZS12aWV3OmNvcHlQYXRoJ10gPSBKU09OLnN0cmluZ2lmeShzZWxlY3RlZFBhdGhzKVxuXG4gICMgUHVibGljOiBDb3B5IHRoZSBwYXRoIG9mIHRoZSBzZWxlY3RlZCBlbnRyeSBlbGVtZW50LlxuICAjICAgICAgICAgU2F2ZSB0aGUgcGF0aCBpbiBsb2NhbFN0b3JhZ2UsIHNvIHRoYXQgY3V0dGluZyBmcm9tIDIgZGlmZmVyZW50XG4gICMgICAgICAgICBpbnN0YW5jZXMgb2YgYXRvbSB3b3JrcyBhcyBpbnRlbmRlZFxuICAjXG4gICNcbiAgIyBSZXR1cm5zIGBjdXRQYXRoYFxuICBjdXRTZWxlY3RlZEVudHJpZXM6IC0+XG4gICAgc2VsZWN0ZWRQYXRocyA9IEBzZWxlY3RlZFBhdGhzKClcbiAgICByZXR1cm4gdW5sZXNzIHNlbGVjdGVkUGF0aHMgYW5kIHNlbGVjdGVkUGF0aHMubGVuZ3RoID4gMFxuICAgICMgc2F2ZSB0byBsb2NhbFN0b3JhZ2Ugc28gd2UgY2FuIHBhc3RlIGFjcm9zcyBtdWx0aXBsZSBvcGVuIGFwcHNcbiAgICBMb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndHJlZS12aWV3OmNvcHlQYXRoJylcbiAgICBMb2NhbFN0b3JhZ2VbJ3RyZWUtdmlldzpjdXRQYXRoJ10gPSBKU09OLnN0cmluZ2lmeShzZWxlY3RlZFBhdGhzKVxuXG4gICMgUHVibGljOiBQYXN0ZSBhIGNvcGllZCBvciBjdXQgaXRlbS5cbiAgIyAgICAgICAgIElmIGEgZmlsZSBpcyBzZWxlY3RlZCwgdGhlIGZpbGUncyBwYXJlbnQgZGlyZWN0b3J5IGlzIHVzZWQgYXMgdGhlXG4gICMgICAgICAgICBwYXN0ZSBkZXN0aW5hdGlvbi5cbiAgI1xuICAjXG4gICMgUmV0dXJucyBgZGVzdGluYXRpb24gbmV3UGF0aGAuXG4gIHBhc3RlRW50cmllczogLT5cbiAgICBzZWxlY3RlZEVudHJ5ID0gQHNlbGVjdGVkRW50cnkoKVxuICAgIGN1dFBhdGhzID0gaWYgTG9jYWxTdG9yYWdlWyd0cmVlLXZpZXc6Y3V0UGF0aCddIHRoZW4gSlNPTi5wYXJzZShMb2NhbFN0b3JhZ2VbJ3RyZWUtdmlldzpjdXRQYXRoJ10pIGVsc2UgbnVsbFxuICAgIGNvcGllZFBhdGhzID0gaWYgTG9jYWxTdG9yYWdlWyd0cmVlLXZpZXc6Y29weVBhdGgnXSB0aGVuIEpTT04ucGFyc2UoTG9jYWxTdG9yYWdlWyd0cmVlLXZpZXc6Y29weVBhdGgnXSkgZWxzZSBudWxsXG4gICAgaW5pdGlhbFBhdGhzID0gY29waWVkUGF0aHMgb3IgY3V0UGF0aHNcblxuICAgIGNhdGNoQW5kU2hvd0ZpbGVFcnJvcnMgPSAob3BlcmF0aW9uKSAtPlxuICAgICAgdHJ5XG4gICAgICAgIG9wZXJhdGlvbigpXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIlVuYWJsZSB0byBwYXN0ZSBwYXRoczogI3tpbml0aWFsUGF0aHN9XCIsIGRldGFpbDogZXJyb3IubWVzc2FnZSlcblxuICAgIGZvciBpbml0aWFsUGF0aCBpbiBpbml0aWFsUGF0aHMgPyBbXVxuICAgICAgaW5pdGlhbFBhdGhJc0RpcmVjdG9yeSA9IGZzLmlzRGlyZWN0b3J5U3luYyhpbml0aWFsUGF0aClcbiAgICAgIGlmIHNlbGVjdGVkRW50cnkgYW5kIGluaXRpYWxQYXRoIGFuZCBmcy5leGlzdHNTeW5jKGluaXRpYWxQYXRoKVxuICAgICAgICBiYXNlUGF0aCA9IHNlbGVjdGVkRW50cnkuZ2V0UGF0aCgpXG4gICAgICAgIGJhc2VQYXRoID0gcGF0aC5kaXJuYW1lKGJhc2VQYXRoKSBpZiBzZWxlY3RlZEVudHJ5IGluc3RhbmNlb2YgRmlsZVZpZXdcbiAgICAgICAgbmV3UGF0aCA9IHBhdGguam9pbihiYXNlUGF0aCwgcGF0aC5iYXNlbmFtZShpbml0aWFsUGF0aCkpXG5cbiAgICAgICAgaWYgY29waWVkUGF0aHNcbiAgICAgICAgICAjIGFwcGVuZCBhIG51bWJlciB0byB0aGUgZmlsZSBpZiBhbiBpdGVtIHdpdGggdGhlIHNhbWUgbmFtZSBleGlzdHNcbiAgICAgICAgICBmaWxlQ291bnRlciA9IDBcbiAgICAgICAgICBvcmlnaW5hbE5ld1BhdGggPSBuZXdQYXRoXG4gICAgICAgICAgd2hpbGUgZnMuZXhpc3RzU3luYyhuZXdQYXRoKVxuICAgICAgICAgICAgaWYgaW5pdGlhbFBhdGhJc0RpcmVjdG9yeVxuICAgICAgICAgICAgICBuZXdQYXRoID0gXCIje29yaWdpbmFsTmV3UGF0aH0je2ZpbGVDb3VudGVyfVwiXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGV4dGVuc2lvbiA9IGdldEZ1bGxFeHRlbnNpb24ob3JpZ2luYWxOZXdQYXRoKVxuICAgICAgICAgICAgICBmaWxlUGF0aCA9IHBhdGguam9pbihwYXRoLmRpcm5hbWUob3JpZ2luYWxOZXdQYXRoKSwgcGF0aC5iYXNlbmFtZShvcmlnaW5hbE5ld1BhdGgsIGV4dGVuc2lvbikpXG4gICAgICAgICAgICAgIG5ld1BhdGggPSBcIiN7ZmlsZVBhdGh9I3tmaWxlQ291bnRlcn0je2V4dGVuc2lvbn1cIlxuICAgICAgICAgICAgZmlsZUNvdW50ZXIgKz0gMVxuXG4gICAgICAgICAgaWYgZnMuaXNEaXJlY3RvcnlTeW5jKGluaXRpYWxQYXRoKVxuICAgICAgICAgICAgIyB1c2UgZnMuY29weSB0byBjb3B5IGRpcmVjdG9yaWVzIHNpbmNlIHJlYWQvd3JpdGUgd2lsbCBmYWlsIGZvciBkaXJlY3Rvcmllc1xuICAgICAgICAgICAgY2F0Y2hBbmRTaG93RmlsZUVycm9ycyAtPiBmcy5jb3B5U3luYyhpbml0aWFsUGF0aCwgbmV3UGF0aClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIHJlYWQgdGhlIG9sZCBmaWxlIGFuZCB3cml0ZSBhIG5ldyBvbmUgYXQgdGFyZ2V0IGxvY2F0aW9uXG4gICAgICAgICAgICBjYXRjaEFuZFNob3dGaWxlRXJyb3JzIC0+IGZzLndyaXRlRmlsZVN5bmMobmV3UGF0aCwgZnMucmVhZEZpbGVTeW5jKGluaXRpYWxQYXRoKSlcbiAgICAgICAgZWxzZSBpZiBjdXRQYXRoc1xuICAgICAgICAgICMgT25seSBtb3ZlIHRoZSB0YXJnZXQgaWYgdGhlIGN1dCB0YXJnZXQgZG9lc24ndCBleGlzdHMgYW5kIGlmIHRoZSBuZXdQYXRoXG4gICAgICAgICAgIyBpcyBub3Qgd2l0aGluIHRoZSBpbml0aWFsIHBhdGhcbiAgICAgICAgICB1bmxlc3MgZnMuZXhpc3RzU3luYyhuZXdQYXRoKSBvciBuZXdQYXRoLnN0YXJ0c1dpdGgoaW5pdGlhbFBhdGgpXG4gICAgICAgICAgICBjYXRjaEFuZFNob3dGaWxlRXJyb3JzIC0+IGZzLm1vdmVTeW5jKGluaXRpYWxQYXRoLCBuZXdQYXRoKVxuXG4gIGFkZDogKGlzQ3JlYXRpbmdGaWxlKSAtPlxuICAgIHNlbGVjdGVkRW50cnkgPSBAc2VsZWN0ZWRFbnRyeSgpID8gQHJvb3RzWzBdXG4gICAgc2VsZWN0ZWRQYXRoID0gc2VsZWN0ZWRFbnRyeT8uZ2V0UGF0aCgpID8gJydcblxuICAgIEFkZERpYWxvZyA/PSByZXF1aXJlICcuL2FkZC1kaWFsb2cnXG4gICAgZGlhbG9nID0gbmV3IEFkZERpYWxvZyhzZWxlY3RlZFBhdGgsIGlzQ3JlYXRpbmdGaWxlKVxuICAgIGRpYWxvZy5vbiAnZGlyZWN0b3J5LWNyZWF0ZWQnLCAoZXZlbnQsIGNyZWF0ZWRQYXRoKSA9PlxuICAgICAgQGVudHJ5Rm9yUGF0aChjcmVhdGVkUGF0aCk/LnJlbG9hZCgpXG4gICAgICBAc2VsZWN0RW50cnlGb3JQYXRoKGNyZWF0ZWRQYXRoKVxuICAgICAgQHVwZGF0ZVJvb3RzKCkgaWYgYXRvbS5jb25maWcuZ2V0KCd0cmVlLXZpZXcuc3F1YXNoRGlyZWN0b3J5TmFtZXMnKVxuICAgICAgZmFsc2VcbiAgICBkaWFsb2cub24gJ2ZpbGUtY3JlYXRlZCcsIChldmVudCwgY3JlYXRlZFBhdGgpID0+XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGNyZWF0ZWRQYXRoKVxuICAgICAgQHVwZGF0ZVJvb3RzKCkgaWYgYXRvbS5jb25maWcuZ2V0KCd0cmVlLXZpZXcuc3F1YXNoRGlyZWN0b3J5TmFtZXMnKVxuICAgICAgZmFsc2VcbiAgICBkaWFsb2cuYXR0YWNoKClcblxuICByZW1vdmVQcm9qZWN0Rm9sZGVyOiAoZSkgLT5cbiAgICBwYXRoVG9SZW1vdmUgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KFwiLnByb2plY3Qtcm9vdCA+IC5oZWFkZXJcIikuZmluZChcIi5uYW1lXCIpLmRhdGEoXCJwYXRoXCIpXG5cbiAgICAjIFRPRE86IHJlbW92ZSB0aGlzIGNvbmRpdGlvbmFsIG9uY2UgdGhlIGFkZGl0aW9uIG9mIFByb2plY3Q6OnJlbW92ZVBhdGhcbiAgICAjIGlzIHJlbGVhc2VkLlxuICAgIGlmIGF0b20ucHJvamVjdC5yZW1vdmVQYXRoP1xuICAgICAgYXRvbS5wcm9qZWN0LnJlbW92ZVBhdGgocGF0aFRvUmVtb3ZlKSBpZiBwYXRoVG9SZW1vdmU/XG5cbiAgc2VsZWN0ZWRFbnRyeTogLT5cbiAgICBAbGlzdFswXS5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0ZWQnKVxuXG4gIHNlbGVjdEVudHJ5OiAoZW50cnkpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBlbnRyeT9cblxuICAgIEBzZWxlY3RlZFBhdGggPSBlbnRyeS5nZXRQYXRoKClcblxuICAgIHNlbGVjdGVkRW50cmllcyA9IEBnZXRTZWxlY3RlZEVudHJpZXMoKVxuICAgIGlmIHNlbGVjdGVkRW50cmllcy5sZW5ndGggPiAxIG9yIHNlbGVjdGVkRW50cmllc1swXSBpc250IGVudHJ5XG4gICAgICBAZGVzZWxlY3Qoc2VsZWN0ZWRFbnRyaWVzKVxuICAgICAgZW50cnkuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICAgIGVudHJ5XG5cbiAgZ2V0U2VsZWN0ZWRFbnRyaWVzOiAtPlxuICAgIEBsaXN0WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZWxlY3RlZCcpXG5cbiAgZGVzZWxlY3Q6IChlbGVtZW50c1RvRGVzZWxlY3Q9QGdldFNlbGVjdGVkRW50cmllcygpKSAtPlxuICAgIHNlbGVjdGVkLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJykgZm9yIHNlbGVjdGVkIGluIGVsZW1lbnRzVG9EZXNlbGVjdFxuICAgIHVuZGVmaW5lZFxuXG4gIHNjcm9sbFRvcDogKHRvcCkgLT5cbiAgICBpZiB0b3A/XG4gICAgICBAc2Nyb2xsZXIuc2Nyb2xsVG9wKHRvcClcbiAgICBlbHNlXG4gICAgICBAc2Nyb2xsZXIuc2Nyb2xsVG9wKClcblxuICBzY3JvbGxCb3R0b206IChib3R0b20pIC0+XG4gICAgaWYgYm90dG9tP1xuICAgICAgQHNjcm9sbGVyLnNjcm9sbEJvdHRvbShib3R0b20pXG4gICAgZWxzZVxuICAgICAgQHNjcm9sbGVyLnNjcm9sbEJvdHRvbSgpXG5cbiAgc2Nyb2xsVG9FbnRyeTogKGVudHJ5KSAtPlxuICAgIGVsZW1lbnQgPSBpZiBlbnRyeSBpbnN0YW5jZW9mIERpcmVjdG9yeVZpZXcgdGhlbiBlbnRyeS5oZWFkZXIgZWxzZSBlbnRyeVxuICAgIGVsZW1lbnQ/LnNjcm9sbEludG9WaWV3SWZOZWVkZWQodHJ1ZSkgIyB0cnVlID0gY2VudGVyIGFyb3VuZCBpdGVtIGlmIHBvc3NpYmxlXG5cbiAgc2Nyb2xsVG9Cb3R0b206IC0+XG4gICAgaWYgbGFzdEVudHJ5ID0gXy5sYXN0KEBsaXN0WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5lbnRyeScpKVxuICAgICAgQHNlbGVjdEVudHJ5KGxhc3RFbnRyeSlcbiAgICAgIEBzY3JvbGxUb0VudHJ5KGxhc3RFbnRyeSlcblxuICBzY3JvbGxUb1RvcDogLT5cbiAgICBAc2VsZWN0RW50cnkoQHJvb3RzWzBdKSBpZiBAcm9vdHNbMF0/XG4gICAgQHNjcm9sbFRvcCgwKVxuXG4gIHRvZ2dsZVNpZGU6IC0+XG4gICAgdG9nZ2xlQ29uZmlnKCd0cmVlLXZpZXcuc2hvd09uUmlnaHRTaWRlJylcblxuICBtb3ZlRW50cnk6IChpbml0aWFsUGF0aCwgbmV3RGlyZWN0b3J5UGF0aCkgLT5cbiAgICBpZiBpbml0aWFsUGF0aCBpcyBuZXdEaXJlY3RvcnlQYXRoXG4gICAgICByZXR1cm5cblxuICAgIGVudHJ5TmFtZSA9IHBhdGguYmFzZW5hbWUoaW5pdGlhbFBhdGgpXG4gICAgbmV3UGF0aCA9IFwiI3tuZXdEaXJlY3RvcnlQYXRofS8je2VudHJ5TmFtZX1cIi5yZXBsYWNlKC9cXHMrJC8sICcnKVxuXG4gICAgdHJ5XG4gICAgICBmcy5tYWtlVHJlZVN5bmMobmV3RGlyZWN0b3J5UGF0aCkgdW5sZXNzIGZzLmV4aXN0c1N5bmMobmV3RGlyZWN0b3J5UGF0aClcbiAgICAgIGZzLm1vdmVTeW5jKGluaXRpYWxQYXRoLCBuZXdQYXRoKVxuXG4gICAgICBpZiByZXBvID0gcmVwb0ZvclBhdGgobmV3UGF0aClcbiAgICAgICAgcmVwby5nZXRQYXRoU3RhdHVzKGluaXRpYWxQYXRoKVxuICAgICAgICByZXBvLmdldFBhdGhTdGF0dXMobmV3UGF0aClcblxuICAgIGNhdGNoIGVycm9yXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIkZhaWxlZCB0byBtb3ZlIGVudHJ5ICN7aW5pdGlhbFBhdGh9IHRvICN7bmV3RGlyZWN0b3J5UGF0aH1cIiwgZGV0YWlsOiBlcnJvci5tZXNzYWdlKVxuXG4gIG9uU3R5bGVzaGVldHNDaGFuZ2VkOiA9PlxuICAgIHJldHVybiB1bmxlc3MgQGlzVmlzaWJsZSgpXG5cbiAgICAjIEZvcmNlIGEgcmVkcmF3IHNvIHRoZSBzY3JvbGxiYXJzIGFyZSBzdHlsZWQgY29ycmVjdGx5IGJhc2VkIG9uIHRoZSB0aGVtZVxuICAgIEBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICBAZWxlbWVudC5vZmZzZXRXaWR0aFxuICAgIEBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJ1xuXG4gIG9uTW91c2VEb3duOiAoZSkgLT5cbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAjIHJldHVybiBlYXJseSBpZiB3ZSdyZSBvcGVuaW5nIGEgY29udGV4dHVhbCBtZW51IChyaWdodCBjbGljaykgZHVyaW5nIG11bHRpLXNlbGVjdCBtb2RlXG4gICAgaWYgQG11bHRpU2VsZWN0RW5hYmxlZCgpIGFuZFxuICAgICAgIGUuY3VycmVudFRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3NlbGVjdGVkJykgYW5kXG4gICAgICAgIyBtb3VzZSByaWdodCBjbGljayBvciBjdHJsIGNsaWNrIGFzIHJpZ2h0IGNsaWNrIG9uIGRhcndpbiBwbGF0Zm9ybXNcbiAgICAgICAoZS5idXR0b24gaXMgMiBvciBlLmN0cmxLZXkgYW5kIHByb2Nlc3MucGxhdGZvcm0gaXMgJ2RhcndpbicpXG4gICAgICByZXR1cm5cblxuICAgIGVudHJ5VG9TZWxlY3QgPSBlLmN1cnJlbnRUYXJnZXRcblxuICAgIGlmIGUuc2hpZnRLZXlcbiAgICAgIEBzZWxlY3RDb250aW51b3VzRW50cmllcyhlbnRyeVRvU2VsZWN0KVxuICAgICAgQHNob3dNdWx0aVNlbGVjdE1lbnUoKVxuICAgICMgb25seSBhbGxvdyBjdHJsIGNsaWNrIGZvciBtdWx0aSBzZWxlY3Rpb24gb24gbm9uIGRhcndpbiBzeXN0ZW1zXG4gICAgZWxzZSBpZiBlLm1ldGFLZXkgb3IgKGUuY3RybEtleSBhbmQgcHJvY2Vzcy5wbGF0Zm9ybSBpc250ICdkYXJ3aW4nKVxuICAgICAgQHNlbGVjdE11bHRpcGxlRW50cmllcyhlbnRyeVRvU2VsZWN0KVxuXG4gICAgICAjIG9ubHkgc2hvdyB0aGUgbXVsdGkgc2VsZWN0IG1lbnUgaWYgbW9yZSB0aGVuIG9uZSBmaWxlL2RpcmVjdG9yeSBpcyBzZWxlY3RlZFxuICAgICAgQHNob3dNdWx0aVNlbGVjdE1lbnUoKSBpZiBAc2VsZWN0ZWRQYXRocygpLmxlbmd0aCA+IDFcbiAgICBlbHNlXG4gICAgICBAc2VsZWN0RW50cnkoZW50cnlUb1NlbGVjdClcbiAgICAgIEBzaG93RnVsbE1lbnUoKVxuXG4gIG9uU2lkZVRvZ2dsZWQ6IChuZXdWYWx1ZSkgLT5cbiAgICBAZWxlbWVudC5kYXRhc2V0LnNob3dPblJpZ2h0U2lkZSA9IG5ld1ZhbHVlXG4gICAgaWYgQGlzVmlzaWJsZSgpXG4gICAgICBAZGV0YWNoKClcbiAgICAgIEBhdHRhY2goKVxuXG4gICMgUHVibGljOiBSZXR1cm4gYW4gYXJyYXkgb2YgcGF0aHMgZnJvbSBhbGwgc2VsZWN0ZWQgaXRlbXNcbiAgI1xuICAjIEV4YW1wbGU6IEBzZWxlY3RlZFBhdGhzKClcbiAgIyA9PiBbJ3NlbGVjdGVkL3BhdGgvb25lJywgJ3NlbGVjdGVkL3BhdGgvdHdvJywgJ3NlbGVjdGVkL3BhdGgvdGhyZWUnXVxuICAjIFJldHVybnMgQXJyYXkgb2Ygc2VsZWN0ZWQgaXRlbSBwYXRoc1xuICBzZWxlY3RlZFBhdGhzOiAtPlxuICAgIGVudHJ5LmdldFBhdGgoKSBmb3IgZW50cnkgaW4gQGdldFNlbGVjdGVkRW50cmllcygpXG5cbiAgIyBQdWJsaWM6IFNlbGVjdHMgaXRlbXMgd2l0aGluIGEgcmFuZ2UgZGVmaW5lZCBieSBhIGN1cnJlbnRseSBzZWxlY3RlZCBlbnRyeSBhbmRcbiAgIyAgICAgICAgIGEgbmV3IGdpdmVuIGVudHJ5LiBUaGlzIGlzIHNoaWZ0K2NsaWNrIGZ1bmN0aW9uYWxpdHlcbiAgI1xuICAjIFJldHVybnMgYXJyYXkgb2Ygc2VsZWN0ZWQgZWxlbWVudHNcbiAgc2VsZWN0Q29udGludW91c0VudHJpZXM6IChlbnRyeSkgLT5cbiAgICBjdXJyZW50U2VsZWN0ZWRFbnRyeSA9IEBzZWxlY3RlZEVudHJ5KClcbiAgICBwYXJlbnRDb250YWluZXIgPSAkKGVudHJ5KS5wYXJlbnQoKVxuICAgIGlmICQuY29udGFpbnMocGFyZW50Q29udGFpbmVyWzBdLCBjdXJyZW50U2VsZWN0ZWRFbnRyeSlcbiAgICAgIGVudHJpZXMgPSBwYXJlbnRDb250YWluZXIuZmluZCgnLmVudHJ5JykudG9BcnJheSgpXG4gICAgICBlbnRyeUluZGV4ID0gZW50cmllcy5pbmRleE9mKGVudHJ5KVxuICAgICAgc2VsZWN0ZWRJbmRleCA9IGVudHJpZXMuaW5kZXhPZihjdXJyZW50U2VsZWN0ZWRFbnRyeSlcbiAgICAgIGVsZW1lbnRzID0gKGVudHJpZXNbaV0gZm9yIGkgaW4gW2VudHJ5SW5kZXguLnNlbGVjdGVkSW5kZXhdKVxuXG4gICAgICBAZGVzZWxlY3QoKVxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpIGZvciBlbGVtZW50IGluIGVsZW1lbnRzXG5cbiAgICBlbGVtZW50c1xuXG4gICMgUHVibGljOiBTZWxlY3RzIGNvbnNlY3V0aXZlIGdpdmVuIGVudHJpZXMgd2l0aG91dCBjbGVhcmluZyBwcmV2aW91c2x5IHNlbGVjdGVkXG4gICMgICAgICAgICBpdGVtcy4gVGhpcyBpcyBjbWQrY2xpY2sgZnVuY3Rpb25hbGl0eVxuICAjXG4gICMgUmV0dXJucyBnaXZlbiBlbnRyeVxuICBzZWxlY3RNdWx0aXBsZUVudHJpZXM6IChlbnRyeSkgLT5cbiAgICBlbnRyeT8uY2xhc3NMaXN0LnRvZ2dsZSgnc2VsZWN0ZWQnKVxuICAgIGVudHJ5XG5cbiAgIyBQdWJsaWM6IFRvZ2dsZSBmdWxsLW1lbnUgY2xhc3Mgb24gdGhlIG1haW4gbGlzdCBlbGVtZW50IHRvIGRpc3BsYXkgdGhlIGZ1bGwgY29udGV4dFxuICAjICAgICAgICAgbWVudS5cbiAgc2hvd0Z1bGxNZW51OiAtPlxuICAgIEBsaXN0WzBdLmNsYXNzTGlzdC5yZW1vdmUoJ211bHRpLXNlbGVjdCcpXG4gICAgQGxpc3RbMF0uY2xhc3NMaXN0LmFkZCgnZnVsbC1tZW51JylcblxuICAjIFB1YmxpYzogVG9nZ2xlIG11bHRpLXNlbGVjdCBjbGFzcyBvbiB0aGUgbWFpbiBsaXN0IGVsZW1lbnQgdG8gZGlzcGxheSB0aGUgdGhlXG4gICMgICAgICAgICBtZW51IHdpdGggb25seSBpdGVtcyB0aGF0IG1ha2Ugc2Vuc2UgZm9yIG11bHRpIHNlbGVjdCBmdW5jdGlvbmFsaXR5XG4gIHNob3dNdWx0aVNlbGVjdE1lbnU6IC0+XG4gICAgQGxpc3RbMF0uY2xhc3NMaXN0LnJlbW92ZSgnZnVsbC1tZW51JylcbiAgICBAbGlzdFswXS5jbGFzc0xpc3QuYWRkKCdtdWx0aS1zZWxlY3QnKVxuXG4gICMgUHVibGljOiBDaGVjayBmb3IgbXVsdGktc2VsZWN0IGNsYXNzIG9uIHRoZSBtYWluIGxpc3RcbiAgI1xuICAjIFJldHVybnMgYm9vbGVhblxuICBtdWx0aVNlbGVjdEVuYWJsZWQ6IC0+XG4gICAgQGxpc3RbMF0uY2xhc3NMaXN0LmNvbnRhaW5zKCdtdWx0aS1zZWxlY3QnKVxuXG4gIG9uRHJhZ0VudGVyOiAoZSkgPT5cbiAgICByZXR1cm4gaWYgQHJvb3REcmFnQW5kRHJvcC5pc0RyYWdnaW5nKGUpXG5cbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICBlbnRyeSA9IGUuY3VycmVudFRhcmdldC5wYXJlbnROb2RlXG4gICAgQGRyYWdFdmVudENvdW50cy5zZXQoZW50cnksIDApIHVubGVzcyBAZHJhZ0V2ZW50Q291bnRzLmdldChlbnRyeSlcbiAgICBlbnRyeS5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpIGlmIEBkcmFnRXZlbnRDb3VudHMuZ2V0KGVudHJ5KSBpcyAwXG4gICAgQGRyYWdFdmVudENvdW50cy5zZXQoZW50cnksIEBkcmFnRXZlbnRDb3VudHMuZ2V0KGVudHJ5KSArIDEpXG5cbiAgb25EcmFnTGVhdmU6IChlKSA9PlxuICAgIHJldHVybiBpZiBAcm9vdERyYWdBbmREcm9wLmlzRHJhZ2dpbmcoZSlcblxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIGVudHJ5ID0gZS5jdXJyZW50VGFyZ2V0LnBhcmVudE5vZGVcbiAgICBAZHJhZ0V2ZW50Q291bnRzLnNldChlbnRyeSwgQGRyYWdFdmVudENvdW50cy5nZXQoZW50cnkpIC0gMSlcbiAgICBlbnRyeS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpIGlmIEBkcmFnRXZlbnRDb3VudHMuZ2V0KGVudHJ5KSBpcyAwXG5cbiAgIyBIYW5kbGUgZW50cnkgbmFtZSBvYmplY3QgZHJhZ3N0YXJ0IGV2ZW50XG4gIG9uRHJhZ1N0YXJ0OiAoZSkgLT5cbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICBpZiBAcm9vdERyYWdBbmREcm9wLmNhbkRyYWdTdGFydChlKVxuICAgICAgcmV0dXJuIEByb290RHJhZ0FuZERyb3Aub25EcmFnU3RhcnQoZSlcblxuICAgIHRhcmdldCA9ICQoZS5jdXJyZW50VGFyZ2V0KS5maW5kKFwiLm5hbWVcIilcbiAgICBpbml0aWFsUGF0aCA9IHRhcmdldC5kYXRhKFwicGF0aFwiKVxuXG4gICAgc3R5bGUgPSBnZXRTdHlsZU9iamVjdCh0YXJnZXRbMF0pXG5cbiAgICBmaWxlTmFtZUVsZW1lbnQgPSB0YXJnZXQuY2xvbmUoKVxuICAgICAgLmNzcyhzdHlsZSlcbiAgICAgIC5jc3MoXG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnXG4gICAgICAgIHRvcDogMFxuICAgICAgICBsZWZ0OiAwXG4gICAgICApXG4gICAgZmlsZU5hbWVFbGVtZW50LmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpXG5cbiAgICBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSBcIm1vdmVcIlxuICAgIGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlKGZpbGVOYW1lRWxlbWVudFswXSwgMCwgMClcbiAgICBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJpbml0aWFsUGF0aFwiLCBpbml0aWFsUGF0aClcblxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgLT5cbiAgICAgIGZpbGVOYW1lRWxlbWVudC5yZW1vdmUoKVxuXG4gICMgSGFuZGxlIGVudHJ5IGRyYWdvdmVyIGV2ZW50OyByZXNldCBkZWZhdWx0IGRyYWdvdmVyIGFjdGlvbnNcbiAgb25EcmFnT3ZlcjogKGUpIC0+XG4gICAgcmV0dXJuIGlmIEByb290RHJhZ0FuZERyb3AuaXNEcmFnZ2luZyhlKVxuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgZW50cnkgPSBlLmN1cnJlbnRUYXJnZXRcbiAgICBpZiBAZHJhZ0V2ZW50Q291bnRzLmdldChlbnRyeSkgPiAwIGFuZCBub3QgZW50cnkuY2xhc3NMaXN0LmNvbnRhaW5zKCdzZWxlY3RlZCcpXG4gICAgICBlbnRyeS5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpXG5cbiAgIyBIYW5kbGUgZW50cnkgZHJvcCBldmVudFxuICBvbkRyb3A6IChlKSAtPlxuICAgIHJldHVybiBpZiBAcm9vdERyYWdBbmREcm9wLmlzRHJhZ2dpbmcoZSlcblxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIGVudHJ5ID0gZS5jdXJyZW50VGFyZ2V0XG4gICAgZW50cnkuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKVxuXG4gICAgcmV0dXJuIHVubGVzcyBlbnRyeSBpbnN0YW5jZW9mIERpcmVjdG9yeVZpZXdcblxuICAgIG5ld0RpcmVjdG9yeVBhdGggPSAkKGVudHJ5KS5maW5kKFwiLm5hbWVcIikuZGF0YShcInBhdGhcIilcbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIG5ld0RpcmVjdG9yeVBhdGhcblxuICAgIGluaXRpYWxQYXRoID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwiaW5pdGlhbFBhdGhcIilcblxuICAgIGlmIGluaXRpYWxQYXRoXG4gICAgICAjIERyb3AgZXZlbnQgZnJvbSBBdG9tXG4gICAgICBAbW92ZUVudHJ5KGluaXRpYWxQYXRoLCBuZXdEaXJlY3RvcnlQYXRoKVxuICAgIGVsc2VcbiAgICAgICMgRHJvcCBldmVudCBmcm9tIE9TXG4gICAgICBmb3IgZmlsZSBpbiBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzXG4gICAgICAgIEBtb3ZlRW50cnkoZmlsZS5wYXRoLCBuZXdEaXJlY3RvcnlQYXRoKVxuIl19
