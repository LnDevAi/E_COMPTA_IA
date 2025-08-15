package com.ecomptaia.api;

import com.ecomptaia.model.Journal;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/journaux")
public class JournauxController {
    private final ObjectMapper om = new ObjectMapper();
    private final File dataFile = new File("data/journaux.json");

    @GetMapping
    public Map<String,Object> list() throws IOException { return Map.of("items", load()); }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Journal j) throws IOException {
        List<Journal> items = load();
        if (j.getCode()==null || j.getCode().isBlank()) return ResponseEntity.badRequest().body(Map.of("error","code required"));
        if (items.stream().anyMatch(x -> x.getCode().equalsIgnoreCase(j.getCode()))) return ResponseEntity.status(409).body(Map.of("error","code exists"));
        items.add(j); save(items); return ResponseEntity.status(201).body(j);
    }

    @PutMapping("/{code}")
    public ResponseEntity<?> update(@PathVariable String code, @RequestBody Journal patch) throws IOException {
        List<Journal> items = load();
        for (int i=0;i<items.size();i++) if (items.get(i).getCode().equalsIgnoreCase(code)) {
            Journal j = items.get(i);
            if (patch.getLibelle()!=null) j.setLibelle(patch.getLibelle());
            if (patch.getType()!=null) j.setType(patch.getType());
            items.set(i, j); save(items); return ResponseEntity.ok(j);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> delete(@PathVariable String code) throws IOException {
        List<Journal> items = load(); items.removeIf(x->x.getCode().equalsIgnoreCase(code)); save(items); return ResponseEntity.noContent().build();
    }

    private List<Journal> load() throws IOException {
        if (!dataFile.exists()) return new ArrayList<>();
        Map<String,Object> map = om.readValue(dataFile, new TypeReference<Map<String,Object>>(){});
        return om.convertValue(map.getOrDefault("items", List.of()), new TypeReference<List<Journal>>(){});
    }
    private void save(List<Journal> items) throws IOException { dataFile.getParentFile().mkdirs(); om.writeValue(dataFile, Map.of("items", items)); }
}