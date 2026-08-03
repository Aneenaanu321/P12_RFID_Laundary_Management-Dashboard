import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function Page() {
  return (
    <div>
      <PageHeader title="System Settings" subtitle="Organization-wide configuration for the RFID Linen Management platform." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="General" />
          <div className="px-5 pb-5 space-y-3 text-sm">
            <label className="block">
              <span className="text-xs text-slate-500">Organization Name</span>
              <Input defaultValue="RFID Linen Management" className="mt-1 py-2" />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Default Currency</span>
              <Input defaultValue="AED" className="mt-1 py-2" />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Missing Item Threshold (days)</span>
              <Input defaultValue={2} type="number" className="mt-1 py-2" />
            </label>
          </div>
        </Card>
        <Card>
          <CardHeader title="Notifications" />
          <div className="px-5 pb-5 space-y-3 text-sm">
            {["Critical wash-limit alerts", "Missing item alerts", "Reader offline alerts", "Daily batch summary"].map((label) => (
              <label key={label} className="flex items-center justify-between">
                <span className="text-slate-600">{label}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600" />
              </label>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
