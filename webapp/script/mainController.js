'use strict';

angular.module("appModule").
controller('mainController', function ($scope, $state, All, $http, $window, modalService, $timeout, $filter) {
	$scope.sheetArr = ["Repo","Shibor","Spread"];
	$scope.quoteNavArr = All.quoteNav;
	$scope.user = All.user;
	$scope.singleFrom = {};
	$scope.batchForm = [];
//	$scope.shadeMark = $scope.setMark = $scope.singleMark = $scope.batchMark = $scope.infoMark = false;
//	$scope.productMark = $scope.sheetTipMark = $scope.sheetNameMark = $scope.gridConfigMark = $scope.priceInversionMark = false;
	$scope.setNavMark = "basic";
	$scope.lastTime = "8秒前";
	$scope.shiftPrice = $scope.widenPrice = 0;
	$scope.navIndex = 0;
	$scope.returnsMark = "fr";
	$scope.priceMark = {"type":"Basis","product":"sr","date":"1Y","btn":"day"};
	$scope.infoList = All.infoList;

	//SheetNav
	$scope.sheetNav = function(index,name){
		$scope.navIndex = index;
		$scope.sheetName = name;
		$scope.mainGridOptionsView.data = $scope.mainDisplayData[name];
	};

	$scope.goHistory = function(){
		$state.go("history");
	}

	$scope.sheetNameBtn = function(name){
		if(name){
			var name = name.replace(/(^\s*)|(\s*$)/g,'');
			if($scope.sheetArr.indexOf(name) == -1){
				$scope.sheetArr.push(name);
				$scope.shadeMark = $scope.sheetNameMark = false;
			}else{
				infoTemp("sheet名已存在");
			}
		}else{
			infoTemp("sheet名不能为空");
		}
		$scope.newSheetName = "";
	}

	$scope.menuForced = {"x": true,"y": true};
	$scope.data = [
		{
			"title": "重命名",
			"event": function(e,obj){
				e.stopPropagation();
				$scope.menuShow = false;
				$scope.editInputMark = $scope.tempSheetNavName;
				var index = $scope.sheetArr.indexOf($scope.tempSheetNavName);
				$scope.sheetNav(index,$scope.tempSheetNavName);
			}
		},{
			"title": "删除",
			"line" : true,
			"event": function(e,obj){
				e.stopPropagation();
				$scope.menuShow = false;
				$scope.shadeMark = $scope.sheetTipMark = true;
			}
		},{
			"title": "表格设置",
			"event": function(){
				$scope.shadeMark = $scope.gridConfigMark = true;
			}
		},{
			"title": "恢复默认",
			"event": function(){
				for(var i in $scope.mainGridOption){
					$scope.mainGridOption[i].visible = true;
				}
				$scope.gridApi.grid.refresh();
				for(var i in All.mainGridSetOption){
					All.mainGridSetOption[i].nowState = true;
				}
			}
		}
	]

	$scope.sheetRename = function(oldname,newname){
		if(newname){
			var index = $scope.sheetArr.indexOf(oldname);
			if($scope.sheetArr.indexOf(newname) == -1){
				$scope.sheetArr.splice(index,1,newname);
			}else{
				infoTemp("此sheet名已存在");
			}
		}
		$scope.editInputMark = "";
	}

	$scope.sheetDelTip = function(){
		var index = $scope.sheetArr.indexOf($scope.tempSheetNavName);
		$scope.sheetArr.splice(index,1);
		$scope.shadeMark = $scope.sheetTipMark = false;
	}

	//input焦点事件的注册&注销
	function inputFocus(e){
		if(document.getElementById("edit-{{x}}")){
			document.getElementById("edit-{{x}}").focus();
		}
	}

	document.addEventListener("DOMNodeInserted",inputFocus);

	$scope.$on('$destroy',function(){
        document.removeEventListener('DOMNodeInserted',inputFocus);
    });

	//returnsNav
	$scope.returnsNav = function(mark){
		$scope.returnsMark = mark;
	};

	//priceNav
	$scope.priceNav = function(key,mark){
		$scope.priceMark[key] = mark;
	}

	//添加产品
	$scope.addSingleTypeArr = All.addSingle;
	$scope.addProductTemp = [];					//存储当前选择的各个属性
	$scope.addProductList = [];					//所有选择产品
	$scope.productChoose = [];					//当前选中产品的obj

	$scope.productTypeClick = function(index){
		$scope.productChoose = $scope.addSingleTypeArr[index];
		$scope.addProductTemp.type = $scope.addSingleTypeArr[index].type;
	}

	$scope.productCancel = function(){
		$scope.shadeMark = $scope.productMark = false;
		$scope.addProductTemp = $scope.addProductList = $scope.productChoose = [];
	}

	$scope.addProductBtn = function(obj){
		if(obj.product && obj.date){
			if(obj.product=="All" && obj.date=="All"){
				infoTemp("产品和期限不能同时选择All");
			}else{
				addProductListRule(obj);
			}
		}else{
			infoTemp("产品或期限尚未选择");
		}
	}

	$scope.delProductBtn = function(obj){
		var index = $scope.addProductList.indexOf(obj.add);
		$scope.addProductList.splice(index,1);
		delete obj.add;
	}

	function addProductListRule(obj){
		if(obj.product=="All" || obj.date=="All"){
			if(obj.product=="All"){
				for(var i in $scope.productChoose.product){
					if($scope.productChoose.product[i] != "All"){
						var temp = $scope.productChoose.product[i] + "_" + obj.date;
						newProductFilter(temp);
					}
				}
			}else if(obj.date=="All"){
				for(var i in $scope.productChoose.date){
					if($scope.productChoose.date[i] != "All"){
						var temp = obj.product + "_" + $scope.productChoose.date[i];
						newProductFilter(temp);
					}
				}
			}
		}else{
			var temp = obj.product + "_" + obj.date;
			newProductFilter(temp);
		}
	}

	function newProductFilter(temp){
		if($scope.addProductList.indexOf(temp) == -1){
			$scope.addProductList.push(temp);
		}else{
			infoTemp("重复产品("+temp+")已过滤");
		}
	}

	//冻结
    $scope.quoteFreeze = function (tag) {
		if((!currentCells && tag)){
			return false;
		}

		if(!tag){//freeze all
            let allQuoteItem = $scope.mainDisplayData.Repo;
            for(let i = 1; i < allQuoteItem.length; i++){ //remove 分栏row!!!
                allQuoteItem[i].myBidStatus.isFreeze = All.QUOTE_FREEZE;
                allQuoteItem[i].myOfrStatus.isFreeze = All.QUOTE_FREEZE;
            }
        }else{
            let cells = currentCells.filter(i=>typeof (i) === 'object');
            this.isFreeze = function(freeze) {
                for (let i in cells) {
                    if (cells[i].col.field === All.mainColumnsData.myOfr || cells[i].col.field === All.mainColumnsData.myOfrVol) {
                        cells[i].row.entity.myOfrStatus.isFreeze = freeze;
                    } else if (cells[i].col.field === All.mainColumnsData.myBid || cells[i].col.field === All.mainColumnsData.myBidVol) {
                        cells[i].row.entity.myBidStatus.isFreeze = freeze;
                    }
                }
            };
            tag === 1 && this.isFreeze(All.QUOTE_FREEZE);
            tag === 2 && this.isFreeze("");
        }
    };

	//单笔报价
	$scope.singleTypeArr = All.single;
	$scope.singleFrom.type = All.single[0];
	$scope.singleFrom.product = $scope.singleFrom.type.product[0];
	$scope.singleFrom.date = $scope.singleFrom.type.date[0];
	$scope.singleTypeChange = function(node){
		$scope.singleFrom.product = node.product[0];
		$scope.singleFrom.date = node.date[0];
	}

	$scope.singleDisabled = function(obj){
		if(obj.ofr && obj.ofrVol){
			if( (obj.bid&&obj.bidVol) || (!obj.bid&&!obj.bidVol) ){
				return false
			}else {
				return true
			}
		}else if(!obj.ofr && !obj.ofrVol){
			if(obj.bid && obj.bidVol){
				return false
			}else {
				return true
			}
		}else{
			return true
		}
	}


	$scope.singleCancel = function(){
		$scope.shadeMark = $scope.singleMark = false;
	}

	$scope.submitSingleForm = function(arr){
		var quoteList = [];
        quoteSplit(quoteList,arr);
	};

	function quoteSplit (list,temp){
		var productKey = temp.product.key + "_" + temp.date.key;
		for(var i in temp){
			temp[i] ? null : temp[i] = "";
		}
		list.push({"productKey":productKey,"priceType":"ofr","price":(temp.ofr ? temp.ofr:""),"volume":(temp.ofrVol ? temp.ofrVol:"")});
		list.push({"productKey":productKey,"priceType":"bid","price":(temp.bid ? temp.bid:""),"volume":(temp.bidVol ? temp.bidVol:"")});

        $scope.mainDisplayData.Repo.push({"productKey":productKey,"myOfr":temp.ofr,"volume":temp.ofrVol});
        $scope.mainDisplayData.Repo.push({"productKey":productKey,"myBid":temp.bid,"myBidVol":temp.bidVol});
        $scope.shadeMark = $scope.singleMark = false;
    }

	//批量报价
	$scope.batchTypeArr = All.single;
	$scope.batchTypeChange = function(node,index){
		$scope.batchForm[index].product = node.product[0];
		$scope.batchForm[index].date = node.date[0];
	}

	$scope.batchTextImport = function(text){
		var str = text.replace(/(^\s*)|(\s*$)/g,"");
		if(!str){
			return false;
		}
		var tempIndex = [];
		var arr = str.split("\n");
		for(var i in arr){
			arr[i] = arr[i].replace(/(^\s*)|(\s*$)/g,"").split(",");
			arr[i].length!=8 ? tempIndex.unshift(i) : null;
		}
		if(tempIndex.length){
			for(var j in tempIndex){
				infoTemp("第"+ (++tempIndex[j]) +"行字段缺失，舍去");
				arr.splice(tempIndex[j],1);
			}
		}
		if(arr.length){
			for(var k in arr){
				var length = $scope.batchForm.length;
				$scope.batchForm.push({"ofr":arr[k][3]*1,"bid":arr[k][4]*1,"ofrVol":arr[k][5]*1,"bidVol":arr[k][6]*1,"user":arr[k][7]});
				batchImportProductAttr(arr[k][0],arr[k][1],arr[k][2],length);
			}
		}
	}

	function batchImportProductAttr(type,product,date,length){
		var typeIndex,productIndex,dateIndex;
		for(var i in All.single){
			if(All.single[i].type == type){
				typeIndex = i;
				for(var m in All.single[i].product){
					if(All.single[i].product[m].key == product){
						productIndex = m;
					}
				}
				for(var n in All.single[i].date){
					if(All.single[i].date[n].key == date){
						dateIndex = n;
					}
				}
			}
		}
		$scope.batchForm[length].type = All.single[typeIndex];
		$scope.batchForm[length].product = $scope.batchForm[length].type.product[productIndex];
		$scope.batchForm[length].date = $scope.batchForm[length].type.date[dateIndex];
	}

	$scope.addNewPrice = function(){
		for(var i=0; i<10; i++){
			var index = $scope.batchForm.length;
			$scope.batchForm.push({});
			$scope.batchForm[index].type = All.single[0];
			$scope.batchForm[index].product = $scope.batchForm[index].type.product[0];
			$scope.batchForm[index].date = $scope.batchForm[index].type.date[0];
		}
	}

	$scope.delBarch = function(index){
		$scope.batchForm.splice(index,1);
	}

	$scope.batchAdjust = function(mark,num){
		if(mark == "shift"){
			for(var i in $scope.batchForm){
				$scope.batchForm[i].ofr += num;
				$scope.batchForm[i].bid += num;
			}
		}else if(mark == "widen"){
			for(var j in $scope.batchForm){
				$scope.batchForm[j].ofr += num;
				$scope.batchForm[j].bid -= num;
			}
		}
	}

	$scope.batchDisabled = function(obj){
		if(!obj.length){
			return true;
		}
		for(var i in obj){
			if( (obj[i].ofr&&!obj[i].ofrVol) || (!obj[i].ofr&&obj[i].ofrVol)){
				return true;
			}else{
				if( (obj[i].bid&&!obj[i].bidVol) || (!obj[i].bid&&obj[i].bidVol) ){
					return true;
				}
			}
		}
		return false;
	}

	$scope.batchCancel = function(obj){
		$scope.shadeMark = $scope.batchMark = false;
		$scope.batchForm = $scope.batchText = [];
	}

	$scope.submitBatchForm = function(arr){
		var quoteList = [];
		for(var i in arr){
			quoteSplit(quoteList,arr[i]);
		}
		debugger
//		var domrdrcai = function(a,b){
//			var that = this;
//			for(var i in a.list){
//				if(a.list[i] == b){
//					$scope.batchForm[b] = true;
//				}
//				a.flag ? $scope.shadeMark=true : $scope.shadeMark=false;
//				var temp = "";
//				$scope.test = function(key){
//					temp = $scope.ds;
//					$sope.dlsaoc = key;
//					joep[d] = {"key":key,"value":temp};
//					temp = "";
//					for(var j in arr){
//						arr[j] = j + temp;
//					}
//				}
//			}
//		}
//		var test = $scope.mockDisabsoult;
//		for(var j in test){
//			test[j].mark = j ? "shade":"none";
//		}
		
	}

	//价格&数量调整 右边栏
	$scope.inputCount = function(mark,num){
		if(mark == "shift"){

		}else if(mark == "widen"){

		}
	}

	//设置
	$scope.setCancellation = All.mainFiledList;

	$scope.setNav = function(mark){
		$scope.setNavMark = mark;
	}

	$scope.setCancel = function(){
		$scope.shadeMark = $scope.setMark = false;
	}

	//chart config
	var returnsChart = AmCharts.makeChart("returnsChart", {
	    "type": "serial",
	    "theme": "ssChartStyle",
	    "marginRight": 80,
	    "marginTop": 50,
	    "autoMarginOffset": 20,
	    "color": "#7B8082",
	    "dataProvider": [],
	    "categoryField": "date",
	    "valueAxes": [{
	        "axisAlpha": 0,
	        "dashLength": 0,
        	"position": "left",
//	        "autoGridCount": false,
//	        "gridCount": 10,
//      	"maximum": 4.6,
//      	"minimum": 2.6,
			"precision": 1,
        	"minMaxMultiplier": 2.5
	    }],
	    "graphs": [{
	    	"title":"实时报价曲线",
	        "valueField": "price",
	        "bullet": "round",
	        "bulletBorderAlpha": 1,
	        "bulletColor": "#FFDA9A",
	        "bulletBorderColor": "#000",
	        "bulletBorderThickness": 2,
	        "bulletSize": 8,
	        "lineThickness": 2,
	        "lineColor": "#FFDA9A",
	        "negativeLineColor": "#637bb6",
	        "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
	        "type": "smoothedLine"
	    }],
	    "legend": {
	    	"useGraphSettings": true,
	    	"align":"left",
	    	"position":"absolute",
	    	"top": 0,
	    	"valueWidth": 0,
	    },
	    "chartScrollbar": {
            "gridAlpha": 0,
            "scrollbarHeight": 30,
            "backgroundAlpha": 1,
            "backgroundColor": "#232628",
            "selectedBackgroundAlpha": 1,
            "selectedBackgroundColor": "#000",
			"oppositeAxis": false
	    },
	    "chartCursor": {
            "valueLineEnabled": true,
            "valueLineBalloonEnabled": true,
            "cursorAlpha": 0,
            "valueLineAlpha": 0.5,
            "cursorPosition": "mouse"
	    },
	    "categoryAxis": {
//	        "parseDates": true,
	        "axisColor": "transparent",
	        "gridPosition": "start",
	        "dashLength": 0,
	        "position": "bottom"
	    },
	    "export": {
	        "enabled": true
	    }
	});

	var priceChart = AmCharts.makeChart("priceChart", {
	    "type": "serial",
	    "theme": "ssChartStyle",
	    "marginRight": 80,
	    "marginTop": 30,
	    "autoMarginOffset": 20,
	    "color": "#7B8082",
	    "dataProvider": [],
	    "categoryField": "date",
	    "valueAxes": [{
	        "axisAlpha": 0,
	        "dashLength": 0,
        	"position": "left",
			"precision": 1,
        	"minMaxMultiplier": 1.5
	    }],
	    "graphs": [{
	    	"title":"ofr(%)",
	        "valueField": "ofr",
	        "bullet": "round",
	        "bulletBorderAlpha": 1,
	        "bulletColor": "#43adff",
	        "bulletBorderColor": "#000",
	        "bulletBorderThickness": 2,
	        "bulletSize": 8,
	        "lineThickness": 2,
	        "lineColor": "#43adff",
	        "negativeLineColor": "#637bb6",
	        "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[ofr]]</span></b>",
	        "type": "smoothedLine"
	    },{
	    	"title":"bid(%)",
	        "valueField": "bid",
	        "bullet": "round",
	        "bulletBorderAlpha": 1,
	        "bulletColor": "#fe900d",
	        "bulletBorderColor": "#000",
	        "bulletBorderThickness": 2,
	        "bulletSize": 8,
	        "lineThickness": 2,
	        "lineColor": "#fe900d",
	        "negativeLineColor": "#637bb6",
	        "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[bid]]</span></b>",
	        "type": "smoothedLine"
	    },{
	    	"title":"市场成交价(%)",
	        "valueField": "deal",
	        "bullet": "round",
	        "bulletBorderAlpha": 1,
	        "bulletColor": "#269930",
	        "bulletBorderColor": "#000",
	        "bulletBorderThickness": 2,
	        "bulletSize": 8,
	        "lineThickness": 2,
	        "lineColor": "transparent",
	        "negativeLineColor": "#637bb6",
	        "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[bid]]</span></b>",
	        "type": "smoothedLine"
	    }],
	    "legend": {
	    	"useGraphSettings": true,
	    	"align":"left",
	    	"position":"absolute",
	    	"top": -20,
	    	"valueWidth": 0,
	    	"markerSize": 10,
	    	"spacing": -30
	    },
	    "chartScrollbar": {
            "gridAlpha": 0,
            "scrollbarHeight": 30,
            "backgroundAlpha": 1,
            "backgroundColor": "#232628",
            "selectedBackgroundAlpha": 1,
            "selectedBackgroundColor": "#000",
			"oppositeAxis": false
	    },
	    "chartCursor": {
            "valueLineEnabled": true,
            "valueLineBalloonEnabled": true,
            "cursorAlpha": 0,
            "valueLineAlpha": 0.5,
            "cursorPosition": "mouse"
	    },
	    "categoryAxis": {
	        "axisColor": "transparent",
	        "gridPosition": "start",
	        "dashLength": 0,
	        "position": "bottom"
	    },
	    "export": {
	        "enabled": true
	    }
	});

	$http.get("./mock/data1.json").then(function(res){
			returnsChart.dataProvider = res.data;
			returnsChart.validateNow();
            returnsChart.validateData();
	})

	$http.get("./mock/data2.json").then(function(res){
            priceChart.dataProvider = res.data;
			priceChart.validateNow();
            priceChart.validateData();
	})

	//表格设置功能
	$scope.gridConfigArr = All.mainGridSetOption;

	$scope.onChangeState = function($event,obj){
//		obj.nowState = $event.newValue;
		obj.change = !obj.change;
	}

	$scope.gridSetCancel = function(){
		for(var i in $scope.gridConfigArr){
			if($scope.gridConfigArr[i].change){
				$scope.gridConfigArr[i].nowState = !$scope.gridConfigArr[i].nowState;
				$scope.gridConfigArr[i].change = false;
			}
		}
		$scope.shadeMark = $scope.gridConfigMark = false;
	}

	$scope.gridSetConfirm = function(){
		for(var i in $scope.gridConfigArr){
			searchColumnDefs($scope.gridConfigArr[i]);
			$scope.gridConfigArr[i].change = false;
		}
		$scope.gridApi.grid.refresh();
		$scope.shadeMark = $scope.gridConfigMark = false;
	}

	function searchColumnDefs(obj){
		var tempNameArr = [];
		for(var i in $scope.mainGridOption){
			tempNameArr.push($scope.mainGridOption[i].name);
		}
		var index = tempNameArr.indexOf(obj.name);

		if(obj.nowState){
			$scope.mainGridOption[index].visible = true;
		}else{
			$scope.mainGridOption[index].visible = false;
		}

	}

	//消息盒子
	$scope.infoBoxClose = function(){
		$scope.infoMark = false;
		$scope.infoList = [];
	}

	function infoTemp(info){
		$scope.infoMark = true;
		var str = $filter('date')(new Date(),'MM-dd HH:mm:ss') + " " + info;
		$scope.infoList.unshift({str:str,state:true});
		$timeout(function(){
			angular.forEach($scope.infoList, function(i,index){
				if(i.state){
					i.state = false;
				}
			})
		},1000);
	}


    $scope.cellTemplateHtml = function(tag, textColor){
	    let template = '';
        if(tag === All.mainColumnsData.mktBid) {
			template =
                '<div right-click id="' + tag + '_{{row.entity.productKey}}"' +
                	'ng-class="grid.appScope.quoteCellStatus(row.entity, 3);" ' +
					'class=\" ' + textColor + '{{row.entity.isNew}} ui-grid-cell-contents\">{{MODEL_COL_FIELD}}' +
						'<i ng-if="row.entity.mktBidPriceChange && row.entity.isNewBid" ' +
							'class="{{row.entity.isNewOfr}}">' +
								'<span>{{(row.entity.mktBidPriceChange < 0 && row.entity.mktBidPriceChange * -1) || row.entity.mktBidPriceChange}}</span>'+
						'</i>' +
				'</div>';

		}else if(tag === All.mainColumnsData.mktOfr){
			template =
                '<div right-click id="' + tag + '_{{row.entity.productKey}}"' +
                	'ng-class="grid.appScope.quoteCellStatus(row.entity, 3);" ' +
					'class=\"{{row.entity.isNew}} ui-grid-cell-contents\">{{MODEL_COL_FIELD}}' +
						'<i ng-if="row.entity.mktOfrPriceChange && row.entity.isNewOfr" ' +
							'class="{{row.entity.isNewOfr}}">' +
								'<span>{{(row.entity.mktOfrPriceChange < 0 && row.entity.mktOfrPriceChange * -1) || row.entity.mktOfrPriceChange}}</span>'+
						'</i>' +
				'</div>';
		}else if(tag === All.mainColumnsData.myOfr){
			template =
                '<div right-click id="' + tag + '_{{row.entity.productKey}}"' +
                	'ng-class="grid.appScope.quoteCellStatus(row.entity, 1);" ' +
					'class=\"{{row.entity.myOfrStatus.isFreeze}} ui-grid-cell-contents\">{{MODEL_COL_FIELD}}' +
						'<i ng-if="row.entity.myOfrStatus.isProcessing" ' +
							'class="quote-processing-icon glyphicon glyphicon-time">' +
						'</i>' +
				'</div>';

		}else if(tag === All.mainColumnsData.myBid){
			template =
				'<div right-click id="' + tag + '_{{row.entity.productKey}}"' +
					'ng-class="grid.appScope.quoteCellStatus(row.entity, 2);" ' +
					'class=\"{{row.entity.myBidStatus.isFreeze}} ui-grid-cell-contents\">{{MODEL_COL_FIELD}}' +
						'<i ng-if="row.entity.myBidStatus.isProcessing" ' +
							'class="quote-processing-icon glyphicon glyphicon-time">' +
						'</i>' +
				'</div>';

		}else if(tag === All.mainColumnsData.myBidVol){
			template =
				'<div right-click id="' + tag + '_{{row.entity.productKey}}"' +
					'class=\"{{row.entity.myBidStatus.isFreeze}} ui-grid-cell-contents\">{{MODEL_COL_FIELD}}' +
				'</div>';
		}else if(tag === All.mainColumnsData.myOfrVol){
			template =
				'<div right-click id="' + tag + '_{{row.entity.productKey}}"' +
					'class=\"{{row.entity.myOfrStatus.isFreeze}} ui-grid-cell-contents\">{{MODEL_COL_FIELD}}' +
				'</div>';
		}else{
            template = '<div id="' + tag + '_{{row.entity.productKey}}" class=\"ui-grid-cell-contents\" right-click>{{MODEL_COL_FIELD}}</div>';
        }

        return template;
	};

	$scope.quoteCellStatus = function (cell, column) {
		let style = "";
		if(column === 1){
            cell.myOfr && cell.myOfr === cell.mktBestOfr ? style += "best-quote-red" : '';
		}else if(column === 2){
            cell.myBid && cell.myBid === cell.mktBestBid ? style += "best-quote-red" : '';
		}
		return style;
	};

    $scope.dropdownTemplate =
            '<div>\
                <form name="inputForm">\
                    <select multiple ng-class="\'colt\' + col.uid" ui-grid-edit-dropdown ng-model="MODEL_COL_FIELD" ng-options="field[editDropdownIdLabel] as field[editDropdownValueLabel] CUSTOM_FILTERS for field in editDropdownOptionsArray"></select>\
                </form>\
            </div>';

    $scope.dropdownData = [
        {value:100, name:['a']},
        {value:200, name:['b']},
        {value:300, name:['c']},
        {value:400, name:['d']}
    ];

    $scope.mainGridOption = [
        {name: All.mainColumnsData.productKey, displayName:"合约品种_期限", enableCellEdit:false, cellTemplate: $scope.cellTemplateHtml(All.mainColumnsData.productKey), visible:true},
        {name: All.mainColumnsData.myOfrVol, displayName:"我的Ofr Vol", cellTemplate: $scope.cellTemplateHtml(All.mainColumnsData.myOfrVol), visible:true},
        {name: All.mainColumnsData.myOfr, displayName:"我的ofr", headerCellClass:"ss-text-ofr", cellClass:'ss-text-ofr', cellTemplate: $scope.cellTemplateHtml(All.mainColumnsData.myOfr), visible:true},
        {name: All.mainColumnsData.myBid, displayName:"我的Bid", headerCellClass:"ss-text-bid", cellClass:'ss-text-bid', cellTemplate: $scope.cellTemplateHtml(All.mainColumnsData.myBid), visible:true},
        {name: All.mainColumnsData.myBidVol, displayName:"我的Bid Vol", cellTemplate: $scope.cellTemplateHtml(All.mainColumnsData.myBidVol), visible:true},
        {name: All.mainColumnsData.mktOfrUpdateTime, displayName:"市场ofr更新", enableCellEdit:false, cellTemplate:$scope.cellTemplateHtml(All.mainColumnsData.mktOfrUpdateTime), visible:true},
        {name: All.mainColumnsData.mktOfrSource, displayName:"市场ofr来源", enableCellEdit:false, cellTemplate:$scope.cellTemplateHtml(All.mainColumnsData.mktOfrSource), visible:true},
        {name: All.mainColumnsData.mktOfrVol, displayName:"市场ofr vol", enableCellEdit:false, cellTemplate: $scope.cellTemplateHtml(All.mainColumnsData.mktOfrVol), visible:true},
        {name: All.mainColumnsData.mktOfr, displayName:"市场ofr", headerCellClass:"ss-text-ofr", cellClass:'ss-text-ofr', enableCellEdit:false, cellTemplate:$scope.cellTemplateHtml(All.mainColumnsData.mktOfr), visible:true},
        /*{name: All.mainColumnsData.marketOfrSource, displayName:"市场ofr来源",
         cellTemplate: $scope.cellTemplateHtml(All.mainColumnsData.marketOfrSource),
         editableCellTemplate:
         "<div>" +
         "<form name=\"inputForm\">" +
         "<select ng-class=\"'colt' + col.uid\" " +
         "               ui-grid-edit-dropdown " +
         "               ng-model=\"MODEL_COL_FIELD\" " +
         "               ng-options=\"field[editDropdownIdLabel] as field[editDropdownValueLabel] CUSTOM_FILTERS for field in editDropdownOptionsArray\">" +
         "</select>" +
         "</form>" +
         "</div>",
         editDropdownRowEntityOptionsArrayPath:'marketOfrSource', editDropdownValueLabel: 'name'},*/
        /*{name: All.mainColumnsData.marketOfrSource, displayName:"市场ofr来源", editableCellTemplate: 'ui-grid/dropdownEditor',
         // cellFilter: 'name',
         editDropdownOptionsFunction: function(rowEntity, colDef) {
         console.log(rowEntity);
         console.log(colDef);
         }},*/
        {name: All.mainColumnsData.mktMidPrice, displayName:"市场中间价", enableCellEdit:false, cellTemplate:$scope.cellTemplateHtml(All.mainColumnsData.mktMidPrice), visible:true},
        {name: All.mainColumnsData.mktBid, displayName:"市场bid",headerCellClass:"ss-text-bid", cellClass:'ss-text-bid', enableCellEdit:false, cellTemplate:$scope.cellTemplateHtml(All.mainColumnsData.mktBid), visible:true},
        {name: All.mainColumnsData.mktBidVol, displayName:"市场bid vol", enableCellEdit:false, cellTemplate:$scope.cellTemplateHtml(All.mainColumnsData.mktBidVol), visible:true},
        {name: All.mainColumnsData.mktBidSource, displayName:"市场bid来源", enableCellEdit:false, cellTemplate:$scope.cellTemplateHtml(All.mainColumnsData.mktBidSource), visible:true},
        {name: All.mainColumnsData.mktBidTime, displayName:"市场bid更新", enableCellEdit:false, cellTemplate:$scope.cellTemplateHtml(All.mainColumnsData.mktBidTime), visible:true},
		{name: All.mainColumnsData.prevClosePrice, displayName:"昨日收盘价", enableCellEdit:false, cellTemplate:$scope.cellTemplateHtml(All.mainColumnsData.prevClosePrice), visible:true},
        {name: All.mainColumnsData.tradePrice, displayName:"最新成交价", enableCellEdit:false, cellTemplate:$scope.cellTemplateHtml(All.mainColumnsData.tradePrice), visible:true},
        {name: All.mainColumnsData.tradeVol, displayName:"最新成交量", enableCellEdit:false, cellTemplate:$scope.cellTemplateHtml(All.mainColumnsData.tradeVol), visible:true},
        {name: All.mainColumnsData.tradeTime, displayName:"最新成交时间", enableCellEdit:false, cellTemplate:$scope.cellTemplateHtml(All.mainColumnsData.tradeTime), visible:true}
    ];

	$scope.mainDisplayData = {
		"Repo":[
			// {"agreementType":"repo","deadline":"1M","myOfr":"2.88","myOfrVol":"100","myBid":"2.33","myBidVol":"100","marketOfr":"100","marketOfrVol":"100","marketOfrSource":[{name:"国利"},{name:"兴业"},{name:"光大"}],"marketOfrUpdate":"13:14:15","marketbid":"2.88","marketBidVol":"100","marketBidSource":"国利","marketBidUpdate":"22:22:22","marketMiddlePrice":"999","yesterdayClosePrice":"666","latestTransactionPrice":"8.88","latestTransactionNum":"123","latestTransactionTime":"11:11:11"},
			{"merge":true, "title":"分栏名"},
            {"productKey":"Repo_6M","myOfr":"3.85","myOfrVol":"100","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid",
                "myOfrStatus":{"isFreeze":"","isProcessing":false,"newPriceChange":-0.5},"myOfrList":"","myBid":"3.71","myBidVol":"100","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"","isProcessing":false,"newPriceChange":0.5},"myBidList":"","mktOfr":"3.83","mktOfrVol":"100","mktOfrPriceChange":0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"3.73","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"3.78","prevClosePrice":"3.78","tradePrice":"3.78","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Repo_9M","myOfr":"","myOfrVol":"","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid",
                "myOfrStatus":{"isFreeze":"","isProcessing":false,"newPriceChange":-0.5},"myOfrList":"","myBid":"","myBidVol":"","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"","isProcessing":false,"newPriceChange":0.5},"myBidList":"","mktOfr":"3.89","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"CFETS","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"3.83","mktBidVol":"100","mktBidPriceChange":0.8,"mktBidSource":"CFETS","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"3.86","prevClosePrice":"3.86","tradePrice":"3.86","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Repo_1Y","myOfr":"4.00","myOfrVol":"100","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid",
                "myOfrStatus":{"isFreeze":"","isProcessing":true,"newPriceChange":-0.5},"myOfrList":"","myBid":"3.86","myBidVol":"100","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"","isProcessing":false,"newPriceChange":0.5},"myBidList":"","mktOfr":"3.98","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"CFETS","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"3.88","mktBidVol":"100","mktBidPriceChange":0.4,"mktBidSource":"CFETS","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"3.93","prevClosePrice":"3.93","tradePrice":"3.93","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Repo_2Y","myOfr":"4.09","myOfrVol":"100","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid",
                "myOfrStatus":{"isFreeze":"","isProcessing":false,"newPriceChange":-0.5},"myOfrList":"","myBid":"3.93","myBidVol":"100","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"","isProcessing":false,"newPriceChange":0.5},"myBidList":"","mktOfr":"4.07","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"3.95","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"4.01","prevClosePrice":"4.01","tradePrice":"4.01","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"4.09","mktBestBid":""},
            {"productKey":"Repo_3Y","myOfr":"4.22","myOfrVol":"100","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid",
                "myOfrStatus":{"isFreeze":"","isProcessing":false,"newPriceChange":-0.5},"myOfrList":"","myBid":"4.08","myBidVol":"100","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"","isProcessing":false,"newPriceChange":0.5},"myBidList":"","mktOfr":"4.2","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"4.1","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"4.15","prevClosePrice":"4.15","tradePrice":"4.15","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Repo_4Y","myOfr":"","myOfrVol":"","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid",
                "myOfrStatus":{"isFreeze":"","isProcessing":false,"newPriceChange":-0.5},"myOfrList":"","myBid":"","myBidVol":"","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"","isProcessing":false,"newPriceChange":0.5},"myBidList":"","mktOfr":"4.3","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"4.2","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"4.25","prevClosePrice":"4.25","tradePrice":"4.25","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Repo_5Y","myOfr":"","myOfrVol":"","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid",
                "myOfrStatus":{"isFreeze":"","isProcessing":false,"newPriceChange":-0.5},"myOfrList":"","myBid":"","myBidVol":"","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid",
                "myBidStatus":{"isFreeze":"","isProcessing":false,"newPriceChange":0.5},"myBidList":"","mktOfr":"4.38","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"4.32","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"4.35","prevClosePrice":"4.35","tradePrice":"4.35","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""}
		],

		"Shibor" : [
			{"merge":true, "title":"分栏名"},

            {"productKey":"Shibor_6M","myOfr":"3.85","myOfrVol":"100","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"3.71","myBidVol":"100","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"3.83","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"3.73","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"3.78","prevClosePrice":"3.78","tradePrice":"3.78","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Shibor_9M","myOfr":"","myOfrVol":"","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"","myBidVol":"","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"3.89","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"CFETS","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"3.83","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"CFETS","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"3.86","prevClosePrice":"3.86","tradePrice":"3.86","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Shibor_1Y","myOfr":"4.00","myOfrVol":"100","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"3.86","myBidVol":"100","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"3.98","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"CFETS","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"3.88","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"CFETS","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"3.93","prevClosePrice":"3.93","tradePrice":"3.93","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Shibor_2Y","myOfr":"4.09","myOfrVol":"100","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"3.93","myBidVol":"100","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"4.07","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"3.95","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"4.01","prevClosePrice":"4.01","tradePrice":"4.01","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Shibor_3Y","myOfr":"4.22","myOfrVol":"100","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"4.08","myBidVol":"100","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"4.2","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"4.1","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"4.15","prevClosePrice":"4.15","tradePrice":"4.15","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Shibor_4Y","myOfr":"","myOfrVol":"","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"","myBidVol":"","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"4.3","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"4.2","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"4.25","prevClosePrice":"4.25","tradePrice":"4.25","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Shibor_5Y","myOfr":"","myOfrVol":"","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"","myBidVol":"","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"4.38","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"4.32","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"4.35","prevClosePrice":"4.35","tradePrice":"4.35","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""}
		],

		"Spread" : [
			{"merge":true, "title":"分栏名"},
            {"productKey":"Repo_6M*9M","myOfr":"10.50","myOfrVol":"100","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"2.50","myBidVol":"100","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"8.5","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"4.5","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"6.50","prevClosePrice":"6.50","tradePrice":"6.50","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Repo_9M*1Y","myOfr":"9.00","myOfrVol":"100","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"1.00","myBidVol":"100","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"7","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"CFETS","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"3","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"CFETS","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"5.00","prevClosePrice":"5.00","tradePrice":"5.00","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Repo_1Y*2Y","myOfr":"","myOfrVol":"","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"","myBidVol":"","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"14","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"10","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"12.00","prevClosePrice":"12.00","tradePrice":"12.00","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Repo_1Y*3Y","myOfr":"","myOfrVol":"","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"","myBidVol":"","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"30","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"CFETS","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"26","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"CFETS","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"28.00","prevClosePrice":"28.00","tradePrice":"28.00","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Repo_1Y*5Y","myOfr":"","myOfrVol":"","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"","myBidVol":"","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"50","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"46","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"48.00","prevClosePrice":"48.00","tradePrice":"48.00","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Repo_2Y*3Y","myOfr":"","myOfrVol":"","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"","myBidVol":"","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"18","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"13","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"15.50","prevClosePrice":"15.50","tradePrice":"15.50","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Repo_2Y*5Y","myOfr":"40.00","myOfrVol":"100","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"32.00","myBidVol":"100","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"38","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"CFETS","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"34","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"CFETS","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"36.00","prevClosePrice":"36.00","tradePrice":"36.00","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Repo_3Y*4Y","myOfr":"","myOfrVol":"","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"","myBidVol":"","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"15","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"10","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"12.50","prevClosePrice":"12.50","tradePrice":"12.50","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Repo_3Y*5Y","myOfr":"","myOfrVol":"","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"","myBidVol":"","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"25","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"CFETS","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"21","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"CFETS","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"23.00","prevClosePrice":"23.00","tradePrice":"23.00","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""},
            {"productKey":"Repo_4Y*5Y","myOfr":"14.50","myOfrVol":"100","myOfrOrderId":"ofr-order-001","myOfrOrderStatus":"valid","myOfrStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":-0.5},"myOfrList":"","myBid":"6.50","myBidVol":"100","myBidOrderId":"bid-order-001","myBidOrderStatus":"valid","myBidStatus":{"isFreeze":"true","isProcessing":"true","newPriceChange":0.5},"myBidList":"","mktOfr":"12.5","mktOfrVol":"100","mktOfrPriceChange":-0.6,"mktOfrSource":"国利","mktOfrUpdateTime":"14:14:15","mktOfrList":"","mktOfrSrcList":"","mktBid":"8.5","mktBidVol":"100","mktBidPriceChange":-0.6,"mktBidSource":"国利","mktBidTime":"14:22:22","mktBidList":"","mktBidSrcList":"","mktMidPrice":"10.50","prevClosePrice":"10.50","tradePrice":"10.50","tradeVol":"123","tradeTime":"14:11:21","tradeType":"","mktBestOfr":"","mktBestBid":""}

        ]
	};

    var cellLinkageSet = null;
    var currentCells = null;        //当前选中的单元格
    var cellLinkageId = "";        //current selected-linkage cell
    var cellId = "";            //current selected cell

    $scope.mainGridOptionsView = {
        rowTemplate: rowTemplate(),
        enableSorting: false,
        enableFullRowSelection: true,
        enableColumnMenus: false,
        enableRowSelection: false,
        enableRowHeaderSelection: false,
        multiSelect: false,
        noUnselect: true,
        modifierKeysToMultiSelectCells:true,
        // enableColumnMoving: true, //default true
        enableCellSelection: true,
        // enableCellEdit: false,
        enableCellEditOnFocus : false,
        minRowsToShow: 18,
        enableColumnResizing: true,
        columnDefs: $scope.mainGridOption,
        data: $scope.mainDisplayData.Repo,

        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row, d, i) {

            });

            gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
                console.log('edit~~~~~~');
                console.log(rowEntity);
                console.log(colDef);
                console.log(oldValue);
                console.log(newValue);
            });

            //onChange selected cell...
            var ctrlActiveCell = [];    //ctrl key multi select cells.
            var currentActiveCell = [];  //normal select cell. **only one cell or linkage cell..
            cellLinkageSet = new Set();
            cellLinkageId = "";
            cellId = "";

            gridApi.cellNav.raise.navigate = function (d) {

                let rightClickToCopy = angular.element(document.querySelector("#rightClickToCopy"));
                rightClickToCopy && rightClickToCopy.parent().children(0).removeClass('ui-grid-cell-focus').children(1).remove();
                // debugger;
                cellId = d.col.field + "_" + d.row.entity.productKey;
                cellLinkageId = getLinkageCellId(d.col.field, d.row);
                let isPreLinkageCell = true;
                if(currentActiveCell.filter(i=>typeof (i) === 'string')[0] === cellId){//当前联动cell已被选中.
                    isPreLinkageCell = false;
                }

                if(isPreLinkageCell){
                    currentActiveCell.length = 0;
                    cellLinkageId && cellLinkageSet.add(cellLinkageId);
                    // debugger;
                    if(!window.event.ctrlKey){
                        currentActiveCell.push(d);
                        if(cellLinkageId){
                            currentActiveCell.push(cellLinkageId);
                            for(let i of cellLinkageSet.values()){
                                if(i !== cellLinkageId && i !== cellId){
                                    angular.element(document.querySelector("#" + i)).removeClass("ui-grid-cell-focus");
                                }
                            }
							angular.element(document.querySelector("#" + cellLinkageId)).addClass("ui-grid-cell-focus");
                        }else {
                            if(cellLinkageSet.size > 0){
                                for(let i of cellLinkageSet.values()){
                                    let linkageDom = angular.element(document.querySelector("#" + i));
                                    if(linkageDom.hasClass("ui-grid-cell-focus")){
                                        linkageDom.removeClass("ui-grid-cell-focus");
                                    }
                                }
                                cellLinkageSet.clear();
                            }
                        }
                    }else{
                        ctrlActiveCell = d.row.grid.cellNav.focusedCells;
                    }
					cellNavRow = d.row.grid.cellNav; //always sure that lastRow has attribute of cellId when selected linkage cell;
                }
            };

            let cellNavRow = null;//deleting after using---
            let preCell = [];
            gridApi.cellNav.getCurrentSelection = function () {
                if(!window.event.ctrlKey && cellLinkageId && cellNavRow && cellNavRow.focusedCells.length === 1){
                    //always ensure that lastRow has attribute of cellId when selected linkage cell;
                    defineSetterToCell(cellLinkageId, cellNavRow.focusedCells[0]);
                    ctrlActiveCell[0] = cellNavRow.focusedCells[0];
                    cellNavRow = null;
                }

                if(window.event && window .event.ctrlKey){
                    // debugger;
                    if(preCell && preCell.length > ctrlActiveCell.length){//unselected
                        cellLinkageId && angular.element(document.querySelector("#" + cellLinkageId)).removeClass("ui-grid-cell-focus");
                        for(let i in preCell){
                            if(ctrlActiveCell.includes(preCell[i])){
                                preCell[i] = undefined;
                            }
                        }
                        angular.element(document.querySelector("#" + preCell.filter(i=>i)[0].cellId)).removeClass("ui-grid-cell-focus");

                    }else {//selected
                        let length = ctrlActiveCell.length;
                        if(cellLinkageId){//若选中cell是已选中联动cell的另一半,则remove选中cell 对象,保证不重复.
                            let isFirstSelected = true;
                            for(let i in ctrlActiveCell){
                                if(ctrlActiveCell[i].cellId === cellId){
                                    ctrlActiveCell.pop();//移除最后一次选中 关键!!!
                                    ctrlActiveCell.splice(i, 1);//移除联动cell
                                    angular.element(document.querySelector("#" + cellId)).removeClass("ui-grid-cell-focus");
                                    angular.element(document.querySelector("#" + cellLinkageId)).removeClass("ui-grid-cell-focus");
                                    isFirstSelected = false;
                                }
                            }

                            if(isFirstSelected){
                                let currentCell = ctrlActiveCell[length - 1];
                                angular.element(document.querySelector("#" + cellId)).addClass("ui-grid-cell-focus");
                                angular.element(document.querySelector("#" + cellLinkageId)).addClass("ui-grid-cell-focus");
                                defineSetterToCell(cellLinkageId, currentCell);
                            }
                        }else{
                            //(联动)选中+反选+选中,此时cellId/cellLinkageId 因为无法进入navigate函数获取不到value,所以需要手动赋值.
                            let currentCell = ctrlActiveCell[length - 1];
                            defineSetterToCell(getLinkageCellId(currentCell.col.field, currentCell.row), currentCell, true);
                        }
                    }

                    cellLinkageId = cellId = undefined;
                    preCell.length = 0;
                    for(let i in ctrlActiveCell){
                        preCell.push(ctrlActiveCell[i]);
                    }
				}else {
                    preCell = [];
                    ctrlActiveCell = [];
                    angular.element(document.querySelector('#' + cellLinkageId)).addClass("ui-grid-cell-focus");
                }
                currentCells = ctrlActiveCell.length ? ctrlActiveCell : currentActiveCell;//单元格数据汇总~~
                console.log(currentCells);
            };
        }
    };

    function defineSetterToCell(cellLinkageId, obj, isOperationDom) {
        if(cellLinkageId){
            obj.__defineSetter__('linkageCell', function (v) {
                this.cellId = v;
            });
            obj.linkageCell = cellLinkageId;
            isOperationDom && angular.element(document.querySelector("#" + cellLinkageId)).addClass("ui-grid-cell-focus");
        }
    }


    function getLinkageCellId(field, row) {
        let cellLinkageId = undefined;
        switch (field) {
            case All.mainColumnsData.myOfr:
                cellLinkageId = All.mainColumnsData.myOfrVol;
                break;
            case All.mainColumnsData.myOfrVol:
                cellLinkageId = All.mainColumnsData.myOfr;
                break;
            case All.mainColumnsData.myBid:
                cellLinkageId = All.mainColumnsData.myBidVol;
                break;
            case All.mainColumnsData.myBidVol:
                cellLinkageId = All.mainColumnsData.myBid;
                break;
            case All.mainColumnsData.mktOfr:
                cellLinkageId = All.mainColumnsData.mktOfrVol;
                break;
            case All.mainColumnsData.mktOfrVol:
                cellLinkageId = All.mainColumnsData.mktOfr;
                break;
            case All.mainColumnsData.mktBid:
                cellLinkageId = All.mainColumnsData.mktBidVol;
                break;
            case All.mainColumnsData.mktBidVol:
                cellLinkageId = All.mainColumnsData.mktBid;
                break;
            default :
                cellLinkageId = undefined;
        }
		if(cellLinkageId){
			cellLinkageId += "_" + row.entity.productKey;
		}
		return cellLinkageId;
    };

    //initially ui-gird cells..
    function rowTemplate() {
        return '<div ng-class="{ \'my-css-class\': grid.appScope.functionULike()}">' +
            '<div ng-if="row.entity.merge">{{row.entity.title}}</div>' +
            '<div ng-if="!row.entity.merge" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell id="{{col.colDef.name}}_{{row.uid}}"></div></div>';
    }

    setInterval(function () {
        let index = ~~(Math.random() * 7 + 1);
        let oo = $scope.mainDisplayData.Repo[index];
        let myOfrStatus = oo.myOfrStatus;
        oo.mktOfr = (Math.random()*3 + 1).toFixed(2);
        oo.isNew = 'cell-bling-bling';

        let priceState = (Math.random() * 2 - 1).toFixed(1);
        oo.isNewOfr = priceState > 0 ? "glyphicon glyphicon-triangle-top quote-up-change" : "glyphicon glyphicon-triangle-bottom quote-down-change";
        oo.mktOfrPriceChange = (Math.random() * 2 - 1).toFixed(1);
		// myOfrStatus.isFreeze ? myOfrStatus.isFreeze = '' : '';
		oo.myOfr === '' ? oo.myOfr = (Math.random()*3 + 1).toFixed(3) : '';

		let updateCell = angular.element(document.querySelector("#" +All.mainColumnsData.mktOfr + "_" + oo.productKey));
        if(updateCell.hasClass('cell-bling-bling')){
            updateCell.removeClass('cell-bling-bling');
            setTimeout(function () {
                updateCell.addClass('cell-bling-bling');
            }, 100);
        }

        $scope.$apply();
    }, ~~(Math.random() * 100000));

});