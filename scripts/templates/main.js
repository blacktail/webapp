define(['handlebars', './helpers', 'partials-compiled', 'templates-compiled', 'lodash'], function (Handlebars, helpers, partials, templates, _) {
	// register helpers
	_.each(helpers, function (helper, name) {
		Handlebars.registerHelper(name, helper);
	});

	// return compiled templates
	return templates;
});
