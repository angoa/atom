(function() {
  var CompositeDisposable, FileIcons, FileView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  FileIcons = require('./file-icons');

  module.exports = FileView = (function(superClass) {
    extend(FileView, superClass);

    function FileView() {
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.prototype.initialize = function(file) {
      var iconClass, ref;
      this.file = file;
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(this.file.onDidDestroy((function(_this) {
        return function() {
          return _this.subscriptions.dispose();
        };
      })(this)));
      this.draggable = true;
      this.classList.add('file', 'entry', 'list-item');
      this.fileName = document.createElement('span');
      this.fileName.classList.add('name', 'icon');
      this.appendChild(this.fileName);
      this.fileName.textContent = this.file.name;
      this.fileName.title = this.file.name;
      this.fileName.dataset.name = this.file.name;
      this.fileName.dataset.path = this.file.path;
      iconClass = FileIcons.getService().iconClassForPath(this.file.path, "tree-view");
      if (iconClass) {
        if (!Array.isArray(iconClass)) {
          iconClass = iconClass.toString().split(/\s+/g);
        }
        (ref = this.fileName.classList).add.apply(ref, iconClass);
      }
      this.subscriptions.add(this.file.onDidStatusChange((function(_this) {
        return function() {
          return _this.updateStatus();
        };
      })(this)));
      return this.updateStatus();
    };

    FileView.prototype.updateStatus = function() {
      this.classList.remove('status-ignored', 'status-modified', 'status-added');
      if (this.file.status != null) {
        return this.classList.add("status-" + this.file.status);
      }
    };

    FileView.prototype.getPath = function() {
      return this.fileName.dataset.path;
    };

    FileView.prototype.isPathEqual = function(pathToCompare) {
      return this.file.isPathEqual(pathToCompare);
    };

    return FileView;

  })(HTMLElement);

  module.exports = document.registerElement('tree-view-file', {
    prototype: FileView.prototype,
    "extends": 'li'
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3RyZWUtdmlldy9saWIvZmlsZS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsd0NBQUE7SUFBQTs7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxXQUFSOztFQUN4QixTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVI7O0VBRVosTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozt1QkFDSixVQUFBLEdBQVksU0FBQyxJQUFEO0FBQ1YsVUFBQTtNQURXLElBQUMsQ0FBQSxPQUFEO01BQ1gsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxtQkFBQSxDQUFBO01BQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsSUFBSSxDQUFDLFlBQU4sQ0FBbUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5CLENBQW5CO01BRUEsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUViLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLE1BQWYsRUFBdUIsT0FBdkIsRUFBZ0MsV0FBaEM7TUFFQSxJQUFDLENBQUEsUUFBRCxHQUFZLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCO01BQ1osSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBcEIsQ0FBd0IsTUFBeEIsRUFBZ0MsTUFBaEM7TUFDQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxRQUFkO01BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFWLEdBQXdCLElBQUMsQ0FBQSxJQUFJLENBQUM7TUFDOUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLEdBQWtCLElBQUMsQ0FBQSxJQUFJLENBQUM7TUFDeEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBbEIsR0FBeUIsSUFBQyxDQUFBLElBQUksQ0FBQztNQUMvQixJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFsQixHQUF5QixJQUFDLENBQUEsSUFBSSxDQUFDO01BRS9CLFNBQUEsR0FBWSxTQUFTLENBQUMsVUFBVixDQUFBLENBQXNCLENBQUMsZ0JBQXZCLENBQXdDLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBOUMsRUFBb0QsV0FBcEQ7TUFDWixJQUFHLFNBQUg7UUFDRSxJQUFBLENBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFkLENBQVA7VUFDRSxTQUFBLEdBQVksU0FBUyxDQUFDLFFBQVYsQ0FBQSxDQUFvQixDQUFDLEtBQXJCLENBQTJCLE1BQTNCLEVBRGQ7O1FBRUEsT0FBQSxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBbUIsQ0FBQyxHQUFwQixZQUF3QixTQUF4QixFQUhGOztNQUtBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsSUFBSSxDQUFDLGlCQUFOLENBQXdCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsWUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCLENBQW5CO2FBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQXZCVTs7dUJBeUJaLFlBQUEsR0FBYyxTQUFBO01BQ1osSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLGdCQUFsQixFQUFvQyxpQkFBcEMsRUFBd0QsY0FBeEQ7TUFDQSxJQUE0Qyx3QkFBNUM7ZUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxTQUFBLEdBQVUsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUEvQixFQUFBOztJQUZZOzt1QkFJZCxPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDO0lBRFg7O3VCQUdULFdBQUEsR0FBYSxTQUFDLGFBQUQ7YUFDWCxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsYUFBbEI7SUFEVzs7OztLQWpDUTs7RUFvQ3ZCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQVEsQ0FBQyxlQUFULENBQXlCLGdCQUF6QixFQUEyQztJQUFBLFNBQUEsRUFBVyxRQUFRLENBQUMsU0FBcEI7SUFBK0IsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUF4QztHQUEzQztBQXhDakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdldmVudC1raXQnXG5GaWxlSWNvbnMgPSByZXF1aXJlICcuL2ZpbGUtaWNvbnMnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEZpbGVWaWV3IGV4dGVuZHMgSFRNTEVsZW1lbnRcbiAgaW5pdGlhbGl6ZTogKEBmaWxlKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZmlsZS5vbkRpZERlc3Ryb3kgPT4gQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgICBAZHJhZ2dhYmxlID0gdHJ1ZVxuXG4gICAgQGNsYXNzTGlzdC5hZGQoJ2ZpbGUnLCAnZW50cnknLCAnbGlzdC1pdGVtJylcblxuICAgIEBmaWxlTmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIEBmaWxlTmFtZS5jbGFzc0xpc3QuYWRkKCduYW1lJywgJ2ljb24nKVxuICAgIEBhcHBlbmRDaGlsZChAZmlsZU5hbWUpXG4gICAgQGZpbGVOYW1lLnRleHRDb250ZW50ID0gQGZpbGUubmFtZVxuICAgIEBmaWxlTmFtZS50aXRsZSA9IEBmaWxlLm5hbWVcbiAgICBAZmlsZU5hbWUuZGF0YXNldC5uYW1lID0gQGZpbGUubmFtZVxuICAgIEBmaWxlTmFtZS5kYXRhc2V0LnBhdGggPSBAZmlsZS5wYXRoXG5cbiAgICBpY29uQ2xhc3MgPSBGaWxlSWNvbnMuZ2V0U2VydmljZSgpLmljb25DbGFzc0ZvclBhdGgoQGZpbGUucGF0aCwgXCJ0cmVlLXZpZXdcIilcbiAgICBpZiBpY29uQ2xhc3NcbiAgICAgIHVubGVzcyBBcnJheS5pc0FycmF5IGljb25DbGFzc1xuICAgICAgICBpY29uQ2xhc3MgPSBpY29uQ2xhc3MudG9TdHJpbmcoKS5zcGxpdCgvXFxzKy9nKVxuICAgICAgQGZpbGVOYW1lLmNsYXNzTGlzdC5hZGQoaWNvbkNsYXNzLi4uKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBmaWxlLm9uRGlkU3RhdHVzQ2hhbmdlID0+IEB1cGRhdGVTdGF0dXMoKVxuICAgIEB1cGRhdGVTdGF0dXMoKVxuXG4gIHVwZGF0ZVN0YXR1czogLT5cbiAgICBAY2xhc3NMaXN0LnJlbW92ZSgnc3RhdHVzLWlnbm9yZWQnLCAnc3RhdHVzLW1vZGlmaWVkJywgICdzdGF0dXMtYWRkZWQnKVxuICAgIEBjbGFzc0xpc3QuYWRkKFwic3RhdHVzLSN7QGZpbGUuc3RhdHVzfVwiKSBpZiBAZmlsZS5zdGF0dXM/XG5cbiAgZ2V0UGF0aDogLT5cbiAgICBAZmlsZU5hbWUuZGF0YXNldC5wYXRoXG5cbiAgaXNQYXRoRXF1YWw6IChwYXRoVG9Db21wYXJlKSAtPlxuICAgIEBmaWxlLmlzUGF0aEVxdWFsKHBhdGhUb0NvbXBhcmUpXG5cbm1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50KCd0cmVlLXZpZXctZmlsZScsIHByb3RvdHlwZTogRmlsZVZpZXcucHJvdG90eXBlLCBleHRlbmRzOiAnbGknKVxuIl19
