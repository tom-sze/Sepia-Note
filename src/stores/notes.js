import { defineStore } from 'pinia'
import { ref, computed } from 'vue'


const STORAGE_KEY = 'my-notes-app-data';

const DEFAULT_NOTES = [
    {
        id: 'a1',
        title: 'Welcome Note',
        date_created: Date.now(),
        date_modified: Date.now(),
        content: '## Hello World\n\nThis is the first note, stored as **Markdown**.'
    },
    {
        id: 'b2',
        title: 'Second Thought',
        date_created: Date.now(),
        date_modified: Date.now(),
        content: '1. Lists work great.\n2. We are using Pinia for state management.'
    }
];

function loadNotesFromStorage() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        try {
            return JSON.parse(storedData);
        } catch (e) {
            console.error("Error parsing stored notes:", e);
        }
    }
    return DEFAULT_NOTES;
}

function saveNotesToStorage(notesArray) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notesArray));
}

export const useNotesStore = defineStore('notes', () => {
    // ——— State ———
    const notes = ref(loadNotesFromStorage());

    // Set the first note as active, or default to the first ID found
    const activeNoteId = ref(notes.value.length > 0 ? notes.value[0].id : null);


    // ——— Getters ———
    const activeNote = computed(() => {
        return notes.value.find(note => note.id === activeNoteId.value)
    })

    // ——— Actions ———
    function selectNote(id) {
        activeNoteId.value = id
    }

    function updateActiveNoteContent(newMarkdown) {
        const note = activeNote.value
        if (note) {
            note.content = newMarkdown
            note.date_modified = Date.now() // Update modification date

            // persist the entire array after the note is updated
            saveNotesToStorage(notes.value);
        }
    }

    // add addNote and deleteNote here, ensure they call saveNotesToStorage

    return {
        notes,
        activeNoteId,
        activeNote,
        selectNote,
        updateActiveNoteContent
    }
})