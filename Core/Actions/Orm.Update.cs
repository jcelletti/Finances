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
		public static void Update<T>(IDbCommand command, T item)
		{

			MemberInfo key;
			TableAttribute table;
			List<MemberInfo> members;
			Orm.GetOrmAttributes<T>(out members, out key, out table);

			var sb = new StringBuilder(string.Format("UPDATE {0} SET ", table.TableName));

			foreach (var mem in members)
			{
				var prop = (PropertyInfo)mem;
				var ormAttr = prop.GetCustomAttribute<OrmAttribute>();
				sb.AppendFormat("{0} = ", ormAttr.Column);

				if (Orm.UseQuotedValue(prop.PropertyType))
				{
					sb.AppendFormat("'{0}', ", prop.GetValue(item));
				}
				else
				{
					sb.AppendFormat("{0}, ", prop.GetValue(item));
				}
			}

			sb.Remove(sb.Length - 2, 1);

			var keyAttr = key.GetCustomAttribute<OrmAttribute>();

			
			sb.AppendFormat("WHERE {0} = '{1}'", keyAttr.Column, ((PropertyInfo)key).GetValue(item));

			command.CommandText = sb.ToString();
			command.CommandType = CommandType.Text;

			command.ExecuteNonQuery();

		}

	}
}
