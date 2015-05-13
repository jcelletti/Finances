using Core.Actions;
using Core.Classes;
using System.Collections.Generic;
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
