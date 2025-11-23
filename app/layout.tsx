import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
// import { CartProvider } from "@/components/providers/CartProvider";
import Layout from "@/components/(non-authenticated)/Layout";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CheckoutProvider } from "@/components/providers/CheckoutProvider";
import { ModalProvider } from "@/components/providers/ModalStateProvider";
import { ShippingInfoProvider } from "@/components/providers/ShippingInfoProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import ReduxProvider from "@/components/ReduxProvider";
import { Toaster as ToasterReactHot } from "react-hot-toast";
import { ToastContainer } from "react-toastify";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ETECH",
  description:
    "ETECH is your trusted source for innovative tech solutions, products, and services that power the future. Discover cutting-edge electronics, gadgets, and expert support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <GoogleOAuthProvider clientId={`${process.env.GOOGLE_CLIENT_ID}`}> */}
        <ModalProvider>
          <ReduxProvider>
            <AuthProvider>
              <WishlistProvider>
                <ShippingInfoProvider>
                  {/* <CartProvider> */}
                  <CheckoutProvider>
                    <Layout>{children}</Layout>
                    <ToastContainer />
                    <Toaster />
                    <ToasterReactHot />
                  </CheckoutProvider>
                  {/* </CartProvider> */}
                </ShippingInfoProvider>
              </WishlistProvider>
            </AuthProvider>
          </ReduxProvider>
        </ModalProvider>
        {/* </GoogleOAuthProvider> */}
        <Script src="https://kit.fontawesome.com/deb7916e2f.js"></Script>
      </body>
    </html>
  );
}
