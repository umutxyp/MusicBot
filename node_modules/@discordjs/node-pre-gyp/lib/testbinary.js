module.exports = exports = testbinary;

exports.usage = 'Tests that the binary.node can be required';

const log = require('npmlog');
const cp = require('child_process');
const versioning = require('./util/versioning.js');
const napi = require('./util/napi.js');

function testbinary(gyp, argv, callback) {
	const args = [];
	const options = {};
	const shell_cmd = process.execPath;
	const { package_json } = gyp;
	const napi_build_version = napi.get_napi_build_version_from_command_args(argv);
	const opts = versioning.evaluate(package_json, gyp.opts, napi_build_version);
	// skip validation for runtimes we don't explicitly support (like electron)
	if (opts.runtime && opts.runtime !== 'node-webkit' && opts.runtime !== 'node') {
		return callback();
	}
	// ensure on windows that / are used for require path
	const binary_module = opts.module.replace(/\\/g, '/');
	if (process.arch !== opts.target_arch || process.platform !== opts.target_platform) {
		let msg = 'skipping validation since host platform/arch (';
		msg += `${process.platform}/${process.arch})`;
		msg += ' does not match target (';
		msg += `${opts.target_platform}/${opts.target_arch})`;
		log.info('validate', msg);
		return callback();
	}
	args.push('--eval');
	args.push(`require('${binary_module.replace(/'/g, "'")}')`);
	log.info('validate', `Running test command: '${shell_cmd} ${args.join(' ')}'`);
	cp.execFile(shell_cmd, args, options, (err, stdout, stderr) => {
		if (err) {
			return callback(err, { stdout, stderr });
		}
		return callback();
	});
}
