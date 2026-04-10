import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

import BankAccountForm from "@/components/bank-account-form";

export default async function EditBankAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const bankAccount = await prisma.bankAccount.findUnique({
    where: { id },
  });

  if (!bankAccount) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Edit Rekening</h2>
        <p className="text-sm text-slate-500">
          Perbarui data rekening bank untuk checkout
        </p>
      </div>

      <BankAccountForm
        mode="edit"
        bankAccountId={bankAccount.id}
        initialValues={{
          bankName: bankAccount.bankName,
          accountName: bankAccount.accountName,
          accountNumber: bankAccount.accountNumber,
          label: bankAccount.label || "",
          isActive: bankAccount.isActive,
          sortOrder: bankAccount.sortOrder,
        }}
      />
    </div>
  );
}
