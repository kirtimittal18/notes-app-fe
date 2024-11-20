# Notes Management App

A simple ReactJS app to manage user notes. Users can list notes, create folders, move notes between folders, and delete notes.

---

## Features
- **List Notes**: View notes in the selected folder.
- **New Folder**: Add a new folder to organize notes.
- **Move Notes**: Transfer notes from one folder to another.
- **Delete Notes**: Remove notes permanently.

---

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/kirtimittal/notes-app.git
   cd notes-app-fe
2. Install Dependencies
   ```npm install```
3. Start the development server:
   ```npm start```
4. Open the app in your browser:
   ```http://localhost:3000```
   

## Usage
1. Listing Notes
Select a folder from the sidebar to view its notes.
2. Creating a New Folder
Click the "New Folder" button.
Enter the folder name in the modal and save.
3. Moving Notes
Select a note and choose a target folder from the dropdown menu.
4. Deleting Notes
Click the delete button next to a note to remove it.

## Project Structure
```
src/
├── components/                         # UI components
│   ├── Notes.tsx                       # Displays notes
│   ├── Sidebar.tsx                     # Modal for creating folders and folder navigation
│   ├── ConfirmationDialog.tsx          # reusable modal for confirming dialog deletion
│   └── NoteEditor.tsx  # Handles note actions (move, delete)
├── Contexts/            # Context API for state management
├── types/               # Modals
├── App.tsx              # Main application file
├── index.tsx            # Entry point
├── App.css              # Styling
```

# 🧪 Unit Testing (Jest)
1. Install Jest:
2. Add test cases in the **/__tests__/** directory.
3. Run tests: `npm test`
