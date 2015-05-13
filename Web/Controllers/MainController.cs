using System;
using System.Collections.Generic;
using System.Web.Mvc;

using Web.Models;
using Core.Classes;
using Core.Actions;

namespace Web.Controllers
{
	public class MainController : Controller
	{
		public ActionResult Index()
		{
			IEnumerable<Rent> rents = Database.GetAll<Rent>();
			return this.View(rents);
		}

		public ActionResult Renters()
		{
			IEnumerable<Renter> renters = null;

			try
			{
				renters = Database.GetAll<Renter>();
			}
			catch (Exception e)
			{
				this.ViewBag.Message = e.Message;
			}

			return this.View(renters);
		}

		public ActionResult Receipts()
		{
			var model = new ReceiptsModel();
			try
			{
				model.Receipts = Database.GetAll<Receipt>();
				model.Renters = Database.GetAll<Renter>();
				model.Rents = Database.GetAll<Rent>();
			}
			catch (Exception e)
			{
				this.ViewBag.Message = e.Message;
			}
			return this.View(model);
		}

		public ActionResult ReceiptsByMonth(Guid id)
		{
			var model = new ReceiptsModel();
			try
			{
				model.IsByRent = true;
				var rent = Database.Get<Rent>(id);
				var rents = new List<Rent>();
				rents.Add(rent);
				model.RentId = id;
				model.Rent = rent.Name;
				model.Rents = rents;
				model.Receipts = Database.GetAllByRent<Receipt>(id);
				model.Renters = Database.GetAll<Renter>();
			}
			catch (Exception e)
			{
				this.ViewBag.Message = e.Message;
			}
			return this.View("Receipts", model);
		}

		public ActionResult PaymentsByMonth(Guid id)
		{
			var model = new PaymentsModel();
			try
			{
				model.RentId = id;
				model.RentName = Database.Get<Rent>(id).Name;
				model.Payments = Database.GetAllByRent<Payment>(id);
				model.Receipts = Database.GetAllByRent<Receipt>(id);
				model.Renters = Database.GetAll<Renter>();
			}
			catch (Exception e)
			{
				this.ViewBag.Message = e.Message;
			}
			return this.View("Payments", model);
		}

		public ActionResult PaymentsByReceipt(Guid id)
		{
			var model = new PaymentsModel();
			try
			{
				var rec = Database.Get<Receipt>(id);
				var rent = Database.Get<Rent>(rec.RentId);
				model.Receipt = rec;
				model.RentId = rent.Id;
				model.RentName = rent.Name;
				model.Payments = Database.GetPaymentsByReceipt(id);
				model.Renters = Database.GetAll<Renter>();
				model.Receipts = new List<Receipt>();
			}
			catch (Exception e)
			{
				this.ViewBag.Message = e.Message;
			}
			return this.View("Payments", model);
		}
	}
}
