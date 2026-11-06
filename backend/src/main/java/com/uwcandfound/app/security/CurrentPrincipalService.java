package com.uwcandfound.app.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class CurrentPrincipalService {

    public String getCurrentUserEmail() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        // Original code kept for reference:
        // if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
        //     // Get email from validated JWT
        //     return jwt.getClaimAsString("email");
        // }

        // The current login filter stores the email as a String.
        if (authentication != null
                && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof String email
                && !"anonymousUser".equals(email)) {
            return email;
        }

        throw new IllegalStateException(
                "No authenticated user found in Security Context");
    }
}