// ---------- helper: barvna funkcija ----------
function getProgressColor(value) {
  value = Number(value);
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

// ---------- varnostna funkcija ----------
function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------- ustvarjanje kartice za en zapis ----------
function createNoteCard(note) {
  const color = getProgressColor(note.situacija);

  const wrapper = document.createElement('div');
  wrapper.classList.add('col-md-4');

  wrapper.innerHTML = `
    <div class="card p-3 shadow-sm note-card">
      <div class="note-header" style="display:flex; justify-content: space-between; align-items: center;">
        <h5 class="note-title">${escapeHtml(note.zapis)}</h5>
        <div class="note-actions">
          <button class="edit-button btn btn-sm"><i class="fa-solid fa-pencil"></i></button>
          <button class="delete-button btn btn-sm"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>
      <h6 class="note-opis" style="color:gray">${escapeHtml(note.opis)}</h6>

      <div class="progresss" style="cursor:pointer;">
        <div class="progress-container" style="width: 100%; background: #eee; border-radius: 8px;">
          <div class="progress-bar" style="width: ${Number(note.situacija)}%; height: 12px; background: ${color}; border-radius: 8px; transition: width 0.3s;"></div>
        </div>
        <p class="progress-text" style="margin-top: 10px;">${Number(note.situacija)}%</p>
      </div>

      <!-- DIV ZA SLIKE -->
      <div class="note-images mt-2">
        <div class="images-list d-flex flex-wrap gap-2">
          <!-- slike bodo dodane preko JS -->
        </div>
        <input type="file" class="add-image-input form-control form-control-sm mt-2" accept="image/*">
        <button class="btn btn-sm btn-secondary mt-1 add-image-btn">Dodaj sliko</button>
      </div>
    </div>
  `;

  attachNoteEvents(wrapper, note);
  return wrapper;
}

// ---------- pripni event listenerje na kartico ----------
function attachNoteEvents(wrapper, note) {
  const progressDiv = wrapper.querySelector('.progresss');
  const editButton = wrapper.querySelector('.edit-button');
  const deleteButton = wrapper.querySelector('.delete-button');

  const addImageBtn = wrapper.querySelector(".add-image-btn");
  const addImageInput = wrapper.querySelector(".add-image-input");
  const imagesList = wrapper.querySelector(".images-list");

  // Naloži obstoječe slike
  async function loadNoteImages() {
    try {
      const res = await fetch(`http://localhost:8080/slike/naloga/${note.zapisID}`);
      const slike = await res.json();
      imagesList.innerHTML = "";
      slike.forEach(slika => {
        const img = document.createElement("img");
        img.src = slika.slika; // url/base64
        img.style.width = "200px";
        img.style.height = "200px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "5px";
        imagesList.appendChild(img);
      });
    } catch (err) {
      console.error("Napaka pri nalaganju slik:", err);
    }
  }

  loadNoteImages();

  // Dodajanje slike
  addImageBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (!addImageInput.files.length) return Swal.fire("Napaka", "Izberi datoteko.", "warning");

    const formData = new FormData();
    formData.append("file", addImageInput.files[0]);
    formData.append("zapisID", note.zapisID);

    console.log("Pošiljam sliko za zapisID:", note.zapisID);

    try {
      const res = await fetch("http://localhost:8080/slike", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        Swal.fire({ icon: "success", title: "Slika dodana", timer: 1000, showConfirmButton: false });
        addImageInput.value = "";
        loadNoteImages();
      } else {
        const errorText = await res.text(); // <-- DODAJ TO
        console.error("Napaka od strežnika:", res.status, errorText);
        Swal.fire("Napaka", "Pri dodajanju slike je prišlo do napake.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Napaka", "Pri dodajanju slike je prišlo do napake.", "error");
    }
  });

  // ---------- urejanje napredka ----------
  if (progressDiv) {
    progressDiv.addEventListener('click', async () => {
      const current = Number(note.situacija) || 0;
      const { value: newProgress } = await Swal.fire({
        title: 'Uredi napredek',
        html: `
          <input id="swalProgressRange" type="range" min="0" max="100" step="1" value="${current}" style="width: 100%; height: 10px; border-radius: 8px; appearance: none; outline: none;">
          <p style="margin-top:10px;">Napredek: <span id="swalProgressValue">${current}</span>%</p>
        `,
        showCancelButton: true,
        confirmButtonText: 'Shrani',
        cancelButtonText: 'Prekliči',
        didOpen: () => {
          const popup = Swal.getPopup();
          const range = popup.querySelector('#swalProgressRange');
          const valueText = popup.querySelector('#swalProgressValue');
          function updateSliderColor(val) {
            const color = getProgressColor(Number(val));
            range.style.background = `linear-gradient(to right, ${color} ${val}%, #eee ${val}%)`;
          }
          updateSliderColor(range.value);
          range.addEventListener('input', () => {
            valueText.textContent = range.value;
            updateSliderColor(range.value);
          });
        },
        preConfirm: () => {
          const popup = Swal.getPopup();
          const range = popup.querySelector('#swalProgressRange');
          return parseInt(range.value);
        }
      });

      if (newProgress !== undefined) {
        try {
          await fetch(`http://localhost:8080/zapis/${note.zapisID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ situacija: newProgress })
          });
          await Swal.fire({ icon: 'success', title: 'Posodobljeno!', text: 'Napredek je bil posodobljen.', timer: 1200, showConfirmButton: false });
          loadNotes();
        } catch (err) {
          console.error('Napaka pri posodobitvi:', err);
          Swal.fire('Napaka', 'Pri posodobitvi je prišlo do napake.', 'error');
        }
      }
    });
  }

  // ---------- urejanje imena/opsisa ----------
  if (editButton) {
    editButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      const { value: newName } = await Swal.fire({
        title: 'Uredi zapis',
        input: 'text',
        inputLabel: 'Novo ime zapisa:',
        inputValue: note.zapis,
        showCancelButton: true,
        confirmButtonText: 'Naprej',
        cancelButtonText: 'Prekliči',
        inputValidator: (v) => !v.trim() && 'Ime ne sme biti prazno!'
      });

      if (!newName) return;
      const { value: newOpis } = await Swal.fire({
        title: 'Uredi opis',
        input: 'text',
        inputLabel: 'Novi opis:',
        inputValue: note.opis,
        showCancelButton: true,
        confirmButtonText: 'Shrani',
        cancelButtonText: 'Prekliči',
        inputValidator: (v) => !v.trim() && 'Opis ne sme biti prazno!'
      });

      if (!newOpis) return;

      try {
        await fetch(`http://localhost:8080/zapis/ime/${note.zapisID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zapis: newName, opis: newOpis })
        });
        await Swal.fire({ icon: 'success', title: 'Posodobljeno!', text: 'Zapis je bil posodobljen.', timer: 1200, showConfirmButton: false });
        loadNotes();
      } catch (err) {
        console.error('Napaka pri urejanju imena:', err);
        Swal.fire('Napaka', 'Pri urejanju je prišlo do napake.', 'error');
      }
    });
  }

  // ---------- brisanje ----------
  if (deleteButton) {
    deleteButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      const result = await Swal.fire({
        title: 'Ali res želite izbrisati?',
        text: 'Tega dejanja ne boste mogli razveljaviti!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Da, izbriši',
        cancelButtonText: 'Prekliči'
      });

      if (result.isConfirmed) {
        try {
          await fetch(`http://localhost:8080/zapis/${note.zapisID}`, { method: 'DELETE' });
          await Swal.fire({ icon: 'success', title: 'Izbrisano!', text: 'Naloga je bila izbrisana.', timer: 1200, showConfirmButton: false });
          loadNotes();
        } catch (err) {
          console.error('Napaka pri brisanju:', err);
          Swal.fire('Napaka', 'Pri brisanju je prišlo do napake.', 'error');
        }
      }
    });
  }
}

// ---------- naloži vse zapise ----------
async function loadNotes() {
  try {
    const res = await fetch(`http://localhost:8080/zapis`);
    const notes = await res.json();
    const container = document.getElementById('notesList');
    container.innerHTML = '';
    if (!notes || notes.length === 0) {
      container.innerHTML = '<p>Ni zapisov.</p>';
      return;
    }
    notes.forEach(note => container.appendChild(createNoteCard(note)));
  } catch (err) {
    console.error('Napaka pri nalaganju:', err);
    document.getElementById('notesList').innerHTML = '<p class="text-danger">Napaka pri nalaganju zapisov.</p>';
  }
}

// ---------- filtriranje, dodajanje, izvoz (ostalo enako kot prej) ----------
// Tukaj ohrani vse preostale funkcije iz tvojega JS (filter, reset, dodajanje, izvoz CSV/PDF)...

// ---------- končni klic ----------
loadNotes();
