"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MedalBadge from "@/components/medal-badge";

type Medal = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Member = {
  id: string;
  name: string;
  email: string;
  bikeModel: string | null;
  role: "ADMIN" | "MEMBER";
  approved: boolean;
  verified: boolean;
  joinedAt: string;
  medals: { medalId: string; medal: Medal }[];
};

export default function MembersTable({
  members,
  medals,
}: {
  members: Member[];
  medals: Medal[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [awardFor, setAwardFor] = useState<string | null>(null);
  const [selectedMedal, setSelectedMedal] = useState<string>(
    medals[0]?.id ?? ""
  );
  const [error, setError] = useState<string | null>(null);

  async function patch(id: string, data: Record<string, unknown>) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setError(payload?.error || `Update failed (${res.status}).`);
      }
    } catch {
      setError("Network error — update may not have saved.");
    }
    setBusyId(null);
    router.refresh();
  }

  async function award(userId: string, medalId: string) {
    setBusyId(userId);
    await fetch("/api/admin/medals/award", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, medalId }),
    });
    setBusyId(null);
    setAwardFor(null);
    router.refresh();
  }

  async function revoke(userId: string, medalId: string) {
    setBusyId(userId);
    await fetch("/api/admin/medals/award", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, medalId }),
    });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="mt-5 overflow-x-auto">
      {error && (
        <p className="mb-3 rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      <table className="w-full min-w-[840px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-brz-line text-left text-xs uppercase tracking-wide text-brz-mute">
            <th className="py-2 pr-3">Rider</th>
            <th className="py-2 pr-3">Bike</th>
            <th className="py-2 pr-3">Approved</th>
            <th className="py-2 pr-3">Verified</th>
            <th className="py-2 pr-3">Role</th>
            <th className="py-2 pr-3">Medals</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b border-brz-line/60 align-top">
              <td className="py-3 pr-3">
                <p className="font-medium text-brz-white">{m.name}</p>
                <p className="text-xs text-brz-mute">{m.email}</p>
              </td>
              <td className="py-3 pr-3 text-brz-mute">
                {m.bikeModel || "—"}
              </td>
              <td className="py-3 pr-3">
                <Toggle
                  checked={m.approved}
                  disabled={busyId === m.id}
                  onChange={(v) => patch(m.id, { approved: v })}
                />
              </td>
              <td className="py-3 pr-3">
                <Toggle
                  checked={m.verified}
                  disabled={busyId === m.id}
                  onChange={(v) => patch(m.id, { verified: v })}
                />
              </td>
              <td className="py-3 pr-3">
                <select
                  value={m.role}
                  disabled={busyId === m.id}
                  onChange={(e) =>
                    patch(m.id, {
                      role: e.target.value as "ADMIN" | "MEMBER",
                    })
                  }
                  className="rounded-md border border-brz-line bg-brz-black px-2 py-1 text-xs text-brz-white"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td className="py-3 pr-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {m.medals.map((mm) => (
                    <button
                      key={mm.medalId}
                      onClick={() => revoke(m.id, mm.medalId)}
                      title="Click to remove"
                    >
                      <MedalBadge
                        icon={mm.medal.icon}
                        name={mm.medal.name}
                        color={mm.medal.color}
                      />
                    </button>
                  ))}
                  {awardFor === m.id ? (
                    <div className="flex items-center gap-1">
                      <select
                        value={selectedMedal}
                        onChange={(e) => setSelectedMedal(e.target.value)}
                        className="rounded-md border border-brz-line bg-brz-black px-1.5 py-1 text-xs text-brz-white"
                      >
                        {medals.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.icon} {med.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => award(m.id, selectedMedal)}
                        className="rounded-md bg-brz-red px-2 py-1 text-xs font-bold text-brz-black"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAwardFor(m.id)}
                      className="rounded-full border border-dashed border-brz-line px-2 py-0.5 text-xs text-brz-mute hover:border-brz-red hover:text-brz-red"
                    >
                      + medal
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={
        checked
          ? "rounded-full bg-green-600/20 px-3 py-1 text-xs font-semibold text-green-400"
          : "rounded-full bg-brz-steel px-3 py-1 text-xs font-semibold text-brz-mute"
      }
    >
      {checked ? "Yes" : "No"}
    </button>
  );
}
