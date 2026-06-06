import { useEffect } from "react";
import {
  ChevronRight,
  FileText,
  Headphones,
  Home,
  Info,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  RefreshCcw,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  Truck,
  User,
  Zap,
} from "lucide-react";

import { FallbackComponent } from "./CustomComponents";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="min-h-[874px] relative bg-white flex flex-col w-100.5 overflow-hidden">
          <div className="overflow-y-auto pb-18 flex-1">
            <div className="flex px-4 pt-10 pb-4 items-center gap-4">
              <div className="flex-shrink-0 rounded-full bg-slate-200 flex justify-center items-center w-14 h-14">
                <User className="size-7 text-slate-400" />
              </div>
              <div className="flex flex-col gap-1">
                <span
                  className="leading-tight font-semibold text-gray-900 text-xl tracking-tight"
                  style={{}}
                >
                  Hello, Rahim!
                </span>
                <span className="font-normal text-gray-500 text-sm">
                  rahim@email.com
                </span>
              </div>
            </div>
            <div className="shadow-sm rounded-lg bg-white border-gray-200 border-1 border-solid mx-4 mb-4 overflow-hidden">
              <div className="flex px-4 py-3.5 items-center gap-3">
                <div className="flex-shrink-0 rounded-lg bg-[#56aebf]/10 flex justify-center items-center w-9 h-9">
                  <ShoppingBag className="size-5 text-[#56AEBF]" />
                </div>
                <span className="font-semibold text-gray-900 text-sm flex-1">
                  My Orders
                </span>
                <ChevronRight className="size-5 text-gray-400" />
              </div>
              <div className="bg-gray-200 mx-4 h-px" />
              <div className="flex px-4 py-3.5 items-center gap-3">
                <div className="flex-shrink-0 rounded-lg bg-[#56aebf]/10 flex justify-center items-center w-9 h-9">
                  <MapPin className="size-5 text-[#56AEBF]" />
                </div>
                <span className="font-semibold text-gray-900 text-sm flex-1">
                  Addresses
                </span>
                <ChevronRight className="size-5 text-gray-400" />
              </div>
              <div className="bg-gray-200 mx-4 h-px" />
              <div className="flex px-4 py-3.5 items-center gap-3">
                <div className="flex-shrink-0 rounded-lg bg-[#56aebf]/10 flex justify-center items-center w-9 h-9">
                  <User className="size-5 text-[#56AEBF]" />
                </div>
                <span className="font-semibold text-gray-900 text-sm flex-1">
                  Profile
                </span>
                <ChevronRight className="size-5 text-gray-400" />
              </div>
            </div>
            <div className="mx-4 mb-6">
              <button className="font-semibold rounded-lg bg-white text-red-500 text-sm border-gray-200 border-1 border-solid flex justify-center items-center gap-2 w-full h-12">
                <LogOut className="size-4 text-red-500" />
                Log Out
              </button>
            </div>
            <div className="mb-2 px-4">
              <span className="font-semibold uppercase text-gray-400 text-xs tracking-widest">
                Why Shop With Us
              </span>
            </div>
            <div className="grid grid-cols-3 mx-4 mb-6 gap-2">
              <div className="rounded-lg bg-white border-gray-200 border-1 border-solid flex p-3 flex-col items-center gap-2">
                <div className="rounded-full bg-[#56aebf]/12 flex justify-center items-center w-8 h-8">
                  <Zap className="size-4 text-[#56AEBF]" />
                </div>
                <span className="leading-tight font-semibold text-center text-gray-900 text-[11px]">
                  Fast Delivery
                </span>
              </div>
              <div className="rounded-lg bg-white border-gray-200 border-1 border-solid flex p-3 flex-col items-center gap-2">
                <div className="rounded-full bg-[#56aebf]/12 flex justify-center items-center w-8 h-8">
                  <ShieldCheck className="size-4 text-[#56AEBF]" />
                </div>
                <span className="leading-tight font-semibold text-center text-gray-900 text-[11px]">
                  Secure Payment
                </span>
              </div>
              <div className="rounded-lg bg-white border-gray-200 border-1 border-solid flex p-3 flex-col items-center gap-2">
                <div className="rounded-full bg-[#56aebf]/12 flex justify-center items-center w-8 h-8">
                  <RefreshCcw className="size-4 text-[#56AEBF]" />
                </div>
                <span className="leading-tight font-semibold text-center text-gray-900 text-[11px]">
                  Easy Returns
                </span>
              </div>
              <div className="rounded-lg bg-white border-gray-200 border-1 border-solid flex p-3 flex-col items-center gap-2">
                <div className="rounded-full bg-[#56aebf]/12 flex justify-center items-center w-8 h-8">
                  <Headphones className="size-4 text-[#56AEBF]" />
                </div>
                <span className="leading-tight font-semibold text-center text-gray-900 text-[11px]">
                  24/7 Support
                </span>
              </div>
              <div className="rounded-lg bg-white border-gray-200 border-1 border-solid flex p-3 flex-col items-center gap-2">
                <div className="rounded-full bg-[#56aebf]/12 flex justify-center items-center w-8 h-8">
                  <Star className="size-4 text-[#56AEBF]" />
                </div>
                <span className="leading-tight font-semibold text-center text-gray-900 text-[11px]">
                  Quality First
                </span>
              </div>
              <div className="rounded-lg bg-white border-gray-200 border-1 border-solid flex p-3 flex-col items-center gap-2">
                <div className="rounded-full bg-[#56aebf]/12 flex justify-center items-center w-8 h-8">
                  <PackageCheck className="size-4 text-[#56AEBF]" />
                </div>
                <span className="leading-tight font-semibold text-center text-gray-900 text-[11px]">
                  Quick Dispatch
                </span>
              </div>
            </div>
            <div className="mb-2 px-4">
              <span className="font-semibold uppercase text-gray-400 text-xs tracking-widest">{`Help & Support`}</span>
            </div>
            <div className="rounded-lg bg-white border-gray-200 border-1 border-solid mx-4 mb-6 overflow-hidden">
              <div className="flex px-4 py-[13px] items-center gap-3">
                <div className="flex-shrink-0 rounded-full bg-[#25d366]/12 flex justify-center items-center w-8 h-8">
                  <MessageCircle className="size-4 text-[#25D366]" />
                </div>
                <span className="font-medium text-gray-900 text-sm flex-1">
                  Chat on WhatsApp
                </span>
                <ChevronRight className="size-4 text-gray-400" />
              </div>
              <div className="bg-gray-200 mx-4 h-px" />
              <div className="flex px-4 py-[13px] items-center gap-3">
                <div className="flex-shrink-0 rounded-full bg-[#56aebf]/10 flex justify-center items-center w-8 h-8">
                  <Mail className="size-4 text-[#56AEBF]" />
                </div>
                <span className="font-medium text-gray-900 text-sm flex-1">
                  Contact Us
                </span>
                <ChevronRight className="size-4 text-gray-400" />
              </div>
              <div className="bg-gray-200 mx-4 h-px" />
              <div className="flex px-4 py-[13px] items-center gap-3">
                <div className="flex-shrink-0 rounded-full bg-[#56aebf]/10 flex justify-center items-center w-8 h-8">
                  <Truck className="size-4 text-[#56AEBF]" />
                </div>
                <span className="font-medium text-gray-900 text-sm flex-1">
                  Shipping Info
                </span>
                <ChevronRight className="size-4 text-gray-400" />
              </div>
              <div className="bg-gray-200 mx-4 h-px" />
              <div className="flex px-4 py-[13px] items-center gap-3">
                <div className="flex-shrink-0 rounded-full bg-[#56aebf]/10 flex justify-center items-center w-8 h-8">
                  <RotateCcw className="size-4 text-[#56AEBF]" />
                </div>
                <span className="font-medium text-gray-900 text-sm flex-1">
                  Returns Policy
                </span>
                <ChevronRight className="size-4 text-gray-400" />
              </div>
            </div>
            <div className="mb-2 px-4">
              <span className="font-semibold uppercase text-gray-400 text-xs tracking-widest">
                About
              </span>
            </div>
            <div className="rounded-lg bg-white border-gray-200 border-1 border-solid mx-4 mb-6 overflow-hidden">
              <div className="flex px-4 py-[13px] items-center gap-3">
                <div className="flex-shrink-0 rounded-full bg-[#56aebf]/10 flex justify-center items-center w-8 h-8">
                  <Info className="size-4 text-[#56AEBF]" />
                </div>
                <span className="font-medium text-gray-900 text-sm flex-1">
                  About ZAHAN
                </span>
                <ChevronRight className="size-4 text-gray-400" />
              </div>
              <div className="bg-gray-200 mx-4 h-px" />
              <div className="flex px-4 py-[13px] items-center gap-3">
                <div className="flex-shrink-0 rounded-full bg-[#56aebf]/10 flex justify-center items-center w-8 h-8">
                  <Tag className="size-4 text-[#56AEBF]" />
                </div>
                <span className="font-medium text-gray-900 text-sm flex-1">{`Offers & Promotions`}</span>
                <ChevronRight className="size-4 text-gray-400" />
              </div>
            </div>
            <div className="mb-2 px-4">
              <span className="font-semibold uppercase text-gray-400 text-xs tracking-widest">
                Legal
              </span>
            </div>
            <div className="rounded-lg bg-white border-gray-200 border-1 border-solid mx-4 mb-6 overflow-hidden">
              <div className="flex px-4 py-[13px] items-center gap-3">
                <div className="flex-shrink-0 rounded-full bg-[#56aebf]/10 flex justify-center items-center w-8 h-8">
                  <Lock className="size-4 text-[#56AEBF]" />
                </div>
                <span className="font-medium text-gray-900 text-sm flex-1">
                  Privacy Policy
                </span>
                <ChevronRight className="size-4 text-gray-400" />
              </div>
              <div className="bg-gray-200 mx-4 h-px" />
              <div className="flex px-4 py-[13px] items-center gap-3">
                <div className="flex-shrink-0 rounded-full bg-[#56aebf]/10 flex justify-center items-center w-8 h-8">
                  <FileText className="size-4 text-[#56AEBF]" />
                </div>
                <span className="font-medium text-gray-900 text-sm flex-1">
                  Terms of Service
                </span>
                <ChevronRight className="size-4 text-gray-400" />
              </div>
            </div>
            <div className="flex mb-4 justify-center items-center gap-4">
              <button className="rounded-full bg-gray-100 flex justify-center items-center w-10 h-10">
                <FallbackComponent className="size-5 text-[#1877F2]" />
              </button>
              <button className="rounded-full bg-gray-100 flex justify-center items-center w-10 h-10">
                <FallbackComponent className="size-5 text-[#E1306C]" />
              </button>
              <button className="rounded-full bg-gray-100 flex justify-center items-center w-10 h-10">
                <FallbackComponent className="size-5 text-[#FF0000]" />
              </button>
            </div>
            <div className="flex pb-6 justify-center items-center">
              <span className="font-normal text-gray-400 text-xs">
                © 2026 ZAHAN Fashion and Lifestyle
              </span>
            </div>
          </div>
          <div className="fixed z-50 bg-white border-gray-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid flex left-0 bottom-0 px-2 justify-around items-center w-100.5 h-16">
            <button className="flex flex-col items-center flex-1 gap-1">
              <Home className="size-5 text-gray-500" />
              <span className="font-medium text-gray-500 text-[10px]">
                Home
              </span>
            </button>
            <button className="flex flex-col items-center flex-1 gap-1">
              <ShoppingBag className="size-5 text-gray-500" />
              <span className="font-medium text-gray-500 text-[10px]">
                Shop
              </span>
            </button>
            <button className="relative flex flex-col items-center flex-1 gap-1">
              <div className="relative">
                <ShoppingCart className="size-5 text-gray-500" />
                <span className="leading-none font-bold rounded-full bg-red-500 text-white text-[9px] flex absolute -right-2 -top-1.5 justify-center items-center w-4 h-4">
                  2
                </span>
              </div>
              <span className="font-medium text-gray-500 text-[10px]">
                Cart
              </span>
            </button>
            <button className="flex flex-col items-center flex-1 gap-1">
              <User className="size-5 text-[#56AEBF]" />
              <span className="font-semibold text-[#56AEBF] text-[10px]">
                Account
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
