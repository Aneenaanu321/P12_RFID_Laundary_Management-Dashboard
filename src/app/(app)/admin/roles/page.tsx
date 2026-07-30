import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { ROLE_PERMISSIONS, ROLE_LABELS } from "@/lib/nav";
import { Check, Minus } from "lucide-react";

const PERMISSIONS = ["dashboard", "inventory", "rfid", "laundry", "customers", "reports", "accounting", "administration"];

export default function Page() {
  return (
    <div>
      <PageHeader title="Roles & Permissions" subtitle="Section-level access granted to each role." />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Role</th>
                {PERMISSIONS.map((p) => (
                  <th key={p} className="px-3 py-3 font-medium capitalize text-center">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
                <tr key={role} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{ROLE_LABELS[role]}</td>
                  {PERMISSIONS.map((p) => (
                    <td key={p} className="px-3 py-3 text-center">
                      {perms.includes(p) ? <Check size={15} className="text-green-600 inline" /> : <Minus size={15} className="text-slate-300 inline" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
