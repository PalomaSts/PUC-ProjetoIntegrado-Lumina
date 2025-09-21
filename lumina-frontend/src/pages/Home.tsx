import {
  BarChart,
  PieChart,
  Person as ProfileIcon,
  BackupTable as ProjectsIcon,
  FormatListBulleted as TasksIcon,
} from "@mui/icons-material";
import { Grid2 as Grid, Paper, Stack, SxProps, Typography } from "@mui/material";
import { PropsWithChildren } from "react";
import { useNavigator } from "../AppRouter";

const btnStyles: SxProps = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const TopBtn = ({ children }: PropsWithChildren) => (
  <Paper
    elevation={6}
    sx={{
      ...btnStyles,
    }}
  >
    <Stack spacing={1} p={10} alignItems={"center"} justifyContent={"center"}>
      {children}
    </Stack>
  </Paper>
);

const BottomBtn = ({ children, ...props }: PropsWithChildren & any) => (
  <Paper
    {...props}
    variant="outlined"
    sx={{
      ...btnStyles,
      cursor: "pointer",
      "&:hover": { boxShadow: 4 },
    }}
  >
    <Stack spacing={1} p={6} alignItems={"center"} justifyContent={"center"}>
      {children}
    </Stack>
  </Paper>
);

export function Home() {
  const navigator = useNavigator();
  return (
    <Stack spacing={3}>
      <Grid container spacing={5}>
        <Grid size={6}>
          <TopBtn>
            <BarChart sx={{ fontSize: 80 }} />
            <Typography>X in the last 24h</Typography>
          </TopBtn>
        </Grid>
        <Grid size={6}>
          <TopBtn>
            <PieChart sx={{ fontSize: 80 }} />
            <Typography>X / Y Completed</Typography>
          </TopBtn>
        </Grid>
      </Grid>
      <Grid container spacing={5}>
        <Grid size={4}>
          <BottomBtn onClick={() => navigator("/tasks")}>
            <TasksIcon sx={{ fontSize: 80 }} />
            <Typography>My Tasks</Typography>
          </BottomBtn>
        </Grid>
        <Grid size={4}>
          <BottomBtn onClick={() => navigator("/projects")}>
            <ProjectsIcon sx={{ fontSize: 80 }} />
            <Typography>Projects</Typography>
          </BottomBtn>
        </Grid>
        <Grid size={4}>
          <BottomBtn onClick={() => navigator("/profile")}>
            <ProfileIcon sx={{ fontSize: 80 }} />
            <Typography>Profile</Typography>
          </BottomBtn>
        </Grid>
      </Grid>
    </Stack>
  );
}
