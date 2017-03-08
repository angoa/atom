(function() {
  var OutputViewManager, emptyOrUndefined, getUpstream, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  emptyOrUndefined = function(thing) {
    return thing !== '' && thing !== void 0;
  };

  getUpstream = function(repo) {
    var branch, branchInfo, ref, remote;
    branchInfo = (ref = repo.getUpstreamBranch()) != null ? ref.substring('refs/remotes/'.length).split('/') : void 0;
    remote = branchInfo[0];
    branch = branchInfo.slice(1).join('/');
    return [remote, branch];
  };

  module.exports = function(repo, arg) {
    var args, extraArgs, startMessage, view;
    extraArgs = (arg != null ? arg : {}).extraArgs;
    if (extraArgs == null) {
      extraArgs = [];
    }
    view = OutputViewManager.create();
    startMessage = notifier.addInfo("Pulling...", {
      dismissable: true
    });
    args = ['pull'].concat(extraArgs).concat(getUpstream(repo)).filter(emptyOrUndefined);
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }, {
      color: true
    }).then(function(data) {
      view.setContent(data).finish();
      return startMessage.dismiss();
    })["catch"](function(error) {
      view.setContent(error).finish();
      return startMessage.dismiss();
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvX3B1bGwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFFcEIsZ0JBQUEsR0FBbUIsU0FBQyxLQUFEO1dBQVcsS0FBQSxLQUFXLEVBQVgsSUFBa0IsS0FBQSxLQUFXO0VBQXhDOztFQUVuQixXQUFBLEdBQWMsU0FBQyxJQUFEO0FBQ1osUUFBQTtJQUFBLFVBQUEsaURBQXFDLENBQUUsU0FBMUIsQ0FBb0MsZUFBZSxDQUFDLE1BQXBELENBQTJELENBQUMsS0FBNUQsQ0FBa0UsR0FBbEU7SUFDYixNQUFBLEdBQVMsVUFBVyxDQUFBLENBQUE7SUFDcEIsTUFBQSxHQUFTLFVBQVUsQ0FBQyxLQUFYLENBQWlCLENBQWpCLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsR0FBekI7V0FDVCxDQUFDLE1BQUQsRUFBUyxNQUFUO0VBSlk7O0VBTWQsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNmLFFBQUE7SUFEdUIsMkJBQUQsTUFBWTs7TUFDbEMsWUFBYTs7SUFDYixJQUFBLEdBQU8saUJBQWlCLENBQUMsTUFBbEIsQ0FBQTtJQUNQLFlBQUEsR0FBZSxRQUFRLENBQUMsT0FBVCxDQUFpQixZQUFqQixFQUErQjtNQUFBLFdBQUEsRUFBYSxJQUFiO0tBQS9CO0lBQ2YsSUFBQSxHQUFPLENBQUMsTUFBRCxDQUFRLENBQUMsTUFBVCxDQUFnQixTQUFoQixDQUEwQixDQUFDLE1BQTNCLENBQWtDLFdBQUEsQ0FBWSxJQUFaLENBQWxDLENBQW9ELENBQUMsTUFBckQsQ0FBNEQsZ0JBQTVEO1dBQ1AsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7TUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtLQUFkLEVBQStDO01BQUMsS0FBQSxFQUFPLElBQVI7S0FBL0MsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7TUFDSixJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixDQUFxQixDQUFDLE1BQXRCLENBQUE7YUFDQSxZQUFZLENBQUMsT0FBYixDQUFBO0lBRkksQ0FETixDQUlBLEVBQUMsS0FBRCxFQUpBLENBSU8sU0FBQyxLQUFEO01BQ0wsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBQyxNQUF2QixDQUFBO2FBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQTtJQUZLLENBSlA7RUFMZTtBQVpqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5cbmVtcHR5T3JVbmRlZmluZWQgPSAodGhpbmcpIC0+IHRoaW5nIGlzbnQgJycgYW5kIHRoaW5nIGlzbnQgdW5kZWZpbmVkXG5cbmdldFVwc3RyZWFtID0gKHJlcG8pIC0+XG4gIGJyYW5jaEluZm8gPSByZXBvLmdldFVwc3RyZWFtQnJhbmNoKCk/LnN1YnN0cmluZygncmVmcy9yZW1vdGVzLycubGVuZ3RoKS5zcGxpdCgnLycpXG4gIHJlbW90ZSA9IGJyYW5jaEluZm9bMF1cbiAgYnJhbmNoID0gYnJhbmNoSW5mby5zbGljZSgxKS5qb2luKCcvJylcbiAgW3JlbW90ZSwgYnJhbmNoXVxuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCB7ZXh0cmFBcmdzfT17fSkgLT5cbiAgZXh0cmFBcmdzID89IFtdXG4gIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKVxuICBzdGFydE1lc3NhZ2UgPSBub3RpZmllci5hZGRJbmZvIFwiUHVsbGluZy4uLlwiLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICBhcmdzID0gWydwdWxsJ10uY29uY2F0KGV4dHJhQXJncykuY29uY2F0KGdldFVwc3RyZWFtKHJlcG8pKS5maWx0ZXIoZW1wdHlPclVuZGVmaW5lZClcbiAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAudGhlbiAoZGF0YSkgLT5cbiAgICB2aWV3LnNldENvbnRlbnQoZGF0YSkuZmluaXNoKClcbiAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gIC5jYXRjaCAoZXJyb3IpIC0+XG4gICAgdmlldy5zZXRDb250ZW50KGVycm9yKS5maW5pc2goKVxuICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiJdfQ==
