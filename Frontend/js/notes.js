// ---------- helper: barvna funkcija (iste kot prej) ----------
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

// ---------- ustvarjanje kartice za en zapis ----------
function createNoteCard(note) {
  const color = getProgressColor(note.situacija);

  const wrapper = document.createElement('div');
  wrapper.classList.add('col-md-4');

  // uporabimo razrede namesto ID-jev, da se ne podvajajo
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
    </div>
  `;

  attachNoteEvents(wrapper, note);
  return wrapper;
}

// ---------- varnostna funkcija za vpis v HTML ----------
function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------- pripni event listenerje na kartico ----------
function attachNoteEvents(wrapper, note) {
  const progressDiv = wrapper.querySelector('.progresss');
  const editButton = wrapper.querySelector('.edit-button');
  const deleteButton = wrapper.querySelector('.delete-button');

  // urejanje napredka (klik na progress div)
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

          // nastavi začetni gradient
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

          await Swal.fire({
            icon: 'success',
            title: 'Posodobljeno!',
            text: 'Napredek je bil posodobljen.',
            timer: 1200,
            showConfirmButton: false
          });

          loadNotes();
        } catch (err) {
          console.error('Napaka pri posodobitvi:', err);
          Swal.fire('Napaka', 'Pri posodobitvi je prišlo do napake.', 'error');
        }
      }
    });
  }

  // urejanje imena/opsisa
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
        inputValidator: (v) => {
          if (!v || !v.trim()) return 'Ime ne sme biti prazno!';
        }
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
        inputValidator: (v) => {
          if (!v || !v.trim()) return 'Opis ne sme biti prazno!';
        }
      });

      if (!newOpis) return;

      try {
        await fetch(`http://localhost:8080/zapis/ime/${note.zapisID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zapis: newName, opis: newOpis })
        });

        await Swal.fire({
          icon: 'success',
          title: 'Posodobljeno!',
          text: 'Zapis je bil posodobljen.',
          timer: 1200,
          showConfirmButton: false
        });

        loadNotes();
      } catch (err) {
        console.error('Napaka pri urejanju imena:', err);
        Swal.fire('Napaka', 'Pri urejanju je prišlo do napake.', 'error');
      }
    });
  }

  // brisanje
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

          await Swal.fire({
            icon: 'success',
            title: 'Izbrisano!',
            text: 'Naloga je bila izbrisana.',
            timer: 1200,
            showConfirmButton: false
          });

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

    notes.forEach(note => {
      container.appendChild(createNoteCard(note));
    });
  } catch (err) {
    console.error('Napaka pri nalaganju:', err);
    document.getElementById('notesList').innerHTML = '<p class="text-danger">Napaka pri nalaganju zapisov.</p>';
  }
}

// ---------- prikaz filtriranih rezultatov (ohranjeno) ----------
function prikaziNaloge(naloge) {
  const list = document.getElementById("notesList");
  list.innerHTML = "";

  if (!naloge || naloge.length === 0) {
    list.innerHTML = `<p class="text-muted">Ni zadetkov za izbrane filtre.</p>`;
    return;
  }

  naloge.forEach(note => {
    list.appendChild(createNoteCard(note));
  });
}

// ---------- obdelava filtra (ohranjena) ----------
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

// ---------- dodajanje novega zapisa (ohranjeno, poskrbi da imaš #addNoteForm v HTML) ----------
const addNoteForm = document.getElementById("addNoteForm");
if (addNoteForm) {
  addNoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const noteName = document.getElementById("noteName").value.trim();
    const noteOpis = document.getElementById("noteOpis").value.trim();

    if (!noteName) return alert("Vnesi ime!");
    if (!noteOpis) return alert("Vnesi opis!");

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
        Swal.fire('Napaka', 'Pri dodajanju je prišlo do napake.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Napaka', 'Pri dodajanju je prišlo do napake.', 'error');
    }
  });
}

// ---------- odpre modal za izvoz  ----------
document.getElementById("exportBtn").addEventListener("click", () => {
    const modal = new bootstrap.Modal(document.getElementById("exportModal"));
    modal.show();
});

// ---------- pridobi vidne zapise za izvoz ----------
function getVisibleNotes() {
    return Array.from(document.querySelectorAll(".note-card")).map(card => {
        const progressBar = card.querySelector(".progress-bar");
        const napredek = progressBar.style.width;


        return {
            ime: card.querySelector(".note-title").innerText,
            opis: card.querySelector(".note-opis").innerText,
            napredek: napredek
        };
    });
}

// ---------- izvozi vidne zapise kot CSV ----------
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

// ---------- izvozi vidne zapise kot PDF ----------
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
        doc.text(`Naloga ${index+1}:`, 10, y);
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

document.getElementById("exportCsv").addEventListener("click", exportCSV);
document.getElementById("exportPdf").addEventListener("click", exportPDF);

// ---------- končni klic ----------
loadNotes();