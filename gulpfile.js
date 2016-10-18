/*

An experimental gulpfile that manages a simple cordova based app using
cordova-lib directly without cordova-cli.

Cordova project is created under ./build/ and treated as a build artifact.
`gulp clean` removes the build directory.
`gulp cdvcreate` creates it afresh.
*/

/////// SETTINGS ////////////

// Plugins can't be stores in package.josn right now.
//  - They are published to plugin registry rather than npm.
//  - They don't list their dependency plugins in their package.json.
//    This might even be impossible because dependencies can be platform specific.
//var plugins = [];
var plugins = ['cordova-sqlite-storage'];

// Platform to use for run/emulate. Alternatively, create tasks like runios, runandroid.
var testPlatform = 'browser';

var Q = require('Q');
var path = require('path');
var fs = require('fs');
var del = require('del');
var pkg = require('./package.json');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var cordova_lib = require('cordova-lib');
var cdv = cordova_lib.cordova.raw;
var buildDir = path.join(__dirname, 'build');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var inject = require('gulp-inject');
var jade = require('gulp-jade');
var series = require('stream-series');
var concatCss = require('gulp-concat-css');
var minifyCss = require('gulp-minify-css');
var nodewindows = require('node-windows');
var deployCdn = require('gulp-deploy-azure-cdn');
var gutil = require('gulp-util');
var uploadAzure = require('gulp-upload-azure');
var gzip = require('gulp-gzip');
var sourcemaps = require('gulp-sourcemaps');
var static = require('node-static');
var manifest = require('gulp-manifest');
var exec = require('child_process').exec;

// List of platforms determined form pkd.dependencies. This way platform file
// downloading and version preferences are entirely handled by npm install.
var platforms = ['cordova-ios', 'cordova-android', 'cordova-browser']; // List like ['cordova-ios', 'cordova-android']
var platform_dirs = []; // List of subdirs with platform files under node_moduels
for (p in cordova_lib.cordova_platforms) {
    var pname = 'cordova-' + p;
    if (pkg.dependencies[pname]) {
        platforms.push(pname);
        platform_dirs.push(path.join(__dirname, 'node_modules', pname));
        // TODO: Check if those dirs exist and if not ask the user to run "npm install"
    }
}


//////////////////////// TASKS /////////////////////////////

// All cordova-lib calls (except "cordova create") must be done from within
// the cordova project dir because cordova-lib determines projectRoot from
// process.cwd() in cordova-lib/src/cordova/util.js:isCordova()

gulp.task('jshint', function() {
    process.chdir(buildDir + "/../");
    var opts = {
        '-W083': true
    };
    gulp.src('./src/www/components/**/*.js')
        .pipe(jshint(opts))
        .pipe(jshint.reporter('default'));
    gulp.src('./src/www/objects/**/*.js')
        .pipe(jshint(opts))
        .pipe(jshint.reporter('default'));
    gulp.src('./src/www/legacy-js/**/*.js')
        .pipe(jshint(opts))
        .pipe(jshint.reporter('default'));
    gulp.src('./src/www/models/**/*.js')
        .pipe(jshint(opts))
        .pipe(jshint.reporter('default'));
    gulp.src('./src/www/index.js')
        .pipe(jshint(opts))
        .pipe(jshint.reporter('default'));
});

gulp.task('sass', function() {
    process.chdir(buildDir + "/../");
    return gulp.src('src/www/**/*.scss')
        .pipe(sass())
        .pipe(concat('style.css'))
        .pipe(minifyCSS())
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest('./src/www/'));
});

gulp.task('css', function() {
    process.chdir(buildDir + "/../");
    return gulp.src('src/www/assets/css/**/*.css')
        .pipe(concatCss("bundle.min.css"))
        .pipe(minifyCss({
            processImport: false
        }))
        .pipe(gulp.dest('./src/www/'));
});

gulp.task('include', ['templates'], function() {
    process.chdir(buildDir + "/../");

    var target = gulp.src('./src/www/index.html');

    var base = gulp.src(['./src/www/*.js'], {
        read: false,
    });

    var js = gulp.src(['./src/www/assets/js/**/*.js'], {
        read: false,
    });

    var models = gulp.src(['./src/www/models/**/*.js'], {
        read: false,
    });

    var comp = gulp.src(['./src/www/components/**/*.js'], {
        read: false,
    });

    var obj = gulp.src(['./src/www/objects/**/*.js'], {
        read: false,
    });

    var leg = gulp.src(['./src/www/legacy-js/**/*.js'], {
        read: false,
    });

    return target.pipe(inject(series(js, obj, base, leg, models, comp), {
        addRootSlash: false,
        relative: true
    })).pipe(gulp.dest('./src/www'));

});

gulp.task('templates', function() {
    var YOUR_LOCALS = {};
    process.chdir(buildDir + "/../");
    return gulp.src('./src/www/**/*.jade')
        .pipe(jade({
            locals: YOUR_LOCALS
        }))
        .pipe(gulp.dest('./src/www'))
});

gulp.task('clean', function(cb) {
    // Alternative package for cleaning is gulp-rimraf
    return del(['build'], cb);
});

// Prepare is not really needed
gulp.task('prepare', function() {
    process.chdir(buildDir);
    return cdv.prepare();
});

gulp.task('compile', ['sass', 'css', 'jshint', 'include'], function() {

});

gulp.task('buildandroid', ['compile'], function() {
    process.chdir(buildDir);
    return cdv.build({
        platforms: ['android']
    });
});

gulp.task('runandroid', ['buildandroid'], function(cb) {
    process.chdir(buildDir);
    exec('adb -d install -r %UserProfile%/Documents/Fasterbids/FasterbidsPhonegap/build/platforms/android/build/outputs/apk/android-debug.apk', function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('buildweb', ['compile'], function() {
    process.chdir(buildDir);
    return cdv.build({
        platforms: ['browser']
    });
});

gulp.task('manifest', ['buildweb'], function() {
    process.chdir(buildDir);
    return gulp.src(['./platforms/browser/www/**/*'], { base: './platforms/browser/www/' })
        .pipe(manifest({
            hash: true,
            preferOnline: true,
            network: ['*'],
            filename: 'app.manifest',
            exclude: 'app.manifest'
        }))
        .pipe(gulp.dest('./platforms/browser/www/'));
});

gulp.task('run', ['buildweb'], function(cb) {
    process.chdir(buildDir);
    var file = new static.Server('./platforms/browser/www');
    gulp.watch(['../src/**/*.*', '!../src/**/*.html', '!../src/**/*.css'], ['buildweb']);
    return require('http').createServer(function(request, response) {
        console.log(request.url);
        request.addListener('end', function() {
            file.serve(request, response);
        }).resume();
    }).listen(8000);
});

gulp.task('emulate', function() {
    process.chdir(buildDir);
    return cdv.emulate({
        platforms: [testPlatform]
    });
});

gulp.task('release', function() {
    process.chdir(buildDir);
    return cdv.build({
        options: ['--release']
    });
});

gulp.task('cdvcreate', ['clean'], function() {


    var srcDir = path.join(__dirname, 'src');

    cfg = {
        lib: {
            www: {
                url: srcDir,
                link: true
            }
        }
    };

    var appId = 'com.fasterbids.app';

    return cdv.create(buildDir, appId, pkg.name, cfg)
        .then(function() {
            process.chdir(buildDir);
        })
        .then(function() {
            return cdv.platform('add', platform_dirs);
        })
        .then(function() {
            if (plugins.length > 0) {
                return cdv.plugins('add', plugins);
            }
            return;
        });
});

gulp.task('create', [], function() {

    var deferred = Q.defer();

    nodewindows.elevate('gulp cdvcreate', null, function() {
        deferred.resolve();
    });

    return deferred.promise;

});

gulp.task('azdeploy', ['manifest'], function() {

    return gulp.src('./platforms/browser/www/**/*').pipe(gzip({
        append: false,
        threshold: false,
        gzipOptions: {
            level: 9,
            memLevel: 9
        }
    })).pipe(uploadAzure({
        account: 'fbwebapp',
        key: 'PbVMG83ipCF+RhouymCaLUyCnrel1u+Ce94UX1pAYZZ3Xe7IOedC0OzXz2v2AkkMIE0YnV7SVyLiJHmq+K74/w==',
        host: 'https://fbwebapp.blob.core.windows.net',
        container: '$root',
        contentEncoding: 'gzip'
    })).pipe(gutil.noop());

});
