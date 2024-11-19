import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import NoteEditor from "../NoteEditor";
import { useFolderContext } from "../../Contexts/FolderContext";

// Mock the useFolderContext hook
jest.mock("../../Contexts/FolderContext", () => ({
  useFolderContext: jest.fn(),
}));

describe("NoteEditor Component", () => {
  const mockSetCurrentNote = jest.fn();
  const mockEditNote = jest.fn();

  const defaultContext = {
    currentNote: {
      id: "1",
      content: "This is the original note content.",
    },
    setCurrentNote: mockSetCurrentNote,
    editNote: mockEditNote,
  };

  beforeEach(() => {
    (useFolderContext as jest.Mock).mockReturnValue(defaultContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders note content when not in edit mode", () => {
    render(<NoteEditor />);
    expect(screen.getByText("This is the original note content.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  test("toggles edit mode when edit button is clicked", async () => {
    render(<NoteEditor />);
  
    // Check initial state: Not in edit mode
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  
    // Toggle to edit mode
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
  
    // Wait for the textarea to appear (since state change triggers re-render)
    const textarea = await screen.findByRole("textbox");  // Changed role to "textbox"
    expect(textarea).toBeInTheDocument();
  
    // Check for the cancel button when in edit mode
    expect(screen.getByRole("button", { name: /cancel edit/i })).toBeInTheDocument();
  
    // Toggle back to view mode
    fireEvent.click(screen.getByRole("button", { name: /cancel edit/i }));
    
    // Ensure the textarea is not present when exiting edit mode
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();  // Changed role to "textbox"
  });
  
  

  test("displays error message if saving an empty note", async () => {
    render(<NoteEditor />);
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    
    // Clear the content and try to save
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText("Please add some content to your note before saving.")).toBeInTheDocument();
    });
  });

  test("calls editNote function with new content when saved", async () => {
    render(<NoteEditor />);
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    // Change content
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Updated note content." } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockEditNote).toHaveBeenCalledWith("1", "Updated note content.");
      expect(mockSetCurrentNote).toHaveBeenCalledWith({
        id: "1",
        content: "Updated note content.",
      });
    });
  });

  test("calls handleBack function when back button is clicked", () => {
    render(<NoteEditor />);
    fireEvent.click(screen.getByRole("button", { name: /← back/i }));
    expect(mockSetCurrentNote).toHaveBeenCalledWith(null);
  });

  test("does not render editor actions if currentNote is null", () => {
    (useFolderContext as jest.Mock).mockReturnValue({
      currentNote: null,
      setCurrentNote: mockSetCurrentNote,
      editNote: mockEditNote,
    });

    render(<NoteEditor />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
  });
});
