import { useEffect } from "react";
import {
  Home,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  User,
  X,
} from "lucide-react";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative bg-white flex flex-col w-100.5 h-218.5 overflow-hidden">
          <div className="flex-shrink-0 border-[oklch(0.92_0.004_286.32)] border-black/1 border-t-0 border-r-0 border-b-1 border-l-0 border-solid px-4 pt-12 pb-3">
            <h1 className="font-['Montserrat'] font-semibold text-gray-900 text-2xl leading-8 tracking-tight">
              Shopping Cart
            </h1>
          </div>
          <div className="flex-shrink-0 bg-[#56aebf]/10 flex px-4 py-3 items-center gap-3">
            <ShoppingBag className="size-5 flex-shrink-0 text-[#56AEBF]" />
            <span className="font-['Inter'] font-normal text-[#56AEBF] text-sm leading-5">
              Add ৳300 more for free shipping!
            </span>
          </div>
          <div className="overflow-y-auto flex-1">
            <div className="flex px-4 pt-4 flex-col gap-2">
              <div className="border-[oklch(0.92_0.004_286.32)] border-black/1 border-t-0 border-r-0 border-b-1 border-l-0 border-solid flex pb-4 gap-3">
                <div className="flex-shrink-0 rounded-lg bg-gray-100 w-20 h-20 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1589810635657-232948472d98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGRyZXNzJTIwZmFzaGlvbiUyMGFwcGFyZWx8ZW58MXwyfHx8MTc4MDczMjQ1M3ww&ixlib=rb-4.1.0&q=80&w=400"
                    alt="Blue women shirt"
                    className="object-cover w-full h-full"
                    data-photoid="xbFtknoQG_Y"
                    data-authorname="engin akyurt"
                    data-authorurl="https://unsplash.com/@enginakyurt"
                    data-blurhash="L8M*23Io:hksTLo$wtv|:zRiNy$%"
                  />
                </div>
                <div className="relative flex flex-col flex-1 gap-1">
                  <p className="font-['Inter'] leading-snug line-clamp-2 font-semibold text-gray-900 text-sm leading-5">
                    Linen Blend Relaxed Shirt
                  </p>
                  <p className="font-['Inter'] font-normal text-gray-500 text-xs leading-4">
                    Size: M · Color: Teal
                  </p>
                  <div className="flex mt-1 items-center gap-2">
                    <button className="rounded-full border-[#56AEBF] border-2 border-solid flex justify-center items-center w-8 h-8">
                      <Minus className="size-3 text-[#56AEBF]" />
                    </button>
                    <span className="font-['Inter'] font-semibold text-center text-gray-900 text-sm leading-5 w-5">
                      2
                    </span>
                    <button className="rounded-full border-[#56AEBF] border-2 border-solid flex justify-center items-center w-8 h-8">
                      <Plus className="size-3 text-[#56AEBF]" />
                    </button>
                  </div>
                  <div className="flex mt-1 justify-between items-center">
                    <span className="font-['Inter'] font-semibold text-gray-900 text-sm leading-5">
                      ৳1,400
                    </span>
                    <button className="absolute right-0 bottom-0">
                      <Trash2 className="size-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex pb-4 gap-3">
                <div className="flex-shrink-0 rounded-lg bg-gray-100 w-20 h-20 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1617178388553-a9d022974a5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHx0ZWFsJTIwZmFzaGlvbiUyMGNsb3RoaW5nJTIwcHJvZHVjdHxlbnwxfDJ8fHwxNzgwNzMyNDUzfDA&ixlib=rb-4.1.0&q=80&w=400"
                    alt="Teal fashion clothing"
                    className="object-cover w-full h-full"
                    data-photoid="5Epqk4N0AAs"
                    data-authorname="Hayley Maxwell"
                    data-authorurl="https://unsplash.com/@hayleymaxwell"
                    data-blurhash="LfODqUS5-:%2M|Rkayay~ps-M|M{"
                  />
                </div>
                <div className="relative flex flex-col flex-1 gap-1">
                  <p className="font-['Inter'] leading-snug line-clamp-2 font-semibold text-gray-900 text-sm leading-5">
                    Floral Wrap Midi Dress
                  </p>
                  <p className="font-['Inter'] font-normal text-gray-500 text-xs leading-4">
                    Size: M · Color: Teal
                  </p>
                  <div className="flex mt-1 items-center gap-2">
                    <button className="rounded-full border-[#56AEBF] border-2 border-solid flex justify-center items-center w-8 h-8">
                      <Minus className="size-3 text-[#56AEBF]" />
                    </button>
                    <span className="font-['Inter'] font-semibold text-center text-gray-900 text-sm leading-5 w-5">
                      1
                    </span>
                    <button className="rounded-full border-[#56AEBF] border-2 border-solid flex justify-center items-center w-8 h-8">
                      <Plus className="size-3 text-[#56AEBF]" />
                    </button>
                  </div>
                  <div className="flex mt-1 justify-between items-center">
                    <span className="font-['Inter'] font-semibold text-gray-900 text-sm leading-5">
                      ৳1,000
                    </span>
                    <button className="absolute right-0 bottom-0">
                      <Trash2 className="size-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex px-4 pt-2 pb-4 flex-col gap-3">
              <p className="font-['Inter'] font-semibold text-gray-900 text-sm leading-5">
                Promo Code
              </p>
              <div className="flex gap-2">
                <input
                  className="border-[oklch(0.92_0.004_286.32)] font-['Inter'] outline-none rounded-lg text-gray-900 text-sm leading-5 border-black/1 border-1 border-solid px-3 py-2 flex-1"
                  placeholder="Enter code"
                />
                <button className="font-['Inter'] font-semibold rounded-full bg-[#56AEBF] text-white text-sm leading-5 px-4 py-2">
                  Apply
                </button>
              </div>
              <div className="flex items-center gap-1">
                <div className="rounded-full bg-[#56aebf]/10 flex px-3 py-1 items-center gap-1">
                  <span className="font-['Inter'] font-normal text-[#56AEBF] text-xs leading-4">
                    WELCOME20
                  </span>
                  <button>
                    <X className="size-3 text-[#56AEBF]" />
                  </button>
                </div>
              </div>
            </div>
            <div className="border-[oklch(0.92_0.004_286.32)] rounded-lg bg-white border-black/1 border-1 border-solid flex mx-4 mb-4 p-4 flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-['Inter'] font-normal text-gray-500 text-sm leading-5">
                  Subtotal
                </span>
                <span className="font-['Inter'] font-semibold text-gray-900 text-sm leading-5">
                  ৳2,400
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-['Inter'] font-normal text-gray-500 text-sm leading-5">
                  Shipping
                </span>
                <span className="font-['Inter'] font-semibold text-gray-900 text-sm leading-5">
                  ৳60
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-['Inter'] font-normal text-gray-500 text-sm leading-5">
                  Discount
                </span>
                <span className="font-['Inter'] font-semibold text-red-500 text-sm leading-5">
                  −৳480
                </span>
              </div>
              <div className="border-[oklch(0.92_0.004_286.32)] border-black/1 border-t-1 border-r-0 border-b-0 border-l-0 border-solid my-1" />
              <div className="flex justify-between items-center">
                <span className="font-['Montserrat'] font-semibold text-gray-900 text-base leading-6">
                  Total
                </span>
                <span className="font-['Montserrat'] font-semibold text-gray-900 text-lg leading-7">
                  ৳1,980
                </span>
              </div>
            </div>
            <div className="h-4" />
          </div>
          <div className="flex-shrink-0 bg-white border-gray-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid px-4 py-3">
            <button className="font-['Inter'] font-semibold rounded-lg bg-slate-900 text-white text-sm leading-5 py-4 w-full">
              Proceed to Checkout
            </button>
          </div>
          <div className="flex-shrink-0 bg-white border-gray-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid flex px-2 pt-2 pb-6 flex-row justify-around items-center">
            <button className="flex px-3 flex-col items-center gap-1">
              <Home className="size-5 text-gray-500" />
              <span className="font-['Inter'] text-gray-500 text-[10px]">
                Home
              </span>
            </button>
            <button className="flex px-3 flex-col items-center gap-1">
              <ShoppingBag className="size-5 text-gray-500" />
              <span className="font-['Inter'] text-gray-500 text-[10px]">
                Shop
              </span>
            </button>
            <button className="relative flex px-3 flex-col items-center gap-1">
              <div className="relative">
                <ShoppingCart className="size-5 text-[#56AEBF]" />
                <span className="leading-none font-bold rounded-full bg-red-500 text-white text-[9px] flex absolute -right-2 -top-1.5 justify-center items-center w-4 h-4">
                  2
                </span>
              </div>
              <span className="font-['Inter'] font-semibold text-[#56AEBF] text-[10px]">
                Cart
              </span>
            </button>
            <button className="flex px-3 flex-col items-center gap-1">
              <User className="size-5 text-gray-500" />
              <span className="font-['Inter'] text-gray-500 text-[10px]">
                Account
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
