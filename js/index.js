

const colors = {
    GREEN: 'green',
    BLUE: 'blue',
    RED: 'red',
    YELLOW: 'yellow',
    PURPLE: 'purple',
}



const model = {
    notes: [],

    isShowOnlyFavorite: false,
    toggleShowOnlyFavorite(isShowOnlyFavorite) {
        this.isShowOnlyFavorite = isShowOnlyFavorite
        this.updateNotesView()
    },

    addNote(title, content, color) {
        const id = new Date().getTime()
        const isFavorite = false
        const note = { id, title, content, color, isFavorite }
        this.notes.unshift(note)
        //initial filterbox render; to stop rendering it everytime a new note is added
        if (this.notes.length === 1) view.renderFilterBox(this.notes)
        this.updateNotesView()
    },

    updateNotesView() {
        if (this.isShowOnlyFavorite) {
            const notesToRender = this.notes.filter((note) => note.isFavorite === this.isShowOnlyFavorite)
            view.renderNotes(notesToRender)
            view.renderNotesCount(notesToRender)
        } else {
            view.renderNotes(this.notes)
            view.renderNotesCount()
        }

    },

    deleteNote(id) {
        this.notes = this.notes.filter((note) => note.id !== id)
        //prevents rendering filterbox everytime delete button is pressed; only render when array is empty
        if (this.notes.length === 0){
            view.renderFilterBox(this.notes)
            //is needed to show "add notes message" after last notes are deleted
            this.toggleShowOnlyFavorite(false)
        } 
        this.updateNotesView()

    },

    toggleFavorite(id) {
        this.notes = this.notes.map((note) => {
            if (note.id === id) {
                note.isFavorite = !note.isFavorite
            }
            return note
        })
        //allows to update which notes are seen when favorite only is on, prevents rendering notes when not necessary
        if(this.isShowOnlyFavorite) this.updateNotesView()
            
    }
}

const view = {
    init() {
        this.renderNotes(model.notes)
        const form = document.querySelector('.note-form')
        form.addEventListener('submit', (event) => {
            event.preventDefault()
            const title = form.elements.title.value
            const content = form.elements.description.value
            const color = form.elements.color.value
            controller.addNote(title, content, color)
        })

    },

    clearForm (){
        const form = document.querySelector('.note-form')
        form.elements.title.value = ''
        form.elements.description.value = ''   
    },

    renderFilterBox(notes) {
        const filterBox = document.querySelector('.filter-box')
        if (notes.length !== 0) {
            filterBox.innerHTML = `
                <input class="checkbox" type="checkbox">
                <span class="checkbox-text">Показать только избранные заметки</span>
            `
            filterBox.addEventListener('change', event => {
                const state = event.target
                if (state.checked) {
                    controller.toggleShowOnlyFavorite(true)
                } else {
                    controller.toggleShowOnlyFavorite(false)
                }
            })
        } else {
            filterBox.innerHTML = ''
        }
    },

    renderNotes(notes) {
        if (notes.length === 0 && !model.isShowOnlyFavorite) {
            const emptyNotes = document.querySelector('.notes-list')
            emptyNotes.innerHTML = `
                    <p class="add-notes-msg">У вас нет еще ни одной заметки
                    Заполните поля выше и создайте свою первую заметку!</p>
            `
        } else {
            const list = document.querySelector('.notes-list')
            let notesHTML = ''
            notes.forEach(note => {
                notesHTML += `
                        <li>
                            <div class="note" colour="${note.color}">
                                <h1 class="note-name">${note.title}
                                    <div id="${note.id}" class="note-name-group" >
                                        <input ${note.isFavorite ? 'checked' : ''} type="checkbox" class="is-favorite">
                                        <img class="delete" src="./images/icons/trash.svg" alt="trash">
                                    </div>
                                </h1>
                                <p class="note-text">${note.content}</p>
                            </div>
                        </li>
            `
            })
            list.innerHTML = notesHTML


            list.addEventListener('click', event => {
                event.stopImmediatePropagation()
                if (event.target.classList.contains('delete')) {
                    const noteId = +event.target.parentElement.id
                    controller.deleteNote(noteId)
                }
            })

            list.addEventListener('change', event => {
                event.stopImmediatePropagation()
                const noteId = +event.target.parentElement.id
                controller.toggleFavorite(noteId)             
            })
                            
        }

    },

    showMessage(message) {
        const messageBox = document.querySelector('.messages-box')
        if (message === 'note added') {
            messageBox.innerHTML = `
                <div class="success-msg">
                    <img class="done" src="./images/icons/Done.svg" alt="done">
                    <span class="msg-txt">Заметка добавлена !</span>
                </div>
            `
            this.clearMessageBox()
        } else if (message === 'note deleted') {
            messageBox.innerHTML = `
                <div class="success-msg">
                    <img class="done" src="./images/icons/Done.svg" alt="done">
                    <span class="msg-txt">Заметка удалена !</span>
                </div>
            `
            this.clearMessageBox()
        } else if (message === 'fill all') {
            messageBox.innerHTML = `
                <div class="error-message">
                    <img class="warning" src="./images/icons/warning.svg" alt="warning">
                    <span class="msg-txt">Заполните все поля !</span>
                </div>
            `
            this.clearMessageBox()
        } else if (message === 'title large') {
            messageBox.innerHTML = `
                <div class="error-message title-large">
                    <img class="warning" src="./images/icons/warning.svg" alt="warning">
                    <span class="msg-txt">Максимальная длина заголовка - 50 символов !</span>
                </div>
            `
            this.clearMessageBox()
        }
    },

    clearMessageBox (){
        const messageBox = document.querySelector('.messages-box')
        setTimeout(() => {
                messageBox.innerHTML = ''
            }, 3000);
    },

    renderNotesCount() {
        const counter = document.querySelector('.total-notes-number')
        counter.textContent = model.notes.length
    }
}


const controller = {
    addNote(title, content, color) {
        if (title.length > 50) {          
            view.showMessage('title large')
        } else if ((title && title.trim() !== '') && (content && content.trim() !== '')) {
            model.addNote(title, content, color)
            view.showMessage('note added')
            view.clearForm()
        } else {
            view.showMessage('fill all')
        }
    },

    deleteNote(id) {
        model.deleteNote(id)
        view.showMessage('note deleted')
    },

    toggleFavorite(id) {
        model.toggleFavorite(id)    
    },

    toggleShowOnlyFavorite(bool) {
        model.toggleShowOnlyFavorite(bool)
    }
}

function init() {
    view.init()
}

init()