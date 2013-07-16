define(['lodash', 'handlebars'], function (_, Handlebars) {
	return {
		link: function () {
		  return "<a href='" + this.url + "'>" + this.body + "</a>";
		},
		list: function (context, options) {
			var attrs = _.map(options.hash, function (value, key) {
				return key + '="' + value + '"';
			}).join(' ');

			return '<ul ' + attrs + '>' + _.map(context, function (value, index) {
				if (options.data) {
					data = Handlebars.createFrame(options.data || {});
					data.index = index;
				}
				return '<li>' + options.fn(value, {data: data}) + '</li>';
			}).join('\n') + '</ul>';
		},
		fullName: function (person) {
			return person.firstName + ' ' + person.lastName;
		},
		fi: function (conditional, options) {
			if (conditional) {
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		}
	};
});