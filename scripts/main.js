require(['app/sidebar','backbone'], function (Sidebar, Backbone) {
	var Workspace = Backbone.Router.extend({
		routes: {
			"help/:page": "help",
			"about/:info": "about"
		},

		initialize: function () {
			this.on('route:help', function (page) {
				console.log('help page: ', page);
			});
		},

		help: function () {
			console.log('help route entered.');
		},
		about: function (info) {
			console.log('about', info);
		}
	});

	var w = new Workspace;

	Backbone.history.start({
		root: 'app/src'
	});
});
