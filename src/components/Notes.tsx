import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faThList,
  faThLarge,
} from "@fortawesome/free-solid-svg-icons";
import ConfirmationDialog from "./ConfirmationDialog"; // Import the dialog
import { Note, useFolderContext } from "../Contexts/FolderContext";

export const Notes: React.FC = ({}) => {
  const [newNoteContent, setNewNoteContent] = useState<string>(""); // New note content
  const [showNewNoteForm, setShowNewNoteForm] = useState<boolean>(false); // Toggle new note form
  const [isGridView, setIsGridView] = useState<boolean>(true); // Track if in grid or list view
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false); // Control confirmation dialog visibility
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null); // Track the note to delete
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error message state

  const {
    notes,
    selectedFolderId,
    addNote,
    deleteNote,
    setCurrentNote,
    deletedNotes,
  } = useFolderContext();

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  // Function to handle adding a new note
  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      setErrorMessage("Please add some content to your note before saving."); // Set error message
      return; // Don't add a note if content is empty
    }
    await addNote(newNoteContent);
    setNewNoteContent("");
    setShowNewNoteForm(false);
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
    }
  };

  const handleViewNote = (note: Note) => {
    setCurrentNote(note); // Navigate to the note editor view
  };

  const toggleLayout = () => {
    setIsGridView(!isGridView);
  };

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
      {selectedFolderId && <div className="notes-header d-flex justify-content-between align-items-center mb-3">
         <h3>Notes</h3>
        <div className="notes-actions">
          {selectedFolderId && (
            <button
              className={`btn ${
                showNewNoteForm ? "btn-secondary" : "btn-primary"
              } me-2`}
              onClick={() => setShowNewNoteForm(!showNewNoteForm)}
            >
              {showNewNoteForm ? "Cancel" : "Add Note"}
            </button>
          )}
          <button
            className="btn btn-outline-primary"
            onClick={toggleLayout}
            aria-label="Toggle Layout"
          >
            <FontAwesomeIcon icon={isGridView ? faThList : faThLarge} />
          </button>
        </div>
      </div>}

      {showNewNoteForm && (
        <div className="new-note-box mb-4">
          {errorMessage && <div className="error-msg">{errorMessage}</div>}
          <textarea
            placeholder="Write your note here..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
          />
          <div className="form-actions d-flex justify-content-end">
            <button className="btn btn-success" onClick={handleAddNote}>
              Save Note
            </button>
          </div>
        </div>
      )}
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
