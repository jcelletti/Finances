using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Filters;

using Core.Actions;
using Core.Classes;

namespace Web.ApiControllers
{
	[ApiExceptionFilter]
	public class ApiControllerBase : ApiController
	{
		public ApiControllerBase()
			: base()
		{
		}
	}

	public class ApiExceptionFilter : ExceptionFilterAttribute
	{
		public override void OnException(HttpActionExecutedContext context)
		{
			base.OnException(context);
		}
	}

	[RoutePrefix("Renter")]
	public class RenterController : ApiControllerBase
	{
		[HttpGet]
		[Route("")]
		public IHttpActionResult All()
		{
			return this.Ok(Database.GetAll<Renter>());
		}

		[HttpGet]
		[Route("{id:guid}")]
		public IHttpActionResult Get(Guid id)
		{
			return this.Ok(Database.Get<Renter>(id));
		}

		[HttpPost]
		[Route("")]
		public IHttpActionResult Add(Renter renter)
		{
			renter.Id = Guid.NewGuid();
			Database.Insert(renter);

			return this.Ok(Database.Get<Renter>(renter.Id));
		}

		[HttpPut]
		[Route("")]
		public IHttpActionResult Update(Renter renter)
		{
			//todo: check for no id
			Database.Update<Renter>(renter);

			return this.Ok(Database.Get<Renter>(renter.Id));
		}

		[HttpDelete]
		[Route("{id:guid}")]
		public IHttpActionResult Delete(Guid id)
		{
			Database.Delete<Renter>(id);
			return this.Ok();
		}
	}

	[RoutePrefix("Rent")]
	public class RentController : ApiControllerBase
	{
		[HttpGet]
		[Route("")]
		public IHttpActionResult All()
		{
			return this.Ok(Database.GetAll<Rent>());
		}

		[HttpPost]
		[Route("")]
		public IHttpActionResult RentAdd()
		{
			var rent = new Rent
			{
				Id = Guid.NewGuid(),
				Name = "New Rent",
				Month = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1)
			};

			Database.Insert(rent);

			return this.Ok(Database.Get<Rent>(rent.Id));
		}

		[HttpPut]
		[Route("")]
		public IHttpActionResult RentUpdate(Rent rent)
		{
			Database.Update(rent);
			return this.Ok(Database.Get<Rent>(rent.Id));
		}

		[HttpDelete]
		[Route("{id:guid}")]
		public IHttpActionResult RentDelete(Guid id)
		{
			Database.Delete<Rent>(id);
			return this.Ok();
		}
	}

	[RoutePrefix("Receipt")]
	public class ReceiptController : ApiControllerBase
	{
		[HttpGet]
		[Route("")]
		public IHttpActionResult All()
		{
			return this.Ok(Database.GetAll<Receipt>());
		}

		[HttpGet]
		[Route("{rentId:guid}/ByRent")]
		public IHttpActionResult GetByRent(Guid rentId)
		{
			return this.Ok(Database.GetAllByRent<Receipt>(rentId));
		}
	}

	[RoutePrefix("Payment")]
	public class PaymentController : ApiControllerBase
	{
		[HttpGet]
		[Route("")]
		public IHttpActionResult All()
		{
			return this.Ok(Database.GetAll<Payment>());
		}

		[HttpGet]
		[Route("{rentId:guid}/ByRent")]
		public IHttpActionResult ByRent(Guid rentId)
		{
			return this.Ok(Database.GetAllByRent<Payment>(rentId));
		}

		[HttpGet]
		[Route("{paymentId:guid}/ByPayment")]
		public IHttpActionResult ByPayment(Guid paymentId)
		{
			return this.Ok(Database.GetPaymentsByReceipt(paymentId));
		}
	}
}
