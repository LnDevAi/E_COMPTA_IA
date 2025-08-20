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
@RequestMapping("/api/plan")
public class PlanController {
    private final ObjectMapper om = new ObjectMapper();
    private final File dataFile = new File("data/plan.json");

    @GetMapping
    public Map<String, Object> getAll() throws IOException {
        return Map.of("items", load());
    }

    @PutMapping
    public Map<String, Object> replace(@RequestBody Map<String, Object> body) throws IOException {
        List<AccountItem> items = om.convertValue(body.getOrDefault("items", List.of()), new TypeReference<List<AccountItem>>(){});
        save(items);
        return Map.of("items", items);
    }

    @PostMapping("/subaccount")
    public Map<String, Object> addSub(@RequestBody Map<String, Object> body) throws IOException {
        String parentCode = Objects.toString(body.get("parentCode"), null);
        String code = Objects.toString(body.get("code"), null);
        String intitule = Objects.toString(body.get("intitule"), null);
        String description = Objects.toString(body.get("description"), "");
        if (code == null || intitule == null) throw new IllegalArgumentException("code & intitule required");
        List<AccountItem> items = load();
        if (items.stream().anyMatch(i -> code.equals(i.getCode()))) throw new IllegalStateException("code already exists");
        AccountItem it = new AccountItem();
        it.setCode(code); it.setIntitule(intitule); it.setParent(parentCode); it.setClasse(code.substring(0,1)); it.setDescription(description); it.setLocked(false);
        items.add(it); save(items);
        return Map.of("ok", true, "item", it);
    }

    @DeleteMapping("/subaccount/{code}")
    public ResponseEntity<Void> delete(@PathVariable String code) throws IOException {
        List<AccountItem> items = load();
        items.removeIf(i -> code.equals(i.getCode()));
        save(items);
        return ResponseEntity.noContent().build();
    }

    private List<AccountItem> load() throws IOException {
        if (!dataFile.exists()) return new ArrayList<>();
        Map<String,Object> map = om.readValue(dataFile, new TypeReference<Map<String,Object>>(){});
        List<AccountItem> items = om.convertValue(map.getOrDefault("items", List.of()), new TypeReference<List<AccountItem>>(){});
        return new ArrayList<>(items);
    }
    private void save(List<AccountItem> items) throws IOException {
        dataFile.getParentFile().mkdirs();
        om.writeValue(dataFile, Map.of("items", items));
    }

    public static class AccountItem {
        private String code;
        private String intitule;
        private String classe;
        private String parent;
        private String nature;
        private String description;
        private Boolean locked;

        // Getters
        public String getCode() { return code; }
        public String getIntitule() { return intitule; }
        public String getClasse() { return classe; }
        public String getParent() { return parent; }
        public String getNature() { return nature; }
        public String getDescription() { return description; }
        public Boolean getLocked() { return locked; }

        // Setters
        public void setCode(String code) { this.code = code; }
        public void setIntitule(String intitule) { this.intitule = intitule; }
        public void setClasse(String classe) { this.classe = classe; }
        public void setParent(String parent) { this.parent = parent; }
        public void setNature(String nature) { this.nature = nature; }
        public void setDescription(String description) { this.description = description; }
        public void setLocked(Boolean locked) { this.locked = locked; }
    }
}