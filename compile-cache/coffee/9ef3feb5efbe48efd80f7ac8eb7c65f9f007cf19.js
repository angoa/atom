(function() {
  var Crypto, Os;

  Os = require('os');

  Crypto = require('crypto');

  module.exports = {
    disableNewBufferOnOpen: function(val, force) {
      return this.config('disableNewFileOnOpen', val, force);
    },
    disableNewBufferOnOpenAlways: function(val, force) {
      return this.config('disableNewFileOnOpenAlways', val, force);
    },
    restoreOpenFilesPerProject: function(val, force) {
      return this.config('restoreOpenFilesPerProject', val, force);
    },
    saveFolder: function(val, force) {
      var saveFolderPath;
      saveFolderPath = this.config('dataSaveFolder', val, force);
      if (saveFolderPath == null) {
        this.setSaveFolderDefault();
        saveFolderPath = this.saveFolder();
      }
      return saveFolderPath;
    },
    restoreOpenFileContents: function(val, force) {
      return this.config('restoreOpenFileContents', val, force);
    },
    skipSavePrompt: function(val, force) {
      return this.config('skipSavePrompt', val, force);
    },
    extraDelay: function(val, force) {
      return this.config('extraDelay', val, force);
    },
    setSaveFolderDefault: function() {
      return this.saveFolder(atom.packages.getPackageDirPaths() + this.pathSeparator() + 'save-session' + this.pathSeparator() + 'projects');
    },
    pathSeparator: function() {
      if (this.isWindows()) {
        return '\\';
      }
      return '/';
    },
    isWindows: function() {
      return Os.platform() === 'win32';
    },
    isArray: function(value) {
      return value && typeof value === 'object' && value instanceof Array && typeof value.length === 'number' && typeof value.splice === 'function' && !(value.propertyIsEnumerable('length'));
    },
    saveFile: function() {
      var path, projectPath, projects, saveFolderPath;
      saveFolderPath = this.saveFolder();
      if (atom.project.getPaths().length > 0) {
        projects = atom.project.getPaths();
        if ((projects != null) && projects.length > 0) {
          projectPath = projects[0];
        }
        if (projectPath != null) {
          path = this.transformProjectPath(projectPath);
          return saveFolderPath + this.pathSeparator() + path + this.pathSeparator() + 'project.json';
        }
      }
      return saveFolderPath + this.pathSeparator() + 'project.json';
    },
    transformProjectPath: function(path) {
      var colon;
      if (this.isWindows) {
        colon = path.indexOf(':');
        if (colon !== -1) {
          return path.substring(0, colon) + path.substring(colon + 1, path.length);
        }
      }
      return path;
    },
    hashMyStr: function(str) {
      var hash;
      hash = "";
      if ((str != null) && str !== "") {
        hash = Crypto.createHash('md5').update(str).digest("hex");
      }
      return hash;
    },
    config: function(key, val, force) {
      if ((val != null) || ((force != null) && force)) {
        return atom.config.set('save-session.' + key, val);
      } else {
        return atom.config.get('save-session.' + key);
      }
    },
    observe: function(key, callback) {
      return atom.config.observe('save-session.' + key, callback);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3NhdmUtc2Vzc2lvbi9saWIvY29uZmlnLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUdFO0lBQUEsc0JBQUEsRUFBd0IsU0FBQyxHQUFELEVBQU0sS0FBTjthQUN0QixJQUFDLENBQUEsTUFBRCxDQUFRLHNCQUFSLEVBQWdDLEdBQWhDLEVBQXFDLEtBQXJDO0lBRHNCLENBQXhCO0lBR0EsNEJBQUEsRUFBOEIsU0FBQyxHQUFELEVBQU0sS0FBTjthQUM1QixJQUFDLENBQUEsTUFBRCxDQUFRLDRCQUFSLEVBQXNDLEdBQXRDLEVBQTJDLEtBQTNDO0lBRDRCLENBSDlCO0lBTUEsMEJBQUEsRUFBNEIsU0FBQyxHQUFELEVBQU0sS0FBTjthQUMxQixJQUFDLENBQUEsTUFBRCxDQUFRLDRCQUFSLEVBQXNDLEdBQXRDLEVBQTJDLEtBQTNDO0lBRDBCLENBTjVCO0lBU0EsVUFBQSxFQUFZLFNBQUMsR0FBRCxFQUFNLEtBQU47QUFDVixVQUFBO01BQUEsY0FBQSxHQUFpQixJQUFDLENBQUEsTUFBRCxDQUFRLGdCQUFSLEVBQTBCLEdBQTFCLEVBQStCLEtBQS9CO01BQ2pCLElBQU8sc0JBQVA7UUFDRSxJQUFDLENBQUEsb0JBQUQsQ0FBQTtRQUNBLGNBQUEsR0FBaUIsSUFBQyxDQUFBLFVBQUQsQ0FBQSxFQUZuQjs7QUFHQSxhQUFPO0lBTEcsQ0FUWjtJQWdCQSx1QkFBQSxFQUF5QixTQUFDLEdBQUQsRUFBTSxLQUFOO2FBQ3ZCLElBQUMsQ0FBQSxNQUFELENBQVEseUJBQVIsRUFBbUMsR0FBbkMsRUFBd0MsS0FBeEM7SUFEdUIsQ0FoQnpCO0lBbUJBLGNBQUEsRUFBZ0IsU0FBQyxH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QUNOLElBQUcsYUFBQSxJQUFRLENBQUMsZUFBQSxJQUFXLEtBQVosQ0FBWDtlQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixlQUFBLEdBQWtCLEdBQWxDLEVBQXVDLEdBQXZDLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGVBQUEsR0FBa0IsR0FBbEMsRUFIRjs7SUFETSxDQXpFUjtJQStFQSxPQUFBLEVBQVMsU0FBQyxHQUFELEVBQU0sUUFBTjthQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixlQUFBLEdBQWtCLEdBQXRDLEVBQTJDLFFBQTNDO0lBRE8sQ0EvRVQ7O0FBTkYiLCJzb3VyY2VzQ29udGVudCI6WyJPcyA9IHJlcXVpcmUgJ29zJ1xuQ3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJylcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICMgVXNlciBjb25maWdzXG4gIGRpc2FibGVOZXdCdWZmZXJPbk9wZW46ICh2YWwsIGZvcmNlKSAtPlxuICAgIEBjb25maWcgJ2Rpc2FibGVOZXdGaWxlT25PcGVuJywgdmFsLCBmb3JjZVxuXG4gIGRpc2FibGVOZXdCdWZmZXJPbk9wZW5BbHdheXM6ICh2YWwsIGZvcmNlKSAtPlxuICAgIEBjb25maWcgJ2Rpc2FibGVOZXdGaWxlT25PcGVuQWx3YXlzJywgdmFsLCBmb3JjZVxuXG4gIHJlc3RvcmVPcGVuRmlsZXNQZXJQcm9qZWN0OiAodmFsLCBmb3JjZSkgLT5cbiAgICBAY29uZmlnICdyZXN0b3JlT3BlbkZpbGVzUGVyUHJvamVjdCcsIHZhbCwgZm9yY2VcblxuICBzYXZlRm9sZGVyOiAodmFsLCBmb3JjZSkgLT5cbiAgICBzYXZlRm9sZGVyUGF0aCA9IEBjb25maWcgJ2RhdGFTYXZlRm9sZGVyJywgdmFsLCBmb3JjZVxuICAgIGlmIG5vdCBzYXZlRm9sZGVyUGF0aD9cbiAgICAgIEBzZXRTYXZlRm9sZGVyRGVmYXVsdCgpXG4gICAgICBzYXZlRm9sZGVyUGF0aCA9IEBzYXZlRm9sZGVyKClcbiAgICByZXR1cm4gc2F2ZUZvbGRlclBhdGhcblxuICByZXN0b3JlT3BlbkZpbGVDb250ZW50czogKHZhbCwgZm9yY2UpIC0+XG4gICAgQGNvbmZpZyAncmVzdG9yZU9wZW5GaWxlQ29udGVudHMnLCB2YWwsIGZvcmNlXG5cbiAgc2tpcFNhdmVQcm9tcHQ6ICh2YWwsIGZvcmNlKSAtPlxuICAgIEBjb25maWcgJ3NraXBTYXZlUHJvbXB0JywgdmFsLCBmb3JjZVxuXG4gIGV4dHJhRGVsYXk6ICh2YWwsIGZvcmNlKSAtPlxuICAgIEBjb25maWcgJ2V4dHJhRGVsYXknLCB2YWwsIGZvcmNlXG5cbiAgI0hlbHBlcnNcbiAgc2V0U2F2ZUZvbGRlckRlZmF1bHQ6IC0+XG4gICAgQHNhdmVGb2xkZXIoYXRvbS5wYWNrYWdlcy5nZXRQYWNrYWdlRGlyUGF0aHMoKSArIEBwYXRoU2VwYXJhdG9yKCkgKyAnc2F2ZS1zZXNzaW9uJyArIEBwYXRoU2VwYXJhdG9yKCkgKyAncHJvamVjdHMnKVxuXG4gIHBhdGhTZXBhcmF0b3I6IC0+XG4gICAgaWYgQGlzV2luZG93cygpXG4gICAgICByZXR1cm4gJ1xcXFwnXG4gICAgcmV0dXJuICcvJ1xuXG4gIGlzV2luZG93czogLT5cbiAgICByZXR1cm4gT3MucGxhdGZvcm0oKSBpcyAnd2luMzInXG5cbiAgaXNBcnJheTogKHZhbHVlKSAtPlxuICAgIHZhbHVlIGFuZFxuICAgICAgdHlwZW9mIHZhbHVlIGlzICdvYmplY3QnIGFuZFxuICAgICAgICB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5IGFuZFxuICAgICAgICB0eXBlb2YgdmFsdWUubGVuZ3RoIGlzICdudW1iZXInIGFuZFxuICAgICAgICB0eXBlb2YgdmFsdWUuc3BsaWNlIGlzICdmdW5jdGlvbicgYW5kXG4gICAgICAgIG5vdCAodmFsdWUucHJvcGVydHlJc0VudW1lcmFibGUgJ2xlbmd0aCcpXG5cbiAgc2F2ZUZpbGU6IC0+XG4gICAgc2F2ZUZvbGRlclBhdGggPSBAc2F2ZUZvbGRlcigpXG5cbiAgICBpZiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKS5sZW5ndGggPiAwXG4gICAgICBwcm9qZWN0cyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgICBwcm9qZWN0UGF0aCA9IHByb2plY3RzWzBdIGlmIChwcm9qZWN0cz8gYW5kIHByb2plY3RzLmxlbmd0aCA+IDApXG5cbiAgICAgIGlmIHByb2plY3RQYXRoP1xuICAgICAgICBwYXRoID0gQHRyYW5zZm9ybVByb2plY3RQYXRoKHByb2plY3RQYXRoKVxuICAgICAgICByZXR1cm4gc2F2ZUZvbGRlclBhdGggKyBAcGF0aFNlcGFyYXRvcigpICsgcGF0aCArIEBwYXRoU2VwYXJhdG9yKCkgKyAncHJvamVjdC5qc29uJ1xuXG4gICAgcmV0dXJuIHNhdmVGb2xkZXJQYXRoICsgQHBhdGhTZXBhcmF0b3IoKSArICdwcm9qZWN0Lmpzb24nXG5cbiAgdHJhbnNmb3JtUHJvamVjdFBhdGg6IChwYXRoKSAtPlxuICAgIGlmIEBpc1dpbmRvd3NcbiAgICAgIGNvbG9uID0gcGF0aC5pbmRleE9mKCc6JylcbiAgICAgIGlmIGNvbG9uIGlzbnQgLTFcbiAgICAgICAgcmV0dXJuIHBhdGguc3Vic3RyaW5nKDAsIGNvbG9uKSArIHBhdGguc3Vic3RyaW5nKGNvbG9uICsgMSwgcGF0aC5sZW5ndGgpXG5cbiAgICByZXR1cm4gcGF0aFxuXG4gIGhhc2hNeVN0cjogKHN0cikgLT5cbiAgICBoYXNoID0gXCJcIiAjcmV0dXJuIGVtcHR5IGhhc2ggZm9yIGVtcHkgc3RyaW5nXG4gICAgaWYgc3RyPyBhbmQgc3RyIGlzbnQgXCJcIlxuICAgICAgaGFzaCA9IENyeXB0by5jcmVhdGVIYXNoKCdtZDUnKS51cGRhdGUoc3RyKS5kaWdlc3QoXCJoZXhcIilcblxuICAgIHJldHVybiBoYXNoXG5cbiAgY29uZmlnOiAoa2V5LCB2YWwsIGZvcmNlKSAtPlxuICAgIGlmIHZhbD8gb3IgKGZvcmNlPyBhbmQgZm9yY2UpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQgJ3NhdmUtc2Vzc2lvbi4nICsga2V5LCB2YWxcbiAgICBlbHNlXG4gICAgICBhdG9tLmNvbmZpZy5nZXQgJ3NhdmUtc2Vzc2lvbi4nICsga2V5XG5cbiAgb2JzZXJ2ZTogKGtleSwgY2FsbGJhY2spIC0+XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnc2F2ZS1zZXNzaW9uLicgKyBrZXksIGNhbGxiYWNrKVxuIl19