'use strict';

tatool
  .factory('spatialNBack', [ 'executableUtils', 'dbUtils', 'timerUtils', 'gridServiceFactory', 'inputServiceFactory', 'statusPanelUtils',
    function (executableUtils, dbUtils, timerUtils, gridServiceFactory, inputServiceFactory, statusPanelUtils) {

    var SpatialNBack = executableUtils.createExecutable();

    var DISPLAY_DURATION_DEFAULT = 500;

    var N_BACK = 2;

    // Initialize at the start of every session
    SpatialNBack.prototype.init = function() {

      // template properties
      this.mainGridService = gridServiceFactory.createService(3, 3, 'mainGrid', this.stimuliPath);
      this.inputService = inputServiceFactory.createService(this.stimuliPath);

      // timing properties
      this.displayDuration = (this.displayDuration ) ? this.displayDuration : DISPLAY_DURATION_DEFAULT;
      this.timerDisplay = timerUtils.createTimer(this.displayDuration, false, this);

      //N Back (by how much?)
      this.n = (this.n) ? this.n : N_BACK;

      //Probabilities
      if (this.n > 1) {
          this.weightedTypes = ['missmatch', 'missmatch', 'missmatch', 'match', 'match', 'lure'];
      } else {
          this.weightedTypes = ['missmatch', 'missmatch', 'missmatch', 'match', 'match'];
      }


      // prepare stimuli history
      this.stimuliHistory = new Array();
    };

    // Create cell and set properties
    SpatialNBack.prototype.createStimulus = function() {
      this.trial = {};

      var stimulusType = this.getRandomStimulusType();

      // set stimulusType to type 'start' until valid number of stimuli have been shown
      if (this.stimuliHistory.length < (this.n)) {
        stimulusType = 'start';
      }

      var gridPosition = -1;

      switch (stimulusType) {
        case 'missmatch':
          while(gridPosition === -1){
            gridPosition = executableUtils.getRandomInt(1, 9);
            for(var i in this.stimuliHistory) {
                if(parseInt(this.stimuliHistory[i]) === gridPosition){
                    gridPosition = -1;
                }
            }
          }
          break;
        case 'match':
          gridPosition = this.stimuliHistory[this.n - 1];
          break;
        case 'lure':
          gridPosition = this.stimuliHistory[executableUtils.getRandomInt(0,1) * this.n];
          break;
        case 'start':
          gridPosition = executableUtils.getRandomInt(1, 9);
          break;
        default:
      }

      this.trial.stimulusType = stimulusType;
      this.trial.gridPosition = gridPosition;
      this.trial.correctResponse = (stimulusType === 'match') ? 1 : 0;

      this.cellData = {};
      this.cellData.gridPosition = gridPosition;
      this.cellData.stimulusValue = '';
      this.cellData.stimulusValueType = 'text';
      this.cellData.gridCellClass = 'spatialNBack_fillCell';

	  var cell = this.mainGridService.createCell(this.cellData);
	  this.mainGridService.addCell(cell);

      // update stimuli history
      this.stimuliHistory.unshift(gridPosition);
      if (this.stimuliHistory.length > this.n +1) {
        this.stimuliHistory.pop(gridPosition);
      }
    };

    // generate pseudo-random stimulusType (probability 50% missmatch, 33% match, 17% lure)
    SpatialNBack.prototype.getRandomStimulusType = function() {
      var idx = Math.floor(Math.random() * this.weightedTypes.length);
      return this.weightedTypes[idx];
    };

    SpatialNBack.prototype.processResponse = function(givenResponse, timing) {
        this.trial.reactionTime = timing - this.startTime;
        this.trial.givenResponse = givenResponse;
        this.trial.score = this.trial.correctResponse == givenResponse;
        return dbUtils.saveTrial(this.trial);
    };

    SpatialNBack.prototype.stopExecution = function() {
      executableUtils.stop();
    };

    return SpatialNBack;

  }]);
