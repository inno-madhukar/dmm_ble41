#pragma once

#include "pch.h"
// #include "resource.h"

#if __has_include("codegen/NativeDmm_ble4DataTypes.g.h")
  #include "codegen/NativeDmm_ble4DataTypes.g.h"
#endif
#include "codegen/NativeDmm_ble4Spec.g.h"

#include "NativeModules.h"

namespace winrt::dmm_ble4
{

REACT_MODULE(Dmm_ble4)
struct Dmm_ble4
{
  using ModuleSpec = dmm_ble4Codegen::Dmm_ble4Spec;

  REACT_SYNC_METHOD(multiply1) 
  double multiply1(double a, double b) noexcept;

 REACT_METHOD(getcsvdata)
winrt::fire_and_forget getcsvdata(
    winrt::hstring a,
    React::ReactPromise<winrt::hstring> const &promise) noexcept;


private:
  React::ReactContext m_context;
};

} // namespace winrt::testlib