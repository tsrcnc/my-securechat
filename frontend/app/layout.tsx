import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
    weight: ['400', '500', '600', '700'],
    subsets: ["latin"],
    variable: "--font-poppins"
});

export const metadata: Metadata = {
    title: "My SecureChat - Domain-Based Messaging",
    description: "Enterprise messaging platform with domain-based authentication",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1, interactive-widget=resizes-content",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${poppins.variable} font-sans`}>
                {children}
            </body>
        </html>
    );
}
