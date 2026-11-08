
package com.uwcandfound.app.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    @Value("${app.jwt.renew-before-ms:600000}")
    private long renewalThresholdMs;

    // SIGNING KEY
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(
                StandardCharsets.UTF_8
        );

        return Keys.hmacShaKeyFor(keyBytes);
    }

    // GENERATE JWT
    public String generateToken(String email, String role) {

        long currentTime = System.currentTimeMillis();

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date(currentTime))
                .expiration(
                        new Date(currentTime + jwtExpirationMs)
                )
                .signWith(getSigningKey())
                .compact();
    }

    // EXTRACT CLAIMS
    private Claims getClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // EXTRACT USER DETAILS
    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public String getRoleFromToken(String token) {
        return getClaims(token).get(
                "role",
                String.class
        );
    }

    // VALIDATE JWT
    public boolean validateToken(String token) {

        try {
            getClaims(token);
            return true;

        } catch (JwtException | IllegalArgumentException e) {

            // Do not log actual tokens
            System.err.println(
                    "JWT validation failed: " +
                            e.getClass().getSimpleName()
            );

            return false;
        }
    }

    // GET EXPIRATION
    public Date getExpiration(String token) {
        return getClaims(token).getExpiration();
    }

    // GET REMAINING TIME
    public long getRemainingTime(String token) {

        Date expiration = getExpiration(token);

        return Math.max(
                0L,
                expiration.getTime() - System.currentTimeMillis()
        );
    }

    // CHECK IF JWT IS ABOUT TO EXPIRE
    public boolean isAboutToExpire(String token) {

        long remainingTime = getRemainingTime(token);

        return remainingTime > 0
                && remainingTime <= renewalThresholdMs;
    }

    // RENEW JWT IF NECESSARY
    public String renewTokenIfNeeded(
            String token,
            String email,
            String role
    ) {

        // Verify signature, expiration, and claims
        Claims claims = getClaims(token);

        // Prevent renewal under a different identity
        if (!email.equals(claims.getSubject())) {
            throw new SecurityException(
                    "Token identity mismatch"
            );
        }

        long remainingTime =
                claims.getExpiration().getTime()
                        - System.currentTimeMillis();

        // Token does not need renewal
        if (remainingTime > renewalThresholdMs) {
            return null;
        }

        // Return a newly signed JWT
        return generateToken(email, role);
    }
}
