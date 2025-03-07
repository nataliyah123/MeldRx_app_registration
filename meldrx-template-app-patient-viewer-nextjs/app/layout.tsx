// "use client";

// import './globals.css';
// import { Inter } from 'next/font/google';
// const inter = Inter({ subsets: ['latin'] });
// import { AppProvider } from '@/lib/hooks/AppContext/AppProvider';

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <title>MeldRx Patient Sphere</title>
//       <body className={inter.className}>
//         <AppProvider>
//           {children}
//         </AppProvider>
//       </body>
//     </html>
//   )
// }

"use client";

import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import { AppProvider } from "@/lib/hooks/AppContext/AppProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>MeldRx Patient Sphere</title>
      </head>
      <body
        className={`${inter.className} bg-gray-100`}
        
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
