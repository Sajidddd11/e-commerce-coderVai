import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import RootProvider from "@modules/common/components/root-provider"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  icons: {
    icon: "/Final Logo BW.png",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body className="m-0 p-0" suppressHydrationWarning>
        <RootProvider>
          <main className="relative m-0 p-0">{props.children}</main>
        </RootProvider>
      </body>
    </html>
  )
}
