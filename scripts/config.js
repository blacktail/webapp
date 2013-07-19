require.config({
	baseUrl: 'scripts',
	packages: ['templates'],
	paths: {
		jquery: '../components/jquery/jquery',
		lodash: '../components/lodash/lodash',
		backbone: '../components/backbone/backbone',
		backboneLocalstorage: '../components/backbone.localStorage/backbone.localStorage',
		handlebars: '../components/handlebars/handlebars',
		'partials-compiled': 'templates/auto-partials',
		'templates-compiled': 'templates/auto-templates'
	},
	shim: {
		handlebars: {
			exports: 'Handlebars'
		},
		backbone: {
			deps: ['lodash', 'jquery'],
			exports: 'Backbone'
		}
	},
	urlArgs: "bust=" +  (new Date()).getTime()
});
