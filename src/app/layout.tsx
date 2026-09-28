import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TODO EN UNO VIRAL AI",
  description: "Genera videos virales de 70 segundos sobre cualquier persona o tema",
}

export default function RootLayout({ children } : { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans">{children}</body>
    </html>
  )
}
