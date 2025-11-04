// WHY: Admin page to manage Container Types
// WHAT: List existing types and provide a form to add new ones

import { listContainerTypes, createContainerType } from "@/app/actions/containerTypeActions";
import { AddContainerTypeForm } from "@/components/admin/AddContainerTypeForm";

export const dynamic = "force-dynamic";

export default async function ContainerTypesAdminPage() {
  const types = await listContainerTypes();

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Container Types</h1>

      <section className="mb-8 rounded border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-xl font-semibold">Add New Type</h2>
        <AddContainerTypeForm action={createContainerType} />
      </section>

      <section className="rounded border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Existing Types</h2>
        {types.length === 0 ? (
          <p className="text-sm text-gray-500">No types yet. Add one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                  <th className="p-2">Name</th>
                  <th className="p-2">Prefix</th>
                  <th className="p-2">Icon</th>
                  <th className="p-2">Dimensions</th>
                </tr>
              </thead>
              <tbody>
                {types.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="p-2 font-medium">{t.name}</td>
                    <td className="p-2">{t.codePrefix}</td>
                    <td className="p-2">{t.iconKey || "—"}</td>
                    <td className="p-2">
                      {t.length || t.width || t.height
                        ? `${t.length ?? "?"} × ${t.width ?? "?"} × ${t.height ?? "?"}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
