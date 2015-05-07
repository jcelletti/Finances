'use strict';
angular.module('SPA.Extensions', ['ui.bootstrap', 'SPA.HTTP'])
	.service('spaModals', [
		'$modal',
		function ($modal) {
			var svc = this;

			svc.Validation = function (validations, showAll) {
				//todo: modal saying who owes what

				validations.sort(function (v1, v2) {
					var owed1 = v1.Owed;
					var owed2 = v2.Owed;

					if (!v1.Owes) {
						owed1 = owed1 * -1;
					};

					if (!v2.Owes) {
						owed2 = owed2 * -1;
					};

					return owed1 - owed2;
				});

				$modal.open({
					templateUrl: SPA.Template('validation', 'Modals'),
					controller: function ($scope) {
						$scope.Contents = {
							Validations: validations,
							ShowAll: showAll === true
						};

						$scope.Functions = {
							Filter: function () {
								return function (val) {
									if ($scope.Contents.ShowAll) {
										return true;
									};

									return val.Owes;
								}
							},
							ShowAll: function () {
								$scope.Contents.ShowAll = !$scope.Contents.ShowAll;
							}
						};
					}
				});
			};
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
		'HttpGet', 'HttpPost', 'HttpPut', 'HttpDelete', 'HttpValidate',
		function (get, post, put, httpDelete, validate) {
			var rents = [];
			var hash = {};


			var reset = function (callback) {
				get.Rents()
					.then(function (result) {
						rents = result;
						$.each(rents, function (i, rent) {
							hash[rent.Id] = rent;
						});

						if ($.isFunction(callback)) {
							callback(rents);
						};
					});
			};

			return {
				Set: function (callback) {
					reset(callback);
				},
				Get: function (rentId) {
					if (!!rentId) {
						return hash[rentId];
					};

					return rents;
				},
				Add: function (callback) {
					post.Rent()
						.then(function (result) {
							rents.push(result);

							if ($.isFunction(callback)) {
								callback(rents);
							};
						});
				},
				Delete: function (id, callback) {
					httpDelete.Rent(id)
						.then(function () {
							reset(callback);
						});
				},
				Validate: function (id, callback) {
					return validate.Rent(id);
				},
				Save: function (rent) {
					put.Rent({
						id: rent.Id,
						month: rent.Date.toISOString(),
						name: rent.Date.format('MMMM YYYY')
					});
				}
			};
		}
	])
	.service('Receipts', [
		'HttpGet', 'HttpPost', 'HttpPut', 'HttpDelete', 'HttpValidate',
		function (get, post, put, httpDelete, validate) {
			return {
				Get: function (rentId, receiptId) {
					return get.Receipts(rentId, receiptId);
				},
				Add: function (rentId) {
					return post.Receipt(rentId);
				},
				Delete: function (receiptId) {
					return httpDelete.Receipt(receiptId);
				},
				Validate: function (receiptId) {
					return validate.Receipt(receiptId);
				},
				Save: function (receipt) {
					return put.Receipt({
						id: receipt.Id,
						rentId: receipt.RentId,
						name: receipt.Name,
						date: receipt.Date.toISOString(),
						tip: receipt.Tip,
						tax: receipt.Tax,
						total: receipt.Total,
						payer: receipt.Payer
					});
				}
			};
		}
	])
	.service('Payments', [
		'HttpGet', 'HttpPost', 'HttpPut', 'HttpDelete', 'HttpValidate',
		function (get, post, put, httpDelete, validate) {
			return {
				Get: function (receiptId, rentId) {
					return get.Payments(receiptId, rentId);
				},
				Add: function (receiptId) {
					return post.Payment(receiptId);
				},
				Delete: function (paymentId) {
					return httpDelete.Payment(paymentId);
				},
				Save: function (payment) {
					return put.Payment({
						id: payment.Id,
						receiptId: payment.ReceiptId,

						payer: payment.Payer,

						PaymentAmount: payment.Amount,
						tip: payment.Tip,
						tax: payment.Tax
					});
				}
			};
		}
	])
	.directive('spaDynamic', [
		'$compile',
		function ($compile) {
			var camelCaseToHyphen = function (string) {
				return string.replace(/\W+/g, '-')
					.replace(/([a-z\d])([A-Z])/g, '$1-$2');
			};

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
									hashString += camelCaseToHyphen(key) + '="hash.' + key + '" ';
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
						pre: function (scope, element) {
							scope.Contents = {
								Name: null,
								Value: null,
								Renters: renters.GetHash()
							};

							scope.Contents.Value = scope.row.Data[scope.column.Binding];

							var watcher = scope.$watch('Contents.Value', function (newVal) {
								scope.Contents.Name = scope.Contents.Renters[newVal].FullName
								scope.row.Data[scope.column.Binding] = newVal;
							});

							element.on('$destroy', function () {
								watcher();
							});
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
	])
	.directive('dgRents', [
		'Rents',
		function (rents) {
			return {
				restrict: 'E',
				replace: true,
				transclude: true,
				compile: function () {
					return {
						pre: function (scope, element) {
							scope.Contents = {
								Name: null
							};

							var id = scope.row.Data[scope.column.Binding];

							var rent = rents.Get(id);

							scope.Contents.Name = rent.Name;
						}
					};
				},
				templateUrl: SPA.Template('dg-rents', 'DataGrid'),
				scope: {
					row: '=',
					column: '='
				}
			};
		}
	]);