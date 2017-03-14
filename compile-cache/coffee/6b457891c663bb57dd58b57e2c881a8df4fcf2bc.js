(function() {
  var Disposable, IndentationManager, IndentationStatusView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Disposable = require('atom').Disposable;

  IndentationManager = require('./indentation-manager');

  IndentationStatusView = (function(superClass) {
    extend(IndentationStatusView, superClass);

    function IndentationStatusView() {
      return IndentationStatusView.__super__.constructor.apply(this, arguments);
    }

    IndentationStatusView.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
      this.classList.add('indentation-status', 'inline-block');
      this.indentationLink = document.createElement('a');
      this.indentationLink.classList.add('inline-block');
      this.indentationLink.href = '#';
      this.appendChild(this.indentationLink);
      this.handleEvents();
      return this;
    };

    IndentationStatusView.prototype.attach = function() {
      var ref;
      if ((ref = this.statusBarTile) != null) {
        ref.destroy();
      }
      this.statusBarTile = atom.config.get('auto-detect-indentation.showSpacingInStatusBar') ? this.statusBar.addRightTile({
        item: this,
        priority: 10
      }) : void 0;
      return this.updateIndentationText();
    };

    IndentationStatusView.prototype.handleEvents = function() {
      var clickHandler;
      this.activeItemSubscription = atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          return _this.subscribeToActiveTextEditor();
        };
      })(this));
      this.configSubscription = atom.config.observe('auto-detect-indentation.showSpacingInStatusBar', (function(_this) {
        return function() {
          return _this.attach();
        };
      })(this));
      clickHandler = (function(_this) {
        return function() {
          return atom.commands.dispatch(atom.views.getView(_this.getActiveTextEditor()), 'auto-detect-indentation:show-indentation-selector');
        };
      })(this);
      this.addEventListener('click', clickHandler);
      this.clickSubscription = new Disposable((function(_this) {
        return function() {
          return _this.removeEventListener('click', clickHandler);
        };
      })(this));
      return this.subscribeToActiveTextEditor();
    };

    IndentationStatusView.prototype.destroy = function() {
      var ref, ref1, ref2, ref3, ref4, ref5, ref6;
      if ((ref = this.activeItemSubscription) != null) {
        ref.dispose();
      }
      if ((ref1 = this.indentationSubscription) != null) {
        ref1.dispose();
      }
      if ((ref2 = this.paneOpenSubscription) != null) {
        ref2.dispose();
      }
      if ((ref3 = this.paneCreateSubscription) != null) {
        ref3.dispose();
      }
      if ((ref4 = this.paneDestroySubscription) != null) {
        ref4.dispose();
      }
      if ((ref5 = this.clickSubscription) != null) {
        ref5.dispose();
      }
      if ((ref6 = this.configSubscription) != null) {
        ref6.dispose();
      }
      return this.statusBarTile.destroy();
    };

    IndentationStatusView.prototype.getActiveTextEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    IndentationStatusView.prototype.subscribeToActiveTextEditor = function() {
      var editor, ref, ref1, ref2, ref3, ref4, workspace;
      workspace = atom.workspace;
      editor = workspace.getActiveTextEditor();
      if ((ref = this.indentationSubscription) != null) {
        ref.dispose();
      }
      this.indentationSubscription = editor != null ? (ref1 = editor.emitter) != null ? ref1.on('did-change-indentation', (function(_this) {
        return function() {
          return _this.updateIndentationText();
        };
      })(this)) : void 0 : void 0;
      if ((ref2 = this.paneOpenSubscription) != null) {
        ref2.dispose();
      }
      this.paneOpenSubscription = workspace.onDidOpen((function(_this) {
        return function(event) {
          return _this.updateIndentationText();
        };
      })(this));
      if ((ref3 = this.paneCreateSubscription) != null) {
        ref3.dispose();
      }
      this.paneCreateSubscription = workspace.onDidAddPane((function(_this) {
        return function(event) {
          return _this.updateIndentationText();
        };
      })(this));
      if ((ref4 = this.paneDestroySubscription) != null) {
        ref4.dispose();
      }
      this.paneDestroySubscription = workspace.onDidDestroyPaneItem((function(_this) {
        return function(event) {
          return _this.updateIndentationText();
        };
      })(this));
      return this.updateIndentationText();
    };

    IndentationStatusView.prototype.updateIndentationText = function() {
      var editor, indentationName;
      editor = this.getActiveTextEditor();
      if (editor) {
        indentationName = IndentationManager.getIndentation(editor);
        this.indentationLink.textContent = indentationName;
        return this.style.display = '';
      } else {
        return this.style.display = 'none';
      }
    };

    return IndentationStatusView;

  })(HTMLDivElement);

  module.exports = document.registerElement('indentation-selector-status', {
    prototype: IndentationStatusView.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL2F1dG8tZGV0ZWN0LWluZGVudGF0aW9uL2xpYi9pbmRlbnRhdGlvbi1zdGF0dXMtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUE7OztFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBQ2Ysa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHVCQUFSOztFQUVmOzs7Ozs7O29DQUNKLFVBQUEsR0FBWSxTQUFDLFNBQUQ7TUFBQyxJQUFDLENBQUEsWUFBRDtNQUNYLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLG9CQUFmLEVBQXFDLGNBQXJDO01BQ0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBdkI7TUFDbkIsSUFBQyxDQUFBLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBM0IsQ0FBK0IsY0FBL0I7TUFDQSxJQUFDLENBQUEsZUFBZSxDQUFDLElBQWpCLEdBQXdCO01BQ3hCLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBQyxDQUFBLGVBQWQ7TUFDQSxJQUFDLENBQUEsWUFBRCxDQUFBO2FBQ0E7SUFQVTs7b0NBU1osTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBOztXQUFjLENBQUUsT0FBaEIsQ0FBQTs7TUFDQSxJQUFDLENBQUEsYUFBRCxHQUNLLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnREFBaEIsQ0FBSCxHQUNFLElBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUF3QjtRQUFBLElBQUEsRUFBTSxJQUFOO1FBQVksUUFBQSxFQUFVLEVBQXRCO09BQXhCLENBREYsR0FBQTthQUVGLElBQUMsQ0FBQSxxQkFBRCxDQUFBO0lBTE07O29DQU9SLFlBQUEsR0FBYyxTQUFBO0FBQ1osVUFBQTtNQUFBLElBQUMsQ0FBQSxzQkFBRCxHQUEwQixJQUFJLENBQUMsU0FB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QUEsR0FBdUIsU0FBQTtBQUNyQixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxtQkFBRCxDQUFBO01BQ1QsSUFBRyxNQUFIO1FBQ0UsZUFBQSxHQUFrQixrQkFBa0IsQ0FBQyxjQUFuQixDQUFrQyxNQUFsQztRQUNsQixJQUFDLENBQUEsZUFBZSxDQUFDLFdBQWpCLEdBQStCO2VBQy9CLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxHQUFpQixHQUhuQjtPQUFBLE1BQUE7ZUFLRSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsR0FBaUIsT0FMbkI7O0lBRnFCOzs7O0tBNURXOztFQXFFcEMsTUFBTSxDQUFDLE9BQVAsR0FBaUIsUUFBUSxDQUFDLGVBQVQsQ0FBeUIsNkJBQXpCLEVBQXdEO0lBQUEsU0FBQSxFQUFXLHFCQUFxQixDQUFDLFNBQWpDO0dBQXhEO0FBeEVqQiIsInNvdXJjZXNDb250ZW50IjpbIntEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5JbmRlbnRhdGlvbk1hbmFnZXIgPSByZXF1aXJlICcuL2luZGVudGF0aW9uLW1hbmFnZXInXG5cbmNsYXNzIEluZGVudGF0aW9uU3RhdHVzVmlldyBleHRlbmRzIEhUTUxEaXZFbGVtZW50XG4gIGluaXRpYWxpemU6IChAc3RhdHVzQmFyKSAtPlxuICAgIEBjbGFzc0xpc3QuYWRkKCdpbmRlbnRhdGlvbi1zdGF0dXMnLCAnaW5saW5lLWJsb2NrJylcbiAgICBAaW5kZW50YXRpb25MaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgQGluZGVudGF0aW9uTGluay5jbGFzc0xpc3QuYWRkKCdpbmxpbmUtYmxvY2snKVxuICAgIEBpbmRlbnRhdGlvbkxpbmsuaHJlZiA9ICcjJ1xuICAgIEBhcHBlbmRDaGlsZChAaW5kZW50YXRpb25MaW5rKVxuICAgIEBoYW5kbGVFdmVudHMoKVxuICAgIHRoaXNcblxuICBhdHRhY2g6IC0+XG4gICAgQHN0YXR1c0JhclRpbGU/LmRlc3Ryb3koKVxuICAgIEBzdGF0dXNCYXJUaWxlID1cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCAnYXV0by1kZXRlY3QtaW5kZW50YXRpb24uc2hvd1NwYWNpbmdJblN0YXR1c0JhcidcbiAgICAgICAgQHN0YXR1c0Jhci5hZGRSaWdodFRpbGUoaXRlbTogdGhpcywgcHJpb3JpdHk6IDEwKVxuICAgIEB1cGRhdGVJbmRlbnRhdGlvblRleHQoKVxuXG4gIGhhbmRsZUV2ZW50czogLT5cbiAgICBAYWN0aXZlSXRlbVN1YnNjcmlwdGlvbiA9IGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gPT5cbiAgICAgIEBzdWJzY3JpYmVUb0FjdGl2ZVRleHRFZGl0b3IoKVxuXG4gICAgQGNvbmZpZ1N1YnNjcmlwdGlvbiA9IGF0b20uY29uZmlnLm9ic2VydmUgJ2F1dG8tZGV0ZWN0LWluZGVudGF0aW9uLnNob3dTcGFjaW5nSW5TdGF0dXNCYXInLCA9PlxuICAgICAgQGF0dGFjaCgpXG5cbiAgICBjbGlja0hhbmRsZXIgPSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhAZ2V0QWN0aXZlVGV4dEVkaXRvcigpKSwgJ2F1dG8tZGV0ZWN0LWluZGVudGF0aW9uOnNob3ctaW5kZW50YXRpb24tc2VsZWN0b3InKVxuICAgIEBhZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrSGFuZGxlcilcbiAgICBAY2xpY2tTdWJzY3JpcHRpb24gPSBuZXcgRGlzcG9zYWJsZSA9PiBAcmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGlja0hhbmRsZXIpXG5cbiAgICBAc3Vic2NyaWJlVG9BY3RpdmVUZXh0RWRpdG9yKClcblxuICBkZXN0cm95OiAtPlxuICAgIEBhY3RpdmVJdGVtU3Vic2NyaXB0aW9uPy5kaXNwb3NlKClcbiAgICBAaW5kZW50YXRpb25TdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuICAgIEBwYW5lT3BlblN1YnNjcmlwdGlvbj8uZGlzcG9zZSgpXG4gICAgQHBhbmVDcmVhdGVTdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuICAgIEBwYW5lRGVzdHJveVN1YnNjcmlwdGlvbj8uZGlzcG9zZSgpXG4gICAgQGNsaWNrU3Vic2NyaXB0aW9uPy5kaXNwb3NlKClcbiAgICBAY29uZmlnU3Vic2NyaXB0aW9uPy5kaXNwb3NlKClcbiAgICBAc3RhdHVzQmFyVGlsZS5kZXN0cm95KClcblxuICBnZXRBY3RpdmVUZXh0RWRpdG9yOiAtPlxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gIHN1YnNjcmliZVRvQWN0aXZlVGV4dEVkaXRvcjogLT5cbiAgICB3b3Jrc3BhY2UgPSBhdG9tLndvcmtzcGFjZVxuICAgIGVkaXRvciA9IHdvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBAaW5kZW50YXRpb25TdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuICAgIEBpbmRlbnRhdGlvblN1YnNjcmlwdGlvbiA9IGVkaXRvcj8uZW1pdHRlcj8ub24gJ2RpZC1jaGFuZ2UtaW5kZW50YXRpb24nLCA9PlxuICAgICAgQHVwZGF0ZUluZGVudGF0aW9uVGV4dCgpXG4gICAgQHBhbmVPcGVuU3Vic2NyaXB0aW9uPy5kaXNwb3NlKClcbiAgICBAcGFuZU9wZW5TdWJzY3JpcHRpb24gPSB3b3Jrc3BhY2Uub25EaWRPcGVuIChldmVudCkgPT5cbiAgICAgIEB1cGRhdGVJbmRlbnRhdGlvblRleHQoKVxuICAgIEBwYW5lQ3JlYXRlU3Vic2NyaXB0aW9uPy5kaXNwb3NlKClcbiAgICBAcGFuZUNyZWF0ZVN1YnNjcmlwdGlvbiA9IHdvcmtzcGFjZS5vbkRpZEFkZFBhbmUgKGV2ZW50KSA9PlxuICAgICAgQHVwZGF0ZUluZGVudGF0aW9uVGV4dCgpXG4gICAgQHBhbmVEZXN0cm95U3Vic2NyaXB0aW9uPy5kaXNwb3NlKClcbiAgICBAcGFuZURlc3Ryb3lTdWJzY3JpcHRpb24gPSB3b3Jrc3BhY2Uub25EaWREZXN0cm95UGFuZUl0ZW0gKGV2ZW50KSA9PlxuICAgICAgQHVwZGF0ZUluZGVudGF0aW9uVGV4dCgpXG4gICAgQHVwZGF0ZUluZGVudGF0aW9uVGV4dCgpXG5cbiAgdXBkYXRlSW5kZW50YXRpb25UZXh0OiAtPlxuICAgIGVkaXRvciA9IEBnZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiBlZGl0b3JcbiAgICAgIGluZGVudGF0aW9uTmFtZSA9IEluZGVudGF0aW9uTWFuYWdlci5nZXRJbmRlbnRhdGlvbiBlZGl0b3JcbiAgICAgIEBpbmRlbnRhdGlvbkxpbmsudGV4dENvbnRlbnQgPSBpbmRlbnRhdGlvbk5hbWVcbiAgICAgIEBzdHlsZS5kaXNwbGF5ID0gJydcbiAgICBlbHNlXG4gICAgICBAc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgnaW5kZW50YXRpb24tc2VsZWN0b3Itc3RhdHVzJywgcHJvdG90eXBlOiBJbmRlbnRhdGlvblN0YXR1c1ZpZXcucHJvdG90eXBlKVxuIl19
