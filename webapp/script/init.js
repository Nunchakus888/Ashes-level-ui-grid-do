angular.module("appModule",
	["ui.router", 'avalon.ui', 'ConstantModule', 'ui.bootstrap', 'angular-sortable-view',
		'ui.grid', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.pagination', 'ui.grid.selection', 'my.ui.grid.autoResize', 'ui.grid.moveColumns', 'ui.grid.cellNav', 'ngclipboard']).
config(function($stateProvider,$urlRouterProvider,$qProvider){
	$qProvider.errorOnUnhandledRejections(false);
	$urlRouterProvider.otherwise("/login");
	$stateProvider.state('login',{
		url : "/login",
		templateUrl: "./templates/login.html",
		controller: 'loginController'
	}).state("main" ,{
		url : "/main",
		templateUrl: "./templates/main.html",
		controller: 'mainController'
	}).state("history" ,{
		url : "/history",
		templateUrl: "./templates/history.html",
		controller: 'historyController'
	})
});
