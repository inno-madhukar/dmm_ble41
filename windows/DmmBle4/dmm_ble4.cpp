#include "pch.h"
#include "dmm_ble4.h"
#include <winrt/Windows.Storage.h>
#include <winrt/Windows.Storage.Streams.h>
#include <iostream>

using namespace winrt;
using namespace Windows::Storage;
using namespace Windows::Storage::Streams;
using namespace Windows::Foundation;
using namespace Microsoft::ReactNative;

namespace winrt::dmm_ble4 {

// Synchronous multiply1 method
double Dmm_ble4::multiply1(double a, double b) noexcept {
  try {
    return a * b;
  } catch (...) {
    // Optionally log the error
    return 0.0;
  }
}

// Asynchronous createFolder method
void Dmm_ble4::createFolder(ReactPromise<void> result) noexcept {
  try {
    StorageFolder localFolder = ApplicationData::Current().LocalFolder();
    auto operation = localFolder.CreateFolderAsync(L"MyNewFolder", CreationCollisionOption::OpenIfExists);

    operation.Completed([result](IAsyncOperation<StorageFolder> const& asyncInfo, AsyncStatus const status) {
      try {
        if (status == AsyncStatus::Completed) {
          result.Resolve();
        } else {
          result.Reject("k");
        }
      } catch (const std::exception& e) {
        result.Reject("no");
      } catch (...) {
        result.Reject("no1");
      }
    });
  } catch (const std::exception& e) {
    result.Reject("cc");
  } catch (...) {
    result.Reject("cccc");
  }
}


} // namespace winrt::dmm_ble4
