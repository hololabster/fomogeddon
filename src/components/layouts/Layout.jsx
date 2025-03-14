import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import useGameStore from "../../stores/gameStore";

const Layout = () => {
  const { notification } = useGameStore();
  return (
    <div className="layout">
      {/* Notification */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
