import { createBrowserRouter } from "react-router";
import { MobileLayout } from "./components/MobileLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MobileLayout,
    children: [
      { 
        index: true, 
        lazy: async () => {
          const { SplashScreen } = await import("./screens/SplashScreen");
          return { Component: SplashScreen };
        } 
      },
      { 
        path: "login", 
        lazy: async () => {
          const { LoginScreen } = await import("./screens/LoginScreen");
          return { Component: LoginScreen };
        }
      },
      { 
        path: "dashboard", 
        lazy: async () => {
          const { DashboardScreen } = await import("./screens/DashboardScreen");
          return { Component: DashboardScreen };
        }
      },
      { 
        path: "transfer", 
        lazy: async () => {
          const { TransferScreen } = await import("./screens/TransferScreen");
          return { Component: TransferScreen };
        }
      },
      { 
        path: "history", 
        lazy: async () => {
          const { HistoryScreen } = await import("./screens/HistoryScreen");
          return { Component: HistoryScreen };
        }
      },
      { 
        path: "profile", 
        lazy: async () => {
          const { ProfileScreen } = await import("./screens/ProfileScreen");
          return { Component: ProfileScreen };
        }
      },
      { 
        path: "cards", 
        lazy: async () => {
          const { CardsScreen } = await import("./screens/CardsScreen");
          return { Component: CardsScreen };
        }
      },
    ],
  },
]);
