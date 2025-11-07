async function loadNotes() {
  const res = await fetch(`http://localhost:8080/zapis`);
  const notes = await res.json();

  const container = document.getElementById('notesList');
  container.innerHTML = '';

  if (notes.length === 0) {
    container.innerHTML = '<p>Ni zapisov.</p>';
    return;
  }

  notes.forEach(note => {
    const color = getProgressColor(note.situacija);
    const div = document.createElement('div');
    div.classList.add('col-md-4');
      div.innerHTML = `
        <div class="card p-3 shadow-sm">
          <div style="display:flex; justify-content: space-between; align-items: center;">
            <h5>${note.zapis}</h5>
            <div>
              <button class="edit-button"><i class="fa-solid fa-pencil"></i></button>
              <button class="delete-button"><i class="fa-solid fa-xmark"></i></button>
            </div>
          </div>
          <h6 style="color:gray">${note.opis}</h6>
          <div class="progresss">
            <div id="progress-container" style="width: 100%; background: #eee; border-radius: 8px;">
              <div id="progress-bar" style="width: ${note.situacija}%; height: 12px; background: ${color}; border-radius: 8px; transition: width 0.3s;"></div>
            </div>
            <p id="progress-text" style="margin-top: 10px;">${note.situacija}%</p>
          </div>
        </div>
      `;
 
    container.appendChild(div);

    const naslov = div.querySelector('.progresss');
    const deleteButton = div.querySelector('.delete-button');
    const editButton = div.querySelector('.edit-button');
    if (naslov){
      naslov.addEventListener('click', async () => {
        const { value: newProgress } = await Swal.fire({
          title: 'Uredi napredek',
          html: `
            <input id="progressRange" type="range" min="0" max="100" step="1" value="${note.situacija}"  style="width: 100%; height: 10px; border-radius: 8px; appearance: none; outline: none;">
            <p style="margin-top: 10px;">Napredek: <span id="progressValue">${note.situacija}</span>%</p>
          `,
          showCancelButton: true,
          confirmButtonText: 'Shrani',
          cancelButtonText: 'Prekliči',
          didOpen: () => {
            const range = Swal.getPopup().querySelector('#progressRange');
            const valueText = Swal.getPopup().querySelector('#progressValue');

             function getProgressColor(value) {
              if (value <= 50) {
                const ratio = value / 50;
                const r = 255;
                const g = Math.round(255 * ratio);
                return `rgb(${r}, ${g}, 0)`;
              } else {
                const ratio = (value - 50) / 50;
                const r = Math.round(255 * (1 - ratio));
                const g = 255;
                return `rgb(${r}, ${g}, 0)`;
              }
            } 

            function updateSliderColor(value) {
              const color = getProgressColor(value);
              range.style.background = `linear-gradient(to right, ${color} ${value}%, #eee ${value}%)`;
            }
            updateSliderColor(range.value);

            range.addEventListener('input', () => {
              valueText.textContent = range.value;
              updateSliderColor(range.value);
            });
          },
          preConfirm: () => {
            const range = Swal.getPopup().querySelector('#progressRange');
            return parseInt(range.value);
          }
        });

          if (newProgress !== undefined){
            try {
              await fetch(`http://localhost:8080/zapis/${note.zapisID}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ situacija: newProgress}) 
              });
              
              await Swal.fire({
                icon: 'success',
                title: 'Posodobljeno!',
                text: 'Naloga je bila uspešno posodobljena.',
                timer: 1500,
                showConfirmButton: false
              });

              loadNotes();
              
            } catch (error) {
            
            console.error('Napaka pri posodobitvi:', error);
          }
        }
      }
      );
    }

    if (editButton){
      editButton.addEventListener('click', async (e) => {
        e.stopPropagation(); 
        const { value: newName } = await Swal.fire({
          title: 'Uredi zapis',
          input: 'text',
          inputLabel: 'Novo ime zapisa:',
          inputValue: note.zapis,
          showCancelButton: true,
          confirmButtonText: 'Shrani',
          cancelButtonText: 'Prekliči',
          inputValidator: (value) => {
            if (!value.trim()) {
              return 'Ime ne sme biti prazno!';
            }
          }
        });

         const { value: newOpis } = await Swal.fire({
          title: 'Uredi opis',
          input: 'text',
          inputLabel: 'Novi opis:',
          inputValue: note.opis,
          showCancelButton: true,
          confirmButtonText: 'Shrani',
          cancelButtonText: 'Prekliči',
          inputValidator: (value) => {
            if (!value.trim()) {
              return 'Opis ne sme biti prazno!';
            }
          }
        });

        if (!newName) return;
        if (!newOpis) return;
          
        try{
          await fetch(`http://localhost:8080/zapis/ime/${note.zapisID}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ zapis: newName, opis: newOpis}) 
          });

          await Swal.fire({
            icon: 'success',
            title: 'Posodobljeno!',
            text: 'Naloga je bila uspešno posodobljena.',
            timer: 1500,
            showConfirmButton: false
          });

          loadNotes();
        } catch (error) {
          console.error('Napaka pri urejanju imena:', error);
        }
      });
    }

    if (deleteButton){
      deleteButton.addEventListener('click', async (e) => {
        e.stopPropagation(); 
         const result = await Swal.fire({
          title: 'Ali res želite izbrisati?',
          text: 'Tega dejanja ne boste mogli razveljaviti!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Da, izbriši',
          cancelButtonText: 'Prekliči'
        });
        
        if (result.isConfirmed){
          try {
            await fetch(`http://localhost:8080/zapis/${note.zapisID}`, {
              method: 'DELETE'
            });

            await Swal.fire({
              icon: 'success',
              title: 'Izbrisano!',
              text: 'Naloga je bila uspešno izbrisana.',
              timer: 1500,
              showConfirmButton: false
            });

            loadNotes(); 
          } catch (error) {
            console.error('Napaka pri brisanju:', error);
          }
        }
      });
    }
    container.appendChild(div);
  });

}

const filtrirajForm = document.getElementById("filterForm");
filtrirajForm.addEventListener("submit", async (e) => {
   e.preventDefault();

  const zapis = document.getElementById("filterZapis").value.trim();
  const min = document.getElementById("progressMin").value.trim();
  const max = document.getElementById("progressMax").value.trim();

  let params = [];

  if (zapis) params.push(`zapis=${encodeURIComponent(zapis)}`);
  if (min) params.push(`min=${min}`);
  if (max) params.push(`max=${max}`);

  if (params.length === 0) {
    Swal.fire("Napaka", "Vnesi vsaj en filter (ime ali napredek).", "warning");
    return;
  }

  if (min && max && parseInt(min) > parseInt(max)) {
    Swal.fire("Napaka", "Minimalni napredek ne sme biti večji od maksimalnega.", "warning");
    return;
  }

  if (!zapis && (!min || !max)) {
    Swal.fire("Napaka", "Če ne filtriraš po imenu, moraš vnesti oba napredka.", "warning");
    return;
  }

  if (zapis && ((min && !max) || (!min && max))) {
    Swal.fire("Napaka", "Če filtriraš po imenu in napredku, moraš vnesti oba napredka.", "warning");
    return;
  }

  const url = `http://localhost:8080/zapis/filter?${params.join("&")}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    prikaziNaloge(data);
  } catch (error) {
    console.error("Napaka pri filtriranju:", error);
  }
});

const resetButton = document.getElementById("resetFilters");
resetButton.addEventListener("click", () => {
  document.getElementById("filterZapis").value = "";
  document.getElementById("progressMin").value = "";
  document.getElementById("progressMax").value = "";
  loadNotes();
});

function prikaziNaloge(naloge) {
  const list = document.getElementById("notesList");
  list.innerHTML = "";

  if (!naloge || naloge.length === 0) {
    list.innerHTML = `<p class="text-muted">Ni zadetkov za izbrane filtre.</p>`;
    return;
  }

  naloge.forEach(note => {
    const color = getProgressColor(note.situacija);
    const card = document.createElement("div");
    card.classList.add('col-md-4');
      card.innerHTML = `
        <div class="card p-3 shadow-sm">
          <div style="display:flex; justify-content: space-between; align-items: center;">
            <h5>${note.zapis}</h5>
            <div>
              <button class="edit-button"><i class="fa-solid fa-pencil"></i></button>
              <button class="delete-button"><i class="fa-solid fa-xmark"></i></button>
            </div>
          </div>
          <h6 style="color:gray">${note.opis}</h6>
          <div class="progresss">
            <div id="progress-container" style="width: 100%; background: #eee; border-radius: 8px;">
              <div id="progress-bar" style="width: ${note.situacija}%; height: 12px; background: ${color}; border-radius: 8px; transition: width 0.3s;"></div>
            </div>
            <p id="progress-text" style="margin-top: 10px;">${note.situacija}%</p>
          </div>
        </div>
      `;
    list.appendChild(card);
  });
}

addNoteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const noteName = document.getElementById("noteName").value.trim();
  const noteOpis = document.getElementById("noteOpis").value.trim();

  if (!noteName) return alert("Vnesi ime!");
  if (!noteOpis) return alert("Vnesi opis!");

  const newNote = {
    zapis: noteName,
    opis: noteOpis,
    progress: 0
  };

  try {
    const response = await fetch("http://localhost:8080/zapis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNote)
    });

    if (response.ok) {
      document.getElementById("noteName").value = "";
      document.getElementById("noteOpis").value = "";
      await Swal.fire({
            icon: 'success',
            title: 'Dodano!',
            text: 'Naloga je bila uspešno dodana.',
            timer: 1500,
            showConfirmButton: false
          });
      loadNotes(); 
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Napaka!',
        text: 'Pri dodajanju je prišlo do napake.',
        timer: 2000,
        confirmButtonText: 'V redu',
        confirmButtonColor: '#d33'
      });
    }
  } catch (err) {
    console.error(err);
  }
});

loadNotes();


function getProgressColor(value) {
  if (value <= 50) {
    const ratio = value / 50;
    const r = 255;
    const g = Math.round(255 * ratio);
    return `rgb(${r}, ${g}, 0)`;
  } else {
    const ratio = (value - 50) / 50;
    const r = Math.round(255 * (1 - ratio));
    const g = 255;
    return `rgb(${r}, ${g}, 0)`;
  }
}