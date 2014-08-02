using Core;
using Core.Actions;
using Core.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Web.Controllers
{
	public class RentController : Controller
	{
		//
		// GET: /Rent/

		public ActionResult Index()
		{
			IEnumerable<Rent> rents = Database.GetAll<Rent>();
			return this.View(rents);
		}

	}
}
