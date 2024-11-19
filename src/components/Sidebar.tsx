import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faRecycle,
} from "@fortawesome/free-solid-svg-icons";
import { Folder } from "../types";
import { useFolderContext } from "../Contexts/FolderContext";

const Sidebar: React.FC = ({}) => {
  const {
    folders,
    selectedFolderId,
    setSelectedFolderId,
    addFolder,
    renameFolder,
    editingFolderId,
    setEditingFolderId,
    fetchDeletedNotes,
    setDeletedNotes,
    deleteFolder,
    setCurrentNote,
    moveNote
  } = useFolderContext();
  const [newFolderName, setNewFolderName] = useState("");
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault(); // Allow the drop
  };

  const handleDrop = async (e: React.DragEvent<HTMLLIElement>, folderId: string) => {
    e.preventDefault();
    try {
      const dataTransfer = e.dataTransfer;
      if (!dataTransfer) {
        throw new Error('No dataTransfer available');
      }
  
      const noteId = dataTransfer.getData('noteId');
      if (!noteId) {
        throw new Error('No noteId found in dataTransfer');
      }
  
      await moveNote(noteId, folderId);
    } catch (error) {
      console.error('Error during handleDrop:', error);
    }
  };

  

  // Add a new folder
  const handleAddFolder = async () => {
    await addFolder(newFolderName);
    setNewFolderName(""); 
  };

  // Handle folder deletion
  const handleDeleteFolder = async () => {
    if (!selectedFolderId) {
      console.error("No folder selected for deletion.");
      return; 
    }
    const currentIndex = folders.findIndex(
      (folder) => folder.id === selectedFolderId
    );

    // Delete the folder
    await deleteFolder(selectedFolderId);

    // Determine the new selected folder
    if (folders.length > 1) {
      // Select the previous folder if there are remaining folders
      const newSelectedIndex = currentIndex > 0 ? currentIndex - 1 : 0;
      setSelectedFolderId(folders[newSelectedIndex].id);
    } else {
      // Reset if there are no folders left
      setSelectedFolderId(null);
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    if (newName.trim()) {
      await renameFolder(folderId, newName);
      setEditingFolderId(null);
    } else {
      console.error("New folder name cannot be empty.");
    }
  };

  // Render folders
  const renderFolders = (folders: Folder[]) => {
    console.log("Folders:", folders); // Log the folders to ensure they contain "New Folder"

    return folders.map((folder) => (
      <li
        key={folder.id}
        className="folder-item"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, folder.id)}
      >
        {editingFolderId === folder.id ? (
          <input
            type="text"
            aria-label="Folders"
            placeholder="New folder name"
            defaultValue={folder.name}
            onBlur={(e) => handleRenameFolder(folder.id, e.target.value)}
            autoFocus
          />
        ) : (
          <span
            className={`folder-link ${
              selectedFolderId === folder.id ? "selected" : ""
            }`}
            onClick={() => {
              setSelectedFolderId(folder.id);
              setDeletedNotes([]);
              setCurrentNote(null);
              // onFolderClick(folder.id);
            }}
          >
            {folder.name}
          </span>
        )}
        <FontAwesomeIcon
          icon={faEdit}
          className="rename-icon"
          aria-label="Edit Folder"
          onClick={() => {
            setEditingFolderId(folder.id); 
            setNewFolderName(folder.name); 
          }}
        />
      </li>
    ));
  };

  const handleRecycleBinClick = () => {
    setSelectedFolderId(null);
    fetchDeletedNotes();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Folders</h2>
        <div className="icon-group">
          <button
            onClick={handleAddFolder}
            className="add-folder-btn"
            aria-label="Add folder"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <button
            onClick={handleDeleteFolder}
            disabled={!selectedFolderId}
            aria-label="Delete folder"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
          <button onClick={handleRecycleBinClick}>
            <FontAwesomeIcon icon={faRecycle} className="me-2" />
          </button>
        </div>
      </div>
      <ul className="list-folder-items">{renderFolders(folders)}</ul>
    </div>
  );
};

export default Sidebar;
