
/*
 * This file is auto-generated from a NativeModule spec file in js.
 *
 * This is a C++ Spec class that should be used with MakeTurboModuleProvider to register native modules
 * in a way that also verifies at compile time that the native module matches the interface required
 * by the TurboModule JS spec.
 */
#pragma once
// clang-format off


#include <NativeModules.h>
#include <tuple>

namespace dmm_ble4Codegen {

struct Dmm_ble4Spec : winrt::Microsoft::ReactNative::TurboModuleSpec {
  static constexpr auto methods = std::tuple{
      SyncMethod<double(double, double) noexcept>{0, L"multiply1"},
      Method<void(std::string, Promise<std::string>) noexcept>{1, L"getcsvdata1"},
  };

  template <class TModule>
  static constexpr void ValidateModule() noexcept {
    constexpr auto methodCheckResults = CheckMethods<TModule, Dmm_ble4Spec>();

    REACT_SHOW_METHOD_SPEC_ERRORS(
          0,
          "multiply1",
          "    REACT_SYNC_METHOD(multiply1) double multiply1(double a, double b) noexcept { /* implementation */ }\n"
          "    REACT_SYNC_METHOD(multiply1) static double multiply1(double a, double b) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          1,
          "getcsvdata1",
          "    REACT_METHOD(getcsvdata1) void getcsvdata1(std::string a, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(getcsvdata1) static void getcsvdata1(std::string a, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n");
  }
};

} // namespace dmm_ble4Codegen
