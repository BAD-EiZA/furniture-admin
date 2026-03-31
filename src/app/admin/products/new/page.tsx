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

      <ProductForm mode="create" />
    </div>
  );
}
