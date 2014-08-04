var rent = function () {
	var self = this;
	var app = null;

	self.formats = {
		date: function (format, value) {
			return new moment(value).format(format);
		},
	};

	var html = {
		textInput: "ng-text",
		select: "ng-select"
	};

	var templates = {
		select: function (scope) {
			var column = scope.col;
			var select = "<select class='form-control' ng-model='templateValue'>";
			$.each(column.options, function (key, val) {
				select += "<option value='" + key + "'>" + val + "</option>";
			});
			return select + "</select>"
		},
		text: function () { return "<input type='text' class='form-control' ng-model='templateValue' />" },
		datePicker: function (scope) {
			scope.dt = moment(scope.templateValue).toDate();
			scope.dateOptions = {
				formatYear: 'yyyy',
			};

			scope.disabled = function (date, mode) {
				return false;
			};

			scope.maxDate = moment("01/01/2100").toDate();

			scope.minDate = moment("01/01/2000").toDate();

			scope.opened = false;

			scope.open = function ($event) {
				$event.preventDefault();
				$event.stopPropagation();

				scope.opened = true;
			};

			scope.$watch('dt', function (newValue, oldValue) {
				scope.templateValue = newValue.toISOString();
			});

			return '<div class="input-group datepicker-group">' +
		 ' <input type="text" class="form-control" datepicker-popup="dd-MMMM-yyyy" ng-model="dt" is-open="opened" min-date="minDate" max-date="maxDate" datepicker-options="dateOptions" date-disabled="disabled(date, mode)" ng-required="true" close-text="Close" />' +
		  '<span class="input-group-btn">' +
			'<button type="button" class="btn btn-default" ng-click="open($event)"><i class="glyphicon glyphicon-calendar"></i></button>' +
		  '</span>' +
		'</div>';
		},
	};

	self.loadApp = function (data) {
		app = angular.module("main", ["ui.bootstrap.datepicker", "edit.data.table"])
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

	self.loadDataTable = function (callback, hasEdit) {
		app.controller("data-table", function ($scope) {
			$scope.rows = [];
			$scope.columns = [];
			$scope.actionButtons = [];
			$scope.headerButtons = []
			$scope.orderByColumn = "";

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
		});
	};

	return self;
}();