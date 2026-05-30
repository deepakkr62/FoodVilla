"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, MapPin, Phone, Plus, Save, User } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { AddressFormModal, type AddressFormValue } from "@/components/AddressFormModal";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
  type Address,
} from "@/lib/addressApi";
import { useAuth } from "@/lib/authStore";
import { updateProfile } from "@/lib/profileApi";
import { toApiError } from "@/lib/api";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileInner />
    </AuthGuard>
  );
}

function ProfileInner() {
  const user = useAuth((s) => s.user);
  const setAuth = useAuth((s) => s.setAuth);
  const accessToken = useAuth((s) => s.accessToken);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? "");
      setAvatarUrl(user.avatarUrl ?? "");
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        setAddresses(await listAddresses());
      } finally {
        setAddrLoading(false);
      }
    })();
  }, []);

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setSaving(true);
    try {
      const updated = await updateProfile({ name, phone, avatarUrl });
      if (accessToken) setAuth(updated, accessToken);
      setOk("Profile saved");
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddressSubmit(value: AddressFormValue) {
    if (editing) {
      setAddresses(await updateAddress(editing._id, value));
    } else {
      setAddresses(await createAddress(value));
    }
  }

  async function handleAddressDelete(id: string) {
    if (!confirm("Delete this address?")) return;
    setAddresses(await deleteAddress(id));
  }

  if (!user) return null;

  return (
    <div className="container-narrow grid gap-6 py-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold">Your profile</h1>
          <p className="text-sm text-ink-muted">
            Manage your name, phone and avatar.
          </p>
        </header>

        <form onSubmit={onSaveProfile} className="card space-y-4 p-6">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-cream-dark">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={name || "avatar"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-display font-semibold text-brand-700">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-ink-muted">Signed in as</p>
              <p className="font-display text-base font-semibold">{user.email}</p>
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                {user.role === "restaurant_owner" ? "Restaurant owner" : "Customer"}
              </p>
            </div>
          </div>

          <Field label="Display name" icon={<User size={14} />}>
            <input
              required
              minLength={2}
              maxLength={80}
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Email" icon={<Mail size={14} />}>
            <input
              className="input bg-cream"
              value={user.email}
              readOnly
              aria-readonly
            />
          </Field>
          <Field label="Phone" icon={<Phone size={14} />}>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="Avatar URL">
            <input
              className="input"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
            />
          </Field>

          {error && (
            <div role="alert" className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
              {error}
            </div>
          )}
          {ok && (
            <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {ok}
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save profile
            </button>
          </div>
        </form>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <MapPin size={16} className="text-brand-500" /> Addresses
            </h2>
            <button
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              className="btn-ghost"
            >
              <Plus size={14} /> Add
            </button>
          </header>

          {addrLoading ? (
            <div className="flex h-20 items-center justify-center text-ink-muted">
              <Loader2 className="animate-spin" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-cream-dark p-5 text-center text-sm text-ink-muted">
              No saved addresses yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {addresses.map((a) => (
                <li key={a._id} className="rounded-xl border border-cream-dark p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {a.label || "Address"}
                        {a.isDefault && (
                          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-ink-muted">
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ""}
                        <br />
                        {a.city}
                        {a.state ? `, ${a.state}` : ""} {a.postalCode}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1 text-right">
                      <button
                        className="text-xs text-ink-muted hover:text-brand-600"
                        onClick={() => {
                          setEditing(a);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs text-ink-muted hover:text-red-600"
                        onClick={() => handleAddressDelete(a._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <AddressFormModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddressSubmit}
      />
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-ink-soft">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
