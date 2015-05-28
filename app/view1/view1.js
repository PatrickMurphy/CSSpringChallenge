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
            CoordArray: [],
            y_ints: [],
            slopes: []
        };
        
        $scope.Output = {
            point_y: -20,
            point_x: -20,
            polypoints: "0,0,0,0,0,0,0,0",
            TextOutput: "",
            isInside: false,
            isSimple: true
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
              getSlopesAndIntercepts($scope.Input.CoordArray);
              isSimplePolygon($scope.Input.CoordArray,$scope.Input.y_ints,$scope.Input.slopes);
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
        
        var getSlopesAndIntercepts = function(CoordArrayIn)
        {
          var slopes = [];
          var y_ints = [];
          var numEdges = CoordArrayIn.length - 1;
          
          for (var m = 0, j = numEdges; m < numEdges+1; j=m++)
          {
            // if x coordinates are the same edge is vertical
            if (CoordArrayIn[m][0] === CoordArrayIn[j][0])
            {
              slopes.push( 999999999999999999);
              y_ints.push( null);
            }//if y coordinates are the same edge is horizontal
            else if (CoordArrayIn[m][1] === CoordArrayIn[j][1])
            {
              slopes.push(0);
              y_ints.push(CoordArrayIn[m][1]);
            } 
            else //edge normal, find equation
            {
            slopes.push((CoordArrayIn[m][1]-CoordArrayIn[j][1])/
            (CoordArrayIn[m][0]-CoordArrayIn[j][0]));
            //b = y-mx
            y_ints.push((CoordArrayIn[m][1] - slopes[m]*CoordArrayIn[m][0]));
            }
          }
          
          $scope.Input.y_ints = y_ints;
          $scope.Input.slopes = slopes;
          
        }
        
        var isSimplePolygon = function (CoordArrayIn, y_ints,slopes){
          
          var numEdges = CoordArrayIn.length - 1;
          //iterate through edges, make sure non-consecutive edges don't intersect
          for (var i = 0; i < (numEdges+1); i++)
          { 
            var x_intersection,y_intersection;
            var min_x , min_y, max_x, max_y;
            //the first edge must be handled differently
            //since it is connected to the last edge
            //so, we don't want to test it against the last edge
            var lastEdge = CoordArrayIn.length-1;
            if (i > 0) {lastEdge = CoordArrayIn.length;}
            
            for (var x = (i+2); x < CoordArrayIn.length-1; x++)
            { 

              //this if checks if the lines have the same slope
              //if so no intersection possible
              if (Math.abs((slopes[x] - slopes[i])) < .0001)
                continue;

              //From here until the last else, we are checking
              //if one of the two lines is veritcal or horizontal
              //to avoid any division by zeroes.
              if (slopes[i] == 999999999999999999)
              {
                x_intersection = CoordArrayIn[i][0];
                if (slopes[x] === 0)
                {
                  y_intersection = CoordArrayIn[x][1];
                }
                else
                {
                  y_intersection = (slopes[x]*CoordArrayIn[x][0] + y_ints[x]);
                }
              }
              else if (slopes[x] == 999999999999999999)
              {
                x_intersection = CoordArrayIn[x][0];
                if (slopes[i] === 0)
                {
                  y_intersection = CoordArrayIn[i][1];
                }
                else
                {
                  y_intersection = (slopes[i]*CoordArrayIn[i][0] + y_ints[i]);
                }
              }
              else  //both lines normal
              {
                x_intersection = (y_ints[i] - y_ints[x]) / (slopes[x] - slopes[i]);
                y_intersection = (slopes[i]*x_intersection + y_ints[i]);
              }
                //used to help us find the x_range and y_range of the edge_1
                var edge_1_min_x = Math.min(CoordArrayIn[i][0], CoordArrayIn[numEdges][0]);
                var edge_1_min_y = Math.min(CoordArrayIn[i][1], CoordArrayIn[numEdges][1]);
                var edge_1_max_x = Math.max(CoordArrayIn[i][0], CoordArrayIn[numEdges][0]);
                var edge_1_max_y = Math.max(CoordArrayIn[i][1], CoordArrayIn[numEdges][1]);
                //used to help us find the x_range and y_range of the edge_1
                var edge_2_min_x = Math.min(CoordArrayIn[x][0], CoordArrayIn[x-1][0]);
                var edge_2_min_y = Math.min(CoordArrayIn[x][1], CoordArrayIn[x-1][1]);
                var edge_2_max_x = Math.max(CoordArrayIn[x][0], CoordArrayIn[x-1][0]);
                var edge_2_max_y = Math.max(CoordArrayIn[x][1], CoordArrayIn[x-1][1]);

                //if the intersection is within the range of the edges
                min_x = Math.max(edge_1_min_x , edge_2_min_x);
                min_y = Math.max(edge_1_min_y , edge_2_min_y);
                max_x = Math.min(edge_1_max_x , edge_2_max_x);
                max_y = Math.min(edge_1_max_y , edge_2_max_y);
                  
                  //if the intersection is within the range of the edge
                if (min_x <= x_intersection &&
                   x_intersection <= max_x &&
                   min_y <= y_intersection &&
                   y_intersection <= max_y )
                  {
                    $scope.Output.isSimple = false;
                    throw "Polygon not simple";
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
                if ((Math.abs((xDiff * (point_y - y1) / yDiff + x1) ) - point_x) < .001);
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
