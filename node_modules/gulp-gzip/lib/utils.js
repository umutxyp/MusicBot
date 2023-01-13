var bytes = require('bytes');
var through2 = require('through2');

// Merge source object with target object while handling threshold option
// Used to merge user defined plugin options with default options
function merge(target, source) {
	if (typeof source === 'undefined') source = {};

	Object.keys(source).forEach(function(key) {
		if (key === 'threshold') {
			target[key] = threshold(source[key]);
		} else {
			target[key] = source[key];
		}
	});

	return target;
}

// Parse the threshold plugin option
// Specifies the minimum file size that will be compressed
// Can be a string, number, or boolean
function threshold(obj) {
	var ret;

	switch (typeof obj) {
		case 'string':
			ret = bytes(obj) < 150 ? 150 : bytes(obj);
			break;
		case 'number':
			ret = obj < 150 ? 150 : obj;
			break;
		case 'boolean':
			ret = obj === false ? false : 150;
			break;
		default:
			throw new Error('threshold must be String|Number|Boolean');
	}

	return ret;
}


function streamThreshold(inStream, threshold, fileTooSmall, fileLargeEnough) {

	var chunks = [];

	inStream.pipe(
		through2(
			function(chunk, enc, next) {
				// Received a chunk
				// Add the current chunk to the array
				chunks.push(chunk);
				next();
			},
			function() {
				// Received all chunks

				// Join buffer chunks into a single buffer
				var buffer = Buffer.concat(chunks);

				// Create a stream to return to the callback and write the file contents to it
				// Need a new stream to return since we already consumed the contents of inStream
				var outStream = through2();
				outStream.end(buffer);

				// Check if the stream content length is less than the threshold
				if (buffer.length < threshold) {
					// File does not meet the minimum size requirement for compression
					fileTooSmall(outStream);
				} else {
					// File meets the minimum size requirement for compression
					fileLargeEnough(outStream);
				}
			}));
}


exports.merge           = merge;
exports.threshold       = threshold;
exports.streamThreshold = streamThreshold;
