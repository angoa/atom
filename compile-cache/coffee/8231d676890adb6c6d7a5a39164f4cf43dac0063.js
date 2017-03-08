(function() {
  var Config;

  Config = require('./config');

  module.exports = {
    activate: function() {
      return this.addListeners();
    },
    enableTemp: function(pane) {
      return pane.promptToSaveItem = function(item) {
        var save;
        save = pane.promptToSaveItem2(item);
        pane.promptToSaveItem = function(item) {
          return true;
        };
        return save;
      };
    },
    addListeners: function() {
      Config.observe('skipSavePrompt', function(val) {
        return atom.workspace.getPanes().map(function(pane) {
          if (val) {
            return pane.promptToSaveItem = function(item) {
              return true;
            };
          } else if (pane.promptToSaveItem2) {
            return pane.promptToSaveItem = function(item) {
              return pane.promptToSaveItem2(item);
            };
          }
        });
      });
      return atom.workspace.observePanes((function(_this) {
        return function(pane) {
          pane.promptToSaveItem2 = pane.promptToSaveItem;
          if (Config.skipSavePrompt()) {
            pane.promptToSaveItem = function(item) {
              return true;
            };
          }
          return pane.onWillDestroyItem(function(event) {
            if (Config.skipSavePrompt()) {
              return _this.enableTemp(pane);
            } else {
              return pane.promptToSaveItem = function(item) {
                return pane.promptToSaveItem2(item);
              };
            }
          });
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3NhdmUtc2Vzc2lvbi9saWIvc2F2ZS1wcm9tcHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FFRTtJQUFBLFFBQUEsRUFBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQURRLENBQVY7SUFHQSxVQUFBLEVBQVksU0FBQyxJQUFEO2FBQ1YsSUFBSSxDQUFDLGdCQUFMLEdBQXdCLFNBQUMsSUFBRDtBQUN0QixZQUFBO1FBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxpQkFBTCxDQUF1QixJQUF2QjtRQUNQLElBQUksQ0FBQyxnQkFBTCxHQUF3QixTQUFDLElBQUQ7aUJBQ3RCO1FBRHNCO2VBRXhCO01BSnNCO0lBRGQsQ0FIWjtJQVVBLFlBQUEsRUFBYyxTQUFBO01BRVosTUFBTSxDQUFDLE9BQVAsQ0FBZSxnQkFBZixFQUFpQyxTQUFDLEdBQUQ7ZUFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFmLENBQUEsQ0FBeUIsQ0FBQyxHQUExQixDQUE4QixTQUFDLElBQUQ7VUFDNUIsSUFBRyxHQUFIO21CQUNFLElBQUksQ0FBQyxnQkFBTCxHQUF3QixTQUFDLElBQUQ7cUJBQ3RCO1lBRHNCLEVBRDFCO1dBQUEsTUFHSyxJQUFHLElBQUksQ0FBQyxpQkFBUjttQkFDSCxJQUFJLENBQUMsZ0JBQUwsR0FBd0IsU0FBQyxJQUFEO3FCQUN0QixJQUFJLENBQUMsaUJBQUwsQ0FBdUIsSUFBdkI7WUFEc0IsRUFEckI7O1FBSnVCLENBQTlCO01BRCtCLENBQWpDO2FBVUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFmLENBQTRCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO1VBQzFCLElBQUksQ0FBQyxpQkFBTCxHQUF5QixJQUFJLENBQUM7VUFFOUIsSUFBRyxNQUFNLENBQUMsY0FBUCxDQUFBLENBQUg7WUFDRSxJQUFJLENBQUMsZ0JBQUwsR0FBd0IsU0FBQyxJQUFEO3FCQUN0QjtZQURzQixFQUQxQjs7aUJBSUEsSUFBSSxDQUFDLGlCQUFMLENBQXVCLFNBQUMsS0FBRDtZQUNyQixJQUFHLE1BQU0sQ0FBQyxjQUFQLENBQUEsQ0FBSDtxQkFDRSxLQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFERjthQUFBLE1BQUE7cUJBR0UsSUFBSSxDQUFDLGdCQUFMLEdBQXdCLFNBQUMsSUFBRDt1QkFDdEIsSUFBSSxDQUFDLGlCQUFMLENBQXVCLElBQXZCO2NBRHNCLEVBSDFCOztVQURxQixDQUF2QjtRQVAwQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUI7SUFaWSxDQVZkOztBQUpGIiwic291cmNlc0NvbnRlbnQiOlsiQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICBhY3RpdmF0ZTogLT5cbiAgICBAYWRkTGlzdGVuZXJzKClcblxuICBlbmFibGVUZW1wOiAocGFuZSkgLT5cbiAgICBwYW5lLnByb21wdFRvU2F2ZUl0ZW0gPSAoaXRlbSkgLT5cbiAgICAgIHNhdmUgPSBwYW5lLnByb21wdFRvU2F2ZUl0ZW0yIGl0ZW1cbiAgICAgIHBhbmUucHJvbXB0VG9TYXZlSXRlbSA9IChpdGVtKSAtPlxuICAgICAgICB0cnVlXG4gICAgICBzYXZlXG5cbiAgYWRkTGlzdGVuZXJzOiAtPlxuXG4gICAgQ29uZmlnLm9ic2VydmUgJ3NraXBTYXZlUHJvbXB0JywgKHZhbCkgLT5cbiAgICAgIGF0b20ud29ya3NwYWNlLmdldFBhbmVzKCkubWFwIChwYW5lKSAtPlxuICAgICAgICBpZiB2YWxcbiAgICAgICAgICBwYW5lLnByb21wdFRvU2F2ZUl0ZW0gPSAoaXRlbSkgLT5cbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgZWxzZSBpZiBwYW5lLnByb21wdFRvU2F2ZUl0ZW0yXG4gICAgICAgICAgcGFuZS5wcm9tcHRUb1NhdmVJdGVtID0gKGl0ZW0pIC0+XG4gICAgICAgICAgICBwYW5lLnByb21wdFRvU2F2ZUl0ZW0yIGl0ZW1cblxuXG4gICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVBhbmVzIChwYW5lKSA9PlxuICAgICAgcGFuZS5wcm9tcHRUb1NhdmVJdGVtMiA9IHBhbmUucHJvbXB0VG9TYXZlSXRlbVxuXG4gICAgICBpZiBDb25maWcuc2tpcFNhdmVQcm9tcHQoKVxuICAgICAgICBwYW5lLnByb21wdFRvU2F2ZUl0ZW0gPSAoaXRlbSkgLT5cbiAgICAgICAgICB0cnVlXG5cbiAgICAgIHBhbmUub25XaWxsRGVzdHJveUl0ZW0gKGV2ZW50KSA9PlxuICAgICAgICBpZiBDb25maWcuc2tpcFNhdmVQcm9tcHQoKVxuICAgICAgICAgIEBlbmFibGVUZW1wIHBhbmVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHBhbmUucHJvbXB0VG9TYXZlSXRlbSA9IChpdGVtKSAtPlxuICAgICAgICAgICAgcGFuZS5wcm9tcHRUb1NhdmVJdGVtMiBpdGVtXG4iXX0=
