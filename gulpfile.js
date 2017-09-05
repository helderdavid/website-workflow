var gulp 		= require('gulp'),
	gutil 		= require('gulp-util'),
	coffee 		= require('gulp-coffee'),
	browserify 	= require('gulp-browserify'),
	compass 	= require('gulp-compass'),
	connect 	= require('gulp-connect'),
	concat 		= require('gulp-concat');

var env = process.env.NODE_ENV || 'production';
var outputDir,
	sassStyle;

	if(env == 'development'){
		gutil.log('Development envoirment');

		outputDir = 'builds/development/';
		sassStyle = 'expanded';
	}else{
		gutil.log('Production envoirment');

		outputDir = 'builds/production/';
		sassStyle = 'compressed';
	}

var	coffeeSources 	= ['components/coffee/*.coffee'],
	sassSources 	= ['components/sass/style.scss'],
	htmlSources 	= [ outputDir + '*.html'],
	dataSources 	= [ outputDir + 'js/*.json'],
	jsSources 		= [	'components/scripts/rclick.js',
						'components/scripts/pixgrid.js',
						'components/scripts/tagline.js',
						'components/scripts/template.js'
					  ];

	gulp.task('log',function(){
		gutil.log('Website workflow started');
	});

	gulp.task('coffee',function(){
		gulp.src(coffeeSources)
			.pipe(coffee({ bare: true })
				.on('Error Config', gutil.log)
			)
			.pipe(gulp.dest('components/scripts'))
	});

	gulp.task('js',function(){
		gulp.src(jsSources)
			.pipe(concat('script.js')
				.on('error jsConcat', gutil.log)
			)
			.pipe(browserify())
			.pipe(gulp.dest(outputDir + 'js'))
			.pipe(connect.reload())
	});


	gulp.task('compass',function(){
		gulp.src(sassSources)
			.pipe(
				compass({
					sass: 'components/sass',
					image: outputDir + 'images',
					style: sassStyle
				})
				.on('error compass scss', gutil.log)
			)
			.pipe(gulp.dest(outputDir + 'css'))
			.pipe(connect.reload())
	});

	gulp.task('html',function(){
		gulp.src(htmlSources)
			.pipe(connect.reload());
	});

	gulp.task('json',function(){
		gulp.src(dataSources)
			.pipe(connect.reload());
	});


	gulp.task('watch',function(){
		gulp.watch(coffeeSources,['coffee']);
		gulp.watch(jsSources,['js']);
		gulp.watch('components/sass/*.scss',['compass']);
		gulp.watch(htmlSources,['html']);
		gulp.watch(dataSources,['json']);
	});

	gulp.task('connect',function(){
		connect.server({
			root: outputDir + '',
			livereload: true,
    		port: 3000	
		});
	});


	gulp.task('default',['coffee', 'js', 'compass', 'connect', 'watch']);