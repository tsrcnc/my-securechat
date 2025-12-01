import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "My SecureChat - Domain-Based Messaging",
    description: "Enterprise messaging platform with domain-based authentication",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
