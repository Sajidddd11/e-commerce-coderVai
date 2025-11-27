import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import RootProvider from "@modules/common/components/root-provider"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <RootProvider>
          <main className="relative">{props.children}</main>
        </RootProvider>
      </body>
    </html>
  )
}
