package com.joseplanes.inven.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resourceName, Object id) {
        super(resourceName + " not found with id: " + id);
    }

    public ResourceNotFoundException(String resourceName, String field, Object value) {
        super(resourceName + " not found with " + field + ": " + value);
    }
}