package com.ecomptaia.api;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/ecritures")
public class EcrituresController {
    private final ObjectMapper om = new ObjectMapper();
    private final File dataFile = new File("data/ecritures.json");

    @GetMapping
    public Map<String,Object> list(@RequestParam(required = false) String journal) throws IOException {
        List<Ecriture> items = load();
        if (journal!=null && !journal.isBlank()) items.removeIf(e -> !journal.equalsIgnoreCase(e.getJournalCode()));
        return Map.of("items", items);
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestBody Ecriture e) throws IOException {
        if (!isBalanced(e)) return ResponseEntity.badRequest().body(Map.of("error","unbalanced"));
        e.setId(genId("ECR"));
        double td = 0, tc = 0; for (Ligne l: e.getLignes()) { td += l.getDebit(); tc += l.getCredit(); }
        e.setTotalDebit(td); e.setTotalCredit(tc);
        List<Ecriture> items = load(); items.add(e); save(items);
        return ResponseEntity.status(201).body(e);
    }

    @PostMapping("/demo")
    public Map<String,Object> generateDemo() throws IOException {
        List<Ecriture> items = load();
        items.addAll(demoSet());
        save(items);
        return Map.of("count", items.size());
    }

    private List<Ecriture> demoSet() {
        List<Ecriture> list = new ArrayList<>();
        // Achat: 607/44566 à 401
        list.add(build("2025-01-05","ACH","FA-2025-0001", lines(
                l("607","Achats marchandises",100000,0),
                l("44566","TVA déductible",18000,0),
                l("401","Fournisseur X",0,118000)
        )));
        // Paiement fournisseur: 401 à 512
        list.add(build("2025-01-10","BNK","RB-2025-0001", lines(
                l("401","Règlement facture",118000,0),
                l("512","Banque",0,118000)
        )));
        // Vente: 411 à 707/44571
        list.add(build("2025-01-12","VEN","FV-2025-0001", lines(
                l("411","Client Y",0,236000),
                l("707","Ventes marchandises",200000,0),
                l("44571","TVA collectée",36000,0)
        )));
        // Encaissement client: 512 à 411
        list.add(build("2025-01-20","BNK","RE-2025-0001", lines(
                l("512","Banque",236000,0),
                l("411","Client Y",0,236000)
        )));
        // OD: Salaire + charges
        list.add(build("2025-01-31","OD","OD-2025-0001", lines(
                l("641","Rémunérations du personnel",50000,0),
                l("645","Charges sociales",20000,0),
                l("421","Personnel - rémunérations dues",0,70000)
        )));
        // Paiement salaires
        list.add(build("2025-02-05","BNK","PAIE-2025-0001", lines(
                l("421","Paiement salaires",70000,0),
                l("512","Banque",0,70000)
        )));
        return list;
    }

    private Ecriture build(String date, String journal, String piece, List<Ligne> lignes) {
        Ecriture e = new Ecriture(); e.setId(genId("ECR")); e.setDate(date); e.setJournalCode(journal); e.setPiece(piece); e.setReference(piece);
        e.setLignes(lignes);
        double td=0, tc=0; for (Ligne l: lignes) { td+=l.getDebit(); tc+=l.getCredit(); }
        e.setTotalDebit(td); e.setTotalCredit(tc); return e;
    }
    private List<Ligne> lines(Ligne... ls) { return new ArrayList<>(Arrays.asList(ls)); }
    private Ligne l(String c, String lib, double d, double cdt) { Ligne x = new Ligne(); x.setCompte(c); x.setLibelle(lib); x.setDebit(d); x.setCredit(cdt); return x; }

    private boolean isBalanced(Ecriture e) {
        if (e.getLignes()==null || e.getLignes().isEmpty()) return false;
        double td = 0, tc = 0; for (Ligne l: e.getLignes()) { td += l.getDebit(); tc += l.getCredit(); }
        return Math.round((td-tc)*100)==0;
    }

    private List<Ecriture> load() throws IOException {
        if (!dataFile.exists()) return new ArrayList<>();
        Map<String,Object> map = om.readValue(dataFile, new TypeReference<Map<String,Object>>(){});
        return om.convertValue(map.getOrDefault("items", List.of()), new TypeReference<List<Ecriture>>(){});
    }
    private void save(List<Ecriture> items) throws IOException { dataFile.getParentFile().mkdirs(); om.writeValue(dataFile, Map.of("items", items)); }
    private String genId(String p) { return p+"-"+System.currentTimeMillis()+"-"+(int)(Math.random()*1e4); }

    @Data
    public static class Ligne { private String compte; private String libelle; private double debit; private double credit; }
    @Data
    public static class Ecriture {
        private String id; private String date; private String journalCode; private String piece; private String reference;
        private List<Ligne> lignes; private double totalDebit; private double totalCredit;
    }
}