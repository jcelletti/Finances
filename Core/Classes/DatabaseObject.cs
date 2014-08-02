using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Classes
{
	public abstract class DatabaseObject
	{
		abstract static string Columns {get;set;}
	}
}
