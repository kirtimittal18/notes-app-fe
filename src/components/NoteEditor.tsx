import React, { useEffect, useState } from "react";
import { useFolderContext } from "../Contexts/FolderContext";

const NoteEditor: React.FC = () => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error message state
  const { currentNote, setCurrentNote, editNote } = useFolderContext();

  // Save the note after editing
  const handleSave = async () => {
    if (!editContent.trim()) {
      setErrorMessage("Please add some content to your note before saving.");
      return;
    }
    if (currentNote) {
      await editNote(currentNote.id, editContent);
      setCurrentNote({ ...currentNote, content: editContent });
      setEditMode(false);
    }
  };
  useEffect(() => {
    if (currentNote) {
      setEditContent(currentNote.content); // Initialize content for editing
    }
  }, [currentNote]);
  // Toggle the edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  // Handle back navigation
  const handleBack = () => {
    setCurrentNote(null); // Go back to the previous page
  };

  if (!currentNote) {
    return <div>Loading...</div>;
  }
  return (
    <div className="note-editor">
      <div
        className="note-editor-header"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <button
          onClick={toggleEditMode}
          className="edit-button"
          style={{ marginRight: "10px" }}
        >
          {editMode ? "Cancel Edit" : "Edit"}
        </button>
        <button onClick={handleBack} className="back-button">
          ← Back
        </button>
      </div>

      {editMode ? (
        <div>
          {errorMessage && <div className="error-msg">{errorMessage}</div>}
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={{
              width: "100%",
              height: "300px",
              padding: "10px",
              fontSize: "16px",
            }}
          />
          <div className="editor-actions" style={{ marginTop: "10px" }}>
            <button onClick={handleSave} style={{ marginRight: "10px" }}>
              Save
            </button>
          </div>
        </div>
      ) : (
        <div
          className="note-content"
          style={{ whiteSpace: "pre-wrap", marginTop: "20px" }}
        >
          {currentNote && currentNote.content}
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
