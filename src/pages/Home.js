import React, { useState } from "react";
import CircleChart from "../components/CircleChart";
import FileInput from "../components/FileInput";
import DownloadButton from "../components/DownloadButton";
import ColorPicker from "../components/ColorPicker";
import RadiusInput from "../components/RadiusInput";

function Home() {
    const [data, setData] = useState(null);
    const [circleColor, setCircleColor] = useState("red");
    const [circleRadius, setCircleRadius] = useState(25);

    // Function to handle file upload
    function handleFileUpload(event) {
        // Get the uploaded file
        const file = event.target.files[0];

        // Create a new file reader
        const reader = new FileReader();

        // Listen for the reader load event
        reader.addEventListener("load", (event) => {
            // Get the loaded file contents
            const contents = event.target.result;

            // Parse the contents as JSON
            const jsonData = JSON.parse(contents);

            // Set the parsed data as the state
            setData(jsonData);
        });

        // Read the file as text
        reader.readAsText(file);
    }

    // Function to handle file download
    function handleFileDownload() {
        // Get the data to download
        const dataToDownload = [
            { x: 50, y: 50, r: 25, color: "red" },
            { x: 100, y: 100, r: 50, color: "blue" },
        ];

        // Convert the data to a JSON string
        const jsonString = JSON.stringify(dataToDownload, null, 2);

        // Create a blob from the JSON string
        const blob = new Blob([jsonString], { type: "application/json" });

        // Create a URL from the blob
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element to download the file
        const a = document.createElement("a");
        a.href = url;
        a.download = "data.json";

        // Click the anchor element to download the file
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    return (
        <div>
            <FileInput onChange={handleFileUpload} />
            <DownloadButton onClick={handleFileDownload} />
            <ColorPicker
                value={circleColor}
                onChange={(e) => setCircleColor(e.target.value)}
            />
            <RadiusInput
                value={circleRadius}
                onChange={(e) => setCircleRadius(e.target.value)}
            />
            <CircleChart data={data} circleColor={circleColor} />
        </div>
    );
}

export default Home;
