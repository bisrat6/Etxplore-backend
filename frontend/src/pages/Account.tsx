import { FormEvent, useEffect, useRef, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { me as apiMe, updateMyPassword as apiUpdateMyPassword } from '../api/auth';
import { updateMe as apiUpdateMe, updateMeJson } from '../api/users';

export default function Account() {
  const { user, logout } = useAuth();
  const [me, setMe] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const currentRef = useRef<HTMLInputElement>(null);
  const newRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiMe().then((res) => setMe(res.data.data?.data ?? res.data.data?.user ?? res.data.data ?? null));
  }, []);
  return (
    <div>
      <h2>My Account</h2>
      <div>Session user:</div>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <div>API /users/me:</div>
      <pre>{JSON.stringify(me, null, 2)}</pre>
      <hr />
      <h3>Update profile</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form
        onSubmit={async (e: FormEvent) => {
          e.preventDefault();
          setSaving(true);
          setError(null);
          try {
            const hasFile = Boolean(photoRef.current?.files && photoRef.current.files[0]);
            if (hasFile) {
              const form = new FormData();
              if (nameRef.current?.value) form.append('name', nameRef.current.value);
              if (emailRef.current?.value) form.append('email', emailRef.current.value);
              form.append('photo', photoRef.current!.files![0]);
              await apiUpdateMe(form);
            } else {
              await updateMeJson({
                name: nameRef.current?.value ?? undefined,
                email: emailRef.current?.value ?? undefined
              });
            }
            const res = await apiMe();
            setMe(res.data.data?.data ?? res.data.data?.user ?? res.data.data ?? null);
          } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to update profile');
          } finally {
            setSaving(false);
          }
        }}
        style={{ display: 'grid', gap: 8, maxWidth: 360 }}
      >
        <input defaultValue={me?.name ?? ''} placeholder="Name" ref={nameRef} />
        <input defaultValue={me?.email ?? ''} placeholder="Email" ref={emailRef} />
        <input type="file" accept="image/*" ref={photoRef} />
        <button disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>
      <h3>Update password</h3>
      {pwdMsg && <div style={{ color: 'green' }}>{pwdMsg}</div>}
      <form
        onSubmit={async (e: FormEvent) => {
          e.preventDefault();
          setPwdMsg(null);
          try {
            await apiUpdateMyPassword({
              passwordCurrent: currentRef.current?.value ?? '',
              password: newRef.current?.value ?? '',
              passwordConfirm: confirmRef.current?.value ?? ''
            });
            setPwdMsg('Password updated successfully');
            if (currentRef.current) currentRef.current.value = '';
            if (newRef.current) newRef.current.value = '';
            if (confirmRef.current) confirmRef.current.value = '';
          } catch (err: any) {
            setPwdMsg(err?.response?.data?.message ?? 'Failed to update password');
          }
        }}
        style={{ display: 'grid', gap: 8, maxWidth: 360, marginTop: 12 }}
      >
        <input ref={currentRef} placeholder="Current password" type="password" />
        <input ref={newRef} placeholder="New password" type="password" />
        <input ref={confirmRef} placeholder="Confirm new password" type="password" />
        <button>Change password</button>
      </form>
      <button onClick={logout}>Logout</button>
    </div>
  );
}



