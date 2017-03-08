(function() {
  var DefaultFileIcons, FileIcons;

  DefaultFileIcons = require('./default-file-icons');

  FileIcons = (function() {
    function FileIcons() {
      this.service = new DefaultFileIcons;
    }

    FileIcons.prototype.getService = function() {
      return this.service;
    };

    FileIcons.prototype.resetService = function() {
      return this.service = new DefaultFileIcons;
    };

    FileIcons.prototype.setService = function(service) {
      this.service = service;
    };

    return FileIcons;

  })();

  module.exports = new FileIcons;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3RyZWUtdmlldy9saWIvZmlsZS1pY29ucy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxzQkFBUjs7RUFFYjtJQUNTLG1CQUFBO01BQ1gsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO0lBREo7O3dCQUdiLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBO0lBRFM7O3dCQUdaLFlBQUEsR0FBYyxTQUFBO2FBQ1osSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO0lBREg7O3dCQUdkLFVBQUEsR0FBWSxTQUFDLE9BQUQ7TUFBQyxJQUFDLENBQUEsVUFBRDtJQUFEOzs7Ozs7RUFFZCxNQUFNLENBQUMsT0FBUCxHQUFpQixJQUFJO0FBZHJCIiwic291cmNlc0NvbnRlbnQiOlsiRGVmYXVsdEZpbGVJY29ucyA9IHJlcXVpcmUgJy4vZGVmYXVsdC1maWxlLWljb25zJ1xuXG5jbGFzcyBGaWxlSWNvbnNcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHNlcnZpY2UgPSBuZXcgRGVmYXVsdEZpbGVJY29uc1xuXG4gIGdldFNlcnZpY2U6IC0+XG4gICAgQHNlcnZpY2VcblxuICByZXNldFNlcnZpY2U6IC0+XG4gICAgQHNlcnZpY2UgPSBuZXcgRGVmYXVsdEZpbGVJY29uc1xuXG4gIHNldFNlcnZpY2U6IChAc2VydmljZSkgLT5cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRmlsZUljb25zXG4iXX0=
