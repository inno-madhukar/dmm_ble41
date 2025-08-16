
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

struct Dmmble4Spec : winrt::Microsoft::ReactNative::TurboModuleSpec {
  static constexpr auto methods = std::tuple{
      Method<void(Promise<std::vector<std::vector<std::string>>>) noexcept>{0, L"readCsv"},
  };

  template <class TModule>
  static constexpr void ValidateModule() noexcept {
    constexpr auto methodCheckResults = CheckMethods<TModule, Dmmble4Spec>();

    REACT_SHOW_METHOD_SPEC_ERRORS(
          0,
          "readCsv",
          "    REACT_METHOD(readCsv) void readCsv(::React::ReactPromise<std::vector<std::vector<std::string>>> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(readCsv) static void readCsv(::React::ReactPromise<std::vector<std::vector<std::string>>> &&result) noexcept { /* implementation */ }\n");
  }
};

} // namespace dmm_ble4Codegen
