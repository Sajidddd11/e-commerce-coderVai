import { useEffect } from "react";
import {
  ChevronRight,
  Home,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";

export default function App() {
  return (
    <div>
      <div className="bg-white text-zinc-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative bg-white flex flex-col w-100.5 h-218.5 overflow-hidden">
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="border-[oklch(0.92_0.004_286.32)] bg-white border-black/1 border-t-0 border-r-0 border-b-1 border-l-0 border-solid px-4 pt-10 pb-3">
              <div className="flex items-center gap-3">
                <span
                  className="text-[oklch(0.141_0.005_285.823)] flex-shrink-0 font-bold text-lg leading-7 tracking-[2.88px]"
                  style={{}}
                >
                  ZAHAN
                </span>
                <div className="border-[oklch(0.92_0.004_286.32)] rounded-full bg-white border-black/1 border-2 border-solid flex px-3 py-1.5 items-center flex-1 gap-2">
                  <span className="text-[oklch(0.552_0.016_285.938)] truncate text-xs leading-4 flex-1">
                    Search products...
                  </span>
                  <div className="flex-shrink-0 rounded-full bg-[#56AEBF] flex justify-center items-center w-6 h-6">
                    <Search className="size-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#56aebf]/10 flex px-4 py-2 justify-center items-center">
              <span className="font-medium text-center text-slate-900 text-[10px] tracking-wide">
                🎉 Use code
                <span className="font-bold text-[#56AEBF]">WELCOME20</span>for
                20% off your first order!
              </span>
            </div>
            <div className="overflow-y-auto pb-16 flex-1">
              <div className="px-4 pt-4">
                <div
                  className="relative rounded-2xl bg-slate-900 w-full overflow-hidden"
                  style={{}}
                >
                  <img
                    src="https://images.unsplash.com/photo-1603189343302-e603f7add05a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxuZXclMjBzZWFzb24lMjBmYXNoaW9uJTIwY29sbGVjdGlvbiUyMGVkaXRvcmlhbHxlbnwxfDB8fHwxNzgwNzMyNDc3fDA&ixlib=rb-4.1.0&q=80&w=400"
                    alt="New Season Arrivals"
                    className="object-cover opacity-40 w-full h-44"
                    data-photoid="PKMvkg7vnUo"
                    data-authorname="Malicki M Beser"
                    data-authorurl="https://unsplash.com/@themalicki"
                    data-blurhash="L,M@l%M{~q%M-;M{M{xu-;t7M{Rj"
                  />
                  <div className="bg-slate-900/92 absolute inset-0" />
                  <div className="flex absolute inset-0 px-6 py-5 flex-col justify-center">
                    <span className="font-medium uppercase text-[#56AEBF] text-[10px] tracking-[3.2px] mb-1">
                      2026 Collection
                    </span>
                    <h2 className="leading-tight font-bold text-white text-2xl leading-8 mb-1">
                      New Season
                      <br />
                      Arrivals
                    </h2>
                    <p className="text-white/70 text-xs leading-4 mb-4">{`Fashion & Lifestyle`}</p>
                    <button className="font-semibold rounded-full bg-[#56AEBF] text-white text-xs leading-4 px-4 py-2 self-start">
                      Shop the collection
                    </button>
                  </div>
                  <div className="flex absolute inset-x-0 bottom-3 justify-center gap-1.5">
                    <div className="rounded-full bg-[#56AEBF] w-4 h-1.5" />
                    <div className="rounded-full bg-white/40 w-1.5 h-1.5" />
                    <div className="rounded-full bg-white/40 w-1.5 h-1.5" />
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <div className="overflow-x-auto scrollbar-hide flex pb-1 gap-4">
                  <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                    <div className="border-[oklch(0.92_0.004_286.32)] rounded-full bg-gray-100 border-black/1 border-2 border-solid w-16 h-16 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1738261544450-dac9cc4e5631?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMHRvcHMlMjBmYXNoaW9uJTIwYXBwYXJlbHxlbnwxfDJ8fHwxNzgwNzMyNDUzfDA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Tops"
                        className="object-cover w-full h-full"
                        data-photoid="s9XqJmI8LO8"
                        data-authorname="robert macmillan"
                        data-authorurl="https://unsplash.com/@bobmacmillanphotography"
                        data-blurhash="L9BxTUS14U$*-Ta|ENoKQ-sopIR*"
                      />
                    </div>
                    <span className="text-[oklch(0.141_0.005_285.823)] font-medium text-[11px]">
                      Tops
                    </span>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                    <div className="border-[oklch(0.92_0.004_286.32)] rounded-full bg-gray-100 border-black/1 border-2 border-solid w-16 h-16 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1714143136372-ddaf8b606da7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYm90dG9tcyUyMHBhbnRzJTIwZGVuaW18ZW58MXwyfHx8MTc4MDczMjQ1M3ww&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Bottoms"
                        className="object-cover w-full h-full"
                        data-photoid="9yoXrG6Er_g"
                        data-authorname="TuanAnh Blue"
                        data-authorurl="https://unsplash.com/@blueeyeaa"
                        data-blurhash="LbM@l%of~pofofayWBj[-pWBIVof"
                      />
                    </div>
                    <span className="text-[oklch(0.141_0.005_285.823)] font-medium text-[11px]">
                      Bottoms
                    </span>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                    <div className="border-[oklch(0.92_0.004_286.32)] rounded-full bg-gray-100 border-black/1 border-2 border-solid w-16 h-16 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1591561954555-607968c989ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxoYW5kYmFnJTIwbHV4dXJ5JTIwZmFzaGlvbiUyMGFjY2Vzc29yaWVzfGVufDF8Mnx8fDE3ODA3MzI0NTN8MA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Bags"
                        className="object-cover w-full h-full"
                        data-photoid="ooj5VfXq5o8"
                        data-authorname="Arno Senoner"
                        data-authorurl="https://unsplash.com/@arnosenoner"
                        data-blurhash="L6IgMz4=IB0f:~9a9_xa0gIoS#?G"
                      />
                    </div>
                    <span className="text-[oklch(0.141_0.005_285.823)] font-medium text-[11px]">
                      Bags
                    </span>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                    <div className="border-[oklch(0.92_0.004_286.32)] rounded-full bg-gray-100 border-black/1 border-2 border-solid w-16 h-16 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1645106281638-79585657aa4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwc25lYWtlcnMlMjBzaG9lc3xlbnwxfDJ8fHwxNzgwNzMyNDUzfDA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Sneakers"
                        className="object-cover w-full h-full"
                        data-photoid="nB55k3TYJEA"
                        data-authorname="Foto Bakirkoy"
                        data-authorurl="https://unsplash.com/@fotobakirkoy"
                        data-blurhash="LCDcj*-:4.o$4nRj~qt7IVITjZ-;"
                      />
                    </div>
                    <span className="text-[oklch(0.141_0.005_285.823)] font-medium text-[11px]">
                      Sneakers
                    </span>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                    <div className="border-[oklch(0.92_0.004_286.32)] rounded-full bg-gray-100 border-black/1 border-2 border-solid w-16 h-16 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1549972574-8e3e1ed6a347?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYWNjZXNzb3JpZXMlMjBqZXdlbHJ5JTIwd2F0Y2h8ZW58MXwyfHx8MTc4MDczMjQ4NHww&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Accessories"
                        className="object-cover w-full h-full"
                        data-photoid="l1mVJnG7a84"
                        data-authorname="Ђорђе Јовичић"
                        data-authorurl="https://unsplash.com/@djordje_jovicic"
                        data-blurhash="LHL;pp~q%NIU-pRjt7kB_4IUM{xu"
                      />
                    </div>
                    <span className="text-[oklch(0.141_0.005_285.823)] font-medium text-[11px]">
                      Accessories
                    </span>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                    <div className="border-[oklch(0.92_0.004_286.32)] rounded-full bg-gray-100 border-black/1 border-2 border-solid w-16 h-16 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1711516141938-cc5917435dcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwZHJlc3MlMjB3b21lbiUyMHN0eWxlfGVufDF8Mnx8fDE3ODA3MzI0ODF8MA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Dresses"
                        className="object-cover w-full h-full"
                        data-photoid="DFvJuEHPI5M"
                        data-authorname="Kinjal Sanchaniya"
                        data-authorurl="https://unsplash.com/@editographybykinjal"
                        data-blurhash="L8LfEiNu.8x]~9R*NfW?_2R.NzxB"
                      />
                    </div>
                    <span className="text-[oklch(0.141_0.005_285.823)] font-medium text-[11px]">
                      Dresses
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex mb-3 justify-between items-center">
                  <h3 className="text-[oklch(0.141_0.005_285.823)] font-bold text-xl leading-7 tracking-tight">
                    New Arrivals
                  </h3>
                  <button className="font-semibold text-[#56AEBF] text-xs leading-4 flex items-center gap-0.5">
                    See all
                    <ChevronRight className="size-3" />
                  </button>
                </div>
                <div className="overflow-x-auto scrollbar-hide flex pb-2 gap-3">
                  <div className="flex-shrink-0 border-[oklch(0.92_0.004_286.32)] shadow-sm rounded-xl bg-white border-black/1 border-1 border-solid w-40 overflow-hidden">
                    <div className="relative bg-gray-100 w-40 h-40">
                      <img
                        src="https://images.unsplash.com/photo-1758887952896-8491d393afe2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwd2hpdGUlMjBmYXNoaW9uJTIwcHJvZHVjdCUyMHBob3RvZ3JhcGh5fGVufDF8Mnx8fDE3ODA3MzI0ODN8MA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Product"
                        className="object-cover w-full h-full"
                        data-photoid="3weffxf3mdk"
                        data-authorname="Faraz Fayaz"
                        data-authorurl="https://unsplash.com/@farazfayaz"
                        data-blurhash="LjN^e:M{WBj[-;D%WBRj~qofIUWB"
                      />
                      <div className="font-bold rounded-full bg-[#56AEBF] text-white text-[9px] absolute left-2 top-2 px-2 py-0.5">
                        New
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[oklch(0.141_0.005_285.823)] leading-tight line-clamp-2 font-medium text-[13px] mb-1">
                        Linen Relaxed Fit Shirt
                      </p>
                      <span className="text-[oklch(0.141_0.005_285.823)] font-bold text-[13px]">
                        ৳1,290
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 border-[oklch(0.92_0.004_286.32)] shadow-sm rounded-xl bg-white border-black/1 border-1 border-solid w-40 overflow-hidden">
                    <div className="relative bg-gray-100 w-40 h-40">
                      <img
                        src="https://images.unsplash.com/photo-1738261544450-dac9cc4e5631?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMHRvcHMlMjBmYXNoaW9uJTIwYXBwYXJlbHxlbnwxfDJ8fHwxNzgwNzMyNDUzfDA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Product"
                        className="object-cover w-full h-full"
                        data-photoid="s9XqJmI8LO8"
                        data-authorname="robert macmillan"
                        data-authorurl="https://unsplash.com/@bobmacmillanphotography"
                        data-blurhash="L9BxTUS14U$*-Ta|ENoKQ-sopIR*"
                      />
                      <div className="font-bold rounded-full bg-[#56AEBF] text-white text-[9px] absolute left-2 top-2 px-2 py-0.5">
                        New
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[oklch(0.141_0.005_285.823)] leading-tight line-clamp-2 font-medium text-[13px] mb-1">
                        Oversized Cotton Tee
                      </p>
                      <span className="text-[oklch(0.141_0.005_285.823)] font-bold text-[13px]">
                        ৳890
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 border-[oklch(0.92_0.004_286.32)] shadow-sm rounded-xl bg-white border-black/1 border-1 border-solid w-40 overflow-hidden">
                    <div className="relative bg-gray-100 w-40 h-40">
                      <img
                        src="https://images.unsplash.com/photo-1711516141938-cc5917435dcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwZHJlc3MlMjB3b21lbiUyMHN0eWxlfGVufDF8Mnx8fDE3ODA3MzI0ODF8MA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Product"
                        className="object-cover w-full h-full"
                        data-photoid="DFvJuEHPI5M"
                        data-authorname="Kinjal Sanchaniya"
                        data-authorurl="https://unsplash.com/@editographybykinjal"
                        data-blurhash="L8LfEiNu.8x]~9R*NfW?_2R.NzxB"
                      />
                      <div className="font-bold rounded-full bg-[#56AEBF] text-white text-[9px] absolute left-2 top-2 px-2 py-0.5">
                        New
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[oklch(0.141_0.005_285.823)] leading-tight line-clamp-2 font-medium text-[13px] mb-1">
                        Floral Midi Dress
                      </p>
                      <span className="text-[oklch(0.141_0.005_285.823)] font-bold text-[13px]">
                        ৳1,750
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 border-[oklch(0.92_0.004_286.32)] shadow-sm rounded-xl bg-white border-black/1 border-1 border-solid w-40 overflow-hidden">
                    <div className="relative bg-gray-100 w-40 h-40">
                      <img
                        src="https://images.unsplash.com/photo-1645106281638-79585657aa4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwc25lYWtlcnMlMjBzaG9lc3xlbnwxfDJ8fHwxNzgwNzMyNDUzfDA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Product"
                        className="object-cover w-full h-full"
                        data-photoid="nB55k3TYJEA"
                        data-authorname="Foto Bakirkoy"
                        data-authorurl="https://unsplash.com/@fotobakirkoy"
                        data-blurhash="LCDcj*-:4.o$4nRj~qt7IVITjZ-;"
                      />
                      <div className="font-bold rounded-full bg-[#56AEBF] text-white text-[9px] absolute left-2 top-2 px-2 py-0.5">
                        New
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[oklch(0.141_0.005_285.823)] leading-tight line-clamp-2 font-medium text-[13px] mb-1">
                        Classic White Sneakers
                      </p>
                      <span className="text-[oklch(0.141_0.005_285.823)] font-bold text-[13px]">
                        ৳2,490
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex mb-3 justify-between items-center">
                  <h3 className="text-[oklch(0.141_0.005_285.823)] font-bold text-xl leading-7 tracking-tight">
                    Best Selling
                  </h3>
                  <button className="font-semibold text-[#56AEBF] text-xs leading-4 flex items-center gap-0.5">
                    See all
                    <ChevronRight className="size-3" />
                  </button>
                </div>
                <div className="overflow-x-auto scrollbar-hide flex pb-2 gap-3">
                  <div className="flex-shrink-0 border-[oklch(0.92_0.004_286.32)] shadow-sm rounded-xl bg-white border-black/1 border-1 border-solid w-40 overflow-hidden">
                    <div className="relative bg-gray-100 w-40 h-40">
                      <img
                        src="https://images.unsplash.com/photo-1591561954555-607968c989ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxoYW5kYmFnJTIwbHV4dXJ5JTIwZmFzaGlvbiUyMGFjY2Vzc29yaWVzfGVufDF8Mnx8fDE3ODA3MzI0NTN8MA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Product"
                        className="object-cover w-full h-full"
                        data-photoid="ooj5VfXq5o8"
                        data-authorname="Arno Senoner"
                        data-authorurl="https://unsplash.com/@arnosenoner"
                        data-blurhash="L6IgMz4=IB0f:~9a9_xa0gIoS#?G"
                      />
                      <div className="font-bold rounded-full bg-red-500 text-white text-[9px] absolute left-2 top-2 px-2 py-0.5">
                        30% off
                      </div>
                      <div className="rounded-sm bg-slate-900/80 absolute right-2 bottom-2 px-1.5 py-0.5">
                        <span className="line-through text-white text-[9px]">
                          ৳3,200
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[oklch(0.141_0.005_285.823)] leading-tight line-clamp-2 font-medium text-[13px] mb-1">
                        Structured Tote Bag
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-red-500 text-[13px]">
                          ৳2,240
                        </span>
                        <span className="text-[oklch(0.552_0.016_285.938)] line-through text-[11px]">
                          ৳3,200
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 border-[oklch(0.92_0.004_286.32)] shadow-sm rounded-xl bg-white border-black/1 border-1 border-solid w-40 overflow-hidden">
                    <div className="relative bg-gray-100 w-40 h-40">
                      <img
                        src="https://images.unsplash.com/photo-1714143136372-ddaf8b606da7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYm90dG9tcyUyMHBhbnRzJTIwZGVuaW18ZW58MXwyfHx8MTc4MDczMjQ1M3ww&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Product"
                        className="object-cover w-full h-full"
                        data-photoid="9yoXrG6Er_g"
                        data-authorname="TuanAnh Blue"
                        data-authorurl="https://unsplash.com/@blueeyeaa"
                        data-blurhash="LbM@l%of~pofofayWBj[-pWBIVof"
                      />
                      <div className="font-bold rounded-full bg-red-500 text-white text-[9px] absolute left-2 top-2 px-2 py-0.5">
                        20% off
                      </div>
                      <div className="rounded-sm bg-slate-900/80 absolute right-2 bottom-2 px-1.5 py-0.5">
                        <span className="line-through text-white text-[9px]">
                          ৳1,800
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[oklch(0.141_0.005_285.823)] leading-tight line-clamp-2 font-medium text-[13px] mb-1">
                        Slim Fit Chino Pants
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-red-500 text-[13px]">
                          ৳1,440
                        </span>
                        <span className="text-[oklch(0.552_0.016_285.938)] line-through text-[11px]">
                          ৳1,800
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 border-[oklch(0.92_0.004_286.32)] shadow-sm rounded-xl bg-white border-black/1 border-1 border-solid w-40 overflow-hidden">
                    <div className="relative bg-gray-100 w-40 h-40">
                      <img
                        src="https://images.unsplash.com/photo-1549972574-8e3e1ed6a347?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYWNjZXNzb3JpZXMlMjBqZXdlbHJ5JTIwd2F0Y2h8ZW58MXwyfHx8MTc4MDczMjQ4NHww&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Product"
                        className="object-cover w-full h-full"
                        data-photoid="l1mVJnG7a84"
                        data-authorname="Ђорђе Јовичић"
                        data-authorurl="https://unsplash.com/@djordje_jovicic"
                        data-blurhash="LHL;pp~q%NIU-pRjt7kB_4IUM{xu"
                      />
                      <div className="font-bold rounded-full bg-red-500 text-white text-[9px] absolute left-2 top-2 px-2 py-0.5">
                        15% off
                      </div>
                      <div className="rounded-sm bg-slate-900/80 absolute right-2 bottom-2 px-1.5 py-0.5">
                        <span className="line-through text-white text-[9px]">
                          ৳2,100
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[oklch(0.141_0.005_285.823)] leading-tight line-clamp-2 font-medium text-[13px] mb-1">
                        Minimalist Watch Strap
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-red-500 text-[13px]">
                          ৳1,785
                        </span>
                        <span className="text-[oklch(0.552_0.016_285.938)] line-through text-[11px]">
                          ৳2,100
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 border-[oklch(0.92_0.004_286.32)] shadow-sm rounded-xl bg-white border-black/1 border-1 border-solid w-40 overflow-hidden">
                    <div className="relative bg-gray-100 w-40 h-40">
                      <img
                        src="https://images.unsplash.com/photo-1612731486606-2614b4d74921?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbGlmZXN0eWxlJTIwY2xvdGhpbmclMjBtb2RlbHxlbnwxfDB8fHwxNzgwNzMyNDUzfDA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Product"
                        className="object-cover w-full h-full"
                        data-photoid="ssnCzNayHC4"
                        data-authorname="Dominik kielbasa"
                        data-authorurl="https://unsplash.com/@dbasa"
                        data-blurhash="LTLCnl9a~9w_-os.9vfk=_oenibH"
                      />
                      <div className="font-bold rounded-full bg-red-500 text-white text-[9px] absolute left-2 top-2 px-2 py-0.5">
                        25% off
                      </div>
                      <div className="rounded-sm bg-slate-900/80 absolute right-2 bottom-2 px-1.5 py-0.5">
                        <span className="line-through text-white text-[9px]">
                          ৳3,600
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[oklch(0.141_0.005_285.823)] leading-tight line-clamp-2 font-medium text-[13px] mb-1">
                        Premium Denim Jacket
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-red-500 text-[13px]">
                          ৳2,700
                        </span>
                        <span className="text-[oklch(0.552_0.016_285.938)] line-through text-[11px]">
                          ৳3,600
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-4" />
            </div>
          </div>
          <div className="border-[oklch(0.92_0.004_286.32)] bg-white border-black/1 border-t-1 border-r-0 border-b-0 border-l-0 border-solid flex absolute inset-x-0 bottom-0 px-2 justify-around items-center h-16">
            <button className="flex flex-col items-center flex-1 gap-0.5">
              <Home className="size-5 text-[#56AEBF]" />
              <span className="font-semibold text-[#56AEBF] text-[10px]">
                Home
              </span>
            </button>
            <button className="flex flex-col items-center flex-1 gap-0.5">
              <ShoppingBag className="size-5 text-gray-500" />
              <span className="font-medium text-gray-500 text-[10px]">
                Shop
              </span>
            </button>
            <button className="relative flex flex-col items-center flex-1 gap-0.5">
              <div className="relative">
                <ShoppingCart className="size-5 text-gray-500" />
                <div className="rounded-full bg-red-500 flex absolute -right-1.5 -top-1.5 justify-center items-center w-4 h-4">
                  <span className="font-bold text-white text-[8px]">2</span>
                </div>
              </div>
              <span className="font-medium text-gray-500 text-[10px]">
                Cart
              </span>
            </button>
            <button className="flex flex-col items-center flex-1 gap-0.5">
              <User className="size-5 text-gray-500" />
              <span className="font-medium text-gray-500 text-[10px]">
                Account
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
