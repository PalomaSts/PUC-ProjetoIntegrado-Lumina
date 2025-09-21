import { Box, CircularProgress } from "@mui/material";
import { createContext, PropsWithChildren, useContext, useState } from "react";

type LoadingContextProps = {
  setLoading: (l: boolean) => void;
};

export const LoadingContext = createContext<LoadingContextProps>({
  setLoading: (l: boolean) => {},
});

export function LoadingProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(false);
  const contextProps: LoadingContextProps = {
    setLoading,
  };

  return (
    <LoadingContext.Provider value={contextProps}>
      {loading && (
        <Box
          sx={{
            position: "absolute",
            height: "100%",
            width: "100%",
            zIndex: 9999999,
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={120} />
        </Box>
      )}
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  return ctx;
}
