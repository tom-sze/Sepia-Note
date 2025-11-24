<template>
	<div class="editorWrapper">
		<editor-content :editor="editor" class="editorContent" />
	</div>
</template>

<script setup>
import { onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'

const props = defineProps({
	modelValue: {
		type: String,
		default: ''
	}
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
	content: props.modelValue,
	extensions: [
		StarterKit,
		Markdown,
	],
	onUpdate: ({ editor }) => {
		const md = editor.storage.markdown.getMarkdown()
		emit('update:modelValue', md)
	},
})

onBeforeUnmount(() => {
	editor.value?.destroy()
})
</script>

<style lang="css" src="./NoteEditor.css"></style>