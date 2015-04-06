'use strict';
var SPA = function () {
	var appPath = '/';

	return {
		AppPath: function (path) {
			if (!!path) {
				appPath = path;
			};

			return appPath;
		},
		Template: function (name, folder) {

			var path = appPath + 'NgTemplates/';

			if (!!folder) {
				path += folder + '/';
			};

			return path + name + '.html';
		}
	};
}();

SPA.Config = function () {
	return {
		DataTypes: {
			string: 'string',
			Date: 'date',
			Time: 'time',
			DateTime: 'dateTime'
		},
		DateFormats: {
			Day: 'MMMM DD, YYYY',
			Month: 'MMMM YYYY',
			Year: 'YYYY'
		},
		DataTypeIsDate: function (dt) {
			return dt === SPA.Config.DataTypes.Date ||
				dt === SPA.Config.DataTypes.Time ||
				dt === SPA.Config.DataTypes.DateTime;
		}
	};
}();

angular.module('SPA', ['SPA.Extensions', 'SPA.Data.Grid'])
	.directive('spaMain', [
		'spaModals', 'Renters', 'Rents',
		function (modals, renters, rents) {
			return {
				restrict: 'A',
				replace: false,
				transclude: false,
				controller: [
					'$scope',
					function ($scope) {
					}
				],
				compile: function () {
					return {
						pre: function (scope) {
							scope.Contents = {
								Template: 'spa-rents',
								RentsLoaded: false,
								RentersLoaded: false
							};

							renters.Set(function () {
								scope.Contents.RentersLoaded = true;
							});

							rents.Set(function () {
								scope.Contents.RentsLoaded = true;
							});

						},
						post: function (scope) {
						}
					};
				}
			};
		}
	])
	.directive('spaRents', [
		'Rents', 'dgColumn', 'dgFunction',
		function (rents, Column, Function) {
			return {
				restrict: 'E',
				replace: true,
				transclude: true,
				compile: function () {
					return {
						pre: function (scope) {
							scope.Contents = {
								Rents: rents.Get(),
								Actions: [
									new Function('Receipts', function (row) {
										//navigate to receipts
										console.log('go to receipts', row.Data.Id);
									}),
									new Function('Payments', function (row) {
										//navigate to payments
										console.log('go to payments', row.Data.Id);
									}),
								],
								Columns: [
									new Column({
										binding: 'Name'
									}),
									new Column({
										title: 'Month',
										binding: 'Date',
										visible: true,
										dataType: SPA.Config.DataTypes.Date,
										dateFormat: SPA.Config.DateFormats.Month
									})
								]
							};
						}
					};
				},
				templateUrl: SPA.Template('spa-rents'),
				scope: {
				}
			};
		}
	]);

angular.module('SPA.models', [])
	.factory('Renter',
		function () {
			return function (renter) {
				var r = this;

				r.Id = renter.id;

				r.First = renter.first;
				r.Last = renter.last;
			}
		})
	.factory('Rent',
		function () {
			return function (rent) {
				var r = this;

				r.Id = rent.id;
				r.Name = rent.name
				r.Date = new moment(rent.month);
			}
		});

angular.module('SPA.Extensions', ['ui.bootstrap', 'SPA.HTTP'])
	.service('spaModals', [
		'$modal',
		function ($modal) {
			var svc = this;
		}
	])
	.service('Renters', [
		'HttpGet',
		function (get) {
			var renters = [];

			var reset = function (callback) {
				get.Renters()
					.then(function (result) {
						renters = result;

						if ($.isFunction(callback)) {
							callback(renters);
						};
					});
			};

			return {
				Set: function (callback) {
					reset(callback);
				},
				Get: function () {
					return renters;
				}
			};
		}
	])
	.service('Rents', [
		'HttpGet',
		function (get) {
			var rents = [];

			var reset = function (callback) {
				get.Rents()
					.then(function (result) {
						rents = result;

						if ($.isFunction(callback)) {
							callback(rents);
						};
					});
			};

			return {
				Set: function (callback) {
					reset(callback);
				},
				Get: function () {
					return rents;
				}
			};

		}
	])
	.directive('spaDynamic', [
		'$compile',
		function ($compile) {
			return {
				restrict: 'AE',
				replace: true,
				transclude: true,
				compile: function () {
					return {
						pre: function (scope, element) {
							var watcher = scope.$watch('template', function (newTemplate) {

								if (!newTemplate) {
									element.empty();

									return;
								};

								var hashString = '';

								$.each(scope.hash || {}, function (key, val) {
									hashString += key + '="hash.' + key + '" ';

								});

								var newEl = $('<' + newTemplate + ' ' + hashString + '></' + newTemplate + '>');

								element.html($compile(newEl)(scope));
							});

							element.on('$destroy', function () {
								watcher();
							});
						}
					}
				},
				scope: {
					template: '=',
					hash: '='
				}
			};
		}
	]);

angular.module('SPA.HTTP', ['ui.bootstrap', 'SPA.models'])
	.config([
		'$httpProvider',
		function ($httpProvider) {
			$httpProvider.interceptors.push([
				'$q',
				function ($q) {
					return {
						requestError: function (r) {
							console.log(r);
							return $q.reject(r);
						},
						responseError: function (r) {
							console.log(r);

							return $q.reject(r);
						}
					};
				}
			]);
		}
	])
	.factory('HttpDefer', [
		'$q', '$log',
		function ($q, $log) {
			return function (httpCallback, resolver, errorCallback) {
				var def = $q.defer();

				httpCallback(def)
					.success(function (response) {
						if ($.isArray(response)) {
							var outArr = [];

							$.each(response, function (i, r) {
								outArr.push(new resolver(r));
							});

							def.resolve(outArr);
							return;
						};

						def.resolve(new resolver(response));
					})
					.error(function (error, status, headers, requestData) {
						def.reject(error);
					});

				def.promise.catch(function (error) {
					$log.error(error);
				});

				return def.promise;
			};
		}
	])
	.service('HttpGet', [
		'$http', 'HttpDefer', 'Renter', 'Rent',
		function ($http, Defer, Renter, Rent) {
			var svc = this;

			svc.Renters = function () {
				return new Defer(function () {
					return $http.get('Renter');
				}, Renter);
			};

			svc.Rents = function () {
				return new Defer(function () {
					return $http.get('Rent');
				}, Rent);
			};
		}
	])
	.service('HttpPost', [
		'$http',
		function ($http) {
			var svc = this;
		}
	])
	.service('HttpPut', [
		'$http',
		function ($http) {
			var svc = this;
		}
	])
	.service('HttpDelete', [
		'$http',
		function ($http) {
			var svc = this;
		}
	]);

angular.module('SPA.Data.Grid', [])
	.directive('spaDataGrid', [
		'dgRow',
		function (Row) {
			return {
				restrict: 'E',
				replace: true,
				transcude: true,
				compile: function () {
					return {
						pre: function (scope, element) {
							scope.Contents = {
								Rows: []
							};

							var watcher = scope.$watch('data.length', function () {
								var rows = [];

								$.each(scope.data, function (i, r) {
									rows.push(new Row(r));
								});

								scope.Contents.Rows = rows;

							});

							element.on('$destroy', function () {
								watcher();
							});
						},
						post: function (scope) { }
					};
				},
				templateUrl: SPA.Template('spa-data-grid', 'DataGrid'),
				scope: {
					data: '=',
					columns: '=',
					actions: '='
				}
			};
		}
	])
	.factory('dgRow',
		function () {
			return function (data) {
				var r = this;

				r.Selected = false;
				r.IsEditing = false;
				r.Data = data;
			};
		})
	.factory('dgColumn',
		function () {

			var getTemplate = function (dt) {
				switch (dt) {
					case SPA.Config.DataTypes.Date:
					case SPA.Config.DataTypes.Time:
					case SPA.Config.DataTypes.DateTime:
						return 'date-time';
					case SPA.Config.DataTypes.String:
					default:
						return 'string';
				};
			};

			return function (args) {
				var c = this;

				var innerArgs = {
					dataType: SPA.Config.DataTypes.string,
					visible: false,
					dateFormat: SPA.Config.DateFormats.Year
				};

				$.extend(innerArgs, args);

				c.Title = innerArgs.title || innerArgs.binding;
				c.Binding = innerArgs.binding;
				c.DataType = innerArgs.dataType;
				c.DateFormat = innerArgs.dateFormat;

				c.Visible = innerArgs.visible === true;

				c.Template = 'dg-' + getTemplate(innerArgs.dataType);
			}
		})
	.factory('dgFunction',
		function () {
			return function (text, callback) {
				var f = this;

				f.Text = text;
				f.Click = callback;
			}
		}
	)
	.directive('dgString',
		function () {
			return {
				restrict: 'E',
				replace: true,
				transclude: true,
				compile: function () {
					return {
						pre: function (scope) {

						},
						post: function (scope) {

						}
					};
				},
				templateUrl: SPA.Template('dg-string', 'DataGrid'),
				scope: {
					row: '=',
					column: '='
				}
			};
		})
	.directive('dgDateTime',
		function () {
			return {
				restrict: 'E',
				replace: true,
				transclude: true,
				compile: function () {
					return {
						pre: function (scope) {
							scope.Contents = {
								Format: scope.row.Data[scope.column.Binding].format(scope.column.DateFormat)
							};
						},
						post: function (scope) {

						}
					};
				},
				templateUrl: SPA.Template('dg-date-time', 'DataGrid'),
				scope: {
					row: '=',
					column: '='
				}
			};
		});