import { Stack, Typography } from "@mui/material";
import { useNavigator } from "../AppRouter";

export function Root() {
  const navigate = useNavigator();

  return (
    <Stack>
      <Typography variant="h6">Lumina</Typography>
    </Stack>
  );
}
