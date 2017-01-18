angular.module("appModule").
controller('loginController', function ($scope, $state) {
	$scope.erroTip = false;
	$scope.propA = true;
    $scope.login = function(user,pwd){
    	if(user=="admin" && pwd=="admin"){
    		$scope.erroTip = false;
    		$state.go("main");
    	}else{
    		$scope.errorTip = true;
    		alert("用户名:admin，密码:admin");
    	}
    }
})
