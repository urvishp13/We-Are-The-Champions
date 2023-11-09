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

// when the Publish button in the UI is clicked
publishBtn.addEventListener('click', function() {
    // extract the endorsement from the textarea
    const endorsement = endorsementInputEl.value

    // push the endorsement to the database
    push(endorsementsDB, endorsement)
    
    // clear it from the textarea
    clearEndorsementInputEl()
})

// when the database resets
onValue(endorsementsDB, function(snapshot) {
    if (snapshot.exists()) {
        // get the information stored in the database
        const data = Object.values(snapshot.val())

        // clear the endorsements sections of the previous data (becauase now the snapshot looks different)
        endorsementsSection.innerHTML = ''

        // for each currently present endorsement
        data.forEach(endorsement => {
            // add it to the endorsements section
            appendEndorsementToEndorsementsSection(endorsement)
        })
    }
})

function appendEndorsementToEndorsementsSection(endorsementText) {
    const endorsementEl = `
        <div class="endorsement-wrapper">
            <p class="endorsement">${endorsementText}</p>
        </div>
    `
    endorsementsSection.innerHTML = endorsementEl + endorsementsSection.innerHTML
}

function clearEndorsementInputEl() {
    endorsementInputEl.value = ''
}