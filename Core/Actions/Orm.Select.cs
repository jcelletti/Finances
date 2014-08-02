using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.Reflection;

using Core.Classes;
using Core.Attributes;

namespace Core.Actions
{
	public partial class Orm
	{
		public static T First<T>(IDbCommand command)
		{
			List<MemberInfo> members = Orm.FirstInternal<T>(command);
			T item = default(T);
			IDataReader reader = null;
			try
			{
				reader = command.ExecuteReader();

				while (reader.Read())
				{
					item = Orm.GetFromReader<T>(reader, members);
					break;
				}
			}
			finally
			{
				DbActions.DisposeReader(reader);
			}
			return item;
		}

		public static T Select<T>(IDbCommand command, Guid id)
		{
			List<MemberInfo> members = Orm.SelectInternal<T>(command, id);
			T item = default(T);
			IDataReader reader = null;
			try
			{
				reader = command.ExecuteReader();

				while (reader.Read())
				{
					item = Orm.GetFromReader<T>(reader, members);
					break;
				}
			}
			finally
			{
				DbActions.DisposeReader(reader);
			}
			return item;
		}

		public static IEnumerable<T> Select<T>(IDbCommand command)
		{
			List<MemberInfo> members = Orm.SelectInternal<T>(command);
			List<T> items = new List<T>();

			IDataReader reader = null;
			try
			{
				reader = command.ExecuteReader();
				while (reader.Read())
				{
					items.Add(Orm.GetFromReader<T>(reader, members));
				}
			}
			finally
			{
				DbActions.DisposeReader(reader);
			}

			return items;
		}

		public static IEnumerable<T> SelectByRent<T>(IDbCommand command, Guid rentId)
		{
			List<MemberInfo> members = Orm.SelectByRentInternal<T>(command, rentId);
			var items = new List<T>();

			IDataReader reader = null;
			try
			{
				reader = command.ExecuteReader();
				while (reader.Read())
				{
					items.Add(Orm.GetFromReader<T>(reader, members));
				}
			}
			finally
			{
				DbActions.DisposeReader(reader);
			}

			return items;
		}

		public static IEnumerable<T> SelectByReceipt<T>(IDbCommand command, Guid receiptId)
		{
			List<MemberInfo> members = Orm.SelectInternal<T>(command);
			Orm.SelectByReceiptInternal<T>(command, receiptId);

			var items = new List<T>();
			IDataReader reader = null;
			try
			{
				reader = command.ExecuteReader();
				while (reader.Read())
				{
					items.Add(Orm.GetFromReader<T>(reader, members));
				}
			}
			finally
			{
				DbActions.DisposeReader(reader);
			}

			return items;
		}

		private static List<MemberInfo> FirstInternal<T>(IDbCommand command)
		{
			MemberInfo key;
			TableAttribute table;
			List<MemberInfo> members;
			IEnumerable<OrmAttribute> attributes = Orm.GetOrmAttributes<T>(out members, out key, out table);

			string select = Orm.GetSelect(attributes, table.Alias, true);
			string from = Orm.GetFrom(table, key);

			command.CommandType = CommandType.Text;
			command.CommandText = string.Format("{0}{1}", select, from);

			return members;
		}

		private static List<MemberInfo> SelectInternal<T>(IDbCommand command, Guid? id = null)
		{
			MemberInfo key;
			TableAttribute table;
			List<MemberInfo> members;
			IEnumerable<OrmAttribute> attributes = Orm.GetOrmAttributes<T>(out members, out key, out table);

			string select = Orm.GetSelect(attributes, table.Alias);
			string from = Orm.GetFrom(table, key, id);

			command.CommandType = CommandType.Text;
			command.CommandText = string.Format("{0}{1}", select, from);

			return members;
		}

		private static List<MemberInfo> SelectInternal<T>(IDbCommand command, string where)
		{
			MemberInfo key;
			TableAttribute table;
			List<MemberInfo> members;
			IEnumerable<OrmAttribute> attributes = Orm.GetOrmAttributes<T>(out members, out key, out table);

			string select = Orm.GetSelect(attributes, table.Alias);
			string from = Orm.GetFrom(table, key, where);

			command.CommandType = CommandType.Text;
			command.CommandText = string.Format("{0}{1}", select, from);

			return members;
		}

		public static List<MemberInfo> SelectByRentInternal<T>(IDbCommand command, Guid rentId)
		{
			MemberInfo key;
			TableAttribute table;
			List<MemberInfo> members;
			IEnumerable<OrmAttribute> attributes = Orm.GetOrmAttributes<T>(out members, out key, out table);

			string select = Orm.GetSelect(attributes, table.Alias);
			string from = Orm.GetFrom(table, key);
			PropertyInfo prop = Orm.GetUniqueAttribute<T, RentRelationAttribute>();
			var rrAttr = prop.GetCustomAttribute<RentRelationAttribute>();
			var ormAttr = prop.GetCustomAttribute<OrmAttribute>();

			string where = string.Format("WHERE {0} ", ormAttr.Column);

			if (rrAttr.UseEquals)
			{
				where += string.Format("= '{0}'", rentId);
			}
			else
			{
				where += string.Format(rrAttr.Where, rentId);
			}

			command.CommandType = CommandType.Text;
			command.CommandText = string.Format("{0}{1}{2}", select, from, where);

			return members;
		}

		public static List<MemberInfo> SelectByReceiptInternal<T>(IDbCommand command, Guid receiptId)
		{
			MemberInfo key;
			TableAttribute table;
			List<MemberInfo> members;
			IEnumerable<OrmAttribute> attributes = Orm.GetOrmAttributes<T>(out members, out key, out table);

			string select = Orm.GetSelect(attributes, table.Alias);
			string from = Orm.GetFrom(table, key);
			PropertyInfo prop = Orm.GetUniqueAttribute<T, RentRelationAttribute>();
			var rrAttr = prop.GetCustomAttribute<ReceiptRelationAttribute>();
			var ormAttr = prop.GetCustomAttribute<OrmAttribute>();

			string where = string.Format("WHERE {0} ", ormAttr.Column) + string.Format("= '{0}'", receiptId);

			command.CommandType = CommandType.Text;
			command.CommandText = string.Format("{0}{1}{2}", select, from, where);

			return members;
		}

		private static string GetSelect(IEnumerable<OrmAttribute> attributes, string alias, bool top1 = false)
		{
			StringBuilder sb = new StringBuilder("SELECT ");

			if (top1)
			{
				sb.Append("TOP 1 ");
			}

			Orm.GetItems(sb, attributes, alias);

			return sb.ToString();
		}

	}
}
