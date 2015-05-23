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
            isSimple: true;
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
            try{
              //check for cross over of edges
              isSimplePolygon($scope.Input.CoordArray);
              //we won't check this if isSimplePolygon() throws an error
              isPointInside($scope.Input.CoordArray, $scope.Output.point_x, $scope.Output.point_y);
            }
            catch(err)
            {
              //not sure about this
              $scope.Output.TextOutput = err;
            }
            // inside or invalid response set by function: isPointInside()
            
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
        
        var isSimplePolygon = function (CoordArrayIn){
          
          slopes = [];
          //y intersections
          y_ints = [];
          var numEdges = CoordArray.length - 1;
          
          
          for (var i = 0, var j = CoordArrayIn.length-1; i < numEdges-1; j=i++)
          { 
            //m = rise/run
            slopes[i] = (CoordArrayIn[i][1]-CoordArrayIn[j][1])/
            (CoordArrayIn[i][0]-CoordArrayIn[j][0]);
            //b = y-mx
            y_ints[i] = (CoordArrayIn[i][1] - slopes[i]*CoordArrayIn[i][0];
          }
          
          for (var i = 0; i < CoordArrayIn.length; i++)
          { //the first edge must be handled differently
            //since it is connected to the last edge
            //so, we don't want to test it against the last edge
            if (i === 0)
            {
              for (var x = (i+2); x < CoordArrayIn.length-1; x++)
              { //find the intersection of the two lines that describe the edges
                var x_intersection = (y_ints[i] - y_ints[x]) / (slopes[x] - slopes[i]);
                var y_intersection = (slopes[i]*CoordArrayIn[i][0] + y_ints[i]);
                
                //used to help us find the x_range and y_range of the edge
                var min_x = Math.min(CoordArrayIn[i][0], CoordArrayIn[x][0]);
                var min_y = Math.min(CoordArrayIn[i][1], CoordArrayIn[x][1]);
                var max_x = Math.max(CoordArrayIn[i][0], CoordArrayIn[x][0]);
                var max_y = Math.max(CoordArrayIn[i][1], CoordArrayIn[x][1]);
                
                //if the intersection is within the range of the edge
                if (min_x <= x_intersection
                  && x_intersecetion <= max_x
                  && min_y <= y_interesection
                  && y_intersection <= max_y)
                {
                  $scope.Output.isSimple = false;
                  throw "Polygon not simple";
                }
                
              }
            }
            //none of these are connected to the last edge
            else 
            {
              for (var x = (i+2); x < CoordArrayIn.length; x++)
              { //find the intersection of the two lines that describe the edges
                var x_intersection = (y_ints[i] - y_ints[x]) / (slopes[x] - slopes[i]);
                var y_intersection = (slopes[i]*CoordArrayIn[i][0] + y_ints[i]);
                
                //used to help us find the x_range and y_range of the edge
                var min_x = Math.min(CoordArrayIn[i][0], CoordArrayIn[i-1][0]);
                var min_y = Math.min(CoordArrayIn[i][1], CoordArrayIn[i-1][1]);
                var max_x = Math.max(CoordArrayIn[i][0], CoordArrayIn[i-1][0]);
                var max_y = Math.max(CoordArrayIn[i][1], CoordArrayIn[i-1][1]);
                
                
                //if the intersection is within the range of the edge
                if (min_x <= x_intersection
                  && x_intersecetion <= max_x
                  && min_y <= y_interesection
                  && y_intersection <= max_y)
                {
                  $scope.Output.isSimple = false;
                  throw "Polygon not simple";
                  
                }
              }
            }
          }
          
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
                
                
                //point is on the line
                if (((xDiff * (point_y - y1) / yDiff + x1) ) - point_x < .0001);
                {
                  $scope.Output.isInside = false;
                  $scope.Output.TextOutput = "Outside";
                  break;
                }
                
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
