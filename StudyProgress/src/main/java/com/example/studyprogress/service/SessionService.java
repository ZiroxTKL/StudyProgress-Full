package com.example.studyprogress.service;
import com.example.studyprogress.model.*;
import com.example.studyprogress.repository.*;
import com.example.studyprogress.exception.UnauthorizedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
@Service
public class SessionService {
    private final RefreshSessionRepository sessions;
    private final JwtService jwt;
    private final SecureRandom random=new SecureRandom();
    public record Tokens(String token,String refreshToken) {}
    public SessionService(RefreshSessionRepository sessions,JwtService jwt){this.sessions=sessions;this.jwt=jwt;}
    @Transactional
    public Tokens issue(Usuario user) {
        byte[] bytes=new byte[48];random.nextBytes(bytes);
        String raw=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        sessions.save(new RefreshSession(hash(raw),user,Instant.now().plus(7,ChronoUnit.DAYS)));
        return new Tokens(jwt.generarToken(user),raw);
    }
    @Transactional
    public Tokens rotate(String raw) {
        if(raw==null||raw.isBlank())throw new UnauthorizedException("Inicia sesión para continuar");
        RefreshSession session=sessions.findLocked(hash(raw)).orElseThrow(()->new UnauthorizedException("La sesión venció. Inicia sesión nuevamente"));
        if(session.getExpiresAt().isBefore(Instant.now()))throw new UnauthorizedException("La sesión venció. Inicia sesión nuevamente");
        Usuario user=session.getUsuario();sessions.delete(session);sessions.flush();
        return issue(user);
    }
    @Transactional
    public void revoke(String raw){if(raw!=null&&!raw.isBlank())sessions.deleteByTokenHash(hash(raw));}
    private String hash(String raw) {
        try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8)));}
        catch(NoSuchAlgorithmException e){throw new IllegalStateException(e);}
    }
}
