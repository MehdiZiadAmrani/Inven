package com.joseplanes.inven.security;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AuthRequest {
    private String username;
    private String password;
    private String email;       // optional — used during register
    private String fullName;    // optional — used during register
}
