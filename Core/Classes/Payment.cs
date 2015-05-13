using System;
using Core.Attributes;

namespace Core.Classes
{
	[Table("Payments")]
	public class Payment
	{
		[Key]
		[Orm("Id")]
		public Guid Id { get; set; }

		[Orm("Payer")]
		public Guid Payer { get; set; }

		[Orm("Payment")]
		public decimal PaymentAmount { get; set; }

		[Orm("Tax")]
		public decimal Tax { get; set; }

		[Orm("Tip")]
		public decimal Tip { get; set; }

		[RentRelation("IN (SELECT Id FROM Receipts WHERE RentId ='{0}')")]
		[ReceiptRelation]
		[Orm("ReceiptId")]
		public Guid ReceiptId { get; set; }

	}
}
