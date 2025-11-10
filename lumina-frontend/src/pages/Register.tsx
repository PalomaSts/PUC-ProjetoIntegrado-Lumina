// src/pages/Register.tsx
import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name || !form.email || !form.password) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.message || `Erro: ${res.status}`);
        setLoading(false);
        return;
      }

      const user = await res.json();
      setSuccess(`Cadastro realizado com sucesso ${user.name}!`);
      // opcional: navegar para tela de login
      setTimeout(() => navigate('/home'), 800);
    } catch (err: any) {
      setError(err.message || 'Erro de rede');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={480} mx="auto" mt={6} p={3}>
      <Typography variant="h5" gutterBottom>
        Registrar conta local
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Nome"
          name="name"
          fullWidth
          margin="normal"
          value={form.name}
          onChange={handleChange}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          fullWidth
          margin="normal"
          value={form.email}
          onChange={handleChange}
        />
        <TextField
          label="Senha"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          value={form.password}
          onChange={handleChange}
        />
        <TextField
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          fullWidth
          margin="normal"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <Box mt={2} display="flex" gap={2}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Registrar'}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/login')}>
            Ir para login
          </Button>
        </Box>
      </form>
    </Box>
  );
}
