import { FormEvent, useState } from 'react';
import { signup as apiSignup } from '../api/auth';
import { useAuth } from '../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('New User');
  const [email, setEmail] = useState('newuser@example.com');
  const [password, setPassword] = useState('test1234');
  const [passwordConfirm, setPasswordConfirm] = useState('test1234');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiSignup({ name, email, password, passwordConfirm });
      await login(email, password);
      navigate('/account');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
      <h2>Signup</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input placeholder="Confirm password" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
      <button disabled={loading}>{loading ? 'Signing up...' : 'Signup'}</button>
    </form>
  );
}



