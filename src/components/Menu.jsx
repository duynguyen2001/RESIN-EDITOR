import { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlusSquare,
    faDownload,
    faList,
    faCog,
    faBars,
} from "@fortawesome/free-solid-svg-icons";
import { Modal } from "../pages/Panel";
import { DataContext } from "../pages/DataReader";
import ZipReader from "./ZipReader";
import "../assets/css/Menu.css";
import ProvenanceMap from "../pages/ProvenanceMap";

function Menu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [option, setOption] = useState(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    return (
        <>
            <FontAwesomeIcon
                icon={faBars}
                className="menu-icon"
                onClick={toggleMenu}
                title="Menu"
            />
            {isMenuOpen && (
                <div className="menu-container">
                    <div onClick={() => setOption("Add JSON")}>
                        <FontAwesomeIcon
                            icon={faPlusSquare}
                            className="menu-item"
                            title="Add JSON"
                        />
                    </div>

                    <div onClick={() => setOption("Download JSON")}>
                        <FontAwesomeIcon
                            icon={faDownload}
                            className="menu-item"
                            title="Download JSON"
                        />
                    </div>
                    <div onClick={() => setOption("See Legend")}>
                        <FontAwesomeIcon
                            icon={faList}
                            className="menu-item"
                            title="See Legend"
                        />
                    </div>
                    <div onClick={() => setOption("Option Change")}>
                        <FontAwesomeIcon
                            icon={faCog}
                            className="menu-item"
                            title="Option Change"
                        />
                    </div>
                </div>
            )}
            {option && (
                <MenuOptionPanel option={option} setOption={setOption} />
            )}
        </>
    );
}
const MenuOptionPanel = ({ option, setOption }) => {
    const closePanel = () => {
        setOption(null);
    };
    const [isEnlarged, setIsEnlarged] = useState(false);
    const toggleEnlarged = () => {
        setIsEnlarged(!isEnlarged);
    };

    return (
        <div className={isEnlarged? "menu-option-panel-enlarged":"menu-option-panel"}>
            <Modal isEnlarged={isEnlarged} handleClick={closePanel} toggleEnlarged={toggleEnlarged} />
            {option === "Add JSON" && <AddJSONPanel />}
            {option === "Download JSON" && <DownloadJSONPanel />}
            {option === "See Legend" && <SeeLegendPanel />}
            {option === "Option Change" && <OptionChangePanel />}
        </div>
    );
};

function AddJSONPanel() {
    const [jsonData, setJsonData] = useContext(DataContext);

  const handleJSONUpload = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], 'UTF-8');
    fileReader.onload = (e) => {
      const parsedJson = JSON.parse(e.target.result);
      setJsonData(parsedJson);
    };
  };


    return <div>
        <h2>Upload New JSON File</h2>
        <h3>JSON File</h3>
        <input type="file" accept=".json" onChange={handleJSONUpload} />
        <h3>Zip File</h3>
        <ZipReader />
    </div>;
}
function DownloadJSONPanel () {

    const [jsonData, setJsonData] = useContext(DataContext);
    

    const downloadJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "data.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return <div>
        <h2>Download JSON File</h2>
        <button onClick={downloadJSON}>Download JSON</button>
    </div>;

}

function SeeLegendPanel() {
    return <div>
        <h2>Legend</h2>

        <ProvenanceMap />
    </div>;
};

function OptionChangePanel() {
    return <div>
        <h2>Option Change</h2>
    </div>;

};


export default Menu;
