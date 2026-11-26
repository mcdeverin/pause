package com.workondeck.alwayspause;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // The app's own plugins (npm plugins like RevenueCat register themselves).
        registerPlugin(CoreHapticsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
