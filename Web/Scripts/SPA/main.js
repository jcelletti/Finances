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
		},
		AssignDataWatch: function (scope, element, callback) {
			var watcher = scope.$watch('row.Data', function (newData) {
				callback(newData[scope.column.Binding]);
			}, true);

			element.on('$destroy', function () {
				watcher();
			});
		}
	};
}();

SPA.Config = function () {
	return {
		DataTypes: {
			String: 'string',
			ReadOnly: 'readonly',
			Date: 'date',
			Time: 'time',
			DateTime: 'dateTime',
			Currency: 'currency',
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
		},
		Actions: {
			Calculator: 'dg-action-calculator'
		}
	};
}();

angular.module('SPA', ['SPA.Extensions', 'SPA.Data.Grid'])
	.directive('spaMain', [
		'spaModals', 'Renters', 'Rents', 'spaLocation',
		function (modals, renters, rents, lm) {
			return {
				restrict: 'A',
				replace: false,
				transclude: false,
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

							lm.Initialize(scope, element, function (template) {
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
		'Rents', 'dgConfiguration', 'dgColumn', 'dgFunction', 'spaLocation', 'spaModals',
		function (rents, Config, Column, Function, lm, modals) {
			return {
				restrict: 'E',
				replace: true,
				transclude: true,
				compile: function () {
					return {
						pre: function (scope) {
							scope.Contents = {
								Rents: rents.Get(),
								Config: null
							};

							lm.SetParam(lm.Parameters.rent, null);
							lm.SetParam(lm.Parameters.receipt, null);

							var conf = {
								title: 'Rents',
								editable: true,
								columns: [
									new Column({
										binding: 'Name',
										dataType: SPA.Config.DataTypes.ReadOnly,
										visible: false
									}),
									new Column({
										title: 'Month',
										binding: 'Date',
										visible: true,
										dataType: SPA.Config.DataTypes.Date,
										dateFormat: SPA.Config.DateFormats.Month
									})
								],
								globalActions: [
									new Function('Add', function () {
										rents.Add(function (rents) {
											scope.Rents = rents;
										});
									})
								],
								navigation: [
									new Function('Renters', function () {
										lm.SetLocation(lm.Pages.renters);
									}),
									new Function('All Receipts', function () {
										lm.SetLocation(lm.Pages.receipts);
									}),
									new Function('All Payments', function () {
										lm.SetLocation(lm.Pages.payments);
									})
								],
								rowActions: {
									'Go To': [
										new Function('Receipts', function (row) {
											lm.SetParam(lm.Parameters.rent, row.Data.Id);
											lm.SetLocation(lm.Pages.receipts);
										}),
										new Function('Payments', function (row) {
											lm.SetParam(lm.Parameters.rent, row.Data.Id);
											lm.SetLocation(lm.Pages.payments);
										})
									],
									'Actions': [
										new Function('Validate', function (row) {
											rents.Validate(row.Data.Id)
												.then(function (res) {
													modals.Validation(res);
												});
										}),
										new Function('Delete', function (row) {
											rents.Delete(row.Data.Id, function (rents) {
												scope.Contents.Rents = rents;
											});
										})
									]
								},
								save: function (row) {
									rents.Save(row.Data);
								}
							};

							scope.Contents.Config = new Config(conf);
						}
					};
				},
				templateUrl: SPA.Template('spa-rents'),
				scope: {}
			};
		}
	])
	.directive('spaReceipts', [
		'Receipts', 'Rents', 'dgConfiguration', 'dgColumn', 'dgFunction', 'spaLocation', 'spaModals',
		function (receipts, rents, Config, Column, Function, lm, modals) {
			return {
				restrict: 'E',
				replace: true,
				transclude: true,
				compile: function () {
					var rentId = null;
					return {
						pre: function (scope) {
							var rentId = lm.GetParam(lm.Parameters.rent);

							lm.SetParam(lm.Parameters.receipt, null);

							scope.Contents = {
								Rent: null,
								Receipts: [],
								Config: null
							};

							var conf = {
								title: 'Receipts',
								editable: true,
								save: function (row) {
									receipts.Save(row.Data);
								},
								columns: [
									new Column({
										binding: 'Name',
										visible: true
									}),
									new Column({
										title: 'Date',
										binding: 'Date',
										visible: true,
										dataType: SPA.Config.DataTypes.Date,
										dateFormat: SPA.Config.DateFormats.Day
									}),
									new Column({
										binding: 'Tip',
										dataType: SPA.Config.DataTypes.Currency,
										visible: true
									}),
									new Column({
										binding: 'Tax',
										dataType: SPA.Config.DataTypes.Currency,
										visible: true
									}),
									new Column({
										binding: 'Total',
										dataType: SPA.Config.DataTypes.Currency,
										visible: true
									}),
									new Column({
										binding: 'Payer',
										dataType: SPA.Config.DataTypes.Renters,
										visible: true
									})
								],
								navigation: [],
								rowActions: {
									'Go To': [
										new Function('Payments', function (row) {
											lm.SetParam(lm.Parameters.receipt, row.Data.Id);
											lm.SetLocation(lm.Pages.payments);
										}),
									],
									'Actions': [
										new Function('Validate', function (row) {
											receipts.Validate(row.Data.Id)
												.then(function (res) {
													modals.Validation(res, true);
												});
										}),
										new Function('Delete', function (row) {
											receipts.Delete(row.Data.Id)
												.then(function (res) {
													//todo: remove from list
												});
										})
									]
								}
							};

							scope.Contents.Config = new Config(conf);

							if (!!rentId) {
								scope.Contents.Rent = rents.Get(rentId);

								var name = scope.Contents.Rent.Name

								scope.Contents.Config.Title += ' for "' + name + '"';

								scope.Contents.Config.AddNavigation('Back to Rents',
									function () {
										lm.SetLocation(lm.Pages.rent);
									});

								scope.Contents.Config.AddGlobalAction('Add', function () {
									receipts.Add(rentId)
										.then(function (rec) {
											scope.Contents.Receipts.push(rec);
										});
								});

								scope.Contents.Config.AddGlobalAction('Validate: "' + name + '"',
									function () {
										rents.Validate(rentId)
											.then(function (res) {
												console.log(res);
											});
									});

							} else {
								scope.Contents.Config.AddColumn({
									title: 'Rent',
									binding: 'RentId',
									dataType: SPA.Config.DataTypes.Rents,
									visible: true
								})
							};

							receipts.Get(rentId)
								.then(function (receipts) {
									scope.Contents.Receipts = receipts;
								});
						}
					};
				},
				templateUrl: SPA.Template('spa-receipts'),
				scope: {}
			};
		}
	])
	.directive('spaPayments', [
		'Payments', 'Receipts', 'Rents', 'dgConfiguration', 'dgColumn', 'dgFunction', 'spaLocation',
		function (payments, receipts, rents, Config, Column, Function, lm) {
			return {
				restrict: 'E',
				replace: true,
				transclude: true,
				compile: function () {
					var receiptId = null;
					var rentId = null;

					return {
						pre: function (scope) {
							receiptId = lm.GetParam(lm.Parameters.receipt)
							rentId = lm.GetParam(lm.Parameters.rent);

							scope.Contents = {
								Payments: [],
								Config: new Config(),
							};

							var conf = {
								title: 'Payments',
								editable: !!receiptId,
								save: function (row) {
									payments.Save(row.Data);
								},
								columns: [
									new Column({
										binding: 'Tip',
										dataType: SPA.Config.DataTypes.Currency,
										visible: true
									}),
									new Column({
										binding: 'Tax',
										dataType: SPA.Config.DataTypes.Currency,
										visible: true
									}),
									new Column({
										title: 'Total',
										binding: 'Amount',
										dataType: SPA.Config.DataTypes.Currency,
										visible: true
									}),
									new Column({
										title: 'Payer',
										binding: 'Payer',
										dataType: SPA.Config.DataTypes.Renters,
										visible: true
									})
									//todo: add columns with rent receipt visibility
								],
								globalActions: [
									new Function('Add', function () {
										payments.Add(receiptId)
											.then(function (pmt) {
												scope.Contents.Payments.push(pmt);
											});
									})
								],
								rowActions: {
									Actions: [
										new Function('Delete', function (row) {
											payments.Delete(row.Data.Id, function (rents) {
												scope.Contents.Rents = rents;
											});
										})
									]
								}
							};

							if (!!receiptId) {
								conf.actions = [SPA.Config.Actions.Calculator];
							};

							scope.Contents.Config = new Config(conf);

							var addRentBack = function (rentId) {
								if (!!rentId) {
									var rent = rents.Get(rentId);
									scope.Contents.Config.AddNavigation('Back to Rent: "' + rent.Name + '"',
										function () {
											lm.SetLocation(lm.Pages.rents);
										});
									return rent;
								};
							};

							if (!!receiptId) {
								receipts.Get(null, receiptId)
									.then(function (receipt) {
										scope.Contents.Receipt = receipt;

										scope.Contents.Config.Title += ' for: "' + receipt.Name + '"';

										scope.Contents.Config.SetSummary(receipt.Summary());

										scope.Contents.Config.AddGlobalAction('Validate Receipt: "' + receipt.Name + '"',
											function () {
												receipts.Validate(receiptId)
													.then(function (res) {
														console.log(res);
													});
											});

										scope.Contents.Config.AddNavigation('Back to Receipt: "' + receipt.Name + '"',
											function () {
												lm.SetLocation(lm.Pages.receipts);
											});

										addRentBack(receipt.RentId);
									});
							} else if (!!rentId) {
								var rent = addRentBack(rent.Id);

								scope.Contents.Config.Title += ' for: "' + rent.Name + '"';

								scope.Contents.Config.AddNavigation('Receipts for "' + rent.Name + '"',
									function () {
										lm.SetLocation(lm.Pages.receipts);
									});
							};

							//todo: go back to all rents and all receipts

							payments.Get(receiptId, rentId)
								.then(function (payments) {
									scope.Contents.Payments = payments;
								});
						}
					};
				},
				templateUrl: SPA.Template('spa-payments'),
				scope: {}
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
				receipts: 'receipts',
				payments: 'payments',
				renters: 'renters'
			};

			svc.Pages = pages;

			svc.Parameters = {
				rent: 'rent-id',
				receipt: 'receipt-id'
			};

			var pageHash = {};

			$.each(pages, function (key, val) {
				pageHash[key] = '/' + val;
			});

			var currentLocation = function () {
				switch ($location.path()) {
					case pageHash.receipts:
						return pages.receipts;
					case pageHash.payments:
						return pages.payments;
					case pageHash.renters:
						return pages.renters;
					case pageHash.rents:
					default:
						return pages.rents;
				}
			};

			var pageToLocation = function (page) {
				switch (page) {
					case pages.receipts:
						return pageHash.receipts;
					case pages.payments:
						return pageHash.payments;
					case pages.renters:
						return pageHash.renters;
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

			svc.PageButtons = function () {
				return [
					getPage(pageHash.rents),
					getPage(pageHash.receipts),
					getPage(pageHash.payments)
				];
			};

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