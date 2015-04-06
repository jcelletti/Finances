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
	[Table("Renters")]
	public class Renter
	{
		[Key]
		[Orm("Id")]
		public Guid Id { get; set; }

		[Orm("First")]
		public string First { get; set; }

		[Orm("Last")]
		public string Last { get; set; }

		[JsonIgnore]
		public string FullName
		{
			get { return string.Format("{0} {1}", this.First, this.Last); }
		}
	}
}
