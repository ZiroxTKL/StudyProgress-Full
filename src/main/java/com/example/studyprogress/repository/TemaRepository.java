package com.example.studyprogress.repository;

import com.example.studyprogress.model.Curso;
import com.example.studyprogress.model.Tema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

import java.util.List;

public interface TemaRepository extends JpaRepository<Tema, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select activity from Tema activity where activity.id = :id")
    Optional<Tema> findByIdForUpdate(@Param("id") Long id);

    List<Tema> findByCurso(Curso curso);
}
