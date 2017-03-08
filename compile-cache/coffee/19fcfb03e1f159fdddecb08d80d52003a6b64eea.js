(function() {
  var $, RootDragAndDropHandler, View, _, ipcRenderer, ref, ref1, remote, url,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  url = require('url');

  ref = require('electron'), ipcRenderer = ref.ipcRenderer, remote = ref.remote;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, View = ref1.View;

  _ = require('underscore-plus');

  module.exports = RootDragAndDropHandler = (function() {
    function RootDragAndDropHandler(treeView) {
      this.treeView = treeView;
      this.onDrop = bind(this.onDrop, this);
      this.onDropOnOtherWindow = bind(this.onDropOnOtherWindow, this);
      this.onDragOver = bind(this.onDragOver, this);
      this.onDragEnd = bind(this.onDragEnd, this);
      this.onDragLeave = bind(this.onDragLeave, this);
      this.onDragStart = bind(this.onDragStart, this);
      ipcRenderer.on('tree-view:project-folder-dropped', this.onDropOnOtherWindow);
      this.handleEvents();
    }

    RootDragAndDropHandler.prototype.dispose = function() {
      return ipcRenderer.removeListener('tree-view:project-folder-dropped', this.onDropOnOtherWindow);
    };

    RootDragAndDropHandler.prototype.handleEvents = function() {
      this.treeView.on('dragenter', '.tree-view', this.onDragEnter);
      this.treeView.on('dragend', '.project-root-header', this.onDragEnd);
      this.treeView.on('dragleave', '.tree-view', this.onDragLeave);
      this.treeView.on('dragover', '.tree-view', this.onDragOver);
      return this.treeView.on('drop', '.tree-view', this.onDrop);
    };

    RootDragAndDropHandler.prototype.onDragStart = function(e) {
      var directory, i, index, len, pathUri, projectRoot, ref2, ref3, root, rootIndex;
      this.prevDropTargetIndex = null;
      e.originalEvent.dataTransfer.setData('atom-tree-view-event', 'true');
      projectRoot = $(e.target).closest('.project-root');
      directory = projectRoot[0].directory;
      e.originalEvent.dataTransfer.setData('project-root-index', projectRoot.index());
      rootIndex = -1;
      ref2 = this.treeView.roots;
      for (index = i = 0, len = ref2.length; i < len; index = ++i) {
        root = ref2[index];
        if (root.directory === directory) {
          rootIndex = index;
          break;
        }
      }
      e.originalEvent.dataTransfer.setData('from-root-index', rootIndex);
      e.originalEvent.dataTransfer.setData('from-root-path', directory.path);
      e.originalEvent.dataTransfer.setData('from-window-id', this.getWindowId());
      e.originalEvent.dataTransfer.setData('text/plain', directory.path);
      if ((ref3 = process.platform) === 'darwin' || ref3 === 'linux') {
        if (!this.uriHasProtocol(directory.path)) {
          pathUri = "file://" + directory.path;
        }
        return e.originalEvent.dataTransfer.setData('text/uri-list', pathUri);
      }
    };

    RootDragAndDropHandler.prototype.uriHasProtocol = function(uri) {
      var error;
      try {
        return url.parse(uri).protocol != null;
      } catch (error1) {
        error = error1;
        return false;
      }
    };

    RootDragAndDropHandler.prototype.onDragEnter = function(e) {
      return e.stopPropagation();
    };

    RootDragAndDropHandler.prototype.onDragLeave = function(e) {
      e.stopPropagation();
      if (e.target === e.currentTarget) {
        return this.removePlaceholder();
      }
    };

    RootDragAndDropHandler.prototype.onDragEnd = function(e) {
      e.stopPropagation();
      return this.clearDropTarget();
    };

    RootDragAndDropHandler.prototype.onDragOver = function(e) {
      var element, entry, newDropTargetIndex, projectRoots;
      if (e.originalEvent.dataTransfer.getData('atom-tree-view-event') !== 'true') {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      entry = e.currentTarget;
      if (this.treeView.roots.length === 0) {
        this.getPlaceholder().appendTo(this.treeView.list);
        return;
      }
      newDropTargetIndex = this.getDropTargetIndex(e);
      if (newDropTargetIndex == null) {
        return;
      }
      if (this.prevDropTargetIndex === newDropTargetIndex) {
        return;
      }
      this.prevDropTargetIndex = newDropTargetIndex;
      projectRoots = $(this.treeView.roots);
      if (newDropTargetIndex < projectRoots.length) {
        element = projectRoots.eq(newDropTargetIndex);
        element.addClass('is-drop-target');
        return this.getPlaceholder().insertBefore(element);
      } else {
        element = projectRoots.eq(newDropTargetIndex - 1);
        element.addClass('drop-target-is-after');
        return this.getPlaceholder().insertAfter(element);
      }
    };

    RootDragAndDropHandler.prototype.onDropOnOtherWindow = function(e, fromItemIndex) {
      var paths;
      paths = atom.project.getPaths();
      paths.splice(fromItemIndex, 1);
      atom.project.setPaths(paths);
      return this.clearDropTarget();
    };

    RootDragAndDropHandler.prototype.clearDropTarget = function() {
      var element, ref2;
      element = this.treeView.find(".is-dragging");
      element.removeClass('is-dragging');
      if ((ref2 = element[0]) != null) {
        ref2.updateTooltip();
      }
      return this.removePlaceholder();
    };

    RootDragAndDropHandler.prototype.onDrop = function(e) {
      var browserWindow, dataTransfer, fromIndex, fromRootIndex, fromRootPath, fromWindowId, projectPaths, toIndex;
      e.preventDefault();
      e.stopPropagation();
      dataTransfer = e.originalEvent.dataTransfer;
      if (dataTransfer.getData('atom-tree-view-event') !== 'true') {
        return;
      }
      fromWindowId = parseInt(dataTransfer.getData('from-window-id'));
      fromRootPath = dataTransfer.getData('from-root-path');
      fromIndex = parseInt(dataTransfer.getData('project-root-index'));
      fromRootIndex = parseInt(dataTransfer.getData('from-root-index'));
      toIndex = this.getDropTargetIndex(e);
      this.clearDropTarget();
      if (fromWindowId === this.getWindowId()) {
        if (fromIndex !== toIndex) {
          projectPaths = atom.project.getPaths();
          projectPaths.splice(fromIndex, 1);
          if (toIndex > fromIndex) {
            toIndex -= 1;
          }
          projectPaths.splice(toIndex, 0, fromRootPath);
          return atom.project.setPaths(projectPaths);
        }
      } else {
        projectPaths = atom.project.getPaths();
        projectPaths.splice(toIndex, 0, fromRootPath);
        atom.project.setPaths(projectPaths);
        if (!isNaN(fromWindowId)) {
          browserWindow = remote.BrowserWindow.fromId(fromWindowId);
          return browserWindow != null ? browserWindow.webContents.send('tree-view:project-folder-dropped', fromIndex) : void 0;
        }
      }
    };

    RootDragAndDropHandler.prototype.getDropTargetIndex = function(e) {
      var center, projectRoot, projectRoots, target;
      target = $(e.target);
      if (this.isPlaceholder(target)) {
        return;
      }
      projectRoots = $(this.treeView.roots);
      projectRoot = target.closest('.project-root');
      if (projectRoot.length === 0) {
        projectRoot = projectRoots.last();
      }
      if (!projectRoot.length) {
        return 0;
      }
      center = projectRoot.offset().top + projectRoot.height() / 2;
      if (e.originalEvent.pageY < center) {
        return projectRoots.index(projectRoot);
      } else if (projectRoot.next('.project-root').length > 0) {
        return projectRoots.index(projectRoot.next('.project-root'));
      } else {
        return projectRoots.index(projectRoot) + 1;
      }
    };

    RootDragAndDropHandler.prototype.canDragStart = function(e) {
      return $(e.target).closest('.project-root-header').size() > 0;
    };

    RootDragAndDropHandler.prototype.isDragging = function(e) {
      return Boolean(e.originalEvent.dataTransfer.getData('from-root-path'));
    };

    RootDragAndDropHandler.prototype.getPlaceholder = function() {
      return this.placeholderEl != null ? this.placeholderEl : this.placeholderEl = $('<li/>', {
        "class": 'placeholder'
      });
    };

    RootDragAndDropHandler.prototype.removePlaceholder = function() {
      var ref2;
      if ((ref2 = this.placeholderEl) != null) {
        ref2.remove();
      }
      return this.placeholderEl = null;
    };

    RootDragAndDropHandler.prototype.isPlaceholder = function(element) {
      return element.is('.placeholder');
    };

    RootDragAndDropHandler.prototype.getWindowId = function() {
      return this.processId != null ? this.processId : this.processId = atom.getCurrentWindow().id;
    };

    return RootDragAndDropHandler;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3RyZWUtdmlldy9saWIvcm9vdC1kcmFnLWFuZC1kcm9wLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUVBQUE7SUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0VBRU4sTUFBd0IsT0FBQSxDQUFRLFVBQVIsQ0FBeEIsRUFBQyw2QkFBRCxFQUFjOztFQUVkLE9BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxVQUFELEVBQUk7O0VBQ0osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MsZ0NBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxXQUFEOzs7Ozs7O01BQ1osV0FBVyxDQUFDLEVBQVosQ0FBZSxrQ0FBZixFQUFtRCxJQUFDLENBQUEsbUJBQXBEO01BQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQUZXOztxQ0FJYixPQUFBLEdBQVMsU0FBQTthQUNQLFdBQVcsQ0FBQyxjQUFaLENBQTJCLGtDQUEzQixFQUErRCxJQUFDLENBQUEsbUJBQWhFO0lBRE87O3FDQUdULFlBQUEsR0FBYyxTQUFBO01BR1osSUFBQyxDQUFBLFFBQVEsQ0FBQyxFQUFWLENBQWEsV0FBYixFQUEwQixZQUExQixFQUF3QyxJQUFDLENBQUEsV0FBekM7TUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLEVBQVYsQ0FBYSxTQUFiLEVBQXdCLHNCQUF4QixFQUFnRCxJQUFDLENBQUEsU0FBakQ7TUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLEVBQVYsQ0FBYSxXQUFiLEVBQTBCLFlBQTFCLEVBQXdDLElBQUMsQ0FBQSxXQUF6QztNQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsRUFBVixDQUFhLFVBQWIsRUFBeUIsWUFBekIsRUFBdUMsSUFBQyxDQUFBLFVBQXhDO2FBQ0EsSUFBQyxDQUFBLFFB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O2FBQ1osQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQW9CLHNCQUFwQixDQUEyQyxDQUFDLElBQTVDLENBQUEsQ0FBQSxHQUFxRDtJQUR6Qzs7cUNBR2QsVUFBQSxHQUFZLFNBQUMsQ0FBRDthQUNWLE9BQUEsQ0FBUSxDQUFDLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUE3QixDQUFxQyxnQkFBckMsQ0FBUjtJQURVOztxQ0FHWixjQUFBLEdBQWdCLFNBQUE7MENBQ2QsSUFBQyxDQUFBLGdCQUFELElBQUMsQ0FBQSxnQkFBaUIsQ0FBQSxDQUFFLE9BQUYsRUFBVztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sYUFBUDtPQUFYO0lBREo7O3FDQUdoQixpQkFBQSxHQUFtQixTQUFBO0FBQ2pCLFVBQUE7O1lBQWMsQ0FBRSxNQUFoQixDQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBRkE7O3FDQUluQixhQUFBLEdBQWUsU0FBQyxPQUFEO2FBQ2IsT0FBTyxDQUFDLEVBQVIsQ0FBVyxjQUFYO0lBRGE7O3FDQUdmLFdBQUEsR0FBYSxTQUFBO3NDQUNYLElBQUMsQ0FBQSxZQUFELElBQUMsQ0FBQSxZQUFhLElBQUksQ0FBQyxnQkFBTCxDQUFBLENBQXVCLENBQUM7SUFEM0I7Ozs7O0FBaExmIiwic291cmNlc0NvbnRlbnQiOlsidXJsID0gcmVxdWlyZSAndXJsJ1xuXG57aXBjUmVuZGVyZXIsIHJlbW90ZX0gPSByZXF1aXJlICdlbGVjdHJvbidcblxueyQsIFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBSb290RHJhZ0FuZERyb3BIYW5kbGVyXG4gIGNvbnN0cnVjdG9yOiAoQHRyZWVWaWV3KSAtPlxuICAgIGlwY1JlbmRlcmVyLm9uKCd0cmVlLXZpZXc6cHJvamVjdC1mb2xkZXItZHJvcHBlZCcsIEBvbkRyb3BPbk90aGVyV2luZG93KVxuICAgIEBoYW5kbGVFdmVudHMoKVxuXG4gIGRpc3Bvc2U6IC0+XG4gICAgaXBjUmVuZGVyZXIucmVtb3ZlTGlzdGVuZXIoJ3RyZWUtdmlldzpwcm9qZWN0LWZvbGRlci1kcm9wcGVkJywgQG9uRHJvcE9uT3RoZXJXaW5kb3cpXG5cbiAgaGFuZGxlRXZlbnRzOiAtPlxuICAgICMgb25EcmFnU3RhcnQgaXMgY2FsbGVkIGRpcmVjdGx5IGJ5IFRyZWVWaWV3J3Mgb25EcmFnU3RhcnRcbiAgICAjIHdpbGwgYmUgY2xlYW5lZCB1cCBieSB0cmVlIHZpZXcsIHNpbmNlIHRoZXkgYXJlIHRyZWUtdmlldydzIGhhbmRsZXJzXG4gICAgQHRyZWVWaWV3Lm9uICdkcmFnZW50ZXInLCAnLnRyZWUtdmlldycsIEBvbkRyYWdFbnRlclxuICAgIEB0cmVlVmlldy5vbiAnZHJhZ2VuZCcsICcucHJvamVjdC1yb290LWhlYWRlcicsIEBvbkRyYWdFbmRcbiAgICBAdHJlZVZpZXcub24gJ2RyYWdsZWF2ZScsICcudHJlZS12aWV3JywgQG9uRHJhZ0xlYXZlXG4gICAgQHRyZWVWaWV3Lm9uICdkcmFnb3ZlcicsICcudHJlZS12aWV3JywgQG9uRHJhZ092ZXJcbiAgICBAdHJlZVZpZXcub24gJ2Ryb3AnLCAnLnRyZWUtdmlldycsIEBvbkRyb3BcblxuICBvbkRyYWdTdGFydDogKGUpID0+XG4gICAgQHByZXZEcm9wVGFyZ2V0SW5kZXggPSBudWxsXG4gICAgZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhICdhdG9tLXRyZWUtdmlldy1ldmVudCcsICd0cnVlJ1xuICAgIHByb2plY3RSb290ID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLnByb2plY3Qtcm9vdCcpXG4gICAgZGlyZWN0b3J5ID0gcHJvamVjdFJvb3RbMF0uZGlyZWN0b3J5XG5cbiAgICBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEgJ3Byb2plY3Qtcm9vdC1pbmRleCcsIHByb2plY3RSb290LmluZGV4KClcblxuICAgIHJvb3RJbmRleCA9IC0xXG4gICAgKHJvb3RJbmRleCA9IGluZGV4OyBicmVhaykgZm9yIHJvb3QsIGluZGV4IGluIEB0cmVlVmlldy5yb290cyB3aGVuIHJvb3QuZGlyZWN0b3J5IGlzIGRpcmVjdG9yeVxuXG4gICAgZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhICdmcm9tLXJvb3QtaW5kZXgnLCByb290SW5kZXhcbiAgICBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEgJ2Zyb20tcm9vdC1wYXRoJywgZGlyZWN0b3J5LnBhdGhcbiAgICBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEgJ2Zyb20td2luZG93LWlkJywgQGdldFdpbmRvd0lkKClcblxuICAgIGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSAndGV4dC9wbGFpbicsIGRpcmVjdG9yeS5wYXRoXG5cbiAgICBpZiBwcm9jZXNzLnBsYXRmb3JtIGluIFsnZGFyd2luJywgJ2xpbnV4J11cbiAgICAgIHBhdGhVcmkgPSBcImZpbGU6Ly8je2RpcmVjdG9yeS5wYXRofVwiIHVubGVzcyBAdXJpSGFzUHJvdG9jb2woZGlyZWN0b3J5LnBhdGgpXG4gICAgICBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEgJ3RleHQvdXJpLWxpc3QnLCBwYXRoVXJpXG5cbiAgdXJpSGFzUHJvdG9jb2w6ICh1cmkpIC0+XG4gICAgdHJ5XG4gICAgICB1cmwucGFyc2UodXJpKS5wcm90b2NvbD9cbiAgICBjYXRjaCBlcnJvclxuICAgICAgZmFsc2VcblxuICBvbkRyYWdFbnRlcjogKGUpIC0+XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gIG9uRHJhZ0xlYXZlOiAoZSkgPT5cbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgQHJlbW92ZVBsYWNlaG9sZGVyKCkgaWYgZS50YXJnZXQgaXMgZS5jdXJyZW50VGFyZ2V0XG5cbiAgb25EcmFnRW5kOiAoZSkgPT5cbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgQGNsZWFyRHJvcFRhcmdldCgpXG5cbiAgb25EcmFnT3ZlcjogKGUpID0+XG4gICAgdW5sZXNzIGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgnYXRvbS10cmVlLXZpZXctZXZlbnQnKSBpcyAndHJ1ZSdcbiAgICAgIHJldHVyblxuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgZW50cnkgPSBlLmN1cnJlbnRUYXJnZXRcblxuICAgIGlmIEB0cmVlVmlldy5yb290cy5sZW5ndGggaXMgMFxuICAgICAgQGdldFBsYWNlaG9sZGVyKCkuYXBwZW5kVG8oQHRyZWVWaWV3Lmxpc3QpXG4gICAgICByZXR1cm5cblxuICAgIG5ld0Ryb3BUYXJnZXRJbmRleCA9IEBnZXREcm9wVGFyZ2V0SW5kZXgoZSlcbiAgICByZXR1cm4gdW5sZXNzIG5ld0Ryb3BUYXJnZXRJbmRleD9cbiAgICByZXR1cm4gaWYgQHByZXZEcm9wVGFyZ2V0SW5kZXggaXMgbmV3RHJvcFRhcmdldEluZGV4XG4gICAgQHByZXZEcm9wVGFyZ2V0SW5kZXggPSBuZXdEcm9wVGFyZ2V0SW5kZXhcblxuICAgIHByb2plY3RSb290cyA9ICQoQHRyZWVWaWV3LnJvb3RzKVxuXG4gICAgaWYgbmV3RHJvcFRhcmdldEluZGV4IDwgcHJvamVjdFJvb3RzLmxlbmd0aFxuICAgICAgZWxlbWVudCA9IHByb2plY3RSb290cy5lcShuZXdEcm9wVGFyZ2V0SW5kZXgpXG4gICAgICBlbGVtZW50LmFkZENsYXNzICdpcy1kcm9wLXRhcmdldCdcbiAgICAgIEBnZXRQbGFjZWhvbGRlcigpLmluc2VydEJlZm9yZShlbGVtZW50KVxuICAgIGVsc2VcbiAgICAgIGVsZW1lbnQgPSBwcm9qZWN0Um9vdHMuZXEobmV3RHJvcFRhcmdldEluZGV4IC0gMSlcbiAgICAgIGVsZW1lbnQuYWRkQ2xhc3MgJ2Ryb3AtdGFyZ2V0LWlzLWFmdGVyJ1xuICAgICAgQGdldFBsYWNlaG9sZGVyKCkuaW5zZXJ0QWZ0ZXIoZWxlbWVudClcblxuICBvbkRyb3BPbk90aGVyV2luZG93OiAoZSwgZnJvbUl0ZW1JbmRleCkgPT5cbiAgICBwYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgcGF0aHMuc3BsaWNlKGZyb21JdGVtSW5kZXgsIDEpXG4gICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKHBhdGhzKVxuXG4gICAgQGNsZWFyRHJvcFRhcmdldCgpXG5cbiAgY2xlYXJEcm9wVGFyZ2V0OiAtPlxuICAgIGVsZW1lbnQgPSBAdHJlZVZpZXcuZmluZChcIi5pcy1kcmFnZ2luZ1wiKVxuICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MgJ2lzLWRyYWdnaW5nJ1xuICAgIGVsZW1lbnRbMF0/LnVwZGF0ZVRvb2x0aXAoKVxuICAgIEByZW1vdmVQbGFjZWhvbGRlcigpXG5cbiAgb25Ecm9wOiAoZSkgPT5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICB7ZGF0YVRyYW5zZmVyfSA9IGUub3JpZ2luYWxFdmVudFxuXG4gICAgIyBUT0RPOiBzdXBwb3J0IGRyYWdnaW5nIGZvbGRlcnMgZnJvbSB0aGUgZmlsZXN5c3RlbSAtLSBlbGVjdHJvbiBuZWVkcyB0byBhZGQgc3VwcG9ydCBmaXJzdFxuICAgIHJldHVybiB1bmxlc3MgZGF0YVRyYW5zZmVyLmdldERhdGEoJ2F0b20tdHJlZS12aWV3LWV2ZW50JykgaXMgJ3RydWUnXG5cbiAgICBmcm9tV2luZG93SWQgPSBwYXJzZUludChkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnZnJvbS13aW5kb3ctaWQnKSlcbiAgICBmcm9tUm9vdFBhdGggID0gZGF0YVRyYW5zZmVyLmdldERhdGEoJ2Zyb20tcm9vdC1wYXRoJylcbiAgICBmcm9tSW5kZXggICAgID0gcGFyc2VJbnQoZGF0YVRyYW5zZmVyLmdldERhdGEoJ3Byb2plY3Qtcm9vdC1pbmRleCcpKVxuICAgIGZyb21Sb290SW5kZXggPSBwYXJzZUludChkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnZnJvbS1yb290LWluZGV4JykpXG5cbiAgICB0b0luZGV4ID0gQGdldERyb3BUYXJnZXRJbmRleChlKVxuXG4gICAgQGNsZWFyRHJvcFRhcmdldCgpXG5cbiAgICBpZiBmcm9tV2luZG93SWQgaXMgQGdldFdpbmRvd0lkKClcbiAgICAgIHVubGVzcyBmcm9tSW5kZXggaXMgdG9JbmRleFxuICAgICAgICBwcm9qZWN0UGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgICAgICBwcm9qZWN0UGF0aHMuc3BsaWNlKGZyb21JbmRleCwgMSlcbiAgICAgICAgaWYgdG9JbmRleCA+IGZyb21JbmRleCB0aGVuIHRvSW5kZXggLT0gMVxuICAgICAgICBwcm9qZWN0UGF0aHMuc3BsaWNlKHRvSW5kZXgsIDAsIGZyb21Sb290UGF0aClcbiAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKHByb2plY3RQYXRocylcbiAgICBlbHNlXG4gICAgICBwcm9qZWN0UGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgICAgcHJvamVjdFBhdGhzLnNwbGljZSh0b0luZGV4LCAwLCBmcm9tUm9vdFBhdGgpXG4gICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMocHJvamVjdFBhdGhzKVxuXG4gICAgICBpZiBub3QgaXNOYU4oZnJvbVdpbmRvd0lkKVxuICAgICAgICAjIExldCB0aGUgd2luZG93IHdoZXJlIHRoZSBkcmFnIHN0YXJ0ZWQga25vdyB0aGF0IHRoZSB0YWIgd2FzIGRyb3BwZWRcbiAgICAgICAgYnJvd3NlcldpbmRvdyA9IHJlbW90ZS5Ccm93c2VyV2luZG93LmZyb21JZChmcm9tV2luZG93SWQpXG4gICAgICAgIGJyb3dzZXJXaW5kb3c/LndlYkNvbnRlbnRzLnNlbmQoJ3RyZWUtdmlldzpwcm9qZWN0LWZvbGRlci1kcm9wcGVkJywgZnJvbUluZGV4KVxuXG4gIGdldERyb3BUYXJnZXRJbmRleDogKGUpIC0+XG4gICAgdGFyZ2V0ID0gJChlLnRhcmdldClcblxuICAgIHJldHVybiBpZiBAaXNQbGFjZWhvbGRlcih0YXJnZXQpXG5cbiAgICBwcm9qZWN0Um9vdHMgPSAkKEB0cmVlVmlldy5yb290cylcbiAgICBwcm9qZWN0Um9vdCA9IHRhcmdldC5jbG9zZXN0KCcucHJvamVjdC1yb290JylcbiAgICBwcm9qZWN0Um9vdCA9IHByb2plY3RSb290cy5sYXN0KCkgaWYgcHJvamVjdFJvb3QubGVuZ3RoIGlzIDBcblxuICAgIHJldHVybiAwIHVubGVzcyBwcm9qZWN0Um9vdC5sZW5ndGhcblxuICAgIGNlbnRlciA9IHByb2plY3RSb290Lm9mZnNldCgpLnRvcCArIHByb2plY3RSb290LmhlaWdodCgpIC8gMlxuXG4gICAgaWYgZS5vcmlnaW5hbEV2ZW50LnBhZ2VZIDwgY2VudGVyXG4gICAgICBwcm9qZWN0Um9vdHMuaW5kZXgocHJvamVjdFJvb3QpXG4gICAgZWxzZSBpZiBwcm9qZWN0Um9vdC5uZXh0KCcucHJvamVjdC1yb290JykubGVuZ3RoID4gMFxuICAgICAgcHJvamVjdFJvb3RzLmluZGV4KHByb2plY3RSb290Lm5leHQoJy5wcm9qZWN0LXJvb3QnKSlcbiAgICBlbHNlXG4gICAgICBwcm9qZWN0Um9vdHMuaW5kZXgocHJvamVjdFJvb3QpICsgMVxuXG4gIGNhbkRyYWdTdGFydDogKGUpIC0+XG4gICAgJChlLnRhcmdldCkuY2xvc2VzdCgnLnByb2plY3Qtcm9vdC1oZWFkZXInKS5zaXplKCkgPiAwXG5cbiAgaXNEcmFnZ2luZzogKGUpIC0+XG4gICAgQm9vbGVhbiBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEgJ2Zyb20tcm9vdC1wYXRoJ1xuXG4gIGdldFBsYWNlaG9sZGVyOiAtPlxuICAgIEBwbGFjZWhvbGRlckVsID89ICQoJzxsaS8+JywgY2xhc3M6ICdwbGFjZWhvbGRlcicpXG5cbiAgcmVtb3ZlUGxhY2Vob2xkZXI6IC0+XG4gICAgQHBsYWNlaG9sZGVyRWw/LnJlbW92ZSgpXG4gICAgQHBsYWNlaG9sZGVyRWwgPSBudWxsXG5cbiAgaXNQbGFjZWhvbGRlcjogKGVsZW1lbnQpIC0+XG4gICAgZWxlbWVudC5pcygnLnBsYWNlaG9sZGVyJylcblxuICBnZXRXaW5kb3dJZDogLT5cbiAgICBAcHJvY2Vzc0lkID89IGF0b20uZ2V0Q3VycmVudFdpbmRvdygpLmlkXG4iXX0=
