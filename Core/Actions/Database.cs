using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

using Core.Classes;

namespace Core.Actions
{
	public class Database
	{
		public static T First<T>()
		{
			IDbCommand command = null;

			try
			{
				command = DbActions.GetCommand();
				return Orm.First<T>(command);
			}
			finally
			{
				DbActions.DisposeCommand(command);
			}
		}

		public static T Get<T>(Guid id)
		{
			IDbCommand command = null;
			try
			{
				command = DbActions.GetCommand();
				return Orm.Select<T>(command, id);
			}
			finally
			{
				DbActions.DisposeCommand(command);
			}
		}

		public static IEnumerable<T> GetAll<T>()
		{
			IDbCommand command = null;
			try
			{
				command = DbActions.GetCommand();

				return Orm.Select<T>(command);
			}
			finally
			{
				DbActions.DisposeCommand(command);
			}
		}

		public static IEnumerable<T> GetAllByRent<T>(Guid rentId)
		{
			IDbCommand command = null;

			IDataReader reader = null;
			try
			{
				command = DbActions.GetCommand();

				return Orm.SelectByRent<T>(command, rentId);
			}
			finally
			{
				DbActions.DisposeCommand(command);
				DbActions.DisposeReader(reader);
			}
		}

		public static void Insert<T>(T item)
		{
			IDbCommand command = null;
			try
			{
				command = DbActions.GetCommand();

				Orm.Insert(command, item);
			}
			finally
			{
				DbActions.DisposeCommand(command);
			}
		}

		public static void Update<T>(T item)
		{
			IDbCommand command = null;
			try
			{
				command = DbActions.GetCommand();
				Orm.Update(command, item);
			}
			finally
			{
				DbActions.DisposeCommand(command);
			}
		}

		public static void Delete<T>(Guid id)
		{
			IDbCommand command = null;
			try
			{
				command = DbActions.GetCommand();
				Orm.Delete<T>(command, id);
			}
			finally
			{
				DbActions.DisposeCommand(command);
			}
		}

		public static IEnumerable<Payment> GetPaymentsByReceipt(Guid receiptId)
		{
			IDbCommand command = null;

			try
			{
				command = DbActions.GetCommand();

				return Orm.SelectByReceipt<Payment>(command, receiptId);
			}
			finally
			{
				DbActions.DisposeCommand(command);
			}
		}
	}
}
