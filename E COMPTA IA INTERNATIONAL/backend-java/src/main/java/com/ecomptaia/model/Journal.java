package com.ecomptaia.model;

import java.util.List;

public class Journal {
    private String code; // ACH, VEN, BNK, OD, SAL, CSH, MNE
    private String libelle;
    private String type; // ACHATS | VENTES | BANQUE | OD | SALAIRES | CAISSES | MONNAIE_ELECTRONIQUE | AUTRE

    // Getters
    public String getCode() { return code; }
    public String getLibelle() { return libelle; }
    public String getType() { return type; }

    // Setters
    public void setCode(String code) { this.code = code; }
    public void setLibelle(String libelle) { this.libelle = libelle; }
    public void setType(String type) { this.type = type; }
}

class EcritureLigne {
    private String compte;
    private String libelle;
    private double debit;
    private double credit;

    // Getters
    public String getCompte() { return compte; }
    public String getLibelle() { return libelle; }
    public double getDebit() { return debit; }
    public double getCredit() { return credit; }

    // Setters
    public void setCompte(String compte) { this.compte = compte; }
    public void setLibelle(String libelle) { this.libelle = libelle; }
    public void setDebit(double debit) { this.debit = debit; }
    public void setCredit(double credit) { this.credit = credit; }
}

class Ecriture {
    private String id;
    private String date;
    private String journalCode;
    private String piece;
    private String reference;
    private List<EcritureLigne> lignes;
    private double totalDebit;
    private double totalCredit;

    // Getters
    public String getId() { return id; }
    public String getDate() { return date; }
    public String getJournalCode() { return journalCode; }
    public String getPiece() { return piece; }
    public String getReference() { return reference; }
    public List<EcritureLigne> getLignes() { return lignes; }
    public double getTotalDebit() { return totalDebit; }
    public double getTotalCredit() { return totalCredit; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setDate(String date) { this.date = date; }
    public void setJournalCode(String journalCode) { this.journalCode = journalCode; }
    public void setPiece(String piece) { this.piece = piece; }
    public void setReference(String reference) { this.reference = reference; }
    public void setLignes(List<EcritureLigne> lignes) { this.lignes = lignes; }
    public void setTotalDebit(double totalDebit) { this.totalDebit = totalDebit; }
    public void setTotalCredit(double totalCredit) { this.totalCredit = totalCredit; }
}