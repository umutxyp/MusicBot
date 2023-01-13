const https = require('https');
const fs = require('fs');
const semver = require('semver');

/*

usage:

node scripts/abi_crosswalk.js

*/

const cross = {};

// IO.js
// thanks to rvagg, this is so simple
// https://github.com/iojs/build/issues/94
https.get('https://iojs.org/download/release/index.json', (res) => {
	if (res.statusCode !== 200) {
		throw new Error(`server returned ${res.statusCode} for iojs.org`);
	}
	res.setEncoding('utf8');
	let body = '';
	res.on('data', (chunk) => {
		body += chunk;
	});
	res.on('end', (err) => {
		if (err) throw err;
		const releases = JSON.parse(body);
		releases.forEach((release) => {
			cross[release.version.replace('v', '')] = {
				node_abi: Number(release.modules),
				v8: release.v8.split('.').slice(0, 2).join('.'),
			};
		});
	});
});

https.get('https://nodejs.org/download/release/index.json', (res) => {
	if (res.statusCode !== 200) {
		throw new Error(`server returned ${res.statusCode} for nodejs.org`);
	}
	res.setEncoding('utf8');
	let body = '';
	res.on('data', (chunk) => {
		body += chunk;
	});
	res.on('end', (err) => {
		if (err) throw err;
		const releases = JSON.parse(body);
		releases.forEach((release) => {
			cross[release.version.replace('v', '')] = {
				node_abi: Number(release.modules),
				v8: release.v8.split('.').slice(0, 2).join('.'),
			};
		});
	});
});

const sortObjectByKey = function (obj) {
	const keys = [];
	const sorted_obj = {};
	for (const key in obj) {
		if (Object.hasOwnProperty.call(obj, key)) {
			keys.push(key);
		}
	}
	// sort keys
	keys.sort((a, b) => {
		if (semver.gt(a, b)) {
			return 1;
		}
		return -1;
	});
	const len = keys.length;

	for (let i = 0; i < len; i++) {
		const key = keys[i];
		sorted_obj[key] = obj[key];
	}
	return sorted_obj;
};

process.on('exit', (err) => {
	if (err) throw err;
	fs.writeFileSync('./lib/util/abi_crosswalk.json', JSON.stringify(sortObjectByKey(cross), null, 2));
});
