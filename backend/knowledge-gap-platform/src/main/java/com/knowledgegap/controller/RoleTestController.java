package com.knowledgegap.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RoleTestController {

    @GetMapping("/api/hr/test")
    public String hrTest() {
        return "Welcome HR!";
    }

    @GetMapping("/api/manager/test")
    public String managerTest() {
        return "Welcome Manager!";
    }

    @GetMapping("/api/employee/test")
    public String employeeTest() {
        return "Welcome Employee!";
    }
}