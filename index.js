import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js'
import { getDatabase, 
         ref, 
         push,
         onValue,
         remove
} from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js'

const endorsementInputEl = document.getElementById('endorsement-input')
const endorsementsSection = document.getElementById('endorsements')
const form = document.getElementById('form')
const from = document.getElementById('from')
const to = document.getElementById('to')

const firebaseConfig = {
    databaseURL: 'https://we-are-the-champions-d748d-default-rtdb.firebaseio.com/'
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const endorsementsDB = ref(database, "endorsements")

// when all the required fields in the form have been populated
form.addEventListener('submit', function(e) {
    e.preventDefault()

    // extract the endorsement data from the DOM
    const endorsementText = endorsementInputEl.value
    const endorsementFrom = from.value
    const endorsementTo = to.value

    // push the endorsement to the database
    push(endorsementsDB, {endorsementText, endorsementFrom, endorsementTo})

    clearTextFields()
})

// when the database resets
onValue(endorsementsDB, function(snapshot) {
    if (snapshot.exists()) {
        // get the information stored in the database
        const data = Object.entries(snapshot.val())

        // clear the endorsements sections of the previous data (becauase now the snapshot looks different)
        endorsementsSection.innerHTML = ''

        // for each currently present endorsement
        data.forEach(endorsementContent => {
            // add it to the endorsements section
            appendEndorsementToEndorsementsSection(endorsementContent)
        })
    } else {
        endorsementsSection.textContent = "No endorsements written yet"
    }
})

function appendEndorsementToEndorsementsSection(endorsement) {
    const endorsementID = endorsement[0]
    const { endorsementText, endorsementFrom, endorsementTo } = endorsement[1]

    let endorsementEl = `
        <div class="endorsement-container" id="endorsement-container">
            <i class="fa-solid fa-x delete-icon" id="delete-icon"></i>
            <p class="from">From ${endorsementFrom}</p>
            <p class="endorsement">${endorsementText}</p>
            <p class="to">To ${endorsementTo}</p>
        </div>
    `
    // write the endorsementEl to the top of endorsements section
    // this way is better than using '.innerHTML' because the previous HTML data (and thus event listeners) don't get overwritten (or erased)
    // on subsequent usages of .innerHTML
    endorsementsSection.insertAdjacentHTML('afterbegin', endorsementEl)

    // extract the endorsementEl from the DOM to be able to add a click event to the delete icon
    endorsementEl = document.getElementById('endorsement-container')

    // add a click event listener to the 'delete-icon' in the endorsement
    endorsementEl.firstElementChild.addEventListener('click', function() {
        const locationOfEndorsementInDB = ref(database, `endorsements/${endorsementID}`)

        // remove this endorsement from the database and UI
        remove(locationOfEndorsementInDB)
    })
}

function clearTextFields() {
    // clear endorsement textarea
    endorsementInputEl.value = ''
    
    // clear "From" and "To" input fields
    from.value = ''
    to.value = ''
}