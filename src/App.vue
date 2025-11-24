<template>
  <main>
    <NotesList class="column" />

    <div class="column">
      <div class="editorPane">
        <NoteEditor v-if="notesStore.activeNote" :key="notesStore.activeNoteId" v-model="editorContent" />
      </div>
      <div class="preview">
        <h3>Live State Preview:</h3>
        <pre>{{ editorContent }}</pre>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useNotesStore } from './stores/notes'
import NoteEditor from './components/NoteEditor.vue'
import NotesList from './components/NotesList.vue'

const notesStore = useNotesStore()

// This computed property handles the binding (v-model) to the active note's content.
const editorContent = computed({
  get() {
    // Return the content of the active note, or an empty string if none is active
    return notesStore.activeNote ? notesStore.activeNote.content : ''
  },
  set(newValue) {
    // When the editor updates (v-model), call the Pinia action
    notesStore.updateActiveNoteContent(newValue)
  }
})
</script>

<style lang="css" src="./style.css"></style>