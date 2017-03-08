(function() {
  var getCommands, git;

  git = require('./git');

  getCommands = function() {
    var GitCheckoutAllFiles, GitCheckoutBranch, GitCheckoutFile, GitCheckoutNewBranch, GitCherryPick, GitCommit, GitCommitAmend, GitDeleteBranch, GitDiff, GitDiffAll, GitDiffBranchFiles, GitDiffBranches, GitDifftool, GitFetch, GitFetchPrune, GitInit, GitLog, GitMerge, GitOpenChangedFiles, GitPull, GitPush, GitRebase, GitRemove, GitRun, GitShow, GitStageFiles, GitStageFilesBeta, GitStageHunk, GitStashApply, GitStashDrop, GitStashPop, GitStashSave, GitStashSaveMessage, GitStatus, GitTags, GitUnstageFiles;
    GitCheckoutNewBranch = require('./models/git-checkout-new-branch');
    GitCheckoutBranch = require('./models/git-checkout-branch');
    GitDeleteBranch = require('./models/git-delete-branch');
    GitCheckoutAllFiles = require('./models/git-checkout-all-files');
    GitCheckoutFile = require('./models/git-checkout-file');
    GitCherryPick = require('./models/git-cherry-pick');
    GitCommit = require('./models/git-commit');
    GitCommitAmend = require('./models/git-commit-amend');
    GitDiff = require('./models/git-diff');
    GitDiffBranches = require('./models/git-diff-branches');
    GitDiffBranchFiles = require('./models/git-diff-branch-files');
    GitDifftool = require('./models/git-difftool');
    GitDiffAll = require('./models/git-diff-all');
    GitFetch = require('./models/git-fetch');
    GitFetchPrune = require('./models/git-fetch-prune');
    GitInit = require('./models/git-init');
    GitLog = require('./models/git-log');
    GitPull = require('./models/git-pull');
    GitPush = require('./models/git-push');
    GitRemove = require('./models/git-remove');
    GitShow = require('./models/git-show');
    GitStageFiles = require('./models/git-stage-files');
    GitStageFilesBeta = require('./models/git-stage-files-beta');
    GitStageHunk = require('./models/git-stage-hunk');
    GitStashApply = require('./models/git-stash-apply');
    GitStashDrop = require('./models/git-stash-drop');
    GitStashPop = require('./models/git-stash-pop');
    GitStashSave = require('./models/git-stash-save');
    GitStashSaveMessage = require('./models/git-stash-save-message');
    GitStatus = require('./models/git-status');
    GitTags = require('./models/git-tags');
    GitUnstageFiles = require('./models/git-unstage-files');
    GitRun = require('./models/git-run');
    GitMerge = require('./models/git-merge');
    GitRebase = require('./models/git-rebase');
    GitOpenChangedFiles = require('./models/git-open-changed-files');
    return git.getRepo().then(function(repo) {
      var commands, currentFile, ref;
      currentFile = repo.relativize((ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0);
      git.refresh(repo);
      commands = [];
      if (atom.config.get('git-plus.experimental.customCommands')) {
        commands = commands.concat(require('./service').getCustomCommands());
      }
      commands.push([
        'git-plus:add', 'Add', function() {
          return git.add(repo, {
            file: currentFile
          });
        }
      ]);
      commands.push([
        'git-plus:add-modified', 'Add Modified', function() {
          return git.add(repo, {
            update: true
          });
        }
      ]);
      commands.push([
        'git-plus:add-all', 'Add All', function() {
          return git.add(repo);
        }
      ]);
      commands.push([
        'git-plus:log', 'Log', function() {
          return GitLog(repo);
        }
      ]);
      commands.push([
        'git-plus:log-current-file', 'Log Current File', function() {
          return GitLog(repo, {
            onlyCurrentFile: true
          });
        }
      ]);
      commands.push([
        'git-plus:remove-current-file', 'Remove Current File', function() {
          return GitRemove(repo);
        }
      ]);
      commands.push([
        'git-plus:checkout-all-files', 'Checkout All Files', function() {
          return GitCheckoutAllFiles(repo);
        }
      ]);
      commands.push([
        'git-plus:checkout-current-file', 'Checkout Current File', function() {
          return GitCheckoutFile(repo, {
            file: currentFile
          });
        }
      ]);
      commands.push([
        'git-plus:commit', 'Commit', function() {
          return GitCommit(repo);
        }
      ]);
      commands.push([
        'git-plus:commit-all', 'Commit All', function() {
          return GitCommit(repo, {
            stageChanges: true
          });
        }
      ]);
      commands.push([
        'git-plus:commit-amend', 'Commit Amend', function() {
          return GitCommitAmend(repo);
        }
      ]);
      commands.push([
        'git-plus:add-and-commit', 'Add And Commit', function() {
          return git.add(repo, {
            file: currentFile
          }).then(function() {
            return GitCommit(repo);
          });
        }
      ]);
      commands.push([
        'git-plus:add-and-commit-and-push', 'Add And Commit And Push', function() {
          return git.add(repo, {
            file: currentFile
          }).then(function() {
            return GitCommit(repo, {
              andPush: true
            });
          });
        }
      ]);
      commands.push([
        'git-plus:add-all-and-commit', 'Add All And Commit', function() {
          return git.add(repo).then(function() {
            return GitCommit(repo);
          });
        }
      ]);
      commands.push([
        'git-plus:add-all-commit-and-push', 'Add All, Commit And Push', function() {
          return git.add(repo).then(function() {
            return GitCommit(repo, {
              andPush: true
            });
          });
        }
      ]);
      commands.push([
        'git-plus:commit-all-and-push', 'Commit All And Push', function() {
          return GitCommit(repo, {
            stageChanges: true,
            andPush: true
          });
        }
      ]);
      commands.push([
        'git-plus:checkout', 'Checkout', function() {
          return GitCheckoutBranch(repo);
        }
      ]);
      commands.push([
        'git-plus:checkout-remote', 'Checkout Remote', function() {
          return GitCheckoutBranch(repo, {
            remote: true
          });
        }
      ]);
      commands.push([
        'git-plus:new-branch', 'Checkout New Branch', function() {
          return GitCheckoutNewBranch(repo);
        }
      ]);
      commands.push([
        'git-plus:delete-local-branch', 'Delete Local Branch', function() {
          return GitDeleteBranch(repo);
        }
      ]);
      commands.push([
        'git-plus:delete-remote-branch', 'Delete Remote Branch', function() {
          return GitDeleteBranch(repo, {
            remote: true
          });
        }
      ]);
      commands.push([
        'git-plus:cherry-pick', 'Cherry-Pick', function() {
          return GitCherryPick(repo);
        }
      ]);
      commands.push([
        'git-plus:diff', 'Diff', function() {
          return GitDiff(repo, {
            file: currentFile
          });
        }
      ]);
      if (atom.config.get('git-plus.experimental.diffBranches')) {
        commands.push([
          'git-plus:diff-branches', 'Diff branches', function() {
            return GitDiffBranches(repo);
          }
        ]);
        commands.push([
          'git-plus:diff-branch-files', 'Diff branch files', function() {
            return GitDiffBranchFiles(repo);
          }
        ]);
      }
      commands.push([
        'git-plus:difftool', 'Difftool', function() {
          return GitDifftool(repo);
        }
      ]);
      commands.push([
        'git-plus:diff-all', 'Diff All', function() {
          return GitDiffAll(repo);
        }
      ]);
      commands.push([
        'git-plus:fetch', 'Fetch', function() {
          return GitFetch(repo);
        }
      ]);
      commands.push([
        'git-plus:fetch-prune', 'Fetch Prune', function() {
          return GitFetchPrune(repo);
        }
      ]);
      commands.push([
        'git-plus:pull', 'Pull', function() {
          return GitPull(repo);
        }
      ]);
      commands.push([
        'git-plus:push', 'Push', function() {
          return GitPush(repo);
        }
      ]);
      commands.push([
        'git-plus:push-set-upstream', 'Push -u', function() {
          return GitPush(repo, {
            setUpstream: true
          });
        }
      ]);
      commands.push([
        'git-plus:remove', 'Remove', function() {
          return GitRemove(repo, {
            showSelector: true
          });
        }
      ]);
      commands.push([
        'git-plus:reset', 'Reset HEAD', function() {
          return git.reset(repo);
        }
      ]);
      commands.push([
        'git-plus:show', 'Show', function() {
          return GitShow(repo);
        }
      ]);
      if (atom.config.get('git-plus.experimental.stageFilesBeta')) {
        commands.push([
          'git-plus:stage-files', 'Stage Files', function() {
            return GitStageFilesBeta(repo);
          }
        ]);
      } else {
        commands.push([
          'git-plus:stage-files', 'Stage Files', function() {
            return GitStageFiles(repo);
          }
        ]);
        commands.push([
          'git-plus:unstage-files', 'Unstage Files', function() {
            return GitUnstageFiles(repo);
          }
        ]);
      }
      commands.push([
        'git-plus:stage-hunk', 'Stage Hunk', function() {
          return GitStageHunk(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-save', 'Stash: Save Changes', function() {
          return GitStashSave(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-save-message', 'Stash: Save Changes With Message', function() {
          return GitStashSaveMessage(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-pop', 'Stash: Apply (Pop)', function() {
          return GitStashPop(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-apply', 'Stash: Apply (Keep)', function() {
          return GitStashApply(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-delete', 'Stash: Delete (Drop)', function() {
          return GitStashDrop(repo);
        }
      ]);
      commands.push([
        'git-plus:status', 'Status', function() {
          return GitStatus(repo);
        }
      ]);
      commands.push([
        'git-plus:tags', 'Tags', function() {
          return GitTags(repo);
        }
      ]);
      commands.push([
        'git-plus:run', 'Run', function() {
          return new GitRun(repo);
        }
      ]);
      commands.push([
        'git-plus:merge', 'Merge', function() {
          return GitMerge(repo);
        }
      ]);
      commands.push([
        'git-plus:merge-remote', 'Merge Remote', function() {
          return GitMerge(repo, {
            remote: true
          });
        }
      ]);
      commands.push([
        'git-plus:merge-no-fast-forward', 'Merge without fast-forward', function() {
          return GitMerge(repo, {
            noFastForward: true
          });
        }
      ]);
      commands.push([
        'git-plus:rebase', 'Rebase', function() {
          return GitRebase(repo);
        }
      ]);
      commands.push([
        'git-plus:git-open-changed-files', 'Open Changed Files', function() {
          return GitOpenChangedFiles(repo);
        }
      ]);
      return commands;
    });
  };

  module.exports = getCommands;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9naXQtcGx1cy1jb21tYW5kcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUjs7RUFFTixXQUFBLEdBQWMsU0FBQTtBQUNaLFFBQUE7SUFBQSxvQkFBQSxHQUF5QixPQUFBLENBQVEsa0NBQVI7SUFDekIsaUJBQUEsR0FBeUIsT0FBQSxDQUFRLDhCQUFSO0lBQ3pCLGVBQUEsR0FBeUIsT0FBQSxDQUFRLDRCQUFSO0lBQ3pCLG1CQUFBLEdBQXlCLE9BQUEsQ0FBUSxpQ0FBUjtJQUN6QixlQUFBLEdBQXlCLE9BQUEsQ0FBUSw0QkFBUjtJQUN6QixhQUFBLEdBQXlCLE9BQUEsQ0FBUSwwQkFBUjtJQUN6QixTQUFBLEdBQXlCLE9BQUEsQ0FBUSxxQkFBUjtJQUN6QixjQUFBLEdBQXlCLE9BQUEsQ0FBUSwyQkFBUjtJQUN6QixPQUFBLEdBQXlCLE9BQUEsQ0FBUSxtQkFBUjtJQUN6QixlQUFBLEdBQXlCLE9BQUEsQ0FBUSw0QkFBUjtJQUN6QixrQkFBQSxHQUF3QixPQUFBLENBQVEsZ0NBQVI7SUFDeEIsV0FBQSxHQUF5QixPQUFBLENBQVEsdUJBQVI7SUFDekIsVUFBQSxHQUF5QixPQUFBLENBQVEsdUJBQVI7SUFDekIsUUFBQSxHQUF5QixPQUFBLENBQVEsb0JBQVI7SUFDekIsYUFBQSxHQUF5QixPQUFBLENBQVEsMEJBQVI7SUFDekIsT0FBQSxHQUF5QixPQUFBLENBQVEsbUJBQVI7SUFDekIsTUFBQSxHQUF5QixPQUFBLENBQVEsa0JBQVI7SUFDekIsT0FBQSxHQUF5QixPQUFBLENBQVEsbUJBQVI7SUFDekIsT0FBQSxHQUF5QixPQUFBLENBQVEsbUJBQVI7SUFDekIsU0FBQSxHQUF5QixPQUFBLENBQVEscUJBQVI7SUFDekIsT0FBQSxHQUF5QixP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QUFQO1FBQVAsQ0FBeEI7T0FBZDtNQUNBLFFBQVEsQ0FBQyxJQUFULENBQWM7UUFBQyxnQkFBRCxFQUFtQixPQUFuQixFQUE0QixTQUFBO2lCQUFHLFFBQUEsQ0FBUyxJQUFUO1FBQUgsQ0FBNUI7T0FBZDtNQUNBLFFBQVEsQ0FBQyxJQUFULENBQWM7UUFBQyx1QkFBRCxFQUEwQixjQUExQixFQUEwQyxTQUFBO2lCQUFHLFFBQUEsQ0FBUyxJQUFULEVBQWU7WUFBQSxNQUFBLEVBQVEsSUFBUjtXQUFmO1FBQUgsQ0FBMUM7T0FBZDtNQUNBLFFBQVEsQ0FBQyxJQUFULENBQWM7UUFBQyxnQ0FBRCxFQUFtQyw0QkFBbkMsRUFBaUUsU0FBQTtpQkFBRyxRQUFBLENBQVMsSUFBVCxFQUFlO1lBQUEsYUFBQSxFQUFlLElBQWY7V0FBZjtRQUFILENBQWpFO09BQWQ7TUFDQSxRQUFRLENBQUMsSUFBVCxDQUFjO1FBQUMsaUJBQUQsRUFBb0IsUUFBcEIsRUFBOEIsU0FBQTtpQkFBRyxTQUFBLENBQVUsSUFBVjtRQUFILENBQTlCO09BQWQ7TUFDQSxRQUFRLENBQUMsSUFBVCxDQUFjO1FBQUMsaUNBQUQsRUFBb0Msb0JBQXBDLEVBQTBELFNBQUE7aUJBQUcsbUJBQUEsQ0FBb0IsSUFBcEI7UUFBSCxDQUExRDtPQUFkO0FBRUEsYUFBTztJQTlESCxDQURSO0VBdENZOztFQXVHZCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXpHakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuL2dpdCdcblxuZ2V0Q29tbWFuZHMgPSAtPlxuICBHaXRDaGVja291dE5ld0JyYW5jaCAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWNoZWNrb3V0LW5ldy1icmFuY2gnXG4gIEdpdENoZWNrb3V0QnJhbmNoICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtY2hlY2tvdXQtYnJhbmNoJ1xuICBHaXREZWxldGVCcmFuY2ggICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWRlbGV0ZS1icmFuY2gnXG4gIEdpdENoZWNrb3V0QWxsRmlsZXMgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtY2hlY2tvdXQtYWxsLWZpbGVzJ1xuICBHaXRDaGVja291dEZpbGUgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWNoZWNrb3V0LWZpbGUnXG4gIEdpdENoZXJyeVBpY2sgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtY2hlcnJ5LXBpY2snXG4gIEdpdENvbW1pdCAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtY29tbWl0J1xuICBHaXRDb21taXRBbWVuZCAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWNvbW1pdC1hbWVuZCdcbiAgR2l0RGlmZiAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1kaWZmJ1xuICBHaXREaWZmQnJhbmNoZXMgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWRpZmYtYnJhbmNoZXMnXG4gIEdpdERpZmZCcmFuY2hGaWxlcyAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1kaWZmLWJyYW5jaC1maWxlcydcbiAgR2l0RGlmZnRvb2wgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1kaWZmdG9vbCdcbiAgR2l0RGlmZkFsbCAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1kaWZmLWFsbCdcbiAgR2l0RmV0Y2ggICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1mZXRjaCdcbiAgR2l0RmV0Y2hQcnVuZSAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1mZXRjaC1wcnVuZSdcbiAgR2l0SW5pdCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1pbml0J1xuICBHaXRMb2cgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWxvZydcbiAgR2l0UHVsbCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1wdWxsJ1xuICBHaXRQdXNoICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXB1c2gnXG4gIEdpdFJlbW92ZSAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtcmVtb3ZlJ1xuICBHaXRTaG93ICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXNob3cnXG4gIEdpdFN0YWdlRmlsZXMgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc3RhZ2UtZmlsZXMnXG4gIEdpdFN0YWdlRmlsZXNCZXRhICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc3RhZ2UtZmlsZXMtYmV0YSdcbiAgR2l0U3RhZ2VIdW5rICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1zdGFnZS1odW5rJ1xuICBHaXRTdGFzaEFwcGx5ICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YXNoLWFwcGx5J1xuICBHaXRTdGFzaERyb3AgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YXNoLWRyb3AnXG4gIEdpdFN0YXNoUG9wICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc3Rhc2gtcG9wJ1xuICBHaXRTdGFzaFNhdmUgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YXNoLXNhdmUnXG4gIEdpdFN0YXNoU2F2ZU1lc3NhZ2UgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc3Rhc2gtc2F2ZS1tZXNzYWdlJ1xuICBHaXRTdGF0dXMgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YXR1cydcbiAgR2l0VGFncyAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC10YWdzJ1xuICBHaXRVbnN0YWdlRmlsZXMgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXVuc3RhZ2UtZmlsZXMnXG4gIEdpdFJ1biAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtcnVuJ1xuICBHaXRNZXJnZSAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LW1lcmdlJ1xuICBHaXRSZWJhc2UgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXJlYmFzZSdcbiAgR2l0T3BlbkNoYW5nZWRGaWxlcyAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1vcGVuLWNoYW5nZWQtZmlsZXMnXG5cbiAgZ2l0LmdldFJlcG8oKVxuICAgIC50aGVuIChyZXBvKSAtPlxuICAgICAgY3VycmVudEZpbGUgPSByZXBvLnJlbGF0aXZpemUoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpPy5nZXRQYXRoKCkpXG4gICAgICBnaXQucmVmcmVzaCByZXBvXG4gICAgICBjb21tYW5kcyA9IFtdXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmV4cGVyaW1lbnRhbC5jdXN0b21Db21tYW5kcycpXG4gICAgICAgIGNvbW1hbmRzID0gY29tbWFuZHMuY29uY2F0KHJlcXVpcmUoJy4vc2VydmljZScpLmdldEN1c3RvbUNvbW1hbmRzKCkpXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6YWRkJywgJ0FkZCcsIC0+IGdpdC5hZGQocmVwbywgZmlsZTogY3VycmVudEZpbGUpXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmFkZC1tb2RpZmllZCcsICdBZGQgTW9kaWZpZWQnLCAtPiBnaXQuYWRkKHJlcG8sIHVwZGF0ZTogdHJ1ZSldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6YWRkLWFsbCcsICdBZGQgQWxsJywgLT4gZ2l0LmFkZChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpsb2cnLCAnTG9nJywgLT4gR2l0TG9nKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmxvZy1jdXJyZW50LWZpbGUnLCAnTG9nIEN1cnJlbnQgRmlsZScsIC0+IEdpdExvZyhyZXBvLCBvbmx5Q3VycmVudEZpbGU6IHRydWUpXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnJlbW92ZS1jdXJyZW50LWZpbGUnLCAnUmVtb3ZlIEN1cnJlbnQgRmlsZScsIC0+IEdpdFJlbW92ZShyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpjaGVja291dC1hbGwtZmlsZXMnLCAnQ2hlY2tvdXQgQWxsIEZpbGVzJywgLT4gR2l0Q2hlY2tvdXRBbGxGaWxlcyhyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpjaGVja291dC1jdXJyZW50LWZpbGUnLCAnQ2hlY2tvdXQgQ3VycmVudCBGaWxlJywgLT4gR2l0Q2hlY2tvdXRGaWxlKHJlcG8sIGZpbGU6IGN1cnJlbnRGaWxlKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpjb21taXQnLCAnQ29tbWl0JywgLT4gR2l0Q29tbWl0KHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNvbW1pdC1hbGwnLCAnQ29tbWl0IEFsbCcsIC0+IEdpdENvbW1pdChyZXBvLCBzdGFnZUNoYW5nZXM6IHRydWUpXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNvbW1pdC1hbWVuZCcsICdDb21taXQgQW1lbmQnLCAtPiBHaXRDb21taXRBbWVuZChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czphZGQtYW5kLWNvbW1pdCcsICdBZGQgQW5kIENvbW1pdCcsIC0+IGdpdC5hZGQocmVwbywgZmlsZTogY3VycmVudEZpbGUpLnRoZW4gLT4gR2l0Q29tbWl0KHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmFkZC1hbmQtY29tbWl0LWFuZC1wdXNoJywgJ0FkZCBBbmQgQ29tbWl0IEFuZCBQdXNoJywgLT4gZ2l0LmFkZChyZXBvLCBmaWxlOiBjdXJyZW50RmlsZSkudGhlbiAtPiBHaXRDb21taXQocmVwbywgYW5kUHVzaDogdHJ1ZSldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6YWRkLWFsbC1hbmQtY29tbWl0JywgJ0FkZCBBbGwgQW5kIENvbW1pdCcsIC0+IGdpdC5hZGQocmVwbykudGhlbiAtPiBHaXRDb21taXQocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6YWRkLWFsbC1jb21taXQtYW5kLXB1c2gnLCAnQWRkIEFsbCwgQ29tbWl0IEFuZCBQdXNoJywgLT4gZ2l0LmFkZChyZXBvKS50aGVuIC0+IEdpdENvbW1pdChyZXBvLCBhbmRQdXNoOiB0cnVlKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpjb21taXQtYWxsLWFuZC1wdXNoJywgJ0NvbW1pdCBBbGwgQW5kIFB1c2gnLCAtPiBHaXRDb21taXQocmVwbywgc3RhZ2VDaGFuZ2VzOiB0cnVlLCBhbmRQdXNoOiB0cnVlKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpjaGVja291dCcsICdDaGVja291dCcsIC0+IEdpdENoZWNrb3V0QnJhbmNoKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNoZWNrb3V0LXJlbW90ZScsICdDaGVja291dCBSZW1vdGUnLCAtPiBHaXRDaGVja291dEJyYW5jaChyZXBvLCB7cmVtb3RlOiB0cnVlfSldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6bmV3LWJyYW5jaCcsICdDaGVja291dCBOZXcgQnJhbmNoJywgLT4gR2l0Q2hlY2tvdXROZXdCcmFuY2gocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6ZGVsZXRlLWxvY2FsLWJyYW5jaCcsICdEZWxldGUgTG9jYWwgQnJhbmNoJywgLT4gR2l0RGVsZXRlQnJhbmNoKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmRlbGV0ZS1yZW1vdGUtYnJhbmNoJywgJ0RlbGV0ZSBSZW1vdGUgQnJhbmNoJywgLT4gR2l0RGVsZXRlQnJhbmNoKHJlcG8sIHtyZW1vdGU6IHRydWV9KV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpjaGVycnktcGljaycsICdDaGVycnktUGljaycsIC0+IEdpdENoZXJyeVBpY2socmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6ZGlmZicsICdEaWZmJywgLT4gR2l0RGlmZihyZXBvLCBmaWxlOiBjdXJyZW50RmlsZSldXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmV4cGVyaW1lbnRhbC5kaWZmQnJhbmNoZXMnKVxuICAgICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6ZGlmZi1icmFuY2hlcycsICdEaWZmIGJyYW5jaGVzJywgLT4gR2l0RGlmZkJyYW5jaGVzKHJlcG8pXVxuICAgICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6ZGlmZi1icmFuY2gtZmlsZXMnLCAnRGlmZiBicmFuY2ggZmlsZXMnLCAtPiBHaXREaWZmQnJhbmNoRmlsZXMocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6ZGlmZnRvb2wnLCAnRGlmZnRvb2wnLCAtPiBHaXREaWZmdG9vbChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpkaWZmLWFsbCcsICdEaWZmIEFsbCcsIC0+IEdpdERpZmZBbGwocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6ZmV0Y2gnLCAnRmV0Y2gnLCAtPiBHaXRGZXRjaChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpmZXRjaC1wcnVuZScsICdGZXRjaCBQcnVuZScsIC0+IEdpdEZldGNoUHJ1bmUocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6cHVsbCcsICdQdWxsJywgLT4gR2l0UHVsbChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpwdXNoJywgJ1B1c2gnLCAtPiBHaXRQdXNoKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnB1c2gtc2V0LXVwc3RyZWFtJywgJ1B1c2ggLXUnLCAtPiBHaXRQdXNoKHJlcG8sIHNldFVwc3RyZWFtOiB0cnVlKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpyZW1vdmUnLCAnUmVtb3ZlJywgLT4gR2l0UmVtb3ZlKHJlcG8sIHNob3dTZWxlY3RvcjogdHJ1ZSldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6cmVzZXQnLCAnUmVzZXQgSEVBRCcsIC0+IGdpdC5yZXNldChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpzaG93JywgJ1Nob3cnLCAtPiBHaXRTaG93KHJlcG8pXVxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5leHBlcmltZW50YWwuc3RhZ2VGaWxlc0JldGEnKVxuICAgICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6c3RhZ2UtZmlsZXMnLCAnU3RhZ2UgRmlsZXMnLCAtPiBHaXRTdGFnZUZpbGVzQmV0YShyZXBvKV1cbiAgICAgIGVsc2VcbiAgICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnN0YWdlLWZpbGVzJywgJ1N0YWdlIEZpbGVzJywgLT4gR2l0U3RhZ2VGaWxlcyhyZXBvKV1cbiAgICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnVuc3RhZ2UtZmlsZXMnLCAnVW5zdGFnZSBGaWxlcycsIC0+IEdpdFVuc3RhZ2VGaWxlcyhyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpzdGFnZS1odW5rJywgJ1N0YWdlIEh1bmsnLCAtPiBHaXRTdGFnZUh1bmsocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6c3Rhc2gtc2F2ZScsICdTdGFzaDogU2F2ZSBDaGFuZ2VzJywgLT4gR2l0U3Rhc2hTYXZlKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnN0YXNoLXNhdmUtbWVzc2FnZScsICdTdGFzaDogU2F2ZSBDaGFuZ2VzIFdpdGggTWVzc2FnZScsIC0+IEdpdFN0YXNoU2F2ZU1lc3NhZ2UocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6c3Rhc2gtcG9wJywgJ1N0YXNoOiBBcHBseSAoUG9wKScsIC0+IEdpdFN0YXNoUG9wKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnN0YXNoLWFwcGx5JywgJ1N0YXNoOiBBcHBseSAoS2VlcCknLCAtPiBHaXRTdGFzaEFwcGx5KHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnN0YXNoLWRlbGV0ZScsICdTdGFzaDogRGVsZXRlIChEcm9wKScsIC0+IEdpdFN0YXNoRHJvcChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpzdGF0dXMnLCAnU3RhdHVzJywgLT4gR2l0U3RhdHVzKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnRhZ3MnLCAnVGFncycsIC0+IEdpdFRhZ3MocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6cnVuJywgJ1J1bicsIC0+IG5ldyBHaXRSdW4ocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6bWVyZ2UnLCAnTWVyZ2UnLCAtPiBHaXRNZXJnZShyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czptZXJnZS1yZW1vdGUnLCAnTWVyZ2UgUmVtb3RlJywgLT4gR2l0TWVyZ2UocmVwbywgcmVtb3RlOiB0cnVlKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czptZXJnZS1uby1mYXN0LWZvcndhcmQnLCAnTWVyZ2Ugd2l0aG91dCBmYXN0LWZvcndhcmQnLCAtPiBHaXRNZXJnZShyZXBvLCBub0Zhc3RGb3J3YXJkOiB0cnVlKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpyZWJhc2UnLCAnUmViYXNlJywgLT4gR2l0UmViYXNlKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmdpdC1vcGVuLWNoYW5nZWQtZmlsZXMnLCAnT3BlbiBDaGFuZ2VkIEZpbGVzJywgLT4gR2l0T3BlbkNoYW5nZWRGaWxlcyhyZXBvKV1cblxuICAgICAgcmV0dXJuIGNvbW1hbmRzXG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0Q29tbWFuZHNcbiJdfQ==
