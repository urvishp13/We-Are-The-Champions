import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js'
import { getDatabase, 
         ref, 
         push,
         onValue,
         remove,
         update
} from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid'

// assign a new uuid to each user of the app
const thisUser = uuidv4()

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
    const likes = 0
    const isLiked = false // used to signify if endorsement has at least 1 like

    // push the endorsement to the database
    push(endorsementsDB, {endorsementText, endorsementFrom, endorsementTo, likes, isLiked})

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
    let { likes, isLiked, whoLiked } = endorsement[1]

    let liked // used to signify if the endorsement has been liked in the DOM by THIS user
    
    // if this endorsement has been liked at least once AND by this user
    if (isLiked && whoLiked.includes(thisUser)) {
        liked = 'liked' // signify their like in the UI
    }
    // else if this endorsement is liked but not by this user
    else if (whoLiked && !whoLiked.includes(thisUser)) {
        liked = ''
    }
    // else, this endorsement hasn't been liked even once, represent this state
    else {
        liked = ''
        whoLiked = []
    }

    let endorsementEl = `
        <div class="endorsement-container" id="endorsement-container">
            <i class="fa-solid fa-x delete-icon" id="delete-icon"></i>
            <p class="from">From ${endorsementFrom}</p>
            <p class="endorsement">${endorsementText}</p>
            <p class="to">To ${endorsementTo}</p>
            <p class="${liked}"><i class="fa-solid fa-heart heart-icon"></i>&nbsp;<span>${likes}</span></p>
        </div>
    `
    // write the endorsementEl to the top of endorsements section
    // this way is better than using '.innerHTML' because the previous HTML data (and thus event listeners) don't get overwritten (or erased)
    // on subsequent usages of .innerHTML
    endorsementsSection.insertAdjacentHTML('afterbegin', endorsementEl)

    // extract the endorsementEl from the DOM to be able to add a click event to the delete icon
    endorsementEl = document.getElementById('endorsement-container')

    const deleteIcon = endorsementEl.firstElementChild
    const heartIcon = endorsementEl.lastElementChild
    const locationOfEndorsementInDB = ref(database, `endorsements/${endorsementID}`)
    
    // add a click event listener to the 'delete-icon' in the endorsement
    deleteIcon.addEventListener('click', function() {
        // remove this endorsement from the database and UI
        remove(locationOfEndorsementInDB)
    })

    // add a click event to the the 'heart-icon' in the endorsement to be able to increment/decrement the endorsement's like count by 1
    heartIcon.addEventListener('click', function() {
        // if this is a unique instance of the app
        if (thisUser) {
            // set/unset liked class
            if (!liked) { // if the endorsement is not liked, make it liked
                likes++
                isLiked = true // endorsement has at least 1 like
                whoLiked.push(thisUser) // add this user to the whoLiked-this-endorsement collection
                update(locationOfEndorsementInDB, { whoLiked: whoLiked }) // update (or add) whoLiked array to database
            } else { // if it is liked and the heart icon is clicked again, unlike this endorsement
                likes--
                whoLiked.splice(whoLiked.indexOf(thisUser), whoLiked.indexOf(thisUser)) // remove this user from the whoLiked-this-endorsement collection
                if (likes === 0) {
                    isLiked = false // endorsement has no likes
                    update(locationOfEndorsementInDB, { whoLiked: null }) // remove whoLiked array from database
                } else { // endorsement has at least one like
                    update(locationOfEndorsementInDB, { whoLiked: whoLiked }) // update whoLiked array to database
                }
            }

            // write the change in likes to the database
            update(locationOfEndorsementInDB, {
                likes: likes,
                isLiked: isLiked,
            })
        }
    })
}

function clearTextFields() {
    // clear endorsement textarea
    endorsementInputEl.value = ''
    
    // clear "From" and "To" input fields
    from.value = ''
    to.value = ''
}