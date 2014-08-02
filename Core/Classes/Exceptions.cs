using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

using Core.Classes;


namespace Core
{
	public class InvalidTotalException : Exception
	{
		public InvalidTotalException(Receipt exp, decimal total)
			: base(string.Format("Invalid Total, Receipt: {0}, Expected: {1}, Was {2}", exp.Name, exp.Total, total)) { }
	}

	public class InvalidTipException : Exception
	{

		public InvalidTipException(Receipt exp, decimal tip)
			: base(string.Format("Invalid Tip, Receipt: {0}, Expected: {1}, Was {2}", exp.Name, exp.Tip, tip)) { }
	}

	public class InvalidTaxException : Exception
	{
		public InvalidTaxException(Receipt exp, decimal tax)
			: base(string.Format("Invalid Tax, Receipt: {0}, Expected: {1}, Was {2}", exp.Name, exp.Tax, tax)) { }
	}

	public class InvalidRentSumException : Exception
	{
		public InvalidRentSumException(object model) : base(Utilities.SerializeToJson(model)) { }
	}

	public class InvalidKeyAttributeException : Exception
	{
		public InvalidKeyAttributeException() : base("Key Attribute Not Found") { }
	}

	public class InvalidMemberAttributeException : Exception
	{
		public InvalidMemberAttributeException(MemberInfo mi, Type attrType) : base(string.Format("Member {0} has no attribute {1}", mi.Name, attrType)) { }
	}
}
