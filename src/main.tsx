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
import { RootLayout } from "@/routes/root.layout.tsx";
import { TOOLS } from "@/tools.ts";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/tools">
        {Object.values(TOOLS).map((tool) => (
          <Route
            key={tool.name}
            path={tool.path}
            element={<tool.component />}
          />
        ))}
      </Route>
    </Route>,
  ),
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
