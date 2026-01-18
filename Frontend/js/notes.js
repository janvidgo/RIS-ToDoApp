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

// ---------- NOVO: Funkcija za preverjanje statusa sinhronizacije ----------
async function getSyncStatus(zapisID) {
  try {
    const res = await fetch(`http://localhost:8080/api/calendar/status/${zapisID}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Napaka pri pridobivanju statusa:', err);
  }
  return { status: 'NI_SINHRONIZIRAN', message: '', eventLink: null };
}

// ---------- NOVO: Ikona in barva za status ----------
function getSyncStatusBadge(status) {
  const badges = {
    'NI_SINHRONIZIRAN': { icon: '⚪', text: 'Ni sinhroniziran', class: 'bg-secondary' },
    'V_TEKU': { icon: '🔄', text: 'Sinhronizacija...', class: 'bg-info' },
    'USPESNO': { icon: '✅', text: 'Sinhronizirano', class: 'bg-success' },
    'NAPAKA': { icon: '❌', text: 'Napaka', class: 'bg-danger' }
  };
  return badges[status] || badges['NI_SINHRONIZIRAN'];
}

// ---------- ustvarjanje kartice za en zapis ----------
async function createNoteCard(note) {
  const color = getProgressColor(note.situacija || 0);

  // Pridobi status sinhronizacije
  const syncStatus = await getSyncStatus(note.zapisID);
  const badge = getSyncStatusBadge(syncStatus.status);

  const wrapper = document.createElement('div');
  wrapper.classList.add('col-md-4');
  wrapper.dataset.zapisId = note.zapisID;

  // Formatiraj datum za lep prikaz
  const rokText = note.datum
      ? new Date(note.datum).toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'Brez roka';

  const rokClass = note.datum ? 'text-primary fw-bold' : 'text-muted';

  // Link do Google Calendar (če obstaja)
  const calendarLinkHtml = syncStatus.eventLink
      ? `<a href="${syncStatus.eventLink}" target="_blank" class="btn btn-sm btn-outline-primary mt-2 w-100">
         <i class="fa-brands fa-google"></i> Odpri v Google Calendar
       </a>`
      : '';

  wrapper.innerHTML = `
    <div class="card p-3 shadow-sm note-card">
      <div class="note-header" style="display:flex; justify-content: space-between; align-items: center;">
        <h5 class="note-title mb-0">${escapeHtml(note.zapis)}</h5>
        <div class="note-actions">
          <button class="sync-button btn btn-sm btn-outline-success" title="Sinhroniziraj z Google Calendar">
            <i class="fa-brands fa-google"></i>
          </button>
          <button class="edit-button btn btn-sm btn-outline-primary"><i class="fa-solid fa-pencil"></i></button>
          <button class="delete-button btn btn-sm btn-outline-danger"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>

      <!-- STATUS SINHRONIZACIJE -->
      <div class="sync-status-container mt-2">
        <span class="badge ${badge.class} sync-status-badge" data-zapisid="${note.zapisID}">
          ${badge.icon} ${badge.text}
        </span>
        <small class="sync-message text-muted d-block mt-1">${escapeHtml(syncStatus.message)}</small>
      </div>

      ${calendarLinkHtml}

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

// ---------- NOVO: Posodobi status badge ----------
async function updateSyncStatusBadge(zapisID) {
  const syncStatus = await getSyncStatus(zapisID);
  const badge = getSyncStatusBadge(syncStatus.status);

  const badgeElement = document.querySelector(`.sync-status-badge[data-zapisid="${zapisID}"]`);
  const messageElement = badgeElement?.nextElementSibling;
  const card = document.querySelector(`[data-zapis-id="${zapisID}"]`);

  if (badgeElement) {
    badgeElement.className = `badge ${badge.class} sync-status-badge`;
    badgeElement.textContent = `${badge.icon} ${badge.text}`;
  }

  if (messageElement) {
    messageElement.textContent = syncStatus.message;
  }

  // Dodaj/posodobi link do Google Calendar
  if (syncStatus.eventLink && card) {
    let linkElement = card.querySelector('.google-calendar-link');
    if (!linkElement) {
      linkElement = document.createElement('a');
      linkElement.className = 'btn btn-sm btn-outline-primary mt-2 w-100 google-calendar-link';
      linkElement.target = '_blank';
      linkElement.innerHTML = '<i class="fa-brands fa-google"></i> Odpri v Google Calendar';
      card.querySelector('.sync-status-container').after(linkElement);
    }
    linkElement.href = syncStatus.eventLink;
  }
}

// ---------- NOVO: Sinhroniziraj nalogo z Google Calendar ----------
async function syncTaskToGoogleCalendar(note) {
  if (!googleToken) {
    Swal.fire('Opozorilo', 'Najprej se poveži z Google Koledarjem!', 'warning');
    return;
  }

  // Prikaži loading status
  const badgeElement = document.querySelector(`.sync-status-badge[data-zapisid="${note.zapisID}"]`);
  if (badgeElement) {
    badgeElement.className = 'badge bg-info sync-status-badge';
    badgeElement.textContent = '🔄 Sinhronizacija...';
  }

  try {
    // Pridobi ID token za verifikacijo
    const credential = null;

    const response = await fetch('http://localhost:8080/api/calendar/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: credential,
        accessToken: googleToken,
        zapisID: note.zapisID,
        zapis: note.zapis,
        opis: note.opis || '',
        situacija: note.situacija || 0,
        datum: note.datum || ''
      })
    });

    console.log(note.datum)
    const result = await response.json();

    if (response.ok && result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Sinhronizirano!',
        text: 'Naloga je bila dodana v Google Calendar',
        timer: 2000,
        showConfirmButton: false
      });

      // Počakaj malo in posodobi status
      setTimeout(() => updateSyncStatusBadge(note.zapisID), 500);
    } else {
      throw new Error(result.message || 'Napaka pri sinhronizaciji');
    }
  } catch (err) {
    console.error('Napaka pri sinhronizaciji:', err);
    Swal.fire('Napaka', err.message || 'Pri sinhronizaciji z Google Calendar', 'error');

    // Posodobi status badge
    setTimeout(() => updateSyncStatusBadge(note.zapisID), 500);
  }
}

// ---------- pripni event listenerje na kartico ----------
function attachNoteEvents(wrapper, note) {
  const progressDiv = wrapper.querySelector('.progresss');
  const editButton = wrapper.querySelector('.edit-button');
  const deleteButton = wrapper.querySelector('.delete-button');
  const syncButton = wrapper.querySelector('.sync-button');
  const addImageBtn = wrapper.querySelector(".add-image-btn");
  const addImageInput = wrapper.querySelector(".add-image-input");
  const imagesList = wrapper.querySelector(".images-list");

  // NOVO: Sinhronizacija z Google Calendar
  if (syncButton) {
    syncButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      await syncTaskToGoogleCalendar(note);
    });
  }

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

          // NOVO: Ponovno sinhroniziraj če je že bilo sinhronizirano
          const syncStatus = await getSyncStatus(note.zapisID);
          if (syncStatus.status === 'USPESNO' && googleToken) {
            await syncTaskToGoogleCalendar({ ...note, situacija: newProgress });
          }

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

          // NOVO: Ponovno sinhroniziraj če je že bilo sinhronizirano
          const syncStatus = await getSyncStatus(note.zapisID);
          if (syncStatus.status === 'USPESNO' && googleToken) {
            await syncTaskToGoogleCalendar({
              ...note,
              zapis: newName,
              opis: newOpis,
              datum: newDueDate
            });
          }

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
          // NOVO: Izbriši tudi iz Google Calendar
          if (googleToken) {
            await fetch(`http://localhost:8080/api/calendar/delete/${note.zapisID}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accessToken: googleToken })
            });
          }

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

    // Uporabi Promise.all za hitrejše nalaganje
    const cards = await Promise.all(notes.map(note => createNoteCard(note)));
    cards.forEach(card => container.appendChild(card));
  } catch (err) {
    console.error('Napaka pri nalaganju:', err);
    document.getElementById('notesList').innerHTML = '<p class="text-danger">Napaka pri povezavi s strežnikom.</p>';
  }
}

// ---------- filter, reset ----------
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

async function prikaziNaloge(naloge) {
  const list = document.getElementById("notesList");
  list.innerHTML = "";
  if (!naloge || naloge.length === 0) {
    list.innerHTML = '<p class="text-muted">Ni zadetkov.</p>';
    return;
  }
  const cards = await Promise.all(naloge.map(note => createNoteCard(note)));
  cards.forEach(card => list.appendChild(card));
}

document.getElementById("resetFilters")?.addEventListener("click", () => {
  document.getElementById("filterZapis").value = "";
  document.getElementById("progressMin").value = "";
  document.getElementById("progressMax").value = "";
  loadNotes();
});

// ---------- Google OAuth ----------
const CLIENT_ID = '693783271820-no5q2aqmhucsdpao9ske2u1lsh9fduok.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let googleToken;
let googleUser;
let tokenClient;

function handleGoogleLogin() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: async (tokenResponse) => {
      googleToken = tokenResponse.access_token;
      document.getElementById('googleStatus').textContent = '✅ Povezano z Google Koledarjem';
      document.getElementById('connectGoogleBtn').textContent = 'Povezano';
      document.getElementById('connectGoogleBtn').disabled = true;
      console.log('Google Calendar povezan!');
    },
  });

  tokenClient.requestAccessToken({ prompt: 'consent' });
}

document.getElementById('connectGoogleBtn')?.addEventListener('click', handleGoogleLogin);

// ---------- dodajanje nove naloge ----------
const addNoteForm = document.getElementById("addNoteForm");
if (addNoteForm) {
  addNoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const noteName = document.getElementById("noteName").value.trim();
    const noteOpis = document.getElementById("noteOpis").value.trim();
    const dueDate = document.getElementById("noteDueDate").value;

    if (!noteName) {
      Swal.fire("Napaka", "Vnesi ime naloge!", "warning");
      return;
    }
    if (!noteOpis) {
      Swal.fire("Napaka", "Vnesi opis naloge!", "warning");
      return;
    }
    console.log(dueDate)
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
        const createdNote = await response.json();

        document.getElementById("noteName").value = "";
        document.getElementById("noteOpis").value = "";
        document.getElementById("noteDueDate").value = "";

        Swal.fire({
          icon: 'success',
          title: 'Naloga dodana!',
          timer: 1200,
          showConfirmButton: false
        });

        // NOVO: Avtomatska sinhronizacija ob dodajanju (če je Google povezan)
        if (googleToken) {
          await syncTaskToGoogleCalendar(createdNote);
        }

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
// Opomnik za tri dni pred iztekom
async function checkUpcomingDeadlines() {
  try {
    const res = await fetch('http://localhost:8080/zapis/upcoming-deadlines?days=3');
    const upcoming = await res.json();

    if (upcoming.length > 0) {
      const taskList = upcoming.map(task =>
          `<div style="text-align:left; padding:8px; border-left:3px solid #ff9800;">
          <strong>${escapeHtml(task.zapis)}</strong><br>
          <small>Rok: ${new Date(task.datum).toLocaleDateString('sl-SI')} 
          (še ${task.daysUntilDue} ${task.daysUntilDue === 1 ? 'dan' : 'dni'})</small>
        </div>`
      ).join('<br>');

      Swal.fire({
        icon: 'warning',
        title: 'Opomnik!',
        html: `Imate <strong>${upcoming.length}</strong> ${upcoming.length === 1 ? 'nalogo' : 'naloge'} 
               z bližajočim se rokom:<br><br>${taskList}`,
        confirmButtonText: 'V redu',
        confirmButtonColor: '#ff9800'
      });
    }
  } catch (err) {
    console.error('Napaka pri preverjanju rokov:', err);
  }
}

// Zaženemo nalaganje nalog
loadNotes();