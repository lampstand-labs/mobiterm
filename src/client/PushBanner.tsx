import { useRef, useEffect, useState, useCallback } from "react";
import { registerServiceWorker, doSubscribe } from "./pushNotifications";

export function PushBanner() {
  const [visible, setVisible] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const swRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const reg = await registerServiceWorker();
      if (cancelled || !reg) return;
      swRef.current = reg;
      const sub = await reg.pushManager.getSubscription();
      if (cancelled || sub) return;
      if (Notification.permission === "denied") return;
      setVisible(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubscribe = useCallback(async () => {
    setSubscribing(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setSubscribing(false);
        return;
      }
      if (swRef.current) {
        await doSubscribe(swRef.current);
      }
      setVisible(false);
    } catch {
      setSubscribing(false);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="push-banner">
      <span className="push-banner__message">
        Enable self-sent push notifications
      </span>
      <span className="push-banner__actions">
        <button
          className="push-banner__subscribe"
          disabled={subscribing}
          onClick={handleSubscribe}
        >
          {subscribing ? "Requesting\u2026" : "Subscribe"}
        </button>
        <button
          className="push-banner__dismiss"
          onClick={() => setVisible(false)}
        >
          Dismiss
        </button>
      </span>
    </div>
  );
}
