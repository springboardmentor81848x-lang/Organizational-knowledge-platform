package com.okip.service.notification;
import java.io.FileInputStream;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
@Component
public class FirebaseInitializer {
 @PostConstruct public void init(){
  if(!FirebaseApp.getApps().isEmpty()) return;
  try{
   String path=System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
   if(path==null||path.isBlank()){System.out.println("FCM disabled: GOOGLE_APPLICATION_CREDENTIALS is not configured."); return;}
   FirebaseOptions options=FirebaseOptions.builder().setCredentials(GoogleCredentials.fromStream(new FileInputStream(path))).build();
   FirebaseApp.initializeApp(options); System.out.println("FCM initialized.");
  }catch(Exception e){System.err.println("FCM disabled: "+e.getMessage());}
 }
}
