"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState, useEffect } from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mounting
  // eslint-disable-next-line react-hooks/set-state-in-effect
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
