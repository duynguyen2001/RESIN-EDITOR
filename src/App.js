import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Panel from "./pages/Panel";
import DataReader from "./pages/DataReader";
function App() {
    return (
        <div>
            <DataReader />
            {/* <Panel /> */}
        </div>
    );
}

export default App;
