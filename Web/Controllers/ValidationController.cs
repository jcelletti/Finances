using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

using Core;
using Core.Classes;
using Core.Actions;
using Web.Models;

namespace Web.Controllers
{
	public class ValidationController : ApiController
	{
		[HttpPost]
		[ActionName("Receipt")]
		public HttpResponseMessage Receipt(Guid id)
		{
			try
			{
				Receipt receipt = Database.Get<Receipt>(id);

				this.ValidateReceipt(receipt);
			}
			catch (Exception e)
			{
				return this.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, e);
			}
			return this.Request.CreateResponse(HttpStatusCode.NoContent);
		}

		[HttpPost]
		[ActionName("Rent")]
		public HttpResponseMessage Rent(Guid id)
		{
			List<RentValidationModel> validated = new List<RentValidationModel>();
			try
			{
				IEnumerable<Receipt> receipts = Database.GetAllByRent<Receipt>(id);

				Dictionary<Guid, decimal> owed = new Dictionary<Guid, decimal>();

				foreach (var receipt in receipts)
				{
					this.ValidateReceipt(receipt);

					if (!owed.ContainsKey(receipt.Payer)) { owed.Add(receipt.Payer, 0); }

					IEnumerable<Payment> payments = Database.GetPaymentsByReceipt(receipt.Id);

					decimal pmtReduction = 0;

					foreach (var pmt in payments)
					{
						if (!owed.ContainsKey(pmt.Payer)) { owed.Add(pmt.Payer, 0); }

						if (pmt.Payer == receipt.Payer) { continue; }
						var payeeTotal = pmt.PaymentAmount + pmt.Tip + pmt.Tax;

						pmtReduction += payeeTotal;

						owed[pmt.Payer] += payeeTotal;
					}

					owed[receipt.Payer] -= pmtReduction;
				}

				decimal sum = 0;

				foreach (var key in owed.Keys)
				{
					Renter renter = Database.Get<Renter>(key);
					validated.Add(new RentValidationModel(key, renter.FullName, owed[key]));
					sum += owed[key];
				}

				if (sum != 0)
				{
					throw new InvalidRentSumException(validated);
				}

			}
			catch (Exception e)
			{

				return this.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, e);
			}


			return this.Request.CreateResponse(HttpStatusCode.OK, validated);
		}

		private void ValidateReceipt(Receipt receipt)
		{
			IEnumerable<Payment> payments = Database.GetPaymentsByReceipt(receipt.Id);

			decimal total = 0;
			decimal tip = 0;
			decimal tax = 0;

			foreach (var pmt in payments)
			{
				total += pmt.PaymentAmount;
				tip += pmt.Tip;
				tax += pmt.Tax;
			}

			tip = Math.Round(tip, 2);

			tax = Math.Round(tax, 2);

			total += tip + tax;

			total = Math.Round(total, 2);

			if (receipt.Total != total)
			{
				throw new InvalidTotalException(receipt, total);
			}
			if (receipt.Tip != tip)
			{
				throw new InvalidTipException(receipt, tip);
			}
			if (receipt.Tax != tax)
			{
				throw new InvalidTaxException(receipt, tax);
			}
		}

	}
}
