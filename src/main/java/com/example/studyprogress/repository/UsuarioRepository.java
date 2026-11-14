package com.example.studyprogress.repository;

import com.example.studyprogress.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    @Modifying(flushAutomatically = true)
    @Query("update Usuario u set u.puntos = u.puntos + :puntos where u.id = :id")
    void incrementarPuntos(@Param("id") Long id, @Param("puntos") int puntos);
}
