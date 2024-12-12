import { useEffect } from "react";
import { useRouter } from "next/router";
import '../styles/globals.css';
import Header from '../components/global/header';
import IdleLogout from "../components/system/idleLogout";



function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <>
      <Header />
      <main>
        <Component {...pageProps} />
        <IdleLogout />
      </main>
    </>
  );
}

export default MyApp;
