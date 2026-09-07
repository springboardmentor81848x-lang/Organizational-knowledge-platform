package com.okip.dto.auth;

public class LoginRequestDTO {

    private String officialEmail;
    private String password;

    public LoginRequestDTO() {
    }

    public String getOfficialEmail() {
        return officialEmail;
    }

    public void setOfficialEmail(String officialEmail) {
        this.officialEmail = officialEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}