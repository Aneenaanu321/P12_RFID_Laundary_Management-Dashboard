import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SearchableUsersTable } from "@/components/SearchableUsersTable";
import { getUsers } from "@/lib/queries";

export default function Page() {
  const users = getUsers();
  return (
    <div>
      <PageHeader title="Users" subtitle="Everyone with access to the RFID Linen Management platform." />
      <Card>
        <SearchableUsersTable users={users} />
      </Card>
    </div>
  );
}
