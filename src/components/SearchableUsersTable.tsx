"use client";

import { ClientTableSearch } from "@/components/ClientTableSearch";
import { ROLE_LABELS } from "@/lib/nav";
import { fmtDate } from "@/lib/format";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export function SearchableUsersTable({ users }: { users: User[] }) {
  const roles = [...new Set(users.map((u) => u.role))].sort();

  return (
    <ClientTableSearch
      rows={users}
      getSearchText={(u) => `${u.name} ${u.email} ${ROLE_LABELS[u.role] ?? u.role}`}
      searchPlaceholder="Search name or email..."
      filters={[
        {
          key: "role",
          label: "All Roles",
          getValue: (u) => u.role,
          options: roles.map((r) => ({ value: r, label: ROLE_LABELS[r] ?? r })),
        },
      ]}
      emptyMessage="No users match your search."
      exportFilename="users"
    >
      {(filtered) => (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-[var(--muted)] uppercase tracking-wider">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Email</th>
              <th className="px-3 py-3 font-medium">Role</th>
              <th className="px-3 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-[var(--surface-hover)]">
                <td className="px-5 py-3 font-medium text-[var(--foreground)]">{u.name}</td>
                <td className="px-3 py-3 text-[var(--muted)]">{u.email}</td>
                <td className="px-3 py-3 text-[var(--muted)]">{ROLE_LABELS[u.role] ?? u.role}</td>
                <td className="px-3 py-3 text-[var(--muted)]">{fmtDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ClientTableSearch>
  );
}
