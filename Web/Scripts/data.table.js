if (!angular) {
	throw "AngularJs not found";
}

angular.module("edit.data.table", [])
.directive("editDataTable", function ($compile) {
	var template = '<div class="data-grid-container">' +
	'<div class="header-buttons btn-group" ng-show="headerButtons.length > 0 ">' +
		'<button type="button" class="btn" ng-repeat="btn in headerButtons" ng-class="btn.className || btn-default" ng-click="btn.click()">{{btn.text}}</button>' +
	'</div>' +
	'<table class="data-grid">' +
		'<thead>' +
			'<tr>' +
				'<th ng-repeat="col in columns" ng-click="changeOrder(col.key)">' +
					'<span class="glyphicon" ng-class="orderByClass(col)"></span>' +
					'{{col.text}}' +
				'</th>' +
				'<th ng-show="actionButtons.length > 0">Actions</th>' +
			'</tr>' +
		'</thead>' +
		'<tbody>' +
			'<tr ng-repeat="row in rows | orderBy: orderByFunction">' +
				'<td ng-repeat="col in columns">' +
					'<div ng-if="col.editable == false || !row.isEditing">{{columnFormat(col, row)}}</div>' +
					'<div ng-if="col.editable != false && row.isEditing">' +
						'<edit-control val="row.data[col.key]" col="col"></edit-control>' +
					'</div>' +
				'</td>' +
				'<td ng-show="actionButtons.length > 0">' +
					'<div class="btn-group">' +
						'<button type="button" class="btn" ng-repeat="btn in actionButtons | visibleButtonFilter: row" ng-click="btn.click(row)" ng-class="btn.className || btn-default">{{btn.text}}</button>' +
					'</div>' +
				'</td>' +
			'</tr>' +
		'</tbody>' +
	'</table>' +
'</div>';

	return {
		restrict: 'AE',
		transclude: true,
		scope: {
			rows: '=',
			columns: '=',
			actionButtons: '=',
			headerButtons: '=',
			orderByColumn: '=',
			add: '='
		},
		link: function (scope, elm, attrs) {
			scope.changeOrder = function (key) {
				if (scope.orderByColumn === key) {
					scope.orderByColumn = "-" + key
				} else {
					scope.orderByColumn = key
				}
			};

			scope.orderByFunction = function (row) {
				return row.data[scope.orderByColumn];
			};

			scope.orderByClass = function (col) {
				if (col.key === scope.orderByColumn) {
					return 'glyphicon-chevron-up';
				} else if ("-" + col.key === scope.orderByColumn) {
					return "glyphicon-chevron-down";
				}
				return ""
			};

			scope.rowEdit = function (column) {
				return html[column.controlType || "textInput"];
			};

			scope.columnFormat = function (column, row) {
				return !!column.format ?
					column.format(column.formatString, row.data[column.key]) :
					row.data[column.key]
			};

			elm.append($compile(template)(scope));
		}
	};
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
	};
})
.directive("editControl", function ($compile) {
	var templates = {
		select: function (scope) {
			var column = scope.col;
			var select = "<select class='form-control' ng-model='val'>";
			$.each(column.options, function (key, val) {
				select += "<option value='" + key + "'>" + val + "</option>";
			});
			return select + "</select>"
		},
		text: function () { return "<input type='text' class='form-control' ng-model='val' />" },
		datePicker: function (scope) {
			scope.dt = moment(scope.val).toDate();
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
				scope.val = newValue.toISOString();
			});

			return '<div class="input-group datepicker-group">' +
		 ' <input type="text" class="form-control" datepicker-popup="dd-MMMM-yyyy" ng-model="dt" is-open="opened" min-date="minDate" max-date="maxDate" datepicker-options="dateOptions" date-disabled="disabled(date, mode)" ng-required="true" close-text="Close" />' +
		  '<span class="input-group-btn">' +
			'<button type="button" class="btn btn-default" ng-click="open($event)"><i class="glyphicon glyphicon-calendar"></i></button>' +
		  '</span>' +
		'</div>';
		},
	};
	return {
		restrict: "AE",
		link: function (scope, element, attrs) {
			element.append($compile(templates[scope.col.editingTemplate || "text"](scope))(scope));
		},
		transclude: true,
		scope: {
			col: "=col",
			val: "=val"
		},
	};
})
.directive("calculator", function ($compile) {
	var template = "<div class='calculator-group input-group'>" +
		"<textarea type='text' class='form-control' ng-model='val'></textarea>" +
		"<div class='input-group-addon'>" +
		"{{evaluated()}}" +
		"</div>" +
		"</div>";
	return {
		restrict: "E",
		link: function (scope, element, attrs) {
			scope.val = null;
			scope.evaluated = function () {
				try {
					return eval(scope.val);
				} catch (e) {
					return null;
				}
			};
			element.append($compile(template)(scope));
		},
		transclude: true
	};
});