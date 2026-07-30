import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { getUsers } from "@/lib/queries";
import { ROLE_LABELS } from "@/lib/nav";
import { fmtDate } from "@/lib/format";

export default function Page() {
  const users = getUsers();
  return (
    <div>
      <PageHeader title="Users" subtitle="Everyone with access to the RFID Linen Management platform." />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Email</th>
              <th className="px-3 py-3 font-medium">Role</th>
              <th className="px-3 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{u.name}</td>
                <td className="px-3 py-3 text-slate-500">{u.email}</td>
                <td className="px-3 py-3 text-slate-600">{ROLE_LABELS[u.role] ?? u.role}</td>
                <td className="px-3 py-3 text-slate-500">{fmtDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
