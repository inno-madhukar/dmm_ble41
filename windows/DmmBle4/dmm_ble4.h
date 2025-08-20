#pragma once

#include "pch.h"

// Keep a single include of the codegen header
#include "codegen/NativeDmmble4Spec.g.h"

#include "NativeModules.h"

namespace winrt::dmm_ble4 {

REACT_MODULE(Dmmble4)
struct Dmmble4 {
  using ModuleSpec = dmm_ble4Codegen::Dmmble4Spec;

  REACT_INIT(Initialize)
  void Initialize(React::ReactContext const &reactContext) noexcept;

  // Promise<string[][]>
  REACT_METHOD(readCsv)
  void readCsv(::React::ReactPromise<std::vector<std::vector<std::string>>> &&result) noexcept;

private:
  React::ReactContext m_context;
};

} // namespace winrt::dmm_ble4
