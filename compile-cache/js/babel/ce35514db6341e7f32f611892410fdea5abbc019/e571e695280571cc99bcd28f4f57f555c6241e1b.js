Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.editComponent = editComponent;
exports.activate = activate;
exports.deactivate = deactivate;
exports.provideProjects = provideProjects;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mobx = require('mobx');

var _atom = require('atom');

var _Manager = require('./Manager');

var _Manager2 = _interopRequireDefault(_Manager);

var _viewsViewUri = require('./views/view-uri');

'use babel';

var disposables = null;
var projectsListView = null;
var FileStore = null;

function editComponent() {
  var EditView = require('./views/EditView');

  return new EditView({ project: _Manager2['default'].activeProject });
}

function activate() {
  var _this = this;

  disposables = new _atom.CompositeDisposable();

  disposables.add(atom.workspace.addOpener(function (uri) {
    if (uri === _viewsViewUri.EDIT_URI || uri === _viewsViewUri.SAVE_URI) {
      return editComponent();
    }

    return null;
  }));

  disposables.add(atom.commands.add('atom-workspace', {
    'project-manager:list-projects': function projectManagerListProjects() {
      if (!_this.projectsListView) {
        var ProjectsListView = require('./views/projects-list-view');

        projectsListView = new ProjectsListView();
      }

      projectsListView.toggle();
    },
    'project-manager:edit-projects': function projectManagerEditProjects() {
      if (!FileStore) {
        FileStore = require('./stores/FileStore');
      }

      atom.workspace.open(FileStore.getPath());
    },
    'project-manager:save-project': function projectManagerSaveProject() {
      atom.workspace.open(_viewsViewUri.SAVE_URI);
    },
    'project-manager:edit-project': function projectManagerEditProject() {
      atom.workspace.open(_viewsViewUri.EDIT_URI);
    },
    'project-manager:update-projects': function projectManagerUpdateProjects() {
      _Manager2['default'].fetchProjects();
    }
  }));
}

function deactivate() {
  disposables.dispose();
}

function provideProjects() {
  return {
    getProjects: function getProjects(callback) {
      (0, _mobx.autorun)(function () {
        callback(_Manager2['default'].projects);
      });
    },
    getProject: function getProject(callback) {
      (0, _mobx.autorun)(function () {
        callback(_Manager2['default'].activeProject);
      });
    },
    saveProject: function saveProject(project) {
      _Manager2['default'].saveProject(project);
    },
    openProject: function openProject(project) {
      _Manager2['default'].open(project);
    }
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbmdvYS8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3Byb2plY3QtbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUV3QixNQUFNOztvQkFDTSxNQUFNOzt1QkFDdEIsV0FBVzs7Ozs0QkFDSSxrQkFBa0I7O0FBTHJELFdBQVcsQ0FBQzs7QUFPWixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDdkIsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDNUIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDOztBQUVkLFNBQVMsYUFBYSxHQUFHO0FBQzlCLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztBQUU3QyxTQUFPLElBQUksUUFBUSxDQUFDLEVBQUUsT0FBTyxFQUFFLHFCQUFRLGFBQWEsRUFBRSxDQUFDLENBQUM7Q0FDekQ7O0FBRU0sU0FBUyxRQUFRLEdBQUc7OztBQUN6QixhQUFXLEdBQUcsK0JBQXlCLENBQUM7O0FBRXhDLGFBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDaEQsUUFBSSxHQUFHLDJCQUFhLElBQUksR0FBRywyQkFBYSxFQUFFO0FBQ3hDLGFBQU8sYUFBYSxFQUFFLENBQUM7S0FDeEI7O0FBRUQsV0FBTyxJQUFJLENBQUM7R0FDYixDQUFDLENBQUMsQ0FBQzs7QUFFSixhQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xELG1DQUErQixFQUFFLHNDQUFNO0FBQ3JDLFVBQUksQ0FBQyxNQUFLLGdCQUFnQixFQUFFO0FBQzFCLFlBQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7O0FBRS9ELHdCQUFnQixHQUFHLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztPQUMzQzs7QUFFRCxzQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUMzQjtBQUNELG1DQUErQixFQUFFLHNDQUFNO0FBQ3JDLFVBQUksQ0FBQyxTQUFTLEVBQUU7QUFDZCxpQkFBUyxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO09BQzNDOztBQUVELFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0tBQzFDO0FBQ0Qsa0NBQThCLEVBQUUscUNBQU07QUFDcEMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHdCQUFVLENBQUM7S0FDL0I7QUFDRCxrQ0FBOEIsRUFBRSxxQ0FBTTtBQUNwQyxVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksd0JBQVUsQ0FBQztLQUMvQjtBQUNELHFDQUFpQyxFQUFFLHdDQUFNO0FBQ3ZDLDJCQUFRLGFBQWEsRUFBRSxDQUFDO0tBQ3pCO0dBQ0YsQ0FBQyxDQUFDLENBQUM7Q0FDTDs7QUFFTSxTQUFTLFVBQVUsR0FBRztBQUMzQixhQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7Q0FDdkI7O0FBRU0sU0FBUyxlQUFlLEdBQUc7QUFDaEMsU0FBTztBQUNMLGVBQVcsRUFBRSxxQkFBQyxRQUFRLEVBQUs7QUFDekIseUJBQVEsWUFBTTtBQUNaLGdCQUFRLENBQUMscUJBQVEsUUFBUSxDQUFDLENBQUM7T0FDNUIsQ0FBQyxDQUFDO0tBQ0o7QUFDRCxjQUFVLEVBQUUsb0JBQUMsUUFBUSxFQUFLO0FBQ3hCLHlCQUFRLFlBQU07QUFDWixnQkFBUSxDQUFDLHFCQUFRLGFBQWEsQ0FBQyxDQUFDO09BQ2pDLENBQUMsQ0FBQztLQUNKO0FBQ0QsZUFBVyxFQUFFLHFCQUFDLE9BQU8sRUFBSztBQUN4QiwyQkFBUSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDOUI7QUFDRCxlQUFXLEVBQUUscUJBQUMsT0FBTyxFQUFLO0FBQ3hCLDJCQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN2QjtHQUNGLENBQUM7Q0FDSCIsImZpbGUiOiIvVXNlcnMvYW5nb2EvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9wcm9qZWN0LW1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgYXV0b3J1biB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IG1hbmFnZXIgZnJvbSAnLi9NYW5hZ2VyJztcbmltcG9ydCB7IFNBVkVfVVJJLCBFRElUX1VSSSB9IGZyb20gJy4vdmlld3Mvdmlldy11cmknO1xuXG5sZXQgZGlzcG9zYWJsZXMgPSBudWxsO1xubGV0IHByb2plY3RzTGlzdFZpZXcgPSBudWxsO1xubGV0IEZpbGVTdG9yZSA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBlZGl0Q29tcG9uZW50KCkge1xuICBjb25zdCBFZGl0VmlldyA9IHJlcXVpcmUoJy4vdmlld3MvRWRpdFZpZXcnKTtcblxuICByZXR1cm4gbmV3IEVkaXRWaWV3KHsgcHJvamVjdDogbWFuYWdlci5hY3RpdmVQcm9qZWN0IH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XG4gIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICBkaXNwb3NhYmxlcy5hZGQoYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKCh1cmkpID0+IHtcbiAgICBpZiAodXJpID09PSBFRElUX1VSSSB8fCB1cmkgPT09IFNBVkVfVVJJKSB7XG4gICAgICByZXR1cm4gZWRpdENvbXBvbmVudCgpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9KSk7XG5cbiAgZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAncHJvamVjdC1tYW5hZ2VyOmxpc3QtcHJvamVjdHMnOiAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMucHJvamVjdHNMaXN0Vmlldykge1xuICAgICAgICBjb25zdCBQcm9qZWN0c0xpc3RWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9wcm9qZWN0cy1saXN0LXZpZXcnKTtcblxuICAgICAgICBwcm9qZWN0c0xpc3RWaWV3ID0gbmV3IFByb2plY3RzTGlzdFZpZXcoKTtcbiAgICAgIH1cblxuICAgICAgcHJvamVjdHNMaXN0Vmlldy50b2dnbGUoKTtcbiAgICB9LFxuICAgICdwcm9qZWN0LW1hbmFnZXI6ZWRpdC1wcm9qZWN0cyc6ICgpID0+IHtcbiAgICAgIGlmICghRmlsZVN0b3JlKSB7XG4gICAgICAgIEZpbGVTdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmVzL0ZpbGVTdG9yZScpO1xuICAgICAgfVxuXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKEZpbGVTdG9yZS5nZXRQYXRoKCkpO1xuICAgIH0sXG4gICAgJ3Byb2plY3QtbWFuYWdlcjpzYXZlLXByb2plY3QnOiAoKSA9PiB7XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKFNBVkVfVVJJKTtcbiAgICB9LFxuICAgICdwcm9qZWN0LW1hbmFnZXI6ZWRpdC1wcm9qZWN0JzogKCkgPT4ge1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihFRElUX1VSSSk7XG4gICAgfSxcbiAgICAncHJvamVjdC1tYW5hZ2VyOnVwZGF0ZS1wcm9qZWN0cyc6ICgpID0+IHtcbiAgICAgIG1hbmFnZXIuZmV0Y2hQcm9qZWN0cygpO1xuICAgIH0sXG4gIH0pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVQcm9qZWN0cygpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRQcm9qZWN0czogKGNhbGxiYWNrKSA9PiB7XG4gICAgICBhdXRvcnVuKCgpID0+IHtcbiAgICAgICAgY2FsbGJhY2sobWFuYWdlci5wcm9qZWN0cyk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldFByb2plY3Q6IChjYWxsYmFjaykgPT4ge1xuICAgICAgYXV0b3J1bigoKSA9PiB7XG4gICAgICAgIGNhbGxiYWNrKG1hbmFnZXIuYWN0aXZlUHJvamVjdCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHNhdmVQcm9qZWN0OiAocHJvamVjdCkgPT4ge1xuICAgICAgbWFuYWdlci5zYXZlUHJvamVjdChwcm9qZWN0KTtcbiAgICB9LFxuICAgIG9wZW5Qcm9qZWN0OiAocHJvamVjdCkgPT4ge1xuICAgICAgbWFuYWdlci5vcGVuKHByb2plY3QpO1xuICAgIH0sXG4gIH07XG59XG4iXX0=