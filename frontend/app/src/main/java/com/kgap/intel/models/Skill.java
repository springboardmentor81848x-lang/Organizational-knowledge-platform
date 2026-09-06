package com.kgap.intel.models;

public class Skill {
    private String name;
    private int level; // 0-100

    public Skill(String name, int level) {
        this.name = name;
        this.level = level;
    }

    public String getName() { return name; }
    public int getLevel() { return level; }
}
