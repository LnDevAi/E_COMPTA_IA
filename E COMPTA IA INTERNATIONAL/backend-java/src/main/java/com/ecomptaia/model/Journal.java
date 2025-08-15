package com.ecomptaia.model;

import lombok.Data;
import java.util.List;

@Data
public class Journal {
    private String code; // ACH, VEN, BNK, OD, SAL, CSH, MNE
    private String libelle;
    private String type; // ACHATS | VENTES | BANQUE | OD | SALAIRES | CAISSES | MONNAIE_ELECTRONIQUE | AUTRE
}

@Data
class EcritureLigne {
    private String compte; private String libelle; private double debit; private double credit;
}

@Data
class Ecriture {
    private String id; private String date; private String journalCode; private String piece; private String reference;
    private List<EcritureLigne> lignes; private double totalDebit; private double totalCredit;
}