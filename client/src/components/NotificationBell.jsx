import { useEffect, useState } from "react";
import api from "../services/api";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get("/notifications/my");

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.log("Notification fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.log("Mark all notifications error:", error);
    }
  };

  const markOneAsRead = async (notification) => {
    if (notification.isRead) return;

    try {
      await api.put(`/notifications/${notification._id}/read`);

      setNotifications((previousNotifications) =>
        previousNotifications.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((previousCount) =>
        previousCount > 0 ? previousCount - 1 : 0
      );
    } catch (error) {
      console.log("Mark notification read error:", error);
    }
  };

  const handleBellClick = () => {
    setOpen((previousOpen) => !previousOpen);

    if (!open) {
      fetchNotifications();
    }
  };

  return (
    <div className="notification-bell-wrapper">
      <button
        type="button"
        className="notification-bell-btn"
        onClick={handleBellClick}
        aria-label="Notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <div>
              <h3>Notifications</h3>
              <p>
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "All caught up"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button type="button" onClick={markAllAsRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading && <p className="notification-empty">Loading...</p>}

            {!loading && notifications.length === 0 && (
              <p className="notification-empty">
                No notifications yet.
              </p>
            )}

            {!loading &&
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification._id}
                  onClick={() => markOneAsRead(notification)}
                  className={
                    notification.isRead
                      ? "notification-item notification-item-button"
                      : "notification-item unread-notification notification-item-button"
                  }
                >
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>

                  <span>
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;