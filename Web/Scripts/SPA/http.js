'use strict';
angular.module('SPA.HTTP', ['ui.bootstrap', 'SPA.models'])
	.config([
		'$httpProvider',
		function ($httpProvider) {
			$httpProvider.interceptors.push([
				'$q',
				function ($q) {
					return {
						requestError: function (r) {
							console.log('request', r);
							return $q.reject(r);
						},
						responseError: function (r) {
							if (r.status === 400) {
								if (r.statusText === 'BadRequest') {
									alert(r.data);
								};
							};
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

						if (!!resolver) {

							if ($.isArray(response)) {
								var outArr = [];

								$.each(response, function (i, r) {
									outArr.push(new resolver(r));
								});

								def.resolve(outArr);
								return;
							};

							def.resolve(new resolver(response));
						}

						def.resolve(response);
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

			svc.Receipts = function (rentId, receiptId) {
				return new Defer(function () {
					var url = 'Receipt';

					var tReceiptId = $.trim(receiptId);
					var tRentId = $.trim(rentId);

					if (tReceiptId.length > 0) {
						url += '/' + tReceiptId;
					} else if (tRentId.length > 0) {
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
		'$http', 'HttpDefer', 'Rent', 'Receipt', 'Payment',
		function ($http, Defer, Rent, Receipt, Payment) {
			var svc = this;

			svc.Rent = function () {
				return new Defer(function () {
					return $http.post('Rent');
				}, Rent);
			};

			svc.Receipt = function (rentId) {
				return new Defer(function () {
					return $http.post('Receipt/' + rentId);
				}, Receipt);
			};

			svc.Payment = function (receiptId) {
				return new Defer(function () {
					return $http.post('Payment/' + receiptId);
				}, Payment);
			};
		}
	])
	.service('HttpPut', [
		'$http', 'HttpDefer',
		function ($http, Defer) {
			var svc = this;

			svc.Rent = function (r) {
				return new Defer(function () {
					return $http.put('Rent', r);
				});
			};

			svc.Receipt = function (r) {
				return new Defer(function () {
					return $http.put('Receipt', r);
				});
			};

			svc.Payment = function (p) {
				return new Defer(function () {
					return $http.put('Payment', p);
				});
			};
		}
	])
	.service('HttpDelete', [
		'$http', 'HttpDefer',
		function ($http, Defer) {
			var svc = this;

			svc.Rent = function (id) {
				return new Defer(function () {
					return $http.delete('Rent/' + id);
				});
			};

			svc.Receipt = function (id) {
				return new Defer(function () {
					return $http.delete('Receipt/' + id)
				});
			};

			svc.Payment = function (id) {
				return new Defer(function () {
					return $http.delete('Payment/' + id);
				});
			};
		}
	])
	.service('HttpValidate', [
		'$http', 'HttpDefer', 'Validation',
		function ($http, Defer, Validation) {
			var svc = this;

			svc.Rent = function (id) {
				return new Defer(function () {
					return $http.get('Rent/' + id + '/Validate');
				}, Validation);
			};

			svc.Receipt = function (id) {
				return new Defer(function () {
					return $http.get('Receipt/' + id + '/Validate');
				}, Validation);
			};
		}
	]);