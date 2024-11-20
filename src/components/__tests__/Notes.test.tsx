import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { Notes } from "../Notes";
import { useFolderContext } from "../../Contexts/FolderContext";
import ConfirmationDialog from "../ConfirmationDialog";

jest.mock("../../Contexts/FolderContext", () => ({
  useFolderContext: jest.fn(),
}));

jest.mock("../ConfirmationDialog", () => ({
  __esModule: true,
  default: jest.fn(({ show, onConfirm, onCancel, message }) =>
    show ? (
      <div data-testid="confirmation-dialog">
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null
  ),
}));

const mockAddNote = jest.fn();
const mockEditNote = jest.fn();
const mockDeleteNote = jest.fn();
const mockSetCurrentNote = jest.fn();
const mockSetCurrentNoteId = jest.fn();

const defaultContext = {
  notes: [],
  selectedFolderId: null,
  addNote: mockAddNote,
  editNote: mockEditNote,
  deleteNote: mockDeleteNote,
  setCurrentNote: mockSetCurrentNote,
  deletedNotes: [],
  currentNoteId: null,
  setCurrentNoteId: mockSetCurrentNoteId,
};

describe("Notes Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFolderContext as jest.Mock).mockReturnValue(defaultContext);
  });

  test("renders 'Select a folder to view notes' message when no folder is selected", () => {
    render(<Notes />);
    expect(
      screen.getByText("Select a folder to view notes")
    ).toBeInTheDocument();
  });

  test("renders notes when provided", () => {
    const notes = [
      {
        id: "1",
        content: "First Note",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "2",
        content: "Second Note",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    (useFolderContext as jest.Mock).mockReturnValue({
      ...defaultContext,
      notes,
      selectedFolderId: "folder1",
    });

    render(<Notes />);

    expect(screen.getByText("First Note")).toBeInTheDocument();
    expect(screen.getByText("Second Note")).toBeInTheDocument();
  });

  test("toggles new note form visibility", () => {
    (useFolderContext as jest.Mock).mockReturnValue({
      ...defaultContext,
      selectedFolderId: "folder1",
    });

    render(<Notes />);

    const addButton = screen.getByText("Add Note");
    fireEvent.click(addButton);

    expect(
      screen.getByPlaceholderText("Write your note here...")
    ).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(
      screen.queryByPlaceholderText("Write your note here...")
    ).not.toBeInTheDocument();
  });

  test("triggers delete confirmation dialog", () => {
    const notes = [
      {
        id: "1",
        content: "Note to Delete",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    (useFolderContext as jest.Mock).mockReturnValue({
      ...defaultContext,
      notes,
      selectedFolderId: "folder1",
    });

    render(<Notes />);

    const deleteIcon = screen.getByTitle("Delete");
    fireEvent.click(deleteIcon);

    expect(screen.getByTestId("confirmation-dialog")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this note?")
    ).toBeInTheDocument();
  });

  test("calls deleteNote on confirmation", async () => {
    const notes = [
      {
        id: "1",
        content: "Note to Delete",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    (useFolderContext as jest.Mock).mockReturnValue({
      ...defaultContext,
      notes,
      selectedFolderId: "folder1",
    });

    render(<Notes />);

    const deleteIcon = screen.getByTitle("Delete");
    fireEvent.click(deleteIcon);

    const confirmButton = screen.getByText("Confirm");
    fireEvent.click(confirmButton);

    await waitFor(() => expect(mockDeleteNote).toHaveBeenCalledWith("1"));
  });

  test("toggles layout view", () => {
    (useFolderContext as jest.Mock).mockReturnValue({
      ...defaultContext,
      selectedFolderId: "folder1",
    });

    render(<Notes />);

    const toggleButton = screen.getByLabelText("Toggle Layout");
    fireEvent.click(toggleButton);

    // Check the state change instead of the text content
    expect(toggleButton).toHaveAttribute("aria-label", "Toggle Layout");
    const icon = toggleButton.querySelector("svg");
    expect(icon).toHaveClass("svg-inline--fa fa-table-cells-large");
  });
});
