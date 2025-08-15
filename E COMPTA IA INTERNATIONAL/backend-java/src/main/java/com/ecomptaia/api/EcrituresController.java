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