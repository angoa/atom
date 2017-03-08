Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

var _mobx = require('mobx');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _untildify = require('untildify');

var _untildify2 = _interopRequireDefault(_untildify);

var _season = require('season');

var _season2 = _interopRequireDefault(_season);

'use babel';

var Project = (function () {
  var _instanceInitializers = {};
  var _instanceInitializers = {};

  _createDecoratedClass(Project, [{
    key: 'props',
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return {};
    },
    enumerable: true
  }, {
    key: 'stats',
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return null;
    },
    enumerable: true
  }, {
    key: 'title',
    decorators: [_mobx.computed],
    get: function get() {
      return this.props.title;
    }
  }, {
    key: 'paths',
    decorators: [_mobx.computed],
    get: function get() {
      return this.props.paths.map(function (path) {
        return (0, _untildify2['default'])(path);
      });
    }
  }, {
    key: 'group',
    decorators: [_mobx.computed],
    get: function get() {
      return this.props.group;
    }
  }, {
    key: 'rootPath',
    decorators: [_mobx.computed],
    get: function get() {
      return this.paths[0];
    }
  }, {
    key: 'settings',
    decorators: [_mobx.computed],
    get: function get() {
      return (0, _mobx.toJS)(this.props.settings);
    }
  }, {
    key: 'source',
    decorators: [_mobx.computed],
    get: function get() {
      return this.props.source;
    }
  }, {
    key: 'lastModified',
    decorators: [_mobx.computed],
    get: function get() {
      var mtime = new Date(0);
      if (this.stats) {
        mtime = this.stats.mtime;
      }

      return mtime;
    }
  }, {
    key: 'isCurrent',
    decorators: [_mobx.computed],
    get: function get() {
      var activePath = atom.project.getPaths()[0];

      if (activePath === this.rootPath) {
        return true;
      }

      return false;
    }
  }], [{
    key: 'defaultProps',
    get: function get() {
      return {
        title: '',
        group: '',
        paths: [],
        icon: 'icon-chevron-right',
        settings: {},
        devMode: false,
        template: null,
        source: null
      };
    }
  }], _instanceInitializers);

  function Project(props) {
    _classCallCheck(this, Project);

    _defineDecoratedPropertyDescriptor(this, 'props', _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, 'stats', _instanceInitializers);

    (0, _mobx.extendObservable)(this.props, Project.defaultProps);
    this.updateProps(props);
  }

  _createDecoratedClass(Project, [{
    key: 'updateProps',
    value: function updateProps(props) {
      (0, _mobx.extendObservable)(this.props, props);
      this.setFileStats();
    }
  }, {
    key: 'getProps',
    value: function getProps() {
      return (0, _mobx.toJS)(this.props);
    }
  }, {
    key: 'getChangedProps',
    value: function getChangedProps() {
      var _getProps = this.getProps();

      var props = _objectWithoutProperties(_getProps, []);

      var defaults = Project.defaultProps;

      Object.keys(defaults).forEach(function (key) {
        switch (key) {
          case 'settings':
            {
              if (Object.keys(props[key]).length === 0) {
                delete props[key];
              }
              break;
            }

          default:
            {
              if (props[key] === defaults[key]) {
                delete props[key];
              }
            }
        }
      });

      return props;
    }
  }, {
    key: 'setFileStats',
    decorators: [_mobx.action],
    value: function setFileStats() {
      var _this = this;

      _fs2['default'].stat(this.rootPath, function (err, stats) {
        if (!err) {
          _this.stats = stats;
        }
      });
    }

    /**
     * Fetch settings that are saved locally with the project
     * if there are any.
     */
  }, {
    key: 'fetchLocalSettings',
    decorators: [_mobx.action],
    value: function fetchLocalSettings() {
      var _this2 = this;

      var file = this.rootPath + '/project.cson';
      _season2['default'].readFile(file, function (err, settings) {
        if (err) {
          return;
        }

        (0, _mobx.extendObservable)(_this2.props.settings, settings);
      });
    }
  }], null, _instanceInitializers);

  return Project;
})();

exports['default'] = Project;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbmdvYS8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL21vZGVscy9Qcm9qZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQUVxRSxNQUFNOztrQkFDNUQsSUFBSTs7Ozt5QkFDRyxXQUFXOzs7O3NCQUNoQixRQUFROzs7O0FBTHpCLFdBQVcsQ0FBQzs7SUFPUyxPQUFPOzs7O3dCQUFQLE9BQU87Ozs7YUFDTixFQUFFOzs7Ozs7O2FBQ0YsSUFBSTs7Ozs7O1NBRUwsZUFBRztBQUNwQixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0tBQ3pCOzs7O1NBRWtCLGVBQUc7QUFDcEIsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO2VBQUksNEJBQVUsSUFBSSxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ3REOzs7O1NBRWtCLGVBQUc7QUFDcEIsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztLQUN6Qjs7OztTQUVxQixlQUFHO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN0Qjs7OztTQUVxQixlQUFHO0FBQ3ZCLGFBQU8sZ0JBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNsQzs7OztTQUVtQixlQUFHO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7S0FDMUI7Ozs7U0FFeUIsZUFBRztBQUMzQixVQUFJLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QixVQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxhQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7T0FDMUI7O0FBRUQsYUFBTyxLQUFLLENBQUM7S0FDZDs7OztTQUVzQixlQUFHO0FBQ3hCLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTlDLFVBQUksVUFBVSxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDaEMsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxhQUFPLEtBQUssQ0FBQztLQUNkOzs7U0FFc0IsZUFBRztBQUN4QixhQUFPO0FBQ0wsYUFBSyxFQUFFLEVBQUU7QUFDVCxhQUFLLEVBQUUsRUFBRTtBQUNULGFBQUssRUFBRSxFQUFFO0FBQ1QsWUFBSSxFQUFFLG9CQUFvQjtBQUMxQixnQkFBUSxFQUFFLEVBQUU7QUFDWixlQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFRLEVBQUUsSUFBSTtBQUNkLGNBQU0sRUFBRSxJQUFJO09BQ2IsQ0FBQztLQUNIOzs7QUFFVSxXQTVEUSxPQUFPLENBNERkLEtBQUssRUFBRTswQkE1REEsT0FBTzs7Ozs7O0FBNkR4QixnQ0FBaUIsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDbkQsUUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUN6Qjs7d0JBL0RrQixPQUFPOztXQWlFZixxQkFBQyxLQUFLLEVBQUU7QUFDakIsa0NBQWlCLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDcEMsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQ3JCOzs7V0FFTyxvQkFBRztBQUNULGFBQU8sZ0JBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3pCOzs7V0FFYywyQkFBRztzQkFDSyxJQUFJLENBQUMsUUFBUSxFQUFFOztVQUF6QixLQUFLOztBQUNoQixVQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDOztBQUV0QyxZQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUNyQyxnQkFBUSxHQUFHO0FBQ1QsZUFBSyxVQUFVO0FBQUU7QUFDZixrQkFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDeEMsdUJBQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2VBQ25CO0FBQ0Qsb0JBQU07YUFDUDs7QUFBQSxBQUVEO0FBQVM7QUFDUCxrQkFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ2hDLHVCQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztlQUNuQjthQUNGO0FBQUEsU0FDRjtPQUNGLENBQUMsQ0FBQzs7QUFFSCxhQUFPLEtBQUssQ0FBQztLQUNkOzs7O1dBRW1CLHdCQUFHOzs7QUFDckIsc0JBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBQyxHQUFHLEVBQUUsS0FBSyxFQUFLO0FBQ3JDLFlBQUksQ0FBQyxHQUFHLEVBQUU7QUFDUixnQkFBSyxLQUFLLEdBQUcsS0FBSyxDQUFDO1NBQ3BCO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7Ozs7Ozs7OztXQU15Qiw4QkFBRzs7O0FBQzNCLFVBQU0sSUFBSSxHQUFNLElBQUksQ0FBQyxRQUFRLGtCQUFlLENBQUM7QUFDN0MsMEJBQUssUUFBUSxDQUFDLElBQUksRUFBRSxVQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUs7QUFDckMsWUFBSSxHQUFHLEVBQUU7QUFDUCxpQkFBTztTQUNSOztBQUVELG9DQUFpQixPQUFLLEtBQUssQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7T0FDakQsQ0FBQyxDQUFDO0tBQ0o7OztTQXZIa0IsT0FBTzs7O3FCQUFQLE9BQU8iLCJmaWxlIjoiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3Byb2plY3QtbWFuYWdlci9saWIvbW9kZWxzL1Byb2plY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgb2JzZXJ2YWJsZSwgY29tcHV0ZWQsIGV4dGVuZE9ic2VydmFibGUsIGFjdGlvbiwgdG9KUyB9IGZyb20gJ21vYngnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB1bnRpbGRpZnkgZnJvbSAndW50aWxkaWZ5JztcbmltcG9ydCBDU09OIGZyb20gJ3NlYXNvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb2plY3Qge1xuICBAb2JzZXJ2YWJsZSBwcm9wcyA9IHt9XG4gIEBvYnNlcnZhYmxlIHN0YXRzID0gbnVsbDtcblxuICBAY29tcHV0ZWQgZ2V0IHRpdGxlKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnRpdGxlO1xuICB9XG5cbiAgQGNvbXB1dGVkIGdldCBwYXRocygpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5wYXRocy5tYXAocGF0aCA9PiB1bnRpbGRpZnkocGF0aCkpO1xuICB9XG5cbiAgQGNvbXB1dGVkIGdldCBncm91cCgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5ncm91cDtcbiAgfVxuXG4gIEBjb21wdXRlZCBnZXQgcm9vdFBhdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0aHNbMF07XG4gIH1cblxuICBAY29tcHV0ZWQgZ2V0IHNldHRpbmdzKCkge1xuICAgIHJldHVybiB0b0pTKHRoaXMucHJvcHMuc2V0dGluZ3MpO1xuICB9XG5cbiAgQGNvbXB1dGVkIGdldCBzb3VyY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuc291cmNlO1xuICB9XG5cbiAgQGNvbXB1dGVkIGdldCBsYXN0TW9kaWZpZWQoKSB7XG4gICAgbGV0IG10aW1lID0gbmV3IERhdGUoMCk7XG4gICAgaWYgKHRoaXMuc3RhdHMpIHtcbiAgICAgIG10aW1lID0gdGhpcy5zdGF0cy5tdGltZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbXRpbWU7XG4gIH1cblxuICBAY29tcHV0ZWQgZ2V0IGlzQ3VycmVudCgpIHtcbiAgICBjb25zdCBhY3RpdmVQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG5cbiAgICBpZiAoYWN0aXZlUGF0aCA9PT0gdGhpcy5yb290UGF0aCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3RhdGljIGdldCBkZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRpdGxlOiAnJyxcbiAgICAgIGdyb3VwOiAnJyxcbiAgICAgIHBhdGhzOiBbXSxcbiAgICAgIGljb246ICdpY29uLWNoZXZyb24tcmlnaHQnLFxuICAgICAgc2V0dGluZ3M6IHt9LFxuICAgICAgZGV2TW9kZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZTogbnVsbCxcbiAgICAgIHNvdXJjZTogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBleHRlbmRPYnNlcnZhYmxlKHRoaXMucHJvcHMsIFByb2plY3QuZGVmYXVsdFByb3BzKTtcbiAgICB0aGlzLnVwZGF0ZVByb3BzKHByb3BzKTtcbiAgfVxuXG4gIHVwZGF0ZVByb3BzKHByb3BzKSB7XG4gICAgZXh0ZW5kT2JzZXJ2YWJsZSh0aGlzLnByb3BzLCBwcm9wcyk7XG4gICAgdGhpcy5zZXRGaWxlU3RhdHMoKTtcbiAgfVxuXG4gIGdldFByb3BzKCkge1xuICAgIHJldHVybiB0b0pTKHRoaXMucHJvcHMpO1xuICB9XG5cbiAgZ2V0Q2hhbmdlZFByb3BzKCkge1xuICAgIGNvbnN0IHsgLi4ucHJvcHMgfSA9IHRoaXMuZ2V0UHJvcHMoKTtcbiAgICBjb25zdCBkZWZhdWx0cyA9IFByb2plY3QuZGVmYXVsdFByb3BzO1xuXG4gICAgT2JqZWN0LmtleXMoZGVmYXVsdHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnc2V0dGluZ3MnOiB7XG4gICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHByb3BzW2tleV0pLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZGVsZXRlIHByb3BzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgIGlmIChwcm9wc1trZXldID09PSBkZWZhdWx0c1trZXldKSB7XG4gICAgICAgICAgICBkZWxldGUgcHJvcHNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9wcztcbiAgfVxuXG4gIEBhY3Rpb24gc2V0RmlsZVN0YXRzKCkge1xuICAgIGZzLnN0YXQodGhpcy5yb290UGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgIGlmICghZXJyKSB7XG4gICAgICAgIHRoaXMuc3RhdHMgPSBzdGF0cztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCBzZXR0aW5ncyB0aGF0IGFyZSBzYXZlZCBsb2NhbGx5IHdpdGggdGhlIHByb2plY3RcbiAgICogaWYgdGhlcmUgYXJlIGFueS5cbiAgICovXG4gIEBhY3Rpb24gZmV0Y2hMb2NhbFNldHRpbmdzKCkge1xuICAgIGNvbnN0IGZpbGUgPSBgJHt0aGlzLnJvb3RQYXRofS9wcm9qZWN0LmNzb25gO1xuICAgIENTT04ucmVhZEZpbGUoZmlsZSwgKGVyciwgc2V0dGluZ3MpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBleHRlbmRPYnNlcnZhYmxlKHRoaXMucHJvcHMuc2V0dGluZ3MsIHNldHRpbmdzKTtcbiAgICB9KTtcbiAgfVxufVxuIl19