using System;
using System.Reflection;

using Core.Classes;

namespace Core
{
	public class BadRequestException : Exception
	{
		public BadRequestException(string message)
			: base(message) { }
	}

	public class InvalidTotalException : BadRequestException
	{
		public InvalidTotalException(Receipt exp, decimal total)
			: base(string.Format("Invalid Total, Receipt: {0}, Expected: {1}, Was {2}", exp.Name, exp.Total, total)) { }
	}

	public class InvalidTipException : BadRequestException
	{

		public InvalidTipException(Receipt exp, decimal tip)
			: base(string.Format("Invalid Tip, Receipt: {0}, Expected: {1}, Was {2}", exp.Name, exp.Tip, tip)) { }
	}

	public class InvalidTaxException : BadRequestException
	{
		public InvalidTaxException(Receipt exp, decimal tax)
			: base(string.Format("Invalid Tax, Receipt: {0}, Expected: {1}, Was {2}", exp.Name, exp.Tax, tax)) { }
	}

	public class InvalidRentSumException : BadRequestException
	{
		public InvalidRentSumException(object model)
			: base(Utilities.SerializeToJson(model)) { }
	}

	public class InvalidKeyAttributeException : BadRequestException
	{
		public InvalidKeyAttributeException()
			: base("Key Attribute Not Found") { }
	}

	public class InvalidMemberAttributeException : BadRequestException
	{
		public InvalidMemberAttributeException(MemberInfo mi, Type attrType)
			: base(string.Format("Member {0} has no attribute {1}", mi.Name, attrType)) { }
	}
}
