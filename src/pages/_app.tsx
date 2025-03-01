import "@/styles/globals.css";
import type { AppProps } from "next/app";
import localFont from 'next/font/local'
import { Toaster } from "@/components/ui/sonner"

const myFont = localFont({
  src: [
    {
      path: '../../fonts/DegularDisplay-Black.otf',
      weight: '900',
      style: 'black'
    },
    {
      path: '../../fonts/DegularDisplay-Light.otf',
      weight: '300',
      style: 'light'
    },
    {
      path: '../../fonts/DegularDisplay-Medium.otf',
      weight: '500',
      style: 'medium'
    },
    {
      path: '../../fonts/DegularDisplay-Regular.otf',
      weight: '400',
      style: 'regular'
    }
  ],
  variable: '--font-degular' // Add this to use as CSS variable
})


export default function App({ Component, pageProps }: AppProps) {
  return <main className={`${myFont.className} ${myFont.variable}`}>
    <Component {...pageProps} />
    <Toaster />
  </main>
}
