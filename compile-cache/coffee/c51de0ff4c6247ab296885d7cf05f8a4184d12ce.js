(function() {
  var DefaultFileIcons, fs, path;

  fs = require('fs-plus');

  path = require('path');

  DefaultFileIcons = (function() {
    function DefaultFileIcons() {}

    DefaultFileIcons.prototype.iconClassForPath = function(filePath) {
      var extension;
      extension = path.extname(filePath);
      if (fs.isSymbolicLinkSync(filePath)) {
        return 'icon-file-symlink-file';
      } else if (fs.isReadmePath(filePath)) {
        return 'icon-book';
      } else if (fs.isCompressedExtension(extension)) {
        return 'icon-file-zip';
      } else if (fs.isImageExtension(extension)) {
        return 'icon-file-media';
      } else if (fs.isPdfExtension(extension)) {
        return 'icon-file-pdf';
      } else if (fs.isBinaryExtension(extension)) {
        return 'icon-file-binary';
      } else {
        return 'icon-file-text';
      }
    };

    return DefaultFileIcons;

  })();

  module.exports = DefaultFileIcons;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3RyZWUtdmlldy9saWIvZGVmYXVsdC1maWxlLWljb25zLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFRDs7OytCQUNKLGdCQUFBLEdBQWtCLFNBQUMsUUFBRDtBQUNoQixVQUFBO01BQUEsU0FBQSxHQUFZLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYjtNQUVaLElBQUcsRUFBRSxDQUFDLGtCQUFILENBQXNCLFFBQXRCLENBQUg7ZUFDRSx5QkFERjtPQUFBLE1BRUssSUFBRyxFQUFFLENBQUMsWUFBSCxDQUFnQixRQUFoQixDQUFIO2VBQ0gsWUFERztPQUFBLE1BRUEsSUFBRyxFQUFFLENBQUMscUJBQUgsQ0FBeUIsU0FBekIsQ0FBSDtlQUNILGdCQURHO09BQUEsTUFFQSxJQUFHLEVBQUUsQ0FBQyxnQkFBSCxDQUFvQixTQUFwQixDQUFIO2VBQ0gsa0JBREc7T0FBQSxNQUVBLElBQUcsRUFBRSxDQUFDLGNBQUgsQ0FBa0IsU0FBbEIsQ0FBSDtlQUNILGdCQURHO09BQUEsTUFFQSxJQUFHLEVBQUUsQ0FBQyxpQkFBSCxDQUFxQixTQUFyQixDQUFIO2VBQ0gsbUJBREc7T0FBQSxNQUFBO2VBR0gsaUJBSEc7O0lBYlc7Ozs7OztFQWtCcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF0QmpCIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbmNsYXNzIERlZmF1bHRGaWxlSWNvbnNcbiAgaWNvbkNsYXNzRm9yUGF0aDogKGZpbGVQYXRoKSAtPlxuICAgIGV4dGVuc2lvbiA9IHBhdGguZXh0bmFtZShmaWxlUGF0aClcblxuICAgIGlmIGZzLmlzU3ltYm9saWNMaW5rU3luYyhmaWxlUGF0aClcbiAgICAgICdpY29uLWZpbGUtc3ltbGluay1maWxlJ1xuICAgIGVsc2UgaWYgZnMuaXNSZWFkbWVQYXRoKGZpbGVQYXRoKVxuICAgICAgJ2ljb24tYm9vaydcbiAgICBlbHNlIGlmIGZzLmlzQ29tcHJlc3NlZEV4dGVuc2lvbihleHRlbnNpb24pXG4gICAgICAnaWNvbi1maWxlLXppcCdcbiAgICBlbHNlIGlmIGZzLmlzSW1hZ2VFeHRlbnNpb24oZXh0ZW5zaW9uKVxuICAgICAgJ2ljb24tZmlsZS1tZWRpYSdcbiAgICBlbHNlIGlmIGZzLmlzUGRmRXh0ZW5zaW9uKGV4dGVuc2lvbilcbiAgICAgICdpY29uLWZpbGUtcGRmJ1xuICAgIGVsc2UgaWYgZnMuaXNCaW5hcnlFeHRlbnNpb24oZXh0ZW5zaW9uKVxuICAgICAgJ2ljb24tZmlsZS1iaW5hcnknXG4gICAgZWxzZVxuICAgICAgJ2ljb24tZmlsZS10ZXh0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IERlZmF1bHRGaWxlSWNvbnNcbiJdfQ==
