import React, { useCallback, useEffect, useState } from "react";
import { useFolderContext } from "../Contexts/FolderContext";

const NoteEditor: React.FC = () => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error message state
  const { currentNote, setCurrentNote, editNote } = useFolderContext();
  const [isAutosaving, setIsAutosaving] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState(false);
  const autosave = useCallback(
    (() => {
      let timeout: NodeJS.Timeout;
      return (noteId: string, content: string) => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          if (noteId && content.trim()) {
            setIsAutosaving(true);
            await editNote(noteId, content);
            setTimeout(() => {
              setIsAutosaving(false); // Hide "Auto-saving..." after delay
            }, 1000);
            console.log("Note autosaved!");
          }
        }, 1000); // Autosave delay: 3 seconds
      };
    })(),
    [editNote]
  );

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setEditContent(content);
    // Trigger autosave
    if (currentNote) {
      autosave(currentNote.id, content);
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
        <button onClick={handleBack} className="back-button">
          ← Back
        </button>
      </div>

      {isSelected ? (
        <div>
          {errorMessage && <div className="error-msg">{errorMessage}</div>}
          <textarea
            value={editContent}
            onBlur={() => setIsSelected(false)}
            onChange={handleContentChange}
            style={{
              width: "100%",
              height: "300px",
              padding: "10px",
              fontSize: "16px",
            }}
          />
          {isAutosaving && (
            <div
              style={{
                marginTop: "5px",
                fontSize: "14px",
                fontStyle: "italic",
                color: "gray",
              }}
            >
              Auto-saving...
            </div>
          )}
        </div>
      ) : (
        <div
          className="note-content"
          role="description"
          aria-label="Note Content"
          onClick={() => setIsSelected(true)}
          style={{ whiteSpace: "pre-wrap", marginTop: "20px" }}
        >
          {currentNote && currentNote.content}
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
