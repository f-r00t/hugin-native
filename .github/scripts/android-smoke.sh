#!/usr/bin/env bash
#
# Android emulator smoke test for Hugin.
#
# Installs the release APK on a running emulator, launches the app and verifies
# it does not crash on startup. Run from the emulator step of the
# "Android smoke test" workflow as a single bash process so that shell state
# (variables, `set -e`) is preserved across the whole script.
set -euo pipefail

APK=android/app/build/outputs/apk/release/app-release.apk
PKG=com.hugin

echo "Installing $APK"
adb install -r "$APK"

adb logcat -c

echo "Launching $PKG"
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1

sleep 25

echo "---- recent logcat ----"
adb logcat -d | grep -iE "hugin|AndroidRuntime|FATAL" | tail -60 || true

if adb logcat -d | grep -qE "FATAL EXCEPTION"; then
  echo "::error::App crashed on launch (FATAL EXCEPTION found in logcat)"
  exit 1
fi

PID="$(adb shell pidof "$PKG" | tr -d '\r')"
if [ -z "$PID" ]; then
  echo "::error::App process $PKG is not running after launch"
  exit 1
fi

echo "✅ Hugin launched and is still running (pid $PID)"
