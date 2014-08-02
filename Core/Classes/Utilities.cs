using Newtonsoft.Json;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core
{
	public class Utilities
	{
		public static string SerializeToJson(object data, bool strongType = false)
		{
			JsonSerializerSettings settings = new JsonSerializerSettings
			{
				DateFormatHandling = DateFormatHandling.IsoDateFormat,
				TypeNameHandling = strongType ? TypeNameHandling.All : TypeNameHandling.None
			};

			return JsonConvert.SerializeObject(data, Formatting.None, settings);
		}

		public static T DeserializeFromJson<T>(string data) where T : class
		{
			JsonSerializerSettings settings = new JsonSerializerSettings
			{
				DateFormatHandling = DateFormatHandling.IsoDateFormat,
				TypeNameHandling = TypeNameHandling.All
			};
			return JsonConvert.DeserializeObject<T>(data, settings);
		}
	}
}
