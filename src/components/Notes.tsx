import React, { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faThList,
  faThLarge,
} from "@fortawesome/free-solid-svg-icons";
import ConfirmationDialog from "./ConfirmationDialog"; // Import the dialog
import { Note, useAppContext } from "../Contexts/AppContext";

export const Notes: React.FC = ({}) => {
  const [newNoteContent, setNewNoteContent] = useState<string>("");
  const [showNewNoteForm, setShowNewNoteForm] = useState<boolean>(false); // Toggle new note form
  const [isGridView, setIsGridView] = useState<boolean>(true); // Track if in grid or list view
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false); // Control confirmation dialog visibility
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null); // Track the note to delete
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error message state
  const [isSaving, setIsSaving] = useState<boolean>(false); // Track saving state

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null); // Ref for debounce timer
  const {
    notes,
    selectedFolderId,
    addNote,
    editNote,
    deleteNote,
    setCurrentNote,
    deletedNotes,
    currentNoteId,
    setCurrentNoteId,
  } = useAppContext();
  const textAreaRef = useRef<HTMLDivElement>(null);
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const autoSave = async () => {
    if (!newNoteContent.trim()) return;

    setIsSaving(true);

    if (currentNoteId) {
      await editNote(currentNoteId, newNoteContent); // Update existing note
    } else {
      await addNote(newNoteContent); // Save as a new note
    }

    setIsSaving(false);
  };

  const handleNoteContentChange = (content: string) => {
    setNewNoteContent(content);

    // Debounce the auto-save
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      autoSave();
    }, 2000); // Delay of 1 second
  };

  // Handle deleting a note
  const handleDeleteNote = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setNoteToDelete(noteId);
    setShowConfirmDialog(true);
  };

  // Handle confirming note deletion
  const handleConfirmDelete = async () => {
    if (noteToDelete) {
      await deleteNote(noteToDelete);
      setShowConfirmDialog(false);
      setShowNewNoteForm(false);
      setNewNoteContent("");
    }
  };

  const handleAddAction = async () => {
    setShowNewNoteForm(!showNewNoteForm);
    setNewNoteContent("");
    setCurrentNoteId(null);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      textAreaRef.current &&
      !textAreaRef.current.contains(event.target as Node)
    ) {
      setShowNewNoteForm(false);
      setErrorMessage(null); // Clear any error messages
    }
  };

  useEffect(() => {
    if (showNewNoteForm) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNewNoteForm]);

  const handleViewNote = (note: Note) => {
    setCurrentNote(note); // Navigate to the note editor view
  };

  const toggleLayout = () => {
    setIsGridView(!isGridView);
  };
  const newNoteForm = useMemo(() => (
    showNewNoteForm && (
      <div ref={textAreaRef} className="new-note-box mb-4">
        {errorMessage && <div className="error-msg">{errorMessage}</div>}
        <textarea
          placeholder="Write your note here..."
          value={newNoteContent}
          onChange={(e) => handleNoteContentChange(e.target.value)}
        />
        {isSaving && (
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
    )
  ), [showNewNoteForm, newNoteContent, isSaving, errorMessage]);

  const renderNotes = (data: Note[]) => {
    return data.length > 0 ? (
      <div
        className={`notes-container ${isGridView ? "grid-view" : "list-view"}`}
      >
        {data.map((note) => (
          <div
            key={note.id}
            className="note-card"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("noteId", note.id)}
            onClick={() => setCurrentNote(note)}
          >
            <div className="note-content">
              {note.content.length > 70
                ? note.content.slice(0, 70) + "..." // Show preview with ellipsis if content is long
                : note.content}
            </div>
            <div className="note-meta">
              <span>
                Created:{" "}
                {new Date(note.createdAt).toLocaleDateString(
                  undefined,
                  dateOptions
                )}
              </span>
              <span>
                Modified:{" "}
                {new Date(note.updatedAt).toLocaleDateString(
                  undefined,
                  dateOptions
                )}
              </span>
            </div>
            <div className="note-actions">
              <FontAwesomeIcon
                icon={faTrash}
                onClick={(event) => handleDeleteNote(note.id, event)}
                title="Delete"
                className="delete-icon"
              />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="d-flex justify-content-center align-items-center no-notes-message">
        <div className="card p-4">
          <h5 className="text-muted">No notes found in this folder.</h5>
        </div>
      </div>
    );
  };
  return (
    <div className="notes-list">
      {selectedFolderId && (
        <div className="notes-header d-flex justify-content-between align-items-center">
          <h3>Notes</h3>
          <div className="notes-actions">
            {selectedFolderId && (
              <button
                className={`button me-2`}
                onClick={handleAddAction}
              >
                {showNewNoteForm ? "Close" : "Add Note"}
              </button>
            )}
            <button
              className={`button me-2`}
              onClick={toggleLayout}
              aria-label="Toggle Layout"
            >
              <FontAwesomeIcon icon={isGridView ? faThList : faThLarge} />
            </button>
          </div>
        </div>
      )}

      {selectedFolderId ? <div className="mb-3 divider"/> : null}

      {newNoteForm}
      {!selectedFolderId && !deletedNotes?.length && (
        <div className="select-folder-message">
          Select a folder to view notes
        </div>
      )}
      {notes?.length ? (
        renderNotes(notes)
      ) : selectedFolderId ? (
        <div className="d-flex justify-content-center align-items-center no-notes-message">
          <div className="card p-4">
            <h5 className="text-muted">No notes found in this folder.</h5>
          </div>
        </div>
      ) : null}
      {deletedNotes?.length ? renderNotes(deletedNotes) : null}
      <ConfirmationDialog
        show={showConfirmDialog}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDialog(false)}
        message="Are you sure you want to delete this note?"
      />
    </div>
  );
};

export default Notes;
