
//frontend/App.jsx

import { Loader } from "@react-three/drei";
import { Leva } from "leva";
import MainPage from "./components/MainPage";

function App() {
  return (
    <>
      <Loader />
      <Leva hidden />
      <MainPage />
    </>
  );
}

export default App;