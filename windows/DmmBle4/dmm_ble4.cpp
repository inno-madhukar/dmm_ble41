#include "pch.h"
#include "dmm_ble4.h"
#include <winrt/Windows.Storage.h>
#include <winrt/Windows.Storage.Streams.h>
#include <iostream>
#include <filesystem>
#include <string>
#include <winrt/Microsoft.ReactNative.h>

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
 void Dmm_ble4::createFolder(std::string const& path, ReactPromise<std::string>&& result) noexcept
    {
        try {
            std::filesystem::path folderPath(path);
            if (std::filesystem::create_directory(folderPath)) {
                result.Resolve("Folder created successfully");
            } else {
                result.Resolve("Folder already exists or could not be created");
            }
        } catch (const std::exception& ex) {
            result.Reject(ex.what());
        }
    }


} // namespace winrt::dmm_ble4
