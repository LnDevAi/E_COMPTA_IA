package com.ecomptaia.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @PostMapping("/parseText")
    public ResponseEntity<SuggestionResponse> parseText(@RequestBody ParseRequest req) {
        String text = Optional.ofNullable(req.getText()).orElse("");
        Detection det = detect(text);
        SuggestionResponse resp = new SuggestionResponse();
        resp.setDetected(det);
        resp.setSuggestions(buildSuggestions(det));
        return ResponseEntity.ok(resp);
    }

    private List<Suggestion> buildSuggestions(Detection det) {
        List<Suggestion> out = new ArrayList<>();
        // Heuristique: si doc est facture et sens non déterminé, générer 2 variantes (achat et vente)
        if (det.getType().equals("FACTURE")) {
            out.add(makePurchase(det));
            out.add(makeSale(det));
        } else if (det.getType().equals("RECU")) {
            out.add(makePurchase(det));
        } else if (det.getType().equals("RELEVE")) {
            // Proposition simple de mouvement bancaire
            out.add(makeBank(det));
        } else {
            out.add(makePurchase(det));
        }
        // Trier par confiance décroissante
        out.sort((a,b) -> Double.compare(b.getConfidence(), a.getConfidence()));
        return out;
    }

    private Suggestion makePurchase(Detection d) {
        double ht = d.getHt()>0? d.getHt() : (d.getTtc()>0 && d.getTva()>0? round2(d.getTtc() - d.getTva()) : 0);
        double tva = d.getTva()>0? d.getTva() : (d.getTtc()>0 && ht>0? round2(d.getTtc() - ht) : 0);
        double ttc = d.getTtc()>0? d.getTtc() : round2(ht + tva);
        Suggestion s = baseSuggestion(d);
        s.setJournalCode("ACH");
        s.setLines(List.of(
                line("607","Achats", ht, 0),
                line("44566","TVA déductible", tva, 0),
                line("401", d.getParty()!=null? d.getParty() : "Fournisseur", 0, ttc)
        ));
        s.setConfidence(score(d, "PURCHASE"));
        return s;
    }
    private Suggestion makeSale(Detection d) {
        double ht = d.getHt()>0? d.getHt() : (d.getTtc()>0 && d.getTva()>0? round2(d.getTtc() - d.getTva()) : 0);
        double tva = d.getTva()>0? d.getTva() : (d.getTtc()>0 && ht>0? round2(d.getTtc() - ht) : 0);
        double ttc = d.getTtc()>0? d.getTtc() : round2(ht + tva);
        Suggestion s = baseSuggestion(d);
        s.setJournalCode("VEN");
        s.setLines(List.of(
                line("411", d.getParty()!=null? d.getParty() : "Client", 0, ttc),
                line("707","Ventes", ht, 0),
                line("44571","TVA collectée", tva, 0)
        ));
        s.setConfidence(score(d, "SALE"));
        return s;
    }
    private Suggestion makeBank(Detection d) {
        double amt = d.getTtc()>0? d.getTtc() : (d.getHt()>0? d.getHt() : d.getTva());
        Suggestion s = baseSuggestion(d);
        s.setJournalCode("BNK");
        s.setLines(List.of(
                line("512","Banque", amt, 0),
                line("471","A régulariser", 0, amt)
        ));
        s.setConfidence(0.4);
        return s;
    }

    private Suggestion baseSuggestion(Detection d) {
        Suggestion s = new Suggestion();
        s.setPiece(d.getPiece()!=null? d.getPiece() : UUID.randomUUID().toString());
        s.setDate(d.getDate()!=null? d.getDate() : today());
        return s;
    }

    private SuggestionLine line(String compte, String libelle, double debit, double credit) {
        SuggestionLine l = new SuggestionLine();
        l.setCompte(compte); l.setLibelle(libelle); l.setDebit(debit); l.setCredit(credit);
        return l;
    }

    private double score(Detection d, String side) {
        double s = 0.5;
        if (d.hasHT) s += 0.1; if (d.hasTVA) s += 0.2; if (d.hasTTC) s += 0.1;
        if (side.equals("SALE") && d.getSaleHints()>0) s += 0.1 * d.getSaleHints();
        if (side.equals("PURCHASE") && d.getPurchaseHints()>0) s += 0.1 * d.getPurchaseHints();
        return Math.min(0.99, s);
    }

    private Detection detect(String text) {
        Detection d = new Detection();
        String lower = text.toLowerCase(Locale.ROOT);
        if (lower.contains("relevé")) d.setType("RELEVE");
        else if (lower.contains("reçu") || lower.contains("receipt") || lower.contains("ticket")) d.setType("RECU");
        else if (lower.contains("facture") || lower.contains("invoice")) d.setType("FACTURE");
        else d.setType("INCONNU");

        // Party (nom simple: première ligne non vide en tête)
        String[] lines = text.split("\r?\n");
        for (int i=0;i<Math.min(lines.length, 10);i++) {
            String ln = lines[i].trim();
            if (ln.length()>=3 && !ln.toLowerCase().contains("facture") && !ln.toLowerCase().contains("invoice")) { d.setParty(ln); break; }
        }

        // Date dd/mm/yyyy ou yyyy-mm-dd
        Pattern pDate = Pattern.compile("(\\b\\d{2}[\\./-]\\d{2}[\\./-]\\d{4}\\b)|(\\b\\d{4}-\\d{2}-\\d{2}\\b)");
        Matcher mDate = pDate.matcher(text);
        if (mDate.find()) d.setDate(mDate.group());

        // Montants
        Extract eHT = extractAmount(text, new String[]{"total ht","montant ht","ht"});
        Extract eTVA = extractAmount(text, new String[]{"tva","taxe","vat"});
        Extract eTTC = extractAmount(text, new String[]{"total ttc","ttc","à payer","a payer","net à payer","net a payer"});
        if (eHT.found) { d.setHt(eHT.value); d.hasHT = true; d.setPiece(eHT.contextId); }
        if (eTVA.found) { d.setTva(eTVA.value); d.hasTVA = true; if (d.getPiece()==null) d.setPiece(eTVA.contextId); }
        if (eTTC.found) { d.setTtc(eTTC.value); d.hasTTC = true; if (d.getPiece()==null) d.setPiece(eTTC.contextId); }

        // Indices achat/vente
        if (lower.contains("tva déductible") || lower.contains("tva deductibile") || lower.contains("fournisseur")) d.setPurchaseHints(d.getPurchaseHints()+1);
        if (lower.contains("tva collectée") || lower.contains("tva collectee") || lower.contains("client")) d.setSaleHints(d.getSaleHints()+1);

        return d;
    }

    private Extract extractAmount(String text, String[] keywords) {
        String lower = text.toLowerCase(Locale.ROOT);
        for (String kw : keywords) {
            int idx = lower.indexOf(kw);
            if (idx >= 0) {
                // Chercher un nombre près du mot-clé
                String around = text.substring(Math.max(0, idx), Math.min(text.length(), idx + 120));
                Pattern pNum = Pattern.compile("([0-9]{1,3}(?:[ .][0-9]{3})*(?:,[0-9]{1,2})?)|([0-9]+(?:\\.[0-9]{1,2})?)");
                Matcher m = pNum.matcher(around);
                if (m.find()) {
                    String raw = m.group();
                    double val = parseAmount(raw);
                    Extract ex = new Extract(); ex.found = true; ex.value = val; ex.contextId = kw.toUpperCase(Locale.ROOT);
                    return ex;
                }
            }
        }
        // fallback: plus grand nombre trouvé
        Pattern pNum = Pattern.compile("([0-9]{1,3}(?:[ .][0-9]{3})*(?:,[0-9]{1,2})?)|([0-9]+(?:\\.[0-9]{1,2})?)");
        Matcher m = pNum.matcher(text);
        double max = 0; boolean any = false;
        while (m.find()) { any = true; max = Math.max(max, parseAmount(m.group())); }
        Extract ex = new Extract(); ex.found = any; ex.value = max; ex.contextId = "AUTO";
        return ex;
    }

    private double parseAmount(String s) {
        String t = s.replace(" ", "").replace(".", "");
        t = t.replace(",", ".");
        try { return round2(Double.parseDouble(t)); } catch (Exception e) { return 0; }
    }

    private String today() { return java.time.LocalDate.now().toString(); }
    private double round2(double v) { return Math.round(v*100.0)/100.0; }

    public static class Extract {
        public boolean found;
        public double value;
        public String contextId;
    }

    public static class ParseRequest {
        private String text;
        private String country;
        private String currency;
        private String typeHint;

        // Getters
        public String getText() { return text; }
        public String getCountry() { return country; }
        public String getCurrency() { return currency; }
        public String getTypeHint() { return typeHint; }

        // Setters
        public void setText(String text) { this.text = text; }
        public void setCountry(String country) { this.country = country; }
        public void setCurrency(String currency) { this.currency = currency; }
        public void setTypeHint(String typeHint) { this.typeHint = typeHint; }
    }

    public static class SuggestionResponse {
        private Detection detected;
        private List<Suggestion> suggestions;

        // Getters
        public Detection getDetected() { return detected; }
        public List<Suggestion> getSuggestions() { return suggestions; }

        // Setters
        public void setDetected(Detection detected) { this.detected = detected; }
        public void setSuggestions(List<Suggestion> suggestions) { this.suggestions = suggestions; }
    }

    public static class Detection {
        private String type;
        private String date;
        private String party;
        private String piece;
        private double ht;
        private double tva;
        private double ttc;
        public boolean hasHT;
        public boolean hasTVA;
        public boolean hasTTC;
        private int saleHints;
        private int purchaseHints;

        // Getters
        public String getType() { return type; }
        public String getDate() { return date; }
        public String getParty() { return party; }
        public String getPiece() { return piece; }
        public double getHt() { return ht; }
        public double getTva() { return tva; }
        public double getTtc() { return ttc; }
        public int getSaleHints() { return saleHints; }
        public int getPurchaseHints() { return purchaseHints; }

        // Setters
        public void setType(String type) { this.type = type; }
        public void setDate(String date) { this.date = date; }
        public void setParty(String party) { this.party = party; }
        public void setPiece(String piece) { this.piece = piece; }
        public void setHt(double ht) { this.ht = ht; }
        public void setTva(double tva) { this.tva = tva; }
        public void setTtc(double ttc) { this.ttc = ttc; }
        public void setSaleHints(int saleHints) { this.saleHints = saleHints; }
        public void setPurchaseHints(int purchaseHints) { this.purchaseHints = purchaseHints; }
    }

    public static class Suggestion {
        private String journalCode;
        private String piece;
        private String date;
        private List<SuggestionLine> lines;
        private double confidence;

        // Getters
        public String getJournalCode() { return journalCode; }
        public String getPiece() { return piece; }
        public String getDate() { return date; }
        public List<SuggestionLine> getLines() { return lines; }
        public double getConfidence() { return confidence; }

        // Setters
        public void setJournalCode(String journalCode) { this.journalCode = journalCode; }
        public void setPiece(String piece) { this.piece = piece; }
        public void setDate(String date) { this.date = date; }
        public void setLines(List<SuggestionLine> lines) { this.lines = lines; }
        public void setConfidence(double confidence) { this.confidence = confidence; }
    }

    public static class SuggestionLine {
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
}