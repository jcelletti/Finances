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
		public static IEnumerable<Receipt> GetReceipts()
		{
			IDbCommand command = null;

			IDataReader reader = null;
			try
			{
				command = DbActions.GetCommand();
				command.CommandText = string.Format(DbActions.Select, Receipt.TableName);

				command.CommandType = CommandType.Text;

				reader = command.ExecuteReader();
				var receipts = new List<Receipt>();

				while (reader.Read())
				{
					receipts.Add(Receipt.GetRenter(reader));
				}

				return receipts;
			}
			finally
			{
				DbActions.DisposeCommand(command);
				DbActions.DisposeReader(reader);
			}
		}

		public static IEnumerable<Receipt> ReceiptsByRent(Guid rentId)
		{
			IDbCommand command = null;

			IDataReader reader = null;
			try
			{
				command = DbActions.GetCommand();
				command.CommandText = string.Format(Receipt.ByRent, Receipt.Columns, Receipt.TableName, rentId);

				command.CommandType = CommandType.Text;

				reader = command.ExecuteReader();
				var receipts = new List<Receipt>();

				while (reader.Read())
				{
					receipts.Add(Receipt.GetRenter(reader));
				}

				return receipts;
			}
			finally
			{
				DbActions.DisposeCommand(command);
				DbActions.DisposeReader(reader);
			}
		}

		public static void InsertReceipt(Receipt receipt)
		{
			IDbCommand command = null;
			try
			{
				command = DbActions.GetCommand();

				string data = string.Format("'{0}', '{1}', '{2}', '{3}', '{4}', '{5}', '{6}'", receipt.Id, receipt.Name, receipt.Date, receipt.Tip, receipt.Total, receipt.Payer, receipt.RentId);
				command.CommandText = string.Format(DbActions.InsertStatement, Receipt.TableName, Receipt.Columns, data);

				command.CommandType = CommandType.Text;

				command.ExecuteNonQuery();

			}
			finally
			{
				DbActions.DisposeCommand(command);
			}
		}

		public static void UpdateReceipt(Receipt receipt)
		{
			IDbCommand command = null;
			try
			{
				command = DbActions.GetCommand();


				string data = string.Format("Name='{0}', Date='{1}', Tip='{2}', Total='{3}', Payer='{4}', RentId='{5}'", receipt.Name, receipt.Date, receipt.Tip, receipt.Total, receipt.Payer, receipt.RentId);
				command.CommandText = string.Format(DbActions.UpdateStatement, Receipt.TableName, data, Receipt.IdColumn, "'" + receipt.Id + "'");

				command.CommandType = CommandType.Text;

				command.ExecuteNonQuery();

			}
			finally
			{
				DbActions.DisposeCommand(command);
			}
		}

	}
}
