using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Attributes
{
	public class OrmAttribute : Attribute
	{
		public OrmAttribute(string column)
		{
			this.Column = column;
		}

		public string Column { get; private set; }
	}

	public class KeyAttribute : Attribute
	{
		public KeyAttribute() { }
	}

	public class TableAttribute : Attribute
	{
		public TableAttribute(string tableName, string alias = null)
		{
			this.TableName = tableName;
			this.Alias = alias;
		}

		public string TableName { get; private set; }

		public string Alias { get; private set; }
	}

	public class RentRelationAttribute : Attribute
	{
		public RentRelationAttribute()
		{
			this.UseEquals = true;
		}

		public RentRelationAttribute(string selectWhere)
		{
			this.Where = selectWhere;
		}

		public string Where { get; private set; }

		public bool UseEquals { get; private set; }
	}

	public class ReceiptRelationAttribute : Attribute
	{

	}
}
