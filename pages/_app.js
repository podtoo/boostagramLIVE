import { useEffect } from "react";
import { useRouter } from "next/router";
import '../styles/globals.css';
import Header from '../components/global/header';
import Footer from '../components/global/footer';
import IdleLogout from "../components/system/idleLogout";



function Boostagram({ Component, pageProps }) {
  const router = useRouter();

  return (
    <>
      <Header />
      <main>
        <Component {...pageProps} />
        <IdleLogout />
      </main>
      <Footer />
    </>
  );
}

export default Boostagram;
