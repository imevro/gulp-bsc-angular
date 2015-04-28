'use strict';

const app = angular.module('gulpbsc', ['ui.router']);

app.config(($locationProvider, $urlRouterProvider, $stateProvider) => {
  $locationProvider.html5Mode(true).hashPrefix('!');
  $urlRouterProvider.otherwise('/');

  $stateProvider.state('landing', {
    url: '/',
    templateUrl: '/views/landing.html'
  });
});