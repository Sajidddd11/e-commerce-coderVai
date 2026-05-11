"use client"

import { useState, useRef, useEffect } from "react"
import { clx } from "@medusajs/ui"

const DISTRICTS = [
    "Dhaka", "Savar", "Nabinagar", "Ashulia", "Keraniganj", "Tongi",
    "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra",
    "Brahmanbaria", "Chandpur", "Chapainawabganj", "Chittagong", "Chuadanga",
    "Comilla", "Coxs Bazar", "Dinajpur", "Faridpur", "Feni", "Gaibandha",
    "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jessore", "Jhalokathi",
    "Jhenaidah", "Joypurhat", "Khagrachari", "Khulna", "Kishoreganj",
    "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur",
    "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj",
    "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi",
    "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna",
    "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi",
    "Rangamati", "Rangpur", "Satkhria", "Shariatpur", "Sherpur",
    "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon"
]

type DistrictSelectProps = {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    required?: boolean
    name?: string
    "data-testid"?: string
}

export default function DistrictSelect({
    value,
    onChange,
    required = false,
    name = "shipping_address.city",
    "data-testid": dataTestId
}: DistrictSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [inputValue, setInputValue] = useState(value || "")
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Update input value when prop value changes
    useEffect(() => {
        setInputValue(value || "")
    }, [value])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearchTerm("")
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const filteredDistricts = DISTRICTS.filter(district =>
        district.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSelect = (district: string) => {
        setInputValue(district)
        setIsOpen(false)
        setSearchTerm("")

        // Trigger onChange event with the selected district
        const syntheticEvent = {
            target: {
                name: name,
                value: district
            }
        } as React.ChangeEvent<HTMLInputElement>

        onChange(syntheticEvent)
    }

    const handleInputClick = () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            setSearchTerm("")
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setIsOpen(true)
    }

    return (
        <div className="flex flex-col w-full">
            <div ref={containerRef} className={clx("flex relative w-full txt-compact-medium", {
                "z-50": isOpen,
                "z-0": !isOpen
            })}>
                {/* Hidden input for form submission */}
                <input
                    type="hidden"
                    name={name}
                    value={inputValue}
                    required={required}
                />

                {/* Display input - matches Input component styling exactly */}
                <input
                    ref={inputRef}
                    type="text"
                    value={isOpen ? searchTerm : inputValue}
                    onChange={handleSearchChange}
                    onClick={handleInputClick}
                    placeholder=" "
                    className={clx(
                        "block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover cursor-pointer",
                        {
                            "pt-4 pb-1": !inputValue && !isOpen,
                            "py-2": inputValue || isOpen
                        }
                    )}
                    data-testid={dataTestId}
                    autoComplete="off"
                />

                {/* Floating label - only show when empty and closed */}
                {!inputValue && !isOpen && (
                    <label
                        onClick={() => inputRef.current?.focus()}
                        className="flex items-center justify-center mx-3 px-1 transition-all absolute duration-300 -z-1 origin-0 text-ui-fg-subtle top-3"
                    >
                        Select District
                        {required && <span className="text-rose-500">*</span>}
                    </label>
                )}

                {/* Dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                        className={clx("w-4 h-4 text-ui-fg-subtle transition-transform", {
                            "transform rotate-180": isOpen
                        })}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Dropdown list */}
                {isOpen && (
                    <div className="absolute z-[100] w-full top-full mt-1 bg-white border border-ui-border-base rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredDistricts.length > 0 ? (
                            filteredDistricts.map((district) => (
                                <div
                                    key={district}
                                    onClick={() => handleSelect(district)}
                                    className={clx(
                                        "px-4 py-2 cursor-pointer text-sm hover:bg-ui-bg-subtle",
                                        {
                                            "bg-ui-bg-field": district === inputValue
                                        }
                                    )}
                                >
                                    {district}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-ui-fg-subtle">
                                No districts found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
