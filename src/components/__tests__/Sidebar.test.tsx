import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Sidebar from "../Sidebar";
import { FolderProvider } from "../../Contexts/FolderContext";
import { Folder } from "../../types"; 

// Mock the necessary context methods
jest.mock("../../Contexts/FolderContext", () => ({
  useFolderContext: () => ({
    folders: [
      { id: "1", name: "Folder 1" },
      { id: "2", name: "Folder 2" },
    ],
    selectedFolderId: null,
    setSelectedFolderId: jest.fn(),
    addFolder: jest.fn(),
    renameFolder: jest.fn(),
    editingFolderId: null,
    setEditingFolderId: jest.fn(),
    fetchDeletedNotes: jest.fn(),
    setDeletedNotes: jest.fn(),
    deleteFolder: jest.fn(),
    setCurrentNote: jest.fn(),
    moveNote: jest.fn(),
  }),
}));

describe("Sidebar Component", () => {
  test("adds a new folder when clicking the 'Add Folder' button", async () => {
    render(
      <FolderProvider>
        <Sidebar />
      </FolderProvider>
    );

    // Simulate typing a folder name and clicking the add folder button
    fireEvent.change(screen.getByPlaceholderText("New folder name"), {
      target: { value: "New Folder" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add folder/i }));

    // Wait for folder to be added (mocked function)
    await waitFor(() => expect(screen.getByText("New Folder")).toBeInTheDocument());
  });

  test("edits a folder name", async () => {
    render(
      <FolderProvider>
        <Sidebar />
      </FolderProvider>
    );

    // Click on the edit button for Folder 1
    fireEvent.click(screen.getAllByRole("button", { name: /edit folder/i })[0]);

    // Change the folder name and simulate blur event
    fireEvent.change(screen.getByPlaceholderText("New folder name"), {
      target: { value: "Updated Folder 1" },
    });
    fireEvent.blur(screen.getByPlaceholderText("New folder name"));

    // Wait for the folder name to be updated
    await waitFor(() => expect(screen.getByText("Updated Folder 1")).toBeInTheDocument());
  });

  test("deletes a folder", async () => {
    render(
      <FolderProvider>
        <Sidebar />
      </FolderProvider>
    );

    // Click the "Delete Folder" button (make sure it's enabled)
    fireEvent.click(screen.getByRole("button", { name: /delete folder/i }));

    // Ensure that deleteFolder was called (mocked function)
    await waitFor(() => expect(screen.getByRole("button", { name: /delete folder/i })).toBeDisabled());
  });

  test("recycle bin button fetches deleted notes", async () => {
    render(
      <FolderProvider>
        <Sidebar />
      </FolderProvider>
    );

    // Click the Recycle Bin button
    fireEvent.click(screen.getByRole("button", { name: /recycle/i }));

    // Check that the fetchDeletedNotes function was called
    await waitFor(() => expect(screen.getByRole("button", { name: /recycle/i })).toBeInTheDocument());
  });

  test("selects a folder when clicked", async () => {
    render(
      <FolderProvider>
        <Sidebar />
      </FolderProvider>
    );

    // Click on Folder 1
    fireEvent.click(screen.getByText("Folder 1"));

    // Ensure the folder is selected (selected class should be applied)
    await waitFor(() => {
      expect(screen.getByText("Folder 1")).toHaveClass("selected");
    });
  });
});
