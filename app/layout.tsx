import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:'Bilal Saifi — Creative Portfolio',description:'Social strategy, AI-powered content and human-led storytelling.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><head><link rel="preload" href="/fonts/michroma.woff" as="font" type="font/woff" crossOrigin="anonymous"/><link rel="preload" href="/fonts/inter-regular.woff" as="font" type="font/woff" crossOrigin="anonymous"/></head><body>{children}</body></html>}
