#!/bin/bash

./gradlew ${1:-installDevMinSdkDevKernelDebug} --stacktrace && adb shell am start -n com.startach.yedidim.volunteers/host.exp.exponent.MainActivity
