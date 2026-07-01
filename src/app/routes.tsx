import { createBrowserRouter } from "react-router";
import { MobileLayout } from "./components/MobileLayout";
import { SplashScreen } from "./screens/SplashScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { TransferScreen } from "./screens/TransferScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { CardsScreen } from "./screens/CardsScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MobileLayout,
    children: [
      { index: true, Component: SplashScreen },
      { path: "login", Component: LoginScreen },
      { path: "dashboard", Component: DashboardScreen },
      { path: "transfer", Component: TransferScreen },
      { path: "history", Component: HistoryScreen },
      { path: "profile", Component: ProfileScreen },
      { path: "cards", Component: CardsScreen },
    ],
  },
]);
