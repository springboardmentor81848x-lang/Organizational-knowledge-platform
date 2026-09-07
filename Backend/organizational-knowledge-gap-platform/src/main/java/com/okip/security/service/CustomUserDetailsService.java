package com.okip.security.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.okip.entity.master.Employee;
import com.okip.repository.EmployeeRepository;
import com.okip.security.user.CustomUserDetails;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    public CustomUserDetailsService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Employee employee = employeeRepository
                .findByOfficialEmail(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Employee not found"));

        return new CustomUserDetails(employee);
    }

}