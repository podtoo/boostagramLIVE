import { Button } from "@mui/material";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const Logout = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Remove the cookie
    Cookies.remove("boostagram_user");
    router.push("/login");
  };

  return <Button color="inherit" onClick={handleLogout}>Logout</Button>;
};

export default Logout;
