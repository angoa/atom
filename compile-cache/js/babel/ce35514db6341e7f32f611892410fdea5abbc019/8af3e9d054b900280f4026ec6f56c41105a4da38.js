Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

var _mobx = require('mobx');

var _untildify = require('untildify');

var _untildify2 = _interopRequireDefault(_untildify);

var _tildify = require('tildify');

var _tildify2 = _interopRequireDefault(_tildify);

var _atomProjectUtil = require('atom-project-util');

var _atomProjectUtil2 = _interopRequireDefault(_atomProjectUtil);

var _underscorePlus = require('underscore-plus');

var _storesFileStore = require('./stores/FileStore');

var _storesFileStore2 = _interopRequireDefault(_storesFileStore);

var _storesGitStore = require('./stores/GitStore');

var _storesGitStore2 = _interopRequireDefault(_storesGitStore);

var _Settings = require('./Settings');

var _Settings2 = _interopRequireDefault(_Settings);

var _modelsProject = require('./models/Project');

var _modelsProject2 = _interopRequireDefault(_modelsProject);

'use babel';

var Manager = (function () {
  var _instanceInitializers = {};
  var _instanceInitializers = {};

  _createDecoratedClass(Manager, [{
    key: 'projects',
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return [];
    },
    enumerable: true
  }, {
    key: 'activePaths',
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return [];
    },
    enumerable: true
  }, {
    key: 'activeProject',
    decorators: [_mobx.computed],
    get: function get() {
      var _this = this;

      if (this.activePaths.length === 0) {
        return null;
      }

      return this.projects.find(function (project) {
        return project.rootPath === _this.activePaths[0];
      });
    }
  }], null, _instanceInitializers);

  function Manager() {
    var _this2 = this;

    _classCallCheck(this, Manager);

    _defineDecoratedPropertyDescriptor(this, 'projects', _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, 'activePaths', _instanceInitializers);

    this.gitStore = new _storesGitStore2['default']();
    this.fileStore = new _storesFileStore2['default']();
    this.settings = new _Settings2['default']();

    this.fetchProjects();

    atom.config.observe('project-manager.includeGitRepositories', function (include) {
      if (include) {
        _this2.gitStore.fetch();
      } else {
        _this2.gitStore.empty();
      }
    });

    (0, _mobx.autorun)(function () {
      (0, _underscorePlus.each)(_this2.fileStore.data, function (fileProp) {
        _this2.addProject(fileProp);
      }, _this2);
    });

    (0, _mobx.autorun)(function () {
      (0, _underscorePlus.each)(_this2.gitStore.data, function (gitProp) {
        _this2.addProject(gitProp);
      }, _this2);
    });

    (0, _mobx.autorun)(function () {
      if (_this2.activeProject) {
        _this2.settings.load(_this2.activeProject.settings);
      }
    });

    this.activePaths = atom.project.getPaths();
    atom.project.onDidChangePaths(function () {
      _this2.activePaths = atom.project.getPaths();
      var activePaths = atom.project.getPaths();

      if (_this2.activeProject && _this2.activeProject.rootPath === activePaths[0]) {
        if (_this2.activeProject.paths.length !== activePaths.length) {
          _this2.activeProject.updateProps({ paths: activePaths });
          _this2.saveProjects();
        }
      }
    });
  }

  /**
   * Create or Update a project.
   *
   * Props coming from file goes before any other source.
   */

  _createDecoratedClass(Manager, [{
    key: 'addProject',
    decorators: [_mobx.action],
    value: function addProject(props) {
      var foundProject = this.projects.find(function (project) {
        var projectRootPath = project.rootPath.toLowerCase();
        var propsRootPath = (0, _untildify2['default'])(props.paths[0]).toLowerCase();
        return projectRootPath === propsRootPath;
      });

      if (!foundProject) {
        var newProject = new _modelsProject2['default'](props);
        this.projects.push(newProject);
      } else {
        if (foundProject.source === 'file' && props.source === 'file') {
          foundProject.updateProps(props);
        }

        if (props.source === 'file' || typeof props.source === 'undefined') {
          foundProject.updateProps(props);
        }
      }
    }
  }, {
    key: 'fetchProjects',
    value: function fetchProjects() {
      this.fileStore.fetch();

      if (atom.config.get('project-manager.includeGitRepositories')) {
        this.gitStore.fetch();
      }
    }
  }, {
    key: 'saveProject',
    value: function saveProject(props) {
      var propsToSave = props;
      if (Manager.isProject(props)) {
        propsToSave = props.getProps();
      }
      this.addProject(_extends({}, propsToSave, { source: 'file' }));
      this.saveProjects();
    }
  }, {
    key: 'saveProjects',
    value: function saveProjects() {
      var projects = this.projects.filter(function (project) {
        return project.props.source === 'file';
      });

      var arr = (0, _underscorePlus.map)(projects, function (project) {
        var props = project.getChangedProps();
        delete props.source;

        if (atom.config.get('project-manager.savePathsRelativeToHome')) {
          props.paths = props.paths.map(function (path) {
            return (0, _tildify2['default'])(path);
          });
        }

        return props;
      });

      this.fileStore.store(arr);
    }
  }], [{
    key: 'open',
    value: function open(project) {
      var openInSameWindow = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      if (Manager.isProject(project)) {
        var _project$getProps = project.getProps();

        var devMode = _project$getProps.devMode;

        if (openInSameWindow) {
          _atomProjectUtil2['default']['switch'](project.paths);
        } else {
          atom.open({
            devMode: devMode,
            pathsToOpen: project.paths
          });
        }
      }
    }
  }, {
    key: 'isProject',
    value: function isProject(project) {
      if (project instanceof _modelsProject2['default']) {
        return true;
      }

      return false;
    }
  }], _instanceInitializers);

  return Manager;
})();

exports.Manager = Manager;

var manager = new Manager();
exports['default'] = manager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbmdvYS8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL01hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0JBRXNELE1BQU07O3lCQUN0QyxXQUFXOzs7O3VCQUNiLFNBQVM7Ozs7K0JBQ0wsbUJBQW1COzs7OzhCQUNqQixpQkFBaUI7OytCQUNyQixvQkFBb0I7Ozs7OEJBQ3JCLG1CQUFtQjs7Ozt3QkFDbkIsWUFBWTs7Ozs2QkFDYixrQkFBa0I7Ozs7QUFWdEMsV0FBVyxDQUFDOztJQVlDLE9BQU87Ozs7d0JBQVAsT0FBTzs7OzthQUNLLEVBQUU7Ozs7Ozs7YUFDQyxFQUFFOzs7Ozs7U0FFRCxlQUFHOzs7QUFDNUIsVUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDakMsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUEsT0FBTztlQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssTUFBSyxXQUFXLENBQUMsQ0FBQyxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ2hGOzs7QUFFVSxXQVpBLE9BQU8sR0FZSjs7OzBCQVpILE9BQU87Ozs7OztBQWFoQixRQUFJLENBQUMsUUFBUSxHQUFHLGlDQUFjLENBQUM7QUFDL0IsUUFBSSxDQUFDLFNBQVMsR0FBRyxrQ0FBZSxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxRQUFRLEdBQUcsMkJBQWMsQ0FBQzs7QUFFL0IsUUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDOztBQUVyQixRQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyx3Q0FBd0MsRUFBRSxVQUFDLE9BQU8sRUFBSztBQUN6RSxVQUFJLE9BQU8sRUFBRTtBQUNYLGVBQUssUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ3ZCLE1BQU07QUFDTCxlQUFLLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUN2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Q0FBQyxDQUFDO1NBQ25DLE1BQU07QUFDTCxjQUFJLENBQUMsSUFBSSxDQUFDO0FBQ1IsbUJBQU8sRUFBUCxPQUFPO0FBQ1AsdUJBQVcsRUFBRSxPQUFPLENBQUMsS0FBSztXQUMzQixDQUFDLENBQUM7U0FDSjtPQUNGO0tBQ0Y7OztXQTRCZSxtQkFBQyxPQUFPLEVBQUU7QUFDeEIsVUFBSSxPQUFPLHNDQUFtQixFQUFFO0FBQzlCLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsYUFBTyxLQUFLLENBQUM7S0FDZDs7O1NBNUlVLE9BQU87Ozs7O0FBK0lwQixJQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO3FCQUNmLE9BQU8iLCJmaWxlIjoiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3Byb2plY3QtbWFuYWdlci9saWIvTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBvYnNlcnZhYmxlLCBhdXRvcnVuLCBjb21wdXRlZCwgYWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgdW50aWxkaWZ5IGZyb20gJ3VudGlsZGlmeSc7XG5pbXBvcnQgdGlsZGlmeSBmcm9tICd0aWxkaWZ5JztcbmltcG9ydCBwcm9qZWN0VXRpbCBmcm9tICdhdG9tLXByb2plY3QtdXRpbCc7XG5pbXBvcnQgeyBlYWNoLCBtYXAgfSBmcm9tICd1bmRlcnNjb3JlLXBsdXMnO1xuaW1wb3J0IEZpbGVTdG9yZSBmcm9tICcuL3N0b3Jlcy9GaWxlU3RvcmUnO1xuaW1wb3J0IEdpdFN0b3JlIGZyb20gJy4vc3RvcmVzL0dpdFN0b3JlJztcbmltcG9ydCBTZXR0aW5ncyBmcm9tICcuL1NldHRpbmdzJztcbmltcG9ydCBQcm9qZWN0IGZyb20gJy4vbW9kZWxzL1Byb2plY3QnO1xuXG5leHBvcnQgY2xhc3MgTWFuYWdlciB7XG4gIEBvYnNlcnZhYmxlIHByb2plY3RzID0gW107XG4gIEBvYnNlcnZhYmxlIGFjdGl2ZVBhdGhzID0gW107XG5cbiAgQGNvbXB1dGVkIGdldCBhY3RpdmVQcm9qZWN0KCkge1xuICAgIGlmICh0aGlzLmFjdGl2ZVBhdGhzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucHJvamVjdHMuZmluZChwcm9qZWN0ID0+IHByb2plY3Qucm9vdFBhdGggPT09IHRoaXMuYWN0aXZlUGF0aHNbMF0pO1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5naXRTdG9yZSA9IG5ldyBHaXRTdG9yZSgpO1xuICAgIHRoaXMuZmlsZVN0b3JlID0gbmV3IEZpbGVTdG9yZSgpO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBuZXcgU2V0dGluZ3MoKTtcblxuICAgIHRoaXMuZmV0Y2hQcm9qZWN0cygpO1xuXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSgncHJvamVjdC1tYW5hZ2VyLmluY2x1ZGVHaXRSZXBvc2l0b3JpZXMnLCAoaW5jbHVkZSkgPT4ge1xuICAgICAgaWYgKGluY2x1ZGUpIHtcbiAgICAgICAgdGhpcy5naXRTdG9yZS5mZXRjaCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5naXRTdG9yZS5lbXB0eSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgYXV0b3J1bigoKSA9PiB7XG4gICAgICBlYWNoKHRoaXMuZmlsZVN0b3JlLmRhdGEsIChmaWxlUHJvcCkgPT4ge1xuICAgICAgICB0aGlzLmFkZFByb2plY3QoZmlsZVByb3ApO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSk7XG5cbiAgICBhdXRvcnVuKCgpID0+IHtcbiAgICAgIGVhY2godGhpcy5naXRTdG9yZS5kYXRhLCAoZ2l0UHJvcCkgPT4ge1xuICAgICAgICB0aGlzLmFkZFByb2plY3QoZ2l0UHJvcCk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9KTtcblxuICAgIGF1dG9ydW4oKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlUHJvamVjdCkge1xuICAgICAgICB0aGlzLnNldHRpbmdzLmxvYWQodGhpcy5hY3RpdmVQcm9qZWN0LnNldHRpbmdzKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuYWN0aXZlUGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKTtcbiAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB7XG4gICAgICB0aGlzLmFjdGl2ZVBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gICAgICBjb25zdCBhY3RpdmVQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuXG4gICAgICBpZiAodGhpcy5hY3RpdmVQcm9qZWN0ICYmIHRoaXMuYWN0aXZlUHJvamVjdC5yb290UGF0aCA9PT0gYWN0aXZlUGF0aHNbMF0pIHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlUHJvamVjdC5wYXRocy5sZW5ndGggIT09IGFjdGl2ZVBhdGhzLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuYWN0aXZlUHJvamVjdC51cGRhdGVQcm9wcyh7IHBhdGhzOiBhY3RpdmVQYXRocyB9KTtcbiAgICAgICAgICB0aGlzLnNhdmVQcm9qZWN0cygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIG9yIFVwZGF0ZSBhIHByb2plY3QuXG4gICAqXG4gICAqIFByb3BzIGNvbWluZyBmcm9tIGZpbGUgZ29lcyBiZWZvcmUgYW55IG90aGVyIHNvdXJjZS5cbiAgICovXG4gIEBhY3Rpb24gYWRkUHJvamVjdChwcm9wcykge1xuICAgIGNvbnN0IGZvdW5kUHJvamVjdCA9IHRoaXMucHJvamVjdHMuZmluZCgocHJvamVjdCkgPT4ge1xuICAgICAgY29uc3QgcHJvamVjdFJvb3RQYXRoID0gcHJvamVjdC5yb290UGF0aC50b0xvd2VyQ2FzZSgpO1xuICAgICAgY29uc3QgcHJvcHNSb290UGF0aCA9IHVudGlsZGlmeShwcm9wcy5wYXRoc1swXSkudG9Mb3dlckNhc2UoKTtcbiAgICAgIHJldHVybiBwcm9qZWN0Um9vdFBhdGggPT09IHByb3BzUm9vdFBhdGg7XG4gICAgfSk7XG5cbiAgICBpZiAoIWZvdW5kUHJvamVjdCkge1xuICAgICAgY29uc3QgbmV3UHJvamVjdCA9IG5ldyBQcm9qZWN0KHByb3BzKTtcbiAgICAgIHRoaXMucHJvamVjdHMucHVzaChuZXdQcm9qZWN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGZvdW5kUHJvamVjdC5zb3VyY2UgPT09ICdmaWxlJyAmJiBwcm9wcy5zb3VyY2UgPT09ICdmaWxlJykge1xuICAgICAgICBmb3VuZFByb2plY3QudXBkYXRlUHJvcHMocHJvcHMpO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJvcHMuc291cmNlID09PSAnZmlsZScgfHwgdHlwZW9mIHByb3BzLnNvdXJjZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZm91bmRQcm9qZWN0LnVwZGF0ZVByb3BzKHByb3BzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmZXRjaFByb2plY3RzKCkge1xuICAgIHRoaXMuZmlsZVN0b3JlLmZldGNoKCk7XG5cbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdwcm9qZWN0LW1hbmFnZXIuaW5jbHVkZUdpdFJlcG9zaXRvcmllcycpKSB7XG4gICAgICB0aGlzLmdpdFN0b3JlLmZldGNoKCk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG9wZW4ocHJvamVjdCwgb3BlbkluU2FtZVdpbmRvdyA9IGZhbHNlKSB7XG4gICAgaWYgKE1hbmFnZXIuaXNQcm9qZWN0KHByb2plY3QpKSB7XG4gICAgICBjb25zdCB7IGRldk1vZGUgfSA9IHByb2plY3QuZ2V0UHJvcHMoKTtcblxuICAgICAgaWYgKG9wZW5JblNhbWVXaW5kb3cpIHtcbiAgICAgICAgcHJvamVjdFV0aWwuc3dpdGNoKHByb2plY3QucGF0aHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXRvbS5vcGVuKHtcbiAgICAgICAgICBkZXZNb2RlLFxuICAgICAgICAgIHBhdGhzVG9PcGVuOiBwcm9qZWN0LnBhdGhzLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzYXZlUHJvamVjdChwcm9wcykge1xuICAgIGxldCBwcm9wc1RvU2F2ZSA9IHByb3BzO1xuICAgIGlmIChNYW5hZ2VyLmlzUHJvamVjdChwcm9wcykpIHtcbiAgICAgIHByb3BzVG9TYXZlID0gcHJvcHMuZ2V0UHJvcHMoKTtcbiAgICB9XG4gICAgdGhpcy5hZGRQcm9qZWN0KHsgLi4ucHJvcHNUb1NhdmUsIHNvdXJjZTogJ2ZpbGUnIH0pO1xuICAgIHRoaXMuc2F2ZVByb2plY3RzKCk7XG4gIH1cblxuICBzYXZlUHJvamVjdHMoKSB7XG4gICAgY29uc3QgcHJvamVjdHMgPSB0aGlzLnByb2plY3RzLmZpbHRlcihwcm9qZWN0ID0+IHByb2plY3QucHJvcHMuc291cmNlID09PSAnZmlsZScpO1xuXG4gICAgY29uc3QgYXJyID0gbWFwKHByb2plY3RzLCAocHJvamVjdCkgPT4ge1xuICAgICAgY29uc3QgcHJvcHMgPSBwcm9qZWN0LmdldENoYW5nZWRQcm9wcygpO1xuICAgICAgZGVsZXRlIHByb3BzLnNvdXJjZTtcblxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgncHJvamVjdC1tYW5hZ2VyLnNhdmVQYXRoc1JlbGF0aXZlVG9Ib21lJykpIHtcbiAgICAgICAgcHJvcHMucGF0aHMgPSBwcm9wcy5wYXRocy5tYXAocGF0aCA9PiB0aWxkaWZ5KHBhdGgpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH0pO1xuXG4gICAgdGhpcy5maWxlU3RvcmUuc3RvcmUoYXJyKTtcbiAgfVxuXG4gIHN0YXRpYyBpc1Byb2plY3QocHJvamVjdCkge1xuICAgIGlmIChwcm9qZWN0IGluc3RhbmNlb2YgUHJvamVjdCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmNvbnN0IG1hbmFnZXIgPSBuZXcgTWFuYWdlcigpO1xuZXhwb3J0IGRlZmF1bHQgbWFuYWdlcjtcbiJdfQ==