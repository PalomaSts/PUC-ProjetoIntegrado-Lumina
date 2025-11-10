import {
  BarChart,
  PieChart,
  Person as ProfileIcon,
  BackupTable as ProjectsIcon,
  FormatListBulleted as TasksIcon,
} from "@mui/icons-material";
import { Grid2 as Grid, Paper, Stack, SxProps, Typography, LinearProgress, Box } from "@mui/material";
import { PropsWithChildren, useEffect, useState } from "react";
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
  const [last24h, setLast24h] = useState<number>(0);
  const [completedStats, setCompletedStats] = useState<{ total: number; completed: number }>({
    total: 0,
    completed: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const res1 = await fetch(`${process.env.REACT_APP_SERVER_URL}/tasks/stats/last24h`, {
          credentials: "include",
        });
        if (res1.ok) {
          const data = await res1.json();
          setLast24h(data.count || 0);
        }

        const res2 = await fetch(`${process.env.REACT_APP_SERVER_URL}/tasks/stats/completion`, {
          credentials: "include",
        });
        if (res2.ok) {
          const data = await res2.json();
          setCompletedStats(data);
        }
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    })();
  }, []);

  return (
    <Stack spacing={3}>
      <Grid container spacing={5}>
        <Grid size={6}>
          <TopBtn>
            <BarChart sx={{ fontSize: 80 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              {last24h} tasks in the last 24h
            </Typography>
          </TopBtn>
        </Grid>
        <Grid size={6}>
          <TopBtn>
            <PieChart sx={{ fontSize: 80 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              {completedStats.completed} / {completedStats.total} Completed
            </Typography>

            {/* barra de progresso (opcional) */}
            <Box sx={{ width: "80%", mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={
                  completedStats.total > 0
                    ? (completedStats.completed / completedStats.total) * 100
                    : 0
                }
              />
            </Box>
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
