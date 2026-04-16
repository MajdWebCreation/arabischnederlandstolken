import "../globals.css";
import { baseFontVariables } from "@/lib/fonts";

export default function RedirectLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${baseFontVariables} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
