(function() {
  var PigmentsAPI;

  module.exports = PigmentsAPI = (function() {
    function PigmentsAPI(project) {
      this.project = project;
    }

    PigmentsAPI.prototype.getProject = function() {
      return this.project;
    };

    PigmentsAPI.prototype.getPalette = function() {
      return this.project.getPalette();
    };

    PigmentsAPI.prototype.getVariables = function() {
      return this.project.getVariables();
    };

    PigmentsAPI.prototype.getColorVariables = function() {
      return this.project.getColorVariables();
    };

    PigmentsAPI.prototype.observeColorBuffers = function(callback) {
      return this.project.observeColorBuffers(callback);
    };

    return PigmentsAPI;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9waWdtZW50cy1hcGkuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQTs7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MscUJBQUMsT0FBRDtNQUFDLElBQUMsQ0FBQSxVQUFEO0lBQUQ7OzBCQUViLFVBQUEsR0FBWSxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUo7OzBCQUVaLFVBQUEsR0FBWSxTQUFBO2FBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxVQUFULENBQUE7SUFBSDs7MEJBRVosWUFBQSxHQUFjLFNBQUE7YUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FBQTtJQUFIOzswQkFFZCxpQkFBQSxHQUFtQixTQUFBO2FBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxpQkFBVCxDQUFBO0lBQUg7OzBCQUVuQixtQkFBQSxHQUFxQixTQUFDLFFBQUQ7YUFBYyxJQUFDLENBQUEsT0FBTyxDQUFDLG1CQUFULENBQTZCLFFBQTdCO0lBQWQ7Ozs7O0FBWnZCIiwic291cmNlc0NvbnRlbnQiOlsiXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQaWdtZW50c0FQSVxuICBjb25zdHJ1Y3RvcjogKEBwcm9qZWN0KSAtPlxuXG4gIGdldFByb2plY3Q6IC0+IEBwcm9qZWN0XG5cbiAgZ2V0UGFsZXR0ZTogLT4gQHByb2plY3QuZ2V0UGFsZXR0ZSgpXG5cbiAgZ2V0VmFyaWFibGVzOiAtPiBAcHJvamVjdC5nZXRWYXJpYWJsZXMoKVxuXG4gIGdldENvbG9yVmFyaWFibGVzOiAtPiBAcHJvamVjdC5nZXRDb2xvclZhcmlhYmxlcygpXG5cbiAgb2JzZXJ2ZUNvbG9yQnVmZmVyczogKGNhbGxiYWNrKSAtPiBAcHJvamVjdC5vYnNlcnZlQ29sb3JCdWZmZXJzKGNhbGxiYWNrKVxuIl19
