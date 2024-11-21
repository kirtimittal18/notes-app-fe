// FolderContext.js
import axios from "axios";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface Note {
  id: string;
  folderId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Folder {
  id: string;
  name: string;
  parentFolderId: number;
}

interface AppContextType {
  folders: Folder[];
  deletedNotes: Note[] | null;
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  currentNoteId: string | null;
  setCurrentNoteId: (id: string | null) => void;
  notes: Note[];
  addFolder: (folderName: string) => Promise<void>;
  editingFolderId: string | null;
  setEditingFolderId: (id: string | null) => void;
  renameFolder: (folderId: string, newName: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  addNote: (folderId: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  moveNote: (noteId: string, targetFolderId: string) => Promise<void>;
  currentNote: Note | null;
  setCurrentNote: (note: Note | null) => void;
  editNote: (noteId: string, content: string) => Promise<void>;
  fetchDeletedNotes: () => void;
  setDeletedNotes: (notes: Note[] | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within a AppProvider");
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [deletedNotes, setDeletedNotes] = useState<Note[] | null>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null); // Track editing state
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  // To add a folder
  const addFolder = async () => {
    try {
      const response = await axios.post("/api/folders", {
        folderName: "New Folder",
        parentFolderId: null,
      });
      const newFolder = response.data;
      setFolders((prevFolders) => [...prevFolders, newFolder]); // Update state
      setEditingFolderId(newFolder.id);
    } catch (error) {
      console.error("Error adding folder:", error);
    }
  };

  // To rename a folder
  const renameFolder = async (folderId: string, newName: string) => {
    try {
      const folderToRename = folders.find((folder) => folder.id === folderId);
      if (folderToRename) {
        const response = await axios.put(`/api/folders/${folderId}/rename`, {
          name: newName,
        });
        const updatedFolder: Folder = response.data;

        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder.id === folderId ? updatedFolder : folder
          )
        );
        setEditingFolderId(null); // Stop editing after successful rename
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
    }
  };

  // To delete a folder
  const deleteFolder = async (folderId: string) => {
    try {
      if (folderId) {
        await axios.delete(`/api/folders/${selectedFolderId}`);
        setFolders((prevFolders) =>
          prevFolders.filter((folder) => folder.id !== folderId)
        );
      } else {
        return;
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const addNote = async (noteContent: string) => {
    if (!selectedFolderId) {
      console.error("No folder selected to add a note.");
      return;
    }

    try {
      const response = await axios.post(`/api/notes/`, {
        content: noteContent,
        folderId: selectedFolderId,
      });
      if (!response.data) {
        throw new Error("Failed to add note");
      }
      const newNote: Note = response.data;
      setCurrentNoteId(newNote.id);
      setNotes((prevNotes) => [...prevNotes, newNote]); // Update local state
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete note");
      }
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      setCurrentNoteId(null)
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const moveNote = async (noteId: string, targetFolderId: string) => {
    try {
      axios.put(`/api/notes/${noteId}/move`, { targetFolderId }).then(() => {
        // Refresh the notes list after a successful move
        if (selectedFolderId === targetFolderId) {
          // If the note was dropped in the same folder, fetch the notes again
          setNotes(notes.filter((note) => note.id !== noteId));
        } else {
          // Remove the note from the current folder after a successful drop
          setNotes(notes.filter((note) => note.id !== noteId));
        }
      });
    } catch (error) {
      console.error("Error moving note:", error);
    }
  };

  const fetchDeletedNotes =  async () => {
    setNotes([]);
    await axios.get('/api/notes/recycled').then((response) => {
      setDeletedNotes(response.data);
    });
  };

  const editNote = async (noteId: string, updatedContent: string) => {
    try {
      const response = await axios.put(`/api/notes/${noteId}`, {
        content: updatedContent,
      });

      // Update local state
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId ? { ...note, content: updatedContent } : note
        )
      );

      if (currentNote && currentNote.id === noteId) {
        setCurrentNote({ ...currentNote, content: updatedContent }); // Update current note in context
      }
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  // Fetch folders and notes
  useEffect(() => {
    const fetchFolders = async () => {
      const folderData = await fetch("/api/folders").then((res) => res.json());
      setFolders(folderData);
    };

    fetchFolders();
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      if (selectedFolderId) {
        axios.get(`/api/notes/folder/${selectedFolderId}`).then((response) => {
          setNotes(response.data);
        });
      } else {
        setNotes([]); // Clear notes if no folder is selected
      }
    };

    fetchNotes();
  }, [selectedFolderId]);

  return (
    <AppContext.Provider
      value={{
        folders,
        selectedFolderId,
        setSelectedFolderId,
        currentNoteId,
        setCurrentNoteId,
        notes,
        addFolder,
        renameFolder,
        deleteFolder,
        editingFolderId,
        deletedNotes,
        setDeletedNotes,
        setEditingFolderId,
        addNote,
        moveNote,
        fetchDeletedNotes,
        deleteNote,
        currentNote, // Provide the current note in the context
        setCurrentNote,
        editNote,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useFolders = () => {
  const context = useAppContext();
  if (!context) {
    throw new Error("useFolders must be used within a AppProvider");
  }
  return context;
};
