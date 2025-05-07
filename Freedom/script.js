const pleasantSound = new Audio('intro-music-black-box-saxy-blasts-12574.mp3');  // Ensure correct path to your audio file
pleasantSound.loop = true;  // Make the sound loop indefinitely
pleasantSound.volume = 0.5;  // Optional: adjust the volume (0.0 to 1.0)
// Play the sound
pleasantSound.play();


const badFreedoms = ["litter on the road", "shout in library",
                  "take someone’s toy without asking", "cut queues",
                  "make fun of someone for their clothes", "play loud music in public",
                  "ignore rules i don’t like"];
const goodFreedoms = ["play in the park", "wear shorts", "read quietly", "write with my left hand",
                       "draw what i like", "ask questions", "cry when i feel sad"];
const goodFreedomsSelfharm = ["dance in the rain", "eat with my hands",
                              "play video games"];
const arm = document.getElementById("swinging-arm");
const rightFace = document.getElementById("right-face");

const dialogueBubble = document.getElementById("dialogue-bubble");

function showDialogue(text) {
  dialogueBubble.textContent = text;
  dialogueBubble.style.opacity = 1;

  // Hide after 7 seconds
  setTimeout(() => {
    dialogueBubble.style.opacity = 0;
  }, 7000);
}

function handleFreedom(choice) {
  pleasantSound.play();

  // Reset visuals
  console.log(choice.toLowerCase());
  console.log(badFreedoms.includes(choice.toLowerCase()));
  arm.style.width = "80px";   // good freedom (safe poke)
  rightFace.classList.remove("hit");
  const pokeSound = new Audio('ouch-37243.mp3');  // Ensure the correct path to your audio file

    if (badFreedoms.includes(choice.toLowerCase())) {
        arm.style.animation = "pokeReaction 0.3s ease"; // Apply poke animation for bad freedoms
        arm.style.width = "170px";
        pokeSound.play();  // Play the poke sound when bad freedom is selected
        rightFace.textContent = "😡";
        rightFace.classList.add("hit");
        showDialogue("Ouch! Your Freedom stops at my nose!");
      } else if (goodFreedomsSelfharm.includes(choice.toLowerCase())) {
        arm.style.animation = "extendArm 2s ease-in-out infinite"; // Looping arm extension animation
        arm.style.width = "90px";
        rightFace.textContent = "🙂";
        showDialogue("Keep going! Just be careful?");
      } else {
        arm.style.animation = "extendArm 2s ease-in-out infinite"; // Looping arm extension animation
        arm.style.width = "90px";
        rightFace.textContent = "🙂";
        showDialogue("You're a Freedom star!");
      }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Get N Random elements from an array
function getRandomItems(array, N) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, N);
}
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index
    // Swap elements
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const button_array = [];
button_array.push(getRandomItems(badFreedoms,2));
button_array.push(getRandomItems(goodFreedoms,1));
button_array.push(getRandomItems(goodFreedomsSelfharm,1));
let flat_button_array = shuffleArray(button_array.flat(Infinity));

console.log(flat_button_array)
const button1 = document.getElementById("button1");
button1.innerHTML = capitalize(flat_button_array[0]);  
button1.onclick = () => handleFreedom(flat_button_array[0].toLowerCase());

const button2 = document.getElementById("button2");
button2.innerHTML = capitalize(flat_button_array[1]);  
button2.onclick = () => handleFreedom(flat_button_array[1].toLowerCase());

const button3 = document.getElementById("button3");
button3.innerHTML = capitalize(flat_button_array[2]);  
button3.onclick = () => handleFreedom(flat_button_array[2].toLowerCase());

const button4 = document.getElementById("button4");
button4.innerHTML = capitalize(flat_button_array[3]);  
button4.onclick = () => handleFreedom(flat_button_array[3].toLowerCase());
