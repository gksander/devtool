import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./client.ts";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { HomeRoute } from "@/routes/home.route.tsx";
import { RootLayout } from "@/routes/root-layout";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { ToolRoute } from "@/routes/tool.route.tsx";
import "./monaco-environment.ts";
import { Toaster } from "@/components/ui/toaster.tsx";
import { SettingsRoute } from "@/routes/settings.route.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/settings" element={<SettingsRoute />} />
      <Route path="/tools">
        <Route path=":toolId" element={<ToolRoute />} />
      </Route>
    </Route>,
  ),
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
    <Toaster />
  </React.StrictMode>,
);
