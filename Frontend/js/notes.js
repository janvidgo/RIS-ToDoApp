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
// ---------- prikaz filtriranih rezultatov ----------
function prikaziNaloge(naloge) {
  const list = document.getElementById("notesList");
  list.innerHTML = "";
  if (!naloge || naloge.length === 0) {
    list.innerHTML = '<p class="text-muted">Ni zadetkov za izbrane filtre.</p>';
    return;
  }
  naloge.forEach(note => {
    list.appendChild(createNoteCard(note));
  });
}

// ---------- obdelava filtra ----------
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

    if (params.length === 0) {
      Swal.fire("Napaka", "Vnesi vsaj en filter (ime ali napredek).", "warning");
      return;
    }

    if (min && max && parseInt(min) > parseInt(max)) {
      Swal.fire("Napaka", "Minimalni napredek ne sme biti večji od maksimalnega.", "warning");
      return;
    }

    if (!zapis && (!min || !max)) {
      Swal.fire("Napaka", "Če ne filtriraš po imenu, moraš vnesti oba napredka (min in max).", "warning");
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
      Swal.fire("Napaka", "Pri filtriranju je prišlo do napake.", "error");
    }
  });
}

// ---------- reset filter ----------
const resetButton = document.getElementById("resetFilters");
if (resetButton) {
  resetButton.addEventListener("click", () => {
    const fz = document.getElementById("filterZapis");
    const fm = document.getElementById("progressMin");
    const fx = document.getElementById("progressMax");

    if (fz) fz.value = "";
    if (fm) fm.value = "";
    if (fx) fx.value = "";

    loadNotes();
  });
}

// ---------- dodajanje novega zapisa ----------
const addNoteForm = document.getElementById("addNoteForm");
if (addNoteForm) {
  addNoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const noteName = document.getElementById("noteName").value.trim();
    const noteOpis = document.getElementById("noteOpis").value.trim();

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
      situacija: 0
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
          timer: 1200,
          showConfirmButton: false
        });
        loadNotes();
      } else {
        const errorText = await response.text();
        Swal.fire('Napaka', errorText || 'Pri dodajanju je prišlo do napake.', 'error');
      }
    } catch (err) {
      console.error("Napaka pri dodajanju:", err);
      Swal.fire('Napaka', 'Ni povezave s strežnikom.', 'error');
    }
  });
}

// ---------- odpre modal za izvoz ----------
const exportBtn = document.getElementById("exportBtn");
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    const modal = new bootstrap.Modal(document.getElementById("exportModal"));
    modal.show();
  });
}

// ---------- pridobi vidne zapise za izvoz ----------
function getVisibleNotes() {
  return Array.from(document.querySelectorAll(".note-card")).map(card => {
    const title = card.querySelector(".note-title").innerText;
    const opis = card.querySelector(".note-opis").innerText;
    const progressBar = card.querySelector(".progress-bar");
    const napredek = progressBar ? progressBar.style.width : "0%";

    return { ime: title, opis: opis, napredek: napredek };
  });
}

// ---------- izvozi kot CSV ----------
function exportCSV() {
  const notes = getVisibleNotes();
  if (notes.length === 0) {
    Swal.fire("Ni rezultatov", "Ni vidnih nalog za izvoz.", "warning");
    return;
  }

  let csv = "Ime,Opis,Napredek\n";
  notes.forEach(n => {
    csv += `"${n.ime}","${n.opis}","${n.napredek}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "naloge.csv";
  link.click();
}

// ---------- izvozi kot PDF ----------
async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const notes = getVisibleNotes();
  if (notes.length === 0) {
    Swal.fire("Ni rezultatov", "Ni vidnih nalog za izvoz.", "warning");
    return;
  }

  let y = 20;
  doc.setFontSize(16);
  doc.text("Izvoz vidnih nalog", 10, 10);

  notes.forEach((n, index) => {
    doc.setFontSize(12);
    doc.text(`Naloga ${index + 1}:`, 10, y);
    y += 8;
    doc.text(`Ime: ${n.ime}`, 10, y);
    y += 6;
    doc.text(`Opis: ${n.opis}`, 10, y);
    y += 6;
    doc.text(`Napredek: ${n.napredek}`, 10, y);
    y += 12;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("naloge.pdf");
}

// ---------- event listenerji za izvoz ----------
const exportCsvBtn = document.getElementById("exportCsv");
if (exportCsvBtn) {
  exportCsvBtn.addEventListener("click", exportCSV);
}

const exportPdfBtn = document.getElementById("exportPdf");
if (exportPdfBtn) {
  exportPdfBtn.addEventListener("click", exportPDF);
}

// Google Calendar variables
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
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  });
}
});

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    googleUser = gapi.auth2.getAuthInstance().currentUser.get();
    googleToken = googleUser.getAuthResponse().access_token;
    document.getElementById('googleStatus').innerHTML = '✅ Povezano z Google Koledarjem';
    document.getElementById('connectGoogleBtn').textContent = 'Povezano!';
    document.getElementById('connectGoogleBtn').disabled = true;
  } else {
    document.getElementById('googleStatus').innerHTML = '';
  }
}

document.getElementById('connectGoogleBtn').addEventListener('click', () => {
  gapi.auth2.getAuthInstance().signIn();
});

// Sinhroniziraj nalogo
async function syncToGoogleCalendar(note) {
  if (!googleToken) return;

  const datum = note.datum ? new Date(note.datum).toISOString().split('T')[0] : null;

  const payload = {
    credential: googleUser.getAuthResponse().id_token,
    accessToken: googleToken,
    zapisID: note.zapisID.toString(),
    zapis: note.zapis,
    opis: note.opis || '',
    situacija: note.situacija,
    datum: datum
  };

  try {
    await fetch('http://localhost:8080/api/calendar/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('Napaka pri Google sync:', err);
  }
}

// ---------- končni klic ----------
loadNotes();

