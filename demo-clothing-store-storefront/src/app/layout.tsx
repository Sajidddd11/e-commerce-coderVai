import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import Script from "next/script"
import RootProvider from "@modules/common/components/root-provider"
import WhatsAppChatButton from "@modules/common/components/whatsapp-chat-button"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "facebook-domain-verification": "5o1vb0pkq3rn3346giou710ut8jo9c",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body className="m-0 p-0" suppressHydrationWarning>
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              // Only initialize once
              if (!window._fbq_initialized) {
                fbq('init', '875095208469171');
                fbq('track', 'PageView');
                window._fbq_initialized = true;
              }
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=875095208469171&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}

        <RootProvider>
          <main className="relative m-0 p-0">{props.children}</main>
          <WhatsAppChatButton />
        </RootProvider>
      </body>
    </html>
  )
}
