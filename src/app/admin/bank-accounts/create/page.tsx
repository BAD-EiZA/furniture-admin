
import BankAccountForm from "@/components/bank-account-form";

export default async function CreateBankAccountPage() {


  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Tambah Rekening</h2>
        <p className="text-sm text-slate-500">
          Tambahkan rekening bank baru untuk checkout
        </p>
      </div>

      <BankAccountForm
        mode="create"
        initialValues={{
          bankName: "",
          accountName: "",
          accountNumber: "",
          label: "",
          isActive: true,
          sortOrder: 1,
        }}
      />
    </div>
  );
}
