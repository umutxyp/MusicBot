{
    "targets": [
        {
            "target_name": "<(module_name)",
            "product_dir": "<(module_path)",
            "dependencies": ["deps/binding.gyp:libopus"],
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"],
            "cflags": [
                "-pthread",
                "-fno-strict-aliasing",
                "-Wall",
                "-Wno-unused-parameter",
                "-Wno-missing-field-initializers",
                "-Wextra",
                "-pipe",
                "-fno-ident",
                "-fdata-sections",
                "-ffunction-sections",
                "-fPIC",
            ],
            "defines": [
                "LARGEFILE_SOURCE",
                "_FILE_OFFSET_BITS=64",
                "WEBRTC_TARGET_PC",
                "WEBRTC_LINUX",
                "WEBRTC_THREAD_RR",
                "EXPAT_RELATIVE_PATH",
                "GTEST_RELATIVE_PATH",
                "JSONCPP_RELATIVE_PATH",
                "WEBRTC_RELATIVE_PATH",
                "POSIX," "__STDC_FORMAT_MACROS",
                "DYNAMIC_ANNOTATIONS_ENABLED=0",
                "NAPI_DISABLE_CPP_EXCEPTIONS",
                "NAPI_VERSION=<(napi_build_version)",
            ],
            "include_dirs": ["<!@(node -p \"require('node-addon-api').include\")"],
            "sources": ["src/node-opus.cc"],
            # gyp inside node v16 uses -rpath=$ORIGIN/ instead of -rpath=$ORIGIN/lib.target/
            # which fixes a longstanding descreptancy between platforms as documented at https://github.com/nodejs/node-gyp/issues/2233
            # This allows tests to pass for older, still buggy and inconsistent versions of node-gyp (and will be duplicative for npm >= 7 which bundles node-gyp >= v0.6.0)
            'ldflags': [
                "-Wl,-rpath=\$$ORIGIN/"
            ],
        },
    ],
}
