package com.joseplanes.inven.exception;

public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String resourceName, String field, String value) {
        super(resourceName + " already exists with " + field + ": " + value);
    }
}
