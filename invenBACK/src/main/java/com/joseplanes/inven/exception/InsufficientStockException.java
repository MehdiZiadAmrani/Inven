package com.joseplanes.inven.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String itemType, Integer itemId, int requested, int available) {
        super("Insufficient stock for " + itemType + " id " + itemId +
              ": requested " + requested + ", available " + available);
    }
}
