var clean  = require('gulp-clean');
var fs     = require('fs');
var gulp   = require('gulp');
var log    = require('gulp-util').log;
var gzip   = require('../');
var nid    = require('nid');
var rename = require('gulp-rename');
var should = require('should');
var Stream = require('stream');
var tap    = require('gulp-tap');
var zlib   = require('zlib');

// monkeys are fixing cwd for gulp-mocha
// node lives in one process/scope/directory
process.chdir('./test');

describe('gulp-gzip', function() {

	describe('plugin level', function() {

		describe('config', function() {

			it('should have default config', function(done) {
				var instance = gzip();
				instance.config.should.eql({ append: true, threshold:  false });
				done();
			});

			it('should merge options with defaults', function(done) {
				var instance = gzip({ append: false });
				instance.config.should.eql({ append: false, threshold: false });
				done();
			});

			it('should set threshold to false while receiving false', function(done) {
				var instance = gzip({ threshold: false });
				instance.config.threshold.should.be.false;
				done();
			});

			it('should set threshold to 150 while receiving true', function(done) {
				var instance = gzip({ threshold: true });
				instance.config.threshold.should.eql(150);
				done();
			});

			it('should set threshold to Number while receiving Number', function(done) {
				var instance = gzip({ threshold: 1024 });
				instance.config.should.have.property('threshold', 1024);
				done();
			});

			it('should set threshold to 150 while receiving Number < 150', function(done) {
				var instance = gzip({ threshold: 100 });
				instance.config.should.have.property('threshold', 150);
				done();
			});

			it('should set threshold to Number while receiving String (bytes result)', function(done) {
				var instance = gzip({ threshold: '1kb' });
				instance.config.should.have.property('threshold', 1024);
				done();
			});

			it('should set threshold to 150 while receiving String (bytes result < 150)', function(done) {
				var instance = gzip({ threshold: '1kb' });
				instance.config.should.have.property('threshold', 1024);
				done();
			});
		});
	});

	describe('handler level', function() {

		describe('file extension', function() {

			it('should append .gz to the file extension, by default', function(done) {
				gulp.src('files/small.txt')
					.pipe(gzip())
					.pipe(tap(function(file) {
						file.path.should.endWith('.gz');
						done();
					}));
			});

			it('should not append .gz to the file extension receiving { append: false }', function(done) {
				gulp.src('files/small.txt')
					.pipe(gzip({ append: false }))
					.pipe(tap(function(file) {
						file.path.should.not.endWith('.gz');
						done();
					}));
			});
		});

		describe('buffer mode', function() {

			it('should create file with .gz extension, by default', function(done) {
				var id = nid();
				var out = gulp.dest('tmp');

				out.on('close', function() {
					fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
						should.not.exist(err);
						should.exist(file);
						file.should.not.be.empty;
						done()
					});
				});

				gulp.src('files/small.txt')
					.pipe(rename({ basename: id }))
					.pipe(gzip())
					.pipe(out);
			});

			it('should create file without .gz extension when { append: false }', function(done) {
				var id = nid();
				var out = gulp.dest('tmp');

				out.on('close', function() {
					fs.readFile('./tmp/' + id + '.txt', function(err, file) {
						should.not.exist(err);
						should.exist(file);
						file.should.not.be.empty;
						done()
					});
				});

				gulp.src('files/small.txt')
					.pipe(rename({ basename: id }))
					.pipe(gzip({ append: false }))
					.pipe(out);
			});

			it('should return file contents as a Buffer', function(done) {
				gulp.src('files/small.txt')
					.pipe(gzip())
					.pipe(tap(function(file) {
						file.contents.should.be.instanceof(Buffer);
						done();
					}));
			});

			it('should return file contents as a Buffer while handling threshold', function(done) {
				gulp.src('files/big.txt')
					.pipe(gzip({ threshold: '1kb' }))
					.pipe(tap(function(file) {
						file.contents.should.be.instanceof(Buffer);
						done();
					}));
			});

			it('should match original when result being uncompressed', function(done) {
				var id = nid();
				var out = gulp.dest('tmp');

				out.on('close', function() {
					fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
						zlib.unzip(file, function(err, buffer) {
							file = buffer.toString('utf-8', 0, buffer.length);

							fs.readFile('./files/small.txt', { encoding: 'utf-8' }, function(err, original) {
								file.should.equal(original);
								done();
							});
						});
					});
				});

				gulp.src('files/small.txt')
					.pipe(rename({ basename: id }))
					.pipe(gzip())
					.pipe(out);
			});

			it('should handle threshold of 1kb by passing through small.txt (<1kb)', function(done) {
				var id = nid();
				var out = gulp.dest('tmp');

				out.on('close', function() {
					fs.readFile('./tmp/' + id + '.txt', { encoding: 'utf-8' }, function(err, file) {
						fs.readFile('./files/small.txt', { encoding: 'utf-8' }, function(err, original) {
							file.should.equal(original);
							done();
						});
					});
				});

				gulp.src('files/small.txt')
					.pipe(rename({ basename: id }))
					.pipe(gzip({ threshold: '1kb' }))
					.pipe(out);
			});

			it('should handle threshold of 1kb by compressing big.txt (>1kb)', function(done) {
				var id = nid();
				var out = gulp.dest('tmp');

				out.on('close', function() {
					fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
						zlib.unzip(file, function(err, buffer) {
							file = buffer.toString('utf-8');

							fs.readFile('./files/big.txt', { encoding: 'utf-8' }, function(err, original) {
								file.should.equal(original);
								done();
							});
						});
					});
				});

				gulp.src('files/big.txt')
					.pipe(rename({ basename: id }))
					.pipe(gzip({ threshold: '1kb' }))
					.pipe(out);
			});
		});

		describe('stream mode', function() {

			it('should create file with .gz extension, by default', function(done) {
				var id = nid();
				var out = gulp.dest('tmp');

				out.on('close', function() {
					fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
						should.not.exist(err);
						should.exist(file);
						file.should.not.be.empty;
						done()
					});
				});

				gulp.src('files/small.txt', { buffer: false })
					.pipe(rename({ basename: id }))
					.pipe(gzip())
					.pipe(out);
			});

			it('should create file without .gz extension when { append: false }', function(done) {
				var id = nid();
				var out = gulp.dest('tmp');

				out.on('close', function() {
					fs.readFile('./tmp/' + id + '.txt', function(err, file) {
						should.not.exist(err);
						should.exist(file);
						file.should.not.be.empty;
						done()
					});
				});

				gulp.src('files/small.txt', { buffer: false })
					.pipe(rename({ basename: id }))
					.pipe(gzip({ append: false }))
					.pipe(out);
			});

			it('should return file contents as a Stream', function(done) {
				gulp.src('files/small.txt', { buffer: false })
					.pipe(gzip())
					.pipe(tap(function(file) {
						file.contents.should.be.instanceof(Stream);
						done();
					}));
			});

			it('should return file contents as a Stream while handling threshold', function(done) {
				gulp.src('files/small.txt', { buffer: false })
					.pipe(gzip({ threshold: '1kb' }))
					.pipe(tap(function(file) {
						file.contents.should.be.instanceof(Stream);
						done();
					}));
			});

			it('should match original when result being uncompressed', function(done) {
				var id = nid();
				var out = gulp.dest('tmp');

				out.on('close', function() {
					fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
						zlib.unzip(file, function(err, buffer) {
							file = buffer.toString('utf-8', 0, buffer.length);

							fs.readFile('./files/small.txt', { encoding: 'utf-8' }, function(err, original) {
								file.should.equal(original);
								done();
							});
						});
					});
				});

				gulp.src('files/small.txt', { buffer: false })
					.pipe(rename({ basename: id }))
					.pipe(gzip())
					.pipe(out);
			});

			it('should handle threshold of 1kb by passing through small.txt (<1kb)', function(done) {
				var id = nid();
				var out = gulp.dest('tmp');

				out.on('close', function() {
					fs.readFile('./tmp/' + id + '.txt', { encoding: 'utf-8' }, function(err, file) {
						fs.readFile('./files/small.txt', { encoding: 'utf-8' }, function(err, original) {
							file.should.equal(original);
							done();
						});
					});
				});

				gulp.src('files/small.txt', { buffer: false })
					.pipe(rename({ basename: id }))
					.pipe(gzip({ threshold: '1kb' }))
					.pipe(out);
			});

			it('should handle threshold of 1kb by compressing big.txt (>1kb)', function(done) {
				var id = nid();
				var out = gulp.dest('tmp');

				out.on('close', function() {
					fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
						zlib.unzip(file, function(err, buffer) {
							file = buffer.toString('utf-8');

							fs.readFile('./files/big.txt', { encoding: 'utf-8' }, function(err, original) {
								file.should.equal(original);
								done();
							});
						});
					});
				});

				gulp.src('files/big.txt', { buffer: false })
					.pipe(rename({ basename: id }))
					.pipe(gzip({ threshold: '1kb' }))
					.pipe(out);
			});
		});
	});
});
