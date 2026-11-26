package com.workondeck.alwayspause;

import android.content.Context;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;

/**
 * Breathing haptics for Android, matching the iPhone CoreHapticsPlugin.swift so
 * src/lib/haptics.js works unchanged (same jsName and methods, each taking
 * { durationMs }):
 *   inhale – one continuous vibration whose strength ramps up (0.1 → 1.0)
 *   exhale – the same ramp in reverse (1.0 → 0.1)
 *   hold   – a soft pulse every second (0.3 s on, 0.7 s off)
 *   stop   – cancels whatever is playing
 *
 * Phones without variable-strength vibration (or Android 7) get short pulses
 * whose spacing follows the same rise and fall. Every call resolves, even on
 * failure: haptics must never break a session.
 */
@CapacitorPlugin(name = "CoreHaptics")
public class CoreHapticsPlugin extends Plugin {

    private static final int STEP_MS = 50;
    // Android's 255 is noticeably stronger than an iPhone at full intensity.
    private static final int MAX_AMPLITUDE = 200;

    private Vibrator vibrator() {
        Context context = getContext();
        if (context == null) return null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager manager = (VibratorManager) context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            return manager != null ? manager.getDefaultVibrator() : null;
        }
        return (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
    }

    private long duration(PluginCall call) {
        Double ms = call.getDouble("durationMs");
        return Math.max(250L, ms != null ? ms.longValue() : 4000L);
    }

    @PluginMethod
    public void playInhaleHaptic(PluginCall call) {
        playRamp(duration(call), 0.1, 1.0);
        call.resolve();
    }

    @PluginMethod
    public void playExhaleHaptic(PluginCall call) {
        playRamp(duration(call), 1.0, 0.1);
        call.resolve();
    }

    @PluginMethod
    public void playHoldHaptic(PluginCall call) {
        try {
            Vibrator v = vibrator();
            if (v == null || !v.hasVibrator()) {
                call.resolve();
                return;
            }
            v.cancel();
            long total = duration(call);
            List<Long> timings = new ArrayList<>();
            List<Integer> amplitudes = new ArrayList<>();
            for (long t = 0; t < total; t += 1000) {
                long on = Math.min(300, total - t);
                timings.add(on);
                amplitudes.add((int) Math.round(0.25 * MAX_AMPLITUDE));
                long off = Math.min(700, Math.max(0, total - t - on));
                if (off > 0) {
                    timings.add(off);
                    amplitudes.add(0);
                }
            }
            play(v, timings, amplitudes);
        } catch (Exception ignored) {
            // Never surface haptic failures.
        }
        call.resolve();
    }

    @PluginMethod
    public void stopHaptic(PluginCall call) {
        try {
            Vibrator v = vibrator();
            if (v != null) v.cancel();
        } catch (Exception ignored) {
            // Nothing playing.
        }
        call.resolve();
    }

    private void playRamp(long total, double from, double to) {
        try {
            Vibrator v = vibrator();
            if (v == null || !v.hasVibrator()) return;
            v.cancel();
            List<Long> timings = new ArrayList<>();
            List<Integer> amplitudes = new ArrayList<>();
            int steps = (int) Math.max(1, total / STEP_MS);
            for (int i = 0; i < steps; i++) {
                double level = from + (to - from) * (i / (double) Math.max(1, steps - 1));
                timings.add((long) STEP_MS);
                amplitudes.add(Math.max(1, (int) Math.round(level * MAX_AMPLITUDE)));
            }
            play(v, timings, amplitudes);
        } catch (Exception ignored) {
            // Never surface haptic failures.
        }
    }

    // Plays timings/amplitudes as one waveform, or as plain pulses where the
    // phone can't vary strength.
    private void play(Vibrator v, List<Long> timings, List<Integer> amplitudes) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && v.hasAmplitudeControl()) {
            long[] t = new long[timings.size()];
            int[] a = new int[amplitudes.size()];
            for (int i = 0; i < t.length; i++) {
                t[i] = timings.get(i);
                a[i] = amplitudes.get(i);
            }
            v.vibrate(VibrationEffect.createWaveform(t, a, -1));
            return;
        }
        // Fallback: turn strength into on/off pulses over each 200 ms window
        // (a stronger moment means a longer buzz in that window).
        List<Long> pattern = new ArrayList<>();
        pattern.add(0L); // start immediately
        long windowMs = 200;
        long elapsed = 0;
        int index = 0;
        long total = 0;
        for (Long t : timings) total += t;
        while (elapsed < total && index < timings.size()) {
            int amplitude = amplitudes.get(index);
            long on = amplitude == 0 ? 0 : Math.max(20, Math.round(windowMs * 0.6 * amplitude / (double) MAX_AMPLITUDE));
            pattern.add(on);
            pattern.add(windowMs - on);
            elapsed += windowMs;
            long consumed = 0;
            while (index < timings.size() && consumed < windowMs) {
                consumed += timings.get(index);
                index++;
            }
        }
        long[] p = new long[pattern.size()];
        for (int i = 0; i < p.length; i++) p[i] = pattern.get(i);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            v.vibrate(VibrationEffect.createWaveform(p, -1));
        } else {
            v.vibrate(p, -1);
        }
    }
}
