'use strict';
angular.module('SPA.Data.Grid', [])
	.directive('spaDataGrid', [
		'dgRow',
		function (Row) {
			return {
				restrict: 'E',
				replace: true,
				transcude: true,
				compile: function () {
					var idColumn = 'Id';

					var sortingColumn = null;
					var sortAsc = true;

					var sortData = function (rows) {
						if (!!sortingColumn) {
							var compFunc = function (v1, v2) {
								if (v1 > v2) {
									return 1;
								};

								if (v1 < v2) {
									return -1;
								};

								return 0;
							};

							if (SPA.Config.DataTypeIsDate(sortingColumn.DataType)) {
								compFunc = function (v1, v2) {
									return v1.diff(v2);
								};
							};

							rows.sort(function (r1, r2) {
								var v1 = r1.Data[sortingColumn.Binding];
								var v2 = r2.Data[sortingColumn.Binding];

								var num = compFunc(v1, v2);

								if (!sortAsc) {
									num = num * -1;
								};

								return num;
							})
						};
					};

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

								sortData(rows);

								scope.Contents.Rows = rows;
							});

							element.on('$destroy', function () {
								watcher();
							});

							var tId = $.trim(scope.idColumn);
							if (tId.length > 0) {
								idColumn = tId;
							};
						},
						post: function (scope) {
							var _editing = {};

							scope.Functions = {
								Edit: function (row) {
									var id = row.Data[idColumn];

									_editing[id] = {};

									var clone = angular.copy(row.Data);

									$.each(scope.config.Columns, function (i, col) {
										var d = clone[col.Binding];

										if (moment.isMoment(d)) {
											d = new moment(d.toDate());
										};

										_editing[id][col.Binding] = d;
									});

									row.IsEditing = true;
								},
								CancelEdit: function (row) {
									var id = row.Data[idColumn];

									$.each(scope.config.Columns, function (i, col) {
										row.Data[col.Binding] = _editing[id][col.Binding];
									});

									_editing[id] = null;

									row.IsEditing = false;
								},
								Save: function (row) {
									var id = row.Data[idColumn];

									scope.config.Save(row);

									row.IsEditing = false;
								},
								SortColumn: function (column) {
									if (!!sortingColumn && sortingColumn.Binding === column.Binding) {
										sortAsc = !sortAsc;
									};
									sortingColumn = column;
									sortData(scope.Contents.Rows)
								}
							};
						}
					};
				},
				templateUrl: SPA.Template('spa-data-grid', 'DataGrid'),
				scope: {
					data: '=',
					config: '=',
					idColumn: '@'
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

				r.SetEditing = function () {
					r.IsEditing = true;
				};

				r.CancelEdit = function () {
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
					case SPA.Config.DataTypes.Rents:
						return 'rents';
					case SPA.Config.DataTypes.Currency:
						return 'currency';
					case SPA.Config.DataTypes.ReadOnly:
						return 'read-only';
					case SPA.Config.DataTypes.String:
					default:
						return 'string';
				};
			};

			var getArgs = function () {
				return {
					dataType: SPA.Config.DataTypes.String,
					visible: false,
					dateFormat: SPA.Config.DateFormats.Year
				};
			};

			return function (args) {
				var c = this;

				var innerArgs = getArgs();

				$.extend(innerArgs, args);

				c.Title = innerArgs.title || innerArgs.binding;
				c.Binding = innerArgs.binding;
				c.DataType = innerArgs.dataType;
				c.DateFormat = innerArgs.dateFormat;

				c.Visible = innerArgs.visible === true;

				c.Template = 'dg-' + getTemplate(innerArgs.dataType);
			}
		})
	.factory('dgConfiguration', [
		'dgColumn', 'dgFunction',
		function (Column, Function) {
			var getDefaults = function () {
				return {
					columns: [],
					globalActions: [],
					rowActions: {},
					save: function () { },
					editable: false,
					actions: []
				};
			};

			var getStyle = function (len) {
				return { width: 100 * len };
			};

			return function (config) {
				var c = this;

				var args = getDefaults();

				$.extend(args, config);

				c.Title = args.title;

				c.Summary = args.summary;

				c.Editable = args.editable;

				c.Columns = args.columns;

				c.GlobalActions = args.globalActions;

				c.Navigation = [];

				if ($.isArray(args.navigation)) {
					c.Navigation = args.navigation;
				};

				var rowActions = {};

				$.each(args.rowActions, function (group, actions) {
					rowActions[group] = {
						style: getStyle(actions.length),
						actions: actions
					};
				});

				c.RowActions = rowActions;

				var actions = [];

				$.each(args.actions, function (i, a) {
					switch ($.trim(a)) {
						case SPA.Config.Actions.Calculator:
							actions.push('dg-calculator');
							break;
					};
				});

				c.Actions = actions;

				c.Save = args.save;

				c.AddColumn = function (colArgs) {
					c.Columns.push(new Column(colArgs));
				};

				c.AddRowAction = function (group, action) {
					if (!c.RowActions[group]) {
						c.RowActions[group] = {};
					};

					c.RowActions[group].actions.push(action);
					c.RowActions[group].style = getStyle(c.RowActions[group].actions.length);
				};

				c.AddGlobalAction = function (name, func) {
					c.GlobalActions.push(new Function(name, func));
				};

				c.AddNavigation = function (name, func) {
					c.Navigation.push(new Function(name, func));
				};

				c.SetSummary = function (summary) {
					c.Summary = summary;
				};
			};
		}
	])
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
		})
	.directive('dgString',
		function () {
			return {
				restrict: 'E',
				replace: false,
				transclude: true,
				//shared with currency
				templateUrl: SPA.Template('dg-input', 'DataGrid'),
				scope: {
					row: '=',
					column: '='
				}
			};
		})
	.directive('dgReadOnly',
		function () {
			return {
				restrict: 'E',
				replace: false,
				transclude: true,
				compile: function () {
					return {
						pre: function (scope, element) {
						},
						post: function (scope) {
						}
					};
				},
				templateUrl: SPA.Template('dg-read-only', 'DataGrid'),
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
								Format: null,
								EditValue: scope.row.Data[scope.column.Binding],
								Options: getOptions(scope.column)
							};
						},
						post: function (scope, element) {
							//todo: on change of value update row

							var valWatch = scope.$watch('Contents.EditValue', function (newVal) {
								var m = new moment(newVal);

								scope.Contents.Format = m.format(scope.column.DateFormat);
								scope.row.Data[scope.column.Binding] = m;
							});

							var editWatch = scope.$watch('row.IsEditing', function () {
								scope.Contents.EditValue = scope.row.Data[scope.column.Binding];
							});

							element.on('$destroy', function () {
								valWatch();
								editWatch();
							});
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
	.directive('dgCurrency',
		function () {
			return {
				restrict: 'E',
				replace: false,
				transclude: true,
				compile: function () {
					return {
						pre: function (scope, element) {
						},
						post: function (scope, element) {
							var watcher = scope.$watch('row.Data[column.Binding]', function (newVal, prevVal) {
								if (newVal === null || newVal === undefined) {
									scope.row.Data[scope.column.Binding] = prevVal;
									return;
								};

								//restrict to 100 digits after the decimal
								if (!/(^\d*(\.(\d{1,100})?)?$)/.test(newVal)) {
									scope.row.Data[scope.column.Binding] = prevVal;
									return;
								};
							});

							element.on('$destroy', function () {
								watcher();
							})
						}
					};
				},
				templateUrl: SPA.Template('dg-input', 'DataGrid'),
				scope: {
					row: '=',
					column: '='
				}
			};
		})
	.directive('dgHtml',
		function () {
			return {
				restrict: 'A',
				replace: false,
				transclude: true,
				compile: function () {
					return {
						pre: function (scope, element) {
							var watcher = scope.$watch('html', function (newVal) {
								element.html(newVal);
							});

							element.on('$destroy', function () {
								watcher();
							});
						}
					}
				},
				scope: {
					html: '=dgHtml'
				}
			};
		})
	.directive('dgApp', [
		'$compile',
		function ($compile) {
			return {
				restrict: 'A',
				replace: false,
				transclude: false,
				compile: function () {
					return {
						pre: function (scope, element) {
							element.html($compile($('<' + scope.app + ' />'))(scope));
						}
					};
				},
				scope: {
					app: '=dgApp'
				}
			};
		}
	])
	.directive('dgCalculator', [
		'$parse',
		function ($parse) {
			return {
				restrict: 'E',
				replace: true,
				transclude: true,
				compile: function () {
					return {
						pre: function (scope, element) {
							scope.Contents = {
								Script: null,
								Value: null
							};
							var watcher = scope.$watch('Contents.Script', function (newVal) {
								var trVal = $.trim(newVal);

								if (!trVal) {
									scope.Contents.Value = null;
								};

								try {
									scope.Contents.Value = $parse(trVal)();
								}
								catch (e) {
									scope.Contents.Value = 'Invalid Value';
								}
							});
						}
					};
				},
				templateUrl: SPA.Template('dg-calculator', 'DataGrid'),
				scope: {}
			};
		}
	]);