define(['lodash', 'handlebars'], function (_, Handlebars) {
	return {
		'conditional': function (conditional, t, f, options) {
			if (conditional) {
				return t;
			} else {
				return f;
			}
		}
	};
});