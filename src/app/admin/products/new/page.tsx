import ProductForm from "@/components/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Tambah Produk</h2>
        <p className="text-sm text-slate-500">
          Tambahkan barang baru beserta foto dan video katalog
        </p>
      </div>

      <ProductForm
        mode="create"
        initialValues={{
          name: "",
          description: "",
          price: 0,
          stock: 0,
          readyStock: 0,
          allowPreOrder: true,
          pcsPerBal: 24,
          shippingFee: 0,
          brand: "",
          isActive: true,
          isFeatured: false,
          medias: [],
          tierPrices: [
            {
              minQty: 1,
              price: 0,
              label: "Retail",
            },
          ],
        }}
      />
    </div>
  );
}
