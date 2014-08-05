using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core
{
	public class DbActions
	{
		public const string InsertStatement = "INSERT INTO {0} ({1}) VALUES ({2})";
		public const string UpdateStatement = "UPDATE {0} SET {1} WHERE {2} = {3}";
		public const string DeleteStatement = "DELETE FROM {0} WHERE {1} = {2}";
		public const string Top1 = "SELECT TOP 1 * FROM {0} WHERE {1} = {2}";
		public const string Select = "SELECT * FROM {0}";

		private static string ConnectionString { get; set; }

		public const int _dbTimeout = 30;

		public static IDbCommand GetCommand()
		{
			SqlCommand command = new SqlCommand();
			SqlConnection conn = new SqlConnection(DbActions.ConnectionString);
			conn.Open();
			command.Connection = conn;
			command.CommandTimeout = DbActions._dbTimeout;

			return command;
		}

		public static IDbCommand GetCommand(IsolationLevel iso)
		{
			IDbCommand command = DbActions.GetCommand();
			IDbTransaction trans = command.Connection.BeginTransaction(iso);
			command.Transaction = trans;

			return command;

		}

		public static void DisposeCommand(IDbCommand command)
		{
			if (command != null)
			{
				if (command.Transaction != null)
				{
					command.Transaction.Rollback();
				}
				command.Connection.Close();
				command.Dispose();
			}
		}

		public static void DisposeReader(IDataReader reader)
		{
			if (reader != null)
			{
				reader.Close();
				reader.Dispose();
			}
		}


		public static IDataParameter CreateIParam(string name, DbType dbType, object value)
		{
			return DbActions.CreateParam(name, dbType, ParameterDirection.Input, value);
		}

		public static IDataParameter CreateOParam(string name, DbType dbType, object value = null)
		{
			return DbActions.CreateParam(name, dbType, ParameterDirection.Output, value);
		}

		public static IDataParameter CreateIOParam(string name, DbType dbType, object value)
		{
			return DbActions.CreateParam(name, dbType, ParameterDirection.InputOutput, value);
		}

		private static IDataParameter CreateParam(string name, DbType dbType, ParameterDirection pDirection, object value = null)
		{
			SqlParameter param = new SqlParameter();

			param.ParameterName = name;
			param.DbType = dbType;
			param.Direction = pDirection;
			if (pDirection != ParameterDirection.Output)
			{
				param.Value = value;
			}
			return param;
		}

		public static void AddParameters(IDbCommand command, params IDataParameter[] parameters)
		{
			foreach (IDataParameter param in parameters)
			{
				command.Parameters.Add(param);
			}
		}

		public static void SetConnectionString(string connectionString)
		{
			DbActions.ConnectionString = connectionString;
		}
	}
}
