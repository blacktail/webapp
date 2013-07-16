require(['app/sidebar','backbone'], function (Sidebar, Backbone) {
	var Workspace = Backbone.Router.extend({
		routes: {
			"help/:page": "help"
		},

		initialize: function () {
			this.on('route:help', function (page) {
				console.log('help page: ', page);
			});
		},

		help: function () {
			console.log('help route entered.');
		}
	});

	var w = new Workspace;

	Backbone.history.start({
		root: 'app/src'
	});
});
