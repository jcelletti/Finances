var rent = function () {
	var self = this;
	var app = null;

	var formats = {
		date: function (format, value) {
			return new moment(value).format(format);
		},
	};

	var html = {
		textInput: "ng-text",
		select: "ng-select"
	};

	var templates = {
		select: function (scope, row, column) {
			var select = "<select class='form-control' ng-model='templateValue'>";
			$.each(column.options, function (key, val) {
				select += "<option value='" + key + "'>" + val + "</option>";
			});
			return select + "</select>"
		},
		text: function () { return "<input type='text' class='form-control' ng-model='templateValue' />" },
		datePicker: function (scope) {
			scope.dt = moment(scope.templateValue).toDate();
			scope.$watch('dt', function (newValue, oldValue) {
				scope.templateValue = newValue.toISOString();
			});
			return '<datepicker ng-model="dt" show-weeks="true"></datepicker>';
		},
	};

	self.loadApp = function (data) {
		app = angular.module("main", ["ui.bootstrap.datepicker"])
		.controller("header", function ($scope) {
			$scope.links = data;
			$scope.gotoLink = function (link) {
				window.location = link.url;
			}
		})
		.filter("visibleButtonFilter", function () {
			return function (buttons, row) {
				var filtered = []
				$(buttons).each(function (i, btn) {
					if (btn.visible(row)) {
						filtered.push(btn);
					}
				});
				return filtered;
			}
		})
		.directive("editControlType", function ($compile) {
			return {
				restrict: "AE",
				replace: true,
				link: function (scope, element, attrs) {
					var row = scope.content.row;
					var col = scope.content.col;

					scope.templateValue = row.data[col.key];
					scope.$watch('templateValue', function (newValue, oldValue) {
						row.data[col.key] = newValue;
					});
					element.html(templates[col.editingTemplate || "text"](scope, row, col)).show();
					$compile(element.contents())(scope);
				},
				scope: {
					content: '='
				}
			};
		});
	};

	var loadDataTable = function (callback, hasEdit) {
		app.controller("data-table", function ($scope) {
			$scope.rows = [];
			$scope.columns = [];
			$scope.actionButtons = [];
			$scope.headerButtons = []
			$scope.orderByColumn = "";

			$scope.orderByFunction = function (row) {
				return row.data[$scope.orderByColumn];
			}

			$scope.changeOrder = function (key) {
				if ($scope.orderByColumn === key) {
					$scope.orderByColumn = "-" + key
				} else {
					$scope.orderByColumn = key
				}
			}

			$scope.columnFormat = function (column, row) {
				return column.format ? column.format(column.formatString, row.data[column.key], $scope) : row.data[column.key]
			};

			$scope.rowEdit = function (column) {
				return html[column.controlType || "textInput"];
			};

			callback($scope);

			if (hasEdit) {
				$scope.actionButtons.push({
					text: "Edit",
					visible: function (row) { return !row.isEditing; },
					className: "btn-primary",
					click: function (row) {
						row.isEditing = true;
						row.previous = {};
						$.extend(row.previous, row.data);
					}
				});
				$scope.actionButtons.push({
					text: "Cancel",
					visible: function (row) { return row.isEditing; },
					className: "btn-warning",
					click: function (row) {
						$.extend(row.data = {}, row.previous);
						row.isEditing = false;
						row.previous = null;
					}
				});
			}
		})
		.directive("valueEdit", function ($compile) {
			function link(scope, element, attrs) {
				var column = scope.col;
				element.html("<input type='text' class='form-control' ng-model='row.data." + column.key + "' />");
			}

			return {
				link: link
			};
			//return {
			//	template: "<input type='text' class='form-control' ng-model='row.data[col.key]' />"
			//};
		});
	};

	self.loadRents = function (rents, receiptsLocation, paymentsLocation, validationLocation, apiLocation) {
		loadDataTable(function ($scope) {
			$scope.rows = rents;
			$scope.columns = [
				{ key: "Name", text: "Name", editingTemplate: "text" },
				{ key: "Month", text: "Month", formatString: "LL", format: formats.date, editingTemplate: "datePicker" }
			];

			$scope.text = "<input type='text' class='form-control' ng-model='row.data[col.key]' />>"

			$scope.orderByColumn = "Name";

			$scope.actionButtons = [
						{
							text: "Receipts",
							visible: function (row) { return !row.isEditing; },
							className: "btn-info",
							click: function (rent) {
								window.location = receiptsLocation + rent.data.Id;
							}
						},
						{
							text: "Payments",
							visible: function (row) { return !row.isEditing; },
							className: "btn-info",
							click: function (row) {
								window.location = paymentsLocation + row.data.Id;
							}
						},
						{
							text: "Validate",
							visible: function (row) { return !row.isEditing; },
							className: "btn-primary",
							click: function (rent) {
								$.ajax({
									url: validationLocation + rent.Id,
									type: 'POST',
									success: function (result) {
										var ul = $('<ul />');
										$(result).each(function (i, pay) {
											var li = $('<li><span>' + pay.Name + '</span>:<span style="padding-left: 1em">' + pay.Owed + '</span></li>');
											ul.append(li);
										});

										ul.appendTo("#body");
									},
									error: function (result) {
										var error = JSON.parse(result.responseText).ExceptionMessage;
										alert("Receipt had errors: " + error);
										console.error(result);
									}
								});
							}
						},
						{
							text: "Delete",
							visible: function (row) { return !row.isEditing; },
							className: "btn-danger",
							click: function (rent) {
								if (confirm("Are you sure you want to delete '" + rent.Name + "'?")) {
									$.ajax({
										url: apiLocation + rent.data.Id,
										type: 'DELETE',
										success: function () {
											console.log('deleted');
											var index = $scope.rows.indexOf(rent);
											if (index > -1) {
												$scope.rows.splice(index, 1);
											}
											$scope.$apply();
										},
										error: function (result) {
											console.error('error');
											console.error(result);
										}
									});
								}
							}
						},
						{
							text: "Save",
							visible: function (rent) { return rent.isEditing; },
							className: "btn-success",
							click: function (rent) {
								$.ajax({
									url: apiLocation,
									data: rent.data,
									type: 'PUT',
									visible: false,
									success: function (result) {
										$.extend(rent, result);
										$scope.$apply();
									},
									error: function (result) {
										console.error('error');
										console.error(result);
									}
								});

							}
						}
			];

			$scope.headerButtons = [
				{
					text: "Add New",
					className: "btn-primary",
					click: function () {
						$.ajax({
							url: apiLocation,
							type: 'POST',
							success: function (result) {
								$scope.rows.push(result);
								$scope.$apply();
							},
							error: function (result) {
								console.log('error');
								console.log(result);
							}
						});
					}
				}
			];

			$scope.add = function () {
				$.ajax({
					url: apiLocation,
					type: 'POST',
					success: function (result) {
						$scope.rows.push(result);
						$scope.$apply();
					},
					error: function (result) {
						console.log('error');
						console.log(result);
					}
				});
			};
		}, true);
	};

	self.loadReceipts = function (isByRent, receipts, names, rentId, apiLocation, paymentsLocation, receiptValidation, rentValidation) {
		loadDataTable(function ($scope) {
			$scope.rows = receipts;
			$scope.names = names;
			$scope.columns = [
				{ key: "Name", text: "Name" },
				{ key: "Date", text: "Date", formatString: "LL", format: formats.date, editingTemplate: "datePicker" },
				{ key: "Tip", text: "Tip" },
				{ key: "Tax", text: "Tax" },
				{ key: "Total", text: "Total" },
				{
					key: "Payer",
					text: "Payer",
					editingTemplate: "select",
					options: $scope.names,
					format: function (format, value) {
						return $scope.names[value];
					}
				}
			];

			$scope.orderByColumn = "Name";

			$scope.actionButtons = [
				{
					text: "Payments",
					visible: function (row) { return !row.isEditing; },
					className: "btn-info",
					click: function (rent) {
						window.location = paymentsLocation + "/" + rent.data.Id;
					}
				},
				{
					text: "Validate",
					visible: function (row) { return !row.isEditing; },
					className: "btn-primary",
					click: function (row) {
						$.ajax({
							url: receiptValidation + '/' + row.data.Id,
							type: 'POST',
							success: function (result) {
								alert("Receipt had no errors");
							},
							error: function (result) {
								var error = JSON.parse(result.responseText).ExceptionMessage;
								alert("Receipt had errors: " + error);
								console.error(result);
							}
						});
					}
				},
				{
					text: "Delete",
					visible: function (row) { return !row.isEditing; },
					className: "btn-danger",
					click: function (row) {
						if (confirm("Are you sure?")) {
							$.ajax({
								url: apiLocation + "/" + row.data.Id,
								type: 'DELETE',
								success: function (result) {
									console.log('deleted');
									var index = $scope.rows.indexOf(row);
									if (index > -1) {
										$scope.rows.splice(index, 1);
									}
									$scope.$apply();
								},
								error: function (result) {
									console.error('error');
									console.error(result);
								}
							});
						}
					}
				},
				{
					text: "Save",
					visible: function (rent) { return rent.isEditing; },
					className: "btn-success",
					click: function (row) {
						$.ajax({
							url: apiLocation + "/" + row.data.Id,
							data: row.data,
							type: 'PUT',
							visible: false,
							success: function (result) {
								$.extend(row, result);
								$scope.$apply();
							},
							error: function (result) {
								console.error('error');
								console.error(result);
							}
						});

					}
				}
			];

			$scope.headerButtons = [
				{
					text: "Add New",
					className: "btn-primary",
					click: function () {
						$.ajax({
							url: apiLocation + "/" + rentId,
							type: 'POST',
							success: function (result) {
								$scope.rows.push(result);
								$scope.$apply();
							},
							error: function (result) {
								console.log('error');
								console.log(result);
							}
						});
					}
				}
			];

			if (isByRent) {
				$scope.headerButtons.push({
					text: "Validate Rent",
					className: "btn-warning",
					click: function () {
						$.ajax({
							url: rentValidation + '/' + rentId,
							type: 'POST',
							success: function (result) {
								var ul = $('<ul />');
								$(result).each(function (i, pmt) {
									ul.append($('<li><span>' +
										pmt.Name +
										'</span>:<span style="padding-left: 1em">$' +
										pmt.Owed +
										'</span></li>'));
								});

								$("#validated").empty();

								ul.appendTo("#validated");
							},
							error: function (result) {
								var error = JSON.parse(result.responseText).ExceptionMessage;
								alert("Receipt had errors: " + error);
								console.error(result);
							}
						});
					}
				});
			}

		}, true);
	};

	self.loadPayments = function (payments, names, receiptId, receipts, apiLocation, validationLocation) {
		loadDataTable(function ($scope) {
			$scope.rows = payments;
			$scope.names = names;
			$scope.receipts = receipts;
			$scope.columns = [
				{
					key: "Payer",
					text: "Payer",
					format: function (format, value) {
						return $scope.names[value];
					}
				},
				{ key: "Tip", text: "Tip" },
				{ key: "Tax", text: "Tax" },
				{ key: "PaymentAmount", text: "Owed" }
			];

			if (receiptId != "false") {
				$scope.headerButtons = [
					{
						text: "Add Payment",
						className: "btn-primary",
						click: function () {
							$.ajax({
								url: apiLocation + '/' + receiptId,
								type: 'POST',
								success: function (result) {
									$scope.rows.push(result);
									$scope.$apply();
								},
								error: function (result) {
									console.log('error');
									console.log(result);
								}
							});
						}
					},
					{
						text: "Validate Rent",
						className: "btn-warning",
						click: function () {
							$.ajax({
								url: validationLocation + '/' + receiptId,
								type: 'POST',
								success: function (result) {
									alert("Receipt had no errors");
								},
								error: function (result) {
									var error = JSON.parse(result.responseText).ExceptionMessage;
									alert("Receipt had errors: " + error);
									console.error(result);
								}
							});
						}
					}
				];
			}
			else {
				$scope.columns.push({
					key: "ReceiptId",
					text: "Receipt",
					format: function (format, value) {
						return $scope.receipts[value];
					}
				})
			}

			$scope.actionButtons = [
				{
					text: "Delete",
					className: "btn-danger",
					visible: function (row) { return !row.isEditing; },
					click: function (row) {
						if (confirm("Are you sure?")) {
							$.ajax({
								url: apiLocation + "/" + row.data.Id,
								type: 'DELETE',
								success: function (result) {
									console.log('deleted');
									var index = $scope.rows.indexOf(row);
									$scope.rows.splice(index, 1);
									$scope.$apply();
								},
								error: function (result) {
									console.error('error');
									console.error(result);
								}
							});
						}
					}
				},
				{
					text: "Save",
					className: "btn-success",
					visible: function (row) { return row.isEditing; },
					click: function (row) {
						$.ajax({
							url: apiLocation,
							type: 'PUT',
							data: row.data,
							success: function (result) {
								$.extend(row, result);
								$scope.$apply();
							},
							error: function (result) {
								console.error('error');
								console.error(result);
							}
						});
					}
				},

			];
		}, true);

		app.controller("calculator", function ($scope) {
			$scope.calcFunction = "";
			$scope.calcVal = 0;
			$scope.calcEval = function ($event) {
				try {
					$scope.calcVal = eval($scope.calcFunction) || 0;
				} catch (e) {

				}
			}
		});
	};

	self.loadRenters = function (renters, apiLocation) {
		loadDataTable(function ($scope) {
			$scope.rows = renters;
			$scope.columns = [
				{ key: "First", text: "First" },
				{ key: "Last", text: "Last" }
			];

			$scope.headerButtons = [
				{
					text: "Add Renter",
					className: "btn-primary",
					click: function () {
						$.ajax({
							url: apiLocation,
							type: 'POST',
							success: function (result) {
								$scope.rows.push(result);
								$scope.$apply();
							},
							error: function (result) {
								console.log('error');
								console.log(result);
							}
						});
					}
				}
			];

			$scope.actionButtons = [
				{
					text: "Delete",
					visible: function (row) { return !row.isEditing; },
					className: "btn-danger",
					click: function (row) {
						if (confirm("Are you sure?")) {
							$.ajax({
								url: apiLocation + "/" + row.data.Id,
								type: 'DELETE',
								success: function (result) {
									console.log('deleted');
									var index = $scope.rows.indexOf(row);
									$scope.rows.splice(index, 1);
									$scope.$apply();
								},
								error: function (result) {
									console.error('error');
									console.error(result);
								}
							});
						}
					}
				},
				{
					text: "Save",
					visible: function (row) { return row.isEditing; },
					className: "btn-success",
					click: function (row) {
						$.ajax({
							url: apiLocation,
							type: 'PUT',
							data: row.data,
							success: function (result) {
								console.log('saved');
								$.extend(row, result);
								$scope.$apply();
							},
							error: function (result) {
								console.error('error');
								console.error(result);
							}
						});
					}
				}
			];

		}, true);
	};

	return self;
}();