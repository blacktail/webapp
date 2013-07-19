require([
	'backbone',
	'views/app',
	'routers/router',
], function (Backbone, AppView, Workspace) {
	new Workspace();
	Backbone.history.start({
		root: '/webapp/build/'
	});

	new AppView();
	console.log('new');
});
