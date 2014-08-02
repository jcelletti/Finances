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
		private static string GetFrom(TableAttribute ta, MemberInfo key, Guid? id = null)
		{
			var sb = new StringBuilder("FROM ");

			sb.AppendFormat("{0} ", ta.TableName);

			if (!string.IsNullOrWhiteSpace(ta.Alias))
			{
				sb.AppendFormat("AS {0} ", ta.Alias);
			}

			if (id != null)
			{
				OrmAttribute attr = key.GetCustomAttribute<OrmAttribute>();
				sb.AppendFormat(" WHERE {0} = '{1}'", attr.Column, id);
			}

			return sb.ToString();
		}

		private static string GetFrom(TableAttribute ta, MemberInfo key, string where)
		{
			var sb = new StringBuilder("FROM ");

			sb.AppendFormat("{0} ", ta.TableName);

			if (!string.IsNullOrWhiteSpace(ta.Alias))
			{
				sb.AppendFormat("AS {0} ", ta.Alias);
			}

			sb.AppendFormat(" WHERE {0}", where);

			return sb.ToString();
		}

		private static void GetItems(StringBuilder sb, IEnumerable<OrmAttribute> attributes, string alias = null)
		{
			foreach (var attr in attributes)
			{
				sb.AppendFormat("{0}{1}, ", string.IsNullOrWhiteSpace(alias) ? "" : string.Format("{0}.", alias), attr.Column);
			}
			sb.Remove(sb.Length - 2, 1);
		}

		private static T GetFromReader<T>(IDataReader reader, IEnumerable<MemberInfo> members)
		{
			T item = Activator.CreateInstance<T>();

			foreach (var mem in members)
			{
				PropertyInfo prop = (PropertyInfo)mem;
				OrmAttribute attr = mem.GetCustomAttribute<OrmAttribute>();
				object obj = reader[attr.Column];

				prop.SetValue(item, obj);
			}

			return item;

		}

		private static IEnumerable<OrmAttribute> GetOrmAttributes<T>(out List<MemberInfo> newMembers, out MemberInfo key, out TableAttribute table)
		{
			key = Orm.GetKeyAttribute<T>();
			table = Orm.GetTableAttribute<T>();
			MemberInfo[] members = typeof(T).GetMembers();
			var attributes = new List<OrmAttribute>();
			newMembers = new List<MemberInfo>();

			foreach (var member in members)
			{
				var attr = member.GetCustomAttribute<OrmAttribute>();
				if (attr != null)
				{
					attributes.Add(attr);
					newMembers.Add(member);
				}
			}
			return attributes;
		}

		private static TableAttribute GetTableAttribute<T>()
		{
			TableAttribute attr = typeof(T).GetCustomAttribute<TableAttribute>();
			return attr;
		}

		private static MemberInfo GetKeyAttribute<T>()
		{
			PropertyInfo[] properties = typeof(T).GetProperties();

			foreach (var prop in properties)
			{
				KeyAttribute key = prop.GetCustomAttribute<KeyAttribute>();

				if (key != null)
				{
					return prop;
				}

			}
			throw new InvalidKeyAttributeException();
		}

		private static PropertyInfo GetUniqueAttribute<T, A>() where A : Attribute
		{
			PropertyInfo[] properties = typeof(T).GetProperties();

			foreach (var prop in properties)
			{
				A attr = prop.GetCustomAttribute<A>();

				if (attr != null)
				{
					return prop;
				}

			}

			throw new Exception("could not find unique attribute");
		}

		private static bool UseQuotedValue(Type type)
		{
			return type == typeof(string) || type == typeof(Guid) || type == typeof(DateTime);
		}
	}
}
