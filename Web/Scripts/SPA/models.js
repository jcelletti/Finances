'use strict';
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

				r.Payer = receipt.payer;

				var getSummaryItem = function (name) {
					var value = r[name];
					if (value > 0) {
						return '<div>' + '<span>' + name + ':</span><span>' + value + '</span></div>'
					};
					return '';
				};

				r.Summary = function () {
					var st = ''

					st += getSummaryItem('Total');
					st += getSummaryItem('Tax');
					st += getSummaryItem('Tip');

					return '<div>' + st + '</div>'
				};
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
		})
	.factory('Validation',
		function () {
			return function (v) {
				var val = this;

				val.Id = v.id;
				val.Name = v.name;
				val.Owed = v.owed;
				val.Owes = true;

				if (val.Owed <= 0) {
					val.Owed = val.Owed * -1;
					val.Owes = false;
				};
			};
		});