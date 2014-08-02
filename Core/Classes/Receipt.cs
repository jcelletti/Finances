using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Newtonsoft.Json;
using Core.Attributes;

namespace Core.Classes
{
	[Table("Receipts")]
	public class Receipt
	{
		[Key]
		[Orm("Id")]
		public Guid Id { get; set; }

		[Orm("Name")]
		public string Name { get; set; }

		[Orm("Date")]
		public DateTime Date { get; set; }

		[Orm("Tip")]
		public decimal Tip { get; set; }

		[Orm("Tax")]
		public decimal Tax { get; set; }

		[Orm("Total")]
		public decimal Total { get; set; }

		[Orm("Payer")]
		public Guid Payer { get; set; }

		[RentRelation]
		[Orm("RentId")]
		public Guid RentId { get; set; }
	}
}
