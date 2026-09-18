package com.knowledgegap.security;

import com.knowledgegap.entity.Employee;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserDetails implements UserDetails {

    private final Employee employee;

    public CustomUserDetails(Employee employee) {
        this.employee = employee;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        if (employee.getRole() == null ||
                employee.getRole().getRoleName() == null) {

            return List.of();
        }

        String roleName =
                employee.getRole()
                        .getRoleName()
                        .trim()
                        .toUpperCase();

        System.out.println(
                "Creating authority: ROLE_" + roleName
        );

        return List.of(
                new SimpleGrantedAuthority(
                        "ROLE_" + roleName
                )
        );
    }

    @Override
    public String getPassword() {
        return employee.getPassword();
    }

    @Override
    public String getUsername() {
        return employee.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public Employee getEmployee() {
        return employee;
    }
}