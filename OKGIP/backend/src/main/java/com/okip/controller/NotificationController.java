package com.okip.controller;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.okip.dto.notification.CreateNotificationDeviceRequest;
import com.okip.dto.notification.NotificationResponseDTO;
import com.okip.service.notification.NotificationService;
@RestController @RequestMapping("/api/notifications")
public class NotificationController {
 private final NotificationService service; public NotificationController(NotificationService service){this.service=service;}
 @GetMapping public ResponseEntity<List<NotificationResponseDTO>> mine(){return ResponseEntity.ok(service.getMine());}
 @PatchMapping("/{id}/read") public ResponseEntity<Void> read(@PathVariable Long id){service.markRead(id);return ResponseEntity.noContent().build();}
 @PatchMapping("/read-all") public ResponseEntity<Void> readAll(){service.markAllRead();return ResponseEntity.noContent().build();}
 @PostMapping("/devices") public ResponseEntity<Void> register(@RequestBody CreateNotificationDeviceRequest r){service.registerFid(r.getFid());return ResponseEntity.noContent().build();}
}
