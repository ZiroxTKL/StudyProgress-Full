package com.example.studyprogress.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name="refresh_sessions", indexes=@Index(name="idx_refresh_hash",columnList="tokenHash",unique=true))
public class RefreshSession {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,unique=true,length=64) private String tokenHash;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(nullable=false) private Usuario usuario;
    @Column(nullable=false) private Instant expiresAt;
    public RefreshSession() {}
    public RefreshSession(String hash, Usuario user, Instant expiry) { tokenHash=hash;usuario=user;expiresAt=expiry; }
    public Long getId(){return id;}
    public Usuario getUsuario(){return usuario;}
    public Instant getExpiresAt(){return expiresAt;}
}
