import { AppRouter } from "./AppRouter";
import { AuthProvider } from "./contexts/AuthContext";
import { LoadingProvider } from "./contexts/LoadingContext";

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <AppRouter />
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
