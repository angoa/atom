(function() {
  var $, Config, Fs, Mkdirp;

  $ = require('atom-space-pen-views').$;

  Fs = require('fs');

  Mkdirp = require('mkdirp');

  Config = require('./config');

  module.exports = {
    activate: function(buffers) {
      var saveFilePath;
      saveFilePath = Config.saveFile();
      Fs.exists(saveFilePath, (function(_this) {
        return function(exists) {
          if (exists) {
            return Fs.readFile(saveFilePath, {
              encoding: 'utf8'
            }, function(err, str) {
              buffers = JSON.parse(str);
              if (Config.restoreOpenFileContents()) {
                return _this.restore(buffers);
              }
            });
          }
        };
      })(this));
      return this.addListeners();
    },
    save: function() {
      var buffers, file, folder;
      buffers = [];
      atom.workspace.getTextEditors().map((function(_this) {
        return function(editor) {
          var buffer;
          buffer = {};
          if (editor.getBuffer().isModified()) {
            buffer.text = editor.getBuffer().cachedText;
            buffer.diskText = Config.hashMyStr(editor.getBuffer().cachedDiskContents);
          }
          buffer.path = editor.getPath();
          return buffers.push(buffer);
        };
      })(this));
      file = Config.saveFile();
      folder = file.substring(0, file.lastIndexOf(Config.pathSeparator()));
      return Mkdirp(folder, (function(_this) {
        return function(err) {
          return Fs.writeFile(file, JSON.stringify(buffers));
        };
      })(this));
    },
    restore: function(buffers) {
      var buffer, i, len, results;
      results = [];
      for (i = 0, len = buffers.length; i < len; i++) {
        buffer = buffers[i];
        results.push(this.restoreText(buffer));
      }
      return results;
    },
    restoreText: function(buffer) {
      var buf, editors;
      if (buffer.path === void 0) {
        editors = atom.workspace.getTextEditors().filter((function(_this) {
          return function(editor) {
            return editor.buffer.file === null && editor.buffer.cachedText === '';
          };
        })(this));
        if (editors.length > 0) {
          buf = editors[0].getBuffer();
        }
      } else {
        editors = atom.workspace.getTextEditors().filter((function(_this) {
          return function(editor) {
            var ref;
            return ((ref = editor.buffer.file) != null ? ref.path : void 0) === buffer.path;
          };
        })(this));
        if (editors.length > 0) {
          buf = editors[0].getBuffer();
        }
      }
      if (Config.restoreOpenFileContents() && (buffer.text != null) && (buf != null) && buf.getText() !== buffer.text && Config.hashMyStr(buf.cachedDiskContents) === buffer.diskText) {
        return buf.setText(buffer.text);
      }
    },
    addListeners: function() {
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          editor.onDidStopChanging(function() {
            return setTimeout((function() {
              return _this.save();
            }), Config.extraDelay());
          });
          return editor.onDidSave(function() {
            return _this.save();
          });
        };
      })(this));
      return window.onbeforeunload = (function(_this) {
        return function() {
          return _this.save();
        };
      })(this);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3NhdmUtc2Vzc2lvbi9saWIvZmlsZXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxJQUFLLE9BQUEsQ0FBUSxzQkFBUjs7RUFDTixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUVFO0lBQUEsUUFBQSxFQUFVLFNBQUMsT0FBRDtBQUNSLFVBQUE7TUFBQSxZQUFBLEdBQWUsTUFBTSxDQUFDLFFBQVAsQ0FBQTtNQUVmLEVBQUUsQ0FBQyxNQUFILENBQVUsWUFBVixFQUF3QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtVQUN0QixJQUFHLE1BQUg7bUJBQ0UsRUFBRSxDQUFDLFFBQUgsQ0FBWSxZQUFaLEVBQTBCO2NBQUEsUUFBQSxFQUFVLE1BQVY7YUFBMUIsRUFBNEMsU0FBQyxHQUFELEVBQU0sR0FBTjtjQUMxQyxPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYO2NBQ1YsSUFBRyxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFIO3VCQUNFLEtBQUMsQ0FBQSxPQUFELENBQVMsT0FBVCxFQURGOztZQUYwQyxDQUE1QyxFQURGOztRQURzQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7YUFPQSxJQUFDLENBQUEsWUFBRCxDQUFBO0lBVlEsQ0FBVjtJQVlBLElBQUEsRUFBTSxTQUFBO0FBQ0osVUFBQTtNQUFBLE9BQUEsR0FBVTtNQUVWLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBZixDQUFBLENBQStCLENBQUMsR0FBaEMsQ0FBb0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7QUFDbEMsY0FBQTtVQUFBLE1BQUEsR0FBUztV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QSxJQUFELENBQUE7WUFBRixDQUFELENBQVgsRUFBd0IsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUF4QjtVQUR1QixDQUF6QjtpQkFFQSxNQUFNLENBQUMsU0FBUCxDQUFpQixTQUFBO21CQUNmLEtBQUMsQ0FBQSxJQUFELENBQUE7VUFEZSxDQUFqQjtRQUhnQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEM7YUFNQSxNQUFNLENBQUMsY0FBUCxHQUF3QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3RCLEtBQUMsQ0FBQSxJQUFELENBQUE7UUFEc0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBUlosQ0F2RGQ7O0FBUEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7JH0gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbkZzID0gcmVxdWlyZSAnZnMnXG5Na2RpcnAgPSByZXF1aXJlICdta2RpcnAnXG5Db25maWcgPSByZXF1aXJlICcuL2NvbmZpZydcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gIGFjdGl2YXRlOiAoYnVmZmVycykgLT5cbiAgICBzYXZlRmlsZVBhdGggPSBDb25maWcuc2F2ZUZpbGUoKVxuXG4gICAgRnMuZXhpc3RzIHNhdmVGaWxlUGF0aCwgKGV4aXN0cykgPT5cbiAgICAgIGlmIGV4aXN0c1xuICAgICAgICBGcy5yZWFkRmlsZSBzYXZlRmlsZVBhdGgsIGVuY29kaW5nOiAndXRmOCcsIChlcnIsIHN0cikgPT5cbiAgICAgICAgICBidWZmZXJzID0gSlNPTi5wYXJzZShzdHIpXG4gICAgICAgICAgaWYgQ29uZmlnLnJlc3RvcmVPcGVuRmlsZUNvbnRlbnRzKClcbiAgICAgICAgICAgIEByZXN0b3JlIGJ1ZmZlcnNcblxuICAgIEBhZGRMaXN0ZW5lcnMoKVxuXG4gIHNhdmU6IC0+XG4gICAgYnVmZmVycyA9IFtdXG5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpLm1hcCAoZWRpdG9yKSA9PlxuICAgICAgYnVmZmVyID0ge31cbiAgICAgIGlmIGVkaXRvci5nZXRCdWZmZXIoKS5pc01vZGlmaWVkKClcbiAgICAgICAgYnVmZmVyLnRleHQgPSBlZGl0b3IuZ2V0QnVmZmVyKCkuY2FjaGVkVGV4dFxuICAgICAgICBidWZmZXIuZGlza1RleHQgPSBDb25maWcuaGFzaE15U3RyKGVkaXRvci5nZXRCdWZmZXIoKS5jYWNoZWREaXNrQ29udGVudHMpXG4gICAgICBidWZmZXIucGF0aCA9IGVkaXRvci5nZXRQYXRoKClcblxuICAgICAgYnVmZmVycy5wdXNoIGJ1ZmZlclxuXG4gICAgZmlsZSA9IENvbmZpZy5zYXZlRmlsZSgpXG4gICAgZm9sZGVyID0gZmlsZS5zdWJzdHJpbmcoMCwgZmlsZS5sYXN0SW5kZXhPZihDb25maWcucGF0aFNlcGFyYXRvcigpKSlcbiAgICBNa2RpcnAgZm9sZGVyLCAoZXJyKSA9PlxuICAgICBGcy53cml0ZUZpbGUoZmlsZSwgSlNPTi5zdHJpbmdpZnkoYnVmZmVycykpXG5cblxuICByZXN0b3JlOiAoYnVmZmVycykgLT5cbiAgICBmb3IgYnVmZmVyIGluIGJ1ZmZlcnNcbiAgICAgIEByZXN0b3JlVGV4dChidWZmZXIpXG5cblxuICByZXN0b3JlVGV4dDogKGJ1ZmZlcikgLT5cbiAgICBpZiBidWZmZXIucGF0aCA9PSB1bmRlZmluZWRcbiAgICAgIGVkaXRvcnMgPSBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpLmZpbHRlciAoZWRpdG9yKSA9PlxuICAgICAgICBlZGl0b3IuYnVmZmVyLmZpbGUgPT0gbnVsbCBhbmQgZWRpdG9yLmJ1ZmZlci5jYWNoZWRUZXh0ID09ICcnXG5cbiAgICAgIGlmIGVkaXRvcnMubGVuZ3RoID4gMFxuICAgICAgICBidWYgPSBlZGl0b3JzWzBdLmdldEJ1ZmZlcigpXG5cbiAgICBlbHNlXG4gICAgICBlZGl0b3JzID0gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5maWx0ZXIgKGVkaXRvcikgPT5cbiAgICAgICAgZWRpdG9yLmJ1ZmZlci5maWxlPy5wYXRoID09IGJ1ZmZlci5wYXRoXG5cbiAgICAgIGlmIGVkaXRvcnMubGVuZ3RoID4gMFxuICAgICAgICBidWYgPSBlZGl0b3JzWzBdLmdldEJ1ZmZlcigpXG5cbiAgICAjIFJlcGxhY2UgdGhlIHRleHQgaWYgbmVlZGVkXG4gICAgaWYgQ29uZmlnLnJlc3RvcmVPcGVuRmlsZUNvbnRlbnRzKCkgYW5kIGJ1ZmZlci50ZXh0PyBhbmQgYnVmPyBhbmRcbiAgICAgIGJ1Zi5nZXRUZXh0KCkgaXNudCBidWZmZXIudGV4dCBhbmQgQ29uZmlnLmhhc2hNeVN0cihidWYuY2FjaGVkRGlza0NvbnRlbnRzKSBpcyBidWZmZXIuZGlza1RleHRcbiAgICAgICAgYnVmLnNldFRleHQoYnVmZmVyLnRleHQpXG5cbiAgYWRkTGlzdGVuZXJzOiAtPlxuICAgICMgV2hlbiBmaWxlcyBhcmUgZWRpdGVkXG4gICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICBlZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcgPT5cbiAgICAgICAgc2V0VGltZW91dCAoPT5Ac2F2ZSgpKSwgQ29uZmlnLmV4dHJhRGVsYXkoKVxuICAgICAgZWRpdG9yLm9uRGlkU2F2ZSA9PlxuICAgICAgICBAc2F2ZSgpXG5cbiAgICB3aW5kb3cub25iZWZvcmV1bmxvYWQgPSAoKSA9PlxuICAgICAgQHNhdmUoKVxuIl19
