#include "pch.h"

#include "dmm_ble4.h"
#include <winrt/Windows.Storage.h>
#include <winrt/Windows.Storage.Streams.h>

using namespace winrt;
using namespace Windows::Storage;
using namespace Windows::Storage::Streams;

namespace winrt::dmm_ble4
{

// See https://mi
double Dmm_ble4::multiply1(double a, double b) noexcept {
  return a * b;
}
// std::string Dmm_ble4::getcsvdata(std::string a) noexcept {
//     try {
//         std::ifstream file(a);
//         if (!file.is_open()) {
//             return "no"; // or you can throw an exception if not noexcept
//         }

//         std::ostringstream contents;
//         contents << file.rdbuf();  // Read entire file into stream

//         return contents.str();    // Return as string
//     } catch (...) {
//         // Handle unexpected errors safely, return empty string
//         return "no";
//     }
// }

} // namespace winrt::testlib