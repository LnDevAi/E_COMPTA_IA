package com.ecomptaia.model;

public class Tiers {
    private String id;
    private String code; // CLT-0001, FRS-0001, AUT-0001
    private String name;
    private String type; // CLIENT | FOURNISSEUR | AUTRE
    private String email;
    private String phone;
    private String address;
    private String defaultAccount; // ex 411, 401

    // Getters
    public String getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getType() { return type; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getDefaultAccount() { return defaultAccount; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setCode(String code) { this.code = code; }
    public void setName(String name) { this.name = name; }
    public void setType(String type) { this.type = type; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setAddress(String address) { this.address = address; }
    public void setDefaultAccount(String defaultAccount) { this.defaultAccount = defaultAccount; }
}