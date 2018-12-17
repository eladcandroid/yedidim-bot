#!/bin/bash

./gradlew ${1:-installDevMinSdkDevKernelDebug} --stacktrace && adb shell am start -n com.startach.yedidim.dispatchers.detached/host.exp.exponent.MainActivity
