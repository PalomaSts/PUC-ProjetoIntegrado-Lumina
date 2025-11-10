// src/pages/Profile.tsx
import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

type User = {
  id: string;
  name: string;
  email: string;
  picture?: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', picture: '', currentPassword: '', newPassword: '' });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/auth/me`, {
          credentials: 'include',
        });
        if (!res.ok) {
          setUser(null);
          setError('Não autenticado');
          setLoading(false);
          return;
        }
        const u = await res.json();
        setUser(u);
        setForm((f) => ({ ...f, name: u?.name || '', picture: u?.picture || '' }));
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar usuário');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSaveProfile = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/auth/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: form.name, picture: form.picture }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.message || `Erro: ${res.status}`);
        setSaving(false);
        return;
      }
      const updated = await res.json();
      setUser(updated);
      setSuccess('Perfil atualizado com sucesso');
    } catch (err: any) {
      setError(err.message || 'Erro de rede');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!form.newPassword) {
      setError('Informe a nova senha');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/auth/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.message || `Erro: ${res.status}`);
        setSaving(false);
        return;
      }
      const updated = await res.json();
      setUser(updated);
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '' }));
      setSuccess('Senha atualizada com sucesso');
    } catch (err: any) {
      setError(err.message || 'Erro de rede');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box p={4}>Carregando...</Box>;

  if (!user) {
    return (
      <Box p={4}>
        <Alert severity="warning">Usuário não autenticado — faça login.</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Login
        </Button>
      </Box>
    );
  }

  return (
    <Box maxWidth={600} mx="auto" mt={4} p={3}>
      <Typography variant="h5">Meu perfil</Typography>

      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ my: 2 }}>{success}</Alert>}

      <TextField
        label="Nome"
        name="name"
        fullWidth
        margin="normal"
        value={form.name}
        onChange={handleChange}
      />
      <TextField
        label="Picture (URL)"
        name="picture"
        fullWidth
        margin="normal"
        value={form.picture}
        onChange={handleChange}
      />

      <Box mt={2} display="flex" gap={2}>
        <Button variant="contained" onClick={handleSaveProfile} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar perfil'}
        </Button>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </Box>

      <Box mt={4}>
        <Typography variant="h6">Alterar senha</Typography>
        <TextField
          label="Senha atual"
          name="currentPassword"
          type="password"
          fullWidth
          margin="normal"
          value={form.currentPassword}
          onChange={handleChange}
        />
        <TextField
          label="Nova senha"
          name="newPassword"
          type="password"
          fullWidth
          margin="normal"
          value={form.newPassword}
          onChange={handleChange}
        />
        <Box mt={2}>
          <Button variant="contained" onClick={handleChangePassword} disabled={saving}>
            {saving ? 'Processando...' : 'Mudar senha'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
