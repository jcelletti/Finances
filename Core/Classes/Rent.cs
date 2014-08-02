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
	[Table("RentPeriods")]
	public class Rent
	{
		[Key]
		[Orm("Id")]
		public Guid Id { get; set; }

		[Orm("Name")]
		public string Name { get; set; }

		[Orm("Month")]
		public DateTime Month { get; set; }
	}
}
