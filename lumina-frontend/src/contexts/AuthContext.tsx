import { createContext, PropsWithChildren, useContext, useState } from "react";
import { User } from "../schemas/User";

type AuthContextProps = {
  user?: User;
  isUserSignedIn: boolean;
  signInUser: (u: User) => void;
  signOutUser: () => void;
  getSignedInUser: () => User | undefined;
};

function getSignedInUser() {
  const storage = localStorage.getItem("logged-in");
  return storage ? (JSON.parse(localStorage.getItem("logged-in") || "{}") as User) : undefined;
}

export const AuthContext = createContext<AuthContextProps>({
  getSignedInUser,
  signInUser: () => {},
  signOutUser: () => {},
  isUserSignedIn: false,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | undefined>(getSignedInUser());

  const contextProps: AuthContextProps = {
    user,
    isUserSignedIn: Boolean(user),
    getSignedInUser: () => {
      const storage = localStorage.getItem("logged-in");
      return storage ? (JSON.parse(localStorage.getItem("logged-in") || "{}") as User) : undefined;
    },
    signInUser: (user) => {
      localStorage.setItem("logged-in", JSON.stringify(user));
      setUser(user);
    },
    signOutUser: () => {
      localStorage.removeItem("logged-in");
      setUser(undefined);
    },
  };

  return <AuthContext.Provider value={contextProps}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  return ctx;
}
