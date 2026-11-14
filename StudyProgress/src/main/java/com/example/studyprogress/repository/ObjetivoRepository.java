package com.example.studyprogress.repository;

import com.example.studyprogress.model.Objetivo;
import com.example.studyprogress.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

import java.util.List;

public interface ObjetivoRepository extends JpaRepository<Objetivo, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select activity from Objetivo activity where activity.id = :id")
    Optional<Objetivo> findByIdForUpdate(@Param("id") Long id);

    List<Objetivo> findByUsuario(Usuario usuario);

    List<Objetivo> findByUsuarioAndCompletado(
            Usuario usuario,
            boolean completado
    );
}
