import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import Sidebar from "../Sidebar";
import { useAppContext } from "../../Contexts/AppContext";
import { Folder } from "../../types";

// Mock useAppContext
jest.mock("../../Contexts/AppContext", () => ({
  useAppContext: jest.fn(),
}));

describe("Sidebar Component", () => {
  const mockFolders: Folder[] = [
    { id: "1", name: "Folder 1",parentFolderId: null },
    { id: "2", name: "Folder 2", parentFolderId: null },
  ];

  const mockContext = {
    folders: mockFolders,
    selectedFolderId: "1",
    setSelectedFolderId: jest.fn(),
    addFolder: jest.fn().mockResolvedValue({ id: "3", name: "New Folder" }),
    renameFolder: jest.fn(),
    editingFolderId: null,
    setEditingFolderId: jest.fn(),
    fetchDeletedNotes: jest.fn(),
    setDeletedNotes: jest.fn(),
    deleteFolder: jest.fn().mockResolvedValue(undefined),
    setCurrentNote: jest.fn(),
    moveNote: jest.fn(),
  };

  beforeEach(() => {
    (useAppContext as jest.Mock).mockReturnValue(mockContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the folder list", () => {
    render(<Sidebar />);

    const folderItems = screen.getAllByRole("listitem");
    expect(folderItems).toHaveLength(mockFolders.length);
    expect(screen.getByText("Folder 1")).toBeInTheDocument();
    expect(screen.getByText("Folder 2")).toBeInTheDocument();
  });

  test("adds a new folder", async () => {
    render(<Sidebar />);

    const addButton = screen.getByTitle("Add Folder");
    fireEvent.click(addButton);

    await waitFor(() => expect(mockContext.addFolder).toHaveBeenCalled());
  });

  test("renames a folder", async () => {
    (useAppContext as jest.Mock).mockReturnValue({
      ...mockContext,
      editingFolderId: "1",
    });

    render(<Sidebar />);

    const input = screen.getByPlaceholderText("New folder name");
    fireEvent.change(input, { target: { value: "Renamed Folder" } });
    fireEvent.blur(input);

    await waitFor(() =>
      expect(mockContext.renameFolder).toHaveBeenCalledWith("1", "Renamed Folder")
    );
  });

  test("deletes a folder", async () => {
    render(<Sidebar />);

    const deleteButton = screen.getByTitle("Delete folder");
    fireEvent.click(deleteButton);

    await waitFor(() => expect(mockContext.deleteFolder).toHaveBeenCalledWith("1"));
  });

  test("disables delete button when no folder is selected", () => {
    (useAppContext as jest.Mock).mockReturnValue({
      ...mockContext,
      selectedFolderId: null,
    });

    render(<Sidebar />);

    const deleteButton = screen.getByTitle("Delete folder");
    expect(deleteButton).toBeDisabled();
  });

  test("fetches deleted notes when recycle bin is clicked", () => {
    render(<Sidebar />);

    const recycleBinButton = screen.getByTitle("Recycle Bin");
    fireEvent.click(recycleBinButton);

    expect(mockContext.fetchDeletedNotes).toHaveBeenCalled();
  });

  test("sets selected folder when folder is clicked", () => {
    render(<Sidebar />);

    const folder = screen.getByText("Folder 1");
    fireEvent.click(folder);

    expect(mockContext.setSelectedFolderId).toHaveBeenCalledWith("1");
  });

  test("handles drag and drop of notes", () => {
    render(<Sidebar />);

    const folder = screen.getByText("Folder 1");
    const mockDataTransfer: Partial<DataTransfer> = {
      getData: jest.fn(() => "note1"),
      dropEffect: "move", 
      effectAllowed: "move", 
      types: [], 
      clearData: jest.fn(), 
      setData: jest.fn(),
      setDragImage: jest.fn(), 
    };
  
    // Create a custom event with mock dataTransfer
    const dropEvent = new MouseEvent("drop", {
      bubbles: true,
      cancelable: true,
    });
    
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: mockDataTransfer,
    });
  
    fireEvent(folder, dropEvent);
    expect(mockDataTransfer.getData).toHaveBeenCalledWith("noteId");
  });
});
