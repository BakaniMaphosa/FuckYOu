export function addNoteLogic(){
  function toggleType() {
            const toggle = document.getElementById('type-toggle');
            const label = document.getElementById('type-label');
            label.innerText = toggle.checked ? 'Project' : 'Note';
        }

        function handleSubmit(event) {
            event.preventDefault();
            const type = document.getElementById('type-label').innerText;
            const title = document.getElementById('title').value;
            // You can replace this with your actual logic
            console.log(`${type} "${title}" has been added to your board.`);
        }

const typeToggle = document.getElementById("type-toggle");
const createForm = document.getElementById("create-form");
const WindowLevel = document.getElementById("WindowLevel");


const overlay = document.getElementById("WindowLevel");

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.remove();
  }
});


if (typeToggle) {
  typeToggle.addEventListener("change", () => {
    toggleType();
  });
}

if (createForm) {
  createForm.addEventListener("submit", (event) => {
    handleSubmit(event);
    document.getElementById("WindowLevel")?.remove();

  });
}



}