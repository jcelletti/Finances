using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;

using Core.Classes;
using Core.Actions;
using Web.Models;

namespace Web.Controllers
{
	public class WebApiController : ApiController
	{
		[HttpPost]
		[ActionName("Renter")]
		public HttpResponseMessage RenterAdd()
		{
			Renter renter = new Renter
			{
				First = "first",
				Last = "last",
				Id = Guid.NewGuid()
			};

			try
			{
				Database.Insert(renter);
			}
			catch (Exception e)
			{
				return this.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, e);
			}

			return this.Request.CreateResponse(HttpStatusCode.OK, new RowModel(renter));
		}

		[HttpPut]
		[ActionName("Renter")]
		public HttpResponseMessage RenterDelete(Renter renter)
		{
			try
			{
				Database.Update(renter);
			}
			catch (Exception e)
			{
				return this.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, e);
			}

			return this.Request.CreateResponse(HttpStatusCode.OK, new RowModel(renter));
		}

		[HttpDelete]
		[ActionName("Renter")]
		public HttpResponseMessage RenterDelete(Guid id)
		{
			try
			{
				Database.Delete<Renter>(id);
			}
			catch (Exception e)
			{
				return this.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, e);
			}

			return this.Request.CreateResponse(HttpStatusCode.NoContent);
		}

		[HttpPost]
		[ActionName("Receipt")]
		public HttpResponseMessage ReceiptAdd(Guid id)
		{
			var receipt = new Receipt
			{
				Id = Guid.NewGuid(),
				Name = "New Receipt",
				Date = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1),
				Tip = 0,
				Total = 0
			};

			try
			{
				receipt.Payer = Database.First<Renter>().Id;
				receipt.RentId = (id == Guid.Empty) ? Database.First<Rent>().Id : id;
				Database.Insert(receipt);
			}
			catch (Exception e)
			{
				return this.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, e);
			}

			return this.Request.CreateResponse(HttpStatusCode.OK, new RowModel(receipt));
		}

		[HttpPut]
		[ActionName("Receipt")]
		public HttpResponseMessage ReceiptUpdate(Receipt receipt)
		{
			try
			{
				Database.Update(receipt);
			}
			catch (Exception e)
			{
				return this.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, e);
			}

			return this.Request.CreateResponse(HttpStatusCode.OK, new RowModel(receipt));
		}

		[HttpDelete]
		[ActionName("Receipt")]
		public HttpResponseMessage ReceiptDelete(Guid id)
		{
			try
			{
				Database.Delete<Receipt>(id);
			}
			catch (Exception e)
			{
				return this.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, e);
			}

			return this.Request.CreateResponse(HttpStatusCode.NoContent);
		}

		[HttpPost]
		[ActionName("Rent")]
		public HttpResponseMessage RentAdd()
		{
			var rent = new Rent
			{
				Id = Guid.NewGuid(),
				Name = "New Rent",
				Month = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1)
			};

			try
			{
				Database.Insert(rent);
			}
			catch (Exception e)
			{
				return this.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, e);
			}

			return this.Request.CreateResponse(HttpStatusCode.OK, new RowModel(rent));
		}

		[HttpPut]
		[ActionName("Rent")]
		public HttpResponseMessage RentUpdate(Rent rent)
		{
			try
			{
				Database.Update(rent);
			}
			catch (Exception e)
			{
				return this.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, e);
			}

			return this.Request.CreateResponse(HttpStatusCode.OK, new RowModel(rent));
		}

		[HttpDelete]
		[ActionName("Rent")]
		public HttpResponseMessage RentDelete(Guid id)
		{
			try
			{
				Database.Delete<Rent>(id);
			}
			catch (Exception e)
			{
				return this.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, e);
			}

			return this.Request.CreateResponse(HttpStatusCode.NoContent);
		}

		[HttpPost]
		[ActionName("Payment")]
		public HttpResponseMessage PaymentAdd(Guid id)
		{
			var payment = new Payment
			{
				Id = Guid.NewGuid(),
				PaymentAmount = 0,
				Tip = 0,
				Tax = 0,
				ReceiptId = id
			};

			try
			{
				payment.Payer = Database.First<Renter>().Id;
				Database.Insert(payment);
			}
			catch (Exception e)
			{
				return this.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, e);
			}

			return this.Request.CreateResponse(HttpStatusCode.OK, new RowModel(payment));
		}

		[HttpPut]
		[ActionName("Payment")]
		public HttpResponseMessage PaymentUpdate(Payment pmt)
		{
			try
			{
				Database.Update(pmt);
			}
			catch (Exception e)
			{
				return this.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, e);
			}

			return this.Request.CreateResponse(HttpStatusCode.OK, new RowModel(pmt));
		}

		[HttpDelete]
		[ActionName("Payment")]
		public HttpResponseMessage PaymentDelete(Guid id)
		{
			try
			{
				Database.Delete<Payment>(id);
			}
			catch (Exception e)
			{
				return this.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, e);
			}

			return this.Request.CreateResponse(HttpStatusCode.NoContent);
		}
	}
}
