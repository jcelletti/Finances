using System.Web;
using System.Web.Optimization;

namespace Web
{
	public class BundleConfig
	{
		// For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
		public static void RegisterBundles(BundleCollection bundles)
		{
			BundleConfig.RegisterScripts(bundles);
			BundleConfig.RegisterStyles(bundles);
		}

		private static void RegisterScripts(BundleCollection bundles)
		{
			bundles.Add(new ScriptBundle("~/bundles/jquery")
				.Include("~/Scripts/jquery-{version}.js"));

			bundles.Add(new ScriptBundle("~/bundles/jqueryui")
				.Include("~/Scripts/jquery-ui-{version}.js"));

			bundles.Add(new ScriptBundle("~/bundles/jqueryval")
				.Include("~/Scripts/jquery.unobtrusive*",
						"~/Scripts/jquery.validate*"));

			bundles.Add(new ScriptBundle("~/bundles/modernizr")
				.Include("~/Scripts/modernizr-*"));

			bundles.Add(new ScriptBundle("~/bundles/Moment")
				.Include("~/Scripts/moment.js"));

			bundles.Add(new ScriptBundle("~/bundles/Angularjs")
				.Include("~/Scripts/angular.js",
						"~/Scripts/angular-ui/ui-bootstrap.js",
						"~/Scripts/angular-ui/ui-bootstrap-tpls.js"));

			bundles.Add(new ScriptBundle("~/bundles/Sitejs")
				.Include("~/Scripts/data.table.js",
				"~/Scripts/app.js"));

			bundles.Add(new ScriptBundle("~/Scripts/SpaBundle")
				.Include(
				"~/Scripts/SPA/main.js",
				"~/Scripts/SPA/models.js",
				"~/Scripts/SPA/extensions.js",
				"~/Scripts/SPA/http.js",
				"~/Scripts/SPA/data.grid.js"
				));
		}

		private static void RegisterStyles(BundleCollection bundles)
		{
			bundles.Add(new StyleBundle("~/Content/css")
				.Include("~/Content/site.css"));

			bundles.Add(new StyleBundle("~/Styles/SpaBundle")
				.Include("~/Content/SPA/SPA.css"));
		}
	}
}