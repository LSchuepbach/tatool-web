'use strict';

tatool
  .controller('spatialNBackCtrl', [ '$scope', 'service',
    function ($scope, service) {

    $scope.mainGridService = service.mainGridService;
    $scope.inputService = service.inputService;

    // start execution
    $scope.start = function() {
      service.mainGridService.show();
      service.inputService.enable();
      if (service.showKeys.propertyValue === true) {
        service.inputService.show();
      }

      service.createStimulus();

      displayStimulus();
    };

    function displayStimulus() {
      service.timerDisplay.start(displayTimeUp);
      service.timerreaction.start(reactionTimeUp);
      service.mainGridService.refresh();
      service.inputService.enable();
    }

    // remove stimulus from screen
    function displayTimeUp() {
      service.mainGridService.clear().refresh();
    }

    // Called by timer when time elapsed without user input
    function reactionTimeUp() {
      service.inputService.disable();
      service.mainGridService.clear().refresh();
      service.processResponse('', '-1').then(function() {
        service.stopExecution();
      });
    }

    // capture user input
    $scope.clickButton = function(input, timing, event) {
      service.inputService.disable();
      service.timerDisplay.stop();
      service.timerreaction.stop();
	  service.mainGridService.clear().refresh();
      service.processResponse(parseInt(input.givenResponse), timing).then(function() {
        service.stopExecution();
      });
    };


  }]);