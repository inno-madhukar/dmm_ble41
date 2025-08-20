#include "pch.h"
#include "dmm_ble4.h"

#include <fstream>   // FIX: needed for ifstream
#include <sstream>   // FIX: needed for stringstream
#include <string>
#include <winrt/Windows.Storage.Pickers.h>
using namespace winrt::Windows::Storage::Pickers;

#include <winrt/Windows.Storage.h>
#include <winrt/Windows.Storage.Streams.h>

using namespace winrt::Windows::Storage;
using namespace winrt::Windows::Storage::Streams;
using namespace winrt;
using namespace Microsoft::ReactNative;
namespace winrt::dmm_ble4 {

// Called once when the module is created
void Dmmble4::Initialize(React::ReactContext const &reactContext) noexcept {
  m_context = reactContext;
  OutputDebugString(L"[Dmmble4] Initialized successfully.\n");
}

// Promise<string[][]>
void Dmmble4::readCsv(React::ReactPromise<std::vector<std::vector<std::string>>> &&result) noexcept {
  try {
    FileOpenPicker picker;
    picker.SuggestedStartLocation(PickerLocationId::DocumentsLibrary);
    picker.FileTypeFilter().Append(L".csv");

    auto file = picker.PickSingleFileAsync().get();
    if (!file) {
      result.Reject("No file selected");
      return;
    }

    auto text = Windows::Storage::FileIO::ReadTextAsync(file).get();
    // … then parse like before
  } catch (winrt::hresult_error const &ex) {
    std::wstring wmsg = ex.message().c_str();
    std::string msg(wmsg.begin(), wmsg.end());
    result.Reject(("WinRT error: " + msg).c_str());
  } catch (...) {
    result.Reject("Unknown error (FilePicker)");
  }
}
} // namespace winrt::dmm_ble4
  