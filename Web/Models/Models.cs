using System;
using System.Collections.Generic;

using Newtonsoft.Json;
using Core.Classes;

namespace Web.Models
{
	public class IndexModel
	{
		public List<DateTime> Rents { get; set; }
	}

	public class PaymentsModel
	{
		public string RentName { get; set; }

		public Guid RentId { get; set; }

		public Receipt Receipt { get; set; }

		public IEnumerable<Payment> Payments { get; set; }

		public IEnumerable<Receipt> Receipts { get; set; }

		public IEnumerable<Renter> Renters { get; set; }
	}

	public class ReceiptsModel
	{
		public bool IsByRent { get; set; }

		public string Rent { get; set; }

		public Guid RentId { get; set; }

		public IEnumerable<Receipt> Receipts { get; set; }

		public IEnumerable<Renter> Renters { get; set; }

		public IEnumerable<Rent> Rents { get; set; }
	}

	public class RentValidationModel
	{
		public RentValidationModel(Guid id, string name, decimal owed)
		{
			this.Id = id;
			this.Name = name;
			this.Owed = owed;
		}

		public Guid Id { get; private set; }

		public string Name { get; private set; }

		public decimal Owed { get; private set; }
	}

	public class RowModel
	{
		public RowModel(object data)
		{
			this.Data = data;
		}

		[JsonProperty("isEditing")]
		public bool IsEditing { get; set; }

		[JsonProperty("isSelected")]
		public bool IsSelected { get; set; }

		[JsonProperty("data")]
		public object Data { get; set; }
	}
}
