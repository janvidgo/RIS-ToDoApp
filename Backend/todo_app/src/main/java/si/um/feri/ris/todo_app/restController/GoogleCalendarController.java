package si.um.feri.ris.todo_app.restController;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/calendar")
@CrossOrigin(origins = "http://localhost:3123")
public class GoogleCalendarController {

    private static final String CLIENT_ID = "693783271820-no5q2aqmhucsdpao9ske2u1lsh9fduok.apps.googleusercontent.com";

    // Za shranjevanje event ID-jev in statusov (v produkciji shrani v bazo!)
    private final Map<String, String> taskToEventId = new ConcurrentHashMap<>();
    private final Map<String, SyncStatus> taskSyncStatus = new ConcurrentHashMap<>();

    @PostMapping("/sync")
    public ResponseEntity<?> syncTask(@RequestBody SyncRequest request) {
        String zapisID = request.getZapisID();

        // Nastavi status na "V TEKU"
        updateSyncStatus(zapisID, SyncStatusEnum.V_TEKU, "Sinhronizacija se izvaja...", null);

        try {
            // Preveri Google ID token (varnost)
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(CLIENT_ID))
                    .build();

            // Ustvari Calendar servis z access tokenom
            Calendar service = new Calendar.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance(),
                    new GoogleCredential()
                            .setAccessToken(request.getAccessToken()))
                    .setApplicationName("Todo App")
                    .build();

            Event event = new Event()
                    .setSummary("📌 " + request.getZapis())
                    .setDescription(
                            request.getOpis() +
                                    "\n\nNapredek: " + request.getSituacija() + "%" +
                                    "\nSinhronizirano iz moje TODO app 🚀"
                    )
                    .setReminders(new Event.Reminders().setUseDefault(false).setOverrides(Collections.emptyList()));

            if (request.getDatum() != null && !request.getDatum().isEmpty()) {
                LocalDate startDate = LocalDate.parse(request.getDatum().substring(0, 10));

                EventDateTime start = new EventDateTime().setDate(DateTime.parseRfc3339(startDate.toString())); // STRING
                EventDateTime end = new EventDateTime().setDate(DateTime.parseRfc3339(startDate.toString())); // STRING

                event.setStart(start);
                event.setEnd(end);
            }

            String eventId = taskToEventId.get(zapisID);
            Event resultEvent;

            if (eventId != null) {
                // Posodobi obstoječ dogodek
                resultEvent = service.events().update("primary", eventId, event).execute();
                updateSyncStatus(zapisID, SyncStatusEnum.USPESNO, "Naloga posodobljena v Google Calendar", resultEvent.getHtmlLink());
            } else {
                // Ustvari nov dogodek
                resultEvent = service.events().insert("primary", event).execute();
                taskToEventId.put(zapisID, resultEvent.getId());
                updateSyncStatus(zapisID, SyncStatusEnum.USPESNO, "Naloga dodana v Google Calendar", resultEvent.getHtmlLink());
            }

            return ResponseEntity.ok(createSuccessResponse(zapisID, resultEvent.getHtmlLink()));

        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = "Napaka pri sinhronizaciji: " + e.getMessage();
            updateSyncStatus(zapisID, SyncStatusEnum.NAPAKA, errorMsg, null);
            return ResponseEntity.internalServerError().body(createErrorResponse(errorMsg));
        }
    }

    @DeleteMapping("/delete/{zapisID}")
    public ResponseEntity<?> deleteEvent(@PathVariable String zapisID, @RequestBody Map<String, String> body) {
        String accessToken = body.get("accessToken");
        if (accessToken == null) return ResponseEntity.badRequest().build();

        updateSyncStatus(zapisID, SyncStatusEnum.V_TEKU, "Brisanje dogodka...", null);

        String eventId = taskToEventId.get(zapisID);
        if (eventId == null) {
            taskSyncStatus.remove(zapisID);
            return ResponseEntity.ok().build();
        }

        try {
            Calendar service = new Calendar.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance(),
                    new com.google.api.client.googleapis.auth.oauth2.GoogleCredential().setAccessToken(accessToken))
                    .setApplicationName("Todo App")
                    .build();

            service.events().delete("primary", eventId).execute();
            taskToEventId.remove(zapisID);
            taskSyncStatus.remove(zapisID);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            updateSyncStatus(zapisID, SyncStatusEnum.NAPAKA, "Napaka pri brisanju: " + e.getMessage(), null);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Nov endpoint za pridobivanje statusa sinhronizacije
    @GetMapping("/status/{zapisID}")
    public ResponseEntity<SyncStatus> getSyncStatus(@PathVariable String zapisID) {
        SyncStatus status = taskSyncStatus.get(zapisID);
        if (status == null) {
            return ResponseEntity.ok(new SyncStatus(SyncStatusEnum.NI_SINHRONIZIRAN, "Naloga še ni bila sinhronizirana", null, null));
        }
        return ResponseEntity.ok(status);
    }

    // Pridobi vse statuse
    @GetMapping("/status")
    public ResponseEntity<Map<String, SyncStatus>> getAllSyncStatuses() {
        return ResponseEntity.ok(new HashMap<>(taskSyncStatus));
    }

    // Pomožna metoda za posodabljanje statusa
    private void updateSyncStatus(String zapisID, SyncStatusEnum status, String message, String eventLink) {
        taskSyncStatus.put(zapisID, new SyncStatus(status, message, eventLink, LocalDateTime.now()));
    }

    // Pomožne metode za odgovore
    private Map<String, Object> createSuccessResponse(String zapisID, String eventLink) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("zapisID", zapisID);
        response.put("eventLink", eventLink);
        response.put("status", taskSyncStatus.get(zapisID));
        return response;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}

// Enum za status sinhronizacije
enum SyncStatusEnum {
    NI_SINHRONIZIRAN,  // Še ni bila sinhronizirana
    V_TEKU,            // Sinhronizacija v teku
    USPESNO,           // Uspešno sinhronizirana
    NAPAKA             // Napaka pri sinhronizaciji
}

// Model za status sinhronizacije
class SyncStatus {
    private SyncStatusEnum status;
    private String message;
    private String eventLink;  // Link do dogodka v Google Calendar
    private LocalDateTime timestamp;

    public SyncStatus(SyncStatusEnum status, String message, String eventLink, LocalDateTime timestamp) {
        this.status = status;
        this.message = message;
        this.eventLink = eventLink;
        this.timestamp = timestamp;
    }

    // Getterji in setterji
    public SyncStatusEnum getStatus() { return status; }
    public void setStatus(SyncStatusEnum status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getEventLink() { return eventLink; }
    public void setEventLink(String eventLink) { this.eventLink = eventLink; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}

class SyncRequest {
    private String credential;
    private String accessToken;
    private String zapisID;
    private String zapis;
    private String opis;
    private int situacija;
    private String datum;

    public String getCredential() { return credential; }
    public void setCredential(String credential) { this.credential = credential; }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getZapisID() { return zapisID; }
    public void setZapisID(String zapisID) { this.zapisID = zapisID; }
    public String getZapis() { return zapis; }
    public void setZapis(String zapis) { this.zapis = zapis; }
    public String getOpis() { return opis; }
    public void setOpis(String opis) { this.opis = opis; }
    public int getSituacija() { return situacija; }
    public void setSituacija(int situacija) { this.situacija = situacija; }
    public String getDatum() { return datum; }
    public void setDatum(String datum) { this.datum = datum; }
}