import { Routes, Route } from "react-router-dom";
import ButtonAppBar from "./components/ButtonAppBar";
import Felder from "./Routes/Pages";
import Geräte from "./Routes/Geräte";
import Lager from "./Routes/Lager";
import Vertrieb from "./Routes/Vertrieb";
import Personal from "./Routes/Personal";

function App()
{
    return <div>
        <ButtonAppBar />
       <Routes>
        <Route path="/Felder" element={<Felder />} />
        <Route path="/Geräte" element={<Geräte />} />
        <Route path="/Lager" element={<Lager />} />
        <Route path="/Vertrieb" element={<Vertrieb />} />
        <Route path="/Personal" element={<Personal />} />
       </Routes>
    </div>
}

export default App;