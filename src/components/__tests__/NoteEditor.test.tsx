import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NoteEditor from "../NoteEditor";
import { useAppContext } from "../../Contexts/AppContext";

jest.mock("../../Contexts/AppContext", () => ({
  useAppContext: jest.fn(),
}));

describe("NoteEditor", () => {
  const mockSetCurrentNote = jest.fn();
  const mockEditNote = jest.fn();
  const mockNote = {
    id: "1",
    content: "Test note content",
  };

  const defaultContext = {
    currentNote: mockNote,
    setCurrentNote: mockSetCurrentNote,
    editNote: mockEditNote,
  };

  // Mock the useAppContext hook
  beforeEach(() => {
    // Assert that useAppContext is treated as a Jest mock
    (useAppContext as jest.Mock).mockReturnValue(defaultContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the current note content", () => {
    render(<NoteEditor />);

    expect(
      screen.getByRole("description", { name: "Note Content" })
    ).toHaveTextContent("Test note content");
  });

  it("enters edit mode when the note content is clicked", () => {
    render(<NoteEditor />);

    const contentDiv = screen.getByRole("description", {
      name: "Note Content",
    });
    fireEvent.click(contentDiv);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue("Test note content");
  });

  it("handles content change and autosaves after a delay", async () => {
    render(<NoteEditor />);

    fireEvent.click(screen.getByRole("description", { name: "Note Content" }));

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Updated content" } });

    await waitFor(() => expect(mockEditNote).not.toHaveBeenCalled()); // Ensure no immediate save

    await waitFor(
      () => expect(mockEditNote).toHaveBeenCalledWith("1", "Updated content"),
      {
        timeout: 2000, // Account for the debounce delay in autosave
      }
    );
  });

  it("returns to the main view when the back button is clicked", () => {
    render(<NoteEditor />);

    fireEvent.click(screen.getByText("← Back"));
    expect(mockSetCurrentNote).toHaveBeenCalledWith(null);
  });

  it("closes edit mode when the textarea loses focus", () => {
    render(<NoteEditor />);

    fireEvent.click(screen.getByRole("description", { name: "Note Content" }));

    const textarea = screen.getByRole("textbox");
    fireEvent.blur(textarea);

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("displays an autosaving message while saving", async () => {
    render(<NoteEditor />);

    fireEvent.click(screen.getByRole("description", { name: "Note Content" }));

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Updated content" } });
    jest.runAllTimers();
    await waitFor(() =>
      expect(screen.getByText("Auto-saving...")).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.queryByText("Auto-saving...")).not.toBeInTheDocument()
    );
  });
});
