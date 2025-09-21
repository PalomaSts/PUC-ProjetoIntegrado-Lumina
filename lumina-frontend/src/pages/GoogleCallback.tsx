import { useEffect } from "react";
import { useNavigator } from "../AppRouter";
import { useAuthContext } from "../contexts/AuthContext";
import { useLoading } from "../contexts/LoadingContext";
import { User } from "../schemas/User";

export function GoogleCallback() {
  const navigate = useNavigator();
  const { signInUser } = useAuthContext();

  const { setLoading } = useLoading();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/auth/google/callback${window.location.search}`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();

        const user: User = data;

        signInUser(user);

        navigate("/home");
      } catch (error) {}
      setLoading(false);
    })();
  }, []);

  return <></>;
}
