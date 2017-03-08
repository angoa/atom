'use babel';

var fs = require('fs-plus');
var git = require('../git');
var notifier = require('../notifier');
var BranchListView = require('../views/branch-list-view');

module.exports = function (repo) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? { remote: false } : arguments[1];

  var args = options.remote ? ['branch', '-r', '--no-color'] : ['branch', '--no-color'];
  return git.cmd(args, { cwd: repo.getWorkingDirectory() }).then(function (data) {
    return new BranchListView(data, function (_ref) {
      var name = _ref.name;

      var branch = name;
      git.cmd(['checkout'].concat(branch), { cwd: repo.getWorkingDirectory() }).then(function (message) {
        notifier.addSuccess(message);
        atom.workspace.getTextEditors().forEach(function (editor) {
          try {
            var path = editor.getPath();
            console.log('Git-plus: editor.getPath() returned \'' + path + '\'');
            if (path && path.toString) {
              fs.exists(path.toString(), function (exists) {
                if (!exists) editor.destroy();
              });
            }
          } catch (error) {
            notifier.addWarning("There was an error closing windows for non-existing files after the checkout. Please check the dev console.");
            console.info("Git-plus: please take a screenshot of what has been printed in the console and add it to the issue on github at https://github.com/akonwi/git-plus/issues/139", error);
          }
        });
        git.refresh(repo);
      })['catch'](notifier.addError);
    });
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbmdvYS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1jaGVja291dC1icmFuY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOztBQUVYLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUM3QixJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDN0IsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ3ZDLElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFBOztBQUUzRCxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQUMsSUFBSSxFQUE4QjtNQUE1QixPQUFPLHlEQUFDLEVBQUMsTUFBTSxFQUFFLEtBQUssRUFBQzs7QUFDN0MsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUE7QUFDdkYsU0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBQyxDQUFDLENBQ3RELElBQUksQ0FBQyxVQUFBLElBQUksRUFBSTtBQUNaLFdBQU8sSUFBSSxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQUMsSUFBTSxFQUFLO1VBQVYsSUFBSSxHQUFMLElBQU0sQ0FBTCxJQUFJOztBQUNwQyxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDbkIsU0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBQyxDQUFDLENBQ3RFLElBQUksQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUNmLGdCQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQzVCLFlBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQ2hELGNBQUk7QUFDRixnQkFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzdCLG1CQUFPLENBQUMsR0FBRyw0Q0FBeUMsSUFBSSxRQUFJLENBQUE7QUFDNUQsZ0JBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDekIsZ0JBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLFVBQUEsTUFBTSxFQUFJO0FBQUMsb0JBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFBO2VBQUMsQ0FBQyxDQUFBO2FBQ3RFO1dBQ0YsQ0FDRCxPQUFPLEtBQUssRUFBRTtBQUNaLG9CQUFRLENBQUMsVUFBVSxDQUFDLDZHQUE2RyxDQUFDLENBQUE7QUFDbEksbUJBQU8sQ0FBQyxJQUFJLENBQUMsK0pBQStKLEVBQUUsS0FBSyxDQUFDLENBQUE7V0FDckw7U0FDRixDQUFDLENBQUE7QUFDRixXQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO09BQ2xCLENBQUMsU0FDSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUMxQixDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9hbmdvYS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1jaGVja291dC1icmFuY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKVxuY29uc3QgZ2l0ID0gcmVxdWlyZSgnLi4vZ2l0JylcbmNvbnN0IG5vdGlmaWVyID0gcmVxdWlyZSgnLi4vbm90aWZpZXInKVxuY29uc3QgQnJhbmNoTGlzdFZpZXcgPSByZXF1aXJlKCcuLi92aWV3cy9icmFuY2gtbGlzdC12aWV3JylcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywgb3B0aW9ucz17cmVtb3RlOiBmYWxzZX0pID0+IHtcbiAgY29uc3QgYXJncyA9IG9wdGlvbnMucmVtb3RlID8gWydicmFuY2gnLCAnLXInLCAnLS1uby1jb2xvciddIDogWydicmFuY2gnLCAnLS1uby1jb2xvciddXG4gIHJldHVybiBnaXQuY21kKGFyZ3MsIHtjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpfSlcbiAgLnRoZW4oZGF0YSA9PiB7XG4gICAgcmV0dXJuIG5ldyBCcmFuY2hMaXN0VmlldyhkYXRhLCAoe25hbWV9KSA9PiB7XG4gICAgICBjb25zdCBicmFuY2ggPSBuYW1lXG4gICAgICBnaXQuY21kKFsnY2hlY2tvdXQnXS5jb25jYXQoYnJhbmNoKSwge2N3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCl9KVxuICAgICAgLnRoZW4obWVzc2FnZSA9PiB7XG4gICAgICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MobWVzc2FnZSlcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5mb3JFYWNoKGVkaXRvciA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgR2l0LXBsdXM6IGVkaXRvci5nZXRQYXRoKCkgcmV0dXJuZWQgJyR7cGF0aH0nYClcbiAgICAgICAgICAgIGlmIChwYXRoICYmIHBhdGgudG9TdHJpbmcpIHtcbiAgICAgICAgICAgICAgZnMuZXhpc3RzKHBhdGgudG9TdHJpbmcoKSwgZXhpc3RzID0+IHtpZiAoIWV4aXN0cykgZWRpdG9yLmRlc3Ryb3koKX0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbm90aWZpZXIuYWRkV2FybmluZyhcIlRoZXJlIHdhcyBhbiBlcnJvciBjbG9zaW5nIHdpbmRvd3MgZm9yIG5vbi1leGlzdGluZyBmaWxlcyBhZnRlciB0aGUgY2hlY2tvdXQuIFBsZWFzZSBjaGVjayB0aGUgZGV2IGNvbnNvbGUuXCIpXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oXCJHaXQtcGx1czogcGxlYXNlIHRha2UgYSBzY3JlZW5zaG90IG9mIHdoYXQgaGFzIGJlZW4gcHJpbnRlZCBpbiB0aGUgY29uc29sZSBhbmQgYWRkIGl0IHRvIHRoZSBpc3N1ZSBvbiBnaXRodWIgYXQgaHR0cHM6Ly9naXRodWIuY29tL2Frb253aS9naXQtcGx1cy9pc3N1ZXMvMTM5XCIsIGVycm9yKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgZ2l0LnJlZnJlc2gocmVwbylcbiAgICAgIH0pXG4gICAgICAuY2F0Y2gobm90aWZpZXIuYWRkRXJyb3IpXG4gICAgfSlcbiAgfSlcbn1cbiJdfQ==