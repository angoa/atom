(function() {
  var CompositeDisposable, RulerView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  RulerView = (function(superClass) {
    extend(RulerView, superClass);

    function RulerView() {
      return RulerView.__super__.constructor.apply(this, arguments);
    }

    RulerView.prototype.subscriptions = null;

    RulerView.prototype.model = null;

    RulerView.prototype.editor = null;

    RulerView.prototype.lines = null;

    RulerView.prototype.createdCallback = function() {
      return this.classList.add('rulerz');
    };

    RulerView.prototype.initialize = function(model) {
      this.subscriptions = new CompositeDisposable;
      this.model = model;
      this.insert();
      this.subscribe();
      return this.update(this.model.getCursor().getScreenPosition());
    };

    RulerView.prototype.getEditor = function() {
      var ref, root;
      this.editor = atom.views.getView(this.model.getCursor().editor);
      root = (ref = this.editor.shadowRoot) != null ? ref : this.editor;
      this.lines = root.querySelector('.scroll-view .lines');
      return this.editor;
    };

    RulerView.prototype.insert = function() {
      if (!this.lines) {
        this.getEditor();
      }
      if (!this.lines) {
        return;
      }
      return this.lines.appendChild(this);
    };

    RulerView.prototype.subscribe = function() {
      this.subscriptions.add(this.model.onDidChange(this.update.bind(this)));
      return this.subscriptions.add(this.model.onDidDestroy(this.destroy.bind(this)));
    };

    RulerView.prototype.update = function(point) {
      var position, view;
      view = this.getEditor();
      position = view.pixelPositionForScreenPosition(point);
      return this.style.left = position.left + 'px';
    };

    RulerView.prototype.destroy = function() {
      this.subscriptions.dispose();
      return this.remove();
    };

    return RulerView;

  })(HTMLElement);

  module.exports = RulerView = document.registerElement('ruler-view', {
    prototype: RulerView.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3J1bGVyei9saWIvcnVsZXItdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhCQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFbEI7Ozs7Ozs7d0JBQ0osYUFBQSxHQUFlOzt3QkFDZixLQUFBLEdBQWU7O3dCQUNmLE1BQUEsR0FBZTs7d0JBQ2YsS0FBQSxHQUFlOzt3QkFFZixlQUFBLEdBQWlCLFNBQUE7YUFDZixJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxRQUFmO0lBRGU7O3dCQUdqQixVQUFBLEdBQVksU0FBQyxLQUFEO01BQ1YsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsS0FBRCxHQUFTO01BQ1QsSUFBQyxDQUFBLE1BQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxTQUFELENBQUE7YUFFQSxJQUFDLENBQUEsTUFBRCxDQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQWtCLENBQUMsaUJBQW5CLENBQUEsQ0FBUjtJQU5VOzt3QkFRWixTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBQSxDQUFrQixDQUFDLE1BQXRDO01BQ1YsSUFBQSxrREFBK0IsSUFBQyxDQUFBO01BQ2hDLElBQUMsQ0FBQSxLQUFELEdBQVUsSUFBSSxDQUFDLGFBQUwsQ0FBbUIscUJBQW5CO2FBQ1YsSUFBQyxDQUFBO0lBSlE7O3dCQU9YLE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBQSxDQUFvQixJQUFDLENBQUEsS0FBckI7UUFBQSxJQUFDLENBQUEsU0FBRCxDQUFBLEVBQUE7O01BQ0EsSUFBQSxDQUFjLElBQUMsQ0FBQSxLQUFmO0FBQUEsZUFBQTs7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLFdBQVAsQ0FBbUIsSUFBbkI7SUFITTs7d0JBS1IsU0FBQSxHQUFXLFNBQUE7TUFFVCxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxXQUFQLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLElBQWIsQ0FBbkIsQ0FBbkI7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxZQUFQLENBQW9CLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBcEIsQ0FBbkI7SUFIUzs7d0JBTVgsTUFBQSxHQUFRLFNBQUMsS0FBRDtBQUNOLFVBQUE7TUFBQSxJQUFBLEdBQWMsSUFBQyxDQUFBLFNBQUQsQ0FBQTtNQUNkLFFBQUEsR0FBYyxJQUFJLENBQUMsOEJBQUwsQ0FBb0MsS0FBcEM7YUFDZCxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsR0FBYyxRQUFRLENBQUMsSUFBVCxHQUFnQjtJQUh4Qjs7d0JBTVIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTthQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7SUFGTzs7OztLQXpDYTs7RUE2Q3hCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FBWSxRQUFRLENBQUMsZUFBVCxDQUF5QixZQUF6QixFQUF1QztJQUFDLFNBQUEsRUFBVyxTQUFTLENBQUMsU0FBdEI7R0FBdkM7QUEvQzdCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuY2xhc3MgUnVsZXJWaWV3IGV4dGVuZHMgSFRNTEVsZW1lbnRcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuICBtb2RlbDogICAgICAgICBudWxsXG4gIGVkaXRvcjogICAgICAgIG51bGxcbiAgbGluZXM6ICAgICAgICAgbnVsbFxuXG4gIGNyZWF0ZWRDYWxsYmFjazogLT5cbiAgICBAY2xhc3NMaXN0LmFkZCAncnVsZXJ6J1xuXG4gIGluaXRpYWxpemU6IChtb2RlbCkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQG1vZGVsID0gbW9kZWxcbiAgICBAaW5zZXJ0KClcbiAgICBAc3Vic2NyaWJlKClcbiAgICAjIFNldCB0aGUgaW5pdGlhbCBwb3NpdGlvbmluZy5cbiAgICBAdXBkYXRlIEBtb2RlbC5nZXRDdXJzb3IoKS5nZXRTY3JlZW5Qb3NpdGlvbigpXG5cbiAgZ2V0RWRpdG9yOiAtPlxuICAgIEBlZGl0b3IgPSBhdG9tLnZpZXdzLmdldFZpZXcgQG1vZGVsLmdldEN1cnNvcigpLmVkaXRvclxuICAgIHJvb3QgICAgPSBAZWRpdG9yLnNoYWRvd1Jvb3QgPyBAZWRpdG9yXG4gICAgQGxpbmVzICA9IHJvb3QucXVlcnlTZWxlY3RvciAnLnNjcm9sbC12aWV3IC5saW5lcydcbiAgICBAZWRpdG9yXG5cbiAgIyBJbnNlcnQgdGhlIHZpZXcgaW50byB0aGUgVGV4dEVkaXRvcnMgdW5kZXJsYXllci5cbiAgaW5zZXJ0OiAtPlxuICAgIEBnZXRFZGl0b3IoKSB1bmxlc3MgQGxpbmVzXG4gICAgcmV0dXJuIHVubGVzcyBAbGluZXMgIyB0ZW1wb3JhcnkgYmFuZC1haWQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JnZWNyYWZ0ZWQvcnVsZXJ6L2lzc3Vlcy8xMlxuICAgIEBsaW5lcy5hcHBlbmRDaGlsZCBAXG5cbiAgc3Vic2NyaWJlOiAtPlxuICAgICMgV2F0Y2ggdGhlIGN1cnNvciBmb3IgY2hhbmdlcy5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1vZGVsLm9uRGlkQ2hhbmdlIEB1cGRhdGUuYmluZChAKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbW9kZWwub25EaWREZXN0cm95IEBkZXN0cm95LmJpbmQoQClcblxuICAjIENoYW5nZSB0aGUgbGVmdCBhbGlnbm1lbnQgb2YgdGhlIHJ1bGVyLlxuICB1cGRhdGU6IChwb2ludCkgLT5cbiAgICB2aWV3ICAgICAgICA9IEBnZXRFZGl0b3IoKVxuICAgIHBvc2l0aW9uICAgID0gdmlldy5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24gcG9pbnRcbiAgICBAc3R5bGUubGVmdCA9IHBvc2l0aW9uLmxlZnQgKyAncHgnXG5cbiAgIyBDbGVhbiB1cC5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAcmVtb3ZlKClcblxubW9kdWxlLmV4cG9ydHMgPSBSdWxlclZpZXcgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ3J1bGVyLXZpZXcnLCB7cHJvdG90eXBlOiBSdWxlclZpZXcucHJvdG90eXBlfSlcbiJdfQ==
