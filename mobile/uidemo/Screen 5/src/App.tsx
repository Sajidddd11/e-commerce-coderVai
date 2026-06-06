import { useEffect } from "react";
import { ChevronDown, ChevronLeft, CreditCard } from "lucide-react";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative bg-white flex flex-col w-100.5 h-218.5 overflow-hidden">
          <div className="border-[oklch(0.92_0.004_286.32)] bg-white border-black/1 border-t-0 border-r-0 border-b-1 border-l-0 border-solid flex px-4 pt-12 pb-3 justify-between items-center">
            <div className="flex justify-center items-center w-8 h-8">
              <ChevronLeft className="size-5 text-[oklch(0.141_0.005_285.823)]" />
            </div>
            <span
              className="text-[oklch(0.141_0.005_285.823)] font-semibold text-lg tracking-tight"
              style={{}}
            >
              Checkout
            </span>
            <div className="w-8 h-8" />
          </div>
          <div className="bg-white flex p-4 justify-center items-center gap-0">
            <div className="flex items-center gap-0">
              <div className="flex flex-col items-center gap-1">
                <div className="rounded-full bg-[#56AEBF] flex justify-center items-center w-7 h-7">
                  <span className="font-semibold text-white text-[11px]">
                    1
                  </span>
                </div>
                <span className="font-semibold text-[#56AEBF] text-[11px] mt-0.5">
                  Details
                </span>
              </div>
              <div className="bg-[oklch(0.92_0.004_286.32)] mx-1 mb-4 w-12 h-0.5" />
              <div className="flex flex-col items-center gap-1">
                <div className="border-[oklch(0.92_0.004_286.32)] rounded-full bg-white border-black/1 border-2 border-solid flex justify-center items-center w-7 h-7">
                  <span className="text-[oklch(0.552_0.016_285.938)] font-medium text-[11px]">
                    2
                  </span>
                </div>
                <span className="text-[oklch(0.552_0.016_285.938)] font-medium text-[11px] mt-0.5">
                  Review
                </span>
              </div>
              <div className="bg-[oklch(0.92_0.004_286.32)] mx-1 mb-4 w-12 h-0.5" />
              <div className="flex flex-col items-center gap-1">
                <div className="border-[oklch(0.92_0.004_286.32)] rounded-full bg-white border-black/1 border-2 border-solid flex justify-center items-center w-7 h-7">
                  <span className="text-[oklch(0.552_0.016_285.938)] font-medium text-[11px]">
                    3
                  </span>
                </div>
                <span className="text-[oklch(0.552_0.016_285.938)] font-medium text-[11px] mt-0.5">
                  Confirm
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-y-auto px-4 pb-28 flex-1" style={{}}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-[oklch(0.141_0.005_285.823)] font-semibold text-base tracking-tight">
                  Contact
                </span>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-gray-900 text-sm">
                    Email address
                  </label>
                  <div className="border-[oklch(0.92_0.004_286.32)] rounded-lg bg-white border-black/1 border-2 border-solid flex px-3 items-center h-12">
                    <input
                      className="text-[oklch(0.141_0.005_285.823)] bg-transparent outline-none text-sm flex-1"
                      placeholder="your@email.com"
                      type="email"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[oklch(0.141_0.005_285.823)] font-semibold text-base tracking-tight">
                  Shipping Address
                </span>
                <div className="flex flex-row gap-2">
                  <div className="flex flex-col flex-1 gap-1">
                    <label className="font-medium text-gray-900 text-[13px]">
                      First Name
                    </label>
                    <div className="border-[oklch(0.92_0.004_286.32)] rounded-lg bg-white border-black/1 border-2 border-solid flex px-3 items-center h-12">
                      <input
                        className="text-[oklch(0.141_0.005_285.823)] bg-transparent outline-none text-sm w-full"
                        placeholder="First name"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 gap-1">
                    <label className="font-medium text-gray-900 text-[13px]">
                      Last Name
                    </label>
                    <div className="border-[oklch(0.92_0.004_286.32)] rounded-lg bg-white border-black/1 border-2 border-solid flex px-3 items-center h-12">
                      <input
                        className="text-[oklch(0.141_0.005_285.823)] bg-transparent outline-none text-sm w-full"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-gray-900 text-[13px]">
                    Address Line
                  </label>
                  <div className="border-[oklch(0.92_0.004_286.32)] rounded-lg bg-white border-black/1 border-2 border-solid flex px-3 items-center h-12">
                    <input
                      className="text-[oklch(0.141_0.005_285.823)] bg-transparent outline-none text-sm w-full"
                      placeholder="House, road, area"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-gray-900 text-[13px]">
                    District
                  </label>
                  <div className="border-[oklch(0.92_0.004_286.32)] cursor-pointer rounded-lg bg-white border-black/1 border-2 border-solid flex px-3 justify-between items-center h-12">
                    <span className="text-[oklch(0.552_0.016_285.938)] text-sm">
                      Select district
                    </span>
                    <ChevronDown className="size-4 text-[oklch(0.552_0.016_285.938)]" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-gray-900 text-[13px]">
                    Phone Number
                  </label>
                  <div className="border-[oklch(0.92_0.004_286.32)] rounded-lg bg-white border-black/1 border-2 border-solid flex items-center h-12 overflow-hidden">
                    <div className="bg-[oklch(0.967_0.001_286.375)] border-[oklch(0.92_0.004_286.32)] border-black/1 border-t-0 border-r-1 border-b-0 border-l-0 border-solid flex px-3 items-center h-full">
                      <span className="text-[oklch(0.141_0.005_285.823)] font-semibold text-[13px]">
                        +880
                      </span>
                    </div>
                    <input
                      className="text-[oklch(0.141_0.005_285.823)] bg-transparent outline-none text-sm px-3 flex-1"
                      placeholder="01XXXXXXXXX"
                      type="tel"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[oklch(0.141_0.005_285.823)] font-semibold text-base tracking-tight">
                  Delivery Type
                </span>
                <div className="flex flex-row gap-2">
                  <div className="cursor-pointer rounded-lg bg-slate-900 flex justify-center items-center flex-1 h-11">
                    <span className="font-semibold text-white text-[13px]">
                      Inside Dhaka ৳60
                    </span>
                  </div>
                  <div className="border-[oklch(0.92_0.004_286.32)] cursor-pointer rounded-lg bg-white border-black/1 border-2 border-solid flex justify-center items-center flex-1 h-11">
                    <span className="text-[oklch(0.141_0.005_285.823)] font-medium text-[13px]">
                      Outside Dhaka ৳120
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[oklch(0.141_0.005_285.823)] font-semibold text-base tracking-tight">
                  Payment Method
                </span>
                <div className="flex flex-col gap-2">
                  <div className="border-l-[#56AEBF] border-[oklch(0.92_0.004_286.32)] rounded-lg bg-[#56aebf]/8 border-black/1 border-1 border-solid flex p-4 flex-row items-start gap-3">
                    <div className="flex-shrink-0 rounded-full border-[#56AEBF] border-2 border-solid flex mt-0.5 justify-center items-center w-5 h-5">
                      <div className="rounded-full bg-[#56AEBF] w-2.5 h-2.5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[oklch(0.141_0.005_285.823)] font-semibold text-sm">
                        Cash on Delivery
                      </span>
                      <span className="text-[oklch(0.552_0.016_285.938)] text-xs">
                        Pay when you receive
                      </span>
                    </div>
                  </div>
                  <div className="border-[oklch(0.92_0.004_286.32)] rounded-lg bg-white border-black/1 border-1 border-solid flex p-4 flex-row items-start gap-3">
                    <div className="border-[oklch(0.92_0.004_286.32)] flex-shrink-0 rounded-full border-black/1 border-2 border-solid flex mt-0.5 justify-center items-center w-5 h-5" />
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[oklch(0.141_0.005_285.823)] font-semibold text-sm">
                          Online Payment
                        </span>
                        <span className="text-[oklch(0.552_0.016_285.938)] text-xs">
                          bKash · Nagad · Card
                        </span>
                      </div>
                      <div className="flex flex-row flex-wrap gap-1.5">
                        <div className="bg-[oklch(0.967_0.001_286.375)] border-[oklch(0.92_0.004_286.32)] rounded-sm border-black/1 border-1 border-solid px-2 py-0.5">
                          <span className="font-semibold text-[#E2136E] text-[11px]">
                            bKash
                          </span>
                        </div>
                        <div className="bg-[oklch(0.967_0.001_286.375)] border-[oklch(0.92_0.004_286.32)] rounded-sm border-black/1 border-1 border-solid px-2 py-0.5">
                          <span className="font-semibold text-[#F26522] text-[11px]">
                            Nagad
                          </span>
                        </div>
                        <div className="bg-[oklch(0.967_0.001_286.375)] border-[oklch(0.92_0.004_286.32)] rounded-sm border-black/1 border-1 border-solid flex px-2 py-0.5 items-center gap-1">
                          <CreditCard className="size-3 text-[oklch(0.552_0.016_285.938)]" />
                          <span className="text-[oklch(0.552_0.016_285.938)] font-medium text-[11px]">
                            Card
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-[oklch(0.92_0.004_286.32)] bg-white border-black/1 border-t-1 border-r-0 border-b-0 border-l-0 border-solid absolute inset-x-0 bottom-0 p-4">
            <button className="rounded-lg bg-slate-900 flex justify-center items-center gap-2 w-full h-14">
              <span className="font-semibold text-white text-sm">
                Review Order →
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
