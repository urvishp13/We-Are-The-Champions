import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js'
import { getDatabase, 
         ref, 
         push,
         onValue
} from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js'

const endorsementInputEl = document.getElementById('endorsement-input')
const publishBtn = document.getElementById('publish-btn')
const endorsementsSection = document.getElementById('endorsements')

const firebaseConfig = {
    databaseURL: 'https://we-are-the-champions-d748d-default-rtdb.firebaseio.com/'
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const endorsementsDB = ref(database, "endorsements")

// when the database resets

publishBtn.addEventListener('click', function() {
    // extract the endorsement from the textarea
    const endorsement = endorsementInputEl.value

    // push it to the database
    push(endorsementsDB, endorsement)

    console.log('endorsement pushed')

    // add it to the endorsements section
    appendEndorsementToEndorsementsSection(endorsement)

    // clear it from the textarea
    clearEndorsementInputEl()
})

function appendEndorsementToEndorsementsSection(endorsementText) {
    endorsementsSection.innerHTML += `
        <div class="endorsement-wrapper">
            <p class="endorsement">${endorsementText}</p>
        </div>
    `
}

function clearEndorsementInputEl() {
    endorsementInputEl.value = ''
}