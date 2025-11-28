"use client"

import PageTransitionLoader from "@modules/common/components/page-transition-loader"

export default function RootProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PageTransitionLoader />
      {children}
    </>
  )
}