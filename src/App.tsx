// src/App.tsx
import React from "react";
import Sidebar from "./components/Sidebar";
import Notes from "./components/Notes";
import "./App.css";
import NoteEditor from "./components/NoteEditor";
import "bootstrap/dist/css/bootstrap.min.css";
import { FolderProvider } from "./Contexts/FolderContext";
import { useFolderContext } from './Contexts/FolderContext'; // Import context to use in a child component


const ContentArea: React.FC = () => {
  const { currentNote } = useFolderContext(); // Access context here

  return (
      <>
          {currentNote ? (
              <NoteEditor /> // Render NoteEditor if a note is selected
          ) : (
              <Notes /> // Render Notes if no note is selected
          )}
      </>
  );
};

// process.on('unhandledRejection', (err) => {
//   console.error('Unhandled Promise Rejection:', err);
//   // Optionally exit the process
//   process.exit(1);
// });


const App: React.FC = () => {
  return (
    <FolderProvider>
      <div className="app-container">
        <Sidebar />
        <ContentArea />
      </div>
    </FolderProvider>
  );
};

export default App;
