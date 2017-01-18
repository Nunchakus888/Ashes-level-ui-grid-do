angular.module("appModule").
controller('historyController', function ($scope, $state, $http, All) {
	$scope.upLock = true;
    $scope.downLock = true;
	$scope.tempDataIndex = {};
	$scope.orderOptionArr = [{"name":"全部"},{"name":"处理中"},{"name":"有效"},{"name":"撤销"},{"name":"已删除"}];
	$scope.swapOptionArr = [{"name":"全部"},{"name":"有效"},{"name":"撤销"},{"name":"全部成交"},{"name":"冻结"}];
	$scope.orderSelect = $scope.orderOptionArr[0];
	$scope.swapSelect = $scope.swapOptionArr[0];
	$scope.navMark = "order";
	var dealIndex = 1, orderIndex = 1, swapIndex = 1;
	
	$scope.currentPage = All.pageInfo[1].index;
	
	$scope.goMain = function(){
		$state.go("main");
	}
	
	$scope.pageDown = function () {
        pageTurning("down");
    }
    $scope.pageUp = function () {
        pageTurning("up");
    }

	function pageTurning(mark){
    	for(var i in All.pageInfo){
    		if($scope.navMark == All.pageInfo[i].name){
    			if(mark == "up"){
		    		All.pageInfo[i].index--;
			        if (All.pageInfo[i].index == 1) {
			            $scope.upLock = true;
			        }
		    	}else{
		    		$scope.upLock = false;
			        All.pageInfo[i].index++;
		    	}
		    	$scope.currentPage = All.pageInfo[i].index;
//	    		getHisGridData($scope.tempApiName,index);
    		}
    	}
    }
	
	$scope.navEvent = function(mark){
		$scope.navMark = mark;
		$scope.date1 = $scope.date2 = new Date((new Date()).getTime());
		if(mark == "deal"){
			$scope.hisGridOptionsView.columnDefs = All.hisDealGridOption;
			getHisGridData(All.hisDealUrl);
		}else if(mark == "order"){
			$scope.hisGridOptionsView.columnDefs = All.hisOrderGridOption;
			getHisGridData(All.hisOrderUrl);
		}else if(mark == "swap"){
			$scope.hisGridOptionsView.columnDefs = All.hisXswapGridOption;
			getHisGridData(All.hisXswapUrl);
		}
		for(var i in All.pageInfo){
			if($scope.navMark == All.pageInfo[i].name){
				$scope.currentPage = All.pageInfo[i].index;
			}
		}
	}
	
	$scope.search = function(date1,date2,mark){
		console.info(date1,date2,mark);
	}
	
	$scope.optionChange = function(option){
		
	}
	
	$scope.date1 = new Date((new Date()).getTime());
	$scope.date2 = new Date((new Date()).getTime());
    $scope.datePickerConfig1 = {
        "readOnly": true
    }
    $scope.datePickerConfig2 = {
        "readOnly": true
    }
    
    $scope.hisGridOptionsView = {
    	rowTemplate: rowTemplate(),
        enableSorting: false,
        enableFullRowSelection: true,
        enableColumnMenus: false,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        noUnselect: false,
        enableColumnResizing: true,
        enableCellEdit: false,
        columnDefs: All.hisOrderGridOption,
        onRegisterApi: function (gridApi) {
            $scope.gridApiAM1 = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                if($scope.navMark=="deal" ||　$scope.navMark=="swap"){
                	return false;
                }else {
                	if(!row.entity.index){
                		return false;
                	}
                }
                
    			var index = $scope.hisGridOptionsView.data.indexOf(row.entity);
                if(row.mark){
                	row.mark = false;
                	var tempArr = $scope.tempDataIndex["rowIndex"+row.entity.index];
					$scope.hisGridOptionsView.data.splice(index+1,tempArr.length);
                }else{
                	row.mark = true;
                	getDetailedInfo(row.entity,index);
                }
            });
        }
    };
    
    //initially ui-gird row..
    function rowTemplate() {
        return '<div role="row" class="{{row.entity.class}} ng-isolate-scope">' + '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" role="gridcell" ui-grid-cell id="{{col.colDef.name}}_{{row.uid}}_"></div></div>';
    }
    
    function getDetailedInfo(obj,index){
    	$http({
            method: "GET",
            url: All.hisDetailedInfoUrl
//          data: {"num": obj.number}
        }).then(function (res) {
				$scope.tempDataIndex["rowIndex"+obj.index] = res.data;
				for(var i in res.data){
					res.data[i].class = "his-grid-class";
					$scope.hisGridOptionsView.data.splice(index+1,0,res.data[i]);
				}
        });
    }
    
    function getHisGridData (url,date1,date2,mark,page) {
    	$http({
            method: "GET",
            url: url
//          data: {"page": 1, "size": 20, "apiName": apiName}
        }).then(function (res) {
//          if (data.length) {
//              for (var i = 0; i < data.length; i++) {
//                  data[i].rank = i + 1;
//              }
//          }
            $scope.hisGridOptionsView.data = res.data;
        });
    };
    
    getHisGridData(All.hisOrderUrl);
	
})
