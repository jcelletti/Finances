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
			DateTime: 'dateTime',
			Renters: 'renters',
			Rents: 'rents'
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
		'spaModals', 'Renters', 'Rents', 'spaLocation',
		function (modals, renters, rents, locationManager) {
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
						pre: function (scope, element) {
							scope.Contents = {
								Template: null,
								RentsLoaded: false,
								RentersLoaded: false
							};

							renters.Set(function () {
								scope.Contents.RentersLoaded = true;
							});

							rents.Set(function () {
								scope.Contents.RentsLoaded = true;
							});

							locationManager.Initialize(scope, element, function (template) {
								scope.Contents.Template = 'spa-' + template;
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
		'Rents', 'dgColumn', 'dgFunction', 'spaLocation',
		function (rents, Column, Function, lm) {
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
										lm.SetParam(lm.Parameters.rent, row.Data.Id);
										lm.SetLocation(lm.Pages.reciepts);
									}),
									new Function('Payments', function (row) {
										lm.SetParam(lm.Parameters.rent, row.Data.Id);
										lm.SetLocation(lm.Pages.payments);
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
	])
	.directive('spaReceipts', [
		'HttpGet', 'dgColumn', 'dgFunction', 'spaLocation',
		function (get, Column, Function, lm) {
			return {
				restrict: 'E',
				replace: true,
				transclude: true,
				compile: function () {
					return {
						pre: function (scope) {
							scope.Contents = {
								Receipts: [],
								Actions: [
									new Function('Payments', function (row) {
										lm.SetParam(lm.Parameters.receipt, row.Data.Id);
										lm.SetLocation(lm.Pages.payments);
									})
								],
								Columns: [
									new Column({
										binding: 'Name',
										visible: true
									}),
									new Column({
										title: 'Month',
										binding: 'Date',
										visible: true,
										dataType: SPA.Config.DataTypes.Date,
										dateFormat: SPA.Config.DateFormats.Day
									}),
									new Column({
										binding: 'Tip',
										visible: true
									}),
									new Column({
										binding: 'Tax',
										visible: true
									}),
									new Column({
										binding: 'Total',
										visible: true
									}),
								]
							};

							get.Receipts(lm.GetParam(lm.Parameters.rent))
								.then(function (receipts) {
									scope.Contents.Receipts = receipts;
								});
						}
					};
				},
				templateUrl: SPA.Template('spa-receipts'),
				scope: {
				}
			}
		}
	])
	.directive('spaPayments', [
		'HttpGet', 'dgColumn', 'dgFunction', 'spaLocation',
		function (get, Column, Function, lm) {
			return {
				restrict: 'E',
				replace: true,
				transclude: true,
				compile: function () {
					return {
						pre: function (scope) {
							scope.Contents = {
								Payments: [],
								Actions: [],
								Columns: [
									new Column({
										binding: 'Tip',
										visible: true
									}),
									new Column({
										binding: 'Tax',
										visible: true
									}),
									new Column({
										title: 'Total',
										binding: 'Amount',
										visible: true
									}),
									new Column({
										title: 'Payer',
										binding: 'Payer',
										dataType: SPA.Config.DataTypes.Renters,
										visible: true
									})
								]
							};

							get.Payments(lm.GetParam(lm.Parameters.receipt), lm.GetParam(lm.Parameters.rent))
								.then(function (payments) {
									scope.Contents.Payments = payments;
								});
						}
					};
				},
				templateUrl: SPA.Template('spa-payments'),
				scope: {
				}
			}
		}
	])
	.service('spaLocation', [
		'$location',
		function ($location) {
			var svc = this;

			//todo: add breadcrumbs

			var pages = {
				rents: 'rents',
				reciepts: 'receipts',
				payments: 'payments'
			};

			svc.Pages = pages;

			svc.Parameters = {
				rent: 'rent-id',
				receipt: 'reciept-id'
			};

			var pageHash = {};

			$.each(pages, function (key, val) {
				pageHash[key] = '/' + val;
			});

			var currentLocation = function () {
				switch ($location.path()) {
					case pageHash.reciepts:
						return pages.reciepts;
					case pageHash.payments:
						return pages.payments;
					case pageHash.rents:
					default:
						return pages.rents;
				}
			};

			var pageToLocation = function (page) {
				switch (page) {
					case pages.reciepts:
						return pageHash.reciepts;
					case pages.payments:
						return pageHash.payments;
					case pages.rents:
					default:
						return pageHash.rents;
				}
			};

			var getPage = function (template, text) {
				return {
					template: template,
					text: text
				};
			};

			//svc.Pages = function () {
			//	return [
			//		getPage(pageHash.rents),
			//		getPage(pageHash.reciepts),
			//		getPage(pageHash.payments)
			//	];
			//};

			svc.Initialize = function (scope, element, templateChangeCallback) {
				var onWatch = scope.$on('$locationChangeSuccess', function () {
					scope.Contents.loading = true;
					templateChangeCallback(currentLocation());
				});

				element.on('$destroy', function () {
					onWatch();
				});

				$location.path(currentLocation());
			};

			svc.SetLocation = function (tabName) {
				$location.path(pageToLocation(tabName));
			};

			svc.SetParam = function (key, value) {
				var trimVal = $.trim(value);

				var hash = $location.search();
				if (trimVal.length === 0) {
					hash[key] = null;
				} else {
					hash[key] = trimVal;
				};

				$location.search(hash);
			};

			svc.GetParam = function (key) {
				return $location.search()[key];
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

				r.FullName = renter.fullName;
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
		})
	.factory('Receipt',
		function () {
			return function (receipt) {
				var r = this;

				r.Id = receipt.id;
				r.RentId = receipt.rentId;

				r.Name = receipt.name;
				r.Date = new moment(receipt.date);
				r.Tip = receipt.tip;
				r.Tax = receipt.tax;
				r.Total = receipt.total;
			}
		})
	.factory('Payment',
		function () {
			return function (payment) {
				var p = this;

				p.Id = payment.id;
				p.ReceiptId = payment.receiptId;

				p.Payer = payment.payer;
				p.Tax = payment.tax;
				p.Tip = payment.tip;
				p.Amount = payment.paymentAmount;
			};
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
			var hash = {};

			var reset = function (callback) {
				get.Renters()
					.then(function (result) {
						renters = result;

						hash = {};

						$.each(renters, function (i, r) {
							hash[r.Id] = r;
						});


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
				},
				GetHash: function () {
					return hash;
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
	])
	.directive('spaAttrs',
		function () {
			return {
				restrict: 'A',
				replace: false,
				transclude: false,
				compile: function () {
					return {
						pre: function (scope, element) {
							$.each(scope.attrs, function (key, val) {
								element.attr(key, val);
							});
						}
					};
				},
				scope: {
					attrs: '=spaAttrs'
				}
			};
		});

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
							//console.log(r);

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
		'$http', 'HttpDefer', 'Renter', 'Rent', 'Receipt', 'Payment',
		function ($http, Defer, Renter, Rent, Receipt, Payment) {
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

			svc.Receipts = function (rentId) {
				return new Defer(function () {
					var url = 'Receipt';

					var tRentId = $.trim(rentId);

					if (tRentId.length > 0) {
						url += '/' + tRentId + '/ByRent';
					};

					return $http.get(url);
				}, Receipt)
			};

			svc.Payments = function (receiptId, rentId) {
				return new Defer(function () {
					var url = 'Payment';

					var tReceiptId = $.trim(receiptId);
					var tRentId = $.trim(rentId);

					if (tReceiptId.length > 0) {
						url += '/' + tReceiptId + '/ByReceipt';
					} else if (tRentId.length > 0) {
						url += '/' + tRentId + '/ByRent';
					};

					return $http.get(url);
				}, Payment);
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

angular.module('SPA.Data.Grid', ['SPA.Extensions'])
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
								Rows: [],
								ButtonWidth: 100 * scope.actions.length + 'px',
								ShowActions: scope.actions.length > 0
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

				var previous = {};
				r.SetEditing = function () {
					previous = {};

					$.extend(previous, r.Data);

					r.IsEditing = true;
				};

				r.CancelEdit = function () {
					var cancelData = {};

					$.extend(cancelData, previous);

					previous = {};

					r.Data = cancelData;

					r.IsEditing = false;
				};
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
					case SPA.Config.DataTypes.Renters:
						return 'renters';
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
				if (!$.isFunction(callback)) {
					callback = function () {
						alert('The function for this event was never set. See console for more info');
						console.error('The callback function was never set', f);
					};
				};

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
							scope.Contents = {
								Value: scope.row.Data[scope.column.Binding]
							};
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
					var getOptions = function (col) {
						var format = 'day';

						if (col.DateFormat === SPA.Config.DateFormats.Month) {
							format = 'month'
						} else if (col.DateFormat === SPA.Config.DateFormats.Year) {
							format = 'year';
						};

						return {
							Mode: format,
							PickerOptions: {}
						};
					};

					return {
						pre: function (scope) {
							scope.Contents = {
								Format: scope.row.Data[scope.column.Binding].format(scope.column.DateFormat),
								EditValue: scope.row.Data[scope.column.Binding].clone(),
								Options: getOptions(scope.column)
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
		})
	.directive('dgRenters', [
		'Renters',
		function (renters) {
			return {
				restrict: 'E',
				replace: true,
				transclude: true,
				compile: function () {
					return {
						pre: function (scope) {
							scope.Contents = {
								Name: null,
								Value: null,
								Renters: renters.GetHash()
							};

							scope.Contents.Value = scope.row.Data[scope.column.Binding];
							scope.Contents.Name = scope.Contents.Renters[scope.Contents.Value].FullName

							//todo: update on change
						},
						post: function (scope) {

						}
					};
				},
				templateUrl: SPA.Template('dg-renters', 'DataGrid'),
				scope: {
					row: '=',
					column: '='
				}
			};
		}
	]);