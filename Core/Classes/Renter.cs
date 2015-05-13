using System;
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

		public string FullName
		{
			get { return string.Format("{0} {1}", this.First, this.Last); }
		}
	}
}
