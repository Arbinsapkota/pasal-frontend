import Header from "@/components/(non-authenticated)/Header";
import ProductDetails from "@/components/(non-authenticated)/ProductInfo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ETECH Product Details",
  description: "Explore detailed specifications and features of your favorite tech products on ETECH.",
};

async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const productId = (await params).productId;

  return (
    <div>
      <Header />

      <div className="w-full bg-white  rounded shadow-lg flex flex-col relative">
        <ProductDetails productId={productId} />
      </div>
    </div>
  );
}

export default ProductPage;
