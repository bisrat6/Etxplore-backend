import { FormEvent, useState } from 'react';
import { updateMyPassword } from '../api/auth';

export default function UpdatePassword() {
  const [passwordCurrent, setPasswordCurrent] = useState('test1234');
  const [password, setPassword] = useState('newpass123');
  const [passwordConfirm, setPasswordConfirm] = useState('newpass123');
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await updateMyPassword({ passwordCurrent, password, passwordConfirm });
    setMsg(res.data.message ?? 'Password updated');
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
      <h2>Update Password</h2>
      {msg && <div style={{ color: 'green' }}>{msg}</div>}
      <input placeholder="Current password" type="password" value={passwordCurrent} onChange={(e) => setPasswordCurrent(e.target.value)} />
      <input placeholder="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input placeholder="Confirm password" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
      <button>Update</button>
    </form>
  );
}



