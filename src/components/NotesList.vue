<template>
	<div>
		<div class="toolbar">
			<button @click="notesStore.addNote">➕ New Note</button>
		</div>

		<div class="noteList">
			<button v-for="note in notesStore.notes" :key="note.id"
				:class="['note-item', { 'active': note.id === notesStore.activeNoteId }]"
				@click="notesStore.selectNote(note.id)">
				<div class="noteTitle">{{ note.title || 'Untitled' }}</div>
				<div class="notePreview">{{ note.content.substring(0, 50) }}...</div>
			</button>
		</div>
	</div>
</template>

<script setup>
import { useNotesStore } from '../stores/notes'

const notesStore = useNotesStore()
</script>

<style lang="css" src="./NotesList.css"></style>