package com.joseplanes.inven.controller;

import com.joseplanes.inven.dto.ProductDTO;
import com.joseplanes.inven.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAll() {
        return ResponseEntity.ok(productService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ProductDTO>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(productService.findByStatus(status));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO>> search(@RequestParam String query) {
        return ResponseEntity.ok(productService.search(query));
    }

    @PostMapping
    public ResponseEntity<ProductDTO> create(@Valid @RequestBody ProductDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> update(@PathVariable Integer id, @Valid @RequestBody ProductDTO dto) {
        return ResponseEntity.ok(productService.update(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProductDTO> updateStatus(@PathVariable Integer id,
                                                    @RequestParam String status) {
        return ResponseEntity.ok(productService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
