import { useEffect } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  MapPin,
  Phone,
  RefreshCw,
  User,
} from "lucide-react";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="bg-white flex flex-col w-full">
          <div className="bg-white border-zinc-200 border-t-0 border-r-0 border-b-1 border-l-0 border-solid flex px-4 pt-12 pb-3 justify-between items-center">
            <button className="rounded-full flex justify-center items-center w-10 h-10">
              <ChevronLeft className="size-5 text-zinc-950" />
            </button>
            <span className="left-1/2 -translate-x-1/2 font-semibold text-zinc-950 text-lg leading-7 tracking-tight absolute">
              Order Details
            </span>
            <div className="w-10" />
          </div>
          <div className="flex px-4 pt-4 pb-8 flex-col gap-4">
            <div className="shadow-sm rounded-xl bg-white border-zinc-200 border-1 border-solid overflow-hidden">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  alt="Floral Wrap Midi Dress"
                  className="object-cover w-full h-full"
                  data-authorname="Cut Collective"
                  data-authorurl="https://unsplash.com/@cutcollective"
                  data-blurhash="LKIOO0~XnOi@RN9GE4ozwfWFkXo#"
                  data-photoid="OvH00op91wc"
                  src="https://images.unsplash.com/photo-1599947985103-e7ef968f976a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmbG9yYWwlMjB3cmFwJTIwbWlkaSUyMGRyZXNzJTIwYmx1ZSUyMGZhc2hpb258ZW58MXwwfHx8MTc4MDczNDk4MHww&ixlib=rb-4.1.0&q=80&w=400"
                />
              </div>
              <div className="flex p-4 justify-between items-start gap-3">
                <div className="min-w-0 flex flex-col flex-1 gap-1">
                  <span className="leading-tight truncate font-semibold text-zinc-950 text-base leading-6">
                    Floral Wrap Midi Dress
                  </span>
                  <span className="font-normal text-[#71717b] text-[11px]">
                    Size: M · Colour: Blue
                  </span>
                </div>
                <span className="flex-shrink-0 font-semibold text-zinc-950 text-sm leading-5">
                  ৳1,850
                </span>
              </div>
            </div>
            <div className="shadow-sm rounded-xl bg-white border-zinc-200 border-1 border-solid overflow-hidden">
              <div className="px-4 pt-4 pb-1">
                <span className="font-semibold uppercase text-[#71717b] text-xs leading-4 tracking-wider">
                  Order Info
                </span>
              </div>
              <div className="divide-y divide-border flex flex-col">
                <div className="flex px-4 py-3 justify-between items-center">
                  <span className="text-[#71717b] text-sm leading-5">
                    Order Number
                  </span>
                  <span className="font-semibold text-zinc-950 text-sm leading-5">
                    #ZHN-20481
                  </span>
                </div>
                <div className="flex px-4 py-3 justify-between items-center">
                  <span className="text-[#71717b] text-sm leading-5">
                    Order Date
                  </span>
                  <span className="font-medium text-zinc-950 text-sm leading-5">
                    12 Jun 2025
                  </span>
                </div>
                <div className="flex px-4 py-3 justify-between items-center">
                  <span className="text-[#71717b] text-sm leading-5">
                    Payment Method
                  </span>
                  <span className="font-medium text-zinc-950 text-sm leading-5">
                    Cash on Delivery
                  </span>
                </div>
                <div className="flex px-4 py-3 justify-between items-center">
                  <span className="text-[#71717b] text-sm leading-5">
                    Status
                  </span>
                  <span className="bg-[oklch(0.6_0.118_184.704/0.12)] text-[oklch(0.398_0.07_227.392)] font-semibold rounded-full text-xs leading-4 flex px-3 py-1 items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    Delivered
                  </span>
                </div>
              </div>
            </div>
            <div className="shadow-sm rounded-xl bg-white border-zinc-200 border-1 border-solid overflow-hidden">
              <div className="px-4 pt-4 pb-1">
                <span className="font-semibold uppercase text-[#71717b] text-xs leading-4 tracking-wider">
                  Delivery Address
                </span>
              </div>
              <div className="flex px-4 pt-3 pb-4 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-[oklch(0.623_0.214_259.815)] flex-shrink-0" />
                  <span className="font-semibold text-zinc-950 text-sm leading-5">
                    Fatema Begum
                  </span>
                </div>
                <div className="flex mt-1 items-start gap-2">
                  <MapPin className="size-4 text-[oklch(0.623_0.214_259.815)] flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-zinc-950 text-sm leading-5">
                      House 12, Road 5, Block C
                    </span>
                    <span className="text-zinc-950 text-sm leading-5">
                      Bashundhara R/A, Dhaka 1229
                    </span>
                    <span className="text-[#71717b] text-sm leading-5">
                      Dhaka District
                    </span>
                  </div>
                </div>
                <div className="flex mt-1 items-center gap-2">
                  <Phone className="size-4 text-[oklch(0.623_0.214_259.815)] flex-shrink-0" />
                  <span className="text-zinc-950 text-sm leading-5">
                    +880 1712-345678
                  </span>
                </div>
              </div>
            </div>
            <div className="shadow-sm rounded-xl bg-white border-zinc-200 border-1 border-solid overflow-hidden">
              <div className="px-4 pt-4 pb-1">
                <span className="font-semibold uppercase text-[#71717b] text-xs leading-4 tracking-wider">
                  Price Breakdown
                </span>
              </div>
              <div className="divide-y divide-border flex flex-col">
                <div className="flex px-4 py-3 justify-between items-center">
                  <span className="text-[#71717b] text-sm leading-5">
                    Subtotal
                  </span>
                  <span className="font-medium text-zinc-950 text-sm leading-5">
                    ৳1,850
                  </span>
                </div>
                <div className="flex px-4 py-3 justify-between items-center">
                  <span className="text-[#71717b] text-sm leading-5">
                    Shipping
                  </span>
                  <span className="font-medium text-zinc-950 text-sm leading-5">
                    ৳60
                  </span>
                </div>
                <div className="flex px-4 py-3 justify-between items-center">
                  <span className="text-[#71717b] text-sm leading-5">
                    Discount
                  </span>
                  <span className="text-[oklch(0.577_0.245_27.325)] font-medium text-sm leading-5">
                    −৳110
                  </span>
                </div>
                <div className="flex px-4 py-3 justify-between items-center">
                  <span className="font-semibold text-zinc-950 text-sm leading-5">
                    Total
                  </span>
                  <span className="font-bold text-zinc-950 text-base leading-6">
                    ৳1,800
                  </span>
                </div>
              </div>
            </div>
            <button className="border-[oklch(0.623_0.214_259.815)] text-[oklch(0.623_0.214_259.815)] font-semibold rounded-lg bg-white text-sm leading-5 border-black/1 border-2 border-solid flex justify-center items-center gap-2 w-full h-12">
              <RefreshCw className="size-4" />
              Buy Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
