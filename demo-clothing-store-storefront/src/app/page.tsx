import { Metadata } from "next"

export const metadata: Metadata = {
    title: "ZAHAN Fashion and Lifestyle",
    description: "Discover our curated collection of premium clothing and accessories.",
}

/**
 * This page exists primarily for Facebook domain verification.
 * Normal users are redirected to their country-specific page via middleware.
 * Only Facebook's crawler accesses this page directly.
 */
export default function RootPage() {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            fontFamily: "system-ui, sans-serif"
        }}>
            <div style={{ textAlign: "center" }}>
                <h1>ZAHAN Fashion and Lifestyle</h1>
                <p>Redirecting...</p>
            </div>
        </div>
    )
}
