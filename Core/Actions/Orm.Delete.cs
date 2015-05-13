using System;
using System.Data;

using System.Reflection;
using Core.Attributes;

namespace Core.Actions
{
	public partial class Orm
	{
		public static void Delete<T>(IDbCommand command, Guid id)
		{
			TableAttribute table = Orm.GetTableAttribute<T>();
			MemberInfo mem = Orm.GetKeyAttribute<T>();
			OrmAttribute orm = mem.GetCustomAttribute<OrmAttribute>();

			command.CommandText = string.Format("DELETE FROM {0} WHERE {1} = '{2}'", table.TableName, orm.Column, id);
			command.CommandType = CommandType.Text;

			command.ExecuteNonQuery();
		}
	}
}
