# @discordjs/node-pre-gyp ![Test](https://github.com/discordjs/node-pre-gyp/workflows/Test/badge.svg)

> node-pre-gyp makes it easy to publish and install Node.js C++ addons from binaries

`@discordjs/node-pre-gyp` stands between [npm](https://github.com/npm/npm) and [node-gyp](https://github.com/Tootallnate/node-gyp) and offers a cross-platform method of binary deployment.

# Features

- A command line tool called `node-pre-gyp` that can install your package's C++ module from a binary.
- A variety of developer targeted commands for packaging, testing, and publishing binaries.
- A JavaScript module that can dynamically require your installed binary: `require('@discordjs/node-pre-gyp').find`

For a hello world example of a module packaged with `node-pre-gyp` see <https://github.com/springmeyer/node-addon-example> and [the wiki ](https://github.com/mapbox/node-pre-gyp/wiki/Modules-using-node-pre-gyp) for real world examples.

# Credits

- The module is modeled after [node-gyp](https://github.com/Tootallnate/node-gyp) by [@Tootallnate](https://github.com/Tootallnate)
- Motivation for initial development came from [@ErisDS](https://github.com/ErisDS) and the [Ghost Project](https://github.com/TryGhost/Ghost).
- Development is sponsored by [Mapbox](https://www.mapbox.com/)

# FAQ

See the [Frequently Ask Questions](https://github.com/mapbox/node-pre-gyp/wiki/FAQ).

# Usage

## Commands

View all possible commands:

    node-pre-gyp --help

- clean - Remove the entire folder containing the compiled .node module
- install - Install pre-built binary for module
- reinstall - Run "clean" and "install" at once
- build - Compile the module by dispatching to node-gyp or nw-gyp
- rebuild - Run "clean" and "build" at once
- package - Pack binary into tarball
- testpackage - Test that the staged package is valid

You can also chain commands:

```bash
node-pre-gyp clean build package
```

## Options

Options include:

- `-C/--directory`: run the command in this directory
- `--build-from-source`: build from source instead of using pre-built binary
- `--update-binary`: reinstall by replacing previously installed local binary with remote binary
- `--runtime=electron`: customize the runtime: `node` and `electron` are the valid options
- `--fallback-to-build`: fallback to building from source if pre-built binary is not available
- `--target=0.4.0`: Pass the target node or node-webkit version to compile against
- `--target_arch=ia32`: Pass the target arch and override the host `arch`. Any value that is [supported by Node.js](https://nodejs.org/api/os.html#osarch) is valid.
- `--target_platform=win32`: Pass the target platform and override the host `platform`. Valid values are `linux`, `darwin`, `win32`, `sunos`, `freebsd`, `openbsd`, and `aix`.

Both `--build-from-source` and `--fallback-to-build` can be passed alone or they can provide values. You can pass `--fallback-to-build=false` to override the option as declared in package.json. In addition to being able to pass `--build-from-source` you can also pass `--build-from-source=myapp` where `myapp` is the name of your module.

For example: `npm install --build-from-source=myapp`. This is useful if:

- `myapp` is referenced in the package.json of a larger app and therefore `myapp` is being installed as a dependency with `npm install`.
- The larger app also depends on other modules installed with `node-pre-gyp`
- You only want to trigger a source compile for `myapp` and the other modules.

# Configuring

This is a guide to configuring your module to use node-pre-gyp.

## 1) Add new entries to your `package.json`

- Add `node-pre-gyp` to `dependencies`
- Add a custom `install` script
- Declare a `binary` object

This looks like:

```json
"dependencies"  : {
  "@discordjs/node-pre-gyp": "0.1.x"
},
"scripts": {
  "install": "node-pre-gyp install --fallback-to-build"
},
"binary": {
  "module_name": "your_module",
  "module_path": "./lib/binding/",
  "host": "https://your_module.s3-us-west-1.amazonaws.com"
}
```

For a full example see [node-addon-examples's package.json](https://github.com/springmeyer/node-addon-example/blob/master/package.json).

Let's break this down:

- Dependencies need to list `node-pre-gyp`
- Your `scripts` section should override the `install` target with `"install": "node-pre-gyp install --fallback-to-build"`. This allows node-pre-gyp to be used instead of the default npm behavior of always source compiling with `node-gyp` directly.
- Your package.json should contain a `binary` section describing key properties you provide to allow node-pre-gyp to package optimally. They are detailed below.

### The `binary` object has three required properties

### module_name

The name of your native node module. This value must:

- Match the name passed to [the NODE_MODULE macro](http://nodejs.org/api/addons.html#addons_hello_world)
- Must be a valid C variable name (e.g. it cannot contain `-`)
- Should not include the `.node` extension.

### module_path

The location your native module is placed after a build. This should be an empty directory without other Javascript files. This entire directory will be packaged in the binary tarball. When installing from a remote package this directory will be overwritten with the contents of the tarball.

Note: This property supports variables based on [Versioning](#versioning).

### host

A url to the remote location where you've published tarball binaries (must be `https` not `http`).

### remote_path

It **is recommended** that you customize this property. This is an extra path to use for publishing and finding remote tarballs. The default value for `remote_path` is `""` meaning that if you do not provide it then all packages will be published at the base of the `host`. It is recommended to provide a value like `./{name}/v{version}` to help organize remote packages in the case that you choose to publish multiple node addons to the same `host`.

Note: This property supports variables based on [Versioning](#versioning).

### package_name

It is **not recommended** to override this property unless you are also overriding the `remote_path`. This is the versioned name of the remote tarball containing the binary `.node` module and any supporting files you've placed inside the `module_path` directory. Unless you specify `package_name` in your `package.json` then it defaults to `{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz` which allows your binary to work across node versions, platforms, and architectures. If you are using `remote_path` that is also versioned by `./{module_name}/v{version}` then you could remove these variables from the `package_name` and just use: `{node_abi}-{platform}-{arch}.tar.gz`. Then your remote tarball will be looked up at, for example, `https://example.com/your-module/v0.1.0/node-v11-linux-x64.tar.gz`.

Avoiding the version of your module in the `package_name` and instead only embedding in a directory name can be useful when you want to make a quick tag of your module that does not change any C++ code.

Note: This property supports variables based on [Versioning](#versioning).

## 2) Add a new target to binding.gyp

`node-pre-gyp` calls out to `node-gyp` to compile the module and passes variables along like [module_name](#module_name) and [module_path](#module_path).

A new target must be added to `binding.gyp` that moves the compiled `.node` module from `./build/Release/module_name.node` into the directory specified by `module_path`.

Add a target like this at the end of your `targets` list:

```json
{
	"target_name": "action_after_build",
	"type": "none",
	"dependencies": ["<(module_name)"],
	"copies": [
		{
			"files": ["<(PRODUCT_DIR)/<(module_name).node"],
			"destination": "<(module_path)"
		}
	]
}
```

For a full example see [node-addon-example's binding.gyp](https://github.com/springmeyer/node-addon-example/blob/2ff60a8ded7f042864ad21db00c3a5a06cf47075/binding.gyp).

## 3) Dynamically require your `.node`

Inside the main js file that requires your addon module you are likely currently doing:

```js
const binding = require('../build/Release/binding.node');
```

or:

```js
const bindings = require('./bindings');
```

Change those lines to:

```js
const binary = require('@discordjs/node-pre-gyp');
const path = require('path');
const binding_path = binary.find(path.resolve(path.join(__dirname, './package.json')));
const binding = require(binding_path);
```

For a full example see [node-addon-example's index.js](https://github.com/springmeyer/node-addon-example/blob/2ff60a8ded7f042864ad21db00c3a5a06cf47075/index.js#L1-L4)

## 4) Build and package your app

Now build your module from source:

```bash
npm install --build-from-source
```

The `--build-from-source` tells `node-pre-gyp` to not look for a remote package and instead dispatch to node-gyp to build.

Now `node-pre-gyp` should now also be installed as a local dependency so the command line tool it offers can be found at `./node_modules/.bin/node-pre-gyp`.

## 5) Test

Now `npm test` should work just as it did before.

## 6) Publish the tarball

Then package your app:

    ./node_modules/.bin/node-pre-gyp package

Once packaged you can also host your binaries. To do this requires:

- You manually publish the binary created by the `package` command to an `https` endpoint
- Ensure that the `host` value points to your custom `https` endpoint.

## 7) You're done!

Now publish your module to the npm registry. Users will now be able to install your module from a binary.

What will happen is this:

1. `npm install <your package>` will pull from the npm registry
2. npm will run the `install` script which will call out to `node-pre-gyp`
3. `node-pre-gyp` will fetch the binary `.node` module and unpack in the right place
4. Assuming that all worked, you are done

If a a binary was not available for a given platform and `--fallback-to-build` was used then `node-gyp rebuild` will be called to try to source compile the module.

## N-API Considerations

[Node-API](https://nodejs.org/api/n-api.html#n_api_node_api), which was previously known as N-API, is an ABI-stable alternative to previous technologies such as [nan](https://github.com/nodejs/nan) which are tied to a specific Node runtime engine. Node-API is Node runtime engine agnostic and guarantees modules created today will continue to run, without changes, into the future.

Using `node-pre-gyp` with Node-API projects requires a handful of additional configuration values and imposes some additional requirements.

The most significant difference is that an Node-API module can be coded to target multiple Node-API versions. Therefore, an Node-API module must declare in its `package.json` file which Node-API versions the module is designed to run against. In addition, since multiple builds may be required for a single module, path and file names must be specified in way that avoids naming conflicts.

## The `napi_versions` array property

A Node-API module must declare in its `package.json` file, the Node-API versions the module is intended to support. This is accomplished by including an `napi-versions` array property in the `binary` object. For example:

```json
"binary": {
  "module_name": "your_module",
  "module_path": "your_module_path",
  "host": "https://your_bucket.s3-us-west-1.amazonaws.com",
  "napi_versions": [1,3]
}
```

If the `napi_versions` array property is _not_ present, `node-pre-gyp` operates as it always has. Including the `napi_versions` array property instructs `node-pre-gyp` that this is a Node-API module build.

When the `napi_versions` array property is present, `node-pre-gyp` fires off multiple operations, one for each of the Node-API versions in the array. In the example above, two operations are initiated, one for Node-API version 1 and second for Node-API version 3. How this version number is communicated is described next.

## The `napi_build_version` value

For each of the Node-API module operations `node-pre-gyp` initiates, it ensures that the `napi_build_version` is set appropriately.

This value is of importance in two areas:

1. The C/C++ code which needs to know against which Node-API version it should compile.
2. `node-pre-gyp` itself which must assign appropriate path and file names to avoid collisions.

## Defining `NAPI_VERSION` for the C/C++ code

The `napi_build_version` value is communicated to the C/C++ code by adding this code to the `binding.gyp` file:

```json
"defines": [
    "NAPI_VERSION=<(napi_build_version)",
]
```

This ensures that `NAPI_VERSION`, an integer value, is declared appropriately to the C/C++ code for each build.

> Note that earlier versions of this document recommended defining the symbol `NAPI_BUILD_VERSION`. `NAPI_VERSION` is preferred because it used by the Node-API C/C++ headers to configure the specific Node-API versions being requested.

## Path and file naming requirements in `package.json`

Since `node-pre-gyp` fires off multiple operations for each request, it is essential that path and file names be created in such a way as to avoid collisions. This is accomplished by imposing additional path and file naming requirements.

Specifically, when performing Node-API builds, the `{napi_build_version}` text configuration value _must_ be present in the `module_path` property. In addition, the `{napi_build_version}` text configuration value _must_ be present in either the `remote_path` or `package_name` property. (No problem if it's in both.)

Here's an example:

```json
"binary": {
  "module_name": "your_module",
  "module_path": "./lib/binding/napi-v{napi_build_version}",
  "remote_path": "./{module_name}/v{version}/{configuration}/",
  "package_name": "{platform}-{arch}-napi-v{napi_build_version}.tar.gz",
  "host": "https://your_bucket.s3-us-west-1.amazonaws.com",
  "napi_versions": [1,3]
}
```

## Supporting both N-API and NAN builds

You may have a legacy native add-on that you wish to continue supporting for those versions of Node that do not support Node-API, as you add Node-API support for later Node versions. This can be accomplished by specifying the `node_napi_label` configuration value in the package.json `binary.package_name` property.

Placing the configuration value `node_napi_label` in the package.json `binary.package_name` property instructs `node-pre-gyp` to build all viable Node-API binaries supported by the current Node instance. If the current Node instance does not support Node-API, `node-pre-gyp` will request a traditional, non-Node-API build.

The configuration value `node_napi_label` is set by `node-pre-gyp` to the type of build created, `napi` or `node`, and the version number. For Node-API builds, the string contains the Node-API version nad has values like `napi-v3`. For traditional, non-Node-API builds, the string contains the ABI version with values like `node-v46`.

Here's how the `binary` configuration above might be changed to support both Node-API and NAN builds:

```json
"binary": {
  "module_name": "your_module",
  "module_path": "./lib/binding/{node_napi_label}",
  "remote_path": "./{module_name}/v{version}/{configuration}/",
  "package_name": "{platform}-{arch}-{node_napi_label}.tar.gz",
  "host": "https://your_bucket.s3-us-west-1.amazonaws.com",
  "napi_versions": [1,3]
}
```

The C/C++ symbol `NAPI_VERSION` can be used to distinguish Node-API and non-Node-API builds. The value of `NAPI_VERSION` is set to the integer Node-API version for Node-API builds and is set to `0` for non-Node-API builds.

For example:

```C
#if NAPI_VERSION
// Node-API code goes here
#else
// NAN code goes here
#endif
```

## Two additional configuration values

The following two configuration values, which were implemented in previous versions of `node-pre-gyp`, continue to exist, but have been replaced by the `node_napi_label` configuration value described above.

1. `napi_version` If Node-API is supported by the currently executing Node instance, this value is the Node-API version number supported by Node. If Node-API is not supported, this value is an empty string.

2. `node_abi_napi` If the value returned for `napi_version` is non empty, this value is `'napi'`. If the value returned for `napi_version` is empty, this value is the value returned for `node_abi`.

These values are present for use in the `binding.gyp` file and may be used as `{napi_version}` and `{node_abi_napi}` for text substituion in the `binary` properties of the `package.json` file.

# Versioning

The `binary` properties of `module_path`, `remote_path`, and `package_name` support variable substitution. The strings are evaluated by `node-pre-gyp` depending on your system and any custom build flags you passed.

- `node_abi`: The node C++ `ABI` number. This value is available in Javascript as `process.versions.modules` as of [`>= v0.10.4 >= v0.11.7`](https://github.com/joyent/node/commit/ccabd4a6fa8a6eb79d29bc3bbe9fe2b6531c2d8e) and in C++ as the `NODE_MODULE_VERSION` define much earlier. For versions of Node before this was available we fallback to the V8 major and minor version.
- `platform` matches node's `process.platform` like `linux`, `darwin`, and `win32` unless the user passed the `--target_platform` option to override.
- `arch` matches node's `process.arch` like `x64` or `ia32` unless the user passes the `--target_arch` option to override.
- `libc` matches `require('detect-libc').family` like `glibc` or `musl` unless the user passes the `--target_libc` option to override.
- `libc_version` matches `require('detect-libc').version`
- `configuration` - Either 'Release' or 'Debug' depending on if `--debug` is passed during the build.
- `module_name` - the `binary.module_name` attribute from `package.json`.
- `version` - the semver `version` value for your module from `package.json` (NOTE: ignores the `semver.build` property).
- `major`, `minor`, `patch`, and `prelease` match the individual semver values for your module's `version`
- `build` - the sevmer `build` value. For example it would be `this.that` if your package.json `version` was `v1.0.0+this.that`
- `prerelease` - the semver `prerelease` value. For example it would be `alpha.beta` if your package.json `version` was `v1.0.0-alpha.beta`

The options are visible in the code at <https://github.com/mapbox/node-pre-gyp/blob/612b7bca2604508d881e1187614870ba19a7f0c5/lib/util/versioning.js#L114-L127>

# Download binary files from a mirror

S3 is broken in China for the well known reason.

Using the `npm` config argument: `--{module_name}_binary_host_mirror` can download binary files through a mirror, `-` in `module_name` will be replaced with `_`.

e.g.: Install [v8-profiler](https://www.npmjs.com/package/v8-profiler) from `npm`.

```bash
$ npm install v8-profiler --profiler_binary_host_mirror=https://npm.taobao.org/mirrors/node-inspector/
```

e.g.: Install [canvas-prebuilt](https://www.npmjs.com/package/canvas-prebuilt) from `npm`.

```bash
$ npm install canvas-prebuilt --canvas_prebuilt_binary_host_mirror=https://npm.taobao.org/mirrors/canvas-prebuilt/
```
