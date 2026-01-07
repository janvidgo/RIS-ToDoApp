package si.um.feri.ris.todo_app.restController;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.EventReminder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
@CrossOrigin(origins = "http://localhost:3123")
public class GoogleCalendarController {

    private static final String CLIENT_ID = "TVÓJ_GOOGLE_CLIENT_ID_TUKAJ"; // tukaj bo jan dal svoj client ID

    // Za shranjevanje event ID-jev (v produkciji shrani v bazo!)
    private final Map<String, String> taskToEventId = new HashMap<>();

    @PostMapping("/sync")
    public ResponseEntity<?> syncTask(@RequestBody SyncRequest request) {
        try {
            // Preveri Google ID token (varnost)
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getCredential());
            if (idToken == null) {
                return ResponseEntity.badRequest().body("Neveljaven Google token");
            }

            // Ustvari Calendar servis z access tokenom
            Calendar service = new Calendar.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance(),
                    new com.google.api.client.googleapis.auth.oauth2.GoogleCredential()
                            .setAccessToken(request.getAccessToken()))
                    .setApplicationName("Todo App")
                    .build();

            Event event = new Event()
                    .setSummary("📌 " + request.getZapis())
                    .setDescription(
                            request.getOpis() +
                            "\n\nNapredek: " + request.getSituacija() + "%" +
                            "\nSinhronizirano iz moje TODO app 🚀"
                    );

            // Če ima rok → celodnevni dogodek
            if (request.getDatum() != null && !request.getDatum().isEmpty()) {
                com.google.api.client.util.DateTime date = new com.google.api.client.util.DateTime(request.getDatum());
                EventDateTime eventDate = new EventDateTime().setDate(date);
                event.setStart(eventDate);
                event.setEnd(eventDate);
            }

            // Dodaj opomnike
            EventReminder[] reminderOverrides = new EventReminder[] {
                new EventReminder().setMethod("popup").setMinutes(60), // 1 ura prej
                new EventReminder().setMethod("email").setMinutes(24 * 60) // 1 dan prej
            };
            event.setReminders(new Event.Reminders()
                    .setUseDefault(false)
                    .setOverrides(java.util.Arrays.asList(reminderOverrides)));

            String eventId = taskToEventId.get(request.getZapisID());
            if (eventId != null) {
                service.events().update("primary", eventId, event).execute();
            } else {
                Event created = service.events().insert("primary", event).execute();
                taskToEventId.put(request.getZapisID(), created.getId());
            }

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Napaka pri sinhronizaciji: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{zapisID}")
    public ResponseEntity<?> deleteEvent(@PathVariable String zapisID, @RequestBody Map<String, String> body) {
        String accessToken = body.get("accessToken");
        if (accessToken == null) return ResponseEntity.badRequest().build();

        String eventId = taskToEventId.get(zapisID);
        if (eventId == null) return ResponseEntity.ok().build();

        try {
            Calendar service = new Calendar.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance(),
                    new com.google.api.client.googleapis.auth.oauth2.GoogleCredential().setAccessToken(accessToken))
                    .setApplicationName("Todo App")
                    .build();

            service.events().delete("primary", eventId).execute();
            taskToEventId.remove(zapisID);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

class SyncRequest {
    private String credential;      // Google ID token
    private String accessToken;     // za Calendar API
    private String zapisID;
    private String zapis;
    private String opis;
    private int situacija;
    private String datum;           // format YYYY-MM-DD

    // getterji in setterji
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
