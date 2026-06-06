import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative bg-white flex flex-col w-full overflow-hidden">
          <div className="bg-white border-zinc-200 border-t-0 border-r-0 border-b-1 border-l-0 border-solid flex px-4 pt-12 pb-3 justify-between items-center">
            <button className="rounded-full flex justify-center items-center w-10 h-10">
              <ChevronLeft className="size-5 text-zinc-950" />
            </button>
            <span className="left-1/2 -translate-x-1/2 font-semibold text-zinc-950 text-lg leading-7 tracking-tight absolute">
              My Orders
            </span>
            <div className="w-10" />
          </div>
          <div className="overflow-y-auto flex px-4 pt-4 pb-8 flex-col flex-1 gap-4">
            <div className="shadow-sm rounded-xl bg-white border-zinc-200 border-1 border-solid overflow-hidden">
              <div className="flex p-4 gap-3">
                <div className="flex-shrink-0 rounded-lg bg-zinc-100 w-16 h-16 overflow-hidden">
                  <img
                    alt="Blue Women Shirt"
                    className="object-cover w-full h-full"
                    data-authorname="engin akyurt"
                    data-authorurl="https://unsplash.com/@enginakyurt"
                    data-blurhash="L8M*23Io:hksTLo$wtv|:zRiNy$%"
                    data-photoid="xbFtknoQG_Y"
                    src="https://images.unsplash.com/photo-1589810635657-232948472d98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGRyZXNzJTIwZmFzaGlvbiUyMGFwcGFyZWx8ZW58MXwyfHx8MTc4MDczMjQ1M3ww&ixlib=rb-4.1.0&q=80&w=400"
                  />
                </div>
                <div className="min-w-0 flex flex-col flex-1 gap-1">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <span className="font-normal text-[#71717b] text-[11px]">
                        #ZHN-20481
                      </span>
                      <span className="leading-tight truncate font-semibold text-zinc-950 text-sm leading-5">
                        Floral Wrap Midi Dress
                      </span>
                      <span className="font-normal text-[#71717b] text-[11px]">
                        Size: M · Colour: Blue
                      </span>
                      <span className="font-normal text-[#71717b] text-[11px]">
                        12 Jun 2025
                      </span>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                      <span className="bg-[oklch(0.6_0.118_184.704/0.12)] text-[oklch(0.398_0.07_227.392)] font-medium rounded-full text-[11px] px-2 py-0.5">
                        Delivered
                      </span>
                      <span className="font-semibold text-zinc-950 text-sm leading-5">
                        ৳1,850
                      </span>
                    </div>
                  </div>
                  <div className="flex mt-1 justify-end">
                    <button className="text-[oklch(0.623_0.214_259.815)] font-semibold text-xs leading-4">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="shadow-sm rounded-xl bg-white border-zinc-200 border-1 border-solid overflow-hidden">
              <div className="flex p-4 gap-3">
                <div className="flex-shrink-0 rounded-lg bg-zinc-100 w-16 h-16 overflow-hidden">
                  <img
                    alt="Fashion Clothing Flat Lay"
                    className="object-cover w-full h-full"
                    data-authorname="Benjamin R."
                    data-authorurl="https://unsplash.com/@dapperprofessional"
                    data-blurhash="LID]SR0gR4%0?HNHMxaeT1%0NGR*"
                    data-photoid="ItqFmSxKnIg"
                    src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY2xvdGhpbmclMjBwcm9kdWN0JTIwZmxhdCUyMGxheXxlbnwxfDJ8fHwxNzgwNzM0ODY1fDA&ixlib=rb-4.1.0&q=80&w=400"
                  />
                </div>
                <div className="min-w-0 flex flex-col flex-1 gap-1">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <span className="font-normal text-[#71717b] text-[11px]">
                        #ZHN-20375
                      </span>
                      <span className="leading-tight truncate font-semibold text-zinc-950 text-sm leading-5">
                        Linen Blazer Set
                      </span>
                      <span className="font-normal text-[#71717b] text-[11px]">
                        Size: L · Colour: Khaki
                      </span>
                      <span className="font-normal text-[#71717b] text-[11px]">
                        28 May 2025
                      </span>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                      <span className="bg-[oklch(0.623_0.214_259.815/0.1)] text-[oklch(0.623_0.214_259.815)] font-medium rounded-full text-[11px] px-2 py-0.5">
                        Processing
                      </span>
                      <span className="font-semibold text-zinc-950 text-sm leading-5">
                        ৳3,200
                      </span>
                    </div>
                  </div>
                  <div className="flex mt-1 justify-end">
                    <button className="text-[oklch(0.623_0.214_259.815)] font-semibold text-xs leading-4">
                      Track Order →
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="shadow-sm rounded-xl bg-white border-zinc-200 border-1 border-solid overflow-hidden">
              <div className="flex p-4 gap-3">
                <div className="flex-shrink-0 rounded-lg bg-zinc-100 w-16 h-16 overflow-hidden">
                  <img
                    alt="Sneakers"
                    className="object-cover w-full h-full"
                    data-authorname="Josh Marshall"
                    data-authorurl="https://unsplash.com/@cy_entertainment"
                    data-blurhash="L98XC3-;004n?bWBE1oLD%IUxu-;"
                    data-photoid="PcI3V1VbbrU"
                    src="https://images.unsplash.com/photo-1559050993-d4e4fbf11769?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxzbmVha2VycyUyMHNob2VzJTIwZmFzaGlvbnxlbnwxfDJ8fHwxNzgwNjc3NDE5fDA&ixlib=rb-4.1.0&q=80&w=400"
                  />
                </div>
                <div className="min-w-0 flex flex-col flex-1 gap-1">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <span className="font-normal text-[#71717b] text-[11px]">
                        #ZHN-20214
                      </span>
                      <span className="leading-tight truncate font-semibold text-zinc-950 text-sm leading-5">
                        Classic White Sneakers
                      </span>
                      <span className="font-normal text-[#71717b] text-[11px]">
                        Size: 40 · Colour: White
                      </span>
                      <span className="font-normal text-[#71717b] text-[11px]">
                        10 May 2025
                      </span>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                      <span className="bg-[oklch(0.577_0.245_27.325/0.1)] text-[oklch(0.577_0.245_27.325)] font-medium rounded-full text-[11px] px-2 py-0.5">
                        Cancelled
                      </span>
                      <span className="font-semibold text-zinc-950 text-sm leading-5">
                        ৳2,450
                      </span>
                    </div>
                  </div>
                  <div className="flex mt-1 justify-end">
                    <button className="text-[oklch(0.623_0.214_259.815)] font-semibold text-xs leading-4">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="shadow-sm rounded-xl bg-white border-zinc-200 border-1 border-solid overflow-hidden">
              <div className="flex p-4 gap-3">
                <div className="flex-shrink-0 rounded-lg bg-zinc-100 w-16 h-16 overflow-hidden">
                  <img
                    alt="Handbag"
                    className="object-cover w-full h-full"
                    data-authorname="Arno Senoner"
                    data-authorurl="https://unsplash.com/@arnosenoner"
                    data-blurhash="L6IgMz4=IB0f:~9a9_xa0gIoS#?G"
                    data-photoid="ooj5VfXq5o8"
                    src="https://images.unsplash.com/photo-1591561954555-607968c989ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxoYW5kYmFnJTIwZmFzaGlvbiUyMGFjY2Vzc29yeXxlbnwxfDJ8fHwxNzgwNzM0ODY1fDA&ixlib=rb-4.1.0&q=80&w=400"
                  />
                </div>
                <div className="min-w-0 flex flex-col flex-1 gap-1">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <span className="font-normal text-[#71717b] text-[11px]">
                        #ZHN-20098
                      </span>
                      <span className="leading-tight truncate font-semibold text-zinc-950 text-sm leading-5">
                        Structured Tote Bag
                      </span>
                      <span className="font-normal text-[#71717b] text-[11px]">
                        Colour: Tan · Qty: 1
                      </span>
                      <span className="font-normal text-[#71717b] text-[11px]">
                        22 Apr 2025
                      </span>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                      <span className="bg-[oklch(0.6_0.118_184.704/0.12)] text-[oklch(0.398_0.07_227.392)] font-medium rounded-full text-[11px] px-2 py-0.5">
                        Delivered
                      </span>
                      <span className="font-semibold text-zinc-950 text-sm leading-5">
                        ৳4,100
                      </span>
                    </div>
                  </div>
                  <div className="flex mt-1 justify-end">
                    <button className="text-[oklch(0.623_0.214_259.815)] font-semibold text-xs leading-4">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
