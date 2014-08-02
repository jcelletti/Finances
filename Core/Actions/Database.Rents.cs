using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Core.Classes;

namespace Core.Actions
{
	public partial class Database
	{
		public static void InsertRent(Rent rent)
		{
			IDbCommand command = null;
			try
			{
				command = DbActions.GetCommand();

				string data = string.Format("'{0}', '{1}', '{2}'", rent.Id, rent.Name, rent.Month);
				command.CommandText = string.Format(DbActions.InsertStatement, Rent.TableName, Rent.Columns, data);

				command.CommandType = CommandType.Text;

				command.ExecuteNonQuery();

			}
			finally
			{
				DbActions.DisposeCommand(command);
			}
		}

		public static void UpdateRent(Rent rent)
		{
			IDbCommand command = null;
			try
			{
				command = DbActions.GetCommand();

				string data = string.Format("Name='{0}', Month='{1}'", rent.Name, rent.Month);
				command.CommandText = string.Format(DbActions.UpdateStatement, Rent.TableName, data, Rent.IdColumn, "'" + rent.Id + "'");

				command.CommandType = CommandType.Text;

				command.ExecuteNonQuery();
			}
			finally
			{
				DbActions.DisposeCommand(command);
			}
		}

		public static Rent GetRent(Guid id)
		{
			IDbCommand command = null;

			SqlDataReader reader = null;
			try
			{
				command = DbActions.GetCommand();
				if (id == Guid.Empty)
				{
					command.CommandText = string.Format("SELECT TOP 1 * From {0}", Rent.TableName);
				}
				else
				{
					command.CommandText = string.Format(DbActions.Top1, Rent.TableName, Rent.IdColumn, "'" + id.ToString() + "'");
				}
				command.CommandType = CommandType.Text;

				reader = (SqlDataReader)command.ExecuteReader();

				while (reader.Read())
				{
					return Rent.GetRent(reader);
				}

				return new Rent();
			}
			finally
			{
				DbActions.DisposeCommand(command);
				DbActions.DisposeReader(reader);
			}
		}

		public static IEnumerable<Rent> GetRents()
		{
			IDbCommand command = null;

			IDataReader reader = null;
			try
			{
				command = DbActions.GetCommand();
				command.CommandText = string.Format(DbActions.Select, Rent.TableName);

				command.CommandType = CommandType.Text;

				reader = command.ExecuteReader();
				var rents = new List<Rent>();

				while (reader.Read())
				{
					rents.Add(Rent.GetRent(reader));
				}

				return rents;
			}
			finally
			{
				DbActions.DisposeCommand(command);
				DbActions.DisposeReader(reader);
			}
		}

	}
}
