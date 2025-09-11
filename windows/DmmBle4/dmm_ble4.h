#pragma once

#include "pch.h"
// #include "resource.h"

#if __has_include("codegen/NativeDmm_ble4DataTypes.g.h")
#include "codegen/NativeDmm_ble4DataTypes.g.h"
#endif
#include "codegen/NativeDmm_ble4Spec.g.h"
#include "NativeModules.h"

namespace winrt::dmm_ble4 {

  REACT_MODULE(Dmm_ble4)
  struct Dmm_ble4 : dmm_ble4Codegen::Dmm_ble4Spec {
    // Specify that this struct implements the ModuleSpec
    using ModuleSpec = dmm_ble4Codegen::Dmm_ble4Spec;

    // Synchronous multiply1 method
    REACT_SYNC_METHOD(multiply1)
    double multiply1(double a, double b) noexcept ;

    // Asynchronous createFolder method
    REACT_METHOD(createFolder)
    void createFolder(winrt::Microsoft::ReactNative::ReactPromise<void> result) noexcept ;

  private:
    React::ReactContext m_context;
  };

} // namespace winrt::dmm_ble4
