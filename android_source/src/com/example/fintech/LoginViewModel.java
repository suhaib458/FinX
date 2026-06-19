package com.example.fintech;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

public class LoginViewModel extends ViewModel {

    private final MutableLiveData<Boolean> loginResult = new MutableLiveData<>();
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();

    public LiveData<Boolean> getLoginResult() {
        return loginResult;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public void loginWithCredentials(String username, String password) {
        // Mock secure network call logic
        if (username != null && !username.trim().isEmpty() && password != null && password.length() >= 6) {
            loginResult.setValue(true);
        } else {
            errorMessage.setValue("Invalid username or password");
        }
    }

    public void loginWithBiometrics() {
        // Called when Biometric prompt signals success
        loginResult.setValue(true);
    }
}
