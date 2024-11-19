import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfirmationDialog from "../ConfirmationDialog";


describe("ConfirmationDialog Component", () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    show: true,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
    message: "Are you sure you want to proceed?",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the dialog when 'show' is true", () => {
    render(<ConfirmationDialog {...defaultProps} />);
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  test("does not render the dialog when 'show' is false", () => {
    render(<ConfirmationDialog {...defaultProps} show={false} />);
    expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
  });

  test("calls 'onCancel' when the Cancel button is clicked", () => {
    render(<ConfirmationDialog {...defaultProps} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test("calls 'onConfirm' when the Confirm button is clicked", () => {
    render(<ConfirmationDialog {...defaultProps} />);
    fireEvent.click(screen.getByText("Confirm"));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  test("calls 'onCancel' when the modal is closed via the close button", () => {
    render(<ConfirmationDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test("displays the correct message", () => {
    const customMessage = "This is a custom confirmation message.";
    render(<ConfirmationDialog {...defaultProps} message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});
