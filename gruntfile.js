function crypt(text, algo) {
	var crypto = require('crypto');
	text = String(text || '');
	algo = algo || 'sha256';

	return crypto.createHash(algo).update(text).digest('hex');
}

module.exports = function (grunt) {
	var destDir = grunt.option('dest') || '../build';
	var destName = crypt(new Date().getTime(), 'md5');
	grunt.initConfig({
		copy: {
			main: {
				options: {
					processContent: function (content, srcPath) {
						return content.replace(/.*<script.*livereload.*\/script>.*/, '').
							replace(/startup\.js/, destName + '.js').
							replace(/main\.css/, destName + '.css');
					}
				},
				files: [
					{expand: true, src: ['./*.html'], dest: destDir, filter: 'isFile'}
				]
			},
			imgs: {
				files: [
					{expand: true, src: ['css/img/*.*'], dest: destDir, filter: 'isFile'}
				]
			}
		},
		requirejs: {
			js: {
				options: {
					baseUrl: 'scripts',
					mainConfigFile: 'scripts/config.js',
					name: 'startup',
					optimize: 'uglify2',
					out: destDir + '/scripts/' + destName + '.js',
					preserveLicenseComments: false,
					generateSourceMaps: true,
					paths: {
						'handlebars': '../components/handlebars/handlebars.runtime',
						'partials-compiled': 'templates/partials-compiled',
						'templates-compiled': 'templates/templates-compiled'
					},
					done: function (done) {
						grunt.file.delete('./scripts/templates/partials-compiled.js');
						grunt.file.delete('./scripts/templates/templates-compiled.js');
						done();
					}
				}
			},
			css: {
				options: {
					optimizeCss: 'standard',
					cssIn: 'css/main.css',
					out: destDir + '/css/' + destName + '.css'
				}
			}
		},
		concat: {
			startup: {
				options: {
					footer: '\nrequire(["main"]);\n'
				},
				files: {
					'scripts/startup.js': ['components/requirejs/require.js', 'scripts/config.js']
				}
			}
		},
		uglify: {
			startup: {
				options: {
					banner: '// this file is auto generated by build-process, please do not modify it by yourself.\n'
				},
				files: {
					'scripts/startup.js': ['scripts/startup.js']
				}
			}
		},
		lodash: {
			build: {
				dest: 'scripts/lodash.template.js',
				options: {
					template: 'scripts/templates/*.html',
					flags: [
						'debug'
					]
				}
			}
		},
		handlebars: {
			partials: {
				options: {
					amd: true,
					partialRegex: /.*/,
					partialsPathRegex: /\/partials\//,
					processPartialName: function (filePath) {
						return filePath.replace(/^scripts\/templates\/partials\//, '').replace(/\..*$/, '');
					}
				},
				files: {
					'scripts/templates/partials-compiled.js': ['scripts/templates/partials/**/*.html']
				}
			},
			templates: {
				options: {
					amd: true,
					processName: function (fileName) {
						return fileName.replace(/^scripts\/templates\//, '').replace(/\..*$/, '');
					}
				},
				files: {
					'scripts/templates/templates-compiled.js': ['scripts/templates/**/*.html', '!scripts/templates/partials/*.html'] 
				}
			}
		},
		watch: {
			scripts: {
				options: {
					livereload: true
				},
				files: ['components/requirejs/require.js', 'scripts/config.js'],
				tasks: ['startup']
			},
			templates: {
				options: {
					livereload: true
				},
				files: ['scripts/templates/**/*.html'],
				tasks: ['templates']
			},
			livereload: {
				files: ['!scripts/config.js', '!scripts/templates/**/*.html', '!scripts/templates/*-compiled.js', '!scripts/startup.js',
					'!scripts/**/auto-*.js', '!components/requirejs/require.js', '**/*.js', '**/*.css', 'index.html'],
				options: {
					livereload: true
				}
			}
		},
		clean: {
			options: {
				force: true
			},
			stuff: [destDir]
		},
		templates: {
			options: {
				base: 'scripts'
			},
			partials: {
				options: {
					partial: true
				},
				files: {
					'scripts/templates/auto-partials.js': ['scripts/templates/partials/**/*.html']
				}
			},
			templates: {
				files: {
					'scripts/templates/auto-templates.js': ['scripts/templates/**/*.html', '!scripts/templates/partials/**/*.html'] 
				}
			}
		},
		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true,
					collapseBooleanAttributes: true,
					removeAttributeQuotes: true,
					useShortDoctype: true,
					removeRedundantAttributes: true,
					removeCommentsFromCDATA: true
				},
				files: [{
					src: destDir + '/index.html', dest: destDir + '/index.html'
				}]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-lodash');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-livereload');
	grunt.loadNpmTasks('grunt-contrib-handlebars');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');	

	grunt.registerTask('startup', ['concat:startup','uglify:startup']);

	grunt.registerTask('init', ['templates', 'startup', 'watch']);

	grunt.registerTask('dist', ['clean', 'handlebars', 'startup','copy','requirejs', 'htmlmin']);

	grunt.registerTask('default', ['dist', 'init']);

	grunt.registerMultiTask('templates', 'template debug', function () {
		var options = this.options({
			base: 'scripts'
		});

		// generate partials.js
		var partialDeps = [];

		this.files.forEach(function (f) {
			partialDeps = partialDeps.concat(f.src.map(function (src, index) {
				return 'text!' + src.replace(options.base, '').replace(/^\//, '');
			}));

			var funcArgs = ['Handlebars'];
			var fileStr = '';

			var funcBody = options.partial ? [] : {};

			partialDeps.forEach(function (partial, index) {
				var tplName = partial.replace(/.*(partials|templates)\//, '').replace(/\..*$/,'');
				var argName = 'arg' + index;
				funcArgs.push(argName);

				if (options.partial) {
					funcBody.push('Handlebars.registerPartial("' + tplName + '", ' +  argName + ');');
				} else {
					funcBody[tplName] = 'Handlebars.compile(' + argName + ')';
				}
			});

			partialDeps.unshift('handlebars');

			if (options.partial) {
				fileStr = 'define(' + JSON.stringify(partialDeps) + ', function (' + funcArgs.join(',') + ') {\n' +
					funcBody.join('\n') + '\n});';
			} else {
				fileStr = 'define(' + JSON.stringify(partialDeps) + ', function (' + funcArgs.join(',') + ') {\nreturn ' +
					JSON.stringify(funcBody, null, 4).replace(/(:\s)"(.*)"/g, function (match, m1, m2, pos, orig) {
						return m1 + m2;
					}) + ';\n});';
			}

			grunt.file.write(f.dest, fileStr);

			// Print a success message.
      		grunt.log.writeln('File "' + f.dest + '" created.');
		});
	});
};
