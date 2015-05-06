'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
.controller('DashboardCtrl', ['$scope', '$http', '$firebase', 'Microtasks', 'Functions','firebaseUrl', function ($scope,$http,$firebase, Microtasks,Functions,firebaseUrl) {

    // prepare the graphs data 
    $scope.pieConfig = {
        visible: true, // default: true
        extended: false, // default: false
        disabled: false, // default: false
        autorefresh: true, // default: true
        refreshDataOnly: false // default: false
    };

    // COMPLETE MICROTASKS
    // pie chart settings
    $scope.numCompletedPie = {
        chart: {
            type: 'pieChart',
            height: 300,
            x: function(d){return d.label;},
            y: function(d){return d.value;},
            showLabels: true,
            labelType: "percent",
            showLegend: false,
            transitionDuration: 500,
            valueFormat: function(d){
                return parseInt(d);
            }
        },
        title: {
            enable: true,
            text  : 'Finished by type'
        }
    };

    // TOTAL WORK TIME
    // pie chart settings
    $scope.totalTimePie = {
        chart: {
            type: 'pieChart',
            height: 300,
            x: function(d){return d.label;},
            y: function(d){return d.value;},
            showLabels: true,
            labelType: "percent",
            showLegend: false,
            transitionDuration: 500,
            valueFormat: function(d){
                return $filter('amountOfTime')(d);
            }
        },
        title: {
            enable: true,
            text  : 'Total worktime by type'
        }
    };

    // initialize scope variables
    $scope.totalTimeData    = [];
    $scope.numCompletedData = [];

    // initialize microtasks and stats
    $scope.microtasks = Microtasks;
  
    // set loading for the first run
    $scope.loading = true;
    $scope.$watch( 'microtasks.getStatsReady() ', function() {
    	if( $scope.microtasks.getStatsReady() ){
    		$scope.stats = $scope.microtasks.getStats();

			$scope.numCompletedData = function(){
			    var graphData = [];
			    angular.forEach( $scope.stats.finishByType,function(stats, type){
			        graphData.push({
			            label: type,
			            value: stats.numFinished
			        });
			    });
			    return graphData;
			};

			$scope.totalTimeData = function(){
			    var graphData = [];
			    angular.forEach( $scope.stats.finishByType,function(stats, type){
			        graphData.push({
			            label: type,
			            value: stats.totalTime
			        });
			    });
			    return graphData;
			};
			$scope.loading = false;
    	}
    });

    $scope.output = "";
    $scope.clearOutput = function(){ $scope.output = ""; };
    $scope.executeCommand = function(command){

        if( (command=='Reset' && !window.confirm("Are you sure? Reset will clear all the project data!")) ) 
            console.log('Aborting reset');
        else {
           $http.post('/'+projectId+'/admin/' + command)
            .success(function(data, status, headers, config) {
                $scope.output += data.message;
            })
            .error(function(data, status, headers, config) {
                console.log('UNABLE TO EXECUTE COMMAND '+command);
            }); 
        }
        

    };

    $scope.setAsDefault = function(){
        var ref = new Firebase('https://crowdcode.firebaseio.com/defaultProject');
        ref.set(projectId);
        console.log('set as default project: '+projectId);
    };


    // default project settings
    $scope.settings = {  };

    // load the project settings from firebase
    var settingsRef = new Firebase(firebaseUrl+'/status/settings');
    settingsRef.on('value',function(snapshot){
        var val= snapshot.val();
        angular.forEach(val,function(value,index){
            $scope.settings[index] = value;
        });
    });

    $scope.toggleSettings = function(name){
        if( $scope.settings[name] )
            $scope.executeCommand(name+'OFF');
        else
            $scope.executeCommand(name+'ON');
        
    }


}]);
