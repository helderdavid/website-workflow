var gulp 		= require('gulp'),
	gutil 		= require('gulp-util'),
	coffee 		= require('gulp-coffee'),
	browserify 	= require('gulp-browserify'),
	compass 	= require('gulp-compass'),
	connect 	= require('gulp-connect'),
	concat 		= require('gulp-concat'),
	gulpif 		= require('gulp-if'),
	uglify 		= require('gulp-uglify'),
	minifyHTML	= require('gulp-minify-html'),
	minifyJSON	= require('gulp-jsonminify'),
	imagemin	= require('gulp-imagemin'),
	pngcrush	= require('imagemin-pngcrush');

var env = process.env.NODE_ENV || 'development'; //production
var outputDir,
	sassStyle;

	if(env == 'development'){
		gutil.log('Development envoirment');

		outputDir = 'builds/development/';
		sassStyle = 'expanded';
	}else{ //production
		gutil.log('Production envoirment');

		outputDir = 'builds/production/';
		sassStyle = 'compressed';
	}

var	coffeeSources 	= ['components/coffee/*.coffee'],
	sassSources 	= ['components/sass/style.scss'],
	htmlSources 	= ['builds/development/*.html'],
	dataSources 	= ['builds/development/js/*.json'],
	imageSources 	= ['builds/development/images/**/*.*'],
	jsSources 		= [ 'components/scripts/rclick.js',
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
			.pipe(gulpif(env === 'production', uglify()))
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
			.pipe(gulpif(env === 'production', minifyHTML()))
			.pipe(gulpif(env === 'production', gulp.dest(outputDir)))
			.pipe(connect.reload())

	});

	gulp.task('images',function(){
		gulp.src(imageSources)
			.pipe(gulpif(env === 'production', imagemin({
				progressive:true,
				svgoPlugins:[{removeViewBox:false}],
				use:[pngcrush()]
			})))
			.pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
			.pipe(connect.reload())
	});

	gulp.task('json',function(){
		gulp.src(dataSources)
			.pipe(gulpif(env === 'production', minifyJSON()))
			.pipe(gulpif(env === 'production', gulp.dest('builds/production/js/')))
			.pipe(connect.reload())
	});


	gulp.task('watch',function(){
		gulp.watch(coffeeSources,['coffee']);
		gulp.watch(jsSources,['js']);
		gulp.watch('components/sass/*.scss',['compass']);
		gulp.watch(htmlSources,['html']);
		gulp.watch(imageSources,['images']);
		gulp.watch(dataSources,['json']);
	});

	gulp.task('connect',function(){
		connect.server({
			root: outputDir,
			livereload: true,
    		port: 3000	
		});
	});


	gulp.task('default',['coffee', 'js', 'compass', 'images', 'connect', 'watch']);