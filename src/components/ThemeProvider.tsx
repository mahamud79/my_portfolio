"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

// THE FIX: We added React.ComponentProps so it dynamically accepts 'attribute', 'defaultTheme', etc.
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    // THE FIX: We spread {...props} here so the settings from layout.tsx are correctly applied
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}