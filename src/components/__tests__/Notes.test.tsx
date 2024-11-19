import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Notes from "../Notes";
import { useFolderContext } from "../../Contexts/FolderContext";

// Mock the useFolderContext hook
jest.mock("../../Contexts/FolderContext", () => ({
  useFolderContext: jest.fn(),
}));

describe("Notes Component", () => {
  const mockAddNote = jest.fn();
  const mockDeleteNote = jest.fn();
  const mockSetCurrentNote = jest.fn();

  const defaultContext = {
    notes: [
      {
        id: "1",
        content: "Test note content 1",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
      },
      {
        id: "2",
        content: "Test note content 2",
        createdAt: "2024-01-03T00:00:00Z",
        updatedAt: "2024-01-04T00:00:00Z",
      },
    ],
    selectedFolderId: "folder1",
    addNote: mockAddNote,
    deleteNote: mockDeleteNote,
    setCurrentNote: mockSetCurrentNote,
    deletedNotes: [],
  };

  beforeEach(() => {
    // Assert that useFolderContext is treated as a Jest mock
    (useFolderContext as jest.Mock).mockReturnValue(defaultContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders notes when provided", () => {
    render(<Notes />);
    expect(screen.getByText("Test note content 1")).toBeInTheDocument();
    expect(screen.getByText("Test note content 2")).toBeInTheDocument();
  });

  test("renders no notes message when there are no notes", () => {
    (useFolderContext as jest.Mock).mockReturnValue({
      ...defaultContext,
      notes: [],
      deletedNotes: [],
    });
    render(<Notes />);
    expect(
      screen.getByText(/No notes found in this folder\./i)
    ).toBeInTheDocument();
  });

  test("toggles new note form visibility", () => {
    render(<Notes />);
    const addNoteButton = screen.getByRole("button", { name: /add note/i });
    fireEvent.click(addNoteButton);
    expect(screen.getByPlaceholderText("Write your note here...")).toBeInTheDocument();

    fireEvent.click(addNoteButton);
    expect(screen.queryByPlaceholderText("Write your note here...")).not.toBeInTheDocument();
  });

  test("displays error message if trying to save an empty note", () => {
    render(<Notes />);
    fireEvent.click(screen.getByRole("button", { name: /add note/i }));
    fireEvent.click(screen.getByRole("button", { name: /save note/i }));
    expect(
      screen.getByText("Please add some content to your note before saving.")
    ).toBeInTheDocument();
  });

  test("calls addNote function with correct content", () => {
    render(<Notes />);
    fireEvent.click(screen.getByRole("button", { name: /add note/i }));

    const textarea = screen.getByPlaceholderText("Write your note here...");
    fireEvent.change(textarea, { target: { value: "New test note" } });

    fireEvent.click(screen.getByRole("button", { name: /save note/i }));
    expect(mockAddNote).toHaveBeenCalledWith("New test note");
  });

  test("calls deleteNote function when confirming delete", () => {
    render(<Notes />);
    const deleteButton = screen.getAllByTitle("Delete")[0];
    fireEvent.click(deleteButton);

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(mockDeleteNote).toHaveBeenCalledWith("1");
  });

  test("does not call deleteNote if delete is canceled", () => {
    render(<Notes />);
    const deleteButton = screen.getAllByTitle("Delete")[0];
    fireEvent.click(deleteButton);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockDeleteNote).not.toHaveBeenCalled();
  });

  test("toggles between grid and list view", () => {
    render(<Notes />);
    const toggleButton = screen.getByRole("button", { name: /toggle layout/i });
  
    // Initial state: Grid view
    expect(document.querySelector(".notes-container.grid-view")).toBeInTheDocument();
  
    // Click to switch to List view
    fireEvent.click(toggleButton);
    expect(document.querySelector(".notes-container.list-view")).toBeInTheDocument();
  
    // Click to switch back to Grid view
    fireEvent.click(toggleButton);
    expect(document.querySelector(".notes-container.grid-view")).toBeInTheDocument();
  });
  
});
