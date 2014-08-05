var rent = function () {
	var self = this;
	var app = null;

	self.formats = {
		date: function (format, value) {
			return new moment(value).format(format);
		},
	};

	self.loadApp = function (data) {
		app = angular.module("main", ["ui.bootstrap.datepicker", "edit.data.table"])
		.controller("header", function ($scope) {
			$scope.links = data;
			$scope.gotoLink = function (link) {
				window.location = link.url;
			}
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
				$scope.actionButtons.unshift(0);
				$scope.actionButtons[0] = {
					text: "Edit",
					visible: function (row) { return !row.isEditing; },
					className: "btn-primary",
					click: function (row) {
						row.isEditing = true;
						row.previous = {};
						$.extend(row.previous, row.data);
					}
				};

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