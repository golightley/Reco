package com.bowieventures.recoapp;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
      // for facebook login
      add(jp.rdlabo.capacitor.plugin.facebook.FacebookLogin.class);
      // for sms
      add(com.byteowls.capacitor.sms.SmsManagerPlugin.class);

    }});
  }
}
