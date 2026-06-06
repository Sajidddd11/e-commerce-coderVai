import { useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  ShoppingBag,
  ShoppingCart,
  Star,
  StarHalf,
  User,
} from "lucide-react";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative w-full">
          <div className="bg-gray-100 w-full overflow-hidden">
            <div className="relative w-full h-80.5 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1693443688057-85f57b872a3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbGluZW4lMjBzaGlydCUyMGZhc2hpb24lMjBwcm9kdWN0fGVufDF8MXx8fDE3ODA3MzI0NTR8MA&ixlib=rb-4.1.0&q=80&w=400"
                alt="Classic Linen Shirt"
                className="object-cover w-full h-full"
                data-photoid="maHb1ki_X3o"
                data-authorname="tian dayong"
                data-authorurl="https://unsplash.com/@tonnnyj"
                data-blurhash="LCOD8.8{~Vt7pet7odoe,,bb0LRj"
              />
              <div className="bg-black/18 absolute inset-0" />
              <button className="shadow-sm rounded-full bg-white/80 flex absolute left-4 top-4 justify-center items-center w-11 h-11">
                <ChevronLeft className="size-5 text-zinc-950" />
              </button>
              <div className="flex absolute inset-x-0 bottom-3 justify-center items-center gap-1.5">
                <div className="rounded-full bg-[#56AEBF] w-2 h-2" />
                <div className="rounded-full bg-white/60 w-1.5 h-1.5" />
                <div className="rounded-full bg-white/60 w-1.5 h-1.5" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white px-4 pt-4 pb-35 w-full">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="leading-tight font-semibold text-gray-900 text-2xl tracking-tight">
                Classic Linen Shirt
              </h1>
              <div className="flex mt-1 flex-wrap items-center gap-2">
                <span className="font-bold text-red-500 text-xl">৳1,200</span>
                <span className="line-through text-gray-500 text-sm">
                  ৳1,800
                </span>
                <span className="font-semibold rounded-full bg-red-500 text-white text-[11px] px-2 py-0.5">
                  33% off
                </span>
              </div>
            </div>
            <p className="leading-relaxed text-gray-500 text-sm">
              Crafted from 100% premium linen, this classic shirt offers a
              breathable, relaxed fit perfect for warm days. Features a
              button-down collar, chest pocket, and a versatile silhouette that
              pairs effortlessly with chinos or denim.
            </p>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-gray-900 text-sm">Size</span>
              <div className="flex flex-row flex-wrap gap-2">
                <button className="font-medium rounded-full bg-white text-gray-700 text-sm border-gray-200 border-1 border-solid px-4 py-1.5">
                  S
                </button>
                <button className="font-medium rounded-full bg-slate-900 text-white text-sm px-4 py-1.5">
                  M
                </button>
                <button className="font-medium rounded-full bg-white text-gray-700 text-sm border-gray-200 border-1 border-solid px-4 py-1.5">
                  L
                </button>
                <button className="font-medium rounded-full bg-white text-gray-700 text-sm border-gray-200 border-1 border-solid px-4 py-1.5">
                  XL
                </button>
                <button className="font-medium rounded-full bg-white text-gray-700 text-sm border-gray-200 border-1 border-solid px-4 py-1.5">
                  XXL
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-gray-900 text-sm">Color</span>
              <div className="flex flex-row gap-3">
                <button className="ring-2 ring-offset-2 ring-[#56AEBF] rounded-full bg-[#56AEBF] w-8 h-8" />
                <button className="rounded-full bg-[#1E3A5F] w-8 h-8" />
                <button className="rounded-full bg-white border-gray-200 border-2 border-solid w-8 h-8" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <Star className="size-4 fill-[#56AEBF] text-[#56AEBF]" />
                  <Star className="size-4 fill-[#56AEBF] text-[#56AEBF]" />
                  <Star className="size-4 fill-[#56AEBF] text-[#56AEBF]" />
                  <Star className="size-4 fill-[#56AEBF] text-[#56AEBF]" />
                  <StarHalf className="size-4 fill-[#56AEBF] text-[#56AEBF]" />
                </div>
                <span className="text-gray-500 text-xs">4.5 (24 reviews)</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="rounded-xl bg-white border-gray-200 border-1 border-solid flex p-3 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-gray-100 flex justify-center items-center w-8 h-8">
                      <User className="size-4 text-gray-400" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-gray-900 text-sm">
                        Rafiq Ahmed
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Star className="size-3 fill-[#56AEBF] text-[#56AEBF]" />
                        <Star className="size-3 fill-[#56AEBF] text-[#56AEBF]" />
                        <Star className="size-3 fill-[#56AEBF] text-[#56AEBF]" />
                        <Star className="size-3 fill-[#56AEBF] text-[#56AEBF]" />
                        <Star className="size-3 fill-[#56AEBF] text-[#56AEBF]" />
                      </div>
                    </div>
                  </div>
                  <p className="leading-relaxed text-gray-500 text-sm">
                    Excellent quality! The linen fabric is soft and breathable.
                    Perfect fit for the Dhaka summer. Highly recommend.
                  </p>
                </div>
                <div className="rounded-xl bg-white border-gray-200 border-1 border-solid flex p-3 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-gray-100 flex justify-center items-center w-8 h-8">
                      <User className="size-4 text-gray-400" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-gray-900 text-sm">
                        Nadia Islam
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Star className="size-3 fill-[#56AEBF] text-[#56AEBF]" />
                        <Star className="size-3 fill-[#56AEBF] text-[#56AEBF]" />
                        <Star className="size-3 fill-[#56AEBF] text-[#56AEBF]" />
                        <Star className="size-3 fill-[#56AEBF] text-[#56AEBF]" />
                        <Star className="size-3 fill-[#E5E7EB] text-gray-200" />
                      </div>
                    </div>
                  </div>
                  <p className="leading-relaxed text-gray-500 text-sm">
                    Great shirt, very comfortable. The color is exactly as
                    shown. Delivery was fast too!
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 text-lg">
                  You may also like
                </span>
                <button className="font-medium text-[#56AEBF] text-sm flex items-center gap-1">
                  See all
                  <ChevronRight className="size-4" />
                </button>
              </div>
              <div className="overflow-x-auto flex pb-1 flex-row gap-2">
                <div className="flex-shrink-0 rounded-xl bg-white border-gray-200 border-1 border-solid flex flex-col w-38 overflow-hidden">
                  <div className="bg-gray-100 w-38 h-38 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1740711152088-88a009e877bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBzaGlydCUyMG1lbnN3ZWFyJTIwcHJvZHVjdHxlbnwxfDJ8fHwxNzgwNzMyNDk1fDA&ixlib=rb-4.1.0&q=80&w=400"
                      alt="Casual Linen Shirt"
                      className="object-cover w-full h-full"
                      data-photoid="vcTKFYNZop4"
                      data-authorname="Robert Richman"
                      data-authorurl="https://unsplash.com/@linenese_lifestyle"
                      data-blurhash="LwM*29%M~qofxufRofWB?bayIUay"
                    />
                  </div>
                  <div className="bg-gray-100 p-2">
                    <p className="leading-tight line-clamp-2 font-medium text-gray-900 text-[13px]">
                      Slim Fit Linen Shirt
                    </p>
                    <span className="font-bold text-red-500 text-[13px]">
                      ৳1,050
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 rounded-xl bg-white border-gray-200 border-1 border-solid flex flex-col w-38 overflow-hidden">
                  <div className="bg-gray-100 w-38 h-38 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1717282924526-07a7373bb142?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwc2hpcnQlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHklMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MXwxfHx8MTc4MDczMjQ3N3ww&ixlib=rb-4.1.0&q=80&w=400"
                      alt="Fashion Shirt"
                      className="object-cover w-full h-full"
                      data-photoid="eu5saE3BJsU"
                      data-authorname="Carmen Roman"
                      data-authorurl="https://unsplash.com/@ccroman"
                      data-blurhash="LGIOU,Xo%2kCAJR*aeWV0JR.%1WC"
                    />
                  </div>
                  <div className="bg-gray-100 p-2">
                    <p className="leading-tight line-clamp-2 font-medium text-gray-900 text-[13px]">
                      Oxford Button-Down
                    </p>
                    <span className="font-bold text-gray-900 text-[13px]">
                      ৳1,400
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 rounded-xl bg-white border-gray-200 border-1 border-solid flex flex-col w-38 overflow-hidden">
                  <div className="bg-gray-100 w-38 h-38 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1713929689473-572aeaa5ae12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYXBwYXJlbCUyMHByb2R1Y3QlMjBwaG90b2dyYXBoeSUyMG1pbmltYWx8ZW58MXwyfHx8MTc4MDczMjQ5NXww&ixlib=rb-4.1.0&q=80&w=400"
                      alt="Fashion Apparel"
                      className="object-cover w-full h-full"
                      data-photoid="QBZNXM90oNI"
                      data-authorname="TuanAnh Blue"
                      data-authorurl="https://unsplash.com/@blueeyeaa"
                      data-blurhash="LMQJfnR.^+?bxXoINGM|~qRPR*t8"
                    />
                  </div>
                  <div className="bg-gray-100 p-2">
                    <p className="leading-tight line-clamp-2 font-medium text-gray-900 text-[13px]">
                      Relaxed Poplin Shirt
                    </p>
                    <span className="font-bold text-red-500 text-[13px]">
                      ৳980
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed flex inset-x-0 bottom-0 flex-col w-full">
          <div className="bg-white border-gray-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid px-4 py-3">
            <button className="rounded-lg bg-[#56AEBF] flex justify-center items-center gap-2 w-full h-14">
              <ShoppingCart className="size-5 text-white" />
              <span className="font-semibold text-white text-sm">
                Add to Cart
              </span>
            </button>
          </div>
          <div className="bg-white border-gray-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid px-2 pt-1 pb-2">
            <div className="flex flex-row justify-around items-center">
              <button className="flex px-3 py-1 flex-col items-center gap-0.5">
                <Home className="size-5 text-gray-500" />
                <span className="text-gray-500 text-[10px]">Home</span>
              </button>
              <button className="flex px-3 py-1 flex-col items-center gap-0.5">
                <ShoppingBag className="size-5 text-gray-500" />
                <span className="text-gray-500 text-[10px]">Shop</span>
              </button>
              <button className="relative flex px-3 py-1 flex-col items-center gap-0.5">
                <div className="relative">
                  <ShoppingCart className="size-5 text-[#56AEBF]" />
                  <span className="font-bold rounded-full bg-red-500 text-white text-[9px] flex absolute -right-2 -top-1.5 justify-center items-center w-4 h-4">
                    2
                  </span>
                </div>
                <span className="font-medium text-[#56AEBF] text-[10px]">
                  Cart
                </span>
              </button>
              <button className="flex px-3 py-1 flex-col items-center gap-0.5">
                <User className="size-5 text-gray-500" />
                <span className="text-gray-500 text-[10px]">Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
