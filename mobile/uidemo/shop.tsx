import { useEffect } from "react";
import { Home, Search, ShoppingBag, ShoppingCart, User } from "lucide-react";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative bg-white flex flex-col w-100.5 h-218.5 overflow-hidden">
          <div className="flex-shrink-0 z-20 bg-white">
            <div className="px-4 pt-4 pb-3">
              <div className="rounded-lg bg-white border-gray-200 border-2 border-solid flex items-center w-full overflow-hidden">
                <input
                  className="placeholder-[#9CA3AF] bg-transparent outline-none font-[Inter] text-gray-900 text-sm leading-5 px-4 flex-1 h-10"
                  placeholder="Search products..."
                />
                <button className="flex-shrink-0 bg-[#56AEBF] flex justify-center items-center w-11 h-10">
                  <Search className="size-4 text-white" />
                </button>
              </div>
            </div>
            <div className="px-4 pb-2">
              <div className="overflow-x-auto scrollbar-hide flex pb-1 gap-2">
                <div className="flex-shrink-0 cursor-pointer rounded-full bg-[#56aebf]/10 border-[#56AEBF] border-2 border-solid flex px-4 items-center h-8">
                  <span className="whitespace-nowrap font-[Inter] font-semibold text-[#56AEBF] text-xs leading-4">
                    All
                  </span>
                </div>
                <div className="flex-shrink-0 cursor-pointer rounded-full border-gray-200 border-1 border-solid flex px-4 items-center h-8">
                  <span className="whitespace-nowrap font-[Inter] font-medium text-gray-500 text-xs leading-4">
                    Sneakers
                  </span>
                </div>
                <div className="flex-shrink-0 cursor-pointer rounded-full border-gray-200 border-1 border-solid flex px-4 items-center h-8">
                  <span className="whitespace-nowrap font-[Inter] font-medium text-gray-500 text-xs leading-4">
                    Bags
                  </span>
                </div>
                <div className="flex-shrink-0 cursor-pointer rounded-full border-gray-200 border-1 border-solid flex px-4 items-center h-8">
                  <span className="whitespace-nowrap font-[Inter] font-medium text-gray-500 text-xs leading-4">
                    Tops
                  </span>
                </div>
                <div className="flex-shrink-0 cursor-pointer rounded-full border-gray-200 border-1 border-solid flex px-4 items-center h-8">
                  <span className="whitespace-nowrap font-[Inter] font-medium text-gray-500 text-xs leading-4">
                    Bottoms
                  </span>
                </div>
                <div className="flex-shrink-0 cursor-pointer rounded-full border-gray-200 border-1 border-solid flex px-4 items-center h-8">
                  <span className="whitespace-nowrap font-[Inter] font-medium text-gray-500 text-xs leading-4">
                    Accessories
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 pb-3">
              <div className="flex gap-2">
                <div className="cursor-pointer rounded-full bg-[#56aebf]/10 border-[#56AEBF] border-2 border-solid flex px-4 items-center h-8">
                  <span className="font-[Inter] font-semibold text-[#56AEBF] text-xs leading-4">
                    Latest
                  </span>
                </div>
                <div className="cursor-pointer rounded-full border-gray-200 border-1 border-solid flex px-4 items-center h-8">
                  <span className="font-[Inter] font-medium text-gray-500 text-xs leading-4">
                    Price ↑
                  </span>
                </div>
                <div className="cursor-pointer rounded-full border-gray-200 border-1 border-solid flex px-4 items-center h-8">
                  <span className="font-[Inter] font-medium text-gray-500 text-xs leading-4">
                    Price ↓
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-200 mx-0 h-px" />
          </div>
          <div className="overflow-y-auto bg-white flex-1">
            <div className="p-2">
              <div className="flex gap-2">
                <div className="flex flex-col flex-1 gap-2">
                  <div className="shadow-sm rounded-lg bg-white border-gray-100 border-1 border-solid overflow-hidden">
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "4/5" }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1560769629-975ec94e6a86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxzbmVha2VycyUyMGZhc2hpb24lMjBzaG9lcyUyMHByb2R1Y3R8ZW58MXwxfHx8MTc4MDczMjQ1NHww&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Sneakers"
                        className="object-cover w-full h-full"
                        data-photoid="dwKiHoqqxk8"
                        data-authorname="Irene Kredenets"
                        data-authorurl="https://unsplash.com/@ikredenets"
                        data-blurhash="LFP6]f8^bboy4me.Ri%M%gf,V@V@"
                      />
                      <div className="absolute left-2 top-2">
                        <span className="font-[Inter] font-bold rounded-sm bg-red-500 text-white text-[10px] px-2 py-0.5">
                          20% off
                        </span>
                      </div>
                      <div className="absolute right-2 bottom-2">
                        <span className="line-through font-[Inter] rounded-sm bg-slate-900 text-white text-[10px] px-2 py-0.5">
                          ৳3,200
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-100 px-2 pt-1.5 pb-2">
                      <p className="font-[Inter] uppercase text-gray-400 text-[10px] tracking-wide mb-0.5">
                        Sneakers
                      </p>
                      <p className="leading-tight line-clamp-2 font-[Inter] font-medium text-gray-900 text-[13px] mb-1">
                        Urban Runner Pro Sneakers
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-[Inter] font-bold text-red-500 text-[13px]">
                          ৳2,560
                        </span>
                        <span className="line-through font-[Inter] text-gray-400 text-[11px]">
                          ৳3,200
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shadow-sm rounded-lg bg-white border-gray-100 border-1 border-solid overflow-hidden">
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "3/4" }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwdG9wJTIwY2xvdGhpbmclMjBhcHBhcmVsfGVufDF8MXx8fDE3ODA3MzI0NTR8MA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Fashion Top"
                        className="object-cover w-full h-full"
                        data-photoid="xXJ6utyoSw0"
                        data-authorname="Marcus Loke"
                        data-authorurl="https://unsplash.com/@marcusloke"
                        data-blurhash="LYEn;Y0#RjniBB#mjZoz9]w]t7kB"
                      />
                      <div className="absolute left-2 top-2">
                        <span className="font-[Inter] font-bold rounded-sm bg-[#56AEBF] text-white text-[10px] px-2 py-0.5">
                          New
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-100 px-2 pt-1.5 pb-2">
                      <p className="font-[Inter] uppercase text-gray-400 text-[10px] tracking-wide mb-0.5">
                        Tops
                      </p>
                      <p className="leading-tight line-clamp-2 font-[Inter] font-medium text-gray-900 text-[13px] mb-1">
                        Linen Relaxed Fit Blouse
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-[Inter] font-bold text-gray-900 text-[13px]">
                          ৳1,850
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shadow-sm rounded-lg bg-white border-gray-100 border-1 border-solid overflow-hidden">
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "1/1" }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1778759335295-b332b4eaac15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYWNjZXNzb3JpZXMlMjBqZXdlbHJ5fGVufDF8Mnx8fDE3ODA1NjA2OTd8MA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Accessories"
                        className="object-cover w-full h-full"
                        data-photoid="-RPzjcPjPqQ"
                        data-authorname="Husien Bisky"
                        data-authorurl="https://unsplash.com/@husien_bisky1"
                        data-blurhash="L26@+fwbI9^*EMRlNHxs4nR.-=IU"
                      />
                      <div className="absolute left-2 top-2">
                        <span className="font-[Inter] font-bold rounded-sm bg-red-500 text-white text-[10px] px-2 py-0.5">
                          15% off
                        </span>
                      </div>
                      <div className="absolute right-2 bottom-2">
                        <span className="line-through font-[Inter] rounded-sm bg-slate-900 text-white text-[10px] px-2 py-0.5">
                          ৳2,100
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-100 px-2 pt-1.5 pb-2">
                      <p className="font-[Inter] uppercase text-gray-400 text-[10px] tracking-wide mb-0.5">
                        Accessories
                      </p>
                      <p className="leading-tight line-clamp-2 font-[Inter] font-medium text-gray-900 text-[13px] mb-1">
                        Gold Layered Chain Necklace
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-[Inter] font-bold text-red-500 text-[13px]">
                          ৳1,785
                        </span>
                        <span className="line-through font-[Inter] text-gray-400 text-[11px]">
                          ৳2,100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col flex-1 gap-2">
                  <div className="shadow-sm rounded-lg bg-white border-gray-100 border-1 border-solid overflow-hidden">
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "1/1" }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYmFnJTIwbGVhdGhlciUyMGhhbmRiYWd8ZW58MXwxfHx8MTc4MDczMjQ1NXww&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Bag"
                        className="object-cover w-full h-full"
                        data-photoid="oCXVxwTFwqE"
                        data-authorname="Arno Senoner"
                        data-authorurl="https://unsplash.com/@arnosenoner"
                        data-blurhash="LLMFXo4:CjM|0yIVVtofHVt7#9xa"
                      />
                      <div className="absolute left-2 top-2">
                        <span className="font-[Inter] font-bold rounded-sm bg-[#56AEBF] text-white text-[10px] px-2 py-0.5">
                          New
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-100 px-2 pt-1.5 pb-2">
                      <p className="font-[Inter] uppercase text-gray-400 text-[10px] tracking-wide mb-0.5">
                        Bags
                      </p>
                      <p className="leading-tight line-clamp-2 font-[Inter] font-medium text-gray-900 text-[13px] mb-1">
                        Structured Leather Tote Bag
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-[Inter] font-bold text-gray-900 text-[13px]">
                          ৳4,500
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shadow-sm rounded-lg bg-white border-gray-100 border-1 border-solid overflow-hidden">
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "5/6" }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGplYW5zJTIwYm90dG9tcyUyMGZhc2hpb258ZW58MXwxfHx8MTc4MDczMjQ1NXww&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Jeans"
                        className="object-cover w-full h-full"
                        data-photoid="EtOMMg1nSR8"
                        data-authorname="Jason Leung"
                        data-authorurl="https://unsplash.com/@ninjason"
                        data-blurhash="LFF=:e}:#P$yQkNItSxvH=9wE1WA"
                      />
                      <div className="bg-slate-900/55 flex absolute inset-0 justify-center items-center">
                        <span className="font-[Inter] font-semibold text-white text-[13px]">
                          Out of stock
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-100 px-2 pt-1.5 pb-2">
                      <p className="font-[Inter] uppercase text-gray-400 text-[10px] tracking-wide mb-0.5">
                        Bottoms
                      </p>
                      <p className="leading-tight line-clamp-2 font-[Inter] font-medium text-gray-900 text-[13px] mb-1">
                        Slim Fit Stretch Denim Jeans
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-[Inter] font-bold text-gray-900 text-[13px]">
                          ৳2,200
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shadow-sm rounded-lg bg-white border-gray-100 border-1 border-solid overflow-hidden">
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "4/5" }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1731589802397-6a1088d63630?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbGlmZXN0eWxlJTIwY2xvdGhpbmclMjBtb2RlbHxlbnwxfDF8fHwxNzgwNzMyNDU1fDA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Fashion Model"
                        className="object-cover w-full h-full"
                        data-photoid="t4okA5Tb9bE"
                        data-authorname="Branislav Rodman"
                        data-authorurl="https://unsplash.com/@branislavrodman"
                        data-blurhash="L67TnI-B1JNG^iM|E%xGFwIp^5$*"
                      />
                      <div className="absolute left-2 top-2">
                        <span className="font-[Inter] font-bold rounded-sm bg-red-500 text-white text-[10px] px-2 py-0.5">
                          30% off
                        </span>
                      </div>
                      <div className="absolute right-2 bottom-2">
                        <span className="line-through font-[Inter] rounded-sm bg-slate-900 text-white text-[10px] px-2 py-0.5">
                          ৳5,800
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-100 px-2 pt-1.5 pb-2">
                      <p className="font-[Inter] uppercase text-gray-400 text-[10px] tracking-wide mb-0.5">
                        Tops
                      </p>
                      <p className="leading-tight line-clamp-2 font-[Inter] font-medium text-gray-900 text-[13px] mb-1">
                        Premium Silk Wrap Dress
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-[Inter] font-bold text-red-500 text-[13px]">
                          ৳4,060
                        </span>
                        <span className="line-through font-[Inter] text-gray-400 text-[11px]">
                          ৳5,800
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 bg-white border-gray-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid h-14">
            <div className="flex px-2 flex-row justify-around items-center h-full">
              <button className="flex flex-col justify-center items-center flex-1 gap-0.5 h-full">
                <Home className="size-5 text-gray-500" />
                <span className="font-[Inter] text-gray-500 text-[10px]">
                  Home
                </span>
              </button>
              <button className="flex flex-col justify-center items-center flex-1 gap-0.5 h-full">
                <ShoppingBag className="size-5 text-[#56AEBF]" />
                <span className="font-[Inter] font-semibold text-[#56AEBF] text-[10px]">
                  Shop
                </span>
              </button>
              <button className="relative flex flex-col justify-center items-center flex-1 gap-0.5 h-full">
                <div className="relative">
                  <ShoppingCart className="size-5 text-gray-500" />
                  <span className="font-[Inter] font-bold rounded-full bg-red-500 text-white text-[9px] flex absolute -right-2 -top-1.5 justify-center items-center w-4 h-4">
                    2
                  </span>
                </div>
                <span className="font-[Inter] text-gray-500 text-[10px]">
                  Cart
                </span>
              </button>
              <button className="flex flex-col justify-center items-center flex-1 gap-0.5 h-full">
                <User className="size-5 text-gray-500" />
                <span className="font-[Inter] text-gray-500 text-[10px]">
                  Account
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
