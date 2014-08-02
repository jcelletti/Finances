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
		public static void InsertRenter(Renter renter)
		{
			IDbCommand command = null;
			try
			{
				command = DbActions.GetCommand();

				string data = string.Format("'{0}', '{1}', '{2}'", renter.Id, renter.First, renter.Last);
				command.CommandText = string.Format(DbActions.InsertStatement, Renter.TableName, Renter.Columns, data);

				command.CommandType = CommandType.Text;

				command.ExecuteNonQuery();

			}
			finally
			{
				DbActions.DisposeCommand(command);
			}
		}

		public static void UpdateRenter(Renter renter)
		{
			IDbCommand command = null;
			try
			{
				command = DbActions.GetCommand();

				string data = string.Format("First='{0}', Last='{1}'", renter.First, renter.Last);
				command.CommandText = string.Format(DbActions.UpdateStatement, Renter.TableName, data, Renter.IdColumn, "'" + renter.Id + "'");

				command.CommandType = CommandType.Text;

				command.ExecuteNonQuery();
			}
			finally
			{
				DbActions.DisposeCommand(command);
			}
		}

		public static Renter GetRenter(Guid id)
		{
			IDbCommand command = null;

			SqlDataReader reader = null;
			try
			{
				command = DbActions.GetCommand();
				if (id == Guid.Empty)
				{
					command.CommandText = string.Format("SELECT TOP 1 * From {0}", Renter.TableName);
				}
				else
				{
					command.CommandText = string.Format(DbActions.Top1, Renter.TableName, Renter.IdColumn, "'" + id.ToString() + "'");
				}
				command.CommandType = CommandType.Text;

				reader = (SqlDataReader)command.ExecuteReader();

				while (reader.Read())
				{
					return Renter.GetRenter(reader);
				}

				return new Renter();
			}
			finally
			{
				DbActions.DisposeCommand(command);
				DbActions.DisposeReader(reader);
			}
		}

		public static IEnumerable<Renter> GetRenters()
		{
			IDbCommand command = null;

			IDataReader reader = null;
			try
			{
				command = DbActions.GetCommand();
				command.CommandText = string.Format(DbActions.Select, Renter.TableName);

				command.CommandType = CommandType.Text;

				reader = command.ExecuteReader();
				var renters = new List<Renter>();

				while (reader.Read())
				{
					renters.Add(Renter.GetRenter(reader));
				}

				return renters;
			}
			finally
			{
				DbActions.DisposeCommand(command);
				DbActions.DisposeReader(reader);
			}
		}

	}
}
