package com.ecomptaia.model;

import lombok.Data;

@Data
public class Tiers {
    private String id;
    private String code; // CLT-0001, FRS-0001, AUT-0001
    private String name;
    private String type; // CLIENT | FOURNISSEUR | AUTRE
    private String email;
    private String phone;
    private String address;
    private String defaultAccount; // ex 411, 401
}