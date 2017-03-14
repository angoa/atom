(function() {
  var utils;

  utils = {
    fill: function(str, length, filler) {
      if (filler == null) {
        filler = '0';
      }
      while (str.length < length) {
        str = filler + str;
      }
      return str;
    },
    strip: function(str) {
      return str.replace(/\s+/g, '');
    },
    clamp: function(n) {
      return Math.min(1, Math.max(0, n));
    },
    clampInt: function(n, max) {
      if (max == null) {
        max = 100;
      }
      return Math.min(max, Math.max(0, n));
    },
    insensitive: function(s) {
      return s.split(/(?:)/).map(function(c) {
        return "(?:" + c + "|" + (c.toUpperCase()) + ")";
      }).join('');
    },
    readFloat: function(value, vars, color) {
      var res;
      if (vars == null) {
        vars = {};
      }
      res = parseFloat(value);
      if (isNaN(res) && (vars[value] != null)) {
        color.usedVariables.push(value);
        res = parseFloat(vars[value].value);
      }
      return res;
    },
    readInt: function(value, vars, color, base) {
      var res;
      if (vars == null) {
        vars = {};
      }
      if (base == null) {
        base = 10;
      }
      res = parseInt(value, base);
      if (isNaN(res) && (vars[value] != null)) {
        color.usedVariables.push(value);
        res = parseInt(vars[value].value, base);
      }
      return res;
    },
    countLines: function(string) {
      return string.split(/\r\n|\r|\n/g).length;
    },
    readIntOrPercent: function(value, vars, color) {
      var res;
      if (vars == null) {
        vars = {};
      }
      if (!/\d+/.test(value) && (vars[value] != null)) {
        color.usedVariables.push(value);
        value = vars[value].value;
      }
      if (value == null) {
        return 0/0;
      }
      if (value.indexOf('%') !== -1) {
        res = Math.round(parseFloat(value) * 2.55);
      } else {
        res = parseInt(value);
      }
      return res;
    },
    readFloatOrPercent: function(amount, vars, color) {
      var res;
      if (vars == null) {
        vars = {};
      }
      if (!/\d+/.test(amount) && (vars[amount] != null)) {
        color.usedVariables.push(amount);
        amount = vars[amount].value;
      }
      if (amount == null) {
        return 0/0;
      }
      if (amount.indexOf('%') !== -1) {
        res = parseFloat(amount) / 100;
      } else {
        res = parseFloat(amount);
      }
      return res;
    },
    findClosingIndex: function(s, startIndex, openingChar, closingChar) {
      var curStr, index, nests;
      if (startIndex == null) {
        startIndex = 0;
      }
      if (openingChar == null) {
        openingChar = "[";
      }
      if (closingChar == null) {
        closingChar = "]";
      }
      index = startIndex;
      nests = 1;
      while (nests && index < s.length) {
        curStr = s.substr(index++, 1);
        if (curStr === closingChar) {
          nests--;
        } else if (curStr === openingChar) {
          nests++;
        }
      }
      if (nests === 0) {
        return index - 1;
      } else {
        return -1;
      }
    },
    split: function(s, sep) {
      var a, c, i, l, previousStart, start;
      if (sep == null) {
        sep = ",";
      }
      a = [];
      l = s.length;
      i = 0;
      start = 0;
      previousStart = start;
      whileLoop: //;
      while (i < l) {
        c = s.substr(i, 1);
        switch (c) {
          case "(":
            i = utils.findClosingIndex(s, i + 1, c, ")");
            if (i === -1) {
              break whileLoop;
            }
            break;
          case ")":
            break whileLoop;
            break;
          case "[":
            i = utils.findClosingIndex(s, i + 1, c, "]");
            if (i === -1) {
              break whileLoop;
            }
            break;
          case "":
            i = utils.findClosingIndex(s, i + 1, c, "");
            if (i === -1) {
              break whileLoop;
            }
            break;
          case sep:
            a.push(utils.strip(s.substr(start, i - start)));
            start = i + 1;
            if (previousStart === start) {
              break whileLoop;
            }
            previousStart = start;
        }
        i++;
      }
      a.push(utils.strip(s.substr(start, i - start)));
      return a.filter(function(s) {
        return (s != null) && s.length;
      });
    }
  };

  module.exports = utils;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi91dGlscy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBOztFQUFBLEtBQUEsR0FDRTtJQUFBLElBQUEsRUFBTSxTQUFDLEdBQUQsRUFBTSxNQUFOLEVBQWMsTUFBZDs7UUFBYyxTQUFPOztBQUNOLGFBQU0sR0FBRyxDQUFDLE1BQUosR0FBYSxNQUFuQjtRQUFuQixHQUFBLEdBQU0sTUFBQSxHQUFTO01BQUk7YUFDbkI7SUFGSSxDQUFOO0lBSUEsS0FBQSxFQUFPLFNBQUMsR0FBRDthQUFTLEdBQUcsQ0FBQyxPQUFKLENBQVksTUFBWixFQUFvQixFQUFwQjtJQUFULENBSlA7SUFNQSxLQUFBLEVBQU8sU0FBQyxDQUFEO2FBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBWixDQUFaO0lBQVAsQ0FOUDtJQVFBLFFBQUEsRUFBVSxTQUFDLENBQUQsRUFBSSxHQUFKOztRQUFJLE1BQUk7O2FBQVEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxHQUFULEVBQWMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBWixDQUFkO0lBQWhCLENBUlY7SUFVQSxXQUFBLEVBQWEsU0FBQyxDQUFEO2FBQ1gsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxNQUFSLENBQWUsQ0FBQyxHQUFoQixDQUFvQixTQUFDLENBQUQ7ZUFBTyxLQUFBLEdBQU0sQ0FBTixHQUFRLEdBQVIsR0FBVSxDQUFDLENBQUMsQ0FBQyxXQUFGLENBQUEsQ0FBRCxDQUFWLEdBQTJCO01BQWxDLENBQXBCLENBQXlELENBQUMsSUFBMUQsQ0FBK0QsRUFBL0Q7SUFEVyxDQVZiO0lBYUEsU0FBQSxFQUFXLFNBQUMsS0FBRCxFQUFRLElBQVIsRUFBaUIsS0FBakI7QUFDVCxVQUFBOztRQURpQixPQUFLOztNQUN0QixHQUFBLEdBQU0sVUFBQSxDQUFXLEtBQVg7TUFDTixJQUFHLEtBQUEsQ0FBTSxHQUFOLENBQUEsSUFBZSxxQkFBbEI7UUFDRSxLQUFLLENBQUMsYUFBYSxDQUFDLElBQXBCLENBQXlCLEtBQXpCO1FBQ0EsR0FBQSxHQUFNLFVBQUEsQ0FBVyxJQUFLLENBQUEsS0FBQSxDQUFNLENBQUMsS0FBdkIsRUFGUjs7YUFHQTtJQUxTLENBYlg7SUFvQkEsT0FBQSxFQUFTLFNBQUMsS0FBRCxFQUFRLElBQVIsRUFBaUIsS0FBakIsRUFBd0IsSUFBeEI7QUFDUCxVQUFBOztRQURlLE9BQUs7OztRQUFXLE9BQUs7O01BQ3BDLEdBQUEsR0FBTSxRQUFBLENBQVMsS0FBVCxFQUFnQixJQUFoQjtNQUNOLElBQUcsS0FBQSxDQUFNLEdBQU4sQ0FBQSxJQUFlLHFCQUFsQjtRQUNFLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBcEIsQ0FBeUIsS0FBekI7UUFDQSxHQUFBLEdBQU0sUUFBQSxDQUFTLElBQUssQ0FBQSxLQUFBLENBQU0sQ0FBQyxLQUFyQixFQUE0QixJQUE1QixFQUZSOzthQUdBO0lBTE8sQ0FwQlQ7SUEyQkEsVUFBQSxFQUFZLFNBQUMsTUFBRDthQUFZLE1BQU0sQ0FBQyxLQUFQLENBQWEsYUFBYixDQUEyQixDQUFDO0lBQXhDLENBM0JaO0lBNkJBLGdCQUFBLEVBQWtCLFNBQUMsS0FBRCxFQUFRLElBQVIsRUFBaUIsS0FBakI7QUFDaEIsVUFBQTs7UUFEd0IsT0FBSzs7TUFDN0IsSUFBRyxDQUFJLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBWCxDQUFKLElBQTBCLHFCQUE3QjtRQUNFLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBcEIsQ0FBeUIsS0FBekI7UUFDQSxLQUFBLEdBQVEsSUFBSyxDQUFBLEtBQUEsQ0FBTSxDQUFDLE1BRnRCOztNQUlBLElBQWtCLGFBQWxCO0FBQUEsZUFBTyxJQUFQOztNQUVBLElBQUcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLENBQUEsS0FBd0IsQ0FBQyxDQUE1QjtRQUNFLEdBQUEsR0FBTSxJQUFJLENBQUMsS0FBTCxDQUFXLFVBQUEsQ0FBVyxLQUFYLENBQUEsR0FBb0IsSUFBL0IsRUFEUjtPQUFBLE1BQUE7UUFHRSxHQUFBLEdBQU0sUUFBQSxDQUFTLEtBQVQsRUFIUjs7YUFLQTtJQVpnQixDQTdCbEI7SUEyQ0Esa0JBQUEsRUFBb0IsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFrQixLQUFsQjtBQUNsQixVQUFBOztRQUQyQixPQUFLOztNQUNoQyxJQUFHLENBQUksS0FBSyxDQUFDLElBQU4sQ0FBVyxNQUFYLENBQUosSUFBMkIsc0JBQTlCO1FBQ0UsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFwQixDQUF5QixNQUF6QjtRQUNBLE1BQUEsR0FBUyxJQUFLLENBQUEsTUFBQSxDQUFPLENBQUMsTUFGeEI7O01BSUEsSUFBa0IsY0FBbEI7QUFBQSxlQUFPLElBQVA7O01BRUEsSUFBRyxNQUFNLENBQUMsT0FBUCxDQUFlLEdBQWYsQ0FBQSxLQUF5QixDQUFDLENBQTdCO1FBQ0UsR0FBQSxHQUFNLFVBQUEsQ0FBVyxNQUFYLENBQUEsR0FBcUIsSUFEN0I7T0FBQSxNQUFBO1FBR0UsR0FBQSxHQUFNLFVBQUEsQ0FBVyxNQUFYLEVBSFI7O2FBS0E7SUFaa0IsQ0EzQ3BCO0lBeURBLGdCQUFBLEVBQWtCLFNBQUMsQ0FBRCxFQUFJLFVBQUosRUFBa0IsV0FBbEIsRUFBbUMsV0FBbkM7QUFDaEIsVUFBQTs7UUFEb0IsYUFBVzs7O1FBQUcsY0FBWTs7O1FBQUssY0FBWTs7TUFDL0QsS0FBQSxHQUFRO01BQ1IsS0FBQSxHQUFRO0FBRVIsYUFBTSxLQUFBLElBQVUsS0FBQSxHQUFRLENBQUMsQ0FBQyxNQUExQjtRQUNFLE1BQUEsR0FBUyxDQUFDLENBQUMsTUFBRixDQUFTLEtBQUEsRUFBVCxFQUFrQixDQUFsQjtRQUVULElBQUcsTUFBQSxLQUFVLFdBQWI7VUFDRSxLQUFBLEdBREY7U0FBQSxNQUVLLElBQUcsTUFBQSxLQUFVLFdBQWI7VUFDSCxLQUFBLEdBREc7O01BTFA7TUFRQSxJQUFHLEtBQUEsS0FBUyxDQUFaO2VBQW1CLEtBQUEsR0FBUSxFQUEzQjtPQUFBLE1BQUE7ZUFBa0MsQ0FBQyxFQUFuQzs7SUFaZ0IsQ0F6RGxCO0lBdUVBLEtBQUEsRUFBTyxTQUFDLENBQUQsRUFBSSxHQUFKO0FBQ0wsVUFBQTs7UUFEUyxNQUFJOztNQUNiLENBQUEsR0FBSTtNQUNKLENBQUEsR0FBSSxDQUFDLENBQUM7TUFDTixDQUFBLEdBQUk7TUFDSixLQUFBLEdBQVE7TUFDUixhQUFBLEdBQWdCO01BQ2hCO0FBQ0EsYUFBTSxDQUFBLEdBQUksQ0FBVjtRQUNFLENBQUEsR0FBSSxDQUFDLENBQUMsTUFBRixDQUFTLENBQVQsRUFBWSxDQUFaO0FBRUosZ0JBQU8sQ0FBUDtBQUFBLGVBQ08sR0FEUDtZQUVJLENBQUEsR0FBSSxLQUFLLENBQUMsZ0JBQU4sQ0FBdUIsQ0FBdkIsRUFBMEIsQ0FBQSxHQUFJLENBQTlCLEVBQWlDLENBQWpDLEVBQW9DLEdBQXBDO1lBQ0osSUFBcUIsQ0FBQSxLQUFLLENBQUMsQ0FBM0I7Y0FBQSxnQkFBQTs7QUFGRztBQURQLGVBT08sR0FQUDtZQVFJO0FBREc7QUFQUCxlQVNPLEdBVFA7WUFVSSxDQUFBLEdBQUksS0FBSyxDQUFDLGdCQUFOLENBQXVCLENBQXZCLEVBQTBCLENBQUEsR0FBSSxDQUE5QixFQUFpQyxDQUFqQyxFQUFvQyxHQUFwQztZQUNKLElBQXFCLENBQUEsS0FBSyxDQUFDLENBQTNCO2NBQUEsZ0JBQUE7O0FBRkc7QUFUUCxlQVlPLEVBWlA7WUFhSSxDQUFBLEdBQUksS0FBSyxDQUFDLGdCQUFOLENBQXVCLENBQXZCLEVBQTBCLENBQUEsR0FBSSxDQUE5QixFQUFpQyxDQUFqQyxFQUFvQyxFQUFwQztZQUNKLElBQXFCLENBQUEsS0FBSyxDQUFDLENBQTNCO2NBQUEsZ0JBQUE7O0FBRkc7QUFaUCxlQWVPLEdBZlA7WUFnQkksQ0FBQyxDQUFDLElBQUYsQ0FBTyxLQUFLLENBQUMsS0FBTixDQUFZLENBQUMsQ0FBQyxNQUFGLENBQVMsS0FBVCxFQUFnQixDQUFBLEdBQUksS0FBcEIsQ0FBWixDQUFQO1lBQ0EsS0FBQSxHQUFRLENBQUEsR0FBSTtZQUNaLElBQXFCLGFBQUEsS0FBaUIsS0FBdEM7Y0FBQSxnQkFBQTs7WUFDQSxhQUFBLEdBQWdCO0FBbkJwQjtRQXFCQSxDQUFBO01BeEJGO01BMEJBLENBQUMsQ0FBQyxJQUFGLENBQU8sS0FBSyxDQUFDLEtBQU4sQ0FBWSxDQUFDLENBQUMsTUFBRixDQUFTLEtBQVQsRUFBZ0IsQ0FBQSxHQUFJLEtBQXBCLENBQVosQ0FBUDthQUNBLENBQUMsQ0FBQyxNQUFGLENBQVMsU0FBQyxDQUFEO2VBQU8sV0FBQSxJQUFPLENBQUMsQ0FBQztNQUFoQixDQUFUO0lBbENLLENBdkVQOzs7RUE0R0YsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE3R2pCIiwic291cmNlc0NvbnRlbnQiOlsiXG51dGlscyA9XG4gIGZpbGw6IChzdHIsIGxlbmd0aCwgZmlsbGVyPScwJykgLT5cbiAgICBzdHIgPSBmaWxsZXIgKyBzdHIgd2hpbGUgc3RyLmxlbmd0aCA8IGxlbmd0aFxuICAgIHN0clxuXG4gIHN0cmlwOiAoc3RyKSAtPiBzdHIucmVwbGFjZSgvXFxzKy9nLCAnJylcblxuICBjbGFtcDogKG4pIC0+IE1hdGgubWluKDEsIE1hdGgubWF4KDAsIG4pKVxuXG4gIGNsYW1wSW50OiAobiwgbWF4PTEwMCkgLT4gTWF0aC5taW4obWF4LCBNYXRoLm1heCgwLCBuKSlcblxuICBpbnNlbnNpdGl2ZTogKHMpIC0+XG4gICAgcy5zcGxpdCgvKD86KS8pLm1hcCgoYykgLT4gXCIoPzoje2N9fCN7Yy50b1VwcGVyQ2FzZSgpfSlcIikuam9pbignJylcblxuICByZWFkRmxvYXQ6ICh2YWx1ZSwgdmFycz17fSwgY29sb3IpIC0+XG4gICAgcmVzID0gcGFyc2VGbG9hdCh2YWx1ZSlcbiAgICBpZiBpc05hTihyZXMpIGFuZCB2YXJzW3ZhbHVlXT9cbiAgICAgIGNvbG9yLnVzZWRWYXJpYWJsZXMucHVzaCh2YWx1ZSlcbiAgICAgIHJlcyA9IHBhcnNlRmxvYXQodmFyc1t2YWx1ZV0udmFsdWUpXG4gICAgcmVzXG5cbiAgcmVhZEludDogKHZhbHVlLCB2YXJzPXt9LCBjb2xvciwgYmFzZT0xMCkgLT5cbiAgICByZXMgPSBwYXJzZUludCh2YWx1ZSwgYmFzZSlcbiAgICBpZiBpc05hTihyZXMpIGFuZCB2YXJzW3ZhbHVlXT9cbiAgICAgIGNvbG9yLnVzZWRWYXJpYWJsZXMucHVzaCh2YWx1ZSlcbiAgICAgIHJlcyA9IHBhcnNlSW50KHZhcnNbdmFsdWVdLnZhbHVlLCBiYXNlKVxuICAgIHJlc1xuXG4gIGNvdW50TGluZXM6IChzdHJpbmcpIC0+IHN0cmluZy5zcGxpdCgvXFxyXFxufFxccnxcXG4vZykubGVuZ3RoXG5cbiAgcmVhZEludE9yUGVyY2VudDogKHZhbHVlLCB2YXJzPXt9LCBjb2xvcikgLT5cbiAgICBpZiBub3QgL1xcZCsvLnRlc3QodmFsdWUpIGFuZCB2YXJzW3ZhbHVlXT9cbiAgICAgIGNvbG9yLnVzZWRWYXJpYWJsZXMucHVzaCh2YWx1ZSlcbiAgICAgIHZhbHVlID0gdmFyc1t2YWx1ZV0udmFsdWVcblxuICAgIHJldHVybiBOYU4gdW5sZXNzIHZhbHVlP1xuXG4gICAgaWYgdmFsdWUuaW5kZXhPZignJScpIGlzbnQgLTFcbiAgICAgIHJlcyA9IE1hdGgucm91bmQocGFyc2VGbG9hdCh2YWx1ZSkgKiAyLjU1KVxuICAgIGVsc2VcbiAgICAgIHJlcyA9IHBhcnNlSW50KHZhbHVlKVxuXG4gICAgcmVzXG5cbiAgcmVhZEZsb2F0T3JQZXJjZW50OiAoYW1vdW50LCB2YXJzPXt9LCBjb2xvcikgLT5cbiAgICBpZiBub3QgL1xcZCsvLnRlc3QoYW1vdW50KSBhbmQgdmFyc1thbW91bnRdP1xuICAgICAgY29sb3IudXNlZFZhcmlhYmxlcy5wdXNoKGFtb3VudClcbiAgICAgIGFtb3VudCA9IHZhcnNbYW1vdW50XS52YWx1ZVxuXG4gICAgcmV0dXJuIE5hTiB1bmxlc3MgYW1vdW50P1xuXG4gICAgaWYgYW1vdW50LmluZGV4T2YoJyUnKSBpc250IC0xXG4gICAgICByZXMgPSBwYXJzZUZsb2F0KGFtb3VudCkgLyAxMDBcbiAgICBlbHNlXG4gICAgICByZXMgPSBwYXJzZUZsb2F0KGFtb3VudClcblxuICAgIHJlc1xuXG4gIGZpbmRDbG9zaW5nSW5kZXg6IChzLCBzdGFydEluZGV4PTAsIG9wZW5pbmdDaGFyPVwiW1wiLCBjbG9zaW5nQ2hhcj1cIl1cIikgLT5cbiAgICBpbmRleCA9IHN0YXJ0SW5kZXhcbiAgICBuZXN0cyA9IDFcblxuICAgIHdoaWxlIG5lc3RzIGFuZCBpbmRleCA8IHMubGVuZ3RoXG4gICAgICBjdXJTdHIgPSBzLnN1YnN0ciBpbmRleCsrLCAxXG5cbiAgICAgIGlmIGN1clN0ciBpcyBjbG9zaW5nQ2hhclxuICAgICAgICBuZXN0cy0tXG4gICAgICBlbHNlIGlmIGN1clN0ciBpcyBvcGVuaW5nQ2hhclxuICAgICAgICBuZXN0cysrXG5cbiAgICBpZiBuZXN0cyBpcyAwIHRoZW4gaW5kZXggLSAxIGVsc2UgLTFcblxuICBzcGxpdDogKHMsIHNlcD1cIixcIikgLT5cbiAgICBhID0gW11cbiAgICBsID0gcy5sZW5ndGhcbiAgICBpID0gMFxuICAgIHN0YXJ0ID0gMFxuICAgIHByZXZpb3VzU3RhcnQgPSBzdGFydFxuICAgIGB3aGlsZUxvb3A6IC8vYFxuICAgIHdoaWxlIGkgPCBsXG4gICAgICBjID0gcy5zdWJzdHIoaSwgMSlcblxuICAgICAgc3dpdGNoKGMpXG4gICAgICAgIHdoZW4gXCIoXCJcbiAgICAgICAgICBpID0gdXRpbHMuZmluZENsb3NpbmdJbmRleCBzLCBpICsgMSwgYywgXCIpXCJcbiAgICAgICAgICBgYnJlYWsgd2hpbGVMb29wYCBpZiBpIGlzIC0xXG4gICAgICAgICMgQSBwYXJzZXIgcmVnZXhwIHdpbGwgZW5kIHdpdGggdGhlIGxhc3QgKSwgc28gc2VxdWVuY2VzIGxpa2UgKC4uLikoLi4uKVxuICAgICAgICAjIHdpbGwgZW5kIGFmdGVyIHRoZSBzZWNvbmQgcGFyZW50aGVzaXMgcGFpciwgYnkgbWF0aGluZyApIHdlIHByZXZlbnRcbiAgICAgICAgIyBhbiBpbmZpbml0ZSBsb29wIHdoZW4gc3BsaXR0aW5nIHRoZSBzdHJpbmcuXG4gICAgICAgIHdoZW4gXCIpXCJcbiAgICAgICAgICBgYnJlYWsgd2hpbGVMb29wYFxuICAgICAgICB3aGVuIFwiW1wiXG4gICAgICAgICAgaSA9IHV0aWxzLmZpbmRDbG9zaW5nSW5kZXggcywgaSArIDEsIGMsIFwiXVwiXG4gICAgICAgICAgYGJyZWFrIHdoaWxlTG9vcGAgaWYgaSBpcyAtMVxuICAgICAgICB3aGVuIFwiXCJcbiAgICAgICAgICBpID0gdXRpbHMuZmluZENsb3NpbmdJbmRleCBzLCBpICsgMSwgYywgXCJcIlxuICAgICAgICAgIGBicmVhayB3aGlsZUxvb3BgIGlmIGkgaXMgLTFcbiAgICAgICAgd2hlbiBzZXBcbiAgICAgICAgICBhLnB1c2ggdXRpbHMuc3RyaXAgcy5zdWJzdHIgc3RhcnQsIGkgLSBzdGFydFxuICAgICAgICAgIHN0YXJ0ID0gaSArIDFcbiAgICAgICAgICBgYnJlYWsgd2hpbGVMb29wYCBpZiBwcmV2aW91c1N0YXJ0IGlzIHN0YXJ0XG4gICAgICAgICAgcHJldmlvdXNTdGFydCA9IHN0YXJ0XG5cbiAgICAgIGkrK1xuXG4gICAgYS5wdXNoIHV0aWxzLnN0cmlwIHMuc3Vic3RyIHN0YXJ0LCBpIC0gc3RhcnRcbiAgICBhLmZpbHRlciAocykgLT4gcz8gYW5kIHMubGVuZ3RoXG5cblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsc1xuIl19
