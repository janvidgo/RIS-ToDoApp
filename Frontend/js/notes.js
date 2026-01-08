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
  const color = getProgressColor(note.situacija || 0);

  const wrapper = document.createElement('div');
  wrapper.classList.add('col-md-4');

  // Formatiraj datum za lep prikaz
  const rokText = note.datum
    ? new Date(note.datum).toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'Brez roka';

  const rokClass = note.datum ? 'text-primary fw-bold' : 'text-muted';

  wrapper.innerHTML = `
    <div class="card p-3 shadow-sm note-card">
      <div class="note-header" style="display:flex; justify-content: space-between; align-items: center;">
        <h5 class="note-title mb-0">${escapeHtml(note.zapis)}</h5>
        <div class="note-actions">
          <button class="edit-button btn btn-sm btn-outline-primary"><i class="fa-solid fa-pencil"></i></button>
          <button class="delete-button btn btn-sm btn-outline-danger"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>
      <h6 class="note-opis mt-2" style="color:gray">${escapeHtml(note.opis || 'Brez opisa')}</h6>

      <!-- ROK NALOGE -->
      <p class="mb-2 mt-3"><i class="fa-solid fa-calendar-days me-1"></i> 
        <span class="${rokClass}">Rok: ${rokText}</span>
      </p>

      <div class="progresss mt-3" style="cursor:pointer;">
        <div class="progress-container" style="width: 100%; background: #eee; border-radius: 8px;">
          <div class="progress-bar" style="width: ${Number(note.situacija)}%; height: 14px; background: ${color}; border-radius: 8px; transition: width 0.3s;"></div>
        </div>
        <p class="progress-text text-center mt-2 mb-0">${Number(note.situacija)}%</p>
      </div>

      <!-- DIV ZA SLIKE -->
      <div class="note-images mt-3">
        <div class="images-list d-flex flex-wrap gap-2 mb-2"></div>
        <input type="file" class="add-image-input form-control form-control-sm" accept="image/*">
        <button class="btn btn-sm btn-secondary mt-1 add-image-btn w-100">Dodaj sliko</button>
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
        img.src = slika.slika;
        img.style.width = "150px";
        img.style.height = "150px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";
        img.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
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
    if (!addImageInput.files.length) return Swal.fire("Napaka", "Izberi sliko!", "warning");

    const formData = new FormData();
    formData.append("file", addImageInput.files[0]);
    formData.append("zapisID", note.zapisID);

    try {
      const res = await fetch("http://localhost:8080/slike", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        Swal.fire({ icon: "success", title: "Slika dodana!", timer: 1000, showConfirmButton: false });
        addImageInput.value = "";
        loadNoteImages();
      } else {
        const errorText = await res.text();
        Swal.fire("Napaka", errorText || "Napaka pri dodajanju slike.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Napaka", "Ni povezave s strežnikom.", "error");
    }
  });

  // Urejanje napredka
  if (progressDiv) {
    progressDiv.addEventListener('click', async () => {
      const current = Number(note.situacija) || 0;
      const { value: newProgress } = await Swal.fire({
        title: 'Uredi napredek',
        html: `
          <input id="swalProgressRange" type="range" min="0" max="100" step="5" value="${current}" class="swal2-range">
          <p class="mt-3">Napredek: <strong><span id="swalProgressValue">${current}</span>%</strong></p>
        `,
        showCancelButton: true,
        confirmButtonText: 'Shrani',
        didOpen: () => {
          const range = document.getElementById('swalProgressRange');
          const valueText = document.getElementById('swalProgressValue');
          const update = () => {
            valueText.textContent = range.value;
            const color = getProgressColor(range.value);
            range.style.background = `linear-gradient(to right, ${color} ${range.value}%, #ddd ${range.value}%)`;
          };
          update();
          range.addEventListener('input', update);
        },
        preConfirm: () => parseInt(document.getElementById('swalProgressRange').value)
      });

      if (newProgress !== undefined) {
        try {
          await fetch(`http://localhost:8080/zapis/${note.zapisID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ situacija: newProgress })
          });
          Swal.fire('Uspešno!', 'Napredek posodobljen.', 'success');
          loadNotes();
        } catch (err) {
          Swal.fire('Napaka', 'Pri posodobitvi napredka.', 'error');
        }
      }
    });
  }

  // Urejanje imena, opisa in roka
  if (editButton) {
    editButton.addEventListener('click', async (e) => {
      e.stopPropagation();

      // 1. Ime
      const { value: newName } = await Swal.fire({
        title: 'Uredi ime naloge',
        input: 'text',
        inputValue: note.zapis,
        showCancelButton: true,
        inputValidator: (v) => !v.trim() && 'Ime ne sme biti prazno!'
      });
      if (!newName) return;

      // 2. Opis
      const { value: newOpis } = await Swal.fire({
        title: 'Uredi opis',
        input: 'textarea',
        inputValue: note.opis || '',
        showCancelButton: true
      });
      if (newOpis === null) return;

      // 3. Rok
      const currentDate = note.datum ? new Date(note.datum).toISOString().split('T')[0] : '';
      const { value: newDueDate } = await Swal.fire({
        title: 'Uredi rok naloge',
        html: `<input type="date" id="swalDueDate" class="swal2-input" value="${currentDate}">`,
        showCancelButton: true,
        confirmButtonText: 'Shrani vse spremembe',
        preConfirm: () => document.getElementById('swalDueDate').value || null
      });
      if (newDueDate === null) return;

      // Pošlji vse spremembe na backend
      try {
        const response = await fetch(`http://localhost:8080/zapis/details/${note.zapisID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            zapis: newName,
            opis: newOpis,
            datum: newDueDate
          })
        });

        if (response.ok) {
          Swal.fire({ icon: 'success', title: 'Posodobljeno!', timer: 1200, showConfirmButton: false });
          loadNotes();
        } else {
          Swal.fire('Napaka', 'Pri shranjevanju sprememb.', 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Napaka', 'Ni povezave s strežnikom.', 'error');
      }
    });
  }

  // Brisanje
  if (deleteButton) {
    deleteButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      const result = await Swal.fire({
        title: 'Ali res želiš izbrisati nalogo?',
        text: 'To dejanje je nepovratno!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Da, izbriši',
        cancelButtonText: 'Prekliči'
      });

      if (result.isConfirmed) {
        try {
          await fetch(`http://localhost:8080/zapis/${note.zapisID}`, { method: 'DELETE' });
          Swal.fire({ icon: 'success', title: 'Izbrisano!', timer: 1000, showConfirmButton: false });
          loadNotes();
        } catch (err) {
          Swal.fire('Napaka', 'Pri brisanju.', 'error');
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
      container.innerHTML = '<p class="text-center text-muted">Ni nalog. Dodaj prvo!</p>';
      return;
    }
    notes.forEach(note => container.appendChild(createNoteCard(note)));
  } catch (err) {
    console.error('Napaka pri nalaganju:', err);
    document.getElementById('notesList').innerHTML = '<p class="text-danger">Napaka pri povezavi s strežnikom.</p>';
  }
}

// ---------- dodajanje nove naloge ----------
const addNoteForm = document.getElementById("addNoteForm");
if (addNoteForm) {
  addNoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const noteName = document.getElementById("noteName").value.trim();
    const noteOpis = document.getElementById("noteOpis").value.trim();
    const dueDate = document.getElementById("noteDueDate").value; // YYYY-MM-DD

    if (!noteName) {
      Swal.fire("Napaka", "Vnesi ime naloge!", "warning");
      return;
    }
    if (!noteOpis) {
      Swal.fire("Napaka", "Vnesi opis naloge!", "warning");
      return;
    }

    const newNote = {
      zapis: noteName,
      opis: noteOpis,
      situacija: 0,
      datum: dueDate || null
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
        document.getElementById("noteDueDate").value = "";
        Swal.fire({ icon: 'success', title: 'Naloga dodana!', timer: 1200, showConfirmButton: false });
        loadNotes();
      } else {
        const error = await response.text();
        Swal.fire('Napaka', error || 'Pri dodajanju.', 'error');
      }
    } catch (err) {
      Swal.fire('Napaka', 'Ni povezave s strežnikom.', 'error');
    }
  });
}

// ---------- filter, reset, izvoz (ostane enako kot prej) ----------
const filtrirajForm = document.getElementById("filterForm");
if (filtrirajForm) {
  filtrirajForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const zapis = document.getElementById("filterZapis").value.trim();
    const min = document.getElementById("progressMin").value.trim();
    const max = document.getElementById("progressMax").value.trim();

    let params = [];
    if (zapis) params.push(`zapis=${encodeURIComponent(zapis)}`);
    if (min) params.push(`min=${min}`);
    if (max) params.push(`max=${max}`);

    if (params.length === 0) return Swal.fire("Napaka", "Vnesi vsaj en filter.", "warning");

    const url = `http://localhost:8080/zapis/filter?${params.join("&")}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      prikaziNaloge(data);
    } catch (err) {
      Swal.fire("Napaka", "Pri filtriranju.", "error");
    }
  });
}

function prikaziNaloge(naloge) {
  const list = document.getElementById("notesList");
  list.innerHTML = "";
  if (!naloge || naloge.length === 0) {
    list.innerHTML = '<p class="text-muted">Ni zadetkov.</p>';
    return;
  }
  naloge.forEach(note => list.appendChild(createNoteCard(note)));
}

document.getElementById("resetFilters")?.addEventListener("click", () => {
  document.getElementById("filterZapis").value = "";
  document.getElementById("progressMin").value = "";
  document.getElementById("progressMax").value = "";
  loadNotes();
});

// Izvoz (CSV in PDF) – ostaja enako
// ... (tvoj obstoječi kod za exportBtn, exportCSV, exportPDF itd.)

// Google Calendar – osnovna struktura (ko boš dodala Client ID)
let googleToken = null;
let googleUser = null;

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

fetch('/config')
  .then(res => res.json())
  .then(config => {
    const CLIENT_ID = config.CLIENT_ID;

    gapi.load('client:auth2', initClient);
  

function initClient() {
  gapi.client.init({  
    clientId: CLIENT_ID,
    discoveryDocs: [DISCOVERY_DOC],
    scope: SCOPES
  }).then(() => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.isSignedIn.listen(updateSigninStatus);
    updateSigninStatus(authInstance.isSignedIn.get());

    document.getElementById('connectGoogleBtn')?.addEventListener('click', () => {
      authInstance.signIn();
    });
  });
}
});

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    googleUser = gapi.auth2.getAuthInstance().currentUser.get();
    googleToken = googleUser.getAuthResponse().access_token;
    document.getElementById('googleStatus').innerHTML = '✅ Povezano z Google Koledarjem';
    document.getElementById('connectGoogleBtn').textContent = 'Povezano';
    document.getElementById('connectGoogleBtn').disabled = true;
  }
}

// Sinhroniziraj po uspešnem shranjevanju (pokliči to po loadNotes() po uspehu)
// primer: syncToGoogleCalendar(note);

// Zaženemo nalaganje nalog
loadNotes();

