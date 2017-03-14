(function() {
  var path;

  path = require('path');

  module.exports = function(p) {
    if (p == null) {
      return;
    }
    if (p.match(/\/\.pigments$/)) {
      return 'pigments';
    } else {
      return path.extname(p).slice(1);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9zY29wZS1mcm9tLWZpbGUtbmFtZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLENBQUQ7SUFDZixJQUFjLFNBQWQ7QUFBQSxhQUFBOztJQUNBLElBQUcsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxlQUFSLENBQUg7YUFBaUMsV0FBakM7S0FBQSxNQUFBO2FBQWlELElBQUksQ0FBQyxPQUFMLENBQWEsQ0FBYixDQUFnQixVQUFqRTs7RUFGZTtBQURqQiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xubW9kdWxlLmV4cG9ydHMgPSAocCkgLT5cbiAgcmV0dXJuIHVubGVzcyBwP1xuICBpZiBwLm1hdGNoKC9cXC9cXC5waWdtZW50cyQvKSB0aGVuICdwaWdtZW50cycgZWxzZSBwYXRoLmV4dG5hbWUocClbMS4uLTFdXG4iXX0=
