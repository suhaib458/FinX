package com.example.fintech;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

import java.io.IOException;
import java.security.GeneralSecurityException;

public class SecureStorageUtil {

    private static final String PREF_FILE_NAME = "secure_fintech_prefs";
    private static final String KEY_USER_TOKEN = "user_token";

    private SharedPreferences sharedPreferences;

    public SecureStorageUtil(Context context) {
        try {
            MasterKey masterKey = new MasterKey.Builder(context)
                    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                    .build();

            sharedPreferences = EncryptedSharedPreferences.create(
                    context,
                    PREF_FILE_NAME,
                    masterKey,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            );
        } catch (GeneralSecurityException | IOException e) {
            e.printStackTrace();
        }
    }

    public void saveUserToken(String token) {
        if (sharedPreferences != null) {
            sharedPreferences.edit().putString(KEY_USER_TOKEN, token).apply();
        }
    }

    public String getUserToken() {
        if (sharedPreferences != null) {
            return sharedPreferences.getString(KEY_USER_TOKEN, null);
        }
        return null;
    }

    public void clearUserToken() {
        if (sharedPreferences != null) {
            sharedPreferences.edit().remove(KEY_USER_TOKEN).apply();
        }
    }
}
