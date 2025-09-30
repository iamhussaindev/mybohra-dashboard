import React from 'react'
import ScrollButton from '@components/ui/atoms/ScrollButton'
import Header from '@components/layout/Header'
import Footer from '@components/layout/Footer'
import Reveal from '@components/shared/Reveal'

const Layout = ({ children }: { children: React.ReactNode; footer?: boolean }) => {
  return (
    <div className="mx-auto flex w-full flex-grow flex-col min-h-[100dvh]">
      <ScrollButton />
      <Header />
      <Reveal>{children}</Reveal>
      <Footer />
    </div>
  )
}

export default Layout
