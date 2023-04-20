import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Panel from "./pages/Panel";
import DataReader from "./pages/DataReader";
import exampleData from "./data/example.json";
import CytoscapeGraph from "./pages/CytoscapeGraph";
function App() {
    return (
        <div>
            <DataReader/>
        </div>
    );
}

export default App;
