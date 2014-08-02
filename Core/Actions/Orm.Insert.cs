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
		public static void Insert<T>(IDbCommand command, T item)
		{
			command.CommandType = CommandType.Text;
			command.CommandText = Orm.GetInsertInfo(item);

			command.ExecuteNonQuery();
		}

		private static string GetInsertInfo<T>(T item)
		{
			MemberInfo key;
			TableAttribute table;
			List<MemberInfo> members;
			IEnumerable<OrmAttribute> attributes = Orm.GetOrmAttributes<T>(out members, out key, out table);

			StringBuilder sb = new StringBuilder("INSERT INTO ");

			sb.AppendFormat("{0} (", table.TableName);
			Orm.GetItems(sb, attributes);
			sb.Append(") ");
			var sbVals = new StringBuilder();
			foreach (var mem in members)
			{
				var prop = (PropertyInfo)mem;

				var val = prop.GetValue(item);

				if (Orm.UseQuotedValue(prop.PropertyType))
				{
					sbVals.AppendFormat("'{0}', ", val);
				}
				else
				{
					sbVals.AppendFormat("{0}, ", val);
				}
			}

			sbVals.Remove(sbVals.Length - 2, 1);


			sb.AppendFormat("VALUES({0})", sbVals.ToString());

			return sb.ToString();
		}
	}
}
