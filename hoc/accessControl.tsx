import { useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

const accessControl = (WrappedComponent) => {
  const AccessControlledComponent = (props) => {
    const router = useRouter();

    useEffect(() => {
      const checkAccess = async () => {
        const userToken = Cookies.get("boostagram_user");

        if (!userToken) {
          router.replace("/login");
          return;
        }

        try {
          const response = await fetch("/api/system/validate-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: userToken }),
          });

          const data = await response.json();

          if (!data.valid) {
            // Token is invalid or expired
            Cookies.remove("boostagram_user");
            router.replace("/login");
          }
        } catch (error) {
          console.error("Error validating token:", error);
          router.replace("/login");
        }
      };

      checkAccess();
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  return AccessControlledComponent;
};

export default accessControl;
