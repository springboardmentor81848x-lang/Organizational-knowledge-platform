package com.okip.security.user;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.okip.entity.master.Employee;

public class CustomUserDetails implements UserDetails {

    private final Employee employee;

    public CustomUserDetails(Employee employee) {
        this.employee = employee;
    }

    public Employee getEmployee() {
        return employee;
    }

    @Override
public Collection<? extends GrantedAuthority> getAuthorities() {

    String roleName =
            employee.getRole()
                    .getRoleName()
                    .name();

    System.out.println("========== SECURITY DEBUG ==========");
    System.out.println("Employee: " + employee.getEmployeeCode());
    System.out.println("Role from DB: " + roleName);

    if (!roleName.startsWith("ROLE_")) {
        roleName = "ROLE_" + roleName;
    }

    System.out.println("Authority given: " + roleName);
    System.out.println("====================================");

    return List.of(
            new SimpleGrantedAuthority(roleName)
    );
}

    @Override
    public String getPassword() {
        return employee.getPassword();
    }

    @Override
    public String getUsername() {
        return employee.getOfficialEmail();
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
}