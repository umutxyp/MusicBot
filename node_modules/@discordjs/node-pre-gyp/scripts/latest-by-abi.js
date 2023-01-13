'use strict';

const semver = require('semver');
const data = require('../lib/util/abi_crosswalk.json');

const targets = {};
Object.keys(data).forEach((v) => {
	const o = data[v];
	let abi;
	if (o.node_abi === 1) {
		abi = `v8-${o.v8}`;
	} else {
		abi = `node-v${o.node_abi}`;
	}
	if (targets[abi] === undefined) {
		targets[abi] = v;
	} else {
		const cur = targets[abi];
		if (semver.gt(v, cur)) {
			targets[abi] = v;
		}
	}
});

Object.keys(targets).forEach((k) => {
	const version = targets[k];
	console.log(version, data[version]);
});
