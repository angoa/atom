(function() {
  var BLOCKQUOTE_REGEX, LIST_AL_REGEX, LIST_AL_TASK_REGEX, LIST_OL_REGEX, LIST_OL_TASK_REGEX, LIST_UL_REGEX, LIST_UL_TASK_REGEX, LineMeta, TYPES, incStr, utils;

  utils = require("../utils");

  LIST_UL_TASK_REGEX = /^(\s*)([*+-\.])\s+\[[xX ]\]\s*(.*)$/;

  LIST_UL_REGEX = /^(\s*)([*+-\.])\s+(.*)$/;

  LIST_OL_TASK_REGEX = /^(\s*)(\d+)\.\s+\[[xX ]\]\s*(.*)$/;

  LIST_OL_REGEX = /^(\s*)(\d+)\.\s+(.*)$/;

  LIST_AL_TASK_REGEX = /^(\s*)([a-zA-Z]+)\.\s+\[[xX ]\]\s*(.*)$/;

  LIST_AL_REGEX = /^(\s*)([a-zA-Z]+)\.\s+(.*)$/;

  BLOCKQUOTE_REGEX = /^(\s*)(>)\s*(.*)$/;

  incStr = function(str) {
    var num;
    num = parseInt(str, 10);
    if (isNaN(num)) {
      return utils.incrementChars(str);
    } else {
      return num + 1;
    }
  };

  TYPES = [
    {
      name: ["list", "ul", "task"],
      regex: LIST_UL_TASK_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + matches[2] + " [ ] ";
      },
      defaultHead: function(head) {
        return head;
      }
    }, {
      name: ["list", "ul"],
      regex: LIST_UL_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + matches[2] + " ";
      },
      defaultHead: function(head) {
        return head;
      }
    }, {
      name: ["list", "ol", "task"],
      regex: LIST_OL_TASK_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + (incStr(matches[2])) + ". [ ] ";
      },
      defaultHead: function(head) {
        return "1";
      }
    }, {
      name: ["list", "ol"],
      regex: LIST_OL_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + (incStr(matches[2])) + ". ";
      },
      defaultHead: function(head) {
        return "1";
      }
    }, {
      name: ["list", "ol", "al", "task"],
      regex: LIST_AL_TASK_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + (incStr(matches[2])) + ". [ ] ";
      },
      defaultHead: function(head) {
        var c;
        c = utils.isUpperCase(head) ? "A" : "a";
        return head.replace(/./g, c);
      }
    }, {
      name: ["list", "ol", "al"],
      regex: LIST_AL_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + (incStr(matches[2])) + ". ";
      },
      defaultHead: function(head) {
        var c;
        c = utils.isUpperCase(head) ? "A" : "a";
        return head.replace(/./g, c);
      }
    }, {
      name: ["blockquote"],
      regex: BLOCKQUOTE_REGEX,
      nextLine: function(matches) {
        return matches[1] + "> ";
      },
      defaultHead: function(head) {
        return ">";
      }
    }
  ];

  module.exports = LineMeta = (function() {
    function LineMeta(line) {
      this.line = line;
      this.type = void 0;
      this.head = "";
      this.defaultHead = "";
      this.body = "";
      this.indent = "";
      this.nextLine = "";
      this._findMeta();
    }

    LineMeta.prototype._findMeta = function() {
      var i, len, matches, results, type;
      results = [];
      for (i = 0, len = TYPES.length; i < len; i++) {
        type = TYPES[i];
        if (matches = type.regex.exec(this.line)) {
          this.type = type;
          this.indent = matches[1];
          this.head = matches[2];
          this.defaultHead = type.defaultHead(matches[2]);
          this.body = matches[3];
          this.nextLine = type.nextLine(matches);
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    LineMeta.prototype.isTaskList = function() {
      return this.type && this.type.name.indexOf("task") !== -1;
    };

    LineMeta.prototype.isList = function(type) {
      return this.type && this.type.name.indexOf("list") !== -1 && (!type || this.type.name.indexOf(type) !== -1);
    };

    LineMeta.prototype.isContinuous = function() {
      return !!this.nextLine;
    };

    LineMeta.prototype.isEmptyBody = function() {
      return !this.body;
    };

    LineMeta.isList = function(line) {
      return LIST_UL_REGEX.test(line) || LIST_OL_REGEX.test(line) || LIST_AL_REGEX.test(line);
    };

    LineMeta.isOrderedList = function(line) {
      return LIST_OL_REGEX.test(line) || LIST_AL_REGEX.test(line);
    };

    LineMeta.isUnorderedList = function(line) {
      return LIST_UL_REGEX.test(line);
    };

    LineMeta.incStr = incStr;

    return LineMeta;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvaGVscGVycy9saW5lLW1ldGEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVI7O0VBRVIsa0JBQUEsR0FBcUI7O0VBQ3JCLGFBQUEsR0FBcUI7O0VBQ3JCLGtCQUFBLEdBQXFCOztFQUNyQixhQUFBLEdBQXFCOztFQUNyQixrQkFBQSxHQUFxQjs7RUFDckIsYUFBQSxHQUFxQjs7RUFDckIsZ0JBQUEsR0FBcUI7O0VBRXJCLE1BQUEsR0FBUyxTQUFDLEdBQUQ7QUFDUCxRQUFBO0lBQUEsR0FBQSxHQUFNLFFBQUEsQ0FBUyxHQUFULEVBQWMsRUFBZDtJQUNOLElBQUcsS0FBQSxDQUFNLEdBQU4sQ0FBSDthQUFtQixLQUFLLENBQUMsY0FBTixDQUFxQixHQUFyQixFQUFuQjtLQUFBLE1BQUE7YUFDSyxHQUFBLEdBQU0sRUFEWDs7RUFGTzs7RUFLVCxLQUFBLEdBQVE7SUFDTjtNQUNFLElBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsTUFBZixDQURSO01BRUUsS0FBQSxFQUFPLGtCQUZUO01BR0UsUUFBQSxFQUFVLFNBQUMsT0FBRDtlQUFhLEVBQUEsR0FBRyxPQUFRLENBQUEsQ0FBQSxDQUFYLEdBQWdCLE9BQVEsQ0FBQSxDQUFBLENBQXhCLEdBQTJCO01BQXhDLENBSFo7TUFJRSxXQUFBLEVBQWEsU0FBQyxJQUFEO2VBQVU7TUFBVixDQUpmO0tBRE0sRUFPTjtNQUNFLElBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxJQUFULENBRFI7TUFFRSxLQUFBLEVBQU8sYUFGVDtNQUdFLFFBQUEsRUFBVSxTQUFDLE9BQUQ7ZUFBYSxFQUFBLEdBQUcsT0FBUSxDQUFBLENBQUEsQ0FBWCxHQUFnQixPQUFRLENBQUEsQ0FBQSxDQUF4QixH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QUFtQixJQUFuQjtJQUFsRTs7SUFDVCxRQUFDLENBQUEsYUFBRCxHQUFnQixTQUFDLElBQUQ7YUFBVSxhQUFhLENBQUMsSUFBZCxDQUFtQixJQUFuQixDQUFBLElBQTRCLGFBQWEsQ0FBQyxJQUFkLENBQW1CLElBQW5CO0lBQXRDOztJQUNoQixRQUFDLENBQUEsZUFBRCxHQUFrQixTQUFDLElBQUQ7YUFBVSxhQUFhLENBQUMsSUFBZCxDQUFtQixJQUFuQjtJQUFWOztJQUNsQixRQUFDLENBQUEsTUFBRCxHQUFTOzs7OztBQW5HWCIsInNvdXJjZXNDb250ZW50IjpbInV0aWxzID0gcmVxdWlyZSBcIi4uL3V0aWxzXCJcblxuTElTVF9VTF9UQVNLX1JFR0VYID0gLy8vIF4gKFxccyopIChbKistXFwuXSkgXFxzKyBcXFtbeFhcXCBdXFxdIFxccyogKC4qKSAkIC8vL1xuTElTVF9VTF9SRUdFWCAgICAgID0gLy8vIF4gKFxccyopIChbKistXFwuXSkgXFxzKyAoLiopICQgLy8vXG5MSVNUX09MX1RBU0tfUkVHRVggPSAvLy8gXiAoXFxzKikgKFxcZCspXFwuIFxccysgXFxbW3hYXFwgXVxcXSBcXHMqICguKikgJCAvLy9cbkxJU1RfT0xfUkVHRVggICAgICA9IC8vLyBeIChcXHMqKSAoXFxkKylcXC4gXFxzKyAoLiopICQgLy8vXG5MSVNUX0FMX1RBU0tfUkVHRVggPSAvLy8gXiAoXFxzKikgKFthLXpBLVpdKylcXC4gXFxzKyBcXFtbeFhcXCBdXFxdIFxccyogKC4qKSAkIC8vL1xuTElTVF9BTF9SRUdFWCAgICAgID0gLy8vIF4gKFxccyopIChbYS16QS1aXSspXFwuIFxccysgKC4qKSAkIC8vL1xuQkxPQ0tRVU9URV9SRUdFWCAgID0gLy8vIF4gKFxccyopICg+KSAgICAgXFxzKiAoLiopICQgLy8vXG5cbmluY1N0ciA9IChzdHIpIC0+XG4gIG51bSA9IHBhcnNlSW50KHN0ciwgMTApXG4gIGlmIGlzTmFOKG51bSkgdGhlbiB1dGlscy5pbmNyZW1lbnRDaGFycyhzdHIpXG4gIGVsc2UgbnVtICsgMVxuXG5UWVBFUyA9IFtcbiAge1xuICAgIG5hbWU6IFtcImxpc3RcIiwgXCJ1bFwiLCBcInRhc2tcIl0sXG4gICAgcmVnZXg6IExJU1RfVUxfVEFTS19SRUdFWCxcbiAgICBuZXh0TGluZTogKG1hdGNoZXMpIC0+IFwiI3ttYXRjaGVzWzFdfSN7bWF0Y2hlc1syXX0gWyBdIFwiXG4gICAgZGVmYXVsdEhlYWQ6IChoZWFkKSAtPiBoZWFkXG4gIH1cbiAge1xuICAgIG5hbWU6IFtcImxpc3RcIiwgXCJ1bFwiXSxcbiAgICByZWdleDogTElTVF9VTF9SRUdFWCxcbiAgICBuZXh0TGluZTogKG1hdGNoZXMpIC0+IFwiI3ttYXRjaGVzWzFdfSN7bWF0Y2hlc1syXX0gXCJcbiAgICBkZWZhdWx0SGVhZDogKGhlYWQpIC0+IGhlYWRcbiAgfVxuICB7XG4gICAgbmFtZTogW1wibGlzdFwiLCBcIm9sXCIsIFwidGFza1wiXSxcbiAgICByZWdleDogTElTVF9PTF9UQVNLX1JFR0VYLFxuICAgIG5leHRMaW5lOiAobWF0Y2hlcykgLT4gXCIje21hdGNoZXNbMV19I3tpbmNTdHIobWF0Y2hlc1syXSl9LiBbIF0gXCJcbiAgICBkZWZhdWx0SGVhZDogKGhlYWQpIC0+IFwiMVwiXG4gIH1cbiAge1xuICAgIG5hbWU6IFtcImxpc3RcIiwgXCJvbFwiXSxcbiAgICByZWdleDogTElTVF9PTF9SRUdFWCxcbiAgICBuZXh0TGluZTogKG1hdGNoZXMpIC0+IFwiI3ttYXRjaGVzWzFdfSN7aW5jU3RyKG1hdGNoZXNbMl0pfS4gXCJcbiAgICBkZWZhdWx0SGVhZDogKGhlYWQpIC0+IFwiMVwiXG4gIH1cbiAge1xuICAgIG5hbWU6IFtcImxpc3RcIiwgXCJvbFwiLCBcImFsXCIsIFwidGFza1wiXSxcbiAgICByZWdleDogTElTVF9BTF9UQVNLX1JFR0VYLFxuICAgIG5leHRMaW5lOiAobWF0Y2hlcykgLT4gXCIje21hdGNoZXNbMV19I3tpbmNTdHIobWF0Y2hlc1syXSl9LiBbIF0gXCJcbiAgICBkZWZhdWx0SGVhZDogKGhlYWQpIC0+XG4gICAgICBjID0gaWYgdXRpbHMuaXNVcHBlckNhc2UoaGVhZCkgdGhlbiBcIkFcIiBlbHNlIFwiYVwiXG4gICAgICBoZWFkLnJlcGxhY2UoLy4vZywgYylcbiAgfVxuICB7XG4gICAgbmFtZTogW1wibGlzdFwiLCBcIm9sXCIsIFwiYWxcIl0sXG4gICAgcmVnZXg6IExJU1RfQUxfUkVHRVgsXG4gICAgbmV4dExpbmU6IChtYXRjaGVzKSAtPiBcIiN7bWF0Y2hlc1sxXX0je2luY1N0cihtYXRjaGVzWzJdKX0uIFwiXG4gICAgZGVmYXVsdEhlYWQ6IChoZWFkKSAtPlxuICAgICAgYyA9IGlmIHV0aWxzLmlzVXBwZXJDYXNlKGhlYWQpIHRoZW4gXCJBXCIgZWxzZSBcImFcIlxuICAgICAgaGVhZC5yZXBsYWNlKC8uL2csIGMpXG4gIH1cbiAge1xuICAgIG5hbWU6IFtcImJsb2NrcXVvdGVcIl0sXG4gICAgcmVnZXg6IEJMT0NLUVVPVEVfUkVHRVgsXG4gICAgbmV4dExpbmU6IChtYXRjaGVzKSAtPiBcIiN7bWF0Y2hlc1sxXX0+IFwiXG4gICAgZGVmYXVsdEhlYWQ6IChoZWFkKSAtPiBcIj5cIlxuICB9XG5dXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIExpbmVNZXRhXG4gIGNvbnN0cnVjdG9yOiAobGluZSkgLT5cbiAgICBAbGluZSA9IGxpbmVcbiAgICBAdHlwZSA9IHVuZGVmaW5lZFxuICAgIEBoZWFkID0gXCJcIlxuICAgIEBkZWZhdWx0SGVhZCA9IFwiXCJcbiAgICBAYm9keSA9IFwiXCJcbiAgICBAaW5kZW50ID0gXCJcIlxuICAgIEBuZXh0TGluZSA9IFwiXCJcblxuICAgIEBfZmluZE1ldGEoKVxuXG4gIF9maW5kTWV0YTogLT5cbiAgICBmb3IgdHlwZSBpbiBUWVBFU1xuICAgICAgaWYgbWF0Y2hlcyA9IHR5cGUucmVnZXguZXhlYyhAbGluZSlcbiAgICAgICAgQHR5cGUgPSB0eXBlXG4gICAgICAgIEBpbmRlbnQgPSBtYXRjaGVzWzFdXG4gICAgICAgIEBoZWFkID0gbWF0Y2hlc1syXVxuICAgICAgICBAZGVmYXVsdEhlYWQgPSB0eXBlLmRlZmF1bHRIZWFkKG1hdGNoZXNbMl0pXG4gICAgICAgIEBib2R5ID0gbWF0Y2hlc1szXVxuICAgICAgICBAbmV4dExpbmUgPSB0eXBlLm5leHRMaW5lKG1hdGNoZXMpXG5cbiAgICAgICAgYnJlYWtcblxuICBpc1Rhc2tMaXN0OiAtPiBAdHlwZSAmJiBAdHlwZS5uYW1lLmluZGV4T2YoXCJ0YXNrXCIpICE9IC0xXG4gIGlzTGlzdDogKHR5cGUpIC0+IEB0eXBlICYmIEB0eXBlLm5hbWUuaW5kZXhPZihcImxpc3RcIikgIT0gLTEgJiYgKCF0eXBlIHx8IEB0eXBlLm5hbWUuaW5kZXhPZih0eXBlKSAhPSAtMSlcbiAgaXNDb250aW51b3VzOiAtPiAhIUBuZXh0TGluZVxuICBpc0VtcHR5Qm9keTogLT4gIUBib2R5XG5cbiAgIyBTdGF0aWMgbWV0aG9kc1xuXG4gIEBpc0xpc3Q6IChsaW5lKSAtPiBMSVNUX1VMX1JFR0VYLnRlc3QobGluZSkgfHwgTElTVF9PTF9SRUdFWC50ZXN0KGxpbmUpIHx8IExJU1RfQUxfUkVHRVgudGVzdChsaW5lKVxuICBAaXNPcmRlcmVkTGlzdDogKGxpbmUpIC0+IExJU1RfT0xfUkVHRVgudGVzdChsaW5lKSB8fCBMSVNUX0FMX1JFR0VYLnRlc3QobGluZSlcbiAgQGlzVW5vcmRlcmVkTGlzdDogKGxpbmUpIC0+IExJU1RfVUxfUkVHRVgudGVzdChsaW5lKVxuICBAaW5jU3RyOiBpbmNTdHJcbiJdfQ==
