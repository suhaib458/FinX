package com.example.fintech;

import android.os.Bundle;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.ViewModelProvider;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

import java.util.UUID;
import java.util.concurrent.Executor;

public class LoginActivity extends AppCompatActivity {

    private LoginViewModel loginViewModel;
    private SecureStorageUtil secureStorageUtil;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        loginViewModel = new ViewModelProvider(this).get(LoginViewModel.class);
        secureStorageUtil = new SecureStorageUtil(this);

        TextInputEditText usernameEditText = findViewById(R.id.usernameEditText);
        TextInputEditText passwordEditText = findViewById(R.id.passwordEditText);
        MaterialButton loginButton = findViewById(R.id.loginButton);
        MaterialButton biometricButton = findViewById(R.id.biometricButton);

        // Observe ViewModel Authentication Results
        loginViewModel.getLoginResult().observe(this, isSuccess -> {
            if (isSuccess != null && isSuccess) {
                // Generate a mock token and store it securely
                String mockToken = UUID.randomUUID().toString();
                secureStorageUtil.saveUserToken(mockToken);
                
                Toast.makeText(this, "Login Successful. Token Stored Securely.", Toast.LENGTH_SHORT).show();
                // Navigate to next abstract Activity
                // startActivity(new Intent(this, MainActivity.class));
                // finish();
            }
        });

        loginViewModel.getErrorMessage().observe(this, error -> {
            if (error != null) {
                Toast.makeText(this, error, Toast.LENGTH_SHORT).show();
            }
        });

        // Setup Credentials Login Button
        loginButton.setOnClickListener(v -> {
            String username = usernameEditText.getText() != null ? usernameEditText.getText().toString() : "";
            String password = passwordEditText.getText() != null ? passwordEditText.getText().toString() : "";
            loginViewModel.loginWithCredentials(username, password);
        });

        // Setup Biometric Login Button
        biometricButton.setOnClickListener(v -> showBiometricPrompt());
    }

    private void showBiometricPrompt() {
        Executor executor = ContextCompat.getMainExecutor(this);
        BiometricPrompt biometricPrompt = new BiometricPrompt(LoginActivity.this,
                executor, new BiometricPrompt.AuthenticationCallback() {
            @Override
            public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                super.onAuthenticationError(errorCode, errString);
                Toast.makeText(getApplicationContext(),
                        "Authentication error: " + errString, Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                super.onAuthenticationSucceeded(result);
                loginViewModel.loginWithBiometrics();
            }

            @Override
            public void onAuthenticationFailed() {
                super.onAuthenticationFailed();
                Toast.makeText(getApplicationContext(), "Authentication failed",
                        Toast.LENGTH_SHORT).show();
            }
        });

        BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
                .setTitle("Biometric login for Fintech App")
                .setSubtitle("Log in using your biometric credential")
                .setNegativeButtonText("Use account password")
                .build();

        biometricPrompt.authenticate(promptInfo);
    }
}
