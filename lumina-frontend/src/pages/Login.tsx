import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Link as MuiLink,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useNavigator } from "../AppRouter";
import { useAuthContext } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigator();
  const { signInUser } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e?: any) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.message || "Erro ao efetuar login");
        setLoading(false);
        return;
      }

      const { user } = await res.json();
      if (user) {
        signInUser(user);
        navigate("/home");
      } else {
        setError("Resposta inválida do servidor");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box width={380}>
        <Stack spacing={2}>
          <Typography variant="h5">Entrar</Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            autoComplete="email"
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            autoComplete="current-password"
          />

          <Button
            variant="contained"
            onClick={submit}
            disabled={loading || !email || !password}
            fullWidth
          >
            Entrar
          </Button>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <MuiLink
              component="button"
              onClick={() => {
                navigate("/register");
              }}
              underline="hover"
            >
              Criar conta
            </MuiLink>
            <MuiLink
              component="button"
              onClick={() => {
                window.location.href = `${process.env.REACT_APP_SERVER_URL}/auth/google`;
              }}
              underline="hover"
            >
              Entrar com Google
            </MuiLink>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
