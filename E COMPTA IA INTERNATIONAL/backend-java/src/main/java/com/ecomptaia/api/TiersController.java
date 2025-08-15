package com.ecomptaia.api;

import com.ecomptaia.model.Tiers;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/tiers")
public class TiersController {
    private final ObjectMapper om = new ObjectMapper();
    private final File dataFile = new File("data/tiers.json");

    @GetMapping
    public Map<String, Object> list() throws IOException {
        return Map.of("items", load());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Tiers t) throws IOException {
        List<Tiers> items = load();
        if (t.getCode()==null || t.getCode().isBlank()) t.setCode(nextCode(t.getType(), items));
        if (existsCode(items, t.getCode(), null)) return ResponseEntity.status(409).body(Map.of("error","code already used"));
        t.setId(genId("TIER")); items.add(t); save(items);
        return ResponseEntity.status(201).body(t);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Tiers patch) throws IOException {
        List<Tiers> items = load();
        int idx = indexOf(items, id); if (idx<0) return ResponseEntity.notFound().build();
        Tiers cur = items.get(idx);
        String newCode = (patch.getCode()==null||patch.getCode().isBlank()) ? cur.getCode() : patch.getCode();
        if (existsCode(items, newCode, id)) return ResponseEntity.status(409).body(Map.of("error","code already used"));
        cur.setCode(newCode);
        if (patch.getName()!=null) cur.setName(patch.getName());
        if (patch.getType()!=null) cur.setType(patch.getType());
        if (patch.getEmail()!=null) cur.setEmail(patch.getEmail());
        if (patch.getPhone()!=null) cur.setPhone(patch.getPhone());
        if (patch.getAddress()!=null) cur.setAddress(patch.getAddress());
        if (patch.getDefaultAccount()!=null) cur.setDefaultAccount(patch.getDefaultAccount());
        items.set(idx, cur); save(items);
        return ResponseEntity.ok(cur);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) throws IOException {
        List<Tiers> items = load();
        items.removeIf(x -> id.equals(x.getId())); save(items);
        return ResponseEntity.noContent().build();
    }

    // Helpers
    private List<Tiers> load() throws IOException {
        if (!dataFile.exists()) return new ArrayList<>();
        Map<String,Object> map = om.readValue(dataFile, new TypeReference<Map<String,Object>>(){});
        return om.convertValue(map.getOrDefault("items", List.of()), new TypeReference<List<Tiers>>(){});
    }
    private void save(List<Tiers> items) throws IOException {
        dataFile.getParentFile().mkdirs(); om.writeValue(dataFile, Map.of("items", items));
    }
    private String genId(String p) { return p+"-"+System.currentTimeMillis()+"-"+(int)(Math.random()*1e4); }
    private boolean existsCode(List<Tiers> items, String code, String excludeId) {
        for (Tiers t: items) {
            if (t.getCode()!=null && t.getCode().equalsIgnoreCase(code) && (excludeId==null || !excludeId.equals(t.getId()))) return true;
        }
        return false;
    }
    private String nextCode(String type, List<Tiers> items) {
        String pref = "AUT";
        if ("CLIENT".equalsIgnoreCase(type)) pref = "CLT"; else if ("FOURNISSEUR".equalsIgnoreCase(type)) pref = "FRS";
        int max = 0;
        for (Tiers t: items) {
            if (t.getCode()!=null && t.getCode().toUpperCase().startsWith(pref+"-")) {
                try {
                    int n = Integer.parseInt(t.getCode().substring(4));
                    if (n>max) max=n;
                } catch (Exception ignored) {}
            }
        }
        return pref+"-"+String.format("%04d", max+1);
    }
    private int indexOf(List<Tiers> items, String id) {
        for (int i=0;i<items.size();i++) if (id.equals(items.get(i).getId())) return i;
        return -1;
    }
}