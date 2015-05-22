'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', function($scope) {
        $scope.Input = {
            TextInput: "",
            array:[],
            CoordArray: []
        };
        
        $scope.Output = {
            point_y: -20,
            point_x: -20,
            polypoints: "0,0,0,0,0,0,0,0",
            TextOutput: "",
            isInside: false
        };
        
        
        $scope.ProcessInput = function () {
            // ----------------------------------- Input ----------------------------------------------
            // Turn comma delimited string to array
            var tempArray = $scope.Input.TextInput.split(',');
            
            // Remove last two values as search point coords
            var tempPoint = {
                y: tempArray.pop(),
                x: tempArray.pop()
            };
            
            // get coord array
            $scope.Input.CoordArray = getPointArray(tempArray); // transforms string array [0,0,0,1,4,3, ... ] to [ [0,0], [0,1], [4,3], ... ]
            
           // save array of poly points (now that last two are removed)
            $scope.Input.array = tempArray;
            
            
            // ----------------------------------- Output -------------------------------------------
            //add point
            $scope.Output.point_x = tempPoint.x;
            $scope.Output.point_y = tempPoint.y;
            
            // add polygon
            $scope.Output.polypoints = $scope.Input.array.join();
            
            // default response text = outside
            $scope.Output.TextOutput = 'Outside';
            
            // inside or invalid response set by function: isPointInside()
            isPointInside($scope.Input.CoordArray, $scope.Output.point_x, $scope.Output.point_y); 
        };
        
        var getPointArray = function(PolyArrayIn){
            var PolyArray = [];
            for (var index = 0; index <= PolyArrayIn.length; index++) {
                if((index % 2) === 1){
                    PolyArray.push([PolyArrayIn[index],PolyArrayIn[index + 1]]);
                }
            }
            return PolyArray;
        };
        
        var isPointInside = function (CoordArrayIn, point_x, point_y){
            $scope.Output.isInside = false;
            var lastIndex = CoordArrayIn.length - 1;
            var x = 0, y = 1;
            
            for ( var vertex = 0, vertex2 = lastIndex;
                    vertex <= lastIndex;
                    vertex2 = vertex++
                  ) {
                //var vertex2 = (vertex - 1) % CoordArrayIn.length;
                
                // edge betwen nth(x1,y1) point and nth-1(x2,y2) point
                var x1 = CoordArrayIn[vertex][x];
                var y1 = CoordArrayIn[vertex][y];
                var x2 = CoordArrayIn[vertex2][x];
                var y2 = CoordArrayIn[vertex2][y];
                
                var xDiff = x2 - x1;
                var yDiff =y2 - y1;
                var slope = yDiff / xDiff;
                var areYPointsAbovePoint = (y1 > point_y) !== (y2 > point_y);
                var isPointInsideX = (point_x < (xDiff * (point_y - y1) / yDiff + x1));
                var doesIntersect = (areYPointsAbovePoint && isPointInsideX);
                
                // use scope as global variable
                if (doesIntersect){
                    // flip flag
                    $scope.Output.isInside = !$scope.Output.isInside;
                }
            }
            if($scope.Output.isInside) {
                $scope.Output.TextOutput = "Inside";
            }
        };
}]);