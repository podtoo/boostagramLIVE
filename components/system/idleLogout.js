import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const IdleLogout = () => {
  const router = useRouter();
  const [remainingTime, setRemainingTime] = useState(60 * 60); // Initial 60 minutes in seconds
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  useEffect(() => {
    const userCookie = Cookies.get("boostagram_user");

    // Only proceed if the user is logged in
    if (!userCookie) {
      setIsLoggedIn(false);
      return;
    }
    setIsLoggedIn(true);

    let timeout;
    let interval;

    const resetTimer = () => {
      // Clear the timeout and restart the timer
      clearTimeout(timeout);
      clearInterval(interval);
      setRemainingTime(60 * 60); // Reset to 60 minutes

      timeout = setTimeout(() => {
        handleLogout();
      }, 60 * 60 * 1000); // 60 minutes

      // Update remaining time every second
      interval = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
    };

    const handleLogout = () => {
      // Remove the authentication cookie and redirect to login
      Cookies.remove("boostagram_user");
      clearInterval(interval); // Clear interval on logout
      router.push("/login");
    };

    // Set the initial timer
    resetTimer();

    // Listen for user interactions
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("click", resetTimer);

    return () => {
      // Cleanup event listeners and timeout/interval on component unmount
      clearTimeout(timeout);
      clearInterval(interval);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [router]);

  // Don't render the timer if the user is not logged in
  if (!isLoggedIn) return null;

  // Format remaining time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        backgroundColor: "#000",
        color: "#fff",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "14px",
        zIndex: 1000,
      }}
    >
      Inactivity Logout in: {formatTime()}
    </div>
  );
};

export default IdleLogout;