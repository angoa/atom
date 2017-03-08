(function() {
  var path;

  path = require("path");

  module.exports = {
    repoForPath: function(goalPath) {
      var i, j, len, projectPath, ref;
      ref = atom.project.getPaths();
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        projectPath = ref[i];
        if (goalPath === projectPath || goalPath.indexOf(projectPath + path.sep) === 0) {
          return atom.project.getRepositories()[i];
        }
      }
      return null;
    },
    getStyleObject: function(el) {
      var camelizedAttr, property, styleObject, styleProperties, value;
      styleProperties = window.getComputedStyle(el);
      styleObject = {};
      for (property in styleProperties) {
        value = styleProperties.getPropertyValue(property);
        camelizedAttr = property.replace(/\-([a-z])/g, function(a, b) {
          return b.toUpperCase();
        });
        styleObject[camelizedAttr] = value;
      }
      return styleObject;
    },
    getFullExtension: function(filePath) {
      var extension, fullExtension;
      fullExtension = '';
      while (extension = path.extname(filePath)) {
        fullExtension = extension + fullExtension;
        filePath = path.basename(filePath, extension);
      }
      return fullExtension;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3RyZWUtdmlldy9saWIvaGVscGVycy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsV0FBQSxFQUFhLFNBQUMsUUFBRDtBQUNYLFVBQUE7QUFBQTtBQUFBLFdBQUEsNkNBQUE7O1FBQ0UsSUFBRyxRQUFBLEtBQVksV0FBWixJQUEyQixRQUFRLENBQUMsT0FBVCxDQUFpQixXQUFBLEdBQWMsSUFBSSxDQUFDLEdBQXBDLENBQUEsS0FBNEMsQ0FBMUU7QUFDRSxpQkFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWIsQ0FBQSxDQUErQixDQUFBLENBQUEsRUFEeEM7O0FBREY7YUFHQTtJQUpXLENBQWI7SUFNQSxjQUFBLEVBQWdCLFNBQUMsRUFBRDtBQUNkLFVBQUE7TUFBQSxlQUFBLEdBQWtCLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixFQUF4QjtNQUNsQixXQUFBLEdBQWM7QUFDZCxXQUFBLDJCQUFBO1FBQ0UsS0FBQSxHQUFRLGVBQWUsQ0FBQyxnQkFBaEIsQ0FBaUMsUUFBakM7UUFDUixhQUFBLEdBQWdCLFFBQVEsQ0FBQyxPQUFULENBQWlCLFlBQWpCLEVBQStCLFNBQUMsQ0FBRCxFQUFJLENBQUo7aUJBQVUsQ0FBQyxDQUFDLFdBQUYsQ0FBQTtRQUFWLENBQS9CO1FBQ2hCLFdBQVksQ0FBQSxhQUFBLENBQVosR0FBNkI7QUFIL0I7YUFJQTtJQVBjLENBTmhCO0lBZUEsZ0JBQUEsRUFBa0IsU0FBQyxRQUFEO0FBQ2hCLFVBQUE7TUFBQSxhQUFBLEdBQWdCO0FBQ2hCLGFBQU0sU0FBQSxHQUFZLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixDQUFsQjtRQUNFLGFBQUEsR0FBZ0IsU0FBQSxHQUFZO1FBQzVCLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBTCxDQUFjLFFBQWQsRUFBd0IsU0FBeEI7TUFGYjthQUdBO0lBTGdCLENBZmxCOztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgXCJwYXRoXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuICByZXBvRm9yUGF0aDogKGdvYWxQYXRoKSAtPlxuICAgIGZvciBwcm9qZWN0UGF0aCwgaSBpbiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgICAgaWYgZ29hbFBhdGggaXMgcHJvamVjdFBhdGggb3IgZ29hbFBhdGguaW5kZXhPZihwcm9qZWN0UGF0aCArIHBhdGguc2VwKSBpcyAwXG4gICAgICAgIHJldHVybiBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKClbaV1cbiAgICBudWxsXG5cbiAgZ2V0U3R5bGVPYmplY3Q6IChlbCkgLT5cbiAgICBzdHlsZVByb3BlcnRpZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbClcbiAgICBzdHlsZU9iamVjdCA9IHt9XG4gICAgZm9yIHByb3BlcnR5IG9mIHN0eWxlUHJvcGVydGllc1xuICAgICAgdmFsdWUgPSBzdHlsZVByb3BlcnRpZXMuZ2V0UHJvcGVydHlWYWx1ZSBwcm9wZXJ0eVxuICAgICAgY2FtZWxpemVkQXR0ciA9IHByb3BlcnR5LnJlcGxhY2UgL1xcLShbYS16XSkvZywgKGEsIGIpIC0+IGIudG9VcHBlckNhc2UoKVxuICAgICAgc3R5bGVPYmplY3RbY2FtZWxpemVkQXR0cl0gPSB2YWx1ZVxuICAgIHN0eWxlT2JqZWN0XG5cbiAgZ2V0RnVsbEV4dGVuc2lvbjogKGZpbGVQYXRoKSAtPlxuICAgIGZ1bGxFeHRlbnNpb24gPSAnJ1xuICAgIHdoaWxlIGV4dGVuc2lvbiA9IHBhdGguZXh0bmFtZShmaWxlUGF0aClcbiAgICAgIGZ1bGxFeHRlbnNpb24gPSBleHRlbnNpb24gKyBmdWxsRXh0ZW5zaW9uXG4gICAgICBmaWxlUGF0aCA9IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgsIGV4dGVuc2lvbilcbiAgICBmdWxsRXh0ZW5zaW9uXG4iXX0=
