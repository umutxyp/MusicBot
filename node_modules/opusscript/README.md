# OpusScript

JS bindings for libopus 1.3.1, ported with Emscripten.

----

## Usage

```js
var OpusScript = require("opusscript");

// 48kHz sampling rate, 20ms frame duration, stereo audio (2 channels)
var samplingRate = 48000;
var frameDuration = 20;
var channels = 2;

// Optimize encoding for audio. Available applications are VOIP, AUDIO, and RESTRICTED_LOWDELAY
var encoder = new OpusScript(samplingRate, channels, OpusScript.Application.AUDIO);

var frameSize = samplingRate * frameDuration / 1000;

// Get PCM data from somewhere and encode it into opus
var pcmData = new Buffer(pcmSource);
var encodedPacket = encoder.encode(pcmData, frameSize);

// Decode the opus packet back into PCM
var decodedPacket = encoder.decode(encodedPacket);

// Delete the encoder when finished with it (Emscripten does not automatically call C++ object destructors)
encoder.delete();
```

## Note: WASM

If your environment doesn't support WASM, you can try the JS-only module. Do note that the JS-only version barely has optimizations due to compiler/toolchain limitations, and should only be used as a last resort.

```js
var encoder = new OpusScript(samplingRate, channels, OpusScript.Application.AUDIO, {
  wasm: false
});
```

## Note: TypeScript

Since this module wasn't written for TypeScript, you need to use `import = require` syntax.

```ts
// Import using:
import OpusScript = require("opusscript");

// and NOT:
import OpusScript from "opusscript";
```
