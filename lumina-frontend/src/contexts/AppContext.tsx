import {
  DarkMode as DarkModeIcon,
  ArrowBack as GoBackIcon,
  Home as HomeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as ProfileIcon,
  BackupTable as ProjectsIcon,
  FormatListBulleted as TasksIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Button,
  Container,
  createTheme,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  SxProps,
  Theme,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { RouterPaths, useNavigator, useRouteMatch } from "../AppRouter";
import { useAuthContext } from "./AuthContext";

const menuItemBtnStyles: SxProps = { borderRadius: "50%", width: "64px", height: "64px" };

type ThemeContextProps = {
  theme: Theme;
  title: string;
  setTitle: (t: string) => void;
};

export const ThemeContext = createContext<ThemeContextProps>({
  theme: {} as Theme,
  title: "",
  setTitle: (t: string) => {},
});

export function AppProvider({ children }: PropsWithChildren) {
  const navigator = useNavigator();
  const routeMatch = useRouteMatch();
  const routeTitle = routeMatch?.title;
  const { user, signOutUser } = useAuthContext();

  const [pageTitle, setPageTitle] = useState("");

  const [dark, setDark] = useState(Boolean(localStorage.getItem("dark")) || false);
  const [lightTheme] = useState(
    createTheme({
      cssVariables: true,
    })
  );
  const [darkTheme] = useState(
    createTheme({
      cssVariables: true,
      palette: {
        mode: "dark",
      },
    })
  );

  const [anchorAvatarEl, setAnchorAvatarEl] = useState<null | HTMLElement>();
  const avatarOpen = Boolean(anchorAvatarEl);
  const [anchorRoutesEl, setAnchorRoutesEl] = useState<null | HTMLElement>();
  const routesOpen = Boolean(anchorRoutesEl);

  const activeTheme = dark ? darkTheme : lightTheme;

  const menuItems: { title: string; icon: any; route: RouterPaths; variant?: "text" | "outlined" | "contained" }[] = [
    {
      title: "Home",
      icon: <HomeIcon />,
      route: "/home",
      variant: "outlined",
    },
    {
      title: "Tasks",
      icon: <TasksIcon />,
      route: "/tasks",
      variant: "outlined",
    },
    {
      title: "Projects",
      icon: <ProjectsIcon />,
      route: "/projects",
      variant: "outlined",
    },
    {
      title: "Profile",
      icon: <ProfileIcon />,
      route: "/profile",
      variant: "outlined",
    },
  ];

  const contextProps: ThemeContextProps = {
    theme: activeTheme,
    title: String(pageTitle || routeTitle || ""),
    setTitle: setPageTitle,
  };

  return (
    <ThemeContext.Provider value={contextProps}>
      <ThemeProvider theme={activeTheme}>
        <Stack bgcolor={activeTheme.palette.background.default}>
          <Stack direction={"row"} padding={3} justifyContent={"space-between"} alignItems={"center"}>
            <Stack direction={"row"} spacing={2}>
              {routeMatch?.showBackBtn && (
                <IconButton onClick={() => navigator(-1)}>
                  <GoBackIcon htmlColor={activeTheme.palette.text.primary} />
                </IconButton>
              )}
              <Typography variant="h3">{pageTitle || routeTitle || <>&nbsp;</>}</Typography>
            </Stack>

            <Stack direction={"row"} spacing={3}>
              {user && (
                <>
                  <Button
                    variant="outlined"
                    onClick={(ev) => {
                      setAnchorRoutesEl(ev.currentTarget);
                    }}
                  >
                    <MenuIcon />
                  </Button>
                  <Menu anchorEl={anchorRoutesEl} open={routesOpen} onClose={() => setAnchorRoutesEl(null)}>
                    {menuItems.map((item, i) => (
                      <MenuItem
                        key={i}
                        onClick={() => {
                          setAnchorRoutesEl(null);
                          navigator(item.route);
                        }}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText>{item.title}</ListItemText>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
              <Paper sx={{ borderRadius: "50%" }} elevation={4}>
                <Tooltip title={dark ? "Dark" : "Light"}>
                  <Button
                    sx={menuItemBtnStyles}
                    onClick={() => {
                      setDark(!dark);
                      localStorage.setItem("dark", String(!dark));
                    }}
                    variant="contained"
                  >
                    {dark ? <DarkModeIcon /> : <LightModeIcon />}
                  </Button>
                </Tooltip>
              </Paper>

              {user ? (
              <>
                <Paper sx={{ borderRadius: "50%" }} elevation={4}>
                  <Button
                    sx={{ height: 64, width: 64 }}
                    onClick={(ev) => {
                      setAnchorAvatarEl(ev.currentTarget);
                    }}
                  >
                    <Avatar alt={user.name} src={user?.picture} sx={{ height: 64, width: 64 }} />
                  </Button>
                  <Menu anchorEl={anchorAvatarEl} open={avatarOpen} onClose={() => setAnchorAvatarEl(null)}>
                    <MenuItem
                      onClick={() => {
                        setAnchorAvatarEl(null);
                        signOutUser();
                        window.location.reload();
                      }}
                    >
                      <ListItemIcon>
                        <LogoutIcon />
                      </ListItemIcon>
                      <ListItemText>Sign Out</ListItemText>
                    </MenuItem>
                  </Menu>
                </Paper>
              </>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="outlined"
                  href={`${process.env.REACT_APP_SERVER_URL}/auth/google`}
                  sx={{
                    height: 64,
                    minWidth: 240,
                    px: 2,
                    textTransform: "none",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="LgbsSe-Bz112c"
                    height={28}
                    width={28}
                  >
                    <g>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </g>
                  </svg>

                  <Typography sx={{ fontWeight: 600 }}>Sign in with Google</Typography>
                </Button>

                <Button
                  variant="contained"
                  onClick={() => navigator("/login")}
                  sx={{
                    height: 64,
                    minWidth: 240,
                    px: 2,
                    textTransform: "none",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <ProfileIcon sx={{ fontSize: 28 }} />
                  <Typography sx={{ fontWeight: 600 }}>Entrar com e-mail</Typography>
                </Button>
              </Stack>
            )}
            </Stack>
          </Stack>
          <Container maxWidth="lg">{children}</Container>
        </Stack>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  return ctx;
}
